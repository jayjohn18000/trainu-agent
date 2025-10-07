import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  weeks: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StreakDisplay({ weeks, className, size = "md" }: StreakDisplayProps) {
  if (weeks === 0) return null;

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
    <div className={cn("text-center space-y-1", className)}>
      <div className={cn("font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent", sizeClasses[size])}>
        🔥 {weeks} week{weeks !== 1 ? 's' : ''}
      </div>
      <div className={cn("text-muted-foreground", labelSizes[size])}>
        Current streak
      </div>
    </div>
  );
}
