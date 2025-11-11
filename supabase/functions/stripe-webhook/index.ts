import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { timingSafeEqual } from 'https://deno.land/std@0.224.0/crypto/timing_safe_equal.ts';

import { corsHeaders } from '../_shared/responses.ts';
import { handleError } from '../_shared/error-handler.ts';
import { createLogger, getRequestCorrelationId } from '../_shared/logger.ts';
import { fetchWithRetry } from '../_shared/request-helper.ts';

const FUNCTION_NAME = 'stripe-webhook';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const STRIPE_API_VERSION = Deno.env.get('STRIPE_API_VERSION') ?? '2022-11-15';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const WEBHOOK_TOLERANCE_SECONDS = Number(Deno.env.get('STRIPE_WEBHOOK_TOLERANCE') ?? '300');

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn(`[${FUNCTION_NAME}] STRIPE_WEBHOOK_SECRET is not configured`);
}

if (!STRIPE_SECRET_KEY) {
  console.warn(`[${FUNCTION_NAME}] STRIPE_SECRET_KEY is not configured`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = getRequestCorrelationId(req);
  const logger = createLogger(FUNCTION_NAME, correlationId);

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      logger.warn('Missing Stripe signature header or webhook secret');
      return new Response('Signature verification failed', { status: 400, headers: corsHeaders });
    }

    const rawBody = new Uint8Array(await req.arrayBuffer());
    if (!(await verifyStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET))) {
      logger.warn('Stripe signature verification failed');
      return new Response('Signature verification failed', { status: 400, headers: corsHeaders });
    }

    const bodyText = new TextDecoder().decode(rawBody);
    const event = JSON.parse(bodyText);

    logger.info('Received Stripe event', { eventId: event.id, eventType: event.type });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const alreadyProcessed = await hasProcessedEvent(supabase, event.id);
    if (alreadyProcessed) {
      logger.info('Event already processed, acknowledging', { eventId: event.id });
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
      });
    }

    await routeStripeEvent(event, supabase, logger, correlationId);

    await recordStripeEvent(supabase, event, bodyText);

    return new Response(JSON.stringify({ ok: true, eventId: event.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
    });
  } catch (error) {
    logger.error('Stripe webhook processing failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return handleError(FUNCTION_NAME, error, { correlationId });
  }
});

async function routeStripeEvent(
  event: any,
  supabase: any,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data?.object;
      if (!subscription) {
        logger.warn('Subscription event missing data object', { eventId: event.id });
        return;
      }
      await triggerProvisioningFromSubscription(subscription, supabase, logger, correlationId);
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data?.object;
      if (!invoice?.subscription) {
        logger.warn('Invoice event missing subscription reference', { eventId: event.id });
        return;
      }
      const subscription = await fetchStripeSubscription(invoice.subscription, logger, correlationId);
      if (subscription) {
        await triggerProvisioningFromSubscription(subscription, supabase, logger, correlationId);
      }
      break;
    }
    default:
      logger.info('Unhandled Stripe event type', { eventType: event.type });
  }
}

async function triggerProvisioningFromSubscription(
  subscription: any,
  _supabase: any,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  const status = subscription.status;
  if (!['active', 'trialing', 'past_due'].includes(status)) {
    logger.info('Skipping provisioning for non-active subscription', { status, subscriptionId: subscription.id });
    return;
  }

  const stripeCustomerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  if (!stripeCustomerId) {
    logger.warn('Subscription missing customer identifier', { subscriptionId: subscription.id });
    return;
  }

  const customer = await fetchStripeCustomer(stripeCustomerId, logger, correlationId);
  const metadata = mergeMetadata(subscription?.metadata, customer?.metadata);
  const planTier = resolvePlanTier(subscription, metadata);

  const trainerId = metadata.trainer_id || metadata.trainerId || null;
  const dfyRequestId = metadata.dfy_request_id || metadata.dfyRequestId || null;

  const trainerEmail = metadata.trainer_email || metadata.trainerEmail || customer?.email || subscription?.customer_email;
  const trainerFirstName = metadata.trainer_first_name || metadata.trainerFirstName || extractFirstName(customer?.name) || 'Trainer';
  const trainerLastName = metadata.trainer_last_name || metadata.trainerLastName || extractLastName(customer?.name) || 'Owner';

  if (!trainerEmail) {
    logger.warn('Unable to determine trainer email from metadata', { subscriptionId: subscription.id });
    return;
  }

  const businessAddress = buildBusinessAddress(metadata);

  const payload = {
    dfyRequestId: dfyRequestId ?? undefined,
    trainerId: trainerId ?? undefined,
    planTier,
    trainer: {
      id: trainerId ?? undefined,
      email: trainerEmail,
      firstName: trainerFirstName,
      lastName: trainerLastName,
      phone: metadata.trainer_phone || metadata.trainerPhone || customer?.phone || undefined,
      timezone: metadata.trainer_timezone || metadata.business_timezone || undefined,
      stripeCustomerId,
    },
    business: {
      brandName: metadata.business_name || metadata.brand_name || customer?.name || `${trainerFirstName}'s Fitness`,
      legalName: metadata.business_legal_name || metadata.business_name || undefined,
      supportEmail: metadata.support_email || metadata.business_support_email || customer?.email || undefined,
      supportPhone: metadata.support_phone || metadata.business_support_phone || customer?.phone || undefined,
      websiteUrl: metadata.business_website || metadata.website_url || undefined,
      timezone: metadata.business_timezone || undefined,
      address: businessAddress,
    },
    links: {
      discoveryCall: metadata.discovery_call_url || metadata.booking_discovery_call_url || undefined,
      trainingSession: metadata.training_session_url || metadata.booking_training_session_url || undefined,
      termsUrl: metadata.terms_url || undefined,
      privacyUrl: metadata.privacy_url || undefined,
    },
    prefs: {
      defaultChannel: resolveDefaultChannel(metadata.default_channel || metadata.defaultChannel),
      quietHours: resolveQuietHoursFromMetadata(metadata),
    },
  };

  await callProvisionTrainer(payload, logger, correlationId);
}

async function callProvisionTrainer(payload: Record<string, unknown>, logger: ReturnType<typeof createLogger>, correlationId: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuration missing for internal call');
  }

  const response = await fetchWithRetry(
    `${SUPABASE_URL}/functions/v1/ghl-provisioning`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'x-correlation-id': correlationId,
      },
      body: JSON.stringify(payload),
    },
    { logger, correlationId, functionName: `${FUNCTION_NAME}::provision-trainer` },
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Provisioning function responded with error', { status: response.status, errorText });
    throw new Error('Provisioning call failed');
  }

  const json = await response.json();
  logger.info('Provisioning function completed', { locationId: json.locationId, userId: json.userId });
  return json;
}

async function fetchStripeCustomer(customerId: string, logger: ReturnType<typeof createLogger>, correlationId: string) {
  if (!STRIPE_SECRET_KEY) return null;

  const response = await stripeRequest(`/customers/${customerId}`, { method: 'GET' }, logger, correlationId);
  if (!response.ok) {
    const errorText = await response.text();
    logger.warn('Failed to fetch Stripe customer', { customerId, status: response.status, errorText });
    return null;
  }
  return await response.json();
}

async function fetchStripeSubscription(subscriptionId: string, logger: ReturnType<typeof createLogger>, correlationId: string) {
  if (!STRIPE_SECRET_KEY) return null;

  const response = await stripeRequest(`/subscriptions/${subscriptionId}`, { method: 'GET' }, logger, correlationId);
  if (!response.ok) {
    const errorText = await response.text();
    logger.warn('Failed to fetch Stripe subscription', { subscriptionId, status: response.status, errorText });
    return null;
  }
  return await response.json();
}

async function stripeRequest(path: string, init: RequestInit, logger: ReturnType<typeof createLogger>, correlationId: string) {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  const url = `${STRIPE_API_BASE}${path}`;
  const headers = new Headers(init.headers ?? {});
  headers.set('Authorization', `Bearer ${STRIPE_SECRET_KEY}`);
  headers.set('Stripe-Version', STRIPE_API_VERSION);
  if ((init.method ?? 'GET').toUpperCase() !== 'GET') {
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    headers.set('Idempotency-Key', `trainu-${correlationId}-${path}`);
  }

  return fetchWithRetry(url, { ...init, headers }, { logger, correlationId, functionName: `${FUNCTION_NAME}::stripe` });
}

function resolvePlanTier(subscription: any, metadata: Record<string, string>): string {
  const priceMetadata = subscription.items?.data?.[0]?.price?.metadata;
  return (
    metadata.plan_tier ||
    metadata.planTier ||
    priceMetadata?.plan_tier ||
    priceMetadata?.planTier ||
    subscription.plan?.metadata?.plan_tier ||
    subscription.plan?.metadata?.planTier ||
    'starter'
  );
}

function resolveDefaultChannel(value?: string): 'sms' | 'email' | 'both' | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'sms' || normalized === 'email' || normalized === 'both') {
    return normalized as 'sms' | 'email' | 'both';
  }
  return undefined;
}

function resolveQuietHoursFromMetadata(metadata: Record<string, string>) {
  const enabledRaw = metadata.quiet_hours_enabled || metadata.quietHoursEnabled;
  const start = metadata.quiet_hours_start || metadata.quietHoursStart;
  const end = metadata.quiet_hours_end || metadata.quietHoursEnd;
  const enabled = typeof enabledRaw === 'string' ? enabledRaw === 'true' || enabledRaw === '1' : undefined;
  return {
    enabled: enabled ?? true,
    start: start || undefined,
    end: end || undefined,
  };
}

function buildBusinessAddress(metadata: Record<string, string>) {
  const line1 = metadata.business_address_line1 || metadata.address_line1;
  const city = metadata.business_address_city || metadata.address_city;
  const state = metadata.business_address_state || metadata.address_state;
  const postalCode = metadata.business_address_postal_code || metadata.address_postal_code;

  if (line1 && city && state && postalCode) {
    return {
      line1,
      line2: metadata.business_address_line2 || metadata.address_line2 || undefined,
      city,
      state,
      postalCode,
      country: metadata.business_address_country || metadata.address_country || 'US',
    };
  }
  return undefined;
}

function mergeMetadata(...sources: Array<Record<string, unknown> | null | undefined>) {
  const result: Record<string, string> = {};
  for (const source of sources) {
    if (!source) continue;
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'string' && value.length > 0) {
        result[key] = value;
      }
    }
  }
  return result;
}

function extractFirstName(fullName?: string | null): string | undefined {
  if (!fullName) return undefined;
  return fullName.split(' ')[0];
}

function extractLastName(fullName?: string | null): string | undefined {
  if (!fullName) return undefined;
  const parts = fullName.split(' ');
  return parts.slice(1).join(' ') || undefined;
}

async function hasProcessedEvent(supabase: any, eventId: string) {
  const { data } = await supabase
    .from('stripe_events')
    .select('event_id')
    .eq('event_id', eventId)
    .maybeSingle();
  return Boolean(data);
}

async function recordStripeEvent(supabase: any, event: any, bodyText: string) {
  await supabase.from('stripe_events').insert({
    event_id: event.id,
    type: event.type,
    payload: JSON.parse(bodyText),
  } as any);
}

async function verifyStripeSignature(payload: Uint8Array, signature: string, secret: string): Promise<boolean> {
  const elements = signature.split(',');
  const timestampPart = elements.find((entry) => entry.startsWith('t='));
  const signaturePart = elements.find((entry) => entry.startsWith('v1='));

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = Number(timestampPart.split('=')[1]);
  const expectedSignature = signaturePart.split('=')[1];

  if (!timestamp || !expectedSignature) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (WEBHOOK_TOLERANCE_SECONDS > 0 && Math.abs(now - timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    return false;
  }

  const signedPayload = `${timestamp}.${new TextDecoder().decode(payload)}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  try {
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const expectedBytes = hexToBytes(expectedSignature);
    const actualBytes = new Uint8Array(signatureBuffer);
    if (expectedBytes.length !== actualBytes.length) {
      return false;
    }
    return timingSafeEqual(actualBytes, expectedBytes);
  } catch {
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
