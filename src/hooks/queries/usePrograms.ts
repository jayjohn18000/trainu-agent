import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/query/keys';

export interface Program {
  id: string;
  name: string;
  description?: string;
  duration_weeks?: number;
  total_sessions?: number;
}

async function fetchPrograms(): Promise<Program[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('programs')
    .select('id, name, description, duration_weeks, total_sessions')
    .eq('trainer_id', user.id)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export function usePrograms() {
  return useQuery({
    queryKey: queryKeys.programs?.list?.() ?? ['programs'],
    queryFn: fetchPrograms,
    staleTime: 60000,
  });
}
