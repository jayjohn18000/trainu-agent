import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClientInsight {
  title: string;
  description: string;
  actionable?: string;
  impact: 'high' | 'medium' | 'low';
  category: 'progress' | 'pattern' | 'recommendation';
}

export function useClientInsights(contactId: string | undefined) {
  const queryClient = useQueryClient();

  // Invalidate when relevant data changes
  useEffect(() => {
    if (!contactId) return;

    const channel = supabase
      .channel(`insights-${contactId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `contact_id=eq.${contactId}`,
        },
        () => {
          // Debounce invalidation by 30 seconds
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['client-insights', contactId] });
          }, 30000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `contact_id=eq.${contactId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['client-insights', contactId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_notes',
          filter: `contact_id=eq.${contactId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['client-insights', contactId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, queryClient]);

  return useQuery({
    queryKey: ['client-insights', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const { data, error } = await supabase.functions.invoke('generate-client-insights', {
        body: { contactId },
      });
      if (error) throw error;
      return (data?.insights || []) as ClientInsight[];
    },
    enabled: !!contactId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

