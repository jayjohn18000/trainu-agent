import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, TrendingUp, Zap } from "lucide-react";
import { useAutoApprovalStats } from "@/hooks/queries/useAutoApprovalStats";

interface AutoApprovalAnalyticsProps {
  trainerId: string;
}

export function AutoApprovalAnalytics({ trainerId }: AutoApprovalAnalyticsProps) {
  const { data: stats, isLoading } = useAutoApprovalStats(trainerId);

  if (isLoading || !stats?.settings?.enabled) {
    return null;
  }

  const { todayCount, weekCount, pendingCount, settings } = stats;
  const dailyLimit = settings?.max_daily_auto_approvals || 20;
  const percentOfLimit = (todayCount / dailyLimit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Auto-Approval Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              Auto-Approved Today
            </div>
            <div className="text-2xl font-bold">
              {todayCount}
              <span className="text-sm text-muted-foreground font-normal">
                {" "}/ {dailyLimit}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(percentOfLimit, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Pending Auto-Approval
            </div>
            <div className="text-2xl font-bold">{pendingCount}</div>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                Next check in ~5 min
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            This Week
          </div>
          <div className="text-lg font-semibold">{weekCount} messages auto-approved</div>
          <div className="text-sm text-muted-foreground">
            ~{Math.round((weekCount / 7) * 45)} minutes saved
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
