import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/responses.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GHL_WEBHOOK_SECRET = Deno.env.get('GHL_WEBHOOK_SECRET');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get('x-ghl-signature');
    if (GHL_WEBHOOK_SECRET && signature !== GHL_WEBHOOK_SECRET) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.json();
    const event = payload.type || payload.event;
    const data = payload.data || payload;

    console.log(`[ghl-webhook] Received event: ${event}`, {
      timestamp: new Date().toISOString(),
      locationId: data.locationId,
    });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Extract location ID to find trainer
    const locationId = data.locationId || data.location_id || data.contact?.locationId;
    if (!locationId) {
      console.warn('[ghl-webhook] No locationId found in payload');
      return new Response(
        JSON.stringify({ success: true, message: 'No locationId to process' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find trainer by location_id
    const { data: ghlConfig } = await supabase
      .from('ghl_config')
      .select('trainer_id, location_id')
      .eq('location_id', locationId)
      .single();

    if (!ghlConfig) {
      console.warn(`[ghl-webhook] No trainer found for locationId: ${locationId}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Location not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        await handleInboundMessage(supabase, trainerId, data);
        break;

      case 'ContactCreate':
      case 'ContactUpdate':
      case 'contact.created':
      case 'contact.updated':
        await handleContactSync(supabase, trainerId, data);
        break;

      case 'AppointmentCreate':
      case 'AppointmentUpdate':
      case 'AppointmentCancel':
      case 'appointment.created':
      case 'appointment.updated':
      case 'appointment.cancelled':
        await handleAppointmentSync(supabase, trainerId, data);
        break;

      case 'MessageSent':
      case 'MessageDelivered':
      case 'MessageRead':
      case 'message.sent':
      case 'message.delivered':
      case 'message.read':
        await handleMessageStatus(supabase, trainerId, data);
        break;

      default:
        console.log(`[ghl-webhook] Unhandled event type: ${event}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[ghl-webhook] Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleInboundMessage(supabase: any, trainerId: string, data: any) {
  const message = data.message || data;
  const contactId = message.contactId || message.contact_id || data.contactId;
  
  if (!contactId) {
    console.warn('[ghl-webhook] No contactId in inbound message');
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
    console.warn(`[ghl-webhook] Contact not found: ${contactId}`);
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

  console.log(`[ghl-webhook] Stored inbound ${channel} from ${clientName}`);
}

async function handleContactSync(supabase: any, trainerId: string, data: any) {
  const contact = data.contact || data;
  
  if (!contact?.id) {
    console.warn('[ghl-webhook] No contact ID in sync payload');
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

  console.log(`[ghl-webhook] Synced contact: ${contact.id}`);
}

async function handleAppointmentSync(supabase: any, trainerId: string, data: any) {
  const appointment = data.appointment || data;
  
  if (!appointment?.id || !appointment?.contactId) {
    console.warn('[ghl-webhook] Missing appointment or contact ID');
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
    console.warn(`[ghl-webhook] Contact not found for appointment: ${appointment.contactId}`);
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

  console.log(`[ghl-webhook] Synced appointment: ${appointment.id} (${status})`);
}

async function handleMessageStatus(supabase: any, trainerId: string, data: any) {
  const messageId = data.messageId || data.message_id || data.id;
  
  if (!messageId) {
    console.warn('[ghl-webhook] No messageId in status update');
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

  console.log(`[ghl-webhook] Updated message status: ${messageId} -> ${updates.status}`);
}
