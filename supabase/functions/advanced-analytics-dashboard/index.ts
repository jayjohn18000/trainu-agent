import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Client lifecycle stage detection
function detectLifecycleStage(client: any, bookings: any[], messages: any[]) {
  const now = new Date();
  const daysSinceCreated = Math.floor((now.getTime() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const totalBookings = bookings?.length || 0;
  const completedBookings = bookings?.filter((b: any) => b.status === 'completed').length || 0;
  
  const lastBooking = bookings?.[0];
  const daysSinceLastBooking = lastBooking
    ? Math.floor((now.getTime() - new Date(lastBooking.scheduled_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const recentMessages = messages?.filter((m: any) => {
    const daysSince = Math.floor((now.getTime() - new Date(m.created_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 30;
  }).length || 0;

  let stage = 'acquisition';
  let confidence = 0.7;
  let riskScore = 0;
  let engagementScore = 50;

  if (daysSinceCreated <= 7 && totalBookings === 0) {
    stage = 'acquisition';
    confidence = 0.85;
  } else if (daysSinceCreated <= 30 && totalBookings <= 3) {
    stage = 'onboarding';
    confidence = 0.8;
    engagementScore = 60;
  } else if (completedBookings >= 3 && daysSinceLastBooking <= 14) {
    stage = 'engagement';
    confidence = 0.9;
    engagementScore = 75;
  } else if (completedBookings >= 5 && daysSinceLastBooking <= 30) {
    stage = 'retention';
    confidence = 0.85;
    engagementScore = 80;
  } else if (daysSinceLastBooking > 30 && daysSinceLastBooking <= 60) {
    stage = 'churn_risk';
    confidence = 0.75;
    riskScore = 60;
    engagementScore = 30;
  } else if (daysSinceLastBooking > 60) {
    stage = 'reactivation';
    confidence = 0.8;
    riskScore = 80;
    engagementScore = 15;
  }

  // Adjust based on message engagement
  if (recentMessages >= 5) {
    engagementScore += 15;
    riskScore = Math.max(0, riskScore - 20);
  } else if (recentMessages === 0) {
    engagementScore -= 20;
    riskScore += 15;
  }

  return {
    stage,
    confidence: Math.min(1, confidence),
    riskScore: Math.min(100, Math.max(0, riskScore)),
    engagementScore: Math.min(100, Math.max(0, engagementScore)),
    daysInStage: daysSinceCreated,
    indicators: {
      totalBookings,
      completedBookings,
      daysSinceLastBooking,
      recentMessages,
      daysSinceCreated
    }
  };
}

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

    const { action } = await req.json().catch(() => ({ action: 'get_dashboard' }));

    // Get comprehensive dashboard analytics
    if (action === 'get_dashboard') {
      // Get all clients
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('consent_status', 'active');

      // Process lifecycle analytics for each client
      const lifecycleData = await Promise.all(
        (contacts || []).map(async (contact) => {
          const { data: bookings } = await supabase
            .from('bookings')
            .select('*')
            .eq('contact_id', contact.id)
            .order('scheduled_at', { ascending: false });

          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('contact_id', contact.id)
            .order('created_at', { ascending: false });

          const lifecycle = detectLifecycleStage(contact, bookings || [], messages || []);

          // Upsert lifecycle analytics
          await supabase
            .from('lifecycle_analytics')
            .upsert({
              client_id: contact.id,
              trainer_id: user.id,
              current_stage: lifecycle.stage,
              stage_confidence: lifecycle.confidence,
              days_in_stage: lifecycle.daysInStage,
              risk_score: lifecycle.riskScore,
              engagement_score: lifecycle.engagementScore,
              key_indicators: lifecycle.indicators,
              lifecycle_metrics: lifecycle.indicators,
              updated_at: new Date().toISOString()
            }, { onConflict: 'client_id,trainer_id' });

          return {
            contact_id: contact.id,
            first_name: contact.first_name,
            last_name: contact.last_name,
            ...lifecycle
          };
        })
      );

      // Calculate aggregate metrics
      const stageBreakdown = lifecycleData.reduce((acc: any, client) => {
        acc[client.stage] = (acc[client.stage] || 0) + 1;
        return acc;
      }, {});

      const avgEngagement = lifecycleData.reduce((sum, c) => sum + c.engagementScore, 0) / lifecycleData.length || 0;
      const highRiskCount = lifecycleData.filter(c => c.riskScore >= 60).length;

      // Get trainer performance metrics
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('trainer_id', user.id)
        .gte('created_at', weekStart.toISOString());

      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('trainer_id', user.id)
        .gte('created_at', weekStart.toISOString());

      const performanceMetrics = {
        weekly_messages: recentMessages?.length || 0,
        weekly_bookings: recentBookings?.length || 0,
        avg_engagement_score: Math.round(avgEngagement),
        active_clients: lifecycleData.filter(c => c.stage === 'engagement' || c.stage === 'retention').length,
        at_risk_clients: highRiskCount
      };

      // Generate predictive insights for high-risk clients
      const predictions = lifecycleData
        .filter(c => c.riskScore >= 50)
        .map(client => {
          const churnRisk = client.riskScore / 100;
          const recommendedActions = [];

          if (client.indicators.daysSinceLastBooking > 30) {
            recommendedActions.push('Schedule a check-in call');
          }
          if (client.indicators.recentMessages === 0) {
            recommendedActions.push('Send personalized message');
          }
          if (client.indicators.totalBookings === 0) {
            recommendedActions.push('Offer introductory session');
          }

          return {
            client_id: client.contact_id,
            client_name: `${client.first_name} ${client.last_name}`,
            prediction_type: 'churn_risk',
            prediction_value: churnRisk,
            confidence_level: client.confidence,
            timeframe_days: 30,
            recommended_actions: recommendedActions
          };
        });

      // Store predictions
      if (predictions.length > 0) {
        await supabase
          .from('predictive_insights')
          .insert(
            predictions.map(p => ({
              ...p,
              trainer_id: user.id,
              model_version: 'v1.0',
              prediction_factors: { lifecycle_based: true }
            }))
          );
      }

      // Track engagement trends
      await supabase
        .from('engagement_trends')
        .upsert({
          trainer_id: user.id,
          date: now.toISOString().split('T')[0],
          total_events: (recentMessages?.length || 0) + (recentBookings?.length || 0),
          message_count: recentMessages?.length || 0,
          meeting_count: recentBookings?.length || 0,
          engagement_rate: avgEngagement,
          breakdown: stageBreakdown
        }, { onConflict: 'trainer_id,date' });

      return new Response(
        JSON.stringify({
          success: true,
          lifecycle_analytics: lifecycleData,
          stage_breakdown: stageBreakdown,
          performance_metrics: performanceMetrics,
          predictions,
          summary: {
            total_clients: lifecycleData.length,
            avg_engagement: Math.round(avgEngagement),
            high_risk_count: highRiskCount,
            stages: stageBreakdown
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get trainer performance over time
    if (action === 'get_performance_trends') {
      const { data: trends } = await supabase
        .from('engagement_trends')
        .select('*')
        .eq('trainer_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      const { data: performanceMetrics } = await supabase
        .from('trainer_performance_metrics')
        .select('*')
        .eq('trainer_id', user.id)
        .order('period_start', { ascending: false })
        .limit(12);

      return new Response(
        JSON.stringify({
          success: true,
          engagement_trends: trends,
          performance_metrics: performanceMetrics
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get predictive insights
    if (action === 'get_predictions') {
      const { data: predictions } = await supabase
        .from('predictive_insights')
        .select(`
          *,
          contact:contacts(first_name, last_name, email)
        `)
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      return new Response(
        JSON.stringify({
          success: true,
          predictions
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in advanced-analytics-dashboard:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
