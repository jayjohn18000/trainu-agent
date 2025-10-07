import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MoreVertical, Phone, Video } from "lucide-react";
import { MessageInput } from "./MessageInput";
import { MessageBubble } from "./MessageBubble";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "file" | "image";
  fileUrl?: string;
  fileName?: string;
};

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
};

type Props = {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, file?: File) => void;
};

export function ChatWindow({ conversation, messages, currentUserId, onSendMessage }: Props) {
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleBookSession = () => {
    toast({ title: "Book Session", description: "Opening calendar..." });
  };

  const handleCall = () => {
    toast({ title: "Voice Call", description: "Starting voice call..." });
  };

  const handleVideoCall = () => {
    toast({ title: "Video Call", description: "Starting video call..." });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback>
                {conversation.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {conversation.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{conversation.name}</h3>
            <p className="text-xs text-muted-foreground">
              {conversation.online ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button size="icon" variant="ghost" onClick={handleCall}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleVideoCall}>
            <Video className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleBookSession}>
            <Calendar className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
            avatar={msg.senderId === currentUserId ? undefined : conversation.avatar}
          />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
            </Avatar>
            <div className="flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t">
        <MessageInput onSend={onSendMessage} />
      </div>
    </div>
  );
}
