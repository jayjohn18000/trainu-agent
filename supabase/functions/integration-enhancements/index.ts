import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const eventDataSchema = z.object({
  event_name: z.string().min(1).max(100),
  properties: z.record(z.any()).optional(),
  trainer_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  source: z.string().max(50).optional(),
  session_id: z.string().max(100).optional(),
  ip_address: z.string().max(45).optional(),
  user_agent: z.string().max(500).optional(),
});

const errorDataSchema = z.object({
  service_name: z.string().min(1).max(100),
  error_type: z.string().min(1).max(100),
  error_message: z.string().min(1).max(1000),
  stack_trace: z.string().max(5000).optional(),
  user_context: z.record(z.any()).optional(),
  request_context: z.record(z.any()).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  trainer_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
});

const integrationSchema = z.object({
  action: z.enum(['track_event', 'log_error', 'check_health', 'check_endpoints', 'get_errors', 'get_alerts']),
  eventData: eventDataSchema.optional(),
  errorData: errorDataSchema.optional(),
  healthData: z.record(z.any()).optional(),
});

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

    const body = await req.json().catch(() => ({}));
    
    // Validate input
    const validation = integrationSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.format() }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { action, eventData, errorData, healthData } = validation.data;

    // Track analytics event
    if (action === 'track_event') {
      if (!eventData) {
        return new Response(
          JSON.stringify({ error: "eventData is required for track_event action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const { data: event } = await supabase
        .from('analytics_events')
        .insert({
          event_name: eventData.event_name,
          properties: eventData.properties || {},
          user_id: userId,
          trainer_id: eventData.trainer_id || userId,
          client_id: eventData.client_id,
          source: eventData.source || 'posthog',
          session_id: eventData.session_id,
          ip_address: eventData.ip_address,
          user_agent: eventData.user_agent
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ success: true, event }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log error event
    if (action === 'log_error') {
      if (!errorData) {
        return new Response(
          JSON.stringify({ error: "errorData is required for log_error action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const { data: error } = await supabase
        .from('error_events')
        .insert({
          service_name: errorData.service_name,
          error_type: errorData.error_type,
          error_message: errorData.error_message,
          stack_trace: errorData.stack_trace,
          user_context: errorData.user_context || {},
          request_context: errorData.request_context || {},
          severity: errorData.severity || 'medium',
          trainer_id: errorData.trainer_id || userId,
          client_id: errorData.client_id
        })
        .select()
        .single();

      // Create alert if high or critical severity
      if (errorData.severity === 'high' || errorData.severity === 'critical') {
        await supabase
          .from('performance_alerts')
          .insert({
            alert_type: 'error_threshold',
            metric_name: 'error_rate',
            threshold_value: 1,
            actual_value: 1,
            severity: errorData.severity,
            service_name: errorData.service_name
          });
      }

      return new Response(
        JSON.stringify({ success: true, error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check system health
    if (action === 'check_health') {
      const services = [
        { name: 'database', endpoint: Deno.env.get("SUPABASE_URL") },
        { name: 'auth', endpoint: `${Deno.env.get("SUPABASE_URL")}/auth/v1/health` },
      ];

      const healthChecks = await Promise.all(
        services.map(async (service) => {
          const startTime = Date.now();
          try {
            const response = await fetch(service.endpoint + '/health', {
              method: 'GET',
              signal: AbortSignal.timeout(5000)
            });
            
            const responseTime = Date.now() - startTime;
            const status = response.ok ? 'healthy' : 'degraded';
            const healthScore = response.ok ? 100 : 50;

            await supabase
              .from('system_health_metrics')
              .insert({
                service_name: service.name,
                status,
                response_time_ms: responseTime,
                health_score: healthScore,
                details: { status_code: response.status }
              });

            return {
              service: service.name,
              status,
              response_time_ms: responseTime,
              health_score: healthScore
            };
          } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            await supabase
              .from('system_health_metrics')
              .insert({
                service_name: service.name,
                status: 'unhealthy',
                response_time_ms: Date.now() - startTime,
                health_score: 0,
                details: { error: errMsg }
              });

            return {
              service: service.name,
              status: 'unhealthy',
              response_time_ms: Date.now() - startTime,
              health_score: 0,
              error: errMsg
            };
          }
        })
      );

      const overallHealth = healthChecks.every(h => h.status === 'healthy') ? 'healthy' :
                           healthChecks.some(h => h.status === 'unhealthy') ? 'unhealthy' : 'degraded';

      return new Response(
        JSON.stringify({
          success: true,
          overall_health: overallHealth,
          services: healthChecks
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check API endpoints
    if (action === 'check_endpoints') {
      const { data: endpoints } = await supabase
        .from('api_endpoint_status')
        .select('*')
        .order('last_check', { ascending: false });

      // Update endpoint statuses
      if (endpoints && endpoints.length > 0) {
        for (const endpoint of endpoints) {
          const startTime = Date.now();
          try {
            const response = await fetch(endpoint.endpoint, {
              method: 'HEAD',
              signal: AbortSignal.timeout(5000)
            });
            
            const responseTime = Date.now() - startTime;
            
            await supabase
              .from('api_endpoint_status')
              .update({
                status: response.status,
                response_time_ms: responseTime,
                last_successful: response.ok ? new Date().toISOString() : endpoint.last_successful,
                consecutive_failures: response.ok ? 0 : endpoint.consecutive_failures + 1,
                last_check: new Date().toISOString()
              })
              .eq('id', endpoint.id);

          } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            await supabase
              .from('api_endpoint_status')
              .update({
                status: 0,
                consecutive_failures: endpoint.consecutive_failures + 1,
                last_check: new Date().toISOString(),
                details: { error: errMsg }
              })
              .eq('id', endpoint.id);
          }
        }
      }

      const { data: updated } = await supabase
        .from('api_endpoint_status')
        .select('*')
        .order('last_check', { ascending: false });

      return new Response(
        JSON.stringify({ success: true, endpoints: updated }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get error summary
    if (action === 'get_errors') {
      const { data: errors } = await supabase
        .from('error_events')
        .select('*')
        .eq('resolved', false)
        .order('timestamp', { ascending: false })
        .limit(50);

      const errorsByService = errors?.reduce((acc: any, error: any) => {
        acc[error.service_name] = (acc[error.service_name] || 0) + 1;
        return acc;
      }, {});

      const errorsBySeverity = errors?.reduce((acc: any, error: any) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {});

      return new Response(
        JSON.stringify({
          success: true,
          errors,
          summary: {
            total: errors?.length || 0,
            by_service: errorsByService,
            by_severity: errorsBySeverity
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get performance alerts
    if (action === 'get_alerts') {
      const { data: alerts } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      return new Response(
        JSON.stringify({ success: true, alerts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.error(JSON.stringify({
      function: 'integration-enhancements',
      errorId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }));
    
    return new Response(
      JSON.stringify({ 
        error: 'An internal error occurred. Please contact support if the issue persists.',
        errorId 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
