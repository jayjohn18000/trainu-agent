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
 * Queries integration_status table for all platforms
 */
export async function getIntegrationStatus(): Promise<IntegrationStatus[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Query integration_status table
  const { data: statuses, error } = await supabase
    .from('integration_status')
    .select('*')
    .eq('trainer_id', user.id)
    .order('integration_name');

  if (error) throw error;

  // Also check GHL config for backward compatibility
  const { data: ghlConfig } = await supabase
    .from('ghl_config')
    .select('*')
    .eq('trainer_id', user.id)
    .maybeSingle();

  const result: IntegrationStatus[] = statuses || [];

  // Add GHL status if configured but not in integration_status table
  if (ghlConfig && !result.find(s => s.integration_name === 'ghl')) {
    result.push({
      id: ghlConfig.id,
      trainer_id: user.id,
      integration_name: 'ghl',
      connection_status: ghlConfig.access_token ? 'connected' : 'disconnected',
      last_sync_at: ghlConfig.last_sync_at || undefined,
      error_count: 0,
      records_synced: 0,
      records_updated: 0,
    });
  }

  return result;
}

/**
 * Get status for a specific integration
 * Queries integration_status table, falls back to GHL config for backward compatibility
 */
export async function getIntegrationStatusByName(
  integrationName: IntegrationSource
): Promise<IntegrationStatus | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Query integration_status table first
  const { data: status, error } = await supabase
    .from('integration_status')
    .select('*')
    .eq('trainer_id', user.id)
    .eq('integration_name', integrationName)
    .maybeSingle();

  if (error) throw error;

  // If found in integration_status, return it
  if (status) {
    return status as IntegrationStatus;
  }

  // Fallback to GHL config for backward compatibility
  if (integrationName === 'ghl') {
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
      last_sync_at: ghlConfig.last_sync_at || undefined,
      error_count: 0,
      records_synced: 0,
      records_updated: 0,
    };
  }

  return null;
}

/**
 * Get recent activity log for an integration
 * Queries integration_activity_log table
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
  return (data || []) as IntegrationActivityLog[];
}

/**
 * Get integration config (without sensitive tokens)
 * Queries integration_configs table, falls back to GHL config for backward compatibility
 */
export async function getIntegrationConfig(
  integrationName: IntegrationSource
): Promise<IntegrationConfig | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Query integration_configs table first
  const { data: config, error } = await supabase
    .from('integration_configs')
    .select('id, trainer_id, integration_name, external_account_id, external_location_id, last_sync_at, sync_status, sync_error_message')
    .eq('trainer_id', user.id)
    .eq('integration_name', integrationName)
    .maybeSingle();

  if (error) throw error;

  // If found in integration_configs, return it
  if (config) {
    return {
      id: config.id,
      trainer_id: config.trainer_id,
      integration_name: config.integration_name as IntegrationSource,
      external_account_id: config.external_account_id,
      external_location_id: config.external_location_id || undefined,
      last_sync_at: config.last_sync_at || undefined,
      sync_status: config.sync_status as IntegrationConfig['sync_status'],
      sync_error_message: config.sync_error_message || undefined,
    };
  }

  // Fallback to GHL config for backward compatibility
  if (integrationName === 'ghl') {
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

  return null;
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
 * Deletes from integration_configs table, updates integration_status
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

  // Handle GHL backward compatibility
  if (integrationName === 'ghl') {
    const { error: ghlError } = await supabase
      .from('ghl_config')
      .delete()
      .eq('trainer_id', user.id);

    // Don't throw if ghl_config doesn't exist
    if (ghlError && ghlError.code !== 'PGRST116') throw ghlError;
  }
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
