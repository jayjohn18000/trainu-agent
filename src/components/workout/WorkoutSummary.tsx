import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Exercise } from "@/pages/WorkoutLogger";
import { formatDistanceToNow } from "date-fns";

type Props = {
  exercises: Exercise[];
  startTime: Date;
  onSave: () => void;
  onDiscard: () => void;
};

export function WorkoutSummary({ exercises, startTime, onSave, onDiscard }: Props) {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolume = exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets
        .filter((s) => s.completed)
        .reduce((setSum, s) => setSum + s.reps * s.weight, 0),
    0
  );

  const duration = formatDistanceToNow(startTime, { includeSeconds: false });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Workout Complete!</h1>
        <p className="text-muted-foreground">Great job on finishing your workout</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Workout Summary</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{duration}</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>

          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">
              {completedSets}/{totalSets}
            </div>
            <div className="text-xs text-muted-foreground">Sets Completed</div>
          </div>

          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalVolume.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Volume (lbs)</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Exercises</h3>
          {exercises.map((exercise) => (
            <div key={exercise.id} className="border-l-4 border-primary pl-4 py-2">
              <div className="font-medium">{exercise.name}</div>
              <div className="text-sm text-muted-foreground">
                {exercise.sets.filter((s) => s.completed).length} sets completed
                {exercise.rpe && ` • RPE: ${exercise.rpe}/10`}
              </div>
              {exercise.notes && (
                <div className="text-sm text-muted-foreground mt-1 italic">
                  "{exercise.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onDiscard} className="flex-1">
          Discard
        </Button>
        <Button onClick={onSave} className="flex-1">
          Save Workout
        </Button>
      </div>
    </div>
  );
}
