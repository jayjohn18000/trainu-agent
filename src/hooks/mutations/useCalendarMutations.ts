import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { calendarApi } from '@/services/calendar';
import { toast } from '@/hooks/use-toast';

export function useMarkSessionComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarApi.markSessionComplete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.sessions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.session(id) });
      toast({ title: 'Session Completed', description: 'Session marked as complete' });
    },
  });
}

export function useMarkSessionNoShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarApi.markSessionNoShow(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.sessions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.session(id) });
      toast({ title: 'Session marked as no-show' });
    },
  });
}

