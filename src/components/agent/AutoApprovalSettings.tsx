import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, TrendingUp, Zap } from "lucide-react";

interface AutoApprovalSettingsData {
  enabled: boolean;
  high_confidence_threshold: number;
  preview_window_minutes: number;
  max_daily_auto_approvals: number;
}

export function AutoApprovalSettings() {
  const [settings, setSettings] = useState<AutoApprovalSettingsData>({
    enabled: false,
    high_confidence_threshold: 0.90,
    preview_window_minutes: 15,
    max_daily_auto_approvals: 20,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadTodayCount();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("auto_approval_settings")
        .select("*")
        .eq("trainer_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          enabled: data.enabled,
          high_confidence_threshold: data.high_confidence_threshold,
          preview_window_minutes: data.preview_window_minutes,
          max_daily_auto_approvals: data.max_daily_auto_approvals,
        });
      }
    } catch (error) {
      console.error("Failed to load auto-approval settings:", error);
      toast({
        title: "Failed to load settings",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTodayCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("trainer_id", user.id)
        .eq("generated_by", "ai")
        .gte("auto_approval_at", todayStart.toISOString())
        .lte("auto_approval_at", new Date().toISOString());

      if (error) throw error;
      setTodayCount(count || 0);
    } catch (error) {
      console.error("Failed to load today's count:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("auto_approval_settings")
        .upsert({
          trainer_id: user.id,
          enabled: settings.enabled,
          high_confidence_threshold: settings.high_confidence_threshold,
          preview_window_minutes: settings.preview_window_minutes,
          max_daily_auto_approvals: settings.max_daily_auto_approvals,
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your auto-approval preferences have been updated.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const estimatedTimeSavings = () => {
    if (!settings.enabled) return 0;
    const avgReviewTime = 2; // 2 minutes per draft
    const estimatedDraftsPerDay = settings.max_daily_auto_approvals;
    return Math.round((estimatedDraftsPerDay * avgReviewTime * settings.high_confidence_threshold));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading settings...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Auto-Approval System
        </CardTitle>
        <CardDescription>
          Automatically approve high-confidence AI drafts after a preview window
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <div className="font-medium">Enable Auto-Approval</div>
            <div className="text-sm text-muted-foreground">
              High-confidence messages will be auto-approved after preview window
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Confidence Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Confidence Threshold</Label>
                <span className="text-sm font-medium">
                  {Math.round(settings.high_confidence_threshold * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.high_confidence_threshold * 100]}
                onValueChange={([value]) =>
                  setSettings({ ...settings, high_confidence_threshold: value / 100 })
                }
                min={70}
                max={95}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only messages with confidence ≥ this threshold will be auto-approved
              </p>
            </div>

            {/* Preview Window */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="preview-window">Preview Window</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="preview-window"
                    type="number"
                    min={5}
                    max={30}
                    value={settings.preview_window_minutes}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        preview_window_minutes: parseInt(e.target.value) || 15,
                      })
                    }
                    className="w-20 text-right"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Time you have to review and cancel auto-approval before it executes
              </p>
            </div>

            {/* Max Daily Auto-Approvals */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="max-daily">Max Daily Auto-Approvals</Label>
                <Input
                  id="max-daily"
                  type="number"
                  min={5}
                  max={50}
                  value={settings.max_daily_auto_approvals}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_daily_auto_approvals: parseInt(e.target.value) || 20,
                    })
                  }
                  className="w-20 text-right"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Today's auto-approvals:</span>
                <span className="font-medium">
                  {todayCount} / {settings.max_daily_auto_approvals}
                </span>
              </div>
            </div>

            {/* Estimated Time Savings */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Estimated Time Savings</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    ~{estimatedTimeSavings()} min/day
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on current settings and confidence threshold
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
