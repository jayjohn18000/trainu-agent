import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/query/keys';

export interface UpcomingSession {
  id: string;
  clientName: string;
  type: string;
  time: Date;
  duration: number;
}

async function fetchUpcomingSessions(): Promise<UpcomingSession[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      scheduled_at,
      session_type,
      contacts!inner(
        first_name,
        last_name
      )
    `)
    .eq('trainer_id', user.id)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10);

  if (error) throw error;

  return (data || []).map((booking: any) => ({
    id: booking.id,
    clientName: `${booking.contacts.first_name} ${booking.contacts.last_name || ''}`.trim(),
    type: booking.session_type || 'PT',
    time: new Date(booking.scheduled_at),
    duration: 60, // Default duration
  }));
}

export function useUpcomingSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.upcoming(),
    queryFn: fetchUpcomingSessions,
    refetchInterval: 60000, // Refetch every minute
  });
}
