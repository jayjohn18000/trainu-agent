import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Client } from "@/lib/data/clients/types";
import { MessageSquare } from "lucide-react";

interface NudgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSend: (templateId: string, preview: string) => Promise<void>;
  onSuccess?: () => void;
}

const templates = [
  {
    id: "checkin",
    label: "Check-in",
    preview: "Hey {{name}}! Just checking in - how's everything going with your training?",
  },
  {
    id: "missed",
    label: "Missed Session",
    preview: "Hi {{name}}, I noticed you missed your session. Everything okay? Let's reschedule!",
  },
  {
    id: "congrats",
    label: "Congratulations",
    preview: "Amazing work {{name}}! Your progress has been incredible. Keep it up! 🎉",
  },
  {
    id: "reminder",
    label: "Session Reminder",
    preview: "Hey {{name}}! Looking forward to seeing you at our session tomorrow. Ready to crush it?",
  },
  {
    id: "custom",
    label: "Custom Message",
    preview: "",
  },
];

export function NudgeDialog({ open, onOpenChange, client, onSend, onSuccess }: NudgeDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("checkin");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
  const previewMessage =
    selectedTemplate === "custom"
      ? message
      : selectedTemplateData?.preview.replace("{{name}}", client?.name || "");

  const handleSend = async () => {
    if (!client || !previewMessage.trim()) return;
    
    setSending(true);
    try {
      await onSend(selectedTemplate, previewMessage);
      onSuccess?.();
      onOpenChange(false);
      setSelectedTemplate("checkin");
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="nudge-dialog" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Nudge to {client?.name}
          </DialogTitle>
          <DialogDescription>
            Choose a template or write a custom message to engage with your client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Message Template</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate === "custom" ? (
            <div>
              <label className="text-sm font-medium mb-2 block">Your Message</label>
              <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">Preview</label>
              <div className="rounded-md border p-3 bg-muted/50 text-sm">
                {previewMessage}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !previewMessage.trim()}
          >
            {sending ? "Sending..." : "Send Nudge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
