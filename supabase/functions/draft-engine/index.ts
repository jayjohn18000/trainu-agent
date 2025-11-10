// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

type TriggerType =
  | "booking_confirmed"
  | "booking_upcoming"
  | "missed_session"
  | "no_activity"
  | "milestone";

interface RequestBody {
  contactId: string;
  triggerType: TriggerType;
}

function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function pickTemplate(
  trigger: TriggerType,
  contact: { first_name: string | null; last_name: string | null },
  context: { sessionType?: string; dateStr?: string; count?: number },
  editHistory?: any[]
): { content: string; confidence: number; why: string[] } {
  const first = contact.first_name ?? "there";
  
  // Enhanced learning algorithm
  let confidenceAdjustment = 0;
  
  if (editHistory && editHistory.length > 0) {
    // Filter edits in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEdits = editHistory.filter(e => 
      e.created_at && new Date(e.created_at) > thirtyDaysAgo
    );
    
    // Calculate weighted confidence adjustment based on edit patterns
    if (recentEdits.length > 0) {
      // Count edits by type
      const editCounts = recentEdits.reduce((acc: Record<string, number>, edit) => {
        acc[edit.edit_type] = (acc[edit.edit_type] || 0) + 1;
        return acc;
      }, {});
      
      // Major content changes indicate AI is missing the mark
      const contentChanges = editCounts['content_change'] || 0;
      if (contentChanges > 3) {
        confidenceAdjustment -= 0.08;
      } else if (contentChanges > 1) {
        confidenceAdjustment -= 0.04;
      }
      
      // Tone changes indicate style mismatch
      const toneChanges = editCounts['tone_change'] || 0;
      if (toneChanges > 2) {
        confidenceAdjustment -= 0.05;
      }
      
      // Minor tweaks are okay - they show AI is close
      const minorTweaks = editCounts['minor_tweak'] || 0;
      if (minorTweaks > 5 && contentChanges === 0) {
        confidenceAdjustment += 0.02; // AI is getting it mostly right
      }
      
      // Apply recency weighting - recent edits matter more
      const veryRecentEdits = recentEdits.filter(e => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(e.created_at) > sevenDaysAgo;
      });
      
      if (veryRecentEdits.length > 2) {
        confidenceAdjustment -= 0.03; // Still learning
      }
    }
  }
  
  // Cap confidence adjustments to prevent extreme values
  confidenceAdjustment = Math.max(-0.15, Math.min(0.05, confidenceAdjustment));
  
  switch (trigger) {
    case "booking_confirmed": {
      const msg = `Hi ${first}! Your ${context.sessionType ?? "training"} is confirmed for ${context.dateStr ?? "the scheduled time"}. Reply Y to confirm.`;
      return { 
        content: msg, 
        confidence: Math.max(0.7, Math.min(0.95, 0.9 + confidenceAdjustment)), 
        why: ["booking confirmed", "clear details", "friendly tone"] 
      };
    }
    case "booking_upcoming": {
      const msg = `Reminder: ${first}, your ${context.sessionType ?? "session"} is coming up on ${context.dateStr ?? "the scheduled time"}. Need to reschedule? Reply RES.`;
      return { 
        content: msg, 
        confidence: Math.max(0.7, Math.min(0.93, 0.88 + confidenceAdjustment)), 
        why: ["upcoming session", "actionable", "concise"] 
      };
    }
    case "missed_session": {
      const msg = `${first}, we missed you last time. Want help finding a new time to get back on track?`;
      return { 
        content: msg, 
        confidence: Math.max(0.6, Math.min(0.8, 0.72 + confidenceAdjustment)), 
        why: ["empathetic", "re-engagement", "helpful"] 
      };
    }
    case "no_activity": {
      const msg = `Hey ${first}, quick check-in—how are workouts going this week? I can adjust your plan if needed.`;
      return { 
        content: msg, 
        confidence: Math.max(0.7, Math.min(0.85, 0.8 + confidenceAdjustment)), 
        why: ["low recent activity", "supportive", "light nudge"] 
      };
    }
    case "milestone": {
      const count = context.count ?? 1;
      const msg = `${first}, congrats on session #${count}! Want to set a new goal for next week?`;
      return { 
        content: msg, 
        confidence: Math.max(0.75, Math.min(0.91, 0.86 + confidenceAdjustment)), 
        why: ["milestone", "celebratory", "goal-oriented"] 
      };
    }
  }
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseKey = getEnv("SUPABASE_ANON_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return new Response("Unauthorized", { status: 401 });
    const trainerId = auth.user.id;

    const body = (await req.json()) as RequestBody;
    
    // Validate request body
    const requestSchema = z.object({
      contactId: z.string().uuid(),
      triggerType: z.enum(['booking_confirmed', 'booking_upcoming', 'missed_session', 'no_activity', 'milestone']),
      context: z.object({
        sessionType: z.string().max(100).optional(),
        dateStr: z.string().max(50).optional(),
        count: z.number().int().min(0).max(1000).optional()
      }).optional()
    });
    
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const validatedBody = validation.data;

    const { data: contact, error: contactErr } = await supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .eq("trainer_id", trainerId)
      .eq("id", validatedBody.contactId)
      .single();
    if (contactErr || !contact) throw contactErr ?? new Error("Contact not found");

    // Get auto-approval settings
    const { data: settings } = await supabase
      .from("auto_approval_settings")
      .select("enabled, high_confidence_threshold, preview_window_minutes, max_daily_auto_approvals")
      .eq("trainer_id", trainerId)
      .single();

    // Get edit history for learning
    const { data: editHistory } = await supabase
      .from("trainer_edits")
      .select("edit_type, original_confidence, created_at")
      .eq("trainer_id", trainerId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Minimal context for templates; can be extended by querying bookings/insights
    const template = pickTemplate(validatedBody.triggerType, contact as any, validatedBody.context || {}, editHistory || []);

    // Determine if this should be auto-approved
    const now = new Date();
    let autoApprovalAt: string | null = null;
    let expiresAt: string | null = null;
    
    if (settings?.enabled && template.confidence >= (settings.high_confidence_threshold || 0.90)) {
      // Check daily auto-approval limit
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("trainer_id", trainerId)
        .eq("generated_by", "ai")
        .gte("auto_approval_at", todayStart.toISOString())
        .lte("auto_approval_at", now.toISOString());

      if ((count || 0) < (settings.max_daily_auto_approvals || 20)) {
        const previewMinutes = settings.preview_window_minutes || 15;
        autoApprovalAt = new Date(now.getTime() + previewMinutes * 60 * 1000).toISOString();
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      }
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("messages")
      .insert({
        trainer_id: trainerId,
        contact_id: body.contactId,
        status: "draft",
        content: template.content,
        channel: "sms",
        confidence: template.confidence,
        why_reasons: template.why,
        generated_by: "ai",
        auto_approval_at: autoApprovalAt,
        expires_at: expiresAt,
        edit_count: 0,
      })
      .select("id, confidence, auto_approval_at")
      .single();
    if (insertErr) throw insertErr;

    console.log(JSON.stringify({
      function: 'draft-engine',
      action: 'generate',
      contactId: body.contactId,
      triggerType: body.triggerType,
      confidence: inserted.confidence,
      messageId: inserted.id,
      trainerId,
      autoApprovalScheduled: !!autoApprovalAt,
      autoApprovalAt: autoApprovalAt,
      timestamp: new Date().toISOString(),
    }));

    const response = { 
      messageId: inserted.id, 
      confidence: inserted.confidence, 
      why: template.why,
      autoApprovalAt: inserted.auto_approval_at
    };
    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("draft-engine error", err);
    return new Response(JSON.stringify({ error: "draft_engine_failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
