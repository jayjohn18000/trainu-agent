import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, templateId, preview } = await req.json();
    
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    // Create message in the database
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        trainer_id: user.id,
        contact_id: clientId,
        content: preview,
        channel: "sms",
        status: "sent",
      })
      .select("id")
      .single();

    if (messageError) {
      console.error("Error creating message:", messageError);
      throw new Error("Failed to create message");
    }

    console.log(JSON.stringify({
      function: "client-nudge",
      action: "nudge_sent",
      messageId: message.id,
      trainerId: user.id,
      contactId: clientId,
      timestamp: new Date().toISOString(),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        messageId: message.id,
        clientId,
        message: "Nudge sent successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in client-nudge:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
