import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/lib/store/useAgentStore";
import { AgentCapabilities } from "./AgentCapabilities";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentSheet({ open, onOpenChange }: Props) {
  const { input, setInput, messages, sendMessage, clear, loading, loadHistory } = useAgentStore();

  useEffect(() => {
    if (open) loadHistory();
  }, [open, loadHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    await sendMessage(input.trim());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:max-w-full">
        <SheetHeader>
          <SheetTitle>AI Agent</SheetTitle>
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
    </Sheet>
  );
}


