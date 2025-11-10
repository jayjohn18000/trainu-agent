import { supabase } from "@/integrations/supabase/client";

export interface SyncConflict {
  id: string;
  entity_type: string;
  entity_id: string;
  trainu_data: any;
  ghl_data: any;
  trainu_updated_at: string;
  ghl_updated_at: string;
  resolution_strategy: string;
  resolved: boolean;
  created_at: string;
}

export interface SyncMetrics {
  id: string;
  sync_type: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  records_processed: number;
  records_succeeded: number;
  records_failed: number;
  throughput_per_min: number;
}

export async function getSyncConflicts(): Promise<SyncConflict[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ghl_sync_conflicts')
    .select('*')
    .eq('trainer_id', user.id)
    .eq('resolved', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSyncMetrics(limit = 10): Promise<SyncMetrics[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ghl_sync_metrics')
    .select('*')
    .eq('trainer_id', user.id)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function resolveConflict(
  conflictId: string,
  resolution: 'trainu_wins' | 'ghl_wins' | 'manual'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('ghl_sync_conflicts')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_strategy: resolution,
    })
    .eq('id', conflictId)
    .eq('trainer_id', user.id);

  if (error) throw error;
}

export async function registerWebhook(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('ghl-webhook-register');

  if (error) throw error;
  return data;
}

export async function triggerManualSync(): Promise<void> {
  const { error } = await supabase.functions.invoke('ghl-sync');
  if (error) throw error;
}
