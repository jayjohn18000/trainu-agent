import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak?: number;
  longestStreak?: number;
  weeks?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StreakDisplay({ currentStreak, longestStreak, weeks, className, size = "md" }: StreakDisplayProps) {
  const displayWeeks = currentStreak ?? weeks ?? 0;
  if (displayWeeks === 0) return null;

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={cn("p-4 rounded-lg border bg-card space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className={cn("font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent", sizeClasses[size])}>
            🔥 {displayWeeks} week{displayWeeks !== 1 ? 's' : ''}
          </div>
          <div className={cn("text-muted-foreground", labelSizes[size])}>
            Current streak
          </div>
        </div>
        {longestStreak !== undefined && longestStreak > 0 && (
          <div className="text-right space-y-1">
            <div className={cn("font-semibold text-foreground", labelSizes[size])}>
              {longestStreak} weeks
            </div>
            <div className={cn("text-muted-foreground", labelSizes[size])}>
              Longest
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
