import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

// TODO: Replace with actual API calls when messaging API is implemented
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
];

const mockMessages = {
  c1: [],
};

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.messages.conversations(),
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockConversations;
    },
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages.messages(conversationId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockMessages[conversationId as keyof typeof mockMessages] || [];
    },
    enabled: Boolean(conversationId),
  });
}

