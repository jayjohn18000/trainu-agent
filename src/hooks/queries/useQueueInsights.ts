import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QueueInsight {
  id: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  rootCause: string;
  evidence?: string[];
  diagnosticQuestions?: string[];
  strategies?: Array<{ strategy: string; successProbability: number }>;
  dataSource: string;
  actions: string[];
  clientNames: string[];
}

export function useQueueInsights() {
  return useQuery({
    queryKey: ['queue-insights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-queue-insights');
      
      if (error) {
        console.error('Error fetching queue insights:', error);
        throw error;
      }

      return (data?.insights || []) as QueueInsight[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
