import { cn } from "@/lib/utils";
import { Check, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface ChallengeCardProps {
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  xpReward: number;
  expiresAt: string;
  isCompleted?: boolean;
  className?: string;
  compact?: boolean;
}

const typeColors = {
  daily: "from-info/20 to-info/10 border-info/30",
  weekly: "from-warning/20 to-warning/10 border-warning/30",
  monthly: "from-primary/20 to-primary/10 border-primary/30",
};

const typeLabels = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly Quest",
};

export function ChallengeCard({
  title,
  description,
  type,
  progress,
  xpReward,
  expiresAt,
  isCompleted = false,
  className,
  compact = false,
}: ChallengeCardProps) {
  const timeLeft = new Date(expiresAt).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  if (compact) {
    return (
      <Card className={cn(
        "p-3 bg-gradient-to-r border transition-all duration-base",
        isCompleted ? "opacity-70" : typeColors[type],
        className
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            isCompleted ? "bg-success/20" : "bg-background/50"
          )}>
            {isCompleted ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <Target className="w-5 h-5 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {typeLabels[type]}
              </span>
              {!isCompleted && (
                <span className="text-xs text-muted-foreground">
                  • {hoursLeft}h left
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground truncate">
              {title}
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-background/50">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              +{xpReward}
            </span>
          </div>
        </div>

        {!isCompleted && (
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn(
      "p-4 bg-gradient-to-br border transition-all duration-base hover:scale-[1.02]",
      isCompleted ? "opacity-70" : typeColors[type],
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isCompleted ? "bg-success/20" : "bg-background/50"
          )}>
            {isCompleted ? (
              <Check className="w-6 h-6 text-success" />
            ) : (
              <Target className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {typeLabels[type]}
            </span>
            <h4 className="text-base font-semibold text-foreground">
              {title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/50 border border-primary/20">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">
            +{xpReward} XP
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {description}
      </p>

      {!isCompleted && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{progress}% complete</span>
            <span className="text-muted-foreground">{hoursLeft}h remaining</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center gap-2 text-success">
          <Check className="w-4 h-4" />
          <span className="text-sm font-semibold">Challenge completed!</span>
        </div>
      )}
    </Card>
  );
}
