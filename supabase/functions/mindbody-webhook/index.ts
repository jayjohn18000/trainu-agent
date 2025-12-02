/**
 * Mindbody Webhook Handler
 * Receives real-time webhooks from Mindbody for attendance, membership, and payment updates
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/responses.ts";
import { createLogger } from "../_shared/logger.ts";
import { getServiceRoleClient } from "../_shared/integration-adapter.ts";
import { logIntegrationActivity } from "../_shared/integration-adapter.ts";

const MINDBODY_WEBHOOK_SECRET = Deno.env.get('MINDBODY_WEBHOOK_SECRET');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger('mindbody-webhook');

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json();
    const signature = req.headers.get('x-signature') || req.headers.get('x-mindbody-signature');

    // Verify webhook signature if secret is configured
    if (MINDBODY_WEBHOOK_SECRET && signature) {
      // Note: Mindbody webhook signature verification implementation depends on their spec
      // This is a placeholder - implement actual signature verification based on Mindbody docs
      const isValid = verifyWebhookSignature(body, signature, MINDBODY_WEBHOOK_SECRET);
      if (!isValid) {
        logger.warn('Invalid webhook signature');
        return errorResponse('Invalid signature', 401);
      }
    }

    const eventType = body.EventId || body.event_type || body.type;
    const eventData = body.EventData || body.data || body;

    logger.info('Webhook received', { eventType, eventData });

    const supabase = getServiceRoleClient();

    // Route to appropriate handler based on event type
    switch (eventType) {
      case 'appointment.completed':
      case 'appointment.checkedIn':
      case 'AppointmentCompleted':
      case 'AppointmentCheckedIn':
        await handleAppointmentCompleted(supabase, eventData, logger);
        break;

      case 'membership.created':
      case 'membership.updated':
      case 'MembershipCreated':
      case 'MembershipUpdated':
        await handleMembershipUpdate(supabase, eventData, logger);
        break;

      case 'payment.processed':
      case 'payment.failed':
      case 'PaymentProcessed':
      case 'PaymentFailed':
        await handlePaymentUpdate(supabase, eventData, logger);
        break;

      case 'client.created':
      case 'client.updated':
      case 'ClientCreated':
      case 'ClientUpdated':
        await handleClientUpdate(supabase, eventData, logger);
        break;

      default:
        logger.info('Unhandled webhook event type', { eventType });
        // Still return 200 to acknowledge receipt
    }

    return jsonResponse({ received: true });
  } catch (error) {
    logger.error('Webhook processing error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse('Webhook processing failed', 500);
  }
});

// Handle appointment completed/checked in events
async function handleAppointmentCompleted(
  supabase: any,
  eventData: any,
  logger: any
) {
  const clientId = eventData.ClientId || eventData.clientId || eventData.Client?.Id;
  const appointmentDate = eventData.StartDateTime || eventData.startDateTime || eventData.Date;

  if (!clientId) {
    logger.warn('Appointment event missing clientId', { eventData });
    return;
  }

  // Find trainer_id from contact_sources
  const { data: contactSource } = await supabase
    .from('contact_sources')
    .select('contact_id, contacts!inner(trainer_id)')
    .eq('source', 'mindbody')
    .eq('external_id', clientId)
    .single();

  if (!contactSource) {
    logger.warn('Contact source not found for client', { clientId });
    return;
  }

  const trainerId = contactSource.contacts.trainer_id;
  const contactId = contactSource.contact_id;

  // Update last_activity
  const lastActivity = appointmentDate ? new Date(appointmentDate) : new Date();

  await supabase
    .from('contacts')
    .update({
      last_activity: lastActivity.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId);

  // Log activity
  await logIntegrationActivity(
    supabase,
    trainerId,
    'mindbody',
    'webhook_appointment_completed',
    `Appointment completed for client ${clientId}`,
    { clientId, appointmentDate }
  );

  logger.info('Appointment completed processed', { clientId, contactId });
}

// Handle membership created/updated events
async function handleMembershipUpdate(
  supabase: any,
  eventData: any,
  logger: any
) {
  const clientId = eventData.ClientId || eventData.clientId || eventData.Client?.Id;
  const status = eventData.Status || eventData.status;
  const membershipName = eventData.Name || eventData.MembershipName || eventData.membershipName;

  if (!clientId) {
    logger.warn('Membership event missing clientId', { eventData });
    return;
  }

  // Find trainer_id from contact_sources
  const { data: contactSource } = await supabase
    .from('contact_sources')
    .select('contact_id, contacts!inner(trainer_id)')
    .eq('source', 'mindbody')
    .eq('external_id', clientId)
    .single();

  if (!contactSource) {
    logger.warn('Contact source not found for client', { clientId });
    return;
  }

  const trainerId = contactSource.contacts.trainer_id;
  const contactId = contactSource.contact_id;

  // Update membership status
  await supabase
    .from('contacts')
    .update({
      membership_status: status?.toLowerCase() || 'unknown',
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId);

  // Update contact_sources with membership info
  await supabase
    .from('contact_sources')
    .update({
      source_data: {
        ...contactSource.source_data,
        membershipName,
        membershipStatus: status,
      },
      synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('contact_id', contactId)
    .eq('source', 'mindbody');

  // Log activity
  await logIntegrationActivity(
    supabase,
    trainerId,
    'mindbody',
    'webhook_membership_updated',
    `Membership updated for client ${clientId}: ${status}`,
    { clientId, status, membershipName }
  );

  logger.info('Membership update processed', { clientId, contactId, status });
}

// Handle payment processed/failed events
async function handlePaymentUpdate(
  supabase: any,
  eventData: any,
  logger: any
) {
  const clientId = eventData.ClientId || eventData.clientId || eventData.Client?.Id;
  const paymentStatus = eventData.Status || eventData.status || eventData.PaymentStatus;
  const amount = eventData.Amount || eventData.amount;
  const paymentDate = eventData.PaymentDate || eventData.paymentDate || eventData.Date;

  if (!clientId) {
    logger.warn('Payment event missing clientId', { eventData });
    return;
  }

  // Find trainer_id from contact_sources
  const { data: contactSource } = await supabase
    .from('contact_sources')
    .select('contact_id, contacts!inner(trainer_id)')
    .eq('source', 'mindbody')
    .eq('external_id', clientId)
    .single();

  if (!contactSource) {
    logger.warn('Contact source not found for client', { clientId });
    return;
  }

  const trainerId = contactSource.contacts.trainer_id;
  const contactId = contactSource.contact_id;

  // Determine payment status
  let paymentStatusValue: 'current' | 'late' | 'overdue' = 'current';
  if (paymentStatus === 'Failed' || paymentStatus === 'failed') {
    paymentStatusValue = 'overdue';
  } else if (paymentStatus === 'Pending' || paymentStatus === 'pending') {
    paymentStatusValue = 'late';
  }

  // Update payment status
  await supabase
    .from('contacts')
    .update({
      payment_status: paymentStatusValue,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId);

  // Log activity
  await logIntegrationActivity(
    supabase,
    trainerId,
    'mindbody',
    'webhook_payment_updated',
    `Payment ${paymentStatus} for client ${clientId}`,
    { clientId, paymentStatus, amount, paymentDate }
  );

  logger.info('Payment update processed', { clientId, contactId, paymentStatus });
}

// Handle client created/updated events
async function handleClientUpdate(
  supabase: any,
  eventData: any,
  logger: any
) {
  const clientId = eventData.Id || eventData.id || eventData.ClientId || eventData.clientId;
  const firstName = eventData.FirstName || eventData.firstName;
  const lastName = eventData.LastName || eventData.lastName;
  const email = eventData.Email || eventData.email;
  const phone = eventData.MobilePhone || eventData.mobilePhone || eventData.HomePhone || eventData.homePhone;

  if (!clientId) {
    logger.warn('Client event missing clientId', { eventData });
    return;
  }

  // Find existing contact_source to get trainer_id
  const { data: contactSource } = await supabase
    .from('contact_sources')
    .select('contact_id, contacts!inner(trainer_id)')
    .eq('source', 'mindbody')
    .eq('external_id', clientId)
    .maybeSingle();

  if (!contactSource) {
    logger.info('New client from webhook - will be synced on next sync', { clientId });
    return;
  }

  const trainerId = contactSource.contacts.trainer_id;
  const contactId = contactSource.contact_id;

  // Update contact if fields provided
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (firstName) updateData.first_name = firstName;
  if (lastName) updateData.last_name = lastName;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;

  await supabase
    .from('contacts')
    .update(updateData)
    .eq('id', contactId);

  // Log activity
  await logIntegrationActivity(
    supabase,
    trainerId,
    'mindbody',
    'webhook_client_updated',
    `Client ${clientId} updated via webhook`,
    { clientId, fields: Object.keys(updateData) }
  );

  logger.info('Client update processed', { clientId, contactId });
}

// Verify webhook signature (placeholder - implement based on Mindbody spec)
function verifyWebhookSignature(
  body: any,
  signature: string,
  secret: string
): boolean {
  // TODO: Implement actual signature verification based on Mindbody webhook documentation
  // This is a placeholder that always returns true for now
  // In production, verify HMAC signature or similar based on Mindbody's spec
  return true;
}

