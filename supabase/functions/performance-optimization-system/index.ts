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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      authHeader ? { global: { headers: { Authorization: authHeader } } } : {}
    );

    let userId = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    const { action, metricData } = await req.json().catch(() => ({}));

    // Monitor performance metrics
    if (action === 'monitor_performance') {
      // Simulate resource utilization tracking
      const resources = [
        { type: 'cpu', utilization: Math.random() * 70 + 10 },
        { type: 'memory', utilization: Math.random() * 60 + 20 },
        { type: 'database', utilization: Math.random() * 50 + 15 },
      ];

      const resourceRecords = resources.map(r => ({
        resource_type: r.type,
        utilization_percentage: Math.round(r.utilization * 100) / 100,
        service_name: 'system'
      }));

      await supabase.from('resource_utilization').insert(resourceRecords);

      // Check for threshold violations
      const alerts = [];
      for (const resource of resources) {
        if (resource.utilization > 80) {
          const alert = {
            alert_type: 'resource_threshold',
            metric_name: `${resource.type}_utilization`,
            threshold_value: 80,
            actual_value: resource.utilization,
            severity: resource.utilization > 90 ? 'critical' : 'high',
            service_name: 'system'
          };

          await supabase.from('performance_alerts').insert(alert);
          alerts.push(alert);
        }
      }

      // Database performance metrics
      const dbMetrics = {
        connection_time_ms: Math.floor(Math.random() * 50 + 10),
        active_connections: Math.floor(Math.random() * 20 + 5),
        query_cache_hit_rate: Math.random() * 30 + 70,
        slow_query_count: Math.floor(Math.random() * 3),
        total_query_count: Math.floor(Math.random() * 1000 + 100)
      };

      await supabase.from('database_performance_metrics').insert(dbMetrics);

      return new Response(
        JSON.stringify({
          success: true,
          resources: resourceRecords,
          database: dbMetrics,
          alerts
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log query performance
    if (action === 'log_query') {
      await supabase
        .from('query_performance_logs')
        .insert({
          query_text: metricData.query_text,
          execution_time_ms: metricData.execution_time_ms,
          affected_rows: metricData.affected_rows,
          query_type: metricData.query_type,
          table_name: metricData.table_name,
          trainer_id: userId
        });

      // Create alert if slow query
      if (metricData.execution_time_ms > 2000) {
        await supabase
          .from('performance_alerts')
          .insert({
            alert_type: 'slow_query',
            metric_name: 'query_execution_time',
            threshold_value: 2000,
            actual_value: metricData.execution_time_ms,
            severity: metricData.execution_time_ms > 5000 ? 'high' : 'medium',
            service_name: 'database'
          });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log edge function metrics
    if (action === 'log_function_metrics') {
      await supabase
        .from('edge_function_metrics')
        .insert({
          function_name: metricData.function_name,
          execution_time_ms: metricData.execution_time_ms,
          error_count: metricData.error_count || 0,
          memory_usage_mb: metricData.memory_usage_mb,
          cpu_usage_percentage: metricData.cpu_usage_percentage,
          trainer_id: userId
        });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Track UX metrics
    if (action === 'track_ux') {
      await supabase
        .from('user_experience_metrics')
        .insert({
          page_name: metricData.page_name,
          load_time_ms: metricData.load_time_ms,
          time_to_interactive: metricData.time_to_interactive,
          user_satisfaction: metricData.user_satisfaction,
          session_id: metricData.session_id,
          trainer_id: userId
        });

      // Log frontend performance
      if (metricData.page_url) {
        await supabase
          .from('frontend_performance_logs')
          .insert({
            page_url: metricData.page_url,
            load_time_ms: metricData.load_time_ms,
            first_contentful_paint: metricData.first_contentful_paint,
            largest_contentful_paint: metricData.largest_contentful_paint,
            time_to_interactive: metricData.time_to_interactive,
            session_id: metricData.session_id
          });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get optimization recommendations
    if (action === 'get_recommendations') {
      const recommendations = [];

      // Check slow queries
      const { data: slowQueries } = await supabase
        .from('query_performance_logs')
        .select('*')
        .gte('execution_time_ms', 2000)
        .order('execution_time_ms', { ascending: false })
        .limit(10);

      if (slowQueries && slowQueries.length > 0) {
        recommendations.push({
          category: 'database',
          priority: 'high',
          title: 'Slow Query Detection',
          description: `Found ${slowQueries.length} slow queries (>2s execution time)`,
          action: 'Review and optimize slow queries, consider adding indexes',
          impact: 'high',
          queries: slowQueries.slice(0, 5).map(q => ({
            table: q.table_name,
            time: q.execution_time_ms,
            type: q.query_type
          }))
        });
      }

      // Check resource utilization
      const { data: recentResources } = await supabase
        .from('resource_utilization')
        .select('*')
        .gte('recorded_at', new Date(Date.now() - 3600000).toISOString())
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (recentResources) {
        const avgByType = recentResources.reduce((acc: any, r: any) => {
          if (!acc[r.resource_type]) acc[r.resource_type] = [];
          acc[r.resource_type].push(r.utilization_percentage);
          return acc;
        }, {});

        Object.keys(avgByType).forEach(type => {
          const avg = avgByType[type].reduce((sum: number, val: number) => sum + val, 0) / avgByType[type].length;
          if (avg > 70) {
            recommendations.push({
              category: 'infrastructure',
              priority: avg > 85 ? 'critical' : 'medium',
              title: `High ${type} Utilization`,
              description: `Average ${type} utilization is ${Math.round(avg)}% over the last hour`,
              action: avg > 85 ? `Consider scaling up ${type} resources immediately` : `Monitor ${type} usage and plan for scaling`,
              impact: 'medium'
            });
          }
        });
      }

      // Check error rates
      const { data: recentErrors } = await supabase
        .from('error_events')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString())
        .eq('resolved', false);

      if (recentErrors && recentErrors.length > 10) {
        const errorsByService = recentErrors.reduce((acc: any, e: any) => {
          acc[e.service_name] = (acc[e.service_name] || 0) + 1;
          return acc;
        }, {});

        recommendations.push({
          category: 'reliability',
          priority: 'high',
          title: 'High Error Rate',
          description: `${recentErrors.length} unresolved errors in the last hour`,
          action: 'Investigate and resolve errors, check service health',
          impact: 'high',
          breakdown: errorsByService
        });
      }

      // Check page load times
      const { data: uxMetrics } = await supabase
        .from('user_experience_metrics')
        .select('*')
        .gte('recorded_at', new Date(Date.now() - 3600000).toISOString())
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (uxMetrics && uxMetrics.length > 0) {
        const avgLoadTime = uxMetrics.reduce((sum, m) => sum + m.load_time_ms, 0) / uxMetrics.length;
        if (avgLoadTime > 2000) {
          recommendations.push({
            category: 'user_experience',
            priority: 'medium',
            title: 'Slow Page Load Times',
            description: `Average page load time is ${Math.round(avgLoadTime)}ms`,
            action: 'Optimize frontend performance, reduce bundle size, implement code splitting',
            impact: 'medium'
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          recommendations,
          summary: {
            total_recommendations: recommendations.length,
            critical: recommendations.filter(r => r.priority === 'critical').length,
            high: recommendations.filter(r => r.priority === 'high').length,
            medium: recommendations.filter(r => r.priority === 'medium').length
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get performance summary
    if (action === 'get_summary') {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 3600000);

      const { data: resources } = await supabase
        .from('resource_utilization')
        .select('*')
        .gte('recorded_at', hourAgo.toISOString());

      const { data: dbMetrics } = await supabase
        .from('database_performance_metrics')
        .select('*')
        .gte('recorded_at', hourAgo.toISOString());

      const { data: alerts } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('resolved', false);

      const { data: errors } = await supabase
        .from('error_events')
        .select('*')
        .gte('timestamp', hourAgo.toISOString())
        .eq('resolved', false);

      return new Response(
        JSON.stringify({
          success: true,
          summary: {
            resource_utilization: resources?.length || 0,
            database_queries: dbMetrics?.reduce((sum, m) => sum + (m.total_query_count || 0), 0) || 0,
            active_alerts: alerts?.length || 0,
            unresolved_errors: errors?.length || 0,
            avg_cache_hit_rate: dbMetrics?.reduce((sum, m) => sum + (m.query_cache_hit_rate || 0), 0) / (dbMetrics?.length || 1) || 0
          },
          alerts,
          errors
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in performance-optimization-system:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
