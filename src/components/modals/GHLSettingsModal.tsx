import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, RefreshCw, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GHLSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GHLConfig {
  location_id: string | null;
  webhook_registered: boolean;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  contacts_synced: number | null;
}

export function GHLSettingsModal({ open, onOpenChange }: GHLSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [config, setConfig] = useState<GHLConfig | null>(null);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; location?: any; error?: string } | null>(null);

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ghl_config')
        .select('location_id, webhook_registered, last_sync_at, last_sync_status, last_sync_error, contacts_synced')
        .eq('trainer_id', user.id)
        .maybeSingle();

      if (data) {
        setConfig(data);
        setLocationId(data.location_id || "");
      }
    } catch (error) {
      console.error('Error loading GHL config:', error);
    }
  };

  const handleValidateAndConnect = async () => {
    if (!locationId.trim()) {
      toast.error('Please enter a Location ID');
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      // Validate location ID via edge function
      const { data, error } = await supabase.functions.invoke('ghl-validate-location', {
        body: { locationId: locationId.trim() }
      });

      if (error) throw error;

      setValidationResult(data);

      if (!data.valid) {
        toast.error(data.error || 'Invalid Location ID');
        return;
      }

      // Location is valid - save config
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use upsert with onConflict to properly update existing rows
      const { error: upsertError } = await supabase
        .from('ghl_config')
        .upsert({
          trainer_id: user.id,
          location_id: locationId.trim(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'trainer_id',
        });

      if (upsertError) throw upsertError;

      toast.success(`Connected to ${data.location?.name || 'GHL Location'}`);

      // Register webhook - pass locationId directly
      await handleRegisterWebhook(locationId.trim());

      // Trigger initial sync
      await handleSync();

      // Reload config
      await loadConfig();

    } catch (error: any) {
      console.error('Validation error:', error);
      toast.error(error.message || 'Failed to connect');
    } finally {
      setValidating(false);
    }
  };

  const handleRegisterWebhook = async (locId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ghl-webhook-register', {
        body: { locationId: locId || locationId.trim() }
      });
      
      if (error) {
        console.error('Webhook registration error:', error);
        toast.error('Webhook registration failed - real-time sync may be limited');
        return;
      }
      
      if (data?.success) {
        toast.success('Real-time sync enabled');
      }
    } catch (error: any) {
      console.error('Webhook registration failed:', error);
      toast.error('Webhook registration failed');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('ghl-sync', {
        body: { trainerId: user.id }
      });

      if (error) throw error;

      // Check for scope errors in the response
      if (data?.scopeErrors?.length > 0) {
        toast.warning('Sync completed with limited data - see details below');
      } else {
        toast.success(`Synced ${data?.synced || 0} records from GHL`);
      }
      
      await loadConfig();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(error.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const isScopeError = config?.last_sync_error?.includes('scope') || 
                       config?.last_sync_error?.includes('401') ||
                       config?.last_sync_error?.includes('Unauthorized');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            GoHighLevel Integration
            {config?.location_id ? (
              <Badge variant="default" className="bg-green-500">Connected</Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Connect your GHL location to sync contacts, messages, and appointments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location ID Input */}
          <div className="space-y-2">
            <Label htmlFor="locationId">Location ID</Label>
            <div className="flex gap-2">
              <Input
                id="locationId"
                value={locationId}
                onChange={(e) => {
                  setLocationId(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="e.g., abc123XYZ"
                className="flex-1"
              />
              <Button
                onClick={handleValidateAndConnect}
                disabled={validating || !locationId.trim()}
              >
                {validating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {config?.location_id ? 'Update' : 'Connect'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find this in GHL → Settings → Business Info → Location ID
            </p>
            
            {/* Validation Result */}
            {validationResult && (
              <div className={`p-3 rounded-lg text-sm ${validationResult.valid ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'}`}>
                {validationResult.valid ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Valid: {validationResult.location?.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <span>{validationResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Connection Status */}
          {config?.location_id && (
            <div className="space-y-4">
              {/* Scope Error Warning */}
              {isScopeError && (
                <Alert variant="destructive" className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-2">Missing GHL API Scopes</p>
                    <p className="text-xs mb-2">
                      Your GHL Private Integration needs additional permissions. In GHL, go to:
                    </p>
                    <ol className="text-xs list-decimal list-inside space-y-1 mb-2">
                      <li>Settings → Integrations → Private Integrations</li>
                      <li>Select your integration</li>
                      <li>Enable these scopes: <strong>contacts.readonly</strong>, <strong>contacts.write</strong>, <strong>conversations.readonly</strong>, <strong>calendars.readonly</strong></li>
                      <li>Save and generate a new API key</li>
                    </ol>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Contact support if you need help: hello@trainu.us
                    </p>
                  </AlertDescription>
                </Alert>
              )}

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

                {/* Sync Error Details */}
                {config.last_sync_error && !isScopeError && (
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
                        onClick={() => handleRegisterWebhook()}
                        className="ml-auto text-xs"
                      >
                        Retry
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Manual Sync Button */}
              <Button
                onClick={handleSync}
                disabled={syncing}
                variant="outline"
                className="w-full"
              >
                {syncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync Now
              </Button>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Enter your GHL Location ID to connect</li>
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
