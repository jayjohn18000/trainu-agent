import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { AutoApprovalSettings } from "@/components/agent/AutoApprovalSettings";
import { AutoApprovalAnalytics } from "@/components/agent/AutoApprovalAnalytics";
import { LearningInsights } from "@/components/agent/LearningInsights";
import { GHLSettingsModal } from "@/components/modals/GHLSettingsModal";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getDbFlag, setDbFlag } from "@/lib/flags";
import type { AgentSettings } from "@/types/agent";

export default function SettingsAgent() {
  const [settings, setSettings] = useState<AgentSettings>({
    autonomy: "review",
    tone: "casual",
    length: "concise",
    emoji: "rarely",
    quietStart: "21:00",
    quietEnd: "09:00"
  });
  const [saving, setSaving] = useState(false);
  const [ghlModalOpen, setGhlModalOpen] = useState(false);
  const [flags, setFlags] = useState<{ 
    ai_drafts_on: boolean | null; 
    approve_all_safe_on: boolean | null; 
    digest_on: boolean | null; 
    streaks_on: boolean | null 
  }>({ 
    ai_drafts_on: null, 
    approve_all_safe_on: null, 
    digest_on: null, 
    streaks_on: null 
  });
  
  const [trainerId, setTrainerId] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) {
        setTrainerId(data.user.id);
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      const [ai, safe, digest, streaks] = await Promise.all([
        getDbFlag("ai_drafts_on"),
        getDbFlag("approve_all_safe_on"),
        getDbFlag("digest_on"),
        getDbFlag("streaks_on"),
      ]);
      setFlags({ ai_drafts_on: ai, approve_all_safe_on: safe, digest_on: digest, streaks_on: streaks });
    })();
  }, []);

  const toggleFlag = async (key: keyof typeof flags) => {
    const current = flags[key] ?? false;
    const next = !current;
    setFlags((f) => ({ ...f, [key]: next }));
    await setDbFlag(key, next);
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your agent preferences have been updated.",
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "Profile updated!", description: "Your changes have been saved successfully." });
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "Preferences saved!", description: "Your notification settings have been updated." });
    setSaving(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({ 
        title: "Signed out successfully", 
        description: "You have been logged out of your account." 
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ 
        title: "Error signing out", 
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, agent preferences, and notifications
        </p>
      </div>

      <Tabs defaultValue="agent" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="flags">Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="agent" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Behavior</CardTitle>
              <CardDescription>
                Control how the AI agent operates and communicates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="autonomy">Autonomy Level</Label>
                <Select
                  value={settings.autonomy}
                  onValueChange={(value: any) =>
                    setSettings({ ...settings, autonomy: value })
                  }
                >
                  <SelectTrigger id="autonomy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">Review All</SelectItem>
                    <SelectItem value="autosend">Auto-send Low Risk</SelectItem>
                    <SelectItem value="full">Full Auto</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Review All: You approve every message. Auto-send: Messages with
                  80%+ confidence are sent automatically. Full Auto: All messages
                  sent automatically.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Message Tone</Label>
                <Select
                  value={settings.tone}
                  onValueChange={(value: any) =>
                    setSettings({ ...settings, tone: value })
                  }
                >
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Message Length</Label>
                <Select
                  value={settings.length}
                  onValueChange={(value: any) =>
                    setSettings({ ...settings, length: value })
                  }
                >
                  <SelectTrigger id="length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emoji">Emoji Usage</Label>
                <Select
                  value={settings.emoji}
                  onValueChange={(value: any) =>
                    setSettings({ ...settings, emoji: value })
                  }
                >
                  <SelectTrigger id="emoji">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                    <SelectItem value="often">Often</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                No messages will be sent during these hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quietStart">Start</Label>
                  <Input
                    id="quietStart"
                    type="time"
                    value={settings.quietStart}
                    onChange={(e) =>
                      setSettings({ ...settings, quietStart: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quietEnd">End</Label>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={settings.quietEnd}
                    onChange={(e) =>
                      setSettings({ ...settings, quietEnd: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <AutoApprovalSettings />

          {trainerId && <AutoApprovalAnalytics trainerId={trainerId} />}

          <LearningInsights />

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="metric-card max-w-2xl space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Sarah Chen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="sarah@trainu.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" defaultValue="San Francisco, CA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="10+ years coaching elite athletes and everyday fitness enthusiasts."
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            
            <div className="border-t pt-4 mt-6">
              <Button 
                onClick={handleSignOut} 
                variant="destructive" 
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="metric-card max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your activity
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming sessions
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Progress Updates</p>
                <p className="text-sm text-muted-foreground">
                  Notifications about client progress
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-muted-foreground">
                  Receive tips and promotional content
                </p>
              </div>
              <Switch />
            </div>
            <Button onClick={handleSaveNotifications} disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <div className="metric-card max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">GoHighLevel Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your GHL account to sync contacts and automate workflows
              </p>
              <Button onClick={() => setGhlModalOpen(true)}>
                Configure GoHighLevel
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="flags" className="mt-6">
          <div className="metric-card max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AI Drafts</p>
                <p className="text-sm text-muted-foreground">Generate AI message drafts automatically</p>
              </div>
              <Switch checked={!!flags.ai_drafts_on} onCheckedChange={() => toggleFlag("ai_drafts_on")} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Approve All Safe</p>
                <p className="text-sm text-muted-foreground">Enable one-click approve for ≥80% confidence</p>
              </div>
              <Switch checked={!!flags.approve_all_safe_on} onCheckedChange={() => toggleFlag("approve_all_safe_on")} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Digest</p>
                <p className="text-sm text-muted-foreground">Receive a daily summary of actions</p>
              </div>
              <Switch checked={!!flags.digest_on} onCheckedChange={() => toggleFlag("digest_on")} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Streaks</p>
                <p className="text-sm text-muted-foreground">Show trainer streak counters</p>
              </div>
              <Switch checked={!!flags.streaks_on} onCheckedChange={() => toggleFlag("streaks_on")} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <GHLSettingsModal open={ghlModalOpen} onOpenChange={setGhlModalOpen} />
    </div>
  );
}
