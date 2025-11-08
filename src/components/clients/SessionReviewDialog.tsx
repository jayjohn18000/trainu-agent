import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { renderTemplate } from "@/lib/constants/messageTemplates";

interface SessionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
}

export function SessionReviewDialog({ open, onOpenChange, contactId, contactName }: SessionReviewDialogProps) {
  const [focus, setFocus] = useState("");
  const [microGoal, setMicroGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [draftCreated, setDraftCreated] = useState(false);

  const handleCreateDraft = async () => {
    if (!focus.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter what was focused on during the session",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use Lovable AI to generate personalized follow-up
      const { data, error } = await supabase.functions.invoke("generate-session-followup", {
        body: {
          trainerId: user.id,
          contactId,
          contactName: contactName.split(" ")[0], // First name only
          sessionFocus: focus,
          microGoal: microGoal || "maintaining consistency",
        },
      });

      if (error) throw error;

      setDraftCreated(true);
      toast({
        title: "Draft created!",
        description: `Post-session follow-up for ${contactName} ready for review`,
      });

      // Reset and close after brief delay
      setTimeout(() => {
        setDraftCreated(false);
        setFocus("");
        setMicroGoal("");
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to create draft:", error);
      toast({
        title: "Draft creation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Session Review: {contactName}</DialogTitle>
        </DialogHeader>

        {draftCreated ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-success" />
            <h3 className="text-lg font-semibold mb-2">Draft Created!</h3>
            <p className="text-sm text-muted-foreground">
              Review in AI Inbox to approve and send
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="focus">
                  What did you focus on today? <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="focus"
                  placeholder="e.g., deadlifts, mobility work, cardio intervals"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Micro-goal for next session (optional)</Label>
                <Textarea
                  id="goal"
                  placeholder="e.g., hit 225 lbs on squat, complete 5 unassisted pull-ups"
                  value={microGoal}
                  onChange={(e) => setMicroGoal(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>AI will generate:</strong> A personalized follow-up message reinforcing today's work and
                  setting expectations for next session.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
                Cancel
              </Button>
              <Button onClick={handleCreateDraft} disabled={!focus.trim() || generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Draft
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
