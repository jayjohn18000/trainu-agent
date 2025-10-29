import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getProgress } from '@/lib/api/gamification';

export function useGamificationProgress() {
  return useQuery({
    queryKey: queryKeys.gamification.progress(),
    queryFn: () => getProgress(),
    refetchInterval: 60000,
  });
}


