// Activity logging utility for integration syncs

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { IntegrationSource } from "./integration-adapter.ts";
import { logIntegrationActivity } from "./integration-adapter.ts";

export interface SyncLogger {
  logStart(): void;
  logSuccess(recordsSynced: number, recordsUpdated: number, durationMs: number): void;
  logError(error: Error | string, context?: Record<string, any>): void;
  logProgress(message: string, data?: Record<string, any>): void;
  logWebhook(eventType: string, data?: Record<string, any>): void;
}

export function createSyncLogger(
  supabase: SupabaseClient,
  trainerId: string,
  integrationName: IntegrationSource
): SyncLogger {
  const startTime = Date.now();
  let errorCount = 0;

  return {
    logStart() {
      logIntegrationActivity(
        supabase,
        trainerId,
        integrationName,
        'sync_started',
        `Sync started for ${integrationName}`
      ).catch(console.error);
    },

    logSuccess(recordsSynced: number, recordsUpdated: number, durationMs: number) {
      logIntegrationActivity(
        supabase,
        trainerId,
        integrationName,
        'sync_completed',
        `Sync completed: ${recordsSynced} synced, ${recordsUpdated} updated in ${durationMs}ms`,
        { recordsSynced, recordsUpdated, durationMs }
      ).catch(console.error);
    },

    logError(error: Error | string, context?: Record<string, any>) {
      errorCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logIntegrationActivity(
        supabase,
        trainerId,
        integrationName,
        'sync_error',
        `Sync error: ${errorMessage}`,
        {
          error: errorMessage,
          errorStack: error instanceof Error ? error.stack : undefined,
          ...context,
        }
      ).catch(console.error);
    },

    logProgress(message: string, data?: Record<string, any>) {
      logIntegrationActivity(
        supabase,
        trainerId,
        integrationName,
        'sync_progress',
        message,
        data
      ).catch(console.error);
    },

    logWebhook(eventType: string, data?: Record<string, any>) {
      logIntegrationActivity(
        supabase,
        trainerId,
        integrationName,
        'webhook_received',
        `Webhook received: ${eventType}`,
        { eventType, ...data }
      ).catch(console.error);
    },
  };
}

// Helper to get recent activity log entries
export async function getRecentActivityLog(
  supabase: SupabaseClient,
  trainerId: string,
  integrationName: IntegrationSource,
  limit: number = 10
): Promise<Array<{
  id: string;
  activity_type: string;
  activity_message: string;
  activity_data: Record<string, any> | null;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from('integration_activity_log')
    .select('id, activity_type, activity_message, activity_data, created_at')
    .eq('trainer_id', trainerId)
    .eq('integration_name', integrationName)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching activity log for ${integrationName}:`, error);
    return [];
  }

  return data || [];
}

