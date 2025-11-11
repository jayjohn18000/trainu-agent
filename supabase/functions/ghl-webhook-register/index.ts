import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse } from '../_shared/responses.ts'

const GHL_API_BASE = Deno.env.get('GHL_API_BASE') || 'https://services.leadconnectorhq.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    console.log(`Registering webhook for trainer ${user.id}`);

    // Get trainer's GHL config
    const { data: config, error: configError } = await supabase
      .from('ghl_config')
      .select('location_id')
      .eq('trainer_id', user.id)
      .single();

    if (configError || !config?.location_id) {
      return errorResponse('GHL not configured for this trainer', 400);
    }

    const ghlAccessToken = Deno.env.get('GHL_ACCESS_TOKEN');
    if (!ghlAccessToken) {
      return errorResponse('GHL_ACCESS_TOKEN not configured', 500);
    }

    // Generate webhook secret
    const webhookSecret = crypto.randomUUID();
    
    // Register webhook with GHL for contact updates, messages, and appointments
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ghl-webhook`;
    const events = [
      'contact.created',
      'contact.updated',
      'contact.deleted',
      'message.inbound',
      'appointment.created',
      'appointment.updated',
      'appointment.cancelled'
    ];

    const registerUrl = `${GHL_API_BASE}/webhooks/`;
    const registerResponse = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlAccessToken}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: config.location_id,
        url: webhookUrl,
        events: events,
        name: `TrainU Webhook - ${user.id}`,
      }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error('Failed to register webhook:', errorText);
      return errorResponse(`Failed to register webhook: ${errorText}`, 500);
    }

    const webhookData = await registerResponse.json();
    console.log('Webhook registered successfully:', webhookData);

    // Update GHL config with webhook info
    await supabase
      .from('ghl_config')
      .update({
        webhook_url: webhookUrl,
        webhook_secret: webhookSecret,
        webhook_registered: true,
      })
      .eq('trainer_id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        webhook_id: webhookData.id,
        webhook_url: webhookUrl,
        events: events,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook registration error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
