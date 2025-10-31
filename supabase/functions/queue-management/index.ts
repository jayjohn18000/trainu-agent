import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { checkQuietHours, checkFrequencyCap } from '../_shared/timeguard.ts'

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get action from query params for GET requests, body for POST requests
    let action: string | null = null;
    let body: any = null;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      action = url.searchParams.get('action');
    } else if (req.method === 'POST') {
      body = await req.json();
      action = body.action;
    }

    // Get Queue Items
    if (action === 'getQueue' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('queue_items')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('status', 'review')
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching queue:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ queue: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Approve Message (messages table, compliance-aware)
    if (action === 'approve' && req.method === 'POST') {
      const { messageId } = body;

      const { data: message, error: msgErr } = await supabase
        .from('messages')
        .select('id, trainer_id, contact_id, status, content, scheduled_for')
        .eq('id', messageId)
        .eq('trainer_id', user.id)
        .single();
      if (msgErr || !message) {
        return new Response(JSON.stringify({ error: 'Message not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const [{ data: contact }, { data: config }] = await Promise.all([
        supabase.from('contacts').select('id, messages_sent_today, messages_sent_this_week').eq('id', message.contact_id).eq('trainer_id', user.id).single(),
        supabase.from('ghl_config').select('quiet_hours_start, quiet_hours_end, frequency_cap_daily, frequency_cap_weekly').eq('trainer_id', user.id).single(),
      ]);

      const now = new Date();
      const scheduledFor = message.scheduled_for ? new Date(message.scheduled_for as unknown as string) : now;

      const quietCheck = checkQuietHours(scheduledFor, {
        quiet_hours_start: (config as any)?.quiet_hours_start ?? null,
        quiet_hours_end: (config as any)?.quiet_hours_end ?? null,
      });

      const freqCheck = checkFrequencyCap({
        today: (contact as any)?.messages_sent_today ?? 0,
        week: (contact as any)?.messages_sent_this_week ?? 0,
      }, {
        frequency_cap_daily: (config as any)?.frequency_cap_daily ?? null,
        frequency_cap_weekly: (config as any)?.frequency_cap_weekly ?? null,
      });

      if (!freqCheck.allowed) {
        return new Response(JSON.stringify({ error: 'frequency_cap_reached', limit: freqCheck.limit }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const finalWhen = quietCheck.allowed ? scheduledFor : quietCheck.nextAvailable!;

      const { error: updErr } = await supabase
        .from('messages')
        .update({ status: 'queued', scheduled_for: finalWhen.toISOString() })
        .eq('id', message.id)
        .eq('trainer_id', user.id);
      if (updErr) {
        return new Response(JSON.stringify({ error: 'update_failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(JSON.stringify({
        function: 'queue-management',
        action: 'approve',
        messageId: message.id,
        trainerId: user.id,
        scheduled_for: finalWhen.toISOString(),
        deferred_by_quiet_hours: !quietCheck.allowed,
        timestamp: new Date().toISOString(),
      }));

      return new Response(JSON.stringify({ queued: true, scheduled_for: finalWhen.toISOString(), deferred_by_quiet_hours: !quietCheck.allowed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Edit Queue Item
    if (action === 'edit' && req.method === 'POST') {
      const { id, message, tone } = body;

      await supabase
        .from('queue_items')
        .update({ 
          preview: message,
          status: 'edited',
        })
        .eq('id', id)
        .eq('trainer_id', user.id);

      // Update trainer stats
      await supabase.rpc('increment_trainer_stat', {
        trainer_id: user.id,
        stat_name: 'total_messages_edited',
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Batch Approve
    if (action === 'batchApprove' && req.method === 'POST') {
      const { minConfidence } = body;

      // Get items to approve
      const { data: items } = await supabase
        .from('queue_items')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('status', 'review')
        .gte('confidence', minConfidence || 0.8);

      if (!items || items.length === 0) {
        return new Response(JSON.stringify({ approved: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Approve all items
      const ids = items.map(i => i.id);
      await supabase
        .from('queue_items')
        .update({ status: 'approved' })
        .in('id', ids);

      // Add to activity feed
      const feedItems = items.map(item => ({
        trainer_id: user.id,
        action: 'sent',
        client_name: item.client_name,
        client_id: item.client_id,
        status: 'success',
        message_preview: item.preview,
        confidence: item.confidence,
        why: item.why.join(', '),
      }));

      const { data: insertedFeedItems } = await supabase
        .from('activity_feed')
        .insert(feedItems)
        .select();

      // Send all messages via GHL if configured
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const feedItem = insertedFeedItems?.[i];
        
        try {
          await supabase.functions.invoke('ghl-integration', {
            body: {
              action: 'send_message',
              queueItemId: feedItem?.id,
              contactData: {
                firstName: item.client_name.split(' ')[0],
                lastName: item.client_name.split(' ')[1] || '',
                email: `${item.client_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                phone: '+1234567890',
              },
              messageData: {
                content: item.preview,
                subject: 'Message from your trainer',
              },
            },
          });
        } catch (ghlError) {
          console.error('GHL send failed for item:', item.id, ghlError);
        }
      }

      return new Response(JSON.stringify({ approved: items.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Approve Draft (new action for drafts table)
    if (action === 'approveDraft' && req.method === 'POST') {
      const { draftId } = body;
      
      const { data: draft, error: draftError } = await supabase
        .from('drafts')
        .select('*')
        .eq('id', draftId)
        .eq('trainer_id', user.id)
        .eq('status', 'pending')
        .single();

      if (draftError || !draft) {
        return new Response(JSON.stringify({ error: 'Draft not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch client settings (timezone, opt_out)
      let clientTz: string | null = null;
      let clientOptOut = false;
      if (draft.client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('timezone, opt_out')
          .eq('id', draft.client_id)
          .eq('trainer_id', user.id)
          .single();
        clientTz = (client as any)?.timezone ?? null;
        clientOptOut = !!(client as any)?.opt_out;
      }

      if (clientOptOut) {
        return new Response(JSON.stringify({ error: 'opt_out' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Rate limit: max 50 approvals in last hour per trainer
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: approvalsLastHour } = await supabase
        .from('drafts')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', user.id)
        .in('status', ['approved','scheduled','sent'])
        .gte('updated_at', oneHourAgo);
      if ((approvalsLastHour ?? 0) >= 50) {
        return new Response(JSON.stringify({ error: 'rate_limited', limit: 50 }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Quiet hours: 22:00–04:00 in client-local timezone (fallback UTC)
      const now = new Date();
      let localHour = now.getUTCHours();
      if (clientTz) {
        try {
          const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: clientTz });
          localHour = Number(fmt.format(now));
        } catch (_e) {
          // fallback to UTC
        }
      }
      const isQuietHours = localHour >= 22 || localHour < 4;
      
      let updateData: any = { status: 'approved' };
      
      if (isQuietHours) {
        // Schedule for 04:05 client-local next day
        const future = new Date(now);
        // Compute next day 04:05 in client timezone, convert to UTC ISO
        // Approximation: set to next day 04:05 in localHour baseline
        const target = new Date(now);
        target.setUTCDate(target.getUTCDate() + (localHour >= 22 ? 1 : 0));
        target.setUTCHours(4, 5, 0, 0);
        updateData.scheduled_at = target.toISOString();
        updateData.status = 'scheduled';
      }

      const { error: updateError } = await supabase
        .from('drafts')
        .update(updateData)
        .eq('id', draftId);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, scheduled: isQuietHours }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Bulk Approve Drafts
    if (action === 'bulkApprove' && req.method === 'POST') {
      const { draftIds } = body;
      
      if (!Array.isArray(draftIds) || draftIds.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid draftIds array' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: drafts, error: fetchError } = await supabase
        .from('drafts')
        .select('*')
        .in('id', draftIds)
        .eq('trainer_id', user.id)
        .eq('status', 'pending');

      if (fetchError) {
        return new Response(JSON.stringify({ error: fetchError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const now = new Date();
      
      const results = await Promise.all(
        drafts.map(async (draft) => {
          // Fetch client
          let clientTz: string | null = null;
          let clientOptOut = false;
          if (draft.client_id) {
            const { data: client } = await supabase
              .from('clients')
              .select('timezone, opt_out')
              .eq('id', draft.client_id)
              .eq('trainer_id', user.id)
              .single();
            clientTz = (client as any)?.timezone ?? null;
            clientOptOut = !!(client as any)?.opt_out;
          }
          if (clientOptOut) {
            return { id: draft.id, success: false, error: 'opt_out' };
          }

          // Rate limit check per item (simple shared cap)
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
          const { count: approvalsLastHour } = await supabase
            .from('drafts')
            .select('id', { count: 'exact', head: true })
            .eq('trainer_id', user.id)
            .in('status', ['approved','scheduled','sent'])
            .gte('updated_at', oneHourAgo);
          if ((approvalsLastHour ?? 0) >= 50) {
            return { id: draft.id, success: false, error: 'rate_limited' };
          }

          let localHour = now.getUTCHours();
          if (clientTz) {
            try {
              const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: clientTz });
              localHour = Number(fmt.format(now));
            } catch {}
          }
          const isQuietHours = localHour >= 22 || localHour < 4;
          let updateData: any = { status: 'approved' };
          
          if (isQuietHours) {
            const target = new Date(now);
            target.setUTCDate(target.getUTCDate() + (localHour >= 22 ? 1 : 0));
            target.setUTCHours(4, 5, 0, 0);
            updateData.scheduled_at = target.toISOString();
            updateData.status = 'scheduled';
          }

          const { error } = await supabase
            .from('drafts')
            .update(updateData)
            .eq('id', draft.id);

          return {
            id: draft.id,
            success: !error,
            error: error?.message,
            scheduled: isQuietHours,
          };
        })
      );

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
