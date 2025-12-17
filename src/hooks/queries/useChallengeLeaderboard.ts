import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LeaderboardEntry = {
  rank: number | null;
  trainer_id: string | null;
  trainer_key: string | null;
  trainer_name: string | null;
  trainer_city: string | null;
  trainer_state: string | null;
  trainer_gym: string | null;
  average_rating: number | null;
  total_ratings: number | null;
  last_updated: string | null;
};

export function useChallengeLeaderboard(limit?: number) {
  return useQuery({
    queryKey: ["challenge-leaderboard", limit],
    queryFn: async () => {
      let query = supabase
        .from("challenge_leaderboard")
        .select("*")
        .order("rank", { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useChallengeStats() {
  return useQuery({
    queryKey: ["challenge-stats"],
    queryFn: async () => {
      // Get total ratings count
      const { count: totalRatings } = await supabase
        .from("challenge_ratings")
        .select("*", { count: "exact", head: true });

      // Get unique trainers count
      const { data: uniqueTrainers } = await supabase
        .from("challenge_ratings")
        .select("trainer_name");

      const uniqueTrainersCount = new Set(
        uniqueTrainers?.map((r) => r.trainer_name)
      ).size;

      return {
        totalRatings: totalRatings || 0,
        uniqueTrainers: uniqueTrainersCount || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
