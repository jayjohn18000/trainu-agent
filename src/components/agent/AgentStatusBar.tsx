import { Badge } from "@/components/ui/badge";
import { statusBadgeVariants } from "@/lib/design-system/colors";
import { Button } from "@/components/ui/button";
import { Pause, Play, Clock } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!lastUpdate) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastUpdate.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stateConfig = {
    active: {
      label: "Active",
      variant: "success" as const,
      className: statusBadgeVariants.success,
    },
    paused: {
      label: "Paused",
      variant: "outline" as const,
      className: statusBadgeVariants.paused,
    },
    processing: {
      label: "Processing",
      variant: "info" as const,
      className: statusBadgeVariants.info,
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
          {formatTimer(elapsedTime)}
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
