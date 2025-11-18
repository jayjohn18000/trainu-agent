/**
 * GHL OAuth Callback Handler
 * Receives authorization code, exchanges for tokens, stores in ghl_config
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GHL_CLIENT_ID = Deno.env.get('GHL_CLIENT_ID');
const GHL_CLIENT_SECRET = Deno.env.get('GHL_CLIENT_SECRET');
const GHL_REDIRECT_URI = Deno.env.get('GHL_REDIRECT_URI');
const APP_URL = Deno.env.get('APP_URL') || 'https://trainu.app';

const GHL_OAUTH_BASE = 'https://marketplace.gohighlevel.com/oauth';

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
          'Location': `${APP_URL}/onboarding?error=oauth_declined`,
        },
      });
    }

    if (!code || !stateParam) {
      console.error('Missing code or state parameter');
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${APP_URL}/onboarding?error=invalid_callback`,
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
          'Location': `${APP_URL}/onboarding?error=invalid_state`,
        },
      });
    }

    const { trainerId, tier } = state;

    if (!trainerId) {
      console.error('Missing trainerId in state');
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${APP_URL}/onboarding?error=invalid_state`,
        },
      });
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`${GHL_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GHL_CLIENT_ID!,
        client_secret: GHL_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: GHL_REDIRECT_URI!,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${APP_URL}/onboarding?error=token_exchange_failed`,
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
          'Location': `${APP_URL}/onboarding?error=incomplete_token_data`,
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
          'Location': `${APP_URL}/onboarding?error=storage_failed`,
        },
      });
    }

    console.log('OAuth tokens stored successfully', {
      trainerId,
      locationId,
      tier,
    });

    // Redirect to provisioning or onboarding complete
    const redirectUrl = tier
      ? `${APP_URL}/onboarding?oauth=success&tier=${tier}`
      : `${APP_URL}/onboarding?oauth=success`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${APP_URL}/onboarding?error=server_error`,
      },
    });
  }
});
