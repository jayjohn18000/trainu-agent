import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/lib/store/useAgentStore";
import { AgentCapabilities } from "./AgentCapabilities";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentSheet({ open, onOpenChange }: Props) {
  const { input, setInput, messages, sendMessage, clear, loading, loadHistory, clearHistory } = useAgentStore();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) loadHistory();
  }, [open, loadHistory]);

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      toast({
        title: "History cleared",
        description: "AI conversation history has been reset.",
      });
      setShowClearDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    await sendMessage(input.trim());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:max-w-full">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>AI Agent</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              disabled={loading || messages.length === 0}
              className="h-8 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </div>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <AgentCapabilities />
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Ask about clients, suggest tags, or get insights..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" variant="default" disabled={loading || !input.trim()}>
              {loading ? 'Thinking…' : 'Send'}
            </Button>
          </form>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`bg-card border border-border rounded-lg p-3 ${
                msg.role === 'user' ? 'ml-8' : 'mr-8'
              }`}>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {msg.role === 'user' ? 'You' : 'AI Agent'}
                </div>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear conversation history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in your AI conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory}>
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}


