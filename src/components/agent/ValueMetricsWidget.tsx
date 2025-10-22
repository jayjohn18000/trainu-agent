import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ring } from "@/components/ui/Ring";
import { Clock, Send, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { useAchievementTracker } from "@/hooks/useAchievementTracker";

interface ValueMetricsWidgetProps {
  queueCount?: number;
  feedCount?: number;
}

export function ValueMetricsWidget({ queueCount = 0, feedCount = 0 }: ValueMetricsWidgetProps) {
  const { progress } = useTrainerGamification();
  const { userStats } = useAchievementTracker();

  // Calculate time saved (3 minutes per message)
  const timeSavedMinutes = userStats.messagesSentTotal * 3;
  const timeSavedHours = Math.floor(timeSavedMinutes / 60);
  const timeSavedDisplay = timeSavedHours > 0 
    ? `${timeSavedHours}h ${timeSavedMinutes % 60}m`
    : `${timeSavedMinutes}m`;

  // Calculate response rate (approved / total)
  const totalMessages = userStats.messagesSentTotal + userStats.messagesEdited;
  const responseRate = totalMessages > 0 
    ? Math.round((userStats.messagesSentTotal / totalMessages) * 100)
    : 95;

  const metricCards = [
    {
      icon: Clock,
      iconColor: "text-blue-500",
      label: "Time Saved",
      value: timeSavedDisplay,
      subtitle: `${userStats.messagesSentTotal} msgs approved`,
      percentage: Math.min(100, (timeSavedHours / 10) * 100), // Cap at 10 hours
    },
    {
      icon: Send,
      iconColor: "text-green-500",
      label: "Messages Sent",
      value: String(userStats.messagesSentTotal),
      subtitle: `${userStats.messagesEdited} edited`,
      percentage: (userStats.messagesSentTotal / Math.max(1, userStats.messagesSentTotal + 10)) * 100,
    },
    {
      icon: TrendingUp,
      iconColor: "text-purple-500",
      label: "Response Rate",
      value: `${responseRate}%`,
      subtitle: "Last 30 days",
      percentage: responseRate,
    },
    {
      icon: AlertTriangle,
      iconColor: "text-orange-500",
      label: "At-Risk Engaged",
      value: String(userStats.atRiskEngaged),
      subtitle: `${queueCount} in queue`,
      percentage: (userStats.atRiskEngaged / Math.max(1, userStats.atRiskEngaged + 5)) * 100,
    },
  ];

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          Your Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {metricCards.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${metric.iconColor}`} />
                      <p className="text-xs text-muted-foreground truncate">
                        {metric.label}
                      </p>
                    </div>
                    <p className="text-lg font-bold mb-0.5">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {metric.subtitle}
                    </p>
                  </div>
                  <Ring
                    percentage={metric.percentage}
                    size={32}
                    strokeWidth={3}
                    className="flex-shrink-0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
