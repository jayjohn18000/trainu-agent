import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeCard } from "@/components/ui/ChallengeCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StreakDisplay } from "@/components/ui/StreakDisplay";
import { Calendar, Flame, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - would come from API
const dailyChallenges = [
  {
    title: "Complete 3 Workouts",
    description: "Log 3 workout sessions today",
    type: 'daily' as const,
    progress: 66,
    xpReward: 50,
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    isCompleted: false
  },
  {
    title: "Log Your Meals",
    description: "Track all your meals for the day",
    type: 'daily' as const,
    progress: 100,
    xpReward: 30,
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    isCompleted: false
  }
];

const weeklyChallenges = [
  {
    title: "5-Day Streak",
    description: "Work out 5 days this week",
    type: 'weekly' as const,
    progress: 60,
    xpReward: 200,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false
  },
  {
    title: "Hit 10K Steps Daily",
    description: "Reach 10,000 steps every day this week",
    type: 'weekly' as const,
    progress: 57,
    xpReward: 150,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false
  }
];

const monthlyQuests = [
  {
    title: "New Personal Record",
    description: "Set a new PR in any exercise",
    type: 'monthly' as const,
    progress: 0,
    xpReward: 500,
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false
  },
  {
    title: "Social Butterfly",
    description: "Comment on 10 friends' workout posts",
    type: 'monthly' as const,
    progress: 30,
    xpReward: 300,
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false
  }
];

export default function Challenges() {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState({
    daily: dailyChallenges,
    weekly: weeklyChallenges,
    monthly: monthlyQuests
  });

  const currentStreak = 5;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Daily Challenges</h1>
        <p className="text-muted-foreground">Complete challenges to earn XP and level up</p>
      </div>

      {/* Streak Card */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Your Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StreakDisplay weeks={currentStreak} size="lg" />
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Keep logging workouts daily to maintain your streak!
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily" className="gap-2">
            <Calendar className="h-4 w-4" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-2">
            <Target className="h-4 w-4" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            <Flame className="h-4 w-4" />
            Monthly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.daily.map((challenge, idx) => (
              <ChallengeCard key={idx} {...challenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.weekly.map((challenge, idx) => (
              <ChallengeCard key={idx} {...challenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.monthly.map((challenge, idx) => (
              <ChallengeCard key={idx} {...challenge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}