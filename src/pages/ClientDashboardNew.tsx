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
import { Calendar, Clock, Plus } from "lucide-react";
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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and stay consistent</p>
      </div>

      {/* Next Session */}
      {nextSession && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge>Next Session</Badge>
              <h3 className="text-xl font-semibold">{nextSession.type}</h3>
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
              <p className="text-sm">with {trainerName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Reschedule</Button>
              <Button size="sm">Confirm</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Consistency Ring & Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">This Week</h3>
          <div className="flex flex-col items-center gap-4">
            <Ring
              percentage={percentage}
              size={140}
              label={`${percentage}%`}
              sublabel={`${progress?.completedThisWeek || 0}/${progress?.weeklyTarget || 3} sessions`}
            />
            {progress && progress.streak > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">🔥 {progress.streak} weeks</div>
                <div className="text-sm text-muted-foreground">Current streak</div>
              </div>
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

      {/* Coach Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Coach Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm">
              💪 Your squat depth has improved significantly! Keep focusing on that mobility work.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm">
              📈 Great consistency this month! You're on track to hit your strength goals.
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
