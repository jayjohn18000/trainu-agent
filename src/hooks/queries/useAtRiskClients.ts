import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/query/keys';
import { formatDistanceToNow } from 'date-fns';

export interface AtRiskClient {
  id: string;
  name: string;
  avatar?: string;
  risk: number;
  lastActivity: string;
  reason: string;
}

async function fetchAtRiskClients(): Promise<AtRiskClient[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('contacts')
    .select(`
      id,
      first_name,
      last_name,
      insights!inner(
        risk_score,
        last_activity_at,
        missed_sessions,
        engagement_score,
        response_rate
      )
    `)
    .eq('trainer_id', user.id)
    .gte('insights.risk_score', 75)
    .order('insights.risk_score', { ascending: false })
    .limit(5);

  if (error) throw error;

  return (data || []).map((contact: any) => {
    const insight = contact.insights;
    const daysSinceActivity = insight.last_activity_at 
      ? Math.floor((Date.now() - new Date(insight.last_activity_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let reason = '';
    if (daysSinceActivity > 14) {
      reason = `No activity for ${daysSinceActivity} days`;
    } else if (insight.missed_sessions > 2) {
      reason = `${insight.missed_sessions} missed sessions`;
    } else if (insight.response_rate < 0.3) {
      reason = 'Low response rate';
    } else if (insight.engagement_score < 30) {
      reason = 'Low engagement';
    } else {
      reason = 'Needs attention';
    }

    return {
      id: contact.id,
      name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
      avatar: undefined,
      risk: insight.risk_score,
      lastActivity: insight.last_activity_at 
        ? formatDistanceToNow(new Date(insight.last_activity_at), { addSuffix: true })
        : 'Never',
      reason,
    };
  });
}

export function useAtRiskClients() {
  return useQuery({
    queryKey: queryKeys.atRisk.clients(),
    queryFn: fetchAtRiskClients,
    refetchInterval: 60000, // Refetch every minute
  });
}
