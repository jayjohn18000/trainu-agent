import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

interface IntegrationHealthBadgeProps {
  status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'warning';
}

export function IntegrationHealthBadge({ status }: IntegrationHealthBadgeProps) {
  const statusConfig = {
    connected: {
      variant: 'default' as const,
      icon: CheckCircle2,
      label: 'Connected',
      className: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    disconnected: {
      variant: 'secondary' as const,
      icon: XCircle,
      label: 'Disconnected',
      className: 'bg-muted text-muted-foreground',
    },
    error: {
      variant: 'destructive' as const,
      icon: AlertTriangle,
      label: 'Error',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    syncing: {
      variant: 'secondary' as const,
      icon: Clock,
      label: 'Syncing',
      className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    warning: {
      variant: 'secondary' as const,
      icon: AlertTriangle,
      label: 'Warning',
      className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1.5 ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

