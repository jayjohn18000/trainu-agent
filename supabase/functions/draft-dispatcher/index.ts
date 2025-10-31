import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts'
import { DISPATCHER_BATCH_SIZE, RATE_LIMIT_PER_HOUR, RATE_LIMIT_WINDOW_MS } from '../_shared/constants.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const now = new Date();
    const nowISO = now.toISOString();

    // Find drafts ready to send (approved or scheduled, scheduled_at <= now)
    const { data: drafts, error: fetchError } = await supabase
      .from('drafts')
      .select('*')
      .in('status', ['approved', 'scheduled'])
      .lte('scheduled_at', nowISO)
      .limit(DISPATCHER_BATCH_SIZE);

    if (fetchError) {
      console.error('Error fetching drafts:', fetchError);
      return errorResponse(fetchError.message, 500);
    }

    if (!drafts || drafts.length === 0) {
      return jsonResponse({ processed: 0, sent: 0, failed: 0 });
    }

    // OPTIMIZATION: Fetch all clients in one query (fix N+1)
    const clientIds = drafts.map(d => d.client_id).filter(Boolean);
    const { data: allClients } = await supabase
      .from('clients')
      .select('id, opt_out, ghl_contact_id, email, phone, name')
      .in('id', clientIds);

    const clientsById = new Map((allClients || []).map(c => [c.id, c]));

    // OPTIMIZATION: Check rate limits once per trainer (fix N+1)
    const trainerIds = [...new Set(drafts.map(d => d.trainer_id))];
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const rateLimits = new Map<string, number>();
    for (const tid of trainerIds) {
      const { count } = await supabase
        .from('drafts')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', tid)
        .eq('status', 'sent')
        .gte('sent_at', oneHourAgo);
      rateLimits.set(tid, count ?? 0);
    }

    let sent = 0;
    let failed = 0;

    // Process each draft
    for (const draft of drafts) {
      const client = draft.client_id ? clientsById.get(draft.client_id) : null;
      
      // Check opt-out
      if (client?.opt_out) {
        await supabase
          .from('drafts')
          .update({ status: 'failed', failed_reason: 'Client opted out' })
          .eq('id', draft.id);
        failed++;
        continue;
      }

      // Check rate limit (using cached counts)
      const currentLimit = rateLimits.get(draft.trainer_id) ?? 0;
      if (currentLimit >= RATE_LIMIT_PER_HOUR) {
        await supabase
          .from('drafts')
          .update({ status: 'failed', failed_reason: 'Rate limit exceeded' })
          .eq('id', draft.id);
        failed++;
        continue;
      }

      // Send via GHL integration
      try {
        const { data: ghlResult, error: ghlError } = await supabase.functions.invoke('ghl-integration', {
          body: {
            action: 'send_message',
            contactData: {
              firstName: client?.name?.split(' ')[0] || '',
              lastName: client?.name?.split(' ').slice(1).join(' ') || '',
              email: client?.email || '',
              phone: client?.phone || '',
            },
            messageData: {
              content: draft.body,
              subject: 'Message from your trainer',
            },
          },
        });

        if (ghlError || !ghlResult?.success) {
          throw new Error(ghlError?.message || 'GHL send failed');
        }

        // Update draft to sent
        await supabase
          .from('drafts')
          .update({ 
            status: 'sent', 
            sent_at: nowISO,
            metadata: { ...(draft.metadata || {}), ghl_message_id: ghlResult?.messageId }
          })
          .eq('id', draft.id);

        sent++;
        // Increment rate limit counter
        rateLimits.set(draft.trainer_id, currentLimit + 1);
      } catch (sendError) {
        console.error(`Failed to send draft ${draft.id}:`, sendError);
        await supabase
          .from('drafts')
          .update({ 
            status: 'failed', 
            failed_reason: sendError instanceof Error ? sendError.message : 'Unknown error'
          })
          .eq('id', draft.id);
        failed++;
      }
    }

    return jsonResponse({ 
      processed: drafts.length, 
      sent, 
      failed,
      timestamp: nowISO,
    });

  } catch (error) {
    console.error('Draft dispatcher error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
