import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This function runs on a cron schedule to dispatch queued messages
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[message-dispatcher] Starting dispatch run');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch queued messages that are ready to send
    const now = new Date().toISOString();
    const { data: messages, error: fetchError } = await supabase
      .from('messages')
      .select(`
        id, 
        trainer_id, 
        contact_id, 
        content, 
        channel,
        scheduled_for
      `)
      .eq('status', 'queued')
      .lte('scheduled_for', now)
      .limit(50);

    if (fetchError) {
      console.error('[message-dispatcher] Error fetching messages:', fetchError);
      throw fetchError;
    }

    if (!messages || messages.length === 0) {
      console.log('[message-dispatcher] No queued messages to dispatch');
      return new Response(JSON.stringify({ 
        processed: 0, 
        sent: 0, 
        failed: 0,
        duration_ms: Date.now() - startTime 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[message-dispatcher] Found ${messages.length} messages to dispatch`);

    let sent = 0;
    let failed = 0;

    for (const message of messages) {
      try {
        // Get contact details
        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, email, phone, ghl_contact_id, consent_status')
          .eq('id', message.contact_id)
          .single();

        if (contactError || !contact) {
          console.error(`[message-dispatcher] Contact not found for message ${message.id}`);
          await supabase
            .from('messages')
            .update({ status: 'failed' })
            .eq('id', message.id);
          failed++;
          continue;
        }

        // Check for opt-out
        if (contact.consent_status === 'opted_out') {
          console.log(`[message-dispatcher] Contact ${contact.id} has opted out, skipping`);
          await supabase
            .from('messages')
            .update({ status: 'failed' })
            .eq('id', message.id);
          failed++;
          continue;
        }

        // Check if trainer has GHL configured
        const { data: ghlConfig } = await supabase
          .from('ghl_config')
          .select('access_token, location_id')
          .eq('trainer_id', message.trainer_id)
          .single();

        if (!ghlConfig?.access_token || !ghlConfig?.location_id) {
          console.log(`[message-dispatcher] No GHL config for trainer ${message.trainer_id}, marking as demo send`);
          // Still mark as sent for demo purposes
          await supabase
            .from('messages')
            .update({ status: 'sent' })
            .eq('id', message.id);
          
          // Add to activity feed
          await supabase.from('activity_feed').insert({
            trainer_id: message.trainer_id,
            action: 'sent',
            client_name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
            client_id: contact.id,
            status: 'success',
            message_preview: message.content.substring(0, 100),
            why: 'Demo mode - GHL not connected',
            ghl_channel: message.channel,
          });

          sent++;
          continue;
        }

        // Call send-message function
        const { data: sendResult, error: sendError } = await supabase.functions.invoke('send-message', {
          body: { messageId: message.id },
        });

        if (sendError) {
          console.error(`[message-dispatcher] Error sending message ${message.id}:`, sendError);
          await supabase
            .from('messages')
            .update({ status: 'failed' })
            .eq('id', message.id);
          failed++;
        } else {
          console.log(`[message-dispatcher] Successfully sent message ${message.id}`);
          sent++;
        }

        // Increment contact message counters
        await supabase.rpc('increment_message_counters', { contact_id: contact.id });

      } catch (err) {
        console.error(`[message-dispatcher] Error processing message ${message.id}:`, err);
        await supabase
          .from('messages')
          .update({ status: 'failed' })
          .eq('id', message.id);
        failed++;
      }
    }

    const result = {
      processed: messages.length,
      sent,
      failed,
      duration_ms: Date.now() - startTime,
    };

    console.log('[message-dispatcher] Dispatch complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[message-dispatcher] Fatal error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});