import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkQuietHours, checkFrequencyCap } from "../_shared/timeguard.ts";
import { corsHeaders } from "../_shared/responses.ts";
import { handleError } from "../_shared/error-handler.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all pending auto-approval drafts that are past their countdown
    const { data: drafts, error: draftsError } = await supabase
      .from("messages")
      .select(`
        id,
        trainer_id,
        contact_id,
        content,
        scheduled_for,
        contacts!inner(
          first_name,
          quiet_hours_start,
          quiet_hours_end,
          frequency_cap_daily,
          frequency_cap_weekly,
          messages_sent_today,
          messages_sent_this_week
        )
      `)
      .eq("status", "draft")
      .eq("requires_approval", false)
      .lte("scheduled_for", new Date().toISOString());

    if (draftsError) throw draftsError;
    if (!drafts || drafts.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No drafts ready for auto-approval" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const draft of drafts) {
      const contact = Array.isArray(draft.contacts) ? draft.contacts[0] : draft.contacts;
      const now = new Date();

      // Check quiet hours
      const quietCheck = checkQuietHours(now, {
        quiet_hours_start: contact.quiet_hours_start,
        quiet_hours_end: contact.quiet_hours_end,
      });

      if (!quietCheck.allowed) {
        // Reschedule for next available time
        await supabase
          .from("messages")
          .update({ scheduled_for: quietCheck.nextAvailable })
          .eq("id", draft.id);

        results.push({
          id: draft.id,
          status: "rescheduled",
          next_send: quietCheck.nextAvailable,
        });
        continue;
      }

      // Check frequency caps
      const freqCheck = checkFrequencyCap(
        {
          today: contact.messages_sent_today || 0,
          week: contact.messages_sent_this_week || 0,
        },
        {
          frequency_cap_daily: contact.frequency_cap_daily,
          frequency_cap_weekly: contact.frequency_cap_weekly,
        }
      );

      if (!freqCheck.allowed) {
        // Mark as blocked
        await supabase
          .from("messages")
          .update({ status: "blocked" })
          .eq("id", draft.id);

        results.push({
          id: draft.id,
          status: "blocked",
          reason: `${freqCheck.limit} cap reached`,
        });
        continue;
      }

      // Approve and queue for sending
      const { error: updateError } = await supabase
        .from("messages")
        .update({
          status: "queued",
          approved_at: new Date().toISOString(),
        })
        .eq("id", draft.id);

      if (updateError) {
        console.error(`Failed to approve draft ${draft.id}:`, updateError);
        results.push({ id: draft.id, status: "error", error: updateError.message });
        continue;
      }

      // Increment message counters
      await supabase.rpc("increment_message_counters", {
        contact_id: draft.contact_id,
      });

      results.push({ id: draft.id, status: "approved" });
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return handleError("auto-approval-scheduler", error);
  }
});
