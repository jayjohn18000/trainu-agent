import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Plus } from "lucide-react";
import { Exercise } from "@/pages/WorkoutLogger";
import { cn } from "@/lib/utils";

type Props = {
  exercise: Exercise;
  onUpdate: (id: string, updates: Partial<Exercise>) => void;
  onAddSet: (id: string) => void;
};

export function ExerciseRow({ exercise, onUpdate, onAddSet }: Props) {
  const updateSet = (setIndex: number, field: "reps" | "weight" | "completed", value: number | boolean) => {
    const newSets = [...exercise.sets];
    newSets[setIndex] = { ...newSets[setIndex], [field]: value };
    onUpdate(exercise.id, { sets: newSets });
  };

  return (
    <div className="space-y-4 border-b pb-6 last:border-0">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{exercise.name}</h3>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center text-sm font-medium text-muted-foreground">
          <span className="w-8 text-center">Set</span>
          <span>Reps</span>
          <span>Weight (lbs)</span>
          <span className="w-10"></span>
        </div>

        {exercise.sets.map((set, index) => (
          <div
            key={index}
            className={cn(
              "grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center",
              set.completed && "opacity-60"
            )}
          >
            <span className="w-8 text-center font-medium">{index + 1}</span>
            <Input
              type="number"
              value={set.reps || ""}
              onChange={(e) => updateSet(index, "reps", parseInt(e.target.value) || 0)}
              placeholder="0"
              className="h-9"
            />
            <Input
              type="number"
              value={set.weight || ""}
              onChange={(e) => updateSet(index, "weight", parseInt(e.target.value) || 0)}
              placeholder="0"
              className="h-9"
            />
            <Button
              size="sm"
              variant={set.completed ? "default" : "outline"}
              onClick={() => updateSet(index, "completed", !set.completed)}
              className="w-10 h-9"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSet(exercise.id)}
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`rpe-${exercise.id}`}>RPE (1-10)</Label>
          <Input
            id={`rpe-${exercise.id}`}
            type="number"
            min="1"
            max="10"
            value={exercise.rpe || ""}
            onChange={(e) => onUpdate(exercise.id, { rpe: parseInt(e.target.value) || undefined })}
            placeholder="Rate intensity"
            className="h-9"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`notes-${exercise.id}`}>Notes</Label>
        <Textarea
          id={`notes-${exercise.id}`}
          value={exercise.notes || ""}
          onChange={(e) => onUpdate(exercise.id, { notes: e.target.value })}
          placeholder="Add notes about form, difficulty, etc."
          className="min-h-[60px]"
        />
      </div>
    </div>
  );
}
