/**
 * GHL OAuth Initialization
 * Generates OAuth authorization URL for users to connect their GHL location
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/responses.ts";

const GHL_CLIENT_ID = Deno.env.get('GHL_CLIENT_ID');
const GHL_REDIRECT_URI = Deno.env.get('GHL_REDIRECT_URI');

const GHL_OAUTH_BASE = 'https://marketplace.gohighlevel.com/oauth';
const REQUIRED_SCOPES = [
  'locations.readonly',
  'locations.write',
  'contacts.readonly',
  'contacts.write',
  'calendars.readonly',
  'calendars.write',
  'workflows.readonly',
  'conversations.readonly',
  'conversations.write',
  'opportunities.readonly',
  'opportunities.write',
].join(' ');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!GHL_CLIENT_ID || !GHL_REDIRECT_URI) {
      console.error('Missing GHL OAuth configuration');
      return new Response(
        JSON.stringify({ error: 'OAuth not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get trainer's plan tier from query params or profile
    const url = new URL(req.url);
    let planTier = url.searchParams.get('tier') || 'starter';
    
    // If no tier specified, try to get from profile
    if (!url.searchParams.get('tier')) {
      const { data: profile } = await supabase
        .from('trainer_profiles')
        .select('plan_tier')
        .eq('id', user.id)
        .single();
      
      if (profile?.plan_tier) {
        planTier = profile.plan_tier;
      }
    }

    // Generate state parameter with trainerId and tier
    const state = JSON.stringify({
      trainerId: user.id,
      tier: planTier,
      timestamp: Date.now(),
    });

    // Build OAuth authorization URL
    const authUrl = new URL(`${GHL_OAUTH_BASE}/chooselocation`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', GHL_REDIRECT_URI);
    authUrl.searchParams.set('client_id', GHL_CLIENT_ID);
    authUrl.searchParams.set('scope', REQUIRED_SCOPES);
    authUrl.searchParams.set('state', btoa(state)); // Base64 encode state

    console.log('Generated OAuth URL', {
      trainerId: user.id,
      tier: planTier,
      redirectUri: GHL_REDIRECT_URI,
    });

    return new Response(
      JSON.stringify({
        authUrl: authUrl.toString(),
        state: btoa(state),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('OAuth init error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

