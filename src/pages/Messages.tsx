import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { ConversationSkeletonList } from "@/components/skeletons/ConversationSkeleton";
import { XPNotification, LevelUpNotification } from "@/components/ui/XPNotification";
import { AchievementUnlockNotification } from "@/components/ui/AchievementUnlockNotification";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "@/hooks/use-toast";

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
  {
    id: "c4",
    name: "Emily Davis",
    avatar: "https://i.pravatar.cc/150?img=13",
    lastMessage: "I've been following the meal plan",
    timestamp: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "c5",
    name: "Alex Chen",
    avatar: "https://i.pravatar.cc/150?img=14",
    lastMessage: "What time works best for you?",
    timestamp: "2 days ago",
    unread: 0,
    online: true,
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
    {
      id: "m3",
      senderId: "c1",
      content: "Great! We'll focus on form for squats tomorrow.",
      timestamp: "10:35 AM",
      type: "text" as const,
    },
    {
      id: "m4",
      senderId: "current",
      content: "Sounds good. Should I warm up before arriving?",
      timestamp: "10:36 AM",
      type: "text" as const,
    },
    {
      id: "m5",
      senderId: "c1",
      content: "Yes, 5-10 minutes of light cardio would be perfect. See you tomorrow!",
      timestamp: "10:38 AM",
      type: "text" as const,
    },
    {
      id: "m6",
      senderId: "current",
      content: "Thanks for the great session today!",
      timestamp: "2m ago",
      type: "text" as const,
    },
  ],
  c2: [
    {
      id: "m1",
      senderId: "c2",
      content: "Hi! I need to talk about tomorrow's session.",
      timestamp: "1h ago",
      type: "text" as const,
    },
    {
      id: "m2",
      senderId: "c2",
      content: "Can we reschedule tomorrow's session?",
      timestamp: "1h ago",
      type: "text" as const,
    },
  ],
};

export default function Messages() {
  const { grantXP, xpNotification, levelUpNotification, achievementUnlock, clearXPNotification, clearLevelUpNotification, clearAchievementUnlock } = useGamification();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState(mockConversations[0].id);
  const [messages, setMessages] = useState(mockMessages);

  useEffect(() => {
    // Simulate loading conversations
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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

    // Award XP for messaging
    grantXP(10, "Message Sent");

    toast({
      title: "Message sent",
      description: file ? `Sent ${file.name}` : "Your message has been delivered",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Stay connected with your clients and trainers
        </p>
      </div>

      <Card className="h-[calc(100vh-200px)] grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        <div className="hidden lg:block border-r overflow-y-auto">
          {isLoading ? (
            <ConversationSkeletonList />
          ) : (
            <ConversationList
              conversations={mockConversations}
              selectedId={selectedConvId}
              onSelect={setSelectedConvId}
            />
          )}
        </div>

        <div className="lg:col-span-2">
          {!isLoading && (
            <ChatWindow
              conversation={selectedConv}
              messages={conversationMessages}
              currentUserId="current"
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </Card>
      
      <XPNotification
        amount={xpNotification?.amount || 0}
        reason={xpNotification?.reason}
        show={!!xpNotification}
        onComplete={clearXPNotification}
      />
      
      <LevelUpNotification
        level={levelUpNotification || 1}
        show={!!levelUpNotification}
        onComplete={clearLevelUpNotification}
      />
      
      <AchievementUnlockNotification
        achievement={achievementUnlock}
        show={!!achievementUnlock}
        onComplete={clearAchievementUnlock}
      />
    </div>
  );
}
