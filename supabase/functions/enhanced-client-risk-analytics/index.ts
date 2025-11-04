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
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const { action = 'get_analytics_dashboard' } = await req.json().catch(() => ({}));

    if (action === 'get_analytics_dashboard') {
      const { data: clientInsights } = await supabase
        .from('insights')
        .select(`
          contact_id,
          risk_score,
          engagement_score,
          last_activity_at,
          total_sessions,
          missed_sessions,
          response_rate,
          current_streak
        `)
        .eq('trainer_id', user.id)
        .order('risk_score', { ascending: false });

      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, created_at, last_message_sent_at')
        .eq('trainer_id', user.id);

      const contactsMap = new Map(contacts?.map(c => [c.id, c]) || []);

      const enrichedInsights = (clientInsights || []).map(insight => ({
        ...insight,
        contact: contactsMap.get(insight.contact_id)
      }));

      const { data: nudgeHistory } = await supabase
        .from('client_nudge_history')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: campaigns } = await supabase
        .from('nudge_campaigns')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: settings } = await supabase
        .from('nudge_settings')
        .select('*')
        .eq('trainer_id', user.id)
        .single();

      const campaignsLength = campaigns?.length || 0;
      const responsesCount = nudgeHistory?.filter(n => n.response_received).length || 0;

      const analytics = {
        total_clients: enrichedInsights.length || 0,
        high_risk_clients: enrichedInsights.filter(c => c.risk_score >= 60).length || 0,
        medium_risk_clients: enrichedInsights.filter(c => c.risk_score >= 40 && c.risk_score < 60).length || 0,
        low_risk_clients: enrichedInsights.filter(c => c.risk_score < 40).length || 0,
        total_nudge_campaigns: campaignsLength,
        campaigns_sent: campaigns?.filter(c => c.status === 'sent' || c.status === 'delivered').length || 0,
        campaigns_scheduled: campaigns?.filter(c => c.status === 'scheduled').length || 0,
        successful_responses: responsesCount,
        response_rate: campaignsLength > 0 
          ? Math.round((responsesCount / campaignsLength) * 100) 
          : 0,
        bookings_generated: nudgeHistory?.filter(n => n.booking_generated).length || 0,
        total_revenue_attributed: nudgeHistory?.reduce((sum, n) => sum + (n.revenue_attributed || 0), 0) || 0
      };

      return new Response(
        JSON.stringify({
          success: true,
          client_analytics: enrichedInsights,
          nudge_campaigns: campaigns || [],
          nudge_history: nudgeHistory || [],
          settings: settings || null,
          analytics_summary: analytics
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in enhanced-client-risk-analytics:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
