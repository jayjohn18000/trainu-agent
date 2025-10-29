import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Props = {
  clientId: string;
};

const sessions = [
  {
    id: "s1",
    date: "2025-10-02",
    time: "10:00 AM",
    type: "Strength Training",
    status: "completed",
    notes: "Great session, increased squat weight by 10lbs",
  },
  {
    id: "s2",
    date: "2025-09-30",
    time: "10:00 AM",
    type: "Cardio & Conditioning",
    status: "completed",
    notes: "Client showed improvement in endurance",
  },
  {
    id: "s3",
    date: "2025-09-27",
    time: "10:00 AM",
    type: "Upper Body",
    status: "completed",
    notes: "Focused on form corrections for bench press",
  },
  {
    id: "s4",
    date: "2025-09-25",
    time: "10:00 AM",
    type: "Lower Body",
    status: "cancelled",
    notes: "Client called in sick",
  },
  {
    id: "s5",
    date: "2025-10-05",
    time: "10:00 AM",
    type: "Full Body",
    status: "scheduled",
    notes: "",
  },
  {
    id: "s6",
    date: "2025-10-07",
    time: "10:00 AM",
    type: "Strength Training",
    status: "scheduled",
    notes: "",
  },
];

export function SessionHistory({ clientId }: Props) {
  const upcoming = sessions.filter((s) => s.status === "scheduled");
  const past = sessions.filter((s) => s.status !== "scheduled");

  return (
    <div className="space-y-6">
      {/* Upcoming Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Upcoming Sessions</h3>
          <Button
            size="sm"
            onClick={() =>
              toast({ title: "Schedule Session", description: "Opening scheduler..." })
            }
          >
            Schedule New
          </Button>
        </div>
        <div className="space-y-3">
          {upcoming.map((session) => (
            <Card key={session.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{session.type}</h4>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Scheduled
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.time}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="ghost">Reschedule</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Sessions */}
      <div>
        <h3 className="font-semibold mb-4">Past Sessions</h3>
        <div className="space-y-3">
          {past.map((session) => (
            <Card key={session.id} className="p-4">
              <div className="flex items-start gap-3">
                {session.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{session.type}</h4>
                    <Badge
                      variant={session.status === "completed" ? "default" : "destructive"}
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.time}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-muted-foreground">{session.notes}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
