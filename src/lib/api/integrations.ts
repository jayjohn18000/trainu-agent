import { supabase } from "@/integrations/supabase/client";
import type { IntegrationSource } from "@/types/integrations";

export interface IntegrationStatus {
  id: string;
  trainer_id: string;
  integration_name: IntegrationSource;
  connection_status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'warning';
  last_sync_at?: string;
  next_sync_at?: string;
  last_error?: string;
  last_error_at?: string;
  error_count: number;
  records_synced: number;
  records_updated: number;
  sync_duration_ms?: number;
  api_calls_used?: number;
}

export interface IntegrationActivityLog {
  id: string;
  trainer_id: string;
  integration_name: IntegrationSource;
  activity_type: string;
  activity_message: string;
  activity_data?: Record<string, any>;
  created_at: string;
}

export interface IntegrationConfig {
  id: string;
  trainer_id: string;
  integration_name: IntegrationSource;
  external_account_id: string;
  external_location_id?: string;
  last_sync_at?: string;
  sync_status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'warning';
  sync_error_message?: string;
}

/**
 * Get all integration statuses for the current trainer
 */
export async function getIntegrationStatus(): Promise<IntegrationStatus[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('integration_status')
    .select('*')
    .eq('trainer_id', user.id)
    .order('integration_name');

  if (error) throw error;
  return data || [];
}

/**
 * Get status for a specific integration
 */
export async function getIntegrationStatusByName(
  integrationName: IntegrationSource
): Promise<IntegrationStatus | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('integration_status')
    .select('*')
    .eq('trainer_id', user.id)
    .eq('integration_name', integrationName)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Get recent activity log for an integration
 */
export async function getIntegrationActivityLog(
  integrationName: IntegrationSource,
  limit: number = 10
): Promise<IntegrationActivityLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('integration_activity_log')
    .select('*')
    .eq('trainer_id', user.id)
    .eq('integration_name', integrationName)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get integration config (without sensitive tokens)
 */
export async function getIntegrationConfig(
  integrationName: IntegrationSource
): Promise<IntegrationConfig | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('integration_configs')
    .select('id, trainer_id, integration_name, external_account_id, external_location_id, last_sync_at, sync_status, sync_error_message')
    .eq('trainer_id', user.id)
    .eq('integration_name', integrationName)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Trigger manual sync for an integration
 */
export async function triggerManualSync(
  integrationName: IntegrationSource
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Determine sync function name based on integration
  const syncFunctionMap: Record<IntegrationSource, string> = {
    ghl: 'ghl-sync',
    mindbody: 'mindbody-sync',
    trainerize: 'trainerize-sync',
    truecoach: 'truecoach-sync',
    apple_health: 'apple-health-sync',
    oura: 'oura-sync',
  };

  const functionName = syncFunctionMap[integrationName];
  if (!functionName) {
    throw new Error(`No sync function for ${integrationName}`);
  }

  const { error } = await supabase.functions.invoke(functionName, {
    body: { trainerId: user.id },
  });

  if (error) throw error;
}

/**
 * Disconnect an integration (revoke OAuth)
 */
export async function disconnectIntegration(
  integrationName: IntegrationSource
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Delete integration config
  const { error: configError } = await supabase
    .from('integration_configs')
    .delete()
    .eq('trainer_id', user.id)
    .eq('integration_name', integrationName);

  if (configError) throw configError;

  // Update integration status to disconnected
  const { error: statusError } = await supabase
    .from('integration_status')
    .update({
      connection_status: 'disconnected',
      last_sync_at: null,
      last_error: null,
      last_error_at: null,
    })
    .eq('trainer_id', user.id)
    .eq('integration_name', integrationName);

  if (statusError) throw statusError;
}

/**
 * Initiate OAuth flow for an integration
 */
export async function initiateOAuth(
  integrationName: IntegrationSource,
  redirectPath?: string
): Promise<{ authUrl: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Determine OAuth init function name
  const oauthFunctionMap: Record<IntegrationSource, string> = {
    ghl: 'ghl-oauth-init',
    mindbody: 'mindbody-oauth-init',
    trainerize: 'trainerize-oauth-init',
    truecoach: 'truecoach-oauth-init',
    apple_health: 'apple-health-oauth-init',
    oura: 'oura-oauth-init',
  };

  const functionName = oauthFunctionMap[integrationName];
  if (!functionName) {
    throw new Error(`No OAuth function for ${integrationName}`);
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: { redirect: redirectPath || '/integrations' },
  });

  if (error) throw error;
  return data as { authUrl: string };
}

/**
 * Get overall integration health summary
 */
export async function getIntegrationHealthSummary(): Promise<{
  total: number;
  connected: number;
  disconnected: number;
  errors: number;
}> {
  const statuses = await getIntegrationStatus();

  return {
    total: statuses.length,
    connected: statuses.filter(s => s.connection_status === 'connected').length,
    disconnected: statuses.filter(s => s.connection_status === 'disconnected').length,
    errors: statuses.filter(s => s.connection_status === 'error' || s.connection_status === 'warning').length,
  };
}

