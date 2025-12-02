// OAuth token refresh helpers for integration platforms

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { IntegrationConfig, IntegrationSource } from "./integration-adapter.ts";

export interface TokenRefreshResult {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

// Check if token is expired or expiring soon (within 5 minutes)
export function isTokenExpired(config: IntegrationConfig): boolean {
  if (!config.expires_at) return false;
  const expiresAt = new Date(config.expires_at);
  const now = new Date();
  const bufferMs = 5 * 60 * 1000; // 5 minutes buffer
  return expiresAt.getTime() - now.getTime() < bufferMs;
}

// Generic token refresh handler
export async function refreshOAuthToken(
  supabase: SupabaseClient,
  config: IntegrationConfig,
  refreshFn: (refreshToken: string) => Promise<TokenRefreshResult>
): Promise<IntegrationConfig> {
  if (!config.refresh_token) {
    throw new Error(`No refresh token available for ${config.integration_name}`);
  }

  try {
    const tokenData = await refreshFn(config.refresh_token);

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // Update config in database
    const { data, error } = await supabase
      .from('integration_configs')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || config.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id)
      .select()
      .single();

    if (error) throw error;

    return data as IntegrationConfig;
  } catch (error) {
    console.error(`Token refresh failed for ${config.integration_name}:`, error);
    
    // Update status to error
    await supabase
      .from('integration_configs')
      .update({
        sync_status: 'error',
        sync_error_message: `Token refresh failed: ${error instanceof Error ? error.message : String(error)}`,
      })
      .eq('id', config.id);

    throw error;
  }
}

// Mindbody-specific token refresh
export async function refreshMindbodyToken(
  supabase: SupabaseClient,
  config: IntegrationConfig
): Promise<IntegrationConfig> {
  const CLIENT_ID = Deno.env.get('MINDBODY_CLIENT_ID');
  const CLIENT_SECRET = Deno.env.get('MINDBODY_CLIENT_SECRET');

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Mindbody OAuth credentials not configured');
  }

  return refreshOAuthToken(supabase, config, async (refreshToken: string) => {
    const response = await fetch('https://api.mindbodyonline.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Token refresh failed: ${errorData.error_description || response.statusText}`);
    }

    return await response.json();
  });
}

// Generic function to ensure valid token (refresh if needed)
export async function ensureValidToken(
  supabase: SupabaseClient,
  config: IntegrationConfig,
  refreshFn?: (supabase: SupabaseClient, config: IntegrationConfig) => Promise<IntegrationConfig>
): Promise<IntegrationConfig> {
  if (!isTokenExpired(config)) {
    return config;
  }

  if (!refreshFn) {
    throw new Error(`Token expired for ${config.integration_name} but no refresh function provided`);
  }

  return refreshFn(supabase, config);
}

