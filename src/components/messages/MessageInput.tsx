import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Smile, X } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";

type Props = {
  onSend: (content: string, file?: File) => void;
};

export function MessageInput({ onSend }: Props) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() && !file) {
      toast({
        title: "Empty message",
        description: "Please type a message or attach a file",
        variant: "destructive",
      });
      return;
    }

    onSend(message, file || undefined);
    setMessage("");
    setFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {file && (
        <div className="flex items-center gap-2 p-2 bg-accent rounded-lg">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">{file.name}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setFile(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={() => toast({ title: "Emoji Picker", description: "Coming soon!" })}
        >
          <Smile className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() && !file}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
