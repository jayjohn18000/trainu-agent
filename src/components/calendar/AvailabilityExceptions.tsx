import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Calendar as CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailabilityException } from "@/lib/store/useCalendarStore";

interface AvailabilityExceptionsProps {
  trainerId: string;
  exceptions: AvailabilityException[];
  onUpdate: (exceptions: AvailabilityException[]) => void;
}

export function AvailabilityExceptions({
  trainerId,
  exceptions,
  onUpdate,
}: AvailabilityExceptionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newException, setNewException] = useState<Partial<AvailabilityException>>({
    trainerId,
    isBlocked: true,
  });

  const handleAddException = () => {
    if (!newException.date) return;

    const exception: AvailabilityException = {
      id: `temp-${Date.now()}`,
      trainerId,
      date: newException.date,
      isBlocked: newException.isBlocked ?? true,
      reason: newException.reason,
      startTime: newException.startTime,
      endTime: newException.endTime,
    };

    onUpdate([...exceptions, exception]);
    setNewException({ trainerId, isBlocked: true });
    setIsAdding(false);
  };

  const handleDeleteException = (id: string) => {
    onUpdate(exceptions.filter((e) => e.id !== id));
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Availability Exceptions</h3>
          <p className="text-sm text-muted-foreground">
            Block specific dates or set special hours that override your weekly schedule.
          </p>
        </div>

        {/* Exception List */}
        <div className="space-y-3">
          {exceptions.map((exception) => (
            <div key={exception.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {format(new Date(exception.date), "MMMM d, yyyy")}
                  </span>
                  {exception.isBlocked && (
                    <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                      Blocked
                    </span>
                  )}
                </div>
                {exception.reason && (
                  <p className="text-sm text-muted-foreground">{exception.reason}</p>
                )}
                {!exception.isBlocked && exception.startTime && exception.endTime && (
                  <p className="text-sm text-muted-foreground">
                    {exception.startTime} - {exception.endTime}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteException(exception.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          {exceptions.length === 0 && !isAdding && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No exceptions added yet
            </p>
          )}
        </div>

        {/* Add Exception Form */}
        {isAdding ? (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newException.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newException.date
                      ? format(new Date(newException.date), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newException.date ? new Date(newException.date) : undefined}
                    onSelect={(date) =>
                      setNewException((prev) => ({
                        ...prev,
                        date: date ? format(date, "yyyy-MM-dd") : undefined,
                      }))
                    }
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="e.g., Vacation, Conference, Personal Day"
                value={newException.reason || ""}
                onChange={(e) =>
                  setNewException((prev) => ({ ...prev, reason: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddException} disabled={!newException.date}>
                Add Exception
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Exception
          </Button>
        )}
      </div>
    </Card>
  );
}
