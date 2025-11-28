/**
 * Shared GHL token refresh utility
 * Used by all GHL integration functions to refresh OAuth tokens
 */

const GHL_CLIENT_ID = Deno.env.get('GHL_CLIENT_ID');
const GHL_CLIENT_SECRET = Deno.env.get('GHL_CLIENT_SECRET');

export interface TokenResult {
  token: string;
  tokenType: 'oauth' | 'agency';
  refreshed: boolean;
}

export async function refreshGHLToken(
  supabase: any,
  trainerId: string,
  logger?: { info: (msg: string, data?: any) => void; warn: (msg: string, data?: any) => void; error: (msg: string, data?: any) => void; debug: (msg: string, data?: any) => void },
): Promise<string | null> {
  const { data: config } = await supabase
    .from('ghl_config')
    .select('refresh_token, access_token, token_expires_at')
    .eq('trainer_id', trainerId)
    .single();

  if (!config?.refresh_token) {
    logger?.warn('No refresh token available', { trainerId });
    return null;
  }

  // Check if token is expired or expires within 5 minutes
  const expiresAt = config.token_expires_at ? new Date(config.token_expires_at) : null;
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (expiresAt && expiresAt > fiveMinutesFromNow && config.access_token) {
    // Token still valid
    logger?.debug('Token still valid, using existing', { trainerId });
    return config.access_token;
  }

  // Refresh token
  if (!GHL_CLIENT_ID || !GHL_CLIENT_SECRET) {
    logger?.warn('GHL OAuth credentials not configured for token refresh', { trainerId });
    return config.access_token ?? null;
  }

  logger?.info('Refreshing GHL token', { trainerId });

  const refreshResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GHL_CLIENT_ID,
      client_secret: GHL_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: config.refresh_token,
    }),
  });

  if (!refreshResponse.ok) {
    const errorText = await refreshResponse.text();
    logger?.error('Token refresh failed', { trainerId, status: refreshResponse.status, error: errorText });
    return config.access_token ?? null;
  }

  const tokens = await refreshResponse.json();
  const { access_token, refresh_token: new_refresh_token, expires_in } = tokens;

  // Update stored tokens
  const expiresInSeconds = expires_in || 86400; // Default to 24 hours
  const expiresAtNew = new Date(Date.now() + expiresInSeconds * 1000);
  
  await supabase
    .from('ghl_config')
    .update({
      access_token,
      refresh_token: new_refresh_token || config.refresh_token,
      token_expires_at: expiresAtNew.toISOString(),
    })
    .eq('trainer_id', trainerId);

  logger?.info('Token refreshed successfully', { trainerId });
  return access_token;
}

/**
 * Get the best available GHL token for a trainer
 * Prioritizes OAuth token over agency token, handles refresh if needed
 */
export async function getGHLToken(
  supabase: any,
  trainerId: string,
  agencyToken?: string,
  logger?: { info: (msg: string, data?: any) => void; warn: (msg: string, data?: any) => void; error: (msg: string, data?: any) => void; debug: (msg: string, data?: any) => void },
): Promise<TokenResult> {
  // Try to get and refresh OAuth token if available
  const oauthToken = await refreshGHLToken(supabase, trainerId, logger);
  
  if (oauthToken) {
    return {
      token: oauthToken,
      tokenType: 'oauth',
      refreshed: true,
    };
  }
  
  // Fall back to agency token
  const fallbackToken = agencyToken || Deno.env.get('GHL_PRIVATE_API_KEY');
  if (fallbackToken) {
    logger?.info('Using agency token as fallback', { trainerId });
    return {
      token: fallbackToken,
      tokenType: 'agency',
      refreshed: false,
    };
  }
  
  throw new Error('No GHL token available');
}
