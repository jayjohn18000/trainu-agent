import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { errorResponse, jsonResponse, corsHeaders } from '../_shared/responses.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GHL_CLIENT_ID = Deno.env.get('GHL_CLIENT_ID');
const GHL_CLIENT_SECRET = Deno.env.get('GHL_CLIENT_SECRET');
const GHL_REDIRECT_URI = Deno.env.get('GHL_REDIRECT_URI');

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return errorResponse('Authentication failed', 400);
    }

    if (!code) {
      return errorResponse('Missing authorization code', 400);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GHL_CLIENT_ID!,
        client_secret: GHL_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: GHL_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return errorResponse('Failed to exchange authorization code', 500);
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, locationId, userId } = tokens;

    // Get user details from GHL
    const userResponse = await fetch('https://services.leadconnectorhq.com/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Version': '2021-07-28',
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user details');
      return errorResponse('Failed to fetch user details', 500);
    }

    const ghlUser = await userResponse.json();

    // Create or update Supabase auth user
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create Supabase user with GHL metadata
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ghlUser.email,
      email_confirm: true,
      user_metadata: {
        ghl_user_id: userId,
        ghl_location_id: locationId,
        name: ghlUser.name || ghlUser.email?.split('@')[0],
        provider: 'ghl',
      },
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('Failed to create auth user:', authError);
      return errorResponse('Failed to create user', 500);
    }

    const supabaseUserId = authData?.user?.id || (await supabase.auth.admin.listUsers())
      .data.users?.find(u => u.email === ghlUser.email)?.id;

    if (!supabaseUserId) {
      return errorResponse('Failed to retrieve user ID', 500);
    }

    // Store GHL tokens and config
    const { error: configError } = await supabase
      .from('ghl_config')
      .upsert({
        trainer_id: supabaseUserId,
        location_id: locationId,
        access_token: access_token,
        refresh_token: refresh_token,
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
      }, {
        onConflict: 'trainer_id',
      });

    if (configError) {
      console.error('Failed to store GHL config:', configError);
    }

    // Create user role if not exists
    await supabase
      .from('user_roles')
      .upsert({
        user_id: supabaseUserId,
        role: 'trainer',
      }, {
        onConflict: 'user_id',
      });

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: ghlUser.email,
    });

    if (sessionError || !sessionData) {
      console.error('Failed to generate session:', sessionError);
      return errorResponse('Failed to create session', 500);
    }

    // Return redirect with session token
    const redirectUrl = `${url.origin}/auth/callback?access_token=${sessionData.properties.hashed_token}`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return errorResponse('Internal server error', 500);
  }
});
