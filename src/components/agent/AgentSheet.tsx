import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/lib/store/useAgentStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentSheet({ open, onOpenChange }: Props) {
  const { input, setInput, results, runNL, clear, loading } = useAgentStore();

  useEffect(() => {
    if (!open) clear();
  }, [open, clear]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:max-w-full">
        <SheetHeader>
          <SheetTitle>Agent</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ask the agent to draft or analyze..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="default" onClick={runNL} disabled={loading}>
              {loading ? 'Thinking…' : 'Go'}
            </Button>
          </div>
          <div className="space-y-2">
            {results.map((card) => (
              <div key={card.id} className="bg-card border border-border rounded-lg p-3">
                <div className="text-sm text-muted-foreground">{card.kind}</div>
                <pre className="mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(card.payload, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


