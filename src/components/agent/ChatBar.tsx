import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare, X, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAgentStore } from "@/lib/store/useAgentStore";
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

interface ChatBarProps {
  messages?: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  onSubmit: (message: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  sidebarCollapsed?: boolean;
}

const placeholders = [
  "Show me my at-risk clients",
  "Schedule a session for tomorrow",
  "What are my stats this month?",
  "Suggest tags for all clients",
  "Who needs attention today?",
];

export function ChatBar({ messages = [], onSubmit, placeholder, disabled, loading: externalLoading, sidebarCollapsed = false }: ChatBarProps) {
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const loading = externalLoading || false;
  const { clearHistory } = useAgentStore();
  const { toast } = useToast();

  // Cycle through placeholders every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when messages change (only if user is at bottom)
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isAtBottom]);

  // Track scroll position
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setIsAtBottom(isBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled) return;

    try {
      await onSubmit(input.trim());
      setInput("");
      setHistoryOpen(true); // Auto-open history when sending
    } catch (error) {
      console.error("ChatBar submit error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      toast({
        title: "History cleared",
        description: "AI conversation history has been reset.",
      });
      setShowClearDialog(false);
      setHistoryOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Conversation History Panel */}
      {historyOpen && messages.length > 0 && (
        <div
          className={cn(
            "fixed z-10 bg-card border-t border-x rounded-t-lg shadow-lg",
            "transition-all duration-200",
            isMobile ? 'bottom-16 left-0 right-0 h-96' : 'bottom-16',
            !isMobile && (sidebarCollapsed ? 'left-14 right-0' : 'left-60 right-0')
          )}
        >
          <div className="sticky top-0 z-20 flex items-center justify-between p-3 border-b bg-card">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">AI Agent Conversation</span>
              <span className="text-xs text-muted-foreground">({messages.length} messages)</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowClearDialog(true)}
                disabled={loading || messages.length === 0}
                data-tour="ai-clear"
                className="h-8 w-8"
                title="Clear History"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHistoryOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-[calc(100%-3rem)] overflow-y-auto scroll-smooth p-4 relative"
          >
            <div className="space-y-4 pb-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1",
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-1">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Scroll to Bottom Button */}
            {!isAtBottom && (
              <Button
                size="sm"
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 rounded-full shadow-lg h-10 w-10 p-0"
                title="Scroll to bottom"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        data-tour="ai-chat-input"
        className={cn(
          "fixed right-0 z-10 border-t bg-card/95 backdrop-blur-sm",
          "flex items-center gap-2 p-3 px-4 transition-all duration-200",
          isMobile ? 'bottom-16 left-0' : 'bottom-0',
          !isMobile && (sidebarCollapsed ? 'left-14' : 'left-60')
        )}
      >
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setHistoryOpen(!historyOpen)}
            data-tour="ai-history"
            className="shrink-0"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        )}
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
    </>
  );
}

