import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface GHLSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GHLSettingsModal({ open, onOpenChange }: GHLSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState({
    locationId: "",
    smsEnabled: true,
    emailEnabled: true,
  });

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
        .select('*')
        .eq('trainer_id', user.id)
        .single();

      if (data) {
        setConfig({
          locationId: data.location_id,
          smsEnabled: data.sms_enabled,
          emailEnabled: data.email_enabled,
        });
        setConnected(true);
      }
    } catch (error) {
      console.error('Error loading GHL config:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!config.locationId) {
        toast.error('Please enter a Location ID');
        return;
      }

      const { error } = await supabase
        .from('ghl_config')
        .upsert({
          trainer_id: user.id,
          location_id: config.locationId,
          sms_enabled: config.smsEnabled,
          email_enabled: config.emailEnabled,
          default_channel: config.smsEnabled && config.emailEnabled ? 'both' : 
                         config.smsEnabled ? 'sms' : 'email',
        });

      if (error) throw error;

      setConnected(true);
      toast.success('GHL settings saved successfully');
    } catch (error: any) {
      console.error('Error saving GHL config:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ghl-integration', {
        body: {
          action: 'send_message',
          contactData: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '+1234567890',
          },
          messageData: {
            content: 'This is a test message from TrainU AI Agent',
            subject: 'Test Message',
          },
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Test message sent successfully! Check your GHL account.');
      } else {
        toast.error('Test message failed. Check console for details.');
      }
    } catch (error: any) {
      console.error('Test message error:', error);
      toast.error(error.message || 'Failed to send test message');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            GoHighLevel Integration
            {connected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="locationId">Location ID</Label>
              <Input
                id="locationId"
                value={config.locationId}
                onChange={(e) => setConfig({ ...config, locationId: e.target.value })}
                placeholder="Enter your GHL Location ID"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find this in your GHL account settings
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms">Enable SMS</Label>
                  <p className="text-xs text-muted-foreground">
                    Send messages via SMS
                  </p>
                </div>
                <Switch
                  id="sms"
                  checked={config.smsEnabled}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, smsEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email">Enable Email</Label>
                  <p className="text-xs text-muted-foreground">
                    Send messages via Email
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={config.emailEnabled}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, emailEnabled: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">API Credentials Configured</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                GHL API Base URL
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                GHL Access Token
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Webhook Secret
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>
            <Button
              onClick={handleTest}
              disabled={testing || !connected}
              variant="outline"
            >
              {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
