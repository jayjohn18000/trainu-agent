import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    // Fetch contacts and basic activity
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, trainer_id, last_message_sent_at, messages_sent_this_week')
      .eq('trainer_id', user.id);

    const now = new Date();
    for (const c of contacts || []) {
      const daysSince = c.last_message_sent_at ? Math.max(0, Math.floor((now.getTime() - new Date(c.last_message_sent_at).getTime()) / 86400000)) : 999;
      // Simple heuristic risk score
      let risk = 10;
      risk += Math.min(90, daysSince * 5);
      risk += (c.messages_sent_this_week ?? 0) === 0 ? 10 : 0;
      risk = Math.max(0, Math.min(100, risk));

      await supabase.from('insights').upsert({
        trainer_id: user.id,
        contact_id: c.id,
        risk_score: Math.round(risk),
        last_activity_at: c.last_message_sent_at ?? null,
        total_sessions: 0,
        missed_sessions: 0,
        response_rate: 0,
        current_streak: 0,
        engagement_score: 0,
      }, { onConflict: 'contact_id' });
    }

    return new Response(JSON.stringify({ updated: (contacts || []).length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('calculate-insights error', e);
    return new Response('Internal Error', { status: 500 });
  }
});


