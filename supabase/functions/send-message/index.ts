import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { checkCompliance, incrementMessageCounters } from '../_shared/timeguard.ts'

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messageId } = await req.json();

    // Fetch message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*, contacts(*)')
      .eq('id', messageId)
      .eq('trainer_id', user.id)
      .single();

    if (messageError || !message) {
      console.error('Message not found:', messageError);
      return new Response(JSON.stringify({ error: 'Message not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check consent
    if (message.contacts.consent_status === 'opted_out') {
      await supabase
        .from('messages')
        .update({ status: 'failed' })
        .eq('id', messageId);

      return new Response(JSON.stringify({ error: 'Contact has opted out' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check compliance (quiet hours, frequency caps)
    const scheduledTime = message.scheduled_for ? new Date(message.scheduled_for) : new Date();
    const complianceCheck = await checkCompliance(
      supabase,
      message.contact_id,
      scheduledTime,
      user.id
    );

    if (!complianceCheck.allowed) {
      console.log('Compliance check failed:', complianceCheck.reason);
      
      // If it's quiet hours, reschedule
      if (complianceCheck.nextAvailable) {
        await supabase
          .from('messages')
          .update({ 
            scheduled_for: complianceCheck.nextAvailable.toISOString(),
            status: 'queued'
          })
          .eq('id', messageId);

        return new Response(JSON.stringify({ 
          error: 'Outside quiet hours',
          rescheduled: true,
          nextAvailable: complianceCheck.nextAvailable 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If it's frequency cap, fail
      await supabase
        .from('messages')
        .update({ status: 'failed' })
        .eq('id', messageId);

      return new Response(JSON.stringify({ error: complianceCheck.reason }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch GHL config
    const { data: ghlConfig } = await supabase
      .from('ghl_config')
      .select('*')
      .eq('trainer_id', user.id)
      .single();

    if (!ghlConfig) {
      console.error('GHL config not found');
      await supabase
        .from('messages')
        .update({ status: 'failed' })
        .eq('id', messageId);

      return new Response(JSON.stringify({ error: 'GHL integration not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send via GHL (invoke ghl-integration function)
    const { data: ghlResult, error: ghlError } = await supabase.functions.invoke('ghl-integration', {
      body: {
        action: 'send_message',
        messageId,
        contactData: {
          firstName: message.contacts.first_name,
          lastName: message.contacts.last_name || '',
          email: message.contacts.email || '',
          phone: message.contacts.phone || '',
        },
        messageData: {
          content: message.content,
          channel: message.channel,
        },
      },
    });

    if (ghlError) {
      console.error('GHL send failed:', ghlError);
      await supabase
        .from('messages')
        .update({ status: 'failed' })
        .eq('id', messageId);

      return new Response(JSON.stringify({ error: 'Failed to send message via GHL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update message status
    await supabase
      .from('messages')
      .update({ 
        status: 'sent',
        ghl_message_id: ghlResult?.messageId,
        ghl_status: 'sent',
      })
      .eq('id', messageId);

    // Increment message counters
    await incrementMessageCounters(supabase, message.contact_id);

    // Log event
    await supabase.from('events').insert({
      trainer_id: user.id,
      event_type: 'message_sent',
      entity_type: 'message',
      entity_id: messageId,
      metadata: { 
        contactId: message.contact_id,
        channel: message.channel,
        ghlMessageId: ghlResult?.messageId,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId,
        ghlMessageId: ghlResult?.messageId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});