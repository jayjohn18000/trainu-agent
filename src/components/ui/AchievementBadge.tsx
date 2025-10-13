import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked: boolean;
  progress?: number;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const tierColors = {
  bronze: "from-amber-600/20 to-amber-800/20 border-amber-600/40",
  silver: "from-gray-400/20 to-gray-600/20 border-gray-400/40",
  gold: "from-yellow-400/20 to-yellow-600/20 border-yellow-400/40",
  platinum: "from-purple-400/20 to-purple-600/20 border-purple-400/40",
};

const tierGlow = {
  bronze: "shadow-[0_0_20px_rgba(217,119,6,0.3)]",
  silver: "shadow-[0_0_20px_rgba(156,163,175,0.3)]",
  gold: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
  platinum: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
};

const sizes = {
  sm: "w-16 h-16 text-2xl",
  md: "w-20 h-20 text-3xl",
  lg: "w-24 h-24 text-4xl",
};

export function AchievementBadge({
  name,
  description,
  icon,
  tier,
  unlocked,
  progress,
  onClick,
  size = "md",
}: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl p-4 border transition-all duration-base",
        unlocked 
          ? `bg-gradient-to-br ${tierColors[tier]} ${tierGlow[tier]} cursor-pointer hover:scale-105` 
          : "bg-card/50 border-border/50 cursor-default",
        onClick && "cursor-pointer"
      )}
      onClick={unlocked ? onClick : undefined}
    >
      {/* Badge Icon */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "rounded-full flex items-center justify-center transition-all duration-base",
            sizes[size],
            unlocked
              ? `bg-gradient-to-br ${tierColors[tier]}`
              : "bg-muted/30 grayscale opacity-40"
          )}
        >
          {unlocked ? (
            <span className="animate-scale-in">{icon}</span>
          ) : (
            <Lock className="w-1/3 h-1/3 text-muted-foreground" />
          )}
        </div>

        {/* Badge Info */}
        <div className="text-center space-y-1">
          <h4 className={cn(
            "font-semibold text-sm",
            unlocked ? "text-foreground" : "text-muted-foreground"
          )}>
            {name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Progress Bar for Locked Badges */}
        {!unlocked && progress !== undefined && (
          <div className="w-full space-y-1">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-center">
              {progress}% complete
            </p>
          </div>
        )}

        {/* Tier Badge */}
        {unlocked && (
          <div className="absolute top-2 right-2">
            <div className={cn(
              "px-2 py-0.5 rounded-full text-xs font-semibold uppercase",
              tier === 'bronze' && "bg-amber-600/20 text-amber-400 border border-amber-600/40",
              tier === 'silver' && "bg-gray-400/20 text-gray-300 border border-gray-400/40",
              tier === 'gold' && "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40",
              tier === 'platinum' && "bg-purple-400/20 text-purple-300 border border-purple-400/40"
            )}>
              {tier}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
