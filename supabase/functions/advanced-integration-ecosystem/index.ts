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
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    // Service role client for system table writes
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { action, ...params } = await req.json();

    // Integration Management
    if (action === "create_integration") {
      const { 
        organization_id, 
        integration_type, 
        provider, 
        display_name, 
        credentials, 
        settings = {},
        webhook_url 
      } = params;
      
      const { data, error } = await supabase
        .from("integrations")
        .insert({
          organization_id,
          integration_type,
          provider,
          display_name,
          credentials,
          settings,
          webhook_url,
          webhook_secret: crypto.randomUUID(),
          status: "active",
          installed_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log event (system table)
      await supabaseAdmin
        .from("integration_events")
        .insert({
          integration_id: data.id,
          event_name: "integration_installed",
          event_data: { provider, display_name },
          severity: "info"
        });

      return new Response(
        JSON.stringify({ success: true, integration: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_integrations") {
      const { organization_id, integration_type } = params;
      
      let query = supabase
        .from("integrations")
        .select("*")
        .eq("organization_id", organization_id);

      if (integration_type) {
        query = query.eq("integration_type", integration_type);
      }

      const { data, error } = await query.order("installed_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, integrations: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update_integration") {
      const { integration_id, ...updates } = params;
      
      const { data, error } = await supabase
        .from("integrations")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", integration_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, integration: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete_integration") {
      const { integration_id } = params;
      
      const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("id", integration_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Webhook Handling
    if (action === "receive_webhook") {
      const { integration_id, event_type, payload, headers: webhookHeaders } = params;
      
      const { data, error } = await supabaseAdmin
        .from("webhook_events")
        .insert({
          integration_id,
          event_type,
          payload,
          headers: webhookHeaders || {},
          processed: false
        })
        .select()
        .single();

      if (error) throw error;

      // Process webhook asynchronously
      // In production, use a queue system

      return new Response(
        JSON.stringify({ success: true, event: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "process_webhook") {
      const { event_id } = params;
      
      const { data: event, error: fetchError } = await supabase
        .from("webhook_events")
        .select("*, integrations(*)")
        .eq("id", event_id)
        .single();

      if (fetchError) throw fetchError;

      // Process based on integration type
      // This is a simplified example
      
      const { error: updateError } = await supabase
        .from("webhook_events")
        .update({
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq("id", event_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, processed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sync Jobs
    if (action === "create_sync_job") {
      const { integration_id, sync_type, direction = "bidirectional" } = params;
      
      const { data, error } = await supabaseAdmin
        .from("sync_jobs")
        .insert({
          integration_id,
          sync_type,
          direction,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      // Start sync process
      // In production, use a background worker

      return new Response(
        JSON.stringify({ success: true, job: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_sync_status") {
      const { job_id } = params;
      
      const { data, error } = await supabase
        .from("sync_jobs")
        .select("*")
        .eq("id", job_id)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, job: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Integration Messages
    if (action === "send_integration_message") {
      const { 
        organization_id, 
        integration_id, 
        platform, 
        to_address, 
        content, 
        metadata = {} 
      } = params;
      
      const { data, error } = await supabase
        .from("integration_messages")
        .insert({
          organization_id,
          integration_id,
          direction: "outbound",
          platform,
          from_address: "system",
          to_address,
          content,
          metadata,
          status: "sent",
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_integration_messages") {
      const { organization_id, integration_id, direction } = params;
      
      let query = supabase
        .from("integration_messages")
        .select("*")
        .eq("organization_id", organization_id);

      if (integration_id) {
        query = query.eq("integration_id", integration_id);
      }
      if (direction) {
        query = query.eq("direction", direction);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, messages: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Integration Health Check
    if (action === "health_check") {
      const { organization_id } = params;
      
      const { data: integrations, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("organization_id", organization_id);

      if (error) throw error;

      const health = integrations?.map(integration => ({
        id: integration.id,
        provider: integration.provider,
        status: integration.status,
        last_sync: integration.last_sync_at,
        error_count: integration.error_count,
        health_score: integration.error_count > 5 ? "unhealthy" : "healthy"
      }));

      return new Response(
        JSON.stringify({ success: true, health }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in advanced-integration-ecosystem:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        function: "advanced-integration-ecosystem"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});