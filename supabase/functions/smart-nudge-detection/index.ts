import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClientRiskProfile {
  contact_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  last_message_sent_at?: string;
  messages_sent_this_week: number;
  last_booking_at?: string;
  missed_sessions: number;
  total_sessions: number;
  response_rate: number;
  current_streak: number;
  days_since_last_contact: number;
  days_since_last_booking: number;
  engagement_decline_rate: number;
  risk_score: number;
  nudge_eligibility: 'high' | 'medium' | 'low' | 'none';
  recommended_nudge_type: string;
  optimal_timing: string;
  urgency_level: 1 | 2 | 3 | 4 | 5;
}

const NUDGE_TEMPLATES = [
  {
    id: 'check_in_general',
    type: 'check_in',
    priority: 1,
    triggers: ['no_contact_7_days', 'engagement_decline'],
    content_template: "Hey {first_name}! 👋 Just checking in - how have you been feeling about your fitness journey lately? Any challenges I can help you work through?",
    personalization_fields: ['first_name'],
    optimal_days: [1, 2, 3, 4, 5],
    optimal_hours: [9, 10, 11, 14, 15, 16],
    followup_delay_hours: 72,
    max_frequency_per_week: 2
  },
  {
    id: 'booking_reminder_gentle',
    type: 'booking_reminder',
    priority: 2,
    triggers: ['no_booking_14_days', 'missed_last_session'],
    content_template: "Hi {first_name}! 💪 I noticed it's been a while since we last trained together. Ready to get back into your routine? I have some availability this week if you'd like to schedule!",
    personalization_fields: ['first_name'],
    optimal_days: [0, 1, 2, 3, 4],
    optimal_hours: [9, 10, 11, 18, 19, 20],
    followup_delay_hours: 96,
    max_frequency_per_week: 1
  },
  {
    id: 'motivation_momentum',
    type: 'motivation',
    priority: 3,
    triggers: ['progress_stalled', 'low_engagement'],
    content_template: "Remember {first_name}, every small step counts! 🌟 You've made great progress before - let's discuss what would help you feel motivated again. What's one thing you're proud of from your fitness journey?",
    personalization_fields: ['first_name'],
    optimal_days: [1, 2, 3, 4, 5],
    optimal_hours: [8, 9, 17, 18, 19],
    followup_delay_hours: 120,
    max_frequency_per_week: 1
  }
];

function calculateAdvancedRiskScore(client: any, bookings: any[], messages: any[]): number {
  const now = new Date();
  let risk = 0;

  // 1. Recency factors (40% weight)
  const daysSinceLastMessage = client.last_message_sent_at
    ? Math.floor((now.getTime() - new Date(client.last_message_sent_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const lastBooking = bookings.sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0];
  const daysSinceLastBooking = lastBooking
    ? Math.floor((now.getTime() - new Date(lastBooking.scheduled_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  risk += Math.min(40, daysSinceLastMessage * 2);
  risk += Math.min(30, daysSinceLastBooking * 1.5);

  // 2. Engagement pattern analysis (25% weight)
  const recentMessages = messages.filter(m => {
    const messageDate = new Date(m.created_at);
    const daysAgo = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo <= 30;
  });

  const messagingFrequency = recentMessages.length / 30;
  const expectedFrequency = 0.2;

  if (messagingFrequency < expectedFrequency * 0.5) {
    risk += 15;
  } else if (messagingFrequency < expectedFrequency) {
    risk += 8;
  }

  // 3. Booking patterns (20% weight)
  const recentBookings = bookings.filter(b => {
    const bookingDate = new Date(b.scheduled_at);
    const daysAgo = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo <= 30;
  });

  const missedBookings = bookings.filter(b => b.status === 'no_show' || b.status === 'cancelled');
  const missedRate = bookings.length > 0 ? missedBookings.length / bookings.length : 0;

  risk += missedRate * 15;

  if (recentBookings.length === 0 && bookings.length > 0) {
    risk += 10;
  }

  return Math.min(100, Math.max(0, Math.round(risk)));
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
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const { action = 'analyze_all', client_ids } = await req.json().catch(() => ({}));

    if (action === 'analyze_all') {
      const { data: contacts, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .eq("trainer_id", user.id)
        .eq("consent_status", "active");

      if (contactsError) {
        throw new Error(`Failed to fetch contacts: ${contactsError.message}`);
      }

      const riskProfiles: ClientRiskProfile[] = [];
      const nudgeCandidates: any[] = [];

      for (const contact of contacts || []) {
        const { data: bookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("contact_id", contact.id)
          .order("scheduled_at", { ascending: false });

        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .eq("contact_id", contact.id)
          .order("created_at", { ascending: false });

        const riskScore = calculateAdvancedRiskScore(contact, bookings || [], messages || []);

        const now = new Date();
        const daysSinceLastMessage = contact.last_message_sent_at
          ? Math.floor((now.getTime() - new Date(contact.last_message_sent_at).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        const lastBooking = (bookings || []).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0];
        const daysSinceLastBooking = lastBooking
          ? Math.floor((now.getTime() - new Date(lastBooking.scheduled_at).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        let eligibility: 'high' | 'medium' | 'low' | 'none' = 'none';
        let nudgeType = '';
        let urgency: 1 | 2 | 3 | 4 | 5 = 1;

        if (riskScore >= 80) {
          eligibility = 'high';
          nudgeType = 'booking_reminder';
          urgency = 5;
        } else if (riskScore >= 60) {
          eligibility = 'high';
          nudgeType = 'check_in';
          urgency = 4;
        } else if (riskScore >= 40) {
          eligibility = 'medium';
          nudgeType = 'motivation';
          urgency = 3;
        } else if (riskScore >= 20) {
          eligibility = 'low';
          nudgeType = 'check_in';
          urgency = 2;
        }

        const riskProfile: ClientRiskProfile = {
          contact_id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          tags: contact.tags,
          last_message_sent_at: contact.last_message_sent_at,
          messages_sent_this_week: contact.messages_sent_this_week || 0,
          last_booking_at: lastBooking?.scheduled_at,
          missed_sessions: (bookings || []).filter(b => b.status === 'no_show').length,
          total_sessions: (bookings || []).filter(b => b.status === 'completed').length,
          response_rate: 0,
          current_streak: 0,
          days_since_last_contact: daysSinceLastMessage,
          days_since_last_booking: daysSinceLastBooking,
          engagement_decline_rate: Math.max(0, (daysSinceLastMessage - 7) / 7),
          risk_score: riskScore,
          nudge_eligibility: eligibility,
          recommended_nudge_type: nudgeType,
          optimal_timing: 'within 24 hours',
          urgency_level: urgency
        };

        riskProfiles.push(riskProfile);

        if (eligibility !== 'none') {
          nudgeCandidates.push({
            ...riskProfile,
            template_id: `${nudgeType}_${eligibility}`,
            priority_score: riskScore + (urgency * 10)
          });
        }

        await supabase
          .from("insights")
          .upsert({
            trainer_id: user.id,
            contact_id: contact.id,
            risk_score: riskScore,
            last_activity_at: contact.last_message_sent_at,
            total_sessions: riskProfile.total_sessions,
            missed_sessions: riskProfile.missed_sessions,
            response_rate: riskProfile.response_rate,
            current_streak: riskProfile.current_streak,
            engagement_score: Math.max(0, 100 - riskScore),
            updated_at: new Date().toISOString()
          }, { onConflict: 'trainer_id,contact_id' });
      }

      nudgeCandidates.sort((a, b) => b.priority_score - a.priority_score);

      return new Response(
        JSON.stringify({
          success: true,
          risk_profiles: riskProfiles,
          nudge_candidates: nudgeCandidates.slice(0, 20),
          summary: {
            total_analyzed: contacts?.length || 0,
            high_risk: riskProfiles.filter(p => p.nudge_eligibility === 'high').length,
            medium_risk: riskProfiles.filter(p => p.nudge_eligibility === 'medium').length,
            low_risk: riskProfiles.filter(p => p.nudge_eligibility === 'low').length,
            templates_available: NUDGE_TEMPLATES.length
          }
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
    console.error("Error in smart-nudge-detection:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        function: "smart-nudge-detection"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
