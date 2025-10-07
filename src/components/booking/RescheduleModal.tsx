import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    id: string;
    title: string;
    date: string;
    time: string;
  };
  onSuccess?: () => void;
};

export function RescheduleModal({ open, onOpenChange, session, onSuccess }: Props) {
  const [newDate, setNewDate] = useState<Date>();
  const [newTime, setNewTime] = useState<string>();

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
  ];

  const handleReschedule = () => {
    if (newDate && newTime) {
      toast({
        title: "Session Rescheduled",
        description: `${session.title} moved to ${format(newDate, "MMM d")} at ${newTime}`,
      });
      onSuccess?.();
      onOpenChange(false);
      setNewDate(undefined);
      setNewTime(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
          <DialogDescription>
            Select a new date and time for "{session.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-semibold mb-3">Select New Date</h3>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className={cn("rounded-md border pointer-events-auto")}
              />
            </div>
          </div>

          {newDate && (
            <div>
              <h3 className="font-semibold mb-3">
                Available Times for {format(newDate, "MMMM d, yyyy")}
              </h3>
              <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={newTime === slot ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setNewTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!newDate || !newTime}
              className="flex-1"
            >
              Confirm Reschedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
