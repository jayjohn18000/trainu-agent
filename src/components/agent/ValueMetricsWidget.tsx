import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ring } from "@/components/ui/Ring";
import { Clock, Send, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ValueMetrics {
  timeSavedToday: number; // minutes
  timeSavedWeek: number;
  messagesSentToday: number;
  messagesSentWeek: number;
  responseRate30d: number; // percentage
  atRiskEngaged: number;
}

// Mock data - will be replaced with real data from API
const mockMetrics: ValueMetrics = {
  timeSavedToday: 45,
  timeSavedWeek: 215,
  messagesSentToday: 9,
  messagesSentWeek: 43,
  responseRate30d: 87,
  atRiskEngaged: 3,
};

export function ValueMetricsWidget() {
  const metrics = mockMetrics;

  const metricCards = [
    {
      icon: Clock,
      label: "Time Saved",
      value: `${metrics.timeSavedToday}m`,
      subtitle: `${metrics.timeSavedWeek}m this week`,
      percentage: (metrics.timeSavedToday / 60) * 100, // out of 1 hour
      color: "hsl(var(--primary))",
    },
    {
      icon: Send,
      label: "Messages Sent",
      value: metrics.messagesSentToday,
      subtitle: `${metrics.messagesSentWeek} this week`,
      percentage: (metrics.messagesSentToday / 20) * 100, // out of 20 daily
      color: "hsl(var(--success))",
    },
    {
      icon: TrendingUp,
      label: "Response Rate",
      value: `${metrics.responseRate30d}%`,
      subtitle: "Last 30 days",
      percentage: metrics.responseRate30d,
      color: "hsl(var(--warning))",
    },
    {
      icon: Users,
      label: "At-Risk Engaged",
      value: metrics.atRiskEngaged,
      subtitle: "This week",
      percentage: (metrics.atRiskEngaged / 5) * 100, // out of 5 target
      color: "hsl(var(--info))",
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-6">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <Ring
                    percentage={Math.min(metric.percentage, 100)}
                    size={64}
                    strokeWidth={6}
                    label=""
                    className=""
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
