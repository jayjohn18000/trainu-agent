import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Video, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session, SessionStatus } from "@/lib/store/useCalendarStore";

interface SessionListProps {
  sessions: Session[];
  onReschedule?: (session: Session) => void;
  onCancel?: (session: Session) => void;
  onJoin?: (session: Session) => void;
  onMarkComplete?: (session: Session) => void;
  onMarkNoShow?: (session: Session) => void;
  userRole?: string;
}

const statusConfig: Record<SessionStatus, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-chart-1/20 text-chart-1" },
  in_progress: { label: "In Progress", className: "bg-chart-3/20 text-chart-3" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", className: "bg-destructive/20 text-destructive" },
  no_show: { label: "No Show", className: "bg-chart-4/20 text-chart-4" },
};

export function SessionList({
  sessions,
  onReschedule,
  onCancel,
  onJoin,
  onMarkComplete,
  onMarkNoShow,
  userRole,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No sessions found</p>
      </Card>
    );
  }

  const isTrainer = userRole === "trainer";
  const isClient = userRole === "client";

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const statusStyle = statusConfig[session.status];
        const sessionDate = new Date(`${session.date}T${session.time}`);
        const isUpcoming = session.status === "upcoming";
        const isVirtual = session.type === "virtual";

        return (
          <Card key={session.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{session.title}</h4>
                  <Badge className={cn("text-xs", statusStyle.className)}>
                    {statusStyle.label}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(sessionDate, "MMM d, yyyy")} at {session.time}
                    </span>
                  </div>

                  {isVirtual ? (
                    <div className="flex items-center gap-1.5">
                      <Video className="h-4 w-4" />
                      <span>Virtual</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{session.location || "In-Person"}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{session.duration} min</span>
                  </div>
                </div>

                <p className="text-sm">
                  {isClient && `with ${session.trainerName}`}
                  {isTrainer && `with ${session.clientName}`}
                </p>

                {session.notes && (
                  <p className="text-sm text-muted-foreground italic">{session.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isUpcoming && isVirtual && onJoin && (
                  <Button size="sm" onClick={() => onJoin(session)}>
                    <Video className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                )}

                {isTrainer && isUpcoming && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkComplete?.(session)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background z-50">
                    {isUpcoming && onReschedule && (
                      <DropdownMenuItem onClick={() => onReschedule(session)}>
                        Reschedule
                      </DropdownMenuItem>
                    )}
                    {isUpcoming && onCancel && (
                      <DropdownMenuItem
                        onClick={() => onCancel(session)}
                        className="text-destructive focus:text-destructive"
                      >
                        Cancel Session
                      </DropdownMenuItem>
                    )}
                    {isTrainer && isUpcoming && onMarkNoShow && (
                      <DropdownMenuItem onClick={() => onMarkNoShow(session)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Mark No Show
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
