import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientProvider } from '@/lib/data/clients/provider';
import { queryKeys } from '@/lib/query/keys';
import type { ClientDetail } from '@/lib/data/clients/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useNudgeClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, templateId, preview }: { id: string; templateId: string; preview: string }) =>
      clientProvider.nudge(id, { templateId, preview }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(vars.id) });
      toast({ title: 'Nudge sent', description: 'Message sent successfully' });
    },
  });
}

export function useUpdateClientTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => clientProvider.tag(id, tags),
    onMutate: async ({ id, tags }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clients.detail(id) });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(vars.id) });
    },
  });
}

export function useAddClientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => clientProvider.note(id, note),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(vars.id) });
      toast({ title: 'Note saved' });
    },
  });
}

export function useAssignProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, programId }: { clientId: string; programId: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contacts')
        .update({ program_id: programId })
        .eq('id', clientId)
        .eq('trainer_id', user.id);

      if (error) throw error;
      return { ok: true };
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(vars.clientId) });
      toast({ title: 'Program updated', description: 'Client program has been updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update program', variant: 'destructive' });
    },
  });
}

export function useUpdateClientTagsInline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => clientProvider.tag(id, tags),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(vars.id) });
      toast({ title: 'Tags updated', description: 'Changes will sync to GHL automatically' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update tags', variant: 'destructive' });
    },
  });
}

