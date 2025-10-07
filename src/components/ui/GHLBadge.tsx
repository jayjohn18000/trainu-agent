import { Badge } from "./badge";
import { Zap } from "lucide-react";

interface GHLBadgeProps {
  text?: string;
  className?: string;
}

export function GHLBadge({ text = "Powered by GHL", className }: GHLBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`gap-1 text-xs ${className}`}
    >
      <Zap className="h-3 w-3" />
      <span>{text}</span>
    </Badge>
  );
}
