import { Badge } from "./badge";
import { Crown } from "lucide-react";

interface WhopBadgeProps {
  tier?: string;
  className?: string;
}

export function WhopBadge({ tier = "Pro Member", className }: WhopBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`gap-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 ${className}`}
    >
      <Crown className="h-3 w-3 text-purple-500" />
      <span>{tier}</span>
    </Badge>
  );
}
