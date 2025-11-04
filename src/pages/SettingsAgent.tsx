import { useState } from "react";
import { fixtures } from "@/lib/fixtures";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { AgentSettings } from "@/types/agent";
import { AutoApprovalSettings } from "@/components/agent/AutoApprovalSettings";
import { LearningInsights } from "@/components/agent/LearningInsights";

export default function SettingsAgent() {
  const [settings, setSettings] = useState<AgentSettings | null>(
    fixtures.settings
  );
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  if (!settings) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Settings not available
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
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

        <LearningInsights />

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
