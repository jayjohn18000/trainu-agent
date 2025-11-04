import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AutoApprovalCountdownProps {
  messageId: string;
  autoApprovalAt: string;
  onCancel: () => void;
}

export function AutoApprovalCountdown({ messageId, autoApprovalAt, onCancel }: AutoApprovalCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(autoApprovalAt);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Auto-approving...");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [autoApprovalAt]);

  const handleCancel = async () => {
    try {
      const { error } = await supabase.functions.invoke("queue-management", {
        body: { action: "cancelAutoApproval", messageId },
      });
      
      if (error) throw error;
      
      toast({ title: "Auto-approval cancelled", description: "This message now requires manual review" });
      onCancel();
    } catch (error) {
      console.error("Failed to cancel auto-approval:", error);
      toast({
        title: "Cancel failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
      <Clock className="h-4 w-4 text-primary" />
      <div className="flex-1">
        <div className="text-sm font-medium">Auto-approving in {timeLeft}</div>
        <div className="text-xs text-muted-foreground">Cancel if you need to review</div>
      </div>
      <Button size="sm" variant="outline" onClick={handleCancel}>
        <X className="h-4 w-4 mr-1" />
        Cancel
      </Button>
    </div>
  );
}
