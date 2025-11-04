import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { checkQuietHours } from '../_shared/timeguard.ts'

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

    const now = new Date();
    
    // Find all messages ready for auto-approval
    const { data: messages, error: fetchError } = await supabase
      .from('messages')
      .select('id, trainer_id, contact_id, content, confidence, scheduled_for')
      .eq('status', 'draft')
      .not('auto_approval_at', 'is', null)
      .lte('auto_approval_at', now.toISOString())
      .order('auto_approval_at', { ascending: true })
      .limit(100);

    if (fetchError) {
      console.error('Error fetching auto-approval messages:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!messages || messages.length === 0) {
      console.log('No messages ready for auto-approval');
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${messages.length} messages for auto-approval`);

    const results = await Promise.all(
      messages.map(async (message) => {
        try {
          // Get trainer settings
          const { data: settings } = await supabase
            .from('auto_approval_settings')
            .select('enabled, max_daily_auto_approvals')
            .eq('trainer_id', message.trainer_id)
            .single();

          // Skip if auto-approval disabled
          if (!settings?.enabled) {
            console.log(`Auto-approval disabled for trainer ${message.trainer_id}`);
            return { id: message.id, status: 'skipped', reason: 'disabled' };
          }

          // Check daily limit
          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);
          
          const { count: todayCount } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('trainer_id', message.trainer_id)
            .in('status', ['queued', 'sent'])
            .eq('generated_by', 'ai')
            .gte('created_at', todayStart.toISOString());

          const dailyLimit = settings.max_daily_auto_approvals || 20;
          if ((todayCount || 0) >= dailyLimit) {
            console.log(`Daily limit reached for trainer ${message.trainer_id}`);
            // Clear auto_approval_at so trainer must manually review
            await supabase
              .from('messages')
              .update({ auto_approval_at: null })
              .eq('id', message.id);
            return { id: message.id, status: 'skipped', reason: 'daily_limit' };
          }

          // Check contact opt-out
          const { data: contact } = await supabase
            .from('contacts')
            .select('consent_status')
            .eq('id', message.contact_id)
            .single();

          if (contact?.consent_status === 'opted_out') {
            console.log(`Contact opted out: ${message.contact_id}`);
            await supabase
              .from('messages')
              .update({ status: 'failed', auto_approval_at: null })
              .eq('id', message.id);
            return { id: message.id, status: 'failed', reason: 'opted_out' };
          }

          // Get GHL config for quiet hours
          const { data: config } = await supabase
            .from('ghl_config')
            .select('quiet_hours_start, quiet_hours_end')
            .eq('trainer_id', message.trainer_id)
            .single();

          // Check quiet hours
          const scheduledFor = message.scheduled_for ? new Date(message.scheduled_for) : now;
          const quietCheck = checkQuietHours(scheduledFor, {
            quiet_hours_start: config?.quiet_hours_start ?? null,
            quiet_hours_end: config?.quiet_hours_end ?? null,
          });

          const finalScheduledFor = quietCheck.allowed ? scheduledFor : quietCheck.nextAvailable!;

          // Approve the message
          const { error: updateError } = await supabase
            .from('messages')
            .update({ 
              status: 'queued', 
              scheduled_for: finalScheduledFor.toISOString(),
              auto_approval_at: null, // Clear the auto-approval timestamp
            })
            .eq('id', message.id);

          if (updateError) {
            console.error(`Error approving message ${message.id}:`, updateError);
            return { id: message.id, status: 'error', reason: updateError.message };
          }

          // Log the auto-approval
          await supabase.from('events').insert({
            trainer_id: message.trainer_id,
            event_type: 'message_auto_approved',
            entity_type: 'message',
            entity_id: message.id,
            metadata: {
              confidence: message.confidence,
              scheduled_for: finalScheduledFor.toISOString(),
              deferred_by_quiet_hours: !quietCheck.allowed,
            },
          });

          console.log(`Auto-approved message ${message.id} for trainer ${message.trainer_id}`);
          return { 
            id: message.id, 
            status: 'approved', 
            scheduledFor: finalScheduledFor.toISOString(),
            deferredByQuietHours: !quietCheck.allowed,
          };
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return { id: message.id, status: 'error', reason: errorMessage };
        }
      })
    );

    const summary = {
      processed: messages.length,
      approved: results.filter(r => r.status === 'approved').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'failed').length,
      errors: results.filter(r => r.status === 'error').length,
      timestamp: now.toISOString(),
    };

    console.log('Auto-approval scheduler summary:', summary);

    return new Response(JSON.stringify({ summary, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Auto-approval scheduler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
