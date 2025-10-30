// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type TriggerType =
  | "booking_confirmed"
  | "booking_upcoming"
  | "missed_session"
  | "no_activity"
  | "milestone";

interface RequestBody {
  contactId: string;
  triggerType: TriggerType;
}

function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function pickTemplate(
  trigger: TriggerType,
  contact: { first_name: string | null; last_name: string | null },
  context: { sessionType?: string; dateStr?: string; count?: number },
): { content: string; confidence: number; why: string[] } {
  const first = contact.first_name ?? "there";
  switch (trigger) {
    case "booking_confirmed": {
      const msg = `Hi ${first}! Your ${context.sessionType ?? "training"} is confirmed for ${context.dateStr ?? "the scheduled time"}. Reply Y to confirm.`;
      return { content: msg, confidence: 0.9, why: ["booking confirmed", "clear details", "friendly tone"] };
    }
    case "booking_upcoming": {
      const msg = `Reminder: ${first}, your ${context.sessionType ?? "session"} is coming up on ${context.dateStr ?? "the scheduled time"}. Need to reschedule? Reply RES.`;
      return { content: msg, confidence: 0.88, why: ["upcoming session", "actionable", "concise"] };
    }
    case "missed_session": {
      const msg = `${first}, we missed you last time. Want help finding a new time to get back on track?`;
      return { content: msg, confidence: 0.72, why: ["empathetic", "re-engagement", "helpful"] };
    }
    case "no_activity": {
      const msg = `Hey ${first}, quick check-in—how are workouts going this week? I can adjust your plan if needed.`;
      return { content: msg, confidence: 0.8, why: ["low recent activity", "supportive", "light nudge"] };
    }
    case "milestone": {
      const count = context.count ?? 1;
      const msg = `${first}, congrats on session #${count}! Want to set a new goal for next week?`;
      return { content: msg, confidence: 0.86, why: ["milestone", "celebratory", "goal-oriented"] };
    }
  }
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseKey = getEnv("SUPABASE_ANON_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return new Response("Unauthorized", { status: 401 });
    const trainerId = auth.user.id;

    const body = (await req.json()) as RequestBody;
    if (!body?.contactId || !body?.triggerType) {
      return new Response("Invalid payload", { status: 400 });
    }

    const { data: contact, error: contactErr } = await supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .eq("trainer_id", trainerId)
      .eq("id", body.contactId)
      .single();
    if (contactErr || !contact) throw contactErr ?? new Error("Contact not found");

    // Minimal context for templates; can be extended by querying bookings/insights
    const template = pickTemplate(body.triggerType, contact as any, {});

    const { data: inserted, error: insertErr } = await supabase
      .from("messages")
      .insert({
        trainer_id: trainerId,
        contact_id: body.contactId,
        status: "draft",
        content: template.content,
        channel: "sms",
        confidence: template.confidence,
        why_reasons: template.why,
      })
      .select("id, confidence")
      .single();
    if (insertErr) throw insertErr;

    console.log(JSON.stringify({
      function: 'draft-engine',
      action: 'generate',
      contactId: body.contactId,
      triggerType: body.triggerType,
      confidence: inserted.confidence,
      messageId: inserted.id,
      trainerId,
      timestamp: new Date().toISOString(),
    }));

    const response = { messageId: inserted.id, confidence: inserted.confidence, why: template.why };
    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("draft-engine error", err);
    return new Response(JSON.stringify({ error: "draft_engine_failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
