import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const GHL_API_BASE = Deno.env.get('GHL_API_BASE') || 'https://services.leadconnectorhq.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Validates a GHL Location ID by calling GET /locations/{locationId}
 * Returns location details if valid, error if not
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get locationId from request body
    const body = await req.json();
    const { locationId } = body;

    if (!locationId) {
      return new Response(
        JSON.stringify({ error: 'Location ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use GHL_PRIVATE_API_KEY for validation
    const ghlPrivateApiKey = Deno.env.get('GHL_PRIVATE_API_KEY');
    if (!ghlPrivateApiKey) {
      return new Response(
        JSON.stringify({ error: 'GHL_PRIVATE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Validating location ${locationId} for user ${user.id}`);

    // Call GHL API to validate location
    const validateUrl = `${GHL_API_BASE}/locations/${locationId}`;
    const validateResponse = await fetch(validateUrl, {
      headers: {
        'Authorization': `Bearer ${ghlPrivateApiKey}`,
        'Version': '2021-07-28',
      },
    });

    if (!validateResponse.ok) {
      const errorText = await validateResponse.text();
      console.error('Location validation failed:', errorText);
      
      if (validateResponse.status === 404) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Location not found. Please check your Location ID.' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (validateResponse.status === 401 || validateResponse.status === 403) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Access denied. This location may not be accessible.' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Validation failed: ${errorText}` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const locationData = await validateResponse.json();
    console.log('Location validated successfully:', locationData.location?.name || locationData.name);

    return new Response(
      JSON.stringify({
        valid: true,
        location: {
          id: locationData.location?.id || locationData.id || locationId,
          name: locationData.location?.name || locationData.name || 'Unknown',
          address: locationData.location?.address || locationData.address,
          email: locationData.location?.email || locationData.email,
          phone: locationData.location?.phone || locationData.phone,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Location validation error:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});