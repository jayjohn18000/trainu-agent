import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { toast } from "@/hooks/use-toast";
import { listConversations, listMessagesForContact, sendMessage } from "@/lib/api/messages";
import { supabase } from "@/integrations/supabase/client";

interface MessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function MessagesModal({ open, onOpenChange }: MessagesModalProps) {
  const [conversations, setConversations] = useState<DisplayConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  useEffect(() => {
    if (selectedConvId && open) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId, open]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!open) return;

    const channel = supabase
      .channel('messages-modal-changes')
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
  }, [open, selectedConvId]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="grid grid-cols-3 h-[80vh]">
          <div className="border-r overflow-y-auto">
            <div className="p-4 border-b">
              <DialogTitle>Messages</DialogTitle>
            </div>
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedConvId}
                onSelect={setSelectedConvId}
              />
            )}
          </div>

          <div className="col-span-2">
            {!isLoading && selectedConv && (
              <ChatWindow
                conversation={selectedConv}
                messages={messages}
                currentUserId="current"
                onSendMessage={handleSendMessage}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
