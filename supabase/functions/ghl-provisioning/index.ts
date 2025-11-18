import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://esm.sh/zod@3.23.8';

import { corsHeaders } from '../_shared/responses.ts';
import { handleError, handleValidationError } from '../_shared/error-handler.ts';
import { createLogger, getRequestCorrelationId } from '../_shared/logger.ts';
import { fetchWithRetry } from '../_shared/request-helper.ts';
import { refreshGHLToken as sharedRefreshGHLToken } from '../_shared/ghl-token.ts';

const FUNCTION_NAME = 'ghl-provisioning';
const GHL_API_BASE = Deno.env.get('GHL_API_BASE') ?? 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = Deno.env.get('GHL_API_VERSION') ?? '2021-07-28';
const GHL_ACCESS_TOKEN = Deno.env.get('GHL_ACCESS_TOKEN');
const GHL_CLIENT_ID = Deno.env.get('GHL_CLIENT_ID');
const GHL_CLIENT_SECRET = Deno.env.get('GHL_CLIENT_SECRET');

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
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: string | null;
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

    // OAuth check - require access token for provisioning
    if (!existingConfig?.access_token) {
      logger.warn('No OAuth access token found - provisioning requires OAuth', { trainerId: resolvedTrainerId });
      return new Response(
        JSON.stringify({
          error: 'OAuth required',
          message: 'Please connect your GoHighLevel account first via OAuth',
          requiresOAuth: true,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
        },
      );
    }

    logger.info('OAuth token validated', {
      trainerId: resolvedTrainerId,
      locationId: existingConfig.location_id,
      hasRefreshToken: !!existingConfig.refresh_token,
    });

    await markProvisioningStatus(supabase, resolvedTrainerId, 'provisioning', {
      correlationId,
      dfyRequestId: input.dfyRequestId ?? null,
      planTier: input.planTier,
    });

    const trainerProfile = await ensureTrainerProfile(supabase, resolvedTrainerId, input, dfyRequest, logger);

    const location = await ensureLocation(input, trainerProfile, existingConfig, supabase, resolvedTrainerId, logger, correlationId);
    
    // Refresh token after location creation to ensure we have valid token for subsequent calls
    const accessToken = await refreshGHLToken(supabase, resolvedTrainerId, logger) || existingConfig?.access_token || GHL_ACCESS_TOKEN;
    
    if (!accessToken) {
      logger.error('No valid access token available', { trainerId: resolvedTrainerId });
      throw new Error('Unable to obtain GHL access token. Please ensure OAuth is complete.');
    }
    
    const primaryUser = await ensurePrimaryUser(location.id, input, existingConfig, accessToken, logger, correlationId);
    const tags = await ensureTags(location.id, accessToken, logger, correlationId);
    const customFields = await ensureCustomFields(location.id, accessToken, logger, correlationId);
    await ensureLocationCustomValues(location.id, input, trainerProfile, accessToken, logger, correlationId);
    const calendars = await ensureCalendars(
      location.id,
      primaryUser?.id ?? existingConfig?.primary_user_id ?? null,
      accessToken,
      logger,
      correlationId,
    );

    // Apply snapshot based on plan tier
    const snapshotResult = await applySnapshotAssets(
      location.id,
      input.planTier,
      accessToken,
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
        snapshotApplied: snapshotResult.success,
        snapshotDetails: snapshotResult,
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
    .select('trainer_id, location_id, provisioning_status, status, primary_user_id, default_channel, quiet_hours_start, quiet_hours_end, access_token, refresh_token, token_expires_at')
    .eq('trainer_id', trainerId)
    .maybeSingle();

  return data ?? null;
}

async function refreshGHLToken(
  supabase: any,
  trainerId: string,
  logger: ReturnType<typeof createLogger>,
): Promise<string | null> {
  return await sharedRefreshGHLToken(supabase, trainerId, logger);
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
  supabase: any,
  trainerId: string,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  // Get access token - prefer per-location token, fallback to global
  let accessToken = existingConfig?.access_token;
  if (!accessToken && existingConfig) {
    accessToken = await refreshGHLToken(supabase, trainerId, logger);
  }
  if (!accessToken) {
    accessToken = GHL_ACCESS_TOKEN;
  }
  if (!accessToken) {
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
  }, accessToken, logger, correlationId);

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

async function ensureTags(locationId: string, accessToken: string, logger: ReturnType<typeof createLogger>, correlationId: string) {
  const response = await ghlRequest(`/v1/locations/${locationId}/tags`, { method: 'GET' }, accessToken, logger, correlationId);
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
      accessToken,
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

async function ensureCustomFields(locationId: string, accessToken: string, logger: ReturnType<typeof createLogger>, correlationId: string) {
  const response = await ghlRequest(`/v1/locations/${locationId}/customFields`, { method: 'GET' }, accessToken, logger, correlationId);
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
      accessToken,
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
  accessToken: string,
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
    accessToken,
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
  accessToken: string,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  const response = await ghlRequest(`/v1/locations/${locationId}/calendars`, { method: 'GET' }, accessToken, logger, correlationId);
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
      accessToken,
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
  accessToken: string,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  if (existingConfig?.primary_user_id) {
    logger.info('Reusing existing primary user', { primaryUserId: existingConfig.primary_user_id });
    return { id: existingConfig.primary_user_id };
  }

  const response = await ghlRequest(`/v1/locations/${locationId}/users`, { method: 'GET' }, accessToken, logger, correlationId);
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
    accessToken,
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

async function applySnapshotAssets(
  locationId: string,
  planTier: string,
  accessToken: string,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
): Promise<{ success: boolean; details: any }> {
  try {
    // Map plan tier to snapshot file
    const tierMap: Record<string, string> = {
      'starter': 'starter',
      'professional': 'professional',
      'growth': 'growth',
    };

    const tier = tierMap[planTier.toLowerCase()] || 'starter';

    logger.info('Loading snapshot', { tier, planTier });

    // Load snapshot JSON file
    let snapshotData: any;
    try {
      // Use import.meta.url to resolve the path relative to this file
      const baseUrl = new URL('.', import.meta.url).href;
      const snapshotUrl = new URL(`snapshots/${tier}.json`, baseUrl).href;
      const snapshotFile = await Deno.readTextFile(new URL(snapshotUrl).pathname);
      snapshotData = JSON.parse(snapshotFile);
    } catch (error) {
      // Fallback: try reading from relative path
      try {
        const snapshotFile = await Deno.readTextFile(`./snapshots/${tier}.json`);
        snapshotData = JSON.parse(snapshotFile);
      } catch (fallbackError) {
        logger.warn('Failed to load snapshot file, using empty snapshot', { 
          tier, 
          error: error instanceof Error ? error.message : String(error),
          fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        });
        snapshotData = { tier, tags: { additional: [] }, customFields: { additional: [] }, workflows: { definitions: [] }, automations: { definitions: [] }, calendars: { additional: [] }, pipelines: { definitions: [] }, funnels: { definitions: [] } };
      }
    }

    const results: any = {
      tags: { created: [], skipped: [] },
      customFields: { created: [], skipped: [] },
      workflows: { created: [], skipped: [] },
      automations: { created: [], skipped: [] },
      calendars: { created: [], skipped: [] },
      pipelines: { created: [], skipped: [] },
      funnels: { created: [], skipped: [] },
    };

    // Apply additional tags
    if (snapshotData.tags?.additional) {
      const existingTagsResponse = await ghlRequest(`/v1/locations/${locationId}/tags`, { method: 'GET' }, accessToken, logger, correlationId);
      const existingTagsJson = existingTagsResponse.ok ? await existingTagsResponse.json() : { tags: [] };
      const existingTags = new Set<string>((existingTagsJson.tags ?? existingTagsJson.data ?? []).map((tag: any) => String(tag.name).toLowerCase()));

      for (const tagName of snapshotData.tags.additional) {
        if (existingTags.has(tagName.toLowerCase())) {
          results.tags.skipped.push(tagName);
          continue;
        }

        const createResponse = await ghlRequest(
          `/v1/locations/${locationId}/tags`,
          {
            method: 'POST',
            body: JSON.stringify({ name: tagName }),
          },
          accessToken,
          logger,
          correlationId,
        );

        if (createResponse.ok) {
          results.tags.created.push(tagName);
        } else {
          const errorText = await createResponse.text();
          logger.warn('Failed to create snapshot tag', { tag: tagName, status: createResponse.status, errorText });
          results.tags.skipped.push(tagName);
        }
      }
    }

    // Apply additional custom fields
    if (snapshotData.customFields?.additional) {
      const existingFieldsResponse = await ghlRequest(`/v1/locations/${locationId}/customFields`, { method: 'GET' }, accessToken, logger, correlationId);
      const existingFieldsJson = existingFieldsResponse.ok ? await existingFieldsResponse.json() : { customFields: [] };
      const existingFields = new Map<string, any>();
      for (const field of existingFieldsJson.customFields ?? existingFieldsJson.data ?? []) {
        existingFields.set(String(field.name).toLowerCase(), field);
      }

      for (const field of snapshotData.customFields.additional) {
        if (existingFields.has(field.name.toLowerCase())) {
          results.customFields.skipped.push(field.name);
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
          accessToken,
          logger,
          correlationId,
        );

        if (createResponse.ok) {
          results.customFields.created.push(field.name);
        } else {
          const errorText = await createResponse.text();
          logger.warn('Failed to create snapshot custom field', { field: field.name, status: createResponse.status, errorText });
          results.customFields.skipped.push(field.name);
        }
      }
    }

    // Apply additional calendars
    if (snapshotData.calendars?.additional) {
      const existingCalendarsResponse = await ghlRequest(`/v1/locations/${locationId}/calendars`, { method: 'GET' }, accessToken, logger, correlationId);
      const existingCalendarsJson = existingCalendarsResponse.ok ? await existingCalendarsResponse.json() : { calendars: [] };
      const existingCalendars = new Map<string, any>();
      for (const calendar of existingCalendarsJson.calendars ?? existingCalendarsJson.data ?? []) {
        existingCalendars.set(String(calendar.name).toLowerCase(), calendar);
      }

      for (const calendar of snapshotData.calendars.additional) {
        if (existingCalendars.has(calendar.name.toLowerCase())) {
          results.calendars.skipped.push(calendar.name);
          continue;
        }

        const createResponse = await ghlRequest(
          `/v1/locations/${locationId}/calendars`,
          {
            method: 'POST',
            body: JSON.stringify({
              name: calendar.name,
              slug: calendar.slug,
              description: calendar.description,
              meetingDuration: calendar.duration,
              slotInterval: calendar.slotInterval,
              minCancellationNotice: calendar.minNotice,
              bufferTimeBefore: calendar.bufferBefore,
              bufferTimeAfter: calendar.bufferAfter,
              timezoneMode: calendar.timezoneMode,
            }),
          },
          accessToken,
          logger,
          correlationId,
        );

        if (createResponse.ok) {
          results.calendars.created.push(calendar.name);
        } else {
          const errorText = await createResponse.text();
          logger.warn('Failed to create snapshot calendar', { calendar: calendar.name, status: createResponse.status, errorText });
          results.calendars.skipped.push(calendar.name);
        }
      }
    }

    // Note: Workflows, automations, pipelines, and funnels would require more complex API calls
    // For now, we log them but don't create them automatically
    // These should be created manually or via more specific GHL API endpoints
    if (snapshotData.workflows?.definitions?.length > 0) {
      logger.info('Snapshot contains workflow definitions (manual creation required)', {
        count: snapshotData.workflows.definitions.length,
        workflows: snapshotData.workflows.definitions.map((w: any) => w.name),
      });
      results.workflows.note = 'Workflow creation requires manual setup or additional API endpoints';
    }

    if (snapshotData.automations?.definitions?.length > 0) {
      logger.info('Snapshot contains automation definitions (manual creation required)', {
        count: snapshotData.automations.definitions.length,
        automations: snapshotData.automations.definitions.map((a: any) => a.name),
      });
      results.automations.note = 'Automation creation requires manual setup or additional API endpoints';
    }

    if (snapshotData.pipelines?.definitions?.length > 0) {
      logger.info('Snapshot contains pipeline definitions (manual creation required)', {
        count: snapshotData.pipelines.definitions.length,
        pipelines: snapshotData.pipelines.definitions.map((p: any) => p.name),
      });
      results.pipelines.note = 'Pipeline creation requires manual setup or additional API endpoints';
    }

    if (snapshotData.funnels?.definitions?.length > 0) {
      logger.info('Snapshot contains funnel definitions (manual creation required)', {
        count: snapshotData.funnels.definitions.length,
        funnels: snapshotData.funnels.definitions.map((f: any) => f.name),
      });
      results.funnels.note = 'Funnel creation requires manual setup or additional API endpoints';
    }

    logger.info('Snapshot application complete', {
      tier,
      locationId,
      results: {
        tagsCreated: results.tags.created.length,
        customFieldsCreated: results.customFields.created.length,
        calendarsCreated: results.calendars.created.length,
      },
    });

    return {
      success: true,
      details: {
        tier,
        snapshotId: snapshotData.snapshotId,
        results,
      },
    };
  } catch (error) {
    logger.error('Failed to apply snapshot assets', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

async function ghlRequest(
  path: string,
  init: RequestInit,
  accessToken: string,
  logger: ReturnType<typeof createLogger>,
  correlationId: string,
) {
  const url = path.startsWith('http') ? path : `${GHL_API_BASE}${path}`;
  const headers = new Headers(init.headers ?? {});
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('Content-Type', 'application/json');
  headers.set('Version', GHL_API_VERSION);
  headers.set('x-correlation-id', correlationId);

  return fetchWithRetry(url, { ...init, headers }, { logger, correlationId, functionName: FUNCTION_NAME });
}
