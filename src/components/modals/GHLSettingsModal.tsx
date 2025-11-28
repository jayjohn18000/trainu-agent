import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, RefreshCw, Wifi, WifiOff, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { invokeWithTimeout, TimeoutError } from "@/lib/api/supabase-with-timeout";

interface GHLSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GHLConfig {
  location_id: string | null;
  access_token: string | null;
  token_expires_at: string | null;
  webhook_registered: boolean;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  contacts_synced: number | null;
}

const OAUTH_TIMEOUT = 30000; // 30 seconds
const SYNC_TIMEOUT = 60000; // 60 seconds

export function GHLSettingsModal({ open, onOpenChange }: GHLSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [config, setConfig] = useState<GHLConfig | null>(null);

  useEffect(() => {
    if (open) {
      loadConfig();
      // Check for OAuth callback result
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('oauth') === 'success') {
        toast.success('GoHighLevel connected successfully!');
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (urlParams.get('error')) {
        toast.error(`Connection failed: ${urlParams.get('error')}`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [open]);

  const loadConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ghl_config')
        .select('location_id, access_token, token_expires_at, webhook_registered, last_sync_at, last_sync_status, last_sync_error, contacts_synced')
        .eq('trainer_id', user.id)
        .maybeSingle();

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading GHL config:', error);
    }
  };

  const handleConnectGHL = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in first');
        return;
      }

      // Call ghl-oauth-init with timeout
      const { data, error } = await invokeWithTimeout('ghl-oauth-init', {
        body: { redirect: '/settings-agent' },
        timeout: OAUTH_TIMEOUT,
      });

      if (error) {
        if (error instanceof TimeoutError) {
          toast.error('Connection timed out. Please try again.');
        } else {
          toast.error(error.message || 'Failed to start OAuth flow');
        }
        return;
      }

      if (data?.authUrl) {
        // Redirect to GHL OAuth consent screen
        window.location.href = data.authUrl;
      } else {
        throw new Error('No auth URL returned');
      }
    } catch (error: any) {
      console.error('OAuth init error:', error);
      toast.error(error.message || 'Failed to start OAuth flow');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await invokeWithTimeout('ghl-sync', {
        body: { trainerId: user.id },
        timeout: SYNC_TIMEOUT,
      });

      if (error) {
        if (error instanceof TimeoutError) {
          toast.error('Sync timed out. Please try again.');
        } else {
          toast.error(error.message || 'Sync failed');
        }
        return;
      }

      toast.success(`Synced ${data?.synced || 0} records from GHL`);
      await loadConfig();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(error.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleRegisterWebhook = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ghl-webhook-register', {
        body: { locationId: config?.location_id }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Real-time sync enabled');
        await loadConfig();
      }
    } catch (error: any) {
      console.error('Webhook registration failed:', error);
      toast.error('Webhook registration failed');
    }
  };

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const isConnected = config?.location_id && config?.access_token;
  const isTokenExpired = config?.token_expires_at 
    ? new Date(config.token_expires_at) < new Date() 
    : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            GoHighLevel Integration
            {isConnected && !isTokenExpired ? (
              <Badge variant="default" className="bg-green-500">Connected</Badge>
            ) : isConnected && isTokenExpired ? (
              <Badge variant="secondary" className="bg-amber-500">Token Expired</Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Connect your GHL account to sync contacts, messages, and appointments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* OAuth Connect Button */}
          {!isConnected ? (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click below to securely connect your GoHighLevel account. You'll be redirected to GHL to authorize access.
                </p>
                <Button
                  onClick={handleConnectGHL}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Connect with GoHighLevel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Connected to GHL</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Location ID: <code className="bg-muted px-1 rounded">{config.location_id}</code>
                </div>

                {isTokenExpired && (
                  <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded text-sm text-amber-700 dark:text-amber-300">
                    Your access token has expired. Please reconnect to continue syncing.
                  </div>
                )}
              </div>

              {/* Sync Status */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sync Status</span>
                  <Badge variant={config.last_sync_status === 'success' ? 'default' : config.last_sync_status === 'partial' ? 'secondary' : 'destructive'}>
                    {config.last_sync_status || 'Unknown'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Last Sync</span>
                    <p className="font-medium">{formatLastSync(config.last_sync_at)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contacts Synced</span>
                    <p className="font-medium">{config.contacts_synced || 0}</p>
                  </div>
                </div>

                {config.last_sync_error && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                    {config.last_sync_error}
                  </div>
                )}

                {/* Webhook Status */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  {config.webhook_registered ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Real-time sync enabled</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Webhook not registered</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleRegisterWebhook}
                        className="ml-auto text-xs"
                      >
                        Retry
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSync}
                  disabled={syncing || isTokenExpired}
                  variant="outline"
                  className="flex-1"
                >
                  {syncing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Sync Now
                </Button>
                <Button
                  onClick={handleConnectGHL}
                  disabled={loading}
                  variant={isTokenExpired ? "default" : "outline"}
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  {isTokenExpired ? 'Reconnect' : 'Reconnect'}
                </Button>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click connect to authorize via GoHighLevel</li>
              <li>Contacts, messages, and appointments sync automatically</li>
              <li>Changes in TrainU push back to GHL</li>
              <li>Real-time updates via webhooks</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
