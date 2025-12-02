/**
 * Mindbody OAuth Initialization
 * Generates OAuth authorization URL for users to connect their Mindbody account
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/responses.ts";
import { createLogger } from "../_shared/logger.ts";

const MINDBODY_CLIENT_ID = Deno.env.get('MINDBODY_CLIENT_ID');
const MINDBODY_REDIRECT_URI = Deno.env.get('MINDBODY_REDIRECT_URI');
const MINDBODY_OAUTH_BASE = 'https://api.mindbodyonline.com/oauth';

// Required scopes for Mindbody integration
const REQUIRED_SCOPES = [
  'attendance',
  'clients',
  'memberships',
  'services',
].join(' ');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger('mindbody-oauth-init');

  if (req.method !== 'GET' && req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
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
      logger.warn('Unauthorized OAuth init attempt');
      return errorResponse('Unauthorized', 401);
    }

    if (!MINDBODY_CLIENT_ID || !MINDBODY_REDIRECT_URI) {
      logger.error('Missing Mindbody OAuth configuration');
      return errorResponse('OAuth not configured', 500);
    }

    // Get redirect path from query params or request body
    const url = new URL(req.url);
    let redirectPath = url.searchParams.get('redirect') || '/integrations';
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body?.redirect) redirectPath = body.redirect;
      } catch {
        // Body parsing failed, continue with default
      }
    }

    // Generate state parameter with trainerId and redirect
    const state = JSON.stringify({
      trainerId: user.id,
      platform: 'mindbody',
      redirect: redirectPath,
      timestamp: Date.now(),
    });

    // Build OAuth authorization URL
    const authUrl = new URL(`${MINDBODY_OAUTH_BASE}/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', MINDBODY_REDIRECT_URI);
    authUrl.searchParams.set('client_id', MINDBODY_CLIENT_ID);
    authUrl.searchParams.set('scope', REQUIRED_SCOPES);
    authUrl.searchParams.set('state', btoa(state)); // Base64 encode state

    logger.info('Generated OAuth URL', {
      trainerId: user.id,
      redirect: redirectPath,
    });

    return jsonResponse({
      authUrl: authUrl.toString(),
      state: btoa(state),
    });
  } catch (error) {
    const logger = createLogger('mindbody-oauth-init');
    logger.error('OAuth init error', { error: error instanceof Error ? error.message : String(error) });
    return errorResponse(
      'Internal server error',
      500
    );
  }
});

