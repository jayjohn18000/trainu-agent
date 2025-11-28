import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts'

const GHL_API_BASE = Deno.env.get('GHL_API_BASE') || 'https://services.leadconnectorhq.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
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
      console.error('Auth error:', authError);
      return errorResponse('Unauthorized', 401);
    }

    // Try to get locationId from request body first (passed directly from UI)
    let locationId: string | null = null;
    try {
      const body = await req.json();
      locationId = body?.locationId;
      console.log(`Received locationId from body: ${locationId}`);
    } catch {
      console.log('No body provided, will fetch from config');
    }

    console.log(`Registering webhook for trainer ${user.id}`);

    // If no locationId in body, get from config
    if (!locationId) {
      const { data: config, error: configError } = await supabase
        .from('ghl_config')
        .select('location_id')
        .eq('trainer_id', user.id)
        .single();

      if (configError) {
        console.error('Config fetch error:', configError);
        return errorResponse('GHL not configured for this trainer', 400);
      }
      
      locationId = config?.location_id;
    }

    if (!locationId) {
      console.error('No location_id found');
      return errorResponse('GHL location_id not configured', 400);
    }

    console.log(`Using location_id: ${locationId}`);

    // Use GHL_PRIVATE_API_KEY (agency-level token)
    const ghlPrivateApiKey = Deno.env.get('GHL_PRIVATE_API_KEY');
    if (!ghlPrivateApiKey) {
      console.error('GHL_PRIVATE_API_KEY not found in environment');
      return errorResponse('GHL_PRIVATE_API_KEY not configured', 500);
    }

    // Use a single shared webhook URL for all locations
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ghl-webhook`;
    console.log(`Webhook URL: ${webhookUrl}`);
    
    // Events to subscribe to
    const events = [
      'ContactCreate',
      'ContactUpdate', 
      'ContactDelete',
      'InboundMessage',
      'OutboundMessage',
      'AppointmentCreate',
      'AppointmentUpdate',
      'AppointmentDelete'
    ];

    // Register webhook with GHL using the shared URL
    const registerUrl = `${GHL_API_BASE}/webhooks/`;
    console.log(`Registering webhook at: ${registerUrl}`);
    
    const registerResponse = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlPrivateApiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: locationId,
        url: webhookUrl,
        events: events,
        name: `TrainU Sync - ${locationId}`,
      }),
    });

    const responseText = await registerResponse.text();
    console.log(`GHL webhook response status: ${registerResponse.status}`);
    console.log(`GHL webhook response: ${responseText}`);

    if (!registerResponse.ok) {
      // Check if webhook already exists (common error)
      if (responseText.includes('already exists') || responseText.includes('duplicate') || registerResponse.status === 409) {
        console.log('Webhook already exists, marking as registered');
        
        // Update config to mark as registered anyway
        await supabase
          .from('ghl_config')
          .update({
            webhook_url: webhookUrl,
            webhook_registered: true,
            updated_at: new Date().toISOString(),
          })
          .eq('trainer_id', user.id);

        return jsonResponse({
          success: true,
          message: 'Webhook already registered',
          webhook_url: webhookUrl,
          events: events,
        });
      }
      
      // Check for scope/permission errors
      if (registerResponse.status === 401 || registerResponse.status === 403) {
        console.error('GHL API permission error - missing webhook scope');
        return errorResponse('Missing GHL API scope: webhooks.write. Please update your Private Integration permissions.', 403);
      }
      
      return errorResponse(`Failed to register webhook: ${responseText}`, 500);
    }

    let webhookData;
    try {
      webhookData = JSON.parse(responseText);
    } catch {
      webhookData = { id: 'unknown' };
    }
    
    console.log('Webhook registered successfully:', webhookData);

    // Update GHL config with webhook info
    const { error: updateError } = await supabase
      .from('ghl_config')
      .update({
        webhook_url: webhookUrl,
        webhook_registered: true,
        updated_at: new Date().toISOString(),
      })
      .eq('trainer_id', user.id);

    if (updateError) {
      console.error('Failed to update config:', updateError);
    }

    return jsonResponse({
      success: true,
      webhook_id: webhookData.id,
      webhook_url: webhookUrl,
      events: events,
    });

  } catch (error) {
    console.error('Webhook registration error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
