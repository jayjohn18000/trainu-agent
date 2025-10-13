import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Lock } from "lucide-react";
import { format } from "date-fns";

interface MilestoneCardProps {
  title: string;
  description: string;
  value: number;
  type: "sessions" | "streak" | "xp" | "session_count" | "pr" | "goal_completion";
  achieved: boolean;
  achievedAt?: string;
  className?: string;
}

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  sessions: {
    icon: "💪",
    label: "Sessions",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
  },
  session_count: {
    icon: "💪",
    label: "Sessions",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
  },
  streak: {
    icon: "🔥",
    label: "Streak",
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30"
  },
  xp: {
    icon: "⚡",
    label: "XP",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30"
  },
  pr: {
    icon: "🏆",
    label: "PR",
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30"
  },
  goal_completion: {
    icon: "🎯",
    label: "Goals",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30"
  }
};

export function MilestoneCard({
  title,
  description,
  value,
  type,
  achieved,
  achievedAt,
  className
}: MilestoneCardProps) {
  const config = typeConfig[type];

  return (
    <Card
      className={cn(
        "p-4 border transition-all",
        achieved
          ? `bg-gradient-to-br ${config.color} hover:scale-[1.02]`
          : "bg-card/50 border-border/30 opacity-60",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base">{title}</h3>
            {achieved ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">
              {value.toLocaleString()} {config.label}
            </span>
            {achieved && achievedAt && (
              <span className="text-muted-foreground">
                Achieved {format(new Date(achievedAt), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
