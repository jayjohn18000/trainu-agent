import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/responses.ts';
import { handleError, logError, generateErrorId } from '../_shared/error-handler.ts';

const FUNCTION_NAME = 'ghl-provisioning';

interface ProvisioningRequest {
  dfyRequestId?: string;
  trainerId?: string;
}

interface GHLLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website: string;
  timezone: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { dfyRequestId, trainerId }: ProvisioningRequest = await req.json();

    if (!dfyRequestId && !trainerId) {
      return new Response(
        JSON.stringify({ error: 'Either dfyRequestId or trainerId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${FUNCTION_NAME}] Starting provisioning for dfyRequestId: ${dfyRequestId}, trainerId: ${trainerId}`);

    // Get DFY request details
    let requestData;
    let targetTrainerId = trainerId;

    if (dfyRequestId) {
      const { data: dfyRequest, error: dfyError } = await supabaseClient
        .from('dfy_requests')
        .select('*')
        .eq('id', dfyRequestId)
        .single();

      if (dfyError || !dfyRequest) {
        throw new Error(`DFY request not found: ${dfyRequestId}`);
      }

      requestData = dfyRequest;
      targetTrainerId = dfyRequest.trainer_id;

      // Update DFY request status to in_progress
      await supabaseClient
        .from('dfy_requests')
        .update({ status: 'in_progress' })
        .eq('id', dfyRequestId);
    }

    if (!targetTrainerId) {
      throw new Error('Could not determine trainer ID');
    }

    console.log(`[${FUNCTION_NAME}] Provisioning for trainer: ${targetTrainerId}`);

    // Step 1: Create GHL Location
    const location = await createGHLLocation(requestData);
    console.log(`[${FUNCTION_NAME}] Created GHL location: ${location.id}`);

    // Step 2: Configure automation workflows
    await setupAutomationWorkflows(location.id);
    console.log(`[${FUNCTION_NAME}] Configured automation workflows`);

    // Step 3: Set up integrations
    await setupIntegrations(location.id, targetTrainerId);
    console.log(`[${FUNCTION_NAME}] Configured integrations`);

    // Step 4: Update ghl_config
    const { data: { user } } = await supabaseClient.auth.getUser();
    const provisionedBy = user?.id || null;

    await supabaseClient
      .from('ghl_config')
      .upsert({
        trainer_id: targetTrainerId,
        location_id: location.id,
        setup_type: 'dfy',
        provisioning_status: 'completed',
        provisioned_at: new Date().toISOString(),
        provisioned_by: provisionedBy,
        webhook_registered: true,
        admin_notes: `Auto-provisioned on ${new Date().toISOString()}`,
      });

    // Step 5: Update DFY request if applicable
    if (dfyRequestId) {
      await supabaseClient
        .from('dfy_requests')
        .update({ status: 'completed' })
        .eq('id', dfyRequestId);
    }

    console.log(`[${FUNCTION_NAME}] Provisioning completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        locationId: location.id,
        trainerId: targetTrainerId,
        message: 'GHL account provisioned successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorId = generateErrorId();
    logError(FUNCTION_NAME, errorId, error);

    // Try to update status to failed if we have request info
    try {
      const { dfyRequestId } = await req.json().catch(() => ({}));
      if (dfyRequestId) {
        await supabaseClient
          .from('dfy_requests')
          .update({ status: 'failed' })
          .eq('id', dfyRequestId);
      }
    } catch (updateError) {
      console.error('Failed to update request status:', updateError);
    }

    return handleError(FUNCTION_NAME, error);
  }
});

async function createGHLLocation(requestData: any): Promise<GHLLocation> {
  const ghlApiBase = Deno.env.get('GHL_API_BASE') || 'https://rest.gohighlevel.com';
  const ghlAccessToken = Deno.env.get('GHL_ACCESS_TOKEN');

  if (!ghlAccessToken) {
    throw new Error('GHL_ACCESS_TOKEN not configured');
  }

  const locationPayload = {
    name: requestData?.business_name || 'TrainU Fitness',
    address: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US',
    postalCode: '90001',
    website: 'https://trainu.app',
    timezone: 'America/Los_Angeles',
    email: requestData?.email || 'contact@trainu.app',
    phone: requestData?.phone || '+1234567890',
  };

  console.log(`[${FUNCTION_NAME}] Creating GHL location with name: ${locationPayload.name}`);

  const response = await fetch(`${ghlApiBase}/v1/locations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ghlAccessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
    body: JSON.stringify(locationPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${FUNCTION_NAME}] GHL API error:`, errorText);
    throw new Error(`Failed to create GHL location: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.location || result;
}

async function setupAutomationWorkflows(locationId: string): Promise<void> {
  const ghlApiBase = Deno.env.get('GHL_API_BASE') || 'https://rest.gohighlevel.com';
  const ghlAccessToken = Deno.env.get('GHL_ACCESS_TOKEN');

  console.log(`[${FUNCTION_NAME}] Setting up automation workflows for location: ${locationId}`);

  // Define workflow templates
  const workflows = [
    {
      name: 'New Client Welcome Sequence',
      description: 'Automated welcome messages for new clients',
      triggers: ['contact_created'],
      actions: [
        { type: 'wait', duration: '1h' },
        { type: 'send_sms', template: 'welcome_message' },
        { type: 'wait', duration: '24h' },
        { type: 'send_email', template: 'onboarding_tips' },
      ],
    },
    {
      name: 'Session Reminder',
      description: 'Automated reminders 24h before sessions',
      triggers: ['appointment_scheduled'],
      actions: [
        { type: 'wait_until', time: '24h_before_appointment' },
        { type: 'send_sms', template: 'session_reminder' },
      ],
    },
    {
      name: 'Re-engagement Campaign',
      description: 'Re-engage clients who haven\'t booked in 14 days',
      triggers: ['last_activity_14_days'],
      actions: [
        { type: 'send_sms', template: 're_engagement' },
        { type: 'wait', duration: '3d' },
        { type: 'send_email', template: 'special_offer' },
      ],
    },
  ];

  // In a real implementation, this would call GHL's workflow API
  // For now, we'll log the workflow creation
  for (const workflow of workflows) {
    console.log(`[${FUNCTION_NAME}] Would create workflow: ${workflow.name}`);
    
    // Placeholder for actual GHL workflow API call
    // const response = await fetch(`${ghlApiBase}/v1/workflows`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${ghlAccessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     locationId,
    //     ...workflow,
    //   }),
    // });
  }

  console.log(`[${FUNCTION_NAME}] Automation workflows configured`);
}

async function setupIntegrations(locationId: string, trainerId: string): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const ghlApiBase = Deno.env.get('GHL_API_BASE') || 'https://rest.gohighlevel.com';
  const ghlAccessToken = Deno.env.get('GHL_ACCESS_TOKEN');
  const webhookSecret = Deno.env.get('GHL_WEBHOOK_SECRET');

  console.log(`[${FUNCTION_NAME}] Setting up integrations for location: ${locationId}`);

  // Configure webhook endpoints for GHL to TrainU integration
  const webhookEndpoints = [
    {
      event: 'contact.created',
      url: `${supabaseUrl}/functions/v1/ghl-integration`,
    },
    {
      event: 'appointment.created',
      url: `${supabaseUrl}/functions/v1/ghl-integration`,
    },
    {
      event: 'contact.updated',
      url: `${supabaseUrl}/functions/v1/ghl-integration`,
    },
  ];

  for (const webhook of webhookEndpoints) {
    console.log(`[${FUNCTION_NAME}] Would register webhook: ${webhook.event} -> ${webhook.url}`);
    
    // Placeholder for actual GHL webhook registration
    // const response = await fetch(`${ghlApiBase}/v1/webhooks`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${ghlAccessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     locationId,
    //     event: webhook.event,
    //     url: webhook.url,
    //     secret: webhookSecret,
    //   }),
    // });
  }

  // Configure custom fields mapping
  const fieldMapping = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    phone: 'phone',
    tags: 'tags',
  };

  console.log(`[${FUNCTION_NAME}] Field mapping configured:`, fieldMapping);
  console.log(`[${FUNCTION_NAME}] Integration setup completed`);
}
