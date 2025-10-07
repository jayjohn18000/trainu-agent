import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/store/useCalendarStore";

interface CalendarGridProps {
  selectedDate: Date;
  sessions: Session[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export function CalendarGrid({ selectedDate, sessions, onDateSelect, onMonthChange }: CalendarGridProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const days = useMemo(() => {
    const start = new Date(monthStart);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    const end = new Date(monthEnd);
    end.setDate(end.getDate() + (6 - end.getDay())); // End on Saturday
    
    return eachDayOfInterval({ start, end });
  }, [monthStart, monthEnd]);

  const getSessionsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return sessions.filter((s) => s.date === dateStr && s.status !== "cancelled");
  };

  const handlePrevMonth = () => {
    onMonthChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(selectedDate, 1));
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {format(selectedDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySessions = getSessionsForDay(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "min-h-[80px] p-2 rounded-lg border transition-all text-left relative",
                "hover:border-primary/50 hover:bg-accent/50",
                isCurrentMonth ? "bg-card" : "bg-muted/20",
                isSelected && "border-primary bg-accent",
                isDayToday && "border-primary/70",
                !isCurrentMonth && "opacity-50"
              )}
            >
              <div className={cn(
                "text-sm font-medium mb-1",
                isDayToday && "text-primary",
                isSelected && "text-primary"
              )}>
                {format(day, "d")}
              </div>
              
              {daySessions.length > 0 && (
                <div className="space-y-1">
                  {daySessions.slice(0, 2).map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "text-xs px-1 py-0.5 rounded truncate",
                        session.type === "virtual"
                          ? "bg-chart-2/20 text-chart-2"
                          : "bg-primary/20 text-primary"
                      )}
                    >
                      {session.time} {session.title}
                    </div>
                  ))}
                  {daySessions.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{daySessions.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
