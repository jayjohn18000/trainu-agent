import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Session {
  client: string;
  time: string;
  type: string;
}

interface UpcomingSessionsProps {
  sessions?: Session[];
  onViewAll?: () => void;
  isLoading?: boolean;
}

export function UpcomingSessions({ 
  sessions = [], 
  onViewAll,
  isLoading = false,
}: UpcomingSessionsProps) {
  if (isLoading) {
    return (
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" disabled>
          View All Sessions
        </Button>
      </div>
    );
  }

  const displaySessions = sessions.length > 0 ? sessions : [];

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
      <div className="space-y-3">
        {displaySessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming sessions</p>
            <p className="text-xs text-muted-foreground">Sessions will appear here once booked</p>
          </div>
        ) : (
          displaySessions.slice(0, 5).map((session, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{session.client}</p>
                <p className="text-sm text-muted-foreground">{session.type}</p>
              </div>
              <p className="text-sm text-muted-foreground">{session.time}</p>
            </div>
          ))
        )}
      </div>
      <Button variant="outline" className="w-full mt-4" onClick={onViewAll}>
        View All Sessions
      </Button>
    </div>
  );
}
