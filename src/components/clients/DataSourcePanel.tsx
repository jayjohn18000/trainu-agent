import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";

interface DataSourcePanelProps {
  name: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync?: string;
  icon?: React.ReactNode;
  activityCount?: number;
  onViewDetails?: () => void;
}

const statusConfig = {
  connected: {
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    label: 'Connected',
  },
  disconnected: {
    icon: XCircle,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
    label: 'Disconnected',
  },
  syncing: {
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    label: 'Syncing',
  },
};

export function DataSourcePanel({
  name,
  status,
  lastSync,
  icon,
  activityCount,
  onViewDetails,
}: DataSourcePanelProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className={`p-4 border ${config.border} ${config.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {icon && (
            <div className="p-2 rounded-lg bg-card border border-border">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon className={`h-4 w-4 ${config.color}`} />
              <span className={`text-sm ${config.color}`}>{config.label}</span>
            </div>
            {lastSync && (
              <p className="text-xs text-muted-foreground mt-1">
                Last synced: {lastSync}
              </p>
            )}
            {activityCount !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {activityCount} recent activities
              </p>
            )}
          </div>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-primary hover:text-primary-hover transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}
