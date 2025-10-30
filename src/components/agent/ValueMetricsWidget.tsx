import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ring } from "@/components/ui/Ring";
import { CalendarCheck2, RefreshCw, Send, AlertTriangle, Sparkles } from "lucide-react";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { useAchievementTracker } from "@/hooks/useAchievementTracker";
import { useCountUp } from "@/hooks/useCountUp";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ValueMetricsWidgetProps {
  queueCount?: number;
  feedCount?: number;
}

export function ValueMetricsWidget({ queueCount = 0, feedCount = 0 }: ValueMetricsWidgetProps) {
  const { progress } = useTrainerGamification();
  const { userStats } = useAchievementTracker();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [draftsCount, setDraftsCount] = useState<number>(0);
  const [atRiskCount, setAtRiskCount] = useState<number>(0);
  const [confirmedToday, setConfirmedToday] = useState<number>(0);
  const [rescheduledToday, setRescheduledToday] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const isoStart = startOfDay.toISOString();

        const [draftQ, riskQ, confirmedQ, reschedQ] = await Promise.all([
          supabase.from('messages').select('id', { count: 'exact', head: true }).in('status', ['draft']),
          supabase.from('insights').select('id', { count: 'exact', head: true }).gte('risk_score', 75),
          supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed').gte('updated_at', isoStart),
          supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'rescheduled').gte('updated_at', isoStart),
        ]);
        setDraftsCount(draftQ.count ?? 0);
        setAtRiskCount(riskQ.count ?? 0);
        setConfirmedToday(confirmedQ.count ?? 0);
        setRescheduledToday(reschedQ.count ?? 0);
      } catch {}
    };
    load();
  }, []);

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

  // Count-up animations
  const animatedTimeSavedHours = useCountUp(timeSavedHours, 800, 0, hasAnimated);
  const animatedMessagesSent = useCountUp(userStats.messagesSentTotal, 800, 0, hasAnimated);
  const animatedResponseRate = useCountUp(responseRate, 800, 0, hasAnimated);
  const animatedAtRiskEngaged = useCountUp(userStats.atRiskEngaged, 800, 0, hasAnimated);

  const metricCards = [
    {
      icon: CalendarCheck2,
      iconColor: "text-green-500",
      label: "Confirmed Today",
      value: String(confirmedToday),
      subtitle: "Bookings confirmed",
      percentage: Math.min(100, (confirmedToday / Math.max(1, confirmedToday + 5)) * 100),
    },
    {
      icon: RefreshCw,
      iconColor: "text-blue-500",
      label: "Rescheduled Today",
      value: String(rescheduledToday),
      subtitle: "Sessions moved",
      percentage: Math.min(100, (rescheduledToday / Math.max(1, rescheduledToday + 5)) * 100),
    },
    {
      icon: Send,
      iconColor: "text-purple-500",
      label: "Pending Drafts",
      value: String(draftsCount),
      subtitle: `${animatedMessagesSent} sent total`,
      percentage: Math.min(100, (draftsCount / Math.max(1, draftsCount + 10)) * 100),
    },
    {
      icon: AlertTriangle,
      iconColor: "text-orange-500",
      label: "At Risk",
      value: String(atRiskCount),
      subtitle: ">= 75 risk score",
      percentage: Math.min(100, (atRiskCount / Math.max(1, atRiskCount + 10)) * 100),
    },
  ];

  return (
    <Card className="border-border" data-tour="metrics">
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
                    <p className="text-lg font-bold mb-0.5 animate-count-up">{metric.value}</p>
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
