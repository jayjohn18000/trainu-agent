import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile.tsx";

interface ChatBarProps {
  onSubmit: (message: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

const placeholders = [
  "Ask agent to draft a message...",
  "Check client status...",
  "Review queue items...",
  "What's my next action?",
];

export function ChatBar({ onSubmit, placeholder, disabled }: ChatBarProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Cycle through placeholders every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled) return;

    setLoading(true);
    try {
      await onSubmit(input.trim());
      setInput("");
    } catch (error) {
      console.error("ChatBar submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`
        fixed left-0 right-0 z-10 border-t bg-card/95 backdrop-blur-sm
        flex items-center gap-2 p-3 px-4
        ${isMobile ? 'bottom-16' : 'bottom-0'}
        transition-all duration-200
      `}
    >
      <Input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || placeholders[currentPlaceholder]}
        disabled={loading || disabled}
        className="flex-1 focus:ring-2 focus:ring-primary/50 transition-all"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || loading || disabled}
        className="shrink-0"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}

