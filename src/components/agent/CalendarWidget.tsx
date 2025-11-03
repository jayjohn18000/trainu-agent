import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useUpcomingSessions } from "@/hooks/queries/useUpcomingSessions";

interface CalendarWidgetProps {
  onOpenCalendar: () => void;
}

export function CalendarWidget({ onOpenCalendar }: CalendarWidgetProps) {
  const { data: sessions = [], isLoading } = useUpcomingSessions();
  const nextSession = sessions[0];
  const timeUntil = nextSession ? formatDistanceToNow(nextSession.time, { addSuffix: true }) : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming sessions scheduled
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={onOpenCalendar}>
            View Full Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          {sessions.slice(1).map((session) => (
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
