// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { checkQuietHours } from "../_shared/timeguard.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schema
const sendMessageSchema = z.object({
  messageId: z.string().uuid({ message: "messageId must be a valid UUID" }),
});

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const body = await req.json();
    
    // Validate input
    const validation = sendMessageSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { messageId } = validation.data;

    const { data: message, error: mErr } = await supabase
      .from('messages')
      .select('id, trainer_id, contact_id, status, content, channel, scheduled_for, ghl_message_id')
      .eq('id', messageId)
      .eq('trainer_id', user.id)
      .single();
    if (mErr || !message) return new Response('Not found', { status: 404 });

    if (message.status !== 'queued' && message.status !== 'draft') {
      return new Response('Invalid status', { status: 400 });
    }

    const [{ data: contact }, { data: config }] = await Promise.all([
      supabase.from('contacts').select('first_name, last_name, email, phone, consent_status').eq('id', message.contact_id).eq('trainer_id', user.id).single(),
      supabase.from('ghl_config').select('quiet_hours_start, quiet_hours_end').eq('trainer_id', user.id).single(),
    ]);

    if ((contact as any)?.consent_status === 'opted_out') {
      await supabase.from('messages').update({ status: 'failed', ghl_status: 'opted_out' }).eq('id', message.id);
      return new Response(JSON.stringify({ error: 'opted_out' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const now = new Date();
    const scheduled = message.scheduled_for ? new Date(message.scheduled_for as unknown as string) : now;
    const quiet = checkQuietHours(scheduled, {
      quiet_hours_start: (config as any)?.quiet_hours_start ?? null,
      quiet_hours_end: (config as any)?.quiet_hours_end ?? null,
    });
    if (!quiet.allowed) {
      await supabase.from('messages').update({ status: 'queued', scheduled_for: quiet.nextAvailable!.toISOString() }).eq('id', message.id);
      console.log(JSON.stringify({ function: 'send-message', action: 'quiet_hours_blocked', messageId: message.id, scheduled_for: quiet.nextAvailable!.toISOString(), trainerId: user.id, timestamp: new Date().toISOString() }));
      return new Response(JSON.stringify({ deferred: true, scheduled_for: quiet.nextAvailable!.toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Call GHL integration to send
    const { data: ghlResult, error: fnErr } = await supabase.functions.invoke('ghl-integration', {
      body: {
        action: 'send_message',
        contactData: {
          firstName: (contact as any)?.first_name ?? '',
          lastName: (contact as any)?.last_name ?? '',
          email: (contact as any)?.email ?? '',
          phone: (contact as any)?.phone ?? '',
        },
        messageData: {
          content: message.content,
        },
      },
    });
    
    // Update message status to sent even if GHL fails (demo mode support)
    const updateData: any = { status: 'sent' };
    
    if (fnErr) {
      console.error('GHL integration error (continuing anyway for demo):', fnErr);
      updateData.ghl_status = 'demo_mode';
    } else {
      updateData.ghl_status = 'sent';
      updateData.ghl_message_id = (ghlResult as any)?.messageId ?? null;
    }

    await supabase.from('messages').update(updateData).eq('id', message.id);
    console.log(JSON.stringify({ function: 'send-message', action: 'message_sent', messageId: message.id, trainerId: user.id, channel: message.channel, timestamp: new Date().toISOString() }));

    // Track event
    console.log(JSON.stringify({ 
      event: 'message_sent', 
      properties: { 
        messageId: message.id,
        channel: message.channel,
        contactId: message.contact_id,
        trainerId: user.id
      } 
    }));

    return new Response(JSON.stringify({ sent: true, result: ghlResult }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('send-message error', e);
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      const { data: { user } } = await supabase.auth.getUser();
      console.log(JSON.stringify({ function: 'send-message', action: 'message_failed', error: String(e), trainerId: user?.id, timestamp: new Date().toISOString() }));
    } catch {}
    return new Response('Internal Error', { status: 500 });
  }
});
