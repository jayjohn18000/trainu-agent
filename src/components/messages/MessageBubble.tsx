import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "file" | "image";
  fileUrl?: string;
  fileName?: string;
};

type Props = {
  message: Message;
  isOwn: boolean;
  avatar?: string;
};

export function MessageBubble({ message, isOwn, avatar }: Props) {
  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {!isOwn && avatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        <div
          className={`rounded-2xl p-3 ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-accent rounded-tl-sm"
          }`}
        >
          {message.type === "text" && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {message.type === "image" && message.fileUrl && (
            <div className="space-y-2">
              <img
                src={message.fileUrl}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto"
              />
              {message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}
            </div>
          )}

          {message.type === "file" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-background/10 rounded">
                <FileText className="h-5 w-5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.fileName}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
              {message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}
            </div>
          )}
        </div>

        <span className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}
