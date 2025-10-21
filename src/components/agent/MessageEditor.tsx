import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Send, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueItem: {
    id: string;
    clientName: string;
    fullMessage: string;
    confidence: number;
    why: string[];
  };
  onSave: (id: string, message: string, tone: string) => void;
};

export function MessageEditor({ open, onOpenChange, queueItem, onSave }: Props) {
  const [message, setMessage] = useState(queueItem.fullMessage);
  const [tone, setTone] = useState<string>("friendly");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock regenerated message with different tone
    const toneVariations: Record<string, string> = {
      professional: `Dear ${queueItem.clientName},\n\nI hope this message finds you well. I wanted to reach out regarding your recent training sessions...\n\nBest regards,\n{trainerName}`,
      friendly: `Hey ${queueItem.clientName}! 👋\n\nJust wanted to check in with you about your training. How's everything going?\n\nCheers,\n{trainerName}`,
      motivational: `${queueItem.clientName}! 🔥\n\nYou've got this! I believe in your potential and I'm here to help you crush your goals!\n\nLet's do this!\n{trainerName}`,
      direct: `${queueItem.clientName},\n\nWe need to talk about your training progress. Let's get straight to it.\n\n{trainerName}`,
    };
    
    setMessage(toneVariations[tone] || queueItem.fullMessage);
    setIsRegenerating(false);
    
    toast({
      title: "Message regenerated",
      description: `New ${tone} version created`,
    });
  };

  const handleSave = () => {
    onSave(queueItem.id, message, tone);
    onOpenChange(false);
    
    toast({
      title: "Draft updated",
      description: "Your changes have been saved",
    });
  };

  const charCount = message.length;
  const isValidLength = charCount >= 50 && charCount <= 500;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit Message</SheetTitle>
          <SheetDescription>
            To: {queueItem.clientName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Confidence & Why */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <Badge variant={queueItem.confidence >= 0.8 ? "default" : "secondary"}>
                {Math.round(queueItem.confidence * 100)}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Why suggested:</span>
              <ul className="text-sm text-muted-foreground space-y-1">
                {queueItem.why.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tone</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="motivational">Motivational</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Message</label>
              <span className={`text-xs ${isValidLength ? 'text-muted-foreground' : 'text-warning'}`}>
                {charCount}/500
              </span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Type your message..."
            />
            <p className="text-xs text-muted-foreground">
              Variables like {"{firstName}"} and {"{trainerName}"} will be replaced automatically
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex-1"
            >
              {isRegenerating ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValidLength}
              className="flex-1"
            >
              <Send className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
