import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Session {
  id: string;
  clientName: string;
  type: string;
  time: Date;
  duration: number;
}

const mockSessions: Session[] = [
  {
    id: "1",
    clientName: "John Doe",
    type: "PT",
    time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 60,
  },
  {
    id: "2",
    clientName: "Sarah Wilson",
    type: "Strength",
    time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 45,
  },
  {
    id: "3",
    clientName: "Mike Johnson",
    type: "Cardio",
    time: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
    duration: 30,
  },
];

interface CalendarWidgetProps {
  onOpenCalendar: () => void;
}

export function CalendarWidget({ onOpenCalendar }: CalendarWidgetProps) {
  const nextSession = mockSessions[0];
  const timeUntil = nextSession ? formatDistanceToNow(nextSession.time, { addSuffix: true }) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextSession && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Next session</p>
            <p className="font-semibold text-sm">{nextSession.clientName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{timeUntil}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {mockSessions.slice(1).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={onOpenCalendar}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{session.clientName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    {session.type}
                  </Badge>
                  <span>{session.duration}m</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(session.time, { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={onOpenCalendar}>
          View Full Calendar
        </Button>
      </CardContent>
    </Card>
  );
}
