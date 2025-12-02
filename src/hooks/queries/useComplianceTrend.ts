import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/query/keys';
import { subDays, format } from 'date-fns';

export interface ComplianceTrendData {
  date: string;
  compliance: number;
}

async function fetchComplianceTrend(): Promise<ComplianceTrendData[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get last 7 days of compliance data
  const days = 7;
  const now = new Date();
  const data: ComplianceTrendData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // Count clients who checked in on this day
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, last_checkin_at')
      .eq('trainer_id', user.id);
    
    const checkedInCount = (contacts || []).filter(c => {
      if (!c.last_checkin_at) return false;
      const checkinDate = new Date(c.last_checkin_at);
      return checkinDate >= startOfDay && checkinDate <= endOfDay;
    }).length;

    const compliance = contacts?.length ? Math.round((checkedInCount / contacts.length) * 100) : 0;

    data.push({
      date: format(date, 'MMM dd'),
      compliance,
    });
  }

  return data;
}

export function useComplianceTrend() {
  return useQuery({
    queryKey: ['compliance-trend'],
    queryFn: fetchComplianceTrend,
    staleTime: 300000, // 5 minutes
  });
}
