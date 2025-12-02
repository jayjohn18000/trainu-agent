import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  trainer_id: string;
  last_message_sent_at: string | null;
}

interface Insight {
  contact_id: string;
  risk_score: number;
  last_activity_at: string | null;
  total_sessions: number;
  missed_sessions: number;
}

interface Booking {
  contact_id: string;
  scheduled_at: string;
  status: string;
}

interface DraftCandidate {
  contactId: string;
  contactName: string;
  priority: number;
  trigger: string;
  reason: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    console.log(`[daily-draft-generator] Starting generation for trainer: ${user.id}`);

    // Step 1: Clean up expired drafts (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error: draftDeleteError, count: draftDeletedCount } = await supabase
      .from("messages")
      .delete({ count: "exact" })
      .eq("trainer_id", user.id)
      .eq("status", "draft")
      .lt("created_at", sevenDaysAgo.toISOString());

    if (draftDeleteError) {
      console.error("Error cleaning up old drafts:", draftDeleteError);
    } else {
      console.log(`[daily-draft-generator] Cleaned up ${draftDeletedCount || 0} old drafts`);
    }

    // Step 2: Clean up orphaned queued messages (older than 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { error: queuedDeleteError, count: queuedDeletedCount } = await supabase
      .from("messages")
      .delete({ count: "exact" })
      .eq("trainer_id", user.id)
      .eq("status", "queued")
      .lt("created_at", oneDayAgo.toISOString());

    if (queuedDeleteError) {
      console.error("Error cleaning up orphaned queued messages:", queuedDeleteError);
    } else {
      console.log(`[daily-draft-generator] Cleaned up ${queuedDeletedCount || 0} orphaned queued messages`);
    }

    const totalCleaned = (draftDeletedCount || 0) + (queuedDeletedCount || 0);

    // Step 2.5: Check existing drafts to prevent duplicates
    const { data: existingDrafts } = await supabase
      .from("messages")
      .select("contact_id")
      .eq("trainer_id", user.id)
      .eq("status", "draft");

    const existingDraftContactIds = new Set(existingDrafts?.map(d => d.contact_id) || []);
    console.log(`[daily-draft-generator] Found ${existingDraftContactIds.size} contacts with existing drafts`);

    // Step 3: Fetch contacts with insights and bookings
    const { data: contacts, error: contactsError } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, trainer_id, last_message_sent_at")
      .eq("trainer_id", user.id)
      .eq("consent_status", "active");

    if (contactsError || !contacts) {
      throw new Error("Failed to fetch contacts");
    }

    const { data: insights, error: insightsError } = await supabase
      .from("insights")
      .select("contact_id, risk_score, last_activity_at, total_sessions, missed_sessions")
      .eq("trainer_id", user.id);

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("contact_id, scheduled_at, status")
      .eq("trainer_id", user.id)
      .gte("scheduled_at", new Date().toISOString());

    const insightMap = new Map(insights?.map(i => [i.contact_id, i]) || []);
    const bookingMap = new Map<string, Booking[]>();
    bookings?.forEach(b => {
      if (!bookingMap.has(b.contact_id)) bookingMap.set(b.contact_id, []);
      bookingMap.get(b.contact_id)!.push(b);
    });

    // Step 4: Analyze each contact and identify draft candidates
    const candidates: DraftCandidate[] = [];
    const now = new Date();

    for (const contact of contacts) {
      const insight = insightMap.get(contact.id);
      const upcomingBookings = bookingMap.get(contact.id) || [];
      const daysSinceMessage = contact.last_message_sent_at
        ? Math.floor((now.getTime() - new Date(contact.last_message_sent_at).getTime()) / 86400000)
        : 999;

      let priority = 0;
      const reasons: string[] = [];
      let trigger = "";

      // High Risk Contacts (priority boost)
      if (insight && insight.risk_score > 75) {
        priority += 100;
        reasons.push(`High risk score: ${insight.risk_score}`);
        trigger = "high_risk";
      }

      // No recent messages (priority boost)
      if (daysSinceMessage >= 3) {
        priority += 50 + daysSinceMessage * 5;
        reasons.push(`${daysSinceMessage} days since last message`);
        if (!trigger) trigger = "re_engagement";
      }

      // Missed sessions
      if (insight && insight.missed_sessions > 0) {
        priority += 40;
        reasons.push(`${insight.missed_sessions} missed sessions`);
        if (!trigger) trigger = "missed_session";
      }

      // Upcoming booking within 24 hours
      const upcoming24h = upcomingBookings.find(b => {
        const scheduledTime = new Date(b.scheduled_at).getTime();
        return scheduledTime - now.getTime() < 86400000 && scheduledTime > now.getTime();
      });
      if (upcoming24h) {
        priority += 60;
        reasons.push("Session scheduled within 24 hours");
        if (!trigger) trigger = "booking_reminder";
      }

      // Milestone detection (every 5 sessions)
      if (insight && insight.total_sessions > 0 && insight.total_sessions % 5 === 0) {
        priority += 30;
        reasons.push(`Milestone: ${insight.total_sessions} sessions completed`);
        if (!trigger) trigger = "milestone";
      }

      // Long inactivity
      if (insight && insight.last_activity_at) {
        const daysSinceActivity = Math.floor(
          (now.getTime() - new Date(insight.last_activity_at).getTime()) / 86400000
        );
        if (daysSinceActivity >= 5) {
          priority += 35 + daysSinceActivity * 3;
          reasons.push(`${daysSinceActivity} days inactive`);
          if (!trigger) trigger = "long_inactive";
        }
      }

      // Only add to candidates if priority > 0
      if (priority > 0 && reasons.length > 0) {
        candidates.push({
          contactId: contact.id,
          contactName: `${contact.first_name} ${contact.last_name || ""}`.trim(),
          priority,
          trigger: trigger || "general_check_in",
          reason: reasons,
        });
      }
    }

    // Step 5: Sort by priority and select top 2-5 candidates
    candidates.sort((a, b) => b.priority - a.priority);
    const selectedCount = Math.min(5, Math.max(2, candidates.length));
    const selected = candidates.slice(0, selectedCount);

    console.log(`[daily-draft-generator] Generated ${selected.length} candidates from ${candidates.length} total`);

    // Step 6: Generate messages using templates
    const templates: Record<string, string[]> = {
      high_risk: [
        "Hey {name}! Haven't heard from you in a while. How are things going?",
        "Hi {name}, checking in to see how you're doing. Any questions or concerns?",
        "{name}, wanted to reach out and see if there's anything I can help with!",
      ],
      re_engagement: [
        "{name}! It's been a few days - how's everything going with your training?",
        "Hey {name}, just checking in! How have you been feeling lately?",
        "{name}, wanted to see how you're progressing. Any updates?",
      ],
      missed_session: [
        "Hi {name}, noticed you missed your last session. Everything okay?",
        "{name}, hope all is well! Let's get you back on track.",
        "Hey {name}, missed you at your session. Want to reschedule?",
      ],
      booking_reminder: [
        "{name}, just a reminder about your session tomorrow! Looking forward to it!",
        "Hey {name}! Session coming up soon - see you there!",
        "{name}, excited for your session tomorrow! Let me know if you need anything.",
      ],
      milestone: [
        "Amazing work {name}! You've completed {sessions} sessions - that's incredible progress!",
        "{name}, congrats on hitting {sessions} sessions! Keep up the great work!",
        "Wow {name}! {sessions} sessions down - you're crushing it!",
      ],
      long_inactive: [
        "{name}, it's been a while! Would love to catch up and see how you're doing.",
        "Hey {name}, hoping to hear from you soon. Let's reconnect!",
        "{name}, miss working with you! Let's get back on track together.",
      ],
      general_check_in: [
        "Hey {name}! Just checking in to see how you're doing.",
        "{name}, hope you're having a great week!",
        "Hi {name}! Wanted to see how things are going for you.",
      ],
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newDrafts = [];
    let skippedCount = 0;
    
    for (const candidate of selected) {
      // Skip if this contact already has a draft
      if (existingDraftContactIds.has(candidate.contactId)) {
        console.log(`[daily-draft-generator] Skipped ${candidate.contactName} - already has a draft`);
        skippedCount++;
        continue;
      }

      const templateList = templates[candidate.trigger] || templates.general_check_in;
      const template = templateList[Math.floor(Math.random() * templateList.length)];
      const content = template
        .replace("{name}", candidate.contactName.split(" ")[0])
        .replace("{sessions}", insightMap.get(candidate.contactId)?.total_sessions.toString() || "0");

      const { data: draft, error: draftError } = await supabase
        .from("messages")
        .insert({
          trainer_id: user.id,
          contact_id: candidate.contactId,
          content,
          channel: "sms",
          status: "draft",
          confidence: 0.75 + Math.random() * 0.15, // 0.75-0.90
          why_reasons: candidate.reason,
          generated_by: "auto_daily",
          expires_at: expiresAt.toISOString(),
        })
        .select("id")
        .single();

      if (draftError) {
        console.error(`Error creating draft for ${candidate.contactId}:`, draftError);
      } else {
        newDrafts.push(draft);
        console.log(`[daily-draft-generator] Created draft ${draft.id} for ${candidate.contactName}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: newDrafts.length,
        skipped: skippedCount,
        cleaned: totalCleaned,
        candidates: candidates.length,
        message: `Generated ${newDrafts.length} new drafts, skipped ${skippedCount} duplicates, cleaned ${totalCleaned} expired/orphaned messages`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[daily-draft-generator] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
