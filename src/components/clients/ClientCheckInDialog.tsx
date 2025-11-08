import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { MESSAGE_TEMPLATES, type TemplateId } from "@/lib/constants/messageTemplates";

interface ClientCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
}

export function ClientCheckInDialog({ open, onOpenChange, contactId, contactName }: ClientCheckInDialogProps) {
  const [templateId, setTemplateId] = useState<TemplateId>("groupCheckIn");
  const [customContext, setCustomContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [draftCreated, setDraftCreated] = useState(false);

  const handleCreateDraft = async () => {
    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use Lovable AI to generate personalized check-in
      const { data, error } = await supabase.functions.invoke("generate-client-checkin", {
        body: {
          trainerId: user.id,
          contactId,
          contactName: contactName.split(" ")[0],
          templateId,
          customContext: customContext || undefined,
        },
      });

      if (error) throw error;

      // Log activity
      await supabase.rpc("log_pii_access", {
        p_action: "INSERT",
        p_table_name: "messages",
        p_record_id: data.draftId,
        p_pii_fields: ["content"],
        p_metadata: { type: "client_checkin", template_id: templateId },
      });

      setDraftCreated(true);
      toast({
        title: "Draft created!",
        description: `Check-in message for ${contactName} ready for review`,
      });

      // Reset and close after brief delay
      setTimeout(() => {
        setDraftCreated(false);
        setCustomContext("");
        setTemplateId("groupCheckIn");
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

  const firstName = contactName.split(" ")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Draft to {firstName}</DialogTitle>
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
                <Label htmlFor="template">Message Type</Label>
                <Select value={templateId} onValueChange={(v) => setTemplateId(v as TemplateId)}>
                  <SelectTrigger id="template">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groupCheckIn">Weekly Check-In</SelectItem>
                    <SelectItem value="scheduleChange">Schedule Change</SelectItem>
                    <SelectItem value="missedSession">Missed Session Follow-Up</SelectItem>
                    <SelectItem value="birthday">Birthday Message</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {MESSAGE_TEMPLATES[templateId].description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (optional)</Label>
                <Textarea
                  id="context"
                  placeholder="e.g., They mentioned knee pain last session, upcoming vacation, etc."
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>AI will generate:</strong> A personalized message based on {firstName}'s history, recent
                  activity, and the template you selected.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
                Cancel
              </Button>
              <Button onClick={handleCreateDraft} disabled={generating}>
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
