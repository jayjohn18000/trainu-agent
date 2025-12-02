import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, ExternalLink, Settings } from "lucide-react";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon?: React.ReactNode;
  status: 'connected' | 'disconnected' | 'coming_soon';
  lastSync?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConfigure?: () => void;
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
  coming_soon: {
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    label: 'Coming Soon',
  },
};

export function IntegrationCard({
  name,
  description,
  icon,
  status,
  lastSync,
  onConnect,
  onDisconnect,
  onConfigure,
}: IntegrationCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className={`p-6 border ${config.border}`}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="p-3 rounded-xl bg-card border border-border flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border} flex-shrink-0`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          
          {lastSync && status === 'connected' && (
            <p className="text-xs text-muted-foreground mb-3">
              Last synced: {lastSync}
            </p>
          )}

          <div className="flex gap-2">
            {status === 'disconnected' && onConnect && (
              <Button size="sm" onClick={onConnect}>
                Connect
              </Button>
            )}
            {status === 'connected' && (
              <>
                {onConfigure && (
                  <Button size="sm" variant="outline" onClick={onConfigure}>
                    <Settings className="h-4 w-4 mr-1.5" />
                    Configure
                  </Button>
                )}
                {onDisconnect && (
                  <Button size="sm" variant="outline" onClick={onDisconnect}>
                    Disconnect
                  </Button>
                )}
              </>
            )}
            {status === 'coming_soon' && (
              <Button size="sm" variant="outline" disabled>
                Notify Me
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
