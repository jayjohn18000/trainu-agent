import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pause, Play, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AgentStatusBarProps {
  state: "active" | "paused" | "processing";
  currentAction?: string;
  lastUpdate?: Date;
  onToggle?: () => void;
}

export function AgentStatusBar({
  state,
  currentAction,
  lastUpdate,
  onToggle,
}: AgentStatusBarProps) {
  const stateConfig = {
    active: {
      label: "Active",
      variant: "default" as const,
      className: "bg-green-500/10 text-green-700 border-green-500/20",
    },
    paused: {
      label: "Paused",
      variant: "outline" as const,
      className: "bg-gray-500/10 text-gray-700 border-gray-500/20",
    },
    processing: {
      label: "Processing",
      variant: "secondary" as const,
      className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    },
  };

  const config = stateConfig[state];

  return (
    <div className="flex items-center gap-3">
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>

      {currentAction && (
        <div className="text-sm text-muted-foreground hidden sm:block">
          {currentAction}
        </div>
      )}

      {lastUpdate && (
        <div className="text-xs text-muted-foreground flex items-center gap-1 hidden md:flex">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(lastUpdate, { addSuffix: true })}
        </div>
      )}

      {onToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label={state === "paused" ? "Resume agent" : "Pause agent"}
        >
          {state === "paused" ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
