import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export interface RecentUpdate {
  client: string;
  update: string;
  time: string;
}

async function fetchRecentUpdates(): Promise<RecentUpdate[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('activity_feed')
    .select('client_name, action, message_preview, created_at')
    .eq('trainer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent updates:', error);
    return [];
  }

  return (data || []).map((item) => ({
    client: item.client_name || 'Client',
    update: item.message_preview || item.action || 'Activity recorded',
    time: item.created_at 
      ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
      : 'Recently',
  }));
}

export function useRecentUpdates() {
  return useQuery({
    queryKey: ['recent-updates'],
    queryFn: fetchRecentUpdates,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
}
