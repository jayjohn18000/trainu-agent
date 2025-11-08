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
    const { trainerId } = await req.json();

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

    // Get contacts (limit to 10 for first draft)
    const { data: contacts, error: contactsError } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, phone")
      .eq("trainer_id", trainerId)
      .limit(10);

    if (contactsError) throw contactsError;
    if (!contacts || contacts.length === 0) {
      throw new Error("No contacts found to create draft");
    }

    // Generate draft message using Lovable AI
    const prompt = `Create a warm, friendly welcome check-in message for a fitness trainer's clients. Keep it under 160 characters (SMS length). Include:
- Brief greeting
- Quick check-in question (1-10 scale on how sessions are feeling)
- Ask about any blockers
- Mention reschedule option

Tone: Professional but warm, concise, action-oriented.
Studio name: ${profile?.studio_name || "our studio"}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a fitness trainer assistant helping draft client messages." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("Failed to generate message");
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;

    // Create draft messages for each contact
    const draftMessages = contacts.map((contact) => ({
      trainer_id: trainerId,
      contact_id: contact.id,
      content: generatedContent,
      status: "draft",
      channel: "sms",
      confidence: 0.85,
      requires_approval: true,
    }));

    const { error: insertError } = await supabase
      .from("messages")
      .insert(draftMessages);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        count: contacts.length,
        message: `Created ${contacts.length} welcome draft messages`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating welcome draft:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
