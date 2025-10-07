import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

type Props = {
  clientId: string;
  currentProgram: string;
};

const programs = [
  {
    id: "p1",
    name: "12-Week Strength Building",
    duration: "12 weeks",
    sessions: 36,
    description: "Build foundational strength with progressive overload",
  },
  {
    id: "p2",
    name: "Fat Loss & Conditioning",
    duration: "8 weeks",
    sessions: 24,
    description: "High-intensity workouts for fat loss and cardiovascular health",
  },
  {
    id: "p3",
    name: "Beginner Strength",
    duration: "6 weeks",
    sessions: 18,
    description: "Perfect introduction to strength training",
  },
  {
    id: "p4",
    name: "Advanced Powerlifting",
    duration: "16 weeks",
    sessions: 48,
    description: "Advanced program for competitive powerlifting",
  },
  {
    id: "p5",
    name: "Mobility & Recovery",
    duration: "4 weeks",
    sessions: 12,
    description: "Focus on flexibility, mobility, and injury prevention",
  },
];

export function ProgramAssignment({ clientId, currentProgram }: Props) {
  const [selectedProgram, setSelectedProgram] = useState("");

  const handleAssign = () => {
    const program = programs.find((p) => p.id === selectedProgram);
    if (program) {
      toast({
        title: "Program Assigned",
        description: `${program.name} has been assigned to the client`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Current Program</h3>
          <p className="text-sm text-muted-foreground">{currentProgram}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Assign New Program</h3>
        <RadioGroup value={selectedProgram} onValueChange={setSelectedProgram}>
          <div className="space-y-3">
            {programs.map((program) => (
              <Card key={program.id} className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={program.id} id={program.id} className="mt-1" />
                  <Label htmlFor={program.id} className="flex-1 cursor-pointer">
                    <div className="font-medium mb-1">{program.name}</div>
                    <p className="text-sm text-muted-foreground mb-2">{program.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {program.duration}
                      </span>
                      <span>{program.sessions} sessions</span>
                    </div>
                  </Label>
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Button onClick={handleAssign} disabled={!selectedProgram} className="w-full">
        Assign Program
      </Button>
    </div>
  );
}
