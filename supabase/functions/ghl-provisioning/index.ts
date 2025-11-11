import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://esm.sh/zod@3.23.8';

import { corsHeaders } from '../_shared/responses.ts';
import { handleError, handleValidationError } from '../_shared/error-handler.ts';
import { createLogger, getRequestCorrelationId } from '../_shared/logger.ts';
import { fetchWithRetry } from '../_shared/request-helper.ts';

const FUNCTION_NAME = 'ghl-provisioning';
const GHL_API_BASE = Deno.env.get('GHL_API_BASE') ?? 'https://rest.gohighlevel.com';
const GHL_API_VERSION = Deno.env.get('GHL_API_VERSION') ?? '2021-07-28';
const GHL_ACCESS_TOKEN = Deno.env.get('GHL_ACCESS_TOKEN');

if (!GHL_ACCESS_TOKEN) {
  console.warn(`[${FUNCTION_NAME}] GHL_ACCESS_TOKEN environment variable is not configured`);
}

const ProvisioningPayloadSchema = z.object({
  dfyRequestId: z.string().uuid().optional(),
  trainerId: z.string().uuid().optional(),
  planTier: z.string(),
  trainer: z.object({
    id: z.string().uuid().optional(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
    timezone: z.string().optional(),
    stripeCustomerId: z.string().optional(),
  }),
  business: z.object({
    brandName: z.string(),
    legalName: z.string().optional(),
    supportEmail: z.string().email().optional(),
    supportPhone: z.string().optional(),
    websiteUrl: z.string().url().optional(),
    timezone: z.string().optional(),
    address: z
      .object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string().default('US'),
      })
      .optional(),
  }),
  links: z
    .object({
      discoveryCall: z.string().url().optional(),
      trainingSession: z.string().url().optional(),
      termsUrl: z.string().url().optional(),
      privacyUrl: z.string().url().optional(),
    })
    .optional(),
  prefs: z
    .object({
      defaultChannel: z.enum(['sms', 'email', 'both']).optional(),
      quietHours: z
        .object({
          enabled: z.boolean().optional(),
          start: z.string().optional(),
          end: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

type ProvisioningPayload = z.infer<typeof ProvisioningPayloadSchema>;

type GHLConfigRecord = {
  trainer_id: string;
  location_id: string | null;
  provisioning_status?: string | null;
  status?: string | null;
  primary_user_id?: string | null;
  default_channel?: string | null;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
};

const TAGS_TO_SEED = ['plan:entry', 'plan:core', 'plan:elite', 'at_risk', 'no_show', 'paused', 'high_engagement', 'nurture_active'];

const CONTACT_CUSTOM_FIELDS = [
  { name: 'Primary Goal', key: 'primary_goal', fieldType: 'text' },
  { name: 'Injuries or Notes', key: 'injuries_notes', fieldType: 'textarea' },
  { name: 'Preferred Channel', key: 'preferred_channel', fieldType: 'select', options: ['SMS', 'Email', 'DM'] },
  { name: 'Client Timezone', key: 'client_timezone', fieldType: 'text' },
  { name: 'Quiet Hours Enabled', key: 'quiet_hours_enabled', fieldType: 'checkbox' },
  { name: 'Quiet Hours Start', key: 'quiet_hours_start', fieldType: 'text' },
  { name: 'Quiet Hours End', key: 'quiet_hours_end', fieldType: 'text' },
];

const CALENDAR_BLUEPRINTS = [
  {
    name: 'Discovery Call (15m)',
    slug: 'discovery-call-15m',
    description: '15 minute intro call for new prospects',
    duration: 15,
    slotInterval: 15,
    minNotice: 12,
    bufferBefore: 15,
    bufferAfter: 15,
    timezoneMode: 'user',
  },
  {
    name: 'Training Session (60m)',
    slug: 'training-session-60m',
    description: 'Standard 60 minute personal training session',
    duration: 60,
    slotInterval: 60,
    minNotice: 4,
    bufferBefore: 15,
    bufferAfter: 15,
    timezoneMode: 'location',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = getRequestCorrelationId(req);
  const logger = createLogger(FUNCTION_NAME, correlationId);
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    logger.warn('Failed to parse JSON payload', { error: error instanceof Error ? error.message : String(error) });
    return handleValidationError('Request body must be valid JSON');
  }

  const parseResult = ProvisioningPayloadSchema.safeParse(payload);
  if (!parseResult.success) {
    const issues = parseResult.error.flatten();
    logger.warn('Provisioning payload failed validation', { issues: issues.fieldErrors });
    return handleValidationError('Invalid provisioning payload', JSON.stringify(issues.fieldErrors));
  }

  const input = parseResult.data;
  const trainerId = input.trainerId || input.trainer.id;

  if (!trainerId && !input.dfyRequestId) {
    logger.warn('Missing trainer identifier in provisioning request');
    return handleValidationError('trainerId is required when dfyRequestId is not provided');
  }

  let resolvedTrainerId = trainerId ?? '';
  let dfyRequest: any = null;

  try {
    if (input.dfyRequestId) {
      const { data, error } = await supabase
        .from('dfy_requests')
        .select('*')
        .eq('id', input.dfyRequestId)
        .single();

      if (error || !data) {
        logger.error('DFY request not found', { dfyRequestId: input.dfyRequestId, error });
        return handleValidationError('dfyRequestId does not exist');
      }

      dfyRequest = data;
      resolvedTrainerId = data.trainer_id;

      await supabase
        .from('dfy_requests')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', input.dfyRequestId);
    }

    if (!resolvedTrainerId) {
      logger.error('Unable to resolve trainer ID after DFY lookup');
      return handleValidationError('Trainer ID could not be determined');
    }

    logger.info('Starting provisioning workflow', {
      trainerId: resolvedTrainerId,
      dfyRequestId: input.dfyRequestId,
      planTier: input.planTier,
    });

    const existingConfig = await getExistingGHLConfig(supabase, resolvedTrainerId);

    await markProvisioningStatus(supabase, resolvedTrainerId, 'provisioning', {
      correlationId,
      dfyRequestId: input.dfyRequestId ?? null,
      planTier: input.planTier,
    });

    const trainerProfile = await ensureTrainerProfile(supabase, resolvedTrainerId, input, dfyRequest, logger);

    const location = await ensureLocation(input, trainerProfile, existingConfig, logger, correlationId);
    const primaryUser = await ensurePrimaryUser(location.id, input, existingConfig, logger, correlationId);
    const tags = await ensureTags(location.id, logger, correlationId);
    const customFields = await ensureCustomFields(location.id, logger, correlationId);
    await ensureLocationCustomValues(location.id, input, trainerProfile, logger, correlationId);
    const calendars = await ensureCalendars(
      location.id,
      primaryUser?.id ?? existingConfig?.primary_user_id ?? null,
      logger,
      correlationId,
    );

    await persistProvisioningSuccess(
      supabase,
      resolvedTrainerId,
      {
        locationId: location.id,
        primaryUserId: primaryUser?.id ?? existingConfig?.primary_user_id ?? null,
        planTier: input.planTier,
        defaultChannel: input.prefs?.defaultChannel ?? existingConfig?.default_channel ?? 'both',
        quietHours: resolveQuietHours(input),
        dfyRequestId: input.dfyRequestId,
      },
      logger,
    );

    if (input.dfyRequestId) {
      await supabase
        .from('dfy_requests')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', input.dfyRequestId);
    }

    logger.info('Provisioning completed', {
      trainerId: resolvedTrainerId,
      locationId: location.id,
      primaryUserId: primaryUser?.id ?? existingConfig?.primary_user_id ?? null,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        locationId: location.id,
        userId: primaryUser?.id ?? existingConfig?.primary_user_id ?? null,
        seededTags: tags,
        customFields,
        calendars,
        nextStep: 'Apply snapshot and enable automations',
        correlationId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
      },
    );
  } catch (error) {
    logger.error('Provisioning failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (input.dfyRequestId) {
      await supabase
        .from('dfy_requests')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', input.dfyRequestId);
    }

    await markProvisioningStatus(supabase, resolvedTrainerId, 'failed', { correlationId });

    return handleError(FUNCTION_NAME, error, { correlationId, trainerId: resolvedTrainerId });
  }
});

async function getExistingGHLConfig(supabase: any, trainerId: string): Promise<GHLConfigRecord | null> {
  const { data } = await supabase
    .from('ghl_config')
    .select('trainer_id, location_id, provisioning_status, status, primary_user_id, default_channel, quiet_hours_start, quiet_hours_end')
    .eq('trainer_id', trainerId)
    .maybeSingle();

  return data ?? null;
}

async function markProvisioningStatus(
  supabase: any,
  trainerId: string,
  status: 'provisioning' | 'active' | 'failed',
  metadata: Record<string, unknown>,
) {
  if (!trainerId) return;

  await supabase
    .from('ghl_config')
    .upsert(
      {
        trainer_id: trainerId,
        provisioning_status: status === 'active' ? 'active' : status,
        status,
        setup_type: 'dfy',
        admin_notes: metadata?.correlationId
          ? `Provisioned via automation (${metadata.correlationId})`
          : 'Provisioned via automation',
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: 'trainer_id' },
    );
}

async function ensureTrainerProfile(
  supabase: any,
  trainerId: string,
  payload: ProvisioningPayload,
  dfyRequest: any,
  logger: ReturnType<typeof createLogger>,
) {
  const timezone = payload.trainer.timezone || payload.business.timezone || dfyRequest?.timezone || 'America/Los_Angeles';
  const inferredLocation = payload.business.address
    ? `${payload.business.address.city}, ${payload.business.address.state}`
    : dfyRequest?.business_name || null;

  const profileUpdate: Record<string, unknown> = {
    id: trainerId,
    first_name: payload.trainer.firstName,
    last_name: payload.trainer.lastName,
    email: payload.trainer.email,
    plan_tier: payload.planTier,
    stripe_customer_id: payload.trainer.stripeCustomerId ?? null,
    timezone,
  };

  if (inferredLocation) {
    profileUpdate.location = inferredLocation;
  }

  const { error } = await supabase.from('trainer_profiles').upsert(profileUpdate as any, { onConflict: 'id' });

  if (error) {
    logger.error('Failed to upsert trainer profile', { error });
    throw new Error('Failed to update trainer profile');
  }

  logger.info('Trainer profile updated', { trainerId, timezone, planTier: payload.planTier });

  return {
    ...profileUpdate,
    id: trainerId,
    timezone,
  };
}

async function ensureLocation(
  payload: ProvisioningPayload,
  trainerProfile: Record<string, unknown>,
  existingConfig: GHLConfigRecord | null,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  if (!GHL_ACCESS_TOKEN) {
    throw new Error('GHL access token is not configured');
  }

  if (existingConfig?.location_id) {
    logger.info('Reusing existing GHL location', { locationId: existingConfig.location_id });
    return { id: existingConfig.location_id };
  }

  const locationPayload = {
    name: payload.business.brandName,
    companyName: payload.business.legalName ?? payload.business.brandName,
    address: payload.business.address?.line1 ?? '123 Main St',
    address2: payload.business.address?.line2 ?? '',
    city: payload.business.address?.city ?? 'Los Angeles',
    state: payload.business.address?.state ?? 'CA',
    country: payload.business.address?.country ?? 'US',
    postalCode: payload.business.address?.postalCode ?? '90001',
    website: payload.business.websiteUrl ?? 'https://trainu.app',
    timezone: (trainerProfile.timezone as string) ?? 'America/Los_Angeles',
    email: payload.business.supportEmail ?? payload.trainer.email,
    phone: payload.business.supportPhone ?? payload.trainer.phone ?? dfyPhoneFallback(payload),
  };

  logger.info('Creating new GHL location', { correlationId });

  const response = await ghlRequest('/v1/locations', {
    method: 'POST',
    body: JSON.stringify(locationPayload),
  }, logger, correlationId);

  if (!response.ok) {
    const body = await response.text();
    logger.error('Failed to create GHL location', { status: response.status, body });
    throw new Error('Failed to create GHL location');
  }

  const json = await response.json();
  const location = json.location ?? json;

  logger.info('Created GHL location', { locationId: location.id });
  return location;
}

function dfyPhoneFallback(payload: ProvisioningPayload): string {
  return payload.trainer.phone ?? '+10000000000';
}

async function ensureTags(locationId: string, logger: ReturnType<typeof createLogger>, correlationId: string) {
  const response = await ghlRequest(`/v1/locations/${locationId}/tags`, { method: 'GET' }, logger, correlationId);
  const json = response.ok ? await response.json() : { tags: [] };
  const existing = new Set<string>((json.tags ?? json.data ?? []).map((tag: any) => String(tag.name).toLowerCase()));

  const created: string[] = [];
  for (const tag of TAGS_TO_SEED) {
    if (existing.has(tag.toLowerCase())) continue;
    const createResponse = await ghlRequest(
      `/v1/locations/${locationId}/tags`,
      {
        method: 'POST',
        body: JSON.stringify({ name: tag }),
      },
      logger,
      correlationId,
    );

    if (createResponse.ok) {
      created.push(tag);
    } else {
      const errorText = await createResponse.text();
      logger.warn('Failed to seed tag', { tag, status: createResponse.status, errorText });
    }
  }

  logger.info('Tag seeding complete', { locationId, createdCount: created.length });
  return { created, existing: [...existing] };
}

async function ensureCustomFields(locationId: string, logger: ReturnType<typeof createLogger>, correlationId: string) {
  const response = await ghlRequest(`/v1/locations/${locationId}/customFields`, { method: 'GET' }, logger, correlationId);
  const json = response.ok ? await response.json() : { customFields: [] };
  const existing = new Map<string, any>();
  for (const field of json.customFields ?? json.data ?? []) {
    existing.set(String(field.name).toLowerCase(), field);
  }

  const created: Record<string, any> = {};
  for (const field of CONTACT_CUSTOM_FIELDS) {
    if (existing.has(field.name.toLowerCase())) {
      created[field.key] = existing.get(field.name.toLowerCase());
      continue;
    }

    const createResponse = await ghlRequest(
      `/v1/locations/${locationId}/customFields`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: field.name,
          dataType: field.fieldType,
          options: field.options ?? undefined,
          entityType: 'contact',
        }),
      },
      logger,
      correlationId,
    );

    if (createResponse.ok) {
      const createdField = await createResponse.json();
      created[field.key] = createdField.customField ?? createdField;
    } else {
      const errorText = await createResponse.text();
      logger.warn('Failed to create custom field', { field: field.name, status: createResponse.status, errorText });
    }
  }

  logger.info('Custom field provisioning complete', { createdKeys: Object.keys(created) });
  return created;
}

async function ensureLocationCustomValues(
  locationId: string,
  payload: ProvisioningPayload,
  trainerProfile: Record<string, unknown>,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  const customValues = {
    brand_name: payload.business.brandName,
    support_email: payload.business.supportEmail ?? payload.trainer.email,
    support_phone: payload.business.supportPhone ?? payload.trainer.phone ?? null,
    website_url: payload.business.websiteUrl ?? null,
    booking_discovery_call_url: payload.links?.discoveryCall ?? null,
    booking_training_session_url: payload.links?.trainingSession ?? null,
    terms_url: payload.links?.termsUrl ?? null,
    privacy_url: payload.links?.privacyUrl ?? null,
    plan_tier: payload.planTier,
    default_timezone: trainerProfile.timezone ?? 'America/Los_Angeles',
    quiet_hours_enabled: resolveQuietHours(payload).enabled,
    quiet_hours_start: resolveQuietHours(payload).start,
    quiet_hours_end: resolveQuietHours(payload).end,
  };

  const response = await ghlRequest(
    `/v1/locations/${locationId}/customValues`,
    {
      method: 'PUT',
      body: JSON.stringify({ customValues }),
    },
    logger,
    correlationId,
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.warn('Failed to update location custom values', { status: response.status, errorText });
  } else {
    logger.info('Location custom values updated', { locationId });
  }
}

async function ensureCalendars(
  locationId: string,
  primaryUserId: string | null,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  const response = await ghlRequest(`/v1/locations/${locationId}/calendars`, { method: 'GET' }, logger, correlationId);
  const json = response.ok ? await response.json() : { calendars: [] };
  const existing = new Map<string, any>();
  for (const calendar of json.calendars ?? json.data ?? []) {
    existing.set(String(calendar.name).toLowerCase(), calendar);
  }

  const ensured: Record<string, any> = {};
  for (const blueprint of CALENDAR_BLUEPRINTS) {
    if (existing.has(blueprint.name.toLowerCase())) {
      ensured[blueprint.slug] = existing.get(blueprint.name.toLowerCase());
      continue;
    }

    const createResponse = await ghlRequest(
      `/v1/locations/${locationId}/calendars`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: blueprint.name,
          slug: blueprint.slug,
          description: blueprint.description,
          meetingDuration: blueprint.duration,
          slotInterval: blueprint.slotInterval,
          minCancellationNotice: blueprint.minNotice,
          bufferTimeBefore: blueprint.bufferBefore,
          bufferTimeAfter: blueprint.bufferAfter,
          timezoneMode: blueprint.timezoneMode,
          userId: primaryUserId ?? undefined,
        }),
      },
      logger,
      correlationId,
    );

    if (createResponse.ok) {
      const createdCalendar = await createResponse.json();
      ensured[blueprint.slug] = createdCalendar.calendar ?? createdCalendar;
    } else {
      const errorText = await createResponse.text();
      logger.warn('Failed to create calendar', { calendar: blueprint.name, status: createResponse.status, errorText });
    }
  }

  logger.info('Calendar provisioning complete', { locationId, ensured: Object.keys(ensured) });
  return ensured;
}

async function ensurePrimaryUser(
  locationId: string,
  payload: ProvisioningPayload,
  existingConfig: GHLConfigRecord | null,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  if (existingConfig?.primary_user_id) {
    logger.info('Reusing existing primary user', { primaryUserId: existingConfig.primary_user_id });
    return { id: existingConfig.primary_user_id };
  }

  const response = await ghlRequest(`/v1/locations/${locationId}/users`, { method: 'GET' }, logger, correlationId);
  if (response.ok) {
    const json = await response.json();
    const existing = (json.users ?? json.data ?? []).find(
      (user: any) => String(user.email).toLowerCase() === payload.trainer.email.toLowerCase(),
    );
    if (existing) {
      logger.info('Found existing primary user', { userId: existing.id });
      return existing;
    }
  }

  const createResponse = await ghlRequest(
    `/v1/locations/${locationId}/users`,
    {
      method: 'POST',
      body: JSON.stringify({
        email: payload.trainer.email,
        name: `${payload.trainer.firstName} ${payload.trainer.lastName}`.trim(),
        phone: payload.trainer.phone ?? null,
        role: 'admin',
      }),
    },
    logger,
    correlationId,
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    logger.warn('Failed to create primary user', { status: createResponse.status, errorText });
    return null;
  }

  const createdUser = await createResponse.json();
  const user = createdUser.user ?? createdUser;
  logger.info('Primary user created', { userId: user.id });
  return user;
}

async function persistProvisioningSuccess(
  supabase: any,
  trainerId: string,
  data: {
    locationId: string;
    primaryUserId: string | null;
    planTier: string;
    defaultChannel: string;
    quietHours: { enabled: boolean; start: string | null; end: string | null };
    dfyRequestId?: string | undefined;
  },
  logger: ReturnType<typeof createLogger>,
) {
  const updatePayload: Record<string, unknown> = {
    trainer_id: trainerId,
    location_id: data.locationId,
    primary_user_id: data.primaryUserId,
    provisioning_status: 'active',
    status: 'active',
    setup_type: 'dfy',
    default_channel: data.defaultChannel,
    quiet_hours_start: data.quietHours.start ?? '08:00:00',
    quiet_hours_end: data.quietHours.end ?? '21:00:00',
    webhook_registered: true,
    provisioned_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('ghl_config').upsert(updatePayload, { onConflict: 'trainer_id' });
  if (error) {
    logger.error('Failed to persist GHL config update', { error });
    throw new Error('Failed to update GHL configuration');
  }

  await markProvisioningStatus(supabase, trainerId, 'active', {});
}

function resolveQuietHours(payload: ProvisioningPayload) {
  const quiet = payload.prefs?.quietHours;
  return {
    enabled: quiet?.enabled ?? true,
    start: quiet?.start ?? '21:00',
    end: quiet?.end ?? '08:00',
  };
}

async function ghlRequest(path: string, init: RequestInit, logger: ReturnType<typeof createLogger>, correlationId: string) {
  const url = path.startsWith('http') ? path : `${GHL_API_BASE}${path}`;
  const headers = new Headers(init.headers ?? {});
  headers.set('Authorization', `Bearer ${GHL_ACCESS_TOKEN}`);
  headers.set('Content-Type', 'application/json');
  headers.set('Version', GHL_API_VERSION);
  headers.set('x-correlation-id', correlationId);

  return fetchWithRetry(url, { ...init, headers }, { logger, correlationId, functionName: FUNCTION_NAME });
}
