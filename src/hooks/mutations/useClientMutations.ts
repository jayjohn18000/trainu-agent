import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientProvider } from '@/lib/data/clients/provider';
import { queryKeys } from '@/lib/query/keys';
import type { ClientDetail } from '@/lib/data/clients/types';
import { toast } from '@/hooks/use-toast';

export function useNudgeClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, templateId, preview }: { id: string; templateId: string; preview: string }) =>
      clientProvider.nudge(id, { templateId, preview }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries(queryKeys.clients.detail(vars.id));
      toast({ title: 'Nudge sent', description: 'Message sent successfully' });
    },
  });
}

export function useUpdateClientTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => clientProvider.tag(id, tags),
    onMutate: async ({ id, tags }) => {
      await queryClient.cancelQueries(queryKeys.clients.detail(id));
      const previous = queryClient.getQueryData(queryKeys.clients.detail(id)) as ClientDetail | undefined;
      queryClient.setQueryData(queryKeys.clients.detail(id), (old: ClientDetail | undefined) =>
        old ? { ...old, tags } : old
      );
      return { previous };
    },
    onError: (_err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.clients.detail(vars.id), context.previous);
      }
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries(queryKeys.clients.detail(vars.id));
    },
  });
}

export function useAddClientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => clientProvider.note(id, note),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries(queryKeys.clients.detail(vars.id));
      toast({ title: 'Note saved' });
    },
  });
}


