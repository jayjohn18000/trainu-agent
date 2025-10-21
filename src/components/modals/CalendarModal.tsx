import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock sessions
const mockSessions = [
  {
    id: "1",
    clientName: "John Doe",
    type: "Personal Training",
    time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 60,
    status: "upcoming" as const,
  },
  {
    id: "2",
    clientName: "Sarah Wilson",
    type: "Strength Training",
    time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 45,
    status: "upcoming" as const,
  },
  {
    id: "3",
    clientName: "Mike Johnson",
    type: "Cardio Session",
    time: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
    duration: 30,
    status: "upcoming" as const,
  },
];

export function CalendarModal({ open, onOpenChange }: CalendarModalProps) {
  const [sessions] = useState(mockSessions);

  const handleBookSession = () => {
    onOpenChange(false);
    // Navigate to full calendar page or open booking wizard
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Calendar</DialogTitle>
            <Button size="sm" onClick={handleBookSession}>
              <Plus className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Next 7 days
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{session.clientName}</p>
                        <Badge variant="outline" className="text-xs">
                          {session.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{session.duration}m</span>
                        </div>
                        <span>
                          {formatDistanceToNow(session.time, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {session.time.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.time.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            View Full Calendar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
