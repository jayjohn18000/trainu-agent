import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { awardXP } from '@/lib/api/gamification';

export function useAwardXP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, reason }: { amount: number; reason: string }) => awardXP(amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.gamification.progress());
    },
  });
}


