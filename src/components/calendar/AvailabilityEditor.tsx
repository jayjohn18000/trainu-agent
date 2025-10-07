import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { AvailabilityRule } from "@/lib/store/useCalendarStore";

interface AvailabilityEditorProps {
  trainerId: string;
  rules: AvailabilityRule[];
  onUpdate: (rules: AvailabilityRule[]) => void;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityEditor({ trainerId, rules, onUpdate }: AvailabilityEditorProps) {
  const [editingRules, setEditingRules] = useState<AvailabilityRule[]>(rules);

  const getRuleForDay = (dayOfWeek: number) => {
    return editingRules.find((r) => r.dayOfWeek === dayOfWeek);
  };

  const handleToggleDay = (dayOfWeek: number) => {
    const existingRule = getRuleForDay(dayOfWeek);
    
    if (existingRule) {
      // Toggle active state
      setEditingRules((prev) =>
        prev.map((r) =>
          r.dayOfWeek === dayOfWeek ? { ...r, isActive: !r.isActive } : r
        )
      );
    } else {
      // Add new rule
      const newRule: AvailabilityRule = {
        id: `temp-${Date.now()}-${dayOfWeek}`,
        trainerId,
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        isActive: true,
      };
      setEditingRules((prev) => [...prev, newRule]);
    }
  };

  const handleTimeChange = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    setEditingRules((prev) =>
      prev.map((r) =>
        r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r
      )
    );
  };

  const handleDeleteRule = (dayOfWeek: number) => {
    setEditingRules((prev) => prev.filter((r) => r.dayOfWeek !== dayOfWeek));
  };

  const handleSave = () => {
    onUpdate(editingRules);
    toast({
      title: "Availability Updated",
      description: "Your weekly schedule has been saved.",
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Weekly Availability</h3>
          <p className="text-sm text-muted-foreground">
            Set your recurring weekly schedule. You can add exceptions for specific dates later.
          </p>
        </div>

        <div className="space-y-4">
          {DAYS.map((day, index) => {
            const rule = getRuleForDay(index);
            const isActive = rule?.isActive ?? false;

            return (
              <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => handleToggleDay(index)}
                  />
                  <Label className="font-medium">{day}</Label>
                </div>

                {rule && isActive && (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={rule.startTime}
                        onChange={(e) => handleTimeChange(index, "startTime", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={rule.endTime}
                        onChange={(e) => handleTimeChange(index, "endTime", e.target.value)}
                        className="w-32"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}

                {!rule && (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditingRules(rules)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Availability</Button>
        </div>
      </div>
    </Card>
  );
}
