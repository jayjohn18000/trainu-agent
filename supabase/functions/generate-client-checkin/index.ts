import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEMPLATE_PROMPTS = {
  groupCheckIn: "Weekly wellness check asking how sessions are going (1-10 scale), any issues/blockers, offer to reschedule if needed",
  scheduleChange: "Notify about session time change, ask for confirmation or offer alternative times",
  missedSession: "Gentle re-engagement after missed session, check if everything is okay, offer to reschedule",
  birthday: "Warm birthday message, keep pushing toward fitness goals",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trainerId, contactId, contactName, templateId, customContext } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get trainer profile
    const { data: profile } = await supabase
      .from("trainer_profiles")
      .select("studio_name")
      .eq("id", trainerId)
      .single();

    // Get contact details and recent history
    const { data: contact } = await supabase
      .from("contacts")
      .select("first_name, last_name, tags")
      .eq("id", contactId)
      .single();

    // Get insights if available
    const { data: insights } = await supabase
      .from("insights")
      .select("engagement_score, current_streak, missed_sessions")
      .eq("contact_id", contactId)
      .eq("trainer_id", trainerId)
      .single();

    const templatePrompt = TEMPLATE_PROMPTS[templateId as keyof typeof TEMPLATE_PROMPTS] || TEMPLATE_PROMPTS.groupCheckIn;

    const prompt = `Create a personalized ${templateId} text message for a fitness client. Keep it under 160 characters (SMS length).

Client: ${contactName} (${contact?.first_name})
Template type: ${templatePrompt}
${customContext ? `Additional context: ${customContext}` : ""}
${contact?.tags?.length ? `Client tags: ${contact.tags.join(", ")}` : ""}
${insights ? `Streak: ${insights.current_streak} sessions, Engagement: ${Math.round(insights.engagement_score * 100)}%` : ""}
${insights?.missed_sessions ? `Recently missed ${insights.missed_sessions} sessions` : ""}

Guidelines:
- Personal and warm, using first name
- Keep it concise and actionable
- Match the template purpose
- Include relevant URLs if needed (use placeholders like {{reschedule_url}})
- Professional but approachable

Tone: ${templateId === "birthday" ? "Celebratory and encouraging" : "Friendly, professional, action-oriented"}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a fitness trainer assistant helping draft personalized client messages." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("Failed to generate message");
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;

    // Create draft message
    const { error: insertError } = await supabase
      .from("messages")
      .insert({
        trainer_id: trainerId,
        contact_id: contactId,
        content: generatedContent,
        status: "draft",
        channel: "sms",
        confidence: 0.82,
        requires_approval: true,
        why_reasons: [`${templateId} check-in`, customContext || "Routine client engagement"].filter(Boolean),
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Client check-in draft created",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating client checkin:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
