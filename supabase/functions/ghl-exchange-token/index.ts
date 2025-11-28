import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { exchangeForLocationToken } from '../_shared/ghl-location-token.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * GHL Token Exchange Edge Function
 * 
 * Exchanges the agency-level GHL_PRIVATE_API_KEY for a location-scoped access token.
 * This token is then stored in ghl_config.access_token for the trainer.
 * 
 * Request body:
 * - locationId: string (required) - The GHL location/subaccount ID
 * - companyId: string (optional) - The GHL company/agency ID
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header for user auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[ghl-exchange-token] Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { locationId, companyId } = await req.json();
    
    if (!locationId) {
      return new Response(
        JSON.stringify({ error: 'locationId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[ghl-exchange-token] User ${user.id} requesting token for location ${locationId}`);

    // Get agency-level token
    const agencyToken = Deno.env.get('GHL_PRIVATE_API_KEY');
    if (!agencyToken) {
      console.error('[ghl-exchange-token] GHL_PRIVATE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'GHL integration not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Attempt token exchange
    const result = await exchangeForLocationToken(agencyToken, locationId, companyId);

    if (result.success && result.accessToken) {
      // Use service role to update ghl_config
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Store the location token in ghl_config
      const { error: updateError } = await supabaseAdmin
        .from('ghl_config')
        .upsert({
          trainer_id: user.id,
          location_id: locationId,
          company_id: companyId || null,
          access_token: result.accessToken,
          token_expires_at: result.expiresAt,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'trainer_id',
        });

      if (updateError) {
        console.error('[ghl-exchange-token] Failed to store token:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to store token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[ghl-exchange-token] Successfully stored location token for user ${user.id}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Location token obtained and stored',
          expiresAt: result.expiresAt,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Token exchange failed - return error but allow fallback to agency token
    console.log(`[ghl-exchange-token] Token exchange failed for ${locationId}: ${result.error}`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: result.error,
        fallbackAvailable: true,
        message: 'Location token exchange failed. Sync will use agency token with location scoping.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ghl-exchange-token] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
