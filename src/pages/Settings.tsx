import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { getDbFlag, setDbFlag } from "@/lib/flags";

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [flags, setFlags] = useState<{ ai_drafts_on: boolean | null; approve_all_safe_on: boolean | null; digest_on: boolean | null; streaks_on: boolean | null }>({ ai_drafts_on: null, approve_all_safe_on: null, digest_on: null, streaks_on: null });

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "Profile updated!", description: "Your changes have been saved successfully." });
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "Password updated!", description: "Your password has been changed successfully." });
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "Preferences saved!", description: "Your notification settings have been updated." });
    setSaving(false);
  };

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and notifications.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
        </TabsList>

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
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="metric-card max-w-2xl space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button onClick={handleUpdatePassword} disabled={saving}>
              {saving ? "Updating..." : "Update Password"}
            </Button>
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
    </div>
  );
}
