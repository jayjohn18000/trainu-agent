import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, RefreshCw, Activity, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  getSyncConflicts, 
  getSyncMetrics, 
  resolveConflict, 
  registerWebhook, 
  triggerManualSync 
} from "@/lib/api/ghl-sync";

export function GHLSyncStatus() {
  const queryClient = useQueryClient();
  
  const { data: syncHealth, isLoading, refetch } = useQuery({
    queryKey: ['ghl-sync-health'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ghl_sync_health')
        .select('*')
        .eq('trainer_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: conflicts = [] } = useQuery({
    queryKey: ['ghl-sync-conflicts'],
    queryFn: getSyncConflicts,
    refetchInterval: 60000,
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['ghl-sync-metrics'],
    queryFn: () => getSyncMetrics(5),
    refetchInterval: 60000,
  });

  const registerWebhookMutation = useMutation({
    mutationFn: registerWebhook,
    onSuccess: () => {
      toast.success("Webhook registered successfully");
      queryClient.invalidateQueries({ queryKey: ['ghl-sync-health'] });
    },
    onError: (error) => {
      toast.error(`Failed to register webhook: ${error.message}`);
    },
  });

  const manualSyncMutation = useMutation({
    mutationFn: triggerManualSync,
    onSuccess: () => {
      toast.success("Manual sync triggered");
      setTimeout(() => refetch(), 2000);
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  const resolveConflictMutation = useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: 'trainu_wins' | 'ghl_wins' }) => 
      resolveConflict(id, resolution),
    onSuccess: () => {
      toast.success("Conflict resolved");
      queryClient.invalidateQueries({ queryKey: ['ghl-sync-conflicts'] });
    },
    onError: (error) => {
      toast.error(`Failed to resolve: ${error.message}`);
    },
  });

  const avgDuration = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.duration_ms || 0), 0) / metrics.length)
    : 0;

  const avgThroughput = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + (m.throughput_per_min || 0), 0) / metrics.length).toFixed(1)
    : '0';

  const successRate = metrics.length > 0
    ? ((metrics.reduce((sum, m) => sum + m.records_succeeded, 0) / 
        metrics.reduce((sum, m) => sum + m.records_processed, 0)) * 100).toFixed(1)
    : '100';

  const getStatusBadge = () => {
    if (!syncHealth?.health_status) return <Badge variant="outline">Unknown</Badge>;
    
    const statusConfig: Record<string, { variant: any; icon: any; label: string }> = {
      healthy: { variant: "default", icon: CheckCircle2, label: "Healthy" },
      warning: { variant: "secondary", icon: Clock, label: "Warning" },
      error: { variant: "destructive", icon: XCircle, label: "Error" },
      never_synced: { variant: "outline", icon: Clock, label: "Never Synced" },
    };

    const config = statusConfig[syncHealth.health_status] || statusConfig.never_synced;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-8 bg-muted rounded w-1/2" />
        </div>
      </Card>
    );
  }

  if (!syncHealth) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          No GHL integration configured yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">GHL Sync Status</h3>
          <p className="text-sm text-muted-foreground">Bidirectional sync with GoHighLevel</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => registerWebhookMutation.mutate()}
            size="sm"
            variant="outline"
            disabled={registerWebhookMutation.isPending}
          >
            <Zap className="h-4 w-4 mr-2" />
            Register Webhook
          </Button>
          <Button 
            onClick={() => manualSyncMutation.mutate()}
            size="sm"
            variant="outline"
            disabled={manualSyncMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${manualSyncMutation.isPending ? 'animate-spin' : ''}`} />
            Manual Sync
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Current Status</p>
            <p className="text-xs text-muted-foreground">
              {syncHealth.last_sync_at 
                ? `Last synced ${format(new Date(syncHealth.last_sync_at), 'PPp')}`
                : 'Never synced'
              }
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {syncHealth.last_sync_error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm font-semibold text-destructive mb-1">Last Sync Error</p>
          <p className="text-xs text-muted-foreground font-mono">{syncHealth.last_sync_error}</p>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-900 dark:text-yellow-100">
              {conflicts.length} Sync Conflict{conflicts.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
            Data was modified in both TrainU and GHL. Choose which version to keep:
          </p>
          {conflicts.slice(0, 3).map((conflict) => (
            <div key={conflict.id} className="flex items-center justify-between py-2 border-t border-yellow-200 dark:border-yellow-800">
              <span className="text-sm">
                {conflict.entity_type}: {conflict.entity_id.slice(0, 8)}...
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveConflictMutation.mutate({ id: conflict.id, resolution: 'trainu_wins' })}
                >
                  Keep TrainU
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveConflictMutation.mutate({ id: conflict.id, resolution: 'ghl_wins' })}
                >
                  Keep GHL
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Contacts</p>
          <p className="text-2xl font-bold">{syncHealth.contacts_synced || 0}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Conversations</p>
          <p className="text-2xl font-bold">{syncHealth.conversations_synced || 0}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Appointments</p>
          <p className="text-2xl font-bold">{syncHealth.appointments_synced || 0}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Syncs</p>
          <p className="text-2xl font-bold">{syncHealth.total_sync_count || 0}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Conflicts</p>
          <p className="text-2xl font-bold text-yellow-600">{conflicts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
          <p className="text-lg font-semibold">{avgDuration}ms</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Throughput</p>
          <p className="text-lg font-semibold">{avgThroughput}/min</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
          <p className="text-lg font-semibold">{successRate}%</p>
        </div>
      </div>
    </Card>
  );
}
