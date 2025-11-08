import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface InsightData {
  type: "draft_insight";
  target: string;
  reason: string;
  confidence: number;
  suggested_message: string;
  recipient_ids: string[];
}

interface AssistantInsightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insight: InsightData | null;
}

export function AssistantInsightDialog({ open, onOpenChange, insight }: AssistantInsightDialogProps) {
  const [sending, setSending] = useState(false);
  const [draftCreated, setDraftCreated] = useState(false);

  const handleSendToDraft = async () => {
    if (!insight) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create drafts for each recipient
      const drafts = insight.recipient_ids.map((contactId) => ({
        trainer_id: user.id,
        contact_id: contactId,
        content: insight.suggested_message,
        status: "draft" as const,
        requires_approval: true,
        channel: "sms" as const,
        confidence: insight.confidence,
        why_reasons: [insight.reason],
      }));

      const { error } = await supabase.from("messages").insert(drafts);
      if (error) throw error;

      setDraftCreated(true);
      toast({
        title: "Drafts created!",
        description: `${insight.recipient_ids.length} draft(s) ready for review`,
      });

      setTimeout(() => {
        setDraftCreated(false);
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to create drafts:", error);
      toast({
        title: "Draft creation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (!insight) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>AI Insight: {insight.target}</DialogTitle>
        </DialogHeader>

        {draftCreated ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-success" />
            <h3 className="text-lg font-semibold mb-2">Drafts Created!</h3>
            <p className="text-sm text-muted-foreground">Review in AI Inbox</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recipients</span>
                <Badge variant="secondary">{insight.recipient_ids.length} clients</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <Badge variant={insight.confidence >= 0.8 ? "default" : "outline"}>
                  {Math.round(insight.confidence * 100)}%
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Why</span>
                <p className="text-sm text-muted-foreground">{insight.reason}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Suggested Message</span>
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  {insight.suggested_message}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
                Cancel
              </Button>
              <Button onClick={handleSendToDraft} disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to Draft
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
