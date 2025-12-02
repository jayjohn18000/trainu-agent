import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, TrendingUp } from "lucide-react";

interface ProgramsTabProps {
  programName?: string;
  programDuration?: number;
  sessionsCompleted?: number;
  totalSessions?: number;
  compliance?: number;
}

export function ProgramsTab({
  programName = "No program assigned",
  programDuration,
  sessionsCompleted = 0,
  totalSessions = 0,
  compliance = 0,
}: ProgramsTabProps) {
  const progressPercent = totalSessions > 0 ? (sessionsCompleted / totalSessions) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{programName}</h3>
            {programDuration && (
              <p className="text-sm text-muted-foreground mt-1">
                {programDuration} week program
              </p>
            )}
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Active
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium text-foreground">
                {sessionsCompleted} / {totalSessions} sessions
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Compliance</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{compliance}%</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Remaining</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{totalSessions - sessionsCompleted}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">On Track</span>
              </div>
              <p className="text-lg font-semibold text-success">Yes</p>
            </div>
          </div>
        </div>
      </Card>

      {!programName || programName === "No program assigned" ? (
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No program assigned yet. Assign a program from the Programs page.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
