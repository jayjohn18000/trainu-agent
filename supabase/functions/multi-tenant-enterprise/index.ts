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

    const { action, ...params } = await req.json();

    // Organization Management
    if (action === "create_organization") {
      const { name, slug, plan_tier = "free", billing_email } = params;
      
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name,
          slug,
          plan_tier,
          billing_email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create default admin role
      const { data: adminRole, error: roleError } = await supabase
        .from("roles")
        .insert({
          organization_id: org.id,
          name: "Admin",
          description: "Full access to all organization features",
          permissions: ["*"],
          is_system_role: true
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Add creator as admin
      await supabase
        .from("organization_users")
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role_id: adminRole.id,
          status: "active"
        });

      return new Response(
        JSON.stringify({ success: true, organization: org }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_organization") {
      const { organization_id } = params;
      
      const { data: org, error } = await supabase
        .from("organizations")
        .select(`
          *,
          organization_users(count),
          subscription_usage(*)
        `)
        .eq("id", organization_id)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, organization: org }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update_organization") {
      const { organization_id, ...updates } = params;
      
      const { data, error } = await supabase
        .from("organizations")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", organization_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, organization: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Team Management
    if (action === "invite_user") {
      const { organization_id, email, role_id } = params;
      
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const { data, error } = await supabase
        .from("organization_invitations")
        .insert({
          organization_id,
          email,
          role_id,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString(),
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Send invitation email

      return new Response(
        JSON.stringify({ success: true, invitation: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_team_members") {
      const { organization_id } = params;
      
      const { data, error } = await supabase
        .from("organization_users")
        .select(`
          *,
          roles(name, permissions)
        `)
        .eq("organization_id", organization_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, members: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "remove_user") {
      const { organization_id, user_id: target_user_id } = params;
      
      const { error } = await supabase
        .from("organization_users")
        .delete()
        .eq("organization_id", organization_id)
        .eq("user_id", target_user_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Role Management
    if (action === "create_role") {
      const { organization_id, name, description, permissions } = params;
      
      const { data, error } = await supabase
        .from("roles")
        .insert({
          organization_id,
          name,
          description,
          permissions: permissions || [],
          is_system_role: false
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, role: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_roles") {
      const { organization_id } = params;
      
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("organization_id", organization_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, roles: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // API Key Management
    if (action === "create_api_key") {
      const { organization_id, name, permissions = [], rate_limit = 1000, expires_days } = params;
      
      const apiKey = `sk_${crypto.randomUUID().replace(/-/g, '')}`;
      const keyPrefix = apiKey.substring(0, 12);
      
      // In production, hash the key properly
      const keyHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(apiKey)
      ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

      let expiresAt = null;
      if (expires_days) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expires_days);
      }

      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          organization_id,
          name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          permissions,
          rate_limit,
          expires_at: expiresAt?.toISOString(),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          api_key: apiKey, // Only show once
          key_info: data 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_api_keys") {
      const { organization_id } = params;
      
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix, rate_limit, last_used_at, expires_at, created_at")
        .eq("organization_id", organization_id)
        .is("revoked_at", null);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, api_keys: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "revoke_api_key") {
      const { key_id } = params;
      
      const { error } = await supabase
        .from("api_keys")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", key_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Usage Tracking
    if (action === "get_usage") {
      const { organization_id, period_start, period_end } = params;
      
      let query = supabase
        .from("subscription_usage")
        .select("*")
        .eq("organization_id", organization_id);

      if (period_start) query = query.gte("period_start", period_start);
      if (period_end) query = query.lte("period_end", period_end);

      const { data, error } = await query.order("period_start", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, usage: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "record_usage") {
      const { organization_id, messages_sent = 0, ai_requests = 0, api_calls = 0 } = params;
      
      const today = new Date();
      const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("subscription_usage")
        .upsert({
          organization_id,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          messages_sent,
          ai_requests,
          api_calls,
          recorded_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id,period_start',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, usage: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in multi-tenant-enterprise:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        function: "multi-tenant-enterprise"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});