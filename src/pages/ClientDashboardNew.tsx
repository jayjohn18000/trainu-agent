import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ring } from "@/components/ui/Ring";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Plus, TrendingUp, Trophy, Target, Zap, Award, Users } from "lucide-react";
import { StreakDisplay } from "@/components/ui/StreakDisplay";
import { LevelDisplay } from "@/components/ui/LevelDisplay";
import { ChallengeCard } from "@/components/ui/ChallengeCard";
import { AIInsightCard } from "@/components/ui/AIInsightCard";
import { WhopBadge } from "@/components/ui/WhopBadge";
import { GHLBadge } from "@/components/ui/GHLBadge";
import {
  getNextSession,
  getClientProgress,
  listGoals,
  createGoalEntry,
  getUser,
  listChallenges,
} from "@/lib/mock/api-extended";
import type { Session, ClientProgress, Goal, CheckInType, RPELevel, Challenge } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ClientDashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [progress, setProgress] = useState<ClientProgress | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [trainerName, setTrainerName] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [session, prog, userGoals, userChallenges] = await Promise.all([
      getNextSession(user.id),
      getClientProgress(user.id),
      listGoals(user.id),
      listChallenges(user.id),
    ]);
    
    setNextSession(session);
    setProgress(prog || null);
    setGoals(userGoals.filter(g => g.isActive));
    setChallenges(userChallenges);
    
    if (session) {
      const trainer = await getUser(session.trainerId);
      setTrainerName(trainer?.name || 'Your trainer');
    }
  };

  const handleCheckIn = async (type: CheckInType, rpe?: RPELevel) => {
    if (!user || goals.length === 0) return;
    
    const activeGoal = goals[0];
    await createGoalEntry({
      goalId: activeGoal.id,
      userId: user.id,
      type,
      rpe,
    });
    
    toast({
      title: "Check-in recorded!",
      description: type === 'completed' ? "Great work! Keep it up!" : "Noted. Let's get back on track!",
    });
    
    setShowCheckInDialog(false);
    loadData();
  };

  const percentage = progress 
    ? Math.round((progress.completedThisWeek / progress.weeklyTarget) * 100)
    : 0;

  // Mock achievements data
  const recentAchievements = [
    { id: 1, title: "3 Week Streak", icon: "🔥", date: "Today", isNew: true },
    { id: 2, title: "10 Sessions", icon: "💪", date: "2 days ago", isNew: false },
  ];

  const communityRank = 12; // Mock rank
  const totalMembers = 45; // Mock total

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground">Keep pushing! You're doing amazing 💪</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {progress && (
            <LevelDisplay
              level={progress.level}
              xp={progress.xp}
              xpToNextLevel={progress.xpToNextLevel}
              title={progress.title}
              compact
            />
          )}
          {user?.isMember && <WhopBadge />}
        </div>
      </div>

      {/* Stats Grid - More Gamified */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate("/community")}>
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-foreground">#{communityRank}</div>
          <div className="text-xs text-muted-foreground">Community Rank</div>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:scale-105 transition-transform">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-foreground">{progress?.streak || 0}</div>
          <div className="text-xs text-muted-foreground">Week Streak</div>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-to-br from-green-500/10 to-blue-500/10 hover:scale-105 transition-transform">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-foreground">{progress?.completedThisWeek || 0}</div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:scale-105 transition-transform">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-foreground">{percentage}%</div>
          <div className="text-xs text-muted-foreground">Progress</div>
        </Card>
      </div>

      {/* Daily Challenge (if available) */}
      {challenges.filter(c => c.type === 'daily' && c.progress < 100).slice(0, 1).map(challenge => (
        <ChallengeCard
          key={challenge.id}
          title={challenge.title}
          description={challenge.description}
          type={challenge.type}
          progress={challenge.progress}
          xpReward={challenge.xpReward}
          expiresAt={challenge.expiresAt}
          compact
        />
      ))}

      {/* Next Session & Progress Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {nextSession ? (
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Next Session
                </Badge>
                <GHLBadge text="via GHL" />
              </div>
              <h3 className="text-2xl font-semibold">{nextSession.type}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(nextSession.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {nextSession.time}
                </div>
              </div>
              <p className="text-sm font-medium">with {trainerName}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">Reschedule</Button>
                <Button size="sm" className="flex-1 gap-2">
                  Confirm
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No upcoming sessions</p>
              <Button size="sm" onClick={() => navigate("/discover")}>Book a Session</Button>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-blue-500/5">
          <h3 className="text-lg font-semibold mb-4">This Week's Progress</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Ring
                percentage={percentage}
                size={140}
                label={`${percentage}%`}
                sublabel={`${progress?.completedThisWeek || 0}/${progress?.weeklyTarget || 3} sessions`}
              />
              {percentage >= 100 && (
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Trophy className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                </div>
              )}
            </div>
            {progress && progress.streak > 0 && (
              <StreakDisplay weeks={progress.streak} size="md" />
            )}
            <Button 
              onClick={() => setShowCheckInDialog(true)}
              className="w-full gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Quick Check-in
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="p-6 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Recent Achievements</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/progress")}>
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentAchievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={cn(
                "p-4 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer",
                achievement.isNew 
                  ? "border-yellow-500 bg-yellow-500/10 animate-pulse" 
                  : "border-border bg-background"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div>
                  <p className="font-semibold">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.date}</p>
                </div>
                {achievement.isNew && (
                  <Badge className="ml-auto" variant="default">New!</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIInsightCard 
            insight="You're 2 sessions away from hitting a 4-week streak! Clients with 4+ week streaks see 3x better results."
          />
          <AIInsightCard 
            insight="Your consistency on Monday/Wednesday sessions is 95%. Keep up this pattern for optimal progress!"
          />
        </div>
      </div>

      {/* Community Leaderboard Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Community Leaderboard</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/community")}>
            View Full
          </Button>
        </div>
        <div className="space-y-2">
          {[
            { rank: 10, name: "Jordan Lee", streak: 8, isYou: false },
            { rank: 11, name: "Alex Chen", streak: 5, isYou: false },
            { rank: 12, name: "You", streak: progress?.streak || 0, isYou: true },
            { rank: 13, name: "Sarah Kim", streak: 3, isYou: false },
            { rank: 14, name: "Mike Ross", streak: 2, isYou: false },
          ].map((member) => (
            <div 
              key={member.rank}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors",
                member.isYou 
                  ? "bg-primary/10 border-2 border-primary" 
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  member.rank <= 3 ? "bg-yellow-500 text-yellow-950" : "bg-muted text-muted-foreground"
                )}>
                  {member.rank}
                </div>
                <span className={cn("font-medium", member.isYou && "font-bold")}>
                  {member.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <span className="font-semibold">{member.streak} weeks</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Coach Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Coach Notes</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-green-500">
            <p className="text-sm font-medium mb-1">💪 Form Improvement</p>
            <p className="text-sm text-muted-foreground">
              Your squat depth has improved significantly! Keep focusing on that mobility work.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-blue-500">
            <p className="text-sm font-medium mb-1">📈 Progress Update</p>
            <p className="text-sm text-muted-foreground">
              Great consistency this month! You're on track to hit your strength goals.
            </p>
          </div>
        </div>
      </Card>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Check-in</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">How did today's session go?</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-transform"
                onClick={() => handleCheckIn('completed', 'right')}
              >
                <span className="text-2xl">✅</span>
                <span className="text-sm">Completed</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-transform"
                onClick={() => handleCheckIn('partial')}
              >
                <span className="text-2xl">⚠️</span>
                <span className="text-sm">Partial</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-transform"
                onClick={() => handleCheckIn('missed')}
              >
                <span className="text-2xl">❌</span>
                <span className="text-sm">Missed</span>
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">How hard was it? (RPE)</p>
              <div className="grid grid-cols-3 gap-3">
                {(['hard', 'right', 'light'] as RPELevel[]).map(rpe => (
                  <Button
                    key={rpe}
                    variant="outline"
                    size="sm"
                    className="hover:scale-105 transition-transform"
                    onClick={() => handleCheckIn('completed', rpe)}
                  >
                    {rpe === 'hard' && '🔥 Hard'}
                    {rpe === 'right' && '✨ Right'}
                    {rpe === 'light' && '💚 Light'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
