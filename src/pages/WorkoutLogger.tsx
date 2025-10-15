import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XPNotification, LevelUpNotification } from "@/components/ui/XPNotification";
import { AchievementUnlockNotification } from "@/components/ui/AchievementUnlockNotification";
import { useGamification } from "@/hooks/useGamification";
import { ExerciseRow } from "@/components/workout/ExerciseRow";
import { RestTimer } from "@/components/workout/RestTimer";
import { WorkoutSummary } from "@/components/workout/WorkoutSummary";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export type ExerciseSet = {
  reps: number;
  weight: number;
  completed: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  sets: ExerciseSet[];
  rpe?: number;
  notes?: string;
};

export default function WorkoutLogger() {
  const { grantXP, xpNotification, levelUpNotification, achievementUnlock, clearXPNotification, clearLevelUpNotification, clearAchievementUnlock } = useGamification();
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "1",
      name: "Barbell Bench Press",
      sets: [
        { reps: 10, weight: 135, completed: false },
        { reps: 8, weight: 155, completed: false },
        { reps: 6, weight: 175, completed: false },
      ],
    },
    {
      id: "2",
      name: "Dumbbell Rows",
      sets: [
        { reps: 10, weight: 50, completed: false },
        { reps: 10, weight: 55, completed: false },
        { reps: 8, weight: 60, completed: false },
      ],
    },
  ]);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [workoutStartTime] = useState(new Date());

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
    );
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                { reps: 0, weight: 0, completed: false },
              ],
            }
          : ex
      )
    );
  };

  const handleCompleteWorkout = () => {
    setIsWorkoutComplete(true);
    // Award XP for completing workout
    const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
    grantXP(completedSets * 5, "Sets Completed");
    grantXP(50, "Workout Completed");
  };

  const handleSaveAndExit = () => {
    toast({
      title: "Workout Saved",
      description: "Your workout has been saved to your history.",
    });
    setIsWorkoutComplete(false);
    // Reset workout or navigate away
  };

  const handleDiscardWorkout = () => {
    if (confirm("Are you sure you want to discard this workout?")) {
      setExercises([]);
      toast({
        title: "Workout Discarded",
        variant: "destructive",
      });
    }
  };

  if (isWorkoutComplete) {
    return (
      <WorkoutSummary
        exercises={exercises}
        startTime={workoutStartTime}
        onSave={handleSaveAndExit}
        onDiscard={handleDiscardWorkout}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Workout Logger</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your sets, reps, and weight</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => setShowRestTimer(true)}
            className="min-h-[44px]"
          >
            Start Rest Timer
          </Button>
          <Button 
            onClick={handleCompleteWorkout}
            className="min-h-[44px]"
          >
            Complete Workout
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="space-y-6">
          {exercises.map((exercise) => (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise}
              onUpdate={updateExercise}
              onAddSet={handleAddSet}
            />
          ))}

          <Button 
            variant="outline" 
            className="w-full min-h-[44px]"
            aria-label="Add new exercise"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </div>
      </Card>

      {showRestTimer && (
        <RestTimer open={showRestTimer} onOpenChange={setShowRestTimer} />
      )}
      
      <XPNotification
        amount={xpNotification?.amount || 0}
        reason={xpNotification?.reason}
        show={!!xpNotification}
        onComplete={clearXPNotification}
      />
      
      <LevelUpNotification
        level={levelUpNotification || 1}
        show={!!levelUpNotification}
        onComplete={clearLevelUpNotification}
      />
      
      <AchievementUnlockNotification
        achievement={achievementUnlock}
        show={!!achievementUnlock}
        onComplete={clearAchievementUnlock}
      />
    </div>
  );
}
