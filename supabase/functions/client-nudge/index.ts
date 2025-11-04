import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const nudgeSchema = z.object({
  clientId: z.string().uuid({ message: "clientId must be a valid UUID" }),
  templateId: z.string().min(1, { message: "templateId is required" }).max(100),
  preview: z.string().min(1, { message: "preview is required" }).max(1000),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validation = nudgeSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.format() }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const { clientId, templateId, preview } = validation.data;
    
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
