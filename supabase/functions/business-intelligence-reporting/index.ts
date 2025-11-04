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

    // Business Metrics
    if (action === "create_metric") {
      const { 
        organization_id, 
        metric_name, 
        metric_type, 
        calculation_query, 
        target_value 
      } = params;
      
      const { data, error } = await supabase
        .from("business_metrics")
        .insert({
          organization_id,
          metric_name,
          metric_type,
          calculation_query,
          target_value
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, metric: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "calculate_metrics") {
      const { organization_id } = params;
      
      const { data: metrics, error: fetchError } = await supabase
        .from("business_metrics")
        .select("*")
        .eq("organization_id", organization_id);

      if (fetchError) throw fetchError;

      // In production, execute actual SQL queries
      const calculatedMetrics = metrics?.map(metric => ({
        ...metric,
        current_value: Math.floor(Math.random() * 100),
        previous_value: Math.floor(Math.random() * 100),
        change_percentage: Math.random() * 20 - 10,
        last_calculated_at: new Date().toISOString()
      }));

      // Update metrics
      for (const metric of calculatedMetrics || []) {
        await supabase
          .from("business_metrics")
          .update({
            current_value: metric.current_value,
            previous_value: metric.previous_value,
            change_percentage: metric.change_percentage,
            last_calculated_at: metric.last_calculated_at
          })
          .eq("id", metric.id);
      }

      return new Response(
        JSON.stringify({ success: true, metrics: calculatedMetrics }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_metrics") {
      const { organization_id } = params;
      
      const { data, error } = await supabase
        .from("business_metrics")
        .select("*")
        .eq("organization_id", organization_id)
        .order("metric_name");

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, metrics: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Report Templates
    if (action === "create_report_template") {
      const { 
        organization_id, 
        name, 
        description, 
        report_type, 
        template_config, 
        metrics_included = [],
        schedule,
        format = "pdf"
      } = params;
      
      const { data, error } = await supabase
        .from("report_templates")
        .insert({
          organization_id,
          name,
          description,
          report_type,
          template_config,
          metrics_included,
          schedule,
          format,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, template: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_report_templates") {
      const { organization_id } = params;
      
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .eq("organization_id", organization_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, templates: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate Reports
    if (action === "generate_report") {
      const { organization_id, template_id, period_start, period_end } = params;
      
      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", template_id)
        .single();

      if (templateError) throw templateError;

      // Generate report data (in production, query actual data)
      const reportData = {
        title: template.name,
        period: { start: period_start, end: period_end },
        metrics: [
          { name: "Total Clients", value: 145, change: "+12%" },
          { name: "Active Clients", value: 98, change: "+5%" },
          { name: "Revenue", value: "$24,500", change: "+18%" },
          { name: "Engagement Rate", value: "87%", change: "+3%" }
        ],
        charts: [],
        insights: [
          "Client engagement is trending upward",
          "Revenue growth is accelerating"
        ]
      };

      const { data, error } = await supabase
        .from("generated_reports")
        .insert({
          organization_id,
          template_id,
          report_name: template.name,
          report_data: reportData,
          period_start,
          period_end,
          generated_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, report: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_reports") {
      const { organization_id, limit = 20 } = params;
      
      const { data, error } = await supabase
        .from("generated_reports")
        .select("*")
        .eq("organization_id", organization_id)
        .order("generated_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, reports: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Data Exports
    if (action === "create_export") {
      const { organization_id, export_type, table_name, filters = {}, format = "csv" } = params;
      
      const { data, error } = await supabase
        .from("data_exports")
        .insert({
          organization_id,
          export_type,
          table_name,
          filters,
          format,
          status: "pending",
          requested_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Process export asynchronously
      // In production, use a background worker

      return new Response(
        JSON.stringify({ success: true, export: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_exports") {
      const { organization_id } = params;
      
      const { data, error } = await supabase
        .from("data_exports")
        .select("*")
        .eq("organization_id", organization_id)
        .order("requested_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, exports: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Automated Insights
    if (action === "generate_insights") {
      const { organization_id } = params;
      
      // In production, analyze real data
      const insights = [
        {
          organization_id,
          insight_category: "engagement",
          insight_text: "Client engagement has increased by 15% this month",
          data_points: { current: 87, previous: 72 },
          trend_direction: "up",
          significance_score: 0.85,
          recommended_actions: ["Continue current engagement strategy", "Consider expanding to new channels"]
        },
        {
          organization_id,
          insight_category: "revenue",
          insight_text: "Revenue is tracking 20% above target",
          data_points: { current: 24500, target: 20000 },
          trend_direction: "up",
          significance_score: 0.92,
          recommended_actions: ["Increase capacity to handle demand", "Optimize pricing strategy"]
        }
      ];

      const { data, error } = await supabase
        .from("automated_insights")
        .insert(insights)
        .select();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, insights: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_insights") {
      const { organization_id } = params;
      
      const { data, error } = await supabase
        .from("automated_insights")
        .select("*")
        .eq("organization_id", organization_id)
        .eq("dismissed", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, insights: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Custom Dashboards
    if (action === "create_dashboard") {
      const { organization_id, name, description, layout_config, widgets } = params;
      
      const { data, error } = await supabase
        .from("custom_dashboards")
        .insert({
          organization_id,
          name,
          description,
          layout_config,
          widgets,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, dashboard: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_dashboards") {
      const { organization_id } = params;
      
      const { data, error } = await supabase
        .from("custom_dashboards")
        .select("*")
        .eq("organization_id", organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, dashboards: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in business-intelligence-reporting:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        function: "business-intelligence-reporting"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});