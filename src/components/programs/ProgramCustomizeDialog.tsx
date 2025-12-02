import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Program } from "@/hooks/queries/usePrograms";
import { Sparkles } from "lucide-react";

interface ProgramCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: Program | null;
  clientName: string;
  onSave: (customizations: {
    notes: string;
    adjustments: string;
  }) => Promise<void>;
}

export function ProgramCustomizeDialog({
  open,
  onOpenChange,
  program,
  clientName,
  onSave,
}: ProgramCustomizeDialogProps) {
  const [notes, setNotes] = useState("");
  const [adjustments, setAdjustments] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ notes, adjustments });
      onOpenChange(false);
      setNotes("");
      setAdjustments("");
    } finally {
      setSaving(false);
    }
  };

  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Customize Program for {clientName}
          </DialogTitle>
          <DialogDescription>
            Adapt "{program.name}" to fit this client's specific needs and goals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Custom Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add specific notes for this client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustments">Exercise Adjustments</Label>
            <Textarea
              id="adjustments"
              placeholder="List any exercise modifications or intensity adjustments..."
              value={adjustments}
              onChange={(e) => setAdjustments(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Example: "Replace barbell squats with goblet squats, reduce weight by 20%"
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Customization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
