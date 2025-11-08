import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/responses.ts";
import { handleError } from "../_shared/error-handler.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get trainer context
    const { data: profile } = await supabase
      .from("trainer_profiles")
      .select("studio_name, timezone")
      .eq("id", user.id)
      .single();

    // Get at-risk clients
    const { data: atRiskClients } = await supabase
      .from("insights")
      .select(`
        contact_id,
        engagement_score,
        missed_sessions,
        last_activity_date,
        contacts!inner(first_name, last_name, phone)
      `)
      .eq("trainer_id", user.id)
      .lt("engagement_score", 0.5)
      .limit(10);

    // Get recent drafts
    const { data: recentDrafts } = await supabase
      .from("messages")
      .select("id, content, status, created_at")
      .eq("trainer_id", user.id)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(5);

    const systemPrompt = `You are an AI assistant for TrainU, a fitness trainer retention platform. 
You help trainers manage client relationships and engagement.

Trainer Info:
- Studio: ${profile?.studio_name || "Not set"}
- Timezone: ${profile?.timezone || "America/Chicago"}

Current Context:
- At-risk clients: ${atRiskClients?.length || 0}
- Pending drafts: ${recentDrafts?.length || 0}

When users ask about clients or request actions:
1. For questions (e.g., "Who's at risk?", "Show me Sarah's history") - answer directly with available data
2. For draft requests (e.g., "Send check-in to at-risk clients", "Draft message to Sarah") - provide a structured insight

For draft requests, respond with JSON in this format:
{
  "type": "draft_insight",
  "target": "client_name or segment",
  "reason": "why this draft is needed",
  "confidence": 0.85,
  "suggested_message": "draft content preview",
  "recipient_ids": ["contact_id1", "contact_id2"]
}

Keep responses concise, actionable, and trainer-focused.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: message },
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
      throw new Error("AI service unavailable");
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    // Try to parse as JSON for draft insights
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch {
      parsedResponse = { type: "text", content: response };
    }

    return new Response(
      JSON.stringify({
        response: parsedResponse,
        context: {
          atRiskCount: atRiskClients?.length || 0,
          draftCount: recentDrafts?.length || 0,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return handleError("assistant-chat", error);
  }
});
