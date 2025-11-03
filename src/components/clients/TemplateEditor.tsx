import { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface TemplateEditorProps {
  clientId: string;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (content: string) => Promise<void>;
}

export function TemplateEditor({
  clientId,
  clientName,
  open,
  onOpenChange,
  onSave,
}: TemplateEditorProps) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim() || content.length > 500) return;

    setSaving(true);
    try {
      await onSave(content.trim());
      setContent("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save template:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    onOpenChange(false);
  };

  const previewContent = content.replace(/\[CLIENT_NAME\]/g, clientName);
  const charCount = content.length;
  const isOverLimit = charCount > 500;
  const isNearLimit = charCount >= 450 && charCount <= 500;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Create Message Template</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Scope chip */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Applies to: {clientName}</Badge>
          </div>

          {/* Editor and Preview split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Template</label>
                <span
                  className={`text-xs ${
                    isOverLimit
                      ? "text-red-600"
                      : isNearLimit
                      ? "text-yellow-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {charCount}/500
                </span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your message template... Use [CLIENT_NAME] for client's name"
                rows={8}
                className="resize-none"
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <Card className="p-4 min-h-[120px] bg-muted/30">
                <p className="text-sm whitespace-pre-wrap break-words">
                  {previewContent || (
                    <span className="text-muted-foreground">
                      Preview will appear here...
                    </span>
                  )}
                </p>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!content.trim() || isOverLimit || saving}
            >
              {saving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

