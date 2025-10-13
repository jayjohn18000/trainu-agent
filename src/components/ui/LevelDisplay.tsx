import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface LevelDisplayProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
  className?: string;
  compact?: boolean;
}

export function LevelDisplay({ 
  level, 
  xp, 
  xpToNextLevel, 
  title, 
  className,
  compact = false
}: LevelDisplayProps) {
  const percentage = (xp / xpToNextLevel) * 100;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Level {level}</span>
        </div>
        <div className="flex-1 max-w-[120px]">
          <Progress value={percentage} className="h-1.5" />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {xp}/{xpToNextLevel} XP
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Level {level}</span>
          </div>
          <span className="text-sm text-muted-foreground">• {title}</span>
        </div>
        <span className="text-sm font-medium text-foreground">
          {xp}/{xpToNextLevel} XP
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
