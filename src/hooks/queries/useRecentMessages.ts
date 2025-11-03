import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/query/keys';
import { formatDistanceToNow } from 'date-fns';

export interface RecentMessage {
  id: string;
  name: string;
  avatar?: string;
  preview: string;
  timestamp: string;
  unread: number;
}

async function fetchRecentMessages(): Promise<RecentMessage[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      ghl_read_at,
      contacts!inner(
        first_name,
        last_name
      )
    `)
    .eq('trainer_id', user.id)
    .in('status', ['sent', 'delivered', 'read'])
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  // Group messages by contact
  const messagesByContact = new Map<string, any[]>();
  (data || []).forEach((msg: any) => {
    const contactName = `${msg.contacts.first_name} ${msg.contacts.last_name || ''}`.trim();
    if (!messagesByContact.has(contactName)) {
      messagesByContact.set(contactName, []);
    }
    messagesByContact.get(contactName)!.push(msg);
  });

  // Get the most recent message per contact
  const recentMessages: RecentMessage[] = [];
  messagesByContact.forEach((messages, contactName) => {
    const latestMsg = messages[0]; // Already sorted by created_at desc
    const unreadCount = messages.filter(m => !m.ghl_read_at).length;

    recentMessages.push({
      id: latestMsg.id,
      name: contactName,
      avatar: undefined,
      preview: latestMsg.content.substring(0, 60) + (latestMsg.content.length > 60 ? '...' : ''),
      timestamp: formatDistanceToNow(new Date(latestMsg.created_at), { addSuffix: true }),
      unread: unreadCount,
    });
  });

  return recentMessages.slice(0, 3); // Show top 3 conversations
}

export function useRecentMessages() {
  return useQuery({
    queryKey: queryKeys.messages.recent(),
    queryFn: fetchRecentMessages,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
