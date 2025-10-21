import { fixtures } from "@/lib/fixtures";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SettingsAgent() {
  const settings = fixtures.settings;

  if (!settings) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
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
              <Select defaultValue={settings.autonomy}>
                <SelectTrigger id="autonomy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review">Review All</SelectItem>
                  <SelectItem value="autosend">Auto-send Low Risk</SelectItem>
                  <SelectItem value="full">Full Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Message Tone</Label>
              <Select defaultValue={settings.tone}>
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
              <Select defaultValue={settings.length}>
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
              <Select defaultValue={settings.emoji}>
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
                  defaultValue={settings.quietStart}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quietEnd">End</Label>
                <Input
                  id="quietEnd"
                  type="time"
                  defaultValue={settings.quietEnd}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
