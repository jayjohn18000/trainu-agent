import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fixtures } from "@/lib/fixtures";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [saving, setSaving] = useState(false);
  const settings = fixtures.settings;

  const handleSaveAgent = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "Agent settings updated!", description: "Your AI agent preferences have been saved." });
    setSaving(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="agent" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agent">Agent</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Agent Settings Tab */}
          <TabsContent value="agent" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Autonomy Level</Label>
                <Select defaultValue={settings?.autonomy || "review"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">Review All (safest)</SelectItem>
                    <SelectItem value="autosend">Auto-send Safe (80%+ confidence)</SelectItem>
                    <SelectItem value="full">Full Auto (experimental)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Control how much your AI agent can do on its own
                </p>
              </div>

              <div className="space-y-2">
                <Label>Message Tone</Label>
                <Select defaultValue={settings?.tone || "professional"}>
                  <SelectTrigger>
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
                <Label>Message Length</Label>
                <Select defaultValue={settings?.length || "medium"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise (50-100 chars)</SelectItem>
                    <SelectItem value="medium">Medium (100-300 chars)</SelectItem>
                    <SelectItem value="detailed">Detailed (300-500 chars)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quiet Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Don't send messages during these hours
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="time" 
                    defaultValue={settings?.quietStart || "21:00"} 
                    className="w-28" 
                  />
                  <span>to</span>
                  <Input 
                    type="time" 
                    defaultValue={settings?.quietEnd || "08:00"} 
                    className="w-28" 
                  />
                </div>
              </div>

              <Button onClick={handleSaveAgent} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Agent Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="space-y-4">
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
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
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
                  <p className="font-medium">Message Drafts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when agent drafts new messages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">At-Risk Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications about at-risk clients
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button onClick={handleSaveNotifications} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                View your achievements and progress in the gamification system
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Coming soon: Achievement gallery and badges
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
