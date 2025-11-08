import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Building2, Clock, Moon, FileUp, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CSVImport } from "./CSVImport";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

type Step = "studio" | "import" | "draft";

interface StudioData {
  studioName: string;
  timezone: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  defaultSessionLength: string;
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>("studio");
  const [loading, setLoading] = useState(false);
  const [studioData, setStudioData] = useState<StudioData>({
    studioName: "",
    timezone: "America/Chicago",
    quietHoursStart: "21:00",
    quietHoursEnd: "08:00",
    defaultSessionLength: "60",
  });
  const [importedCount, setImportedCount] = useState(0);
  const [draftGenerated, setDraftGenerated] = useState(false);

  const handleStudioSetup = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save trainer profile settings
      const { error } = await supabase
        .from("trainer_profiles")
        .upsert({
          id: user.id,
          studio_name: studioData.studioName,
          timezone: studioData.timezone,
          quiet_hours_start: studioData.quietHoursStart,
          quiet_hours_end: studioData.quietHoursEnd,
          default_session_length: parseInt(studioData.defaultSessionLength),
        });

      if (error) throw error;

      toast({ title: "Studio setup complete", description: "Moving to client import..." });
      setStep("import");
    } catch (error) {
      console.error("Studio setup error:", error);
      toast({
        title: "Setup failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportComplete = async (count: number) => {
    setImportedCount(count);
    setLoading(true);

    try {
      // Generate first draft
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.functions.invoke("generate-welcome-draft", {
        body: { trainerId: user.id },
      });

      if (error) throw error;

      setDraftGenerated(true);
      toast({
        title: "Welcome draft created!",
        description: `Generated check-in for ${count} clients. Review in AI Inbox.`,
      });
      setStep("draft");
    } catch (error) {
      console.error("Draft generation error:", error);
      toast({
        title: "Draft generation failed",
        description: "You can create drafts manually from the AI Inbox",
        variant: "destructive",
      });
      setStep("draft");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Mark onboarding complete
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          onboarding_completed: true,
        });

      if (error) throw error;

      toast({ title: "Setup complete!", description: "Welcome to TrainU Agent" });
      onComplete();
    } catch (error) {
      console.error("Complete error:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "studio" && "Welcome to TrainU Agent"}
            {step === "import" && "Import Your Clients"}
            {step === "draft" && "Your First AI Draft"}
          </DialogTitle>
        </DialogHeader>

        {/* Studio Setup */}
        {step === "studio" && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studioName" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Studio Name
                </Label>
                <Input
                  id="studioName"
                  value={studioData.studioName}
                  onChange={(e) => setStudioData({ ...studioData, studioName: e.target.value })}
                  placeholder="Your Studio Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timezone
                </Label>
                <Select
                  value={studioData.timezone}
                  onValueChange={(v) => setStudioData({ ...studioData, timezone: v })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quietStart" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Quiet Hours Start
                  </Label>
                  <Input
                    id="quietStart"
                    type="time"
                    value={studioData.quietHoursStart}
                    onChange={(e) => setStudioData({ ...studioData, quietHoursStart: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quietEnd">Quiet Hours End</Label>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={studioData.quietHoursEnd}
                    onChange={(e) => setStudioData({ ...studioData, quietHoursEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionLength">Default Session Length (minutes)</Label>
                <Input
                  id="sessionLength"
                  type="number"
                  value={studioData.defaultSessionLength}
                  onChange={(e) => setStudioData({ ...studioData, defaultSessionLength: e.target.value })}
                />
              </div>
            </div>

            <Button
              onClick={handleStudioSetup}
              disabled={!studioData.studioName || loading}
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Continue to Client Import
            </Button>
          </div>
        )}

        {/* CSV Import */}
        {step === "import" && (
          <div className="py-4">
            <CSVImport onImportComplete={handleImportComplete} />
          </div>
        )}

        {/* Draft Complete */}
        {step === "draft" && (
          <div className="space-y-6 py-4 text-center">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">You're All Set!</h3>
              <p className="text-muted-foreground mb-4">
                {draftGenerated
                  ? `Generated a welcome check-in for ${importedCount} clients.`
                  : "Your account is ready to use."}
              </p>
              <p className="text-sm text-muted-foreground">
                Head to the AI Inbox to review and approve your first draft.
              </p>
            </Card>

            <Button onClick={handleComplete} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Go to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
