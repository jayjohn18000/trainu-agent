/**
 * Multi-Platform OAuth Callback Handler
 * Handles OAuth callbacks for GHL, Mindbody, and future integrations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GHL_CLIENT_ID = Deno.env.get('GHL_CLIENT_ID');
const GHL_CLIENT_SECRET = Deno.env.get('GHL_CLIENT_SECRET');
const GHL_REDIRECT_URI = Deno.env.get('GHL_REDIRECT_URI');
const MINDBODY_CLIENT_ID = Deno.env.get('MINDBODY_CLIENT_ID');
const MINDBODY_CLIENT_SECRET = Deno.env.get('MINDBODY_CLIENT_SECRET');
const MINDBODY_REDIRECT_URI = Deno.env.get('MINDBODY_REDIRECT_URI');
const APP_URL = Deno.env.get('APP_URL') || 'https://trainu.app';

// Sub-Account apps use services.leadconnectorhq.com for token exchange
const GHL_TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/token';
const MINDBODY_TOKEN_URL = 'https://api.mindbodyonline.com/oauth/token';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Handle OAuth error (user declined)
    if (error) {
      console.error('OAuth error:', error);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${APP_URL}/integrations?error=oauth_declined`,
        },
      });
    }

    if (!code || !stateParam) {
      console.error('Missing code or state parameter');
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${APP_URL}/integrations?error=invalid_callback`,
        },
      });
    }

    // Decode and parse state
    let state;
    try {
      state = JSON.parse(atob(stateParam));
    } catch {
      console.error('Invalid state parameter');
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${APP_URL}/integrations?error=invalid_state`,
        },
      });
    }

    const { trainerId, tier, redirect, platform } = state;
    // Use redirect from state, default based on platform
    const redirectPath = redirect || (platform === 'mindbody' ? '/integrations' : '/onboarding');

    if (!trainerId) {
      console.error('Missing trainerId in state');
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${APP_URL}${redirectPath}?error=invalid_state`,
        },
      });
    }

    // Route to platform-specific handler
    if (platform === 'mindbody') {
      return handleMindbodyCallback(code, trainerId, redirectPath);
    } else {
      // Default to GHL for backward compatibility
      return handleGHLCallback(code, trainerId, tier, redirectPath);
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}/integrations?error=server_error`,
      },
    });
  }
});

// Handle Mindbody OAuth callback
async function handleMindbodyCallback(code: string, trainerId: string, redirectPath: string) {
  if (!MINDBODY_CLIENT_ID || !MINDBODY_CLIENT_SECRET || !MINDBODY_REDIRECT_URI) {
    console.error('Mindbody OAuth not configured');
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}${redirectPath}?error=oauth_not_configured`,
      },
    });
  }

  // Exchange authorization code for tokens
  console.log('Exchanging Mindbody code for tokens');
  const tokenResponse = await fetch(MINDBODY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: MINDBODY_CLIENT_ID,
      client_secret: MINDBODY_CLIENT_SECRET,
      redirect_uri: MINDBODY_REDIRECT_URI,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json().catch(() => ({}));
    console.error('Mindbody token exchange failed:', errorData);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}${redirectPath}?error=token_exchange_failed`,
      },
    });
  }

  const tokenData = await tokenResponse.json();
  const { access_token, refresh_token, expires_in } = tokenData;

  if (!access_token) {
    console.error('Missing access token from Mindbody');
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}${redirectPath}?error=incomplete_token_data`,
      },
    });
  }

  // Fetch account info to get account ID and location ID
  const accountResponse = await fetch('https://api.mindbodyonline.com/v6/account', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
    },
  });

  let accountId = 'unknown';
  let locationId = 'unknown';

  if (accountResponse.ok) {
    const accountData = await accountResponse.json();
    accountId = accountData.id || 'unknown';
    locationId = accountData.defaultLocationId || accountData.locationId || 'unknown';
  }

  // Calculate token expiration
  const tokenExpiresAt = expires_in
    ? new Date(Date.now() + expires_in * 1000).toISOString()
    : null;

  // Create service role client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // Store OAuth tokens in integration_configs
  const { error: upsertError } = await supabase
    .from('integration_configs')
    .upsert({
      trainer_id: trainerId,
      integration_name: 'mindbody',
      access_token: access_token,
      refresh_token: refresh_token || null,
      expires_at: tokenExpiresAt,
      external_account_id: accountId,
      external_location_id: locationId,
      sync_status: 'connected',
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'trainer_id,integration_name',
    });

  if (upsertError) {
    console.error('Failed to store Mindbody OAuth tokens:', upsertError);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}${redirectPath}?error=storage_failed`,
      },
    });
  }

  // Update integration status
  await supabase
    .from('integration_status')
    .upsert({
      trainer_id: trainerId,
      integration_name: 'mindbody',
      connection_status: 'connected',
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'trainer_id,integration_name',
    });

  // Log activity
  await supabase
    .from('integration_activity_log')
    .insert({
      trainer_id: trainerId,
      integration_name: 'mindbody',
      activity_type: 'oauth_connected',
      activity_message: 'Mindbody account connected successfully',
    });

  // Trigger initial sync
  try {
    await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/mindbody-sync`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainerId }),
      }
    );
    console.log('Mindbody initial sync triggered');
  } catch (syncError) {
    console.warn('Mindbody initial sync trigger failed:', syncError);
  }

  console.log('Mindbody OAuth tokens stored successfully', { trainerId, accountId, locationId });

  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${APP_URL}${redirectPath}?oauth=success&integration=mindbody`,
    },
  });
}

// Handle GHL OAuth callback (existing logic)
async function handleGHLCallback(code: string, trainerId: string, tier: string | undefined, redirectPath: string) {

  if (!GHL_CLIENT_ID || !GHL_CLIENT_SECRET || !GHL_REDIRECT_URI) {
    console.error('GHL OAuth not configured');
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}${redirectPath}?error=oauth_not_configured`,
      },
    });
  }

  // Exchange authorization code for tokens
  console.log('Exchanging code for tokens at:', GHL_TOKEN_URL);
  const tokenResponse = await fetch(GHL_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      client_id: GHL_CLIENT_ID!,
      client_secret: GHL_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: GHL_REDIRECT_URI!,
      user_type: 'Location', // Required for Sub-Account apps
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json().catch(() => ({}));
    console.error('Token exchange failed:', { 
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      error: errorData.error || 'unknown',
      message: errorData.message || errorData.error_description || 'No details',
    });
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}${redirectPath}?error=token_exchange_failed`,
      },
    });
  }

  const tokenData = await tokenResponse.json();
  const {
    access_token,
    refresh_token,
    expires_in,
    locationId,
    companyId,
    userId,
  } = tokenData;

  if (!access_token || !locationId) {
    console.error('Missing required token data', { hasAccessToken: !!access_token, locationId });
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}${redirectPath}?error=incomplete_token_data`,
      },
    });
  }

  // Calculate token expiration
  const tokenExpiresAt = new Date(Date.now() + (expires_in * 1000));

  // Create service role client to update ghl_config
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // Store OAuth tokens in ghl_config
  const { error: upsertError } = await supabase
    .from('ghl_config')
    .upsert({
      trainer_id: trainerId,
      location_id: locationId,
      access_token: access_token,
      refresh_token: refresh_token,
      token_expires_at: tokenExpiresAt.toISOString(),
      company_id: companyId || null,
      primary_user_id: userId || null,
      sms_enabled: true,
      email_enabled: true,
      default_channel: 'both',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'trainer_id',
    });

  if (upsertError) {
    console.error('Failed to store OAuth tokens:', upsertError);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}${redirectPath}?error=storage_failed`,
      },
    });
  }

  console.log('OAuth tokens stored successfully', {
    trainerId,
    locationId,
    tier,
    redirect: redirectPath,
  });

  // Fetch calendars and store the primary calendar widget ID
  try {
    const calendarsResponse = await fetch(
      `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Version': '2021-07-28',
          'Accept': 'application/json',
        },
      }
    );

    if (calendarsResponse.ok) {
      const calendarsData = await calendarsResponse.json();
      const calendars = calendarsData.calendars || [];
      
      if (calendars.length > 0) {
        // Store the first calendar's ID as the booking widget ID
        const primaryCalendarId = calendars[0].id;
        console.log('Found calendar, storing widget ID:', primaryCalendarId);
        
        await supabase
          .from('ghl_config')
          .update({ booking_widget_id: primaryCalendarId })
          .eq('trainer_id', trainerId);
      } else {
        console.log('No calendars found for location');
      }
    } else {
      console.warn('Failed to fetch calendars:', calendarsResponse.status);
    }
  } catch (calendarError) {
    console.warn('Error fetching calendars:', calendarError);
    // Continue - calendar fetch is not critical for OAuth flow
  }

  // If redirecting to settings, skip provisioning (already onboarded)
  if (redirectPath !== '/onboarding') {
    // Register webhook for this location
    try {
      const webhookResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/ghl-webhook-register`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ locationId, trainerId }),
        }
      );
      if (webhookResponse.ok) {
        console.log('Webhook registered for reconnected account');
      }
    } catch (webhookError) {
      console.warn('Webhook registration failed:', webhookError);
    }

    // Trigger initial sync
    try {
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/ghl-sync`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trainerId }),
        }
      );
      console.log('Initial sync triggered');
    } catch (syncError) {
      console.warn('Initial sync trigger failed:', syncError);
    }

    // Redirect to settings with success
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}${redirectPath}?oauth=success`,
      },
    });
  }

  // Trigger provisioning for new onboarding
  console.log('Triggering provisioning for trainer:', trainerId);
  
  // Fetch user metadata to pass to provisioning
  const { data: userData } = await supabase.auth.admin.getUserById(trainerId);
  const userMeta = userData?.user?.user_metadata || {};
  
  try {
    const provisioningPayload = {
      trainerId,
      planTier: tier || 'starter',
      trainer: {
        email: userData?.user?.email || '',
        firstName: userMeta.first_name || 'Trainer',
        lastName: userMeta.last_name || '',
        phone: userMeta.phone || ''
      },
      business: {
        brandName: userMeta.business_name || `${userMeta.first_name || 'Trainer'}'s Training`,
        legalName: userMeta.business_name || `${userMeta.first_name || 'Trainer'}'s Training`,
        supportEmail: userData?.user?.email || ''
      }
    };
    
    console.log('Provisioning payload:', JSON.stringify(provisioningPayload, null, 2));
    
    const provisioningResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/ghl-provisioning`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(provisioningPayload),
      }
    );

    if (!provisioningResponse.ok) {
      const errorText = await provisioningResponse.text();
      console.error('Provisioning failed:', {
        status: provisioningResponse.status,
        error: errorText,
      });
      // Continue to onboarding even if provisioning fails
      // The onboarding page will show the error and allow retry
    } else {
      console.log('Provisioning triggered successfully');
    }
  } catch (provisionError) {
    console.error('Failed to trigger provisioning:', provisionError);
    // Continue to onboarding even if provisioning fails
  }

  // Redirect to onboarding
  const redirectUrl = tier
    ? `${APP_URL}/onboarding?oauth=success&tier=${tier}`
    : `${APP_URL}/onboarding?oauth=success`;

  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
    },
  });
}
