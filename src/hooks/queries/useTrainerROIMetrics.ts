import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/query/keys';

export interface TrainerROIMetrics {
  hoursSaved: number;
  churnRisk: number;
  avgCompliance: number;
  activePrograms: number;
}

async function fetchTrainerROIMetrics(): Promise<TrainerROIMetrics> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hoursSaved: 0, churnRisk: 0, avgCompliance: 0, activePrograms: 0 };

  // Hours saved calculation: messages sent automatically * 2 minutes per message / 60
  const { data: messages } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('trainer_id', user.id)
    .eq('status', 'sent');
  
  const hoursSaved = Math.round((messages?.length || 0) * 2 / 60 * 10) / 10;

  // Churn risk: count clients with risk > 70
  const { count: atRiskCount } = await supabase
    .from('lifecycle_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', user.id)
    .gte('risk_score', 70);
  
  const churnRisk = atRiskCount || 0;

  // Avg compliance: average of clients who checked in within last 7 days
  const { data: contacts } = await supabase
    .from('contacts')
    .select('last_checkin_at')
    .eq('trainer_id', user.id);
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const compliantCount = (contacts || []).filter(c => 
    c.last_checkin_at && new Date(c.last_checkin_at) >= sevenDaysAgo
  ).length;
  const avgCompliance = contacts?.length ? Math.round((compliantCount / contacts.length) * 100) : 0;

  // Active programs
  const { count: programCount } = await supabase
    .from('programs')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', user.id);
  
  const activePrograms = programCount || 0;

  return {
    hoursSaved,
    churnRisk,
    avgCompliance,
    activePrograms,
  };
}

export function useTrainerROIMetrics() {
  return useQuery({
    queryKey: ['trainer-roi-metrics'],
    queryFn: fetchTrainerROIMetrics,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // 2 minutes
  });
}
