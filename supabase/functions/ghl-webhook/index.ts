import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { timingSafeEqual } from 'https://deno.land/std@0.224.0/crypto/timing_safe_equal.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/responses.ts';
import { createLogger, getRequestCorrelationId } from '../_shared/logger.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GHL_WEBHOOK_SECRET = Deno.env.get('GHL_WEBHOOK_SECRET');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const correlationId = getRequestCorrelationId(req);
    const logger = createLogger('ghl-webhook', correlationId);

    // Verify webhook signature
    const signature = req.headers.get('x-ghl-signature');
    if (GHL_WEBHOOK_SECRET && (!signature || !secureCompare(signature, GHL_WEBHOOK_SECRET))) {
      logger.warn('Invalid webhook signature', { correlationId, hasSignature: Boolean(signature) });
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'x-trainu-sync-status': 'sync_retry',
            'x-correlation-id': correlationId,
          },
        }
      );
    }

    const payload = await req.json();
    const event = payload.type || payload.event;
    const data = payload.data || payload;

    logger.info('Received event', { event, locationId: data.locationId });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Extract location ID to find trainer
    const locationId = data.locationId || data.location_id || data.contact?.locationId;
    if (!locationId) {
      logger.warn('No locationId found in payload', { event });
      return new Response(
        JSON.stringify({ success: true, message: 'No locationId to process' }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'x-trainu-sync-status': 'sync_ok',
            'x-correlation-id': correlationId,
          },
        }
      );
    }

    // Find trainer by location_id
    const { data: ghlConfig } = await supabase
      .from('ghl_config')
      .select('trainer_id, location_id')
      .eq('location_id', locationId)
      .single();

    if (!ghlConfig) {
      logger.warn('No trainer configured for location', { locationId });
      return new Response(
        JSON.stringify({ success: true, message: 'Location not configured' }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'x-trainu-sync-status': 'sync_ok',
            'x-correlation-id': correlationId,
          },
        }
      );
    }

    const trainerId = ghlConfig.trainer_id;

    // Handle different event types
    switch (event) {
      case 'InboundMessage':
      case 'MessageReceived':
      case 'message.inbound':
      case 'message.received':
      case 'sms.received':
      case 'email.received':
        await handleInboundMessage(supabase, trainerId, data, logger);
        break;

      case 'ContactCreate':
      case 'ContactUpdate':
      case 'contact.created':
      case 'contact.updated':
        await handleContactSync(supabase, trainerId, data, logger);
        break;

      case 'AppointmentCreate':
      case 'AppointmentUpdate':
      case 'AppointmentCancel':
      case 'appointment.created':
      case 'appointment.updated':
      case 'appointment.cancelled':
        await handleAppointmentSync(supabase, trainerId, data, logger);
        break;

      case 'MessageSent':
      case 'MessageDelivered':
      case 'MessageRead':
      case 'message.sent':
      case 'message.delivered':
      case 'message.read':
        await handleMessageStatus(supabase, trainerId, data, logger);
        break;

      default:
        logger.debug('Unhandled GHL event', { event });
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'x-trainu-sync-status': 'sync_ok',
          'x-correlation-id': correlationId,
        },
      }
    );
  } catch (error) {
    const correlationId = getRequestCorrelationId(req);
    const logger = createLogger('ghl-webhook', correlationId);
    logger.error('Error processing webhook', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'x-trainu-sync-status': 'sync_retry',
          'x-correlation-id': correlationId,
        },
      }
    );
  }
});

async function handleInboundMessage(
  supabase: any,
  trainerId: string,
  data: any,
  logger: ReturnType<typeof createLogger>,
) {
  const message = data.message || data;
  const contactId = message.contactId || message.contact_id || data.contactId;

  if (!contactId) {
    logger.warn('No contactId in inbound message', { trainerId });
    return;
  }

  // Find contact in our database
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .eq('ghl_contact_id', String(contactId))
    .eq('trainer_id', trainerId)
    .single();

  if (!contact) {
    logger.warn('Contact not found during inbound message', { contactId });
    return;
  }

  // Determine channel
  let channel = 'sms';
  const eventType = message.type || message.channel || data.type;
  if (eventType && typeof eventType === 'string') {
    const type = eventType.toLowerCase();
    if (type.includes('email')) channel = 'email';
    else if (type.includes('sms')) channel = 'sms';
    else if (type.includes('dm')) channel = 'dm';
  }

  const clientName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Client';

  // Store message
  await supabase.from('messages').insert({
    trainer_id: trainerId,
    contact_id: contact.id,
    direction: 'inbound',
    content: message.body || message.content || message.text || '',
    channel,
    status: 'received',
    ghl_message_id: message.id || message.messageId,
    ghl_status: 'delivered',
    ghl_delivered_at: message.createdAt || message.created_at || new Date().toISOString(),
  });

  // Update activity feed
  await supabase.from('activity_feed').insert({
    trainer_id: trainerId,
    client_id: contact.id,
    client_name: clientName,
    action: 'received',
    status: 'success',
    why: `Received ${channel.toUpperCase()} from client`,
    message_preview: (message.body || message.content || '').substring(0, 100),
    ghl_message_id: message.id || message.messageId,
    ghl_channel: channel,
    ghl_status: 'delivered',
    ghl_delivered_at: message.createdAt || message.created_at || new Date().toISOString(),
  });

  logger.info('Stored inbound message', { channel, clientName, trainerId });
}

async function handleContactSync(
  supabase: any,
  trainerId: string,
  data: any,
  logger: ReturnType<typeof createLogger>,
) {
  const contact = data.contact || data;

  if (!contact?.id) {
    logger.warn('No contact ID in sync payload', { trainerId });
    return;
  }

  await supabase.from('contacts').upsert({
    trainer_id: trainerId,
    ghl_contact_id: String(contact.id),
    first_name: contact.firstName || contact.first_name || null,
    last_name: contact.lastName || contact.last_name || null,
    email: contact.email || null,
    phone: contact.phone || null,
    tags: Array.isArray(contact.tags) ? contact.tags : null,
    sync_source: 'ghl',
    last_synced_at: new Date().toISOString(),
  }, { onConflict: 'ghl_contact_id' });

  logger.info('Synced contact', { contactId: contact.id, trainerId });
}

async function handleAppointmentSync(
  supabase: any,
  trainerId: string,
  data: any,
  logger: ReturnType<typeof createLogger>,
) {
  const appointment = data.appointment || data;

  if (!appointment?.id || !appointment?.contactId) {
    logger.warn('Appointment sync missing identifiers', { appointmentId: appointment?.id, trainerId });
    return;
  }

  // Find contact
  const { data: contact } = await supabase
    .from('contacts')
    .select('id')
    .eq('ghl_contact_id', String(appointment.contactId))
    .eq('trainer_id', trainerId)
    .single();

  if (!contact) {
    logger.warn('Contact not found for appointment sync', {
      appointmentId: appointment.id,
      contactId: appointment.contactId,
    });
    return;
  }

  // Determine status
  let status = 'scheduled';
  if (appointment.status) {
    status = String(appointment.status).toLowerCase();
  } else if (data.type === 'AppointmentCancel' || data.event === 'appointment.cancelled') {
    status = 'cancelled';
  }

  await supabase.from('bookings').upsert({
    trainer_id: trainerId,
    contact_id: contact.id,
    ghl_appointment_id: String(appointment.id),
    scheduled_at: new Date(appointment.startTime || appointment.start_time || Date.now()).toISOString(),
    status,
    session_type: appointment.title || appointment.name || 'Session',
    notes: appointment.notes || null,
    sync_source: 'ghl',
    last_synced_at: new Date().toISOString(),
  }, { onConflict: 'ghl_appointment_id' });

  logger.info('Synced appointment', { appointmentId: appointment.id, status, trainerId });
}

async function handleMessageStatus(
  supabase: any,
  trainerId: string,
  data: any,
  logger: ReturnType<typeof createLogger>,
) {
  const messageId = data.messageId || data.message_id || data.id;

  if (!messageId) {
    logger.warn('No messageId in status update', { trainerId });
    return;
  }

  const event = data.type || data.event;
  let updates: any = { ghl_message_id: String(messageId) };

  if (event.toLowerCase().includes('sent')) {
    updates.status = 'sent';
    updates.ghl_status = 'sent';
  } else if (event.toLowerCase().includes('delivered')) {
    updates.status = 'delivered';
    updates.ghl_delivered_at = data.deliveredAt || data.delivered_at || new Date().toISOString();
  } else if (event.toLowerCase().includes('read')) {
    updates.status = 'read';
    updates.ghl_read_at = data.readAt || data.read_at || new Date().toISOString();
  }

  await supabase
    .from('messages')
    .update(updates)
    .eq('trainer_id', trainerId)
    .eq('ghl_message_id', String(messageId));

  logger.info('Updated message status', { messageId, status: updates.status, trainerId });
}

function secureCompare(value: string, secret: string) {
  const encoder = new TextEncoder();
  const a = encoder.encode(value);
  const b = encoder.encode(secret);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
