import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardCard } from "@/components/ui/LeaderboardCard";
import { MilestoneCard } from "@/components/ui/MilestoneCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listLeaderboard, listMilestones } from "@/lib/mock/api-extended";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { LeaderboardEntry, Milestone } from "@/lib/mock/types";
import { Trophy, Zap, Target, Users } from "lucide-react";

type TimePeriod = "weekly" | "monthly" | "all-time";
type LeaderboardCategory = "overall" | "strength" | "consistency" | "social";

const categoryConfig = {
  overall: { icon: Trophy, label: "Overall XP", description: "Top performers by total XP" },
  strength: { icon: Target, label: "Strength", description: "Most sessions completed" },
  consistency: { icon: Zap, label: "Consistency", description: "Longest streaks" },
  social: { icon: Users, label: "Social", description: "Community engagement" }
};

export function LeaderboardsTab() {
  const { user } = useAuthStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [category, setCategory] = useState<LeaderboardCategory>("overall");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    loadData();
  }, [timePeriod, category, user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    const [leaderboardData, milestonesData] = await Promise.all([
      listLeaderboard(category, timePeriod),
      listMilestones(user.id)
    ]);

    setLeaderboard(leaderboardData);
    setMilestones(milestonesData);
  };

  const CategoryIcon = categoryConfig[category].icon;

  return (
    <div className="space-y-6">
      {/* Milestones Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Milestones
          </CardTitle>
          <CardDescription>
            Major achievements in your fitness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-8">
                Keep training to unlock milestones!
              </p>
            ) : (
              milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  title={milestone.title}
                  description={milestone.description}
                  value={milestone.value}
                  type={milestone.type}
                  achieved={milestone.achieved}
                  achievedAt={milestone.achievedAt}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboards Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CategoryIcon className="w-5 h-5" />
                {categoryConfig[category].label} Leaderboard
              </CardTitle>
              <CardDescription>
                {categoryConfig[category].description}
              </CardDescription>
            </div>
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={category} onValueChange={(value) => setCategory(value as LeaderboardCategory)}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="strength">Strength</TabsTrigger>
              <TabsTrigger value="consistency">Streaks</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            <TabsContent value={category} className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No leaderboard data available yet
                </p>
              ) : (
                leaderboard.map((entry) => (
                  <LeaderboardCard
                    key={entry.userId}
                    rank={entry.rank}
                    userId={entry.userId}
                    userName={entry.userName}
                    userAvatar={entry.userAvatar}
                    score={entry.score}
                    change={entry.change}
                    isCurrentUser={entry.userId === user?.id}
                    category={category === 'overall' ? 'XP' : category === 'strength' ? 'Sessions' : category === 'consistency' ? 'Weeks' : 'Points'}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
