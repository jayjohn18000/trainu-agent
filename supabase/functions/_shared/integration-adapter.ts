// Base adapter interface for integration platforms
// All integrations (Mindbody, Trainerize, etc.) should implement this pattern

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type IntegrationSource = 'ghl' | 'mindbody' | 'trainerize' | 'truecoach' | 'apple_health' | 'oura';

export interface IntegrationConfig {
  id: string;
  trainer_id: string;
  integration_name: IntegrationSource;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  external_account_id: string;
  external_location_id?: string;
  last_sync_at?: string;
  sync_status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'warning';
  sync_error_message?: string;
  config_data?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  recordsUpdated: number;
  errors?: string[];
  durationMs: number;
}

export interface BaseAdapter {
  // Get configuration for this integration
  getConfig(trainerId: string): Promise<IntegrationConfig | null>;
  
  // Refresh OAuth token if expired
  refreshToken(config: IntegrationConfig): Promise<IntegrationConfig>;
  
  // Sync data from external platform
  sync(trainerId: string): Promise<SyncResult>;
  
  // Disconnect integration (revoke tokens)
  disconnect(trainerId: string): Promise<void>;
}

// Helper function to get Supabase client with service role
export function getServiceRoleClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

// Helper function to get integration config from database
export async function getIntegrationConfig(
  supabase: SupabaseClient,
  trainerId: string,
  integrationName: IntegrationSource
): Promise<IntegrationConfig | null> {
  const { data, error } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('trainer_id', trainerId)
    .eq('integration_name', integrationName)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching ${integrationName} config:`, error);
    return null;
  }

  return data as IntegrationConfig | null;
}

// Helper function to update integration status
export async function updateIntegrationStatus(
  supabase: SupabaseClient,
  trainerId: string,
  integrationName: IntegrationSource,
  updates: {
    connection_status?: 'connected' | 'disconnected' | 'error' | 'syncing' | 'warning';
    last_sync_at?: string;
    sync_error_message?: string;
    records_synced?: number;
    records_updated?: number;
    sync_duration_ms?: number;
    api_calls_used?: number;
    error_count?: number;
    last_error?: string;
    last_error_at?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('integration_status')
    .upsert({
      trainer_id: trainerId,
      integration_name: integrationName,
      ...updates,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'trainer_id,integration_name',
    });

  if (error) {
    console.error(`Error updating ${integrationName} status:`, error);
    throw error;
  }
}

// Helper function to log integration activity
export async function logIntegrationActivity(
  supabase: SupabaseClient,
  trainerId: string,
  integrationName: IntegrationSource,
  activityType: string,
  activityMessage: string,
  activityData?: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('integration_activity_log')
    .insert({
      trainer_id: trainerId,
      integration_name: integrationName,
      activity_type: activityType,
      activity_message: activityMessage,
      activity_data: activityData || null,
    });

  if (error) {
    console.error(`Error logging ${integrationName} activity:`, error);
    // Don't throw - activity logging shouldn't break sync
  }
}

