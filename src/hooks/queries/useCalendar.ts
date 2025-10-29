import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { calendarApi } from '@/services/calendar';
import type { Session } from '@/lib/store/useCalendarStore';

export function useSessions(trainerId?: string, clientId?: string) {
  return useQuery<Session[]>({
    queryKey: queryKeys.calendar.sessions(trainerId, clientId),
    queryFn: () => calendarApi.getSessions(trainerId, clientId),
    staleTime: 30000,
  });
}

export function useSession(id: string) {
  return useQuery<Session | null>({
    queryKey: queryKeys.calendar.session(id),
    queryFn: () => calendarApi.getSessionById(id),
    enabled: Boolean(id),
  });
}

