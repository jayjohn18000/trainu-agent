import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { BookingData } from "./BookingWizard";
import { cn } from "@/lib/utils";

type Props = {
  onNext: () => void;
  onBack: () => void;
  onSelect: (data: Partial<BookingData>) => void;
  selectedDate?: Date;
  selectedTime?: string;
  sessionType?: any;
};

export function DateTimeStep({ onNext, onBack, onSelect, selectedDate, selectedTime }: Props) {
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [time, setTime] = useState<string | undefined>(selectedTime);

  // Mock available time slots
  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
  ];

  const handleContinue = () => {
    if (date && time) {
      onSelect({ date, time });
      onNext();
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="font-semibold mb-3">Select a Date</h3>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date < new Date() || date.getDay() === 0}
            className={cn("rounded-md border pointer-events-auto")}
          />
        </div>
      </div>

      {date && (
        <div>
          <h3 className="font-semibold mb-3">
            Available Times for {format(date, "MMMM d, yyyy")}
          </h3>
          <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
            {timeSlots.map((slot) => (
              <Button
                key={slot}
                variant={time === slot ? "default" : "outline"}
                className="w-full"
                onClick={() => setTime(slot)}
              >
                {slot}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!date || !time}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
