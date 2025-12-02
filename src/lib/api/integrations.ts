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
 * Currently only supports GHL (uses ghl_config table)
 */
export async function getIntegrationStatus(): Promise<IntegrationStatus[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get GHL config if exists
  const { data: ghlConfig } = await supabase
    .from('ghl_config')
    .select('*')
    .eq('trainer_id', user.id)
    .maybeSingle();

  const statuses: IntegrationStatus[] = [];

  // Add GHL status if configured
  if (ghlConfig) {
    statuses.push({
      id: ghlConfig.id,
      trainer_id: user.id,
      integration_name: 'ghl',
      connection_status: ghlConfig.access_token ? 'connected' : 'disconnected',
      last_sync_at: ghlConfig.last_sync_at,
      error_count: 0,
      records_synced: 0,
      records_updated: 0,
    });
  }

  return statuses;
}

/**
 * Get status for a specific integration
 * Currently only GHL is supported with real data
 */
export async function getIntegrationStatusByName(
  integrationName: IntegrationSource
): Promise<IntegrationStatus | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Only GHL is supported with real data
  if (integrationName !== 'ghl') {
    return null;
  }

  const { data: ghlConfig } = await supabase
    .from('ghl_config')
    .select('*')
    .eq('trainer_id', user.id)
    .maybeSingle();

  if (!ghlConfig) return null;

  return {
    id: ghlConfig.id,
    trainer_id: user.id,
    integration_name: 'ghl',
    connection_status: ghlConfig.access_token ? 'connected' : 'disconnected',
    last_sync_at: ghlConfig.last_sync_at,
    error_count: 0,
    records_synced: 0,
    records_updated: 0,
  };
}

/**
 * Get recent activity log for an integration
 * Returns empty array for now (activity logging not implemented)
 */
export async function getIntegrationActivityLog(
  integrationName: IntegrationSource,
  limit: number = 10
): Promise<IntegrationActivityLog[]> {
  // Activity logging not yet implemented
  return [];
}

/**
 * Get integration config (without sensitive tokens)
 * Currently only GHL is supported
 */
export async function getIntegrationConfig(
  integrationName: IntegrationSource
): Promise<IntegrationConfig | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (integrationName !== 'ghl') {
    return null;
  }

  const { data: ghlConfig } = await supabase
    .from('ghl_config')
    .select('id, trainer_id, location_id, last_sync_at')
    .eq('trainer_id', user.id)
    .maybeSingle();

  if (!ghlConfig) return null;

  return {
    id: ghlConfig.id,
    trainer_id: user.id,
    integration_name: 'ghl',
    external_account_id: ghlConfig.location_id || '',
    external_location_id: ghlConfig.location_id || undefined,
    last_sync_at: ghlConfig.last_sync_at || undefined,
    sync_status: 'connected',
  };
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
 * Currently only GHL is supported
 */
export async function disconnectIntegration(
  integrationName: IntegrationSource
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (integrationName !== 'ghl') {
    throw new Error(`Disconnect not supported for ${integrationName}`);
  }

  // Delete GHL config
  const { error } = await supabase
    .from('ghl_config')
    .delete()
    .eq('trainer_id', user.id);

  if (error) throw error;
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
