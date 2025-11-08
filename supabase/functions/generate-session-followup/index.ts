import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trainerId, contactId, contactName, sessionFocus, microGoal } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get trainer profile for context
    const { data: profile } = await supabase
      .from("trainer_profiles")
      .select("studio_name")
      .eq("id", trainerId)
      .single();

    // Get contact for additional context
    const { data: contact } = await supabase
      .from("contacts")
      .select("first_name, tags")
      .eq("id", contactId)
      .single();

    // Generate personalized follow-up using Lovable AI
    const prompt = `Create a post-session follow-up text message for a fitness client. Keep it under 160 characters (SMS length).

Client: ${contactName}
Session focus: ${sessionFocus}
Micro-goal for next time: ${microGoal}
${contact?.tags?.length ? `Client tags: ${contact.tags.join(", ")}` : ""}

Guidelines:
- Start with brief praise for today's work
- Reference the specific focus area
- Set expectation/goal for next session
- Keep tone motivating but concise
- Professional yet warm

Tone: Encouraging, specific, action-oriented`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a fitness trainer assistant helping draft client follow-up messages." },
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
        confidence: 0.88,
        requires_approval: true,
        why_reasons: [`Post-session follow-up: ${sessionFocus}`, `Goal: ${microGoal}`],
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Session follow-up draft created",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating session followup:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
