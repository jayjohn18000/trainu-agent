import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface Session {
  client: string;
  time: string;
  type: string;
}

interface UpcomingSessionsProps {
  sessions?: Session[];
  onViewAll?: () => void;
}

export function UpcomingSessions({ 
  sessions = [], 
  onViewAll 
}: UpcomingSessionsProps) {
  const defaultSessions: Session[] = [
    { client: "Alex Johnson", time: "Tomorrow 10:00 AM", type: "Strength Training" },
    { client: "Jamie Smith", time: "Tomorrow 2:00 PM", type: "HIIT Cardio" },
    { client: "Casey Brooks", time: "Friday 9:00 AM", type: "Olympic Lifting" },
  ];

  const displaySessions = sessions.length > 0 ? sessions : defaultSessions;

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
      <div className="space-y-3">
        {displaySessions.map((session, idx) => (
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
        ))}
      </div>
      <Button variant="outline" className="w-full mt-4" onClick={onViewAll}>
        View All Sessions
      </Button>
    </div>
  );
}

