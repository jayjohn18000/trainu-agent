import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeaderboardCardProps {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  change?: number;
  isCurrentUser?: boolean;
  category?: string;
}

export function LeaderboardCard({
  rank,
  userName,
  userAvatar,
  score,
  change = 0,
  isCurrentUser = false,
  category = "XP"
}: LeaderboardCardProps) {
  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30";
      default:
        return "bg-card/50 border-border/50";
    }
  };

  const getRankIcon = () => {
    if (rank <= 3) {
      return <Crown className="w-4 h-4 text-yellow-500" />;
    }
    return null;
  };

  const getChangeIcon = () => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02]",
        getRankStyle(),
        isCurrentUser && "ring-2 ring-primary/50"
      )}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background/80 font-bold text-sm">
        {getRankIcon() || `#${rank}`}
      </div>

      {/* User Info */}
      <Avatar className="w-10 h-10 border-2 border-background">
        <AvatarImage src={userAvatar} alt={userName} />
        <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("font-semibold truncate", isCurrentUser && "text-primary")}>
            {userName}
          </p>
          {isCurrentUser && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">You</Badge>
          )}
        </div>
        {change !== 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getChangeIcon()}
            <span>{Math.abs(change)} from last week</span>
          </div>
        )}
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="font-bold text-lg">{score.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{category}</div>
      </div>
    </div>
  );
}
