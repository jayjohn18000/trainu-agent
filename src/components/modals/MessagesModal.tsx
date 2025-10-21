import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { toast } from "@/hooks/use-toast";

interface MessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockConversations = [
  {
    id: "c1",
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=10",
    lastMessage: "Thanks for the great session today!",
    timestamp: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: "c2",
    name: "Sarah Wilson",
    avatar: "https://i.pravatar.cc/150?img=11",
    lastMessage: "Can we reschedule tomorrow's session?",
    timestamp: "1h ago",
    unread: 1,
    online: true,
  },
  {
    id: "c3",
    name: "Mike Johnson",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Perfect, see you then!",
    timestamp: "3h ago",
    unread: 0,
    online: false,
  },
];

const mockMessages = {
  c1: [
    {
      id: "m1",
      senderId: "c1",
      content: "Hey! Ready for tomorrow's session?",
      timestamp: "10:30 AM",
      type: "text" as const,
    },
    {
      id: "m2",
      senderId: "current",
      content: "Absolutely! Looking forward to it.",
      timestamp: "10:32 AM",
      type: "text" as const,
    },
  ],
  c2: [
    {
      id: "m1",
      senderId: "c2",
      content: "Can we reschedule tomorrow's session?",
      timestamp: "1h ago",
      type: "text" as const,
    },
  ],
  c3: [
    {
      id: "m1",
      senderId: "c3",
      content: "Perfect, see you then!",
      timestamp: "3h ago",
      type: "text" as const,
    },
  ],
};

export function MessagesModal({ open, onOpenChange }: MessagesModalProps) {
  const [selectedConvId, setSelectedConvId] = useState(mockConversations[0].id);
  const [messages, setMessages] = useState(mockMessages);

  const selectedConv = mockConversations.find((c) => c.id === selectedConvId)!;
  const conversationMessages = messages[selectedConvId as keyof typeof messages] || [];

  const handleSendMessage = (content: string, file?: File) => {
    const newMessage = {
      id: `m${Date.now()}`,
      senderId: "current",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: file ? (file.type.startsWith("image/") ? "image" : "file") : "text",
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      fileName: file?.name,
    } as const;

    setMessages((prev) => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId as keyof typeof prev] || []), newMessage],
    }));

    toast({
      title: "Message sent",
      description: file ? `Sent ${file.name}` : "Your message has been delivered",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="grid grid-cols-3 h-[80vh]">
          <div className="border-r overflow-y-auto">
            <div className="p-4 border-b">
              <DialogTitle>Messages</DialogTitle>
            </div>
            <ConversationList
              conversations={mockConversations}
              selectedId={selectedConvId}
              onSelect={setSelectedConvId}
            />
          </div>

          <div className="col-span-2">
            <ChatWindow
              conversation={selectedConv}
              messages={conversationMessages}
              currentUserId="current"
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
