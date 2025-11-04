import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAutoApprovalStats(trainerId: string) {
  return useQuery({
    queryKey: ["auto-approval-stats", trainerId],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's auto-approved count
      const { count: todayCount } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("trainer_id", trainerId)
        .eq("generated_by", "ai")
        .in("status", ["queued", "sent"])
        .gte("created_at", today.toISOString());

      // Get this week's stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: weekCount } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("trainer_id", trainerId)
        .eq("generated_by", "ai")
        .in("status", ["queued", "sent"])
        .gte("created_at", weekAgo.toISOString());

      // Get pending auto-approvals
      const { count: pendingCount } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("trainer_id", trainerId)
        .eq("status", "draft")
        .not("auto_approval_at", "is", null);

      // Get auto-approval settings
      const { data: settings } = await supabase
        .from("auto_approval_settings")
        .select("*")
        .eq("trainer_id", trainerId)
        .single();

      return {
        todayCount: todayCount || 0,
        weekCount: weekCount || 0,
        pendingCount: pendingCount || 0,
        settings,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
