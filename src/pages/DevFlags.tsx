import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, RotateCcw } from "lucide-react";
import { resetDB } from "@/lib/mock/db";
import { toast } from "@/hooks/use-toast";

const FLAGS = {
  COMMUNITY_ENABLED: true,
  AFFILIATE_ENABLED: true,
  CREATORS_ENABLED: true,
  GOALS_ENABLED: true,
  INBOX_ENABLED: true,
  ANALYTICS_ENABLED: true,
};

export default function DevFlags() {
  const [flags, setFlags] = useState(FLAGS);

  useEffect(() => {
    const stored = localStorage.getItem('feature-flags');
    if (stored) {
      setFlags({ ...FLAGS, ...JSON.parse(stored) });
    }
  }, []);

  const toggleFlag = (key: keyof typeof FLAGS) => {
    const updated = { ...flags, [key]: !flags[key] };
    setFlags(updated);
    localStorage.setItem('feature-flags', JSON.stringify(updated));
    toast({
      title: "Flag updated",
      description: `${key} is now ${updated[key] ? 'enabled' : 'disabled'}`
    });
  };

  const handleReset = () => {
    resetDB();
    toast({
      title: "Data reset",
      description: "All demo data has been reset. Refresh the page to see changes."
    });
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Developer Tools</h1>
          <p className="text-muted-foreground">Feature flags and data management</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Feature Flags</h2>
          {Object.entries(flags).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm text-muted-foreground">
                  {value ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={() => toggleFlag(key as keyof typeof FLAGS)}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-xl font-semibold">Data Management</h2>
          <Button 
            variant="destructive" 
            className="gap-2 w-full" 
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            Reset All Demo Data
          </Button>
          <p className="text-sm text-muted-foreground">
            This will clear all data and reseed with initial demo content. The page will refresh automatically.
          </p>
        </div>
      </Card>
    </div>
  );
}
