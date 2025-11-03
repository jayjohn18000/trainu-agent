import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { ConversationSkeletonList } from "@/components/skeletons/ConversationSkeleton";
import { XPNotification, LevelUpNotification } from "@/components/ui/XPNotification";
import { AchievementUnlockNotification } from "@/components/ui/AchievementUnlockNotification";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "@/hooks/use-toast";
import { listConversations, listMessagesForContact, sendMessage } from "@/lib/api/messages";
import { supabase } from "@/integrations/supabase/client";

type DisplayMessage = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text";
};

type DisplayConversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
};

export default function Messages() {
  const { grantXP, xpNotification, levelUpNotification, achievementUnlock, clearXPNotification, clearLevelUpNotification, clearAchievementUnlock } = useGamification();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<DisplayConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  // Setup realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadConversations();
          if (selectedConvId) loadMessages(selectedConvId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvId]);

  const loadConversations = async () => {
    try {
      const data = await listConversations();
      const displayConvos: DisplayConversation[] = data.map(conv => ({
        id: conv.contact_id,
        name: conv.contact_name,
        avatar: `https://i.pravatar.cc/150?u=${conv.contact_id}`,
        lastMessage: conv.last_message,
        timestamp: formatTimestamp(conv.last_message_time),
        unread: conv.unread_count,
        online: false,
      }));
      setConversations(displayConvos);
      
      if (displayConvos.length > 0 && !selectedConvId) {
        setSelectedConvId(displayConvos[0].id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (contactId: string) => {
    try {
      const data = await listMessagesForContact(contactId);
      const displayMsgs: DisplayMessage[] = data.map(msg => ({
        id: msg.id,
        senderId: msg.status === 'draft' ? 'current' : 'contact',
        content: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      }));
      setMessages(displayMsgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const handleSendMessage = async (content: string) => {
    if (!selectedConvId) return;

    try {
      await sendMessage(selectedConvId, content);
      
      // Award XP for messaging
      grantXP(10, "Message Sent");

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });

      // Reload messages
      await loadMessages(selectedConvId);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Stay connected with your clients
        </p>
      </div>

      <Card className="h-[calc(100vh-200px)] grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        <div className="hidden lg:block border-r overflow-y-auto">
          {isLoading ? (
            <ConversationSkeletonList />
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedConvId}
              onSelect={setSelectedConvId}
            />
          )}
        </div>

        <div className="lg:col-span-2">
          {!isLoading && selectedConv && (
            <ChatWindow
              conversation={selectedConv}
              messages={messages}
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
