import { useEffect, useState } from "react";
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
import { Calendar, Clock, Plus, TrendingUp } from "lucide-react";
import { StreakDisplay } from "@/components/ui/StreakDisplay";
import { AIInsightCard } from "@/components/ui/AIInsightCard";
import { WhopBadge } from "@/components/ui/WhopBadge";
import { GHLBadge } from "@/components/ui/GHLBadge";
import {
  getNextSession,
  getClientProgress,
  listGoals,
  createGoalEntry,
  getUser,
} from "@/lib/mock/api-extended";
import type { Session, ClientProgress, Goal, CheckInType, RPELevel } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ClientDashboardNew() {
  const { user } = useAuthStore();
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [progress, setProgress] = useState<ClientProgress | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [trainerName, setTrainerName] = useState("");

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [session, prog, userGoals] = await Promise.all([
      getNextSession(user.id),
      getClientProgress(user.id),
      listGoals(user.id),
    ]);
    
    setNextSession(session);
    setProgress(prog || null);
    setGoals(userGoals.filter(g => g.isActive));
    
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

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and stay consistent</p>
        </div>
        {user?.isMember && <WhopBadge />}
      </div>

      {/* Next Session - Hero Card */}
      {nextSession && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Next Session
                </Badge>
                <GHLBadge text="Managed via GHL" />
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
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Reschedule</Button>
              <Button size="sm" className="gap-2">
                Confirm
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Consistency Ring & Goal - More Prominent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-blue-500/5">
          <h3 className="text-lg font-semibold mb-6">This Week's Progress</h3>
          <div className="flex flex-col items-center gap-6">
            <Ring
              percentage={percentage}
              size={160}
              label={`${percentage}%`}
              sublabel={`${progress?.completedThisWeek || 0}/${progress?.weeklyTarget || 3} sessions`}
            />
            {progress && progress.streak > 0 && (
              <StreakDisplay weeks={progress.streak} size="lg" />
            )}
            {progress && progress.streak === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Complete a session to start your streak! 💪
              </p>
            )}
          </div>
        </Card>

        {goals.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Goal</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{goals[0].name}</h4>
                <p className="text-sm text-muted-foreground">
                  Target: {goals[0].target} {goals[0].unit}/week
                </p>
              </div>
              <Button 
                onClick={() => setShowCheckInDialog(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Check-in
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* AI Insights - NEW */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          AI Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIInsightCard 
            insight="You're 2 sessions away from hitting a 4-week streak! Clients with 4+ week streaks see 3x better results."
          />
          <AIInsightCard 
            insight="Your consistency on Monday/Wednesday sessions is 95%. Keep up this pattern for optimal progress!"
          />
        </div>
      </div>

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
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => handleCheckIn('completed', 'right')}
              >
                <span className="text-2xl">✅</span>
                <span className="text-sm">Completed</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => handleCheckIn('partial')}
              >
                <span className="text-2xl">⚠️</span>
                <span className="text-sm">Partial</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
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
