import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface SyncHealth {
  trainer_id: string;
  location_id: string | null;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  contacts_synced: number;
  conversations_synced: number;
  appointments_synced: number;
  total_sync_count: number;
  health_status: string;
}

export function GHLSyncStatus() {
  const [syncHealth, setSyncHealth] = useState<SyncHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchSyncHealth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ghl_sync_health')
        .select('*')
        .eq('trainer_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sync health:', error);
        return;
      }

      setSyncHealth(data);
    } catch (error) {
      console.error('Error fetching sync health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSyncHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const triggerManualSync = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('ghl-sync', {
        body: { manual: true },
      });

      if (error) throw error;

      toast({
        title: "Sync triggered",
        description: "GHL data sync has been initiated. This may take a few minutes.",
      });

      // Refresh after 5 seconds
      setTimeout(fetchSyncHealth, 5000);
    } catch (error) {
      console.error('Error triggering sync:', error);
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to trigger sync",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getHealthBadge = () => {
    if (!syncHealth) return null;

    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, label: string }> = {
      healthy: { variant: "default", icon: CheckCircle2, label: "Healthy" },
      warning: { variant: "secondary", icon: Clock, label: "Delayed" },
      stale: { variant: "outline", icon: AlertCircle, label: "Stale" },
      error: { variant: "destructive", icon: AlertCircle, label: "Error" },
      never_synced: { variant: "outline", icon: Clock, label: "Never Synced" },
    };

    const config = variants[syncHealth.health_status] || variants.never_synced;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="metric-card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-8 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!syncHealth) {
    return (
      <div className="metric-card">
        <p className="text-sm text-muted-foreground">
          No GHL integration configured. Connect your GoHighLevel account to enable sync.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="metric-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">GHL Sync Status</h3>
            <p className="text-sm text-muted-foreground">
              Location: {syncHealth.location_id || 'Not configured'}
            </p>
          </div>
          {getHealthBadge()}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Last Sync</p>
            <p className="text-lg font-semibold text-foreground">
              {syncHealth.last_sync_at 
                ? formatDistanceToNow(new Date(syncHealth.last_sync_at), { addSuffix: true })
                : 'Never'
              }
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Syncs</p>
            <p className="text-lg font-semibold text-foreground">
              {syncHealth.total_sync_count}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{syncHealth.contacts_synced}</p>
            <p className="text-xs text-muted-foreground">Contacts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{syncHealth.conversations_synced}</p>
            <p className="text-xs text-muted-foreground">Messages</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{syncHealth.appointments_synced}</p>
            <p className="text-xs text-muted-foreground">Appointments</p>
          </div>
        </div>

        {syncHealth.last_sync_error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
            <p className="text-sm font-medium text-destructive mb-1">Last Error</p>
            <p className="text-xs text-muted-foreground font-mono">{syncHealth.last_sync_error}</p>
          </div>
        )}

        <Button 
          onClick={triggerManualSync} 
          disabled={syncing}
          className="w-full gap-2"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Manual Sync Now'}
        </Button>
      </div>

      <div className="metric-card">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">Automatic Sync Schedule</h4>
            <p className="text-sm text-muted-foreground">
              Your GHL data syncs automatically every 30 minutes. Webhooks provide real-time updates for messages and appointments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
