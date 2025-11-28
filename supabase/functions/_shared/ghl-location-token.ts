/**
 * GHL Location Access Token Exchange
 * 
 * Exchanges an agency-level Private Integration Token for a location-scoped access token.
 * This allows full subaccount permissions without requiring per-trainer PIT setup.
 * 
 * GHL API: POST /oauth/locationToken
 * Docs: https://highlevel.stoplight.io/docs/integrations/
 */

const GHL_API_BASE = Deno.env.get('GHL_API_BASE') || 'https://services.leadconnectorhq.com';

export interface LocationTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  locationId: string;
}

export interface TokenExchangeResult {
  success: boolean;
  accessToken?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Exchange agency PIT for location-scoped access token
 */
export async function exchangeForLocationToken(
  agencyToken: string,
  locationId: string,
  companyId?: string
): Promise<TokenExchangeResult> {
  console.log(`[ghl-location-token] Exchanging token for location ${locationId}`);
  
  try {
    // Method 1: Try the oauth/locationToken endpoint
    const exchangeUrl = `${GHL_API_BASE}/oauth/locationToken`;
    
    const response = await fetch(exchangeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${agencyToken}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId: companyId || undefined,
        locationId: locationId,
      }),
    });

    if (response.ok) {
      const data: LocationTokenResponse = await response.json();
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 86400));
      
      console.log(`[ghl-location-token] Successfully obtained location token for ${locationId}`);
      
      return {
        success: true,
        accessToken: data.access_token,
        expiresAt: expiresAt.toISOString(),
      };
    }

    // If oauth/locationToken fails, try alternative approaches
    const errorText = await response.text();
    console.error(`[ghl-location-token] Token exchange failed: ${response.status} - ${errorText}`);
    
    // Check if it's a scope issue
    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        error: `Token exchange not authorized. Agency token may need 'oauth.readonly' or 'oauth.write' scope. Status: ${response.status}`,
      };
    }
    
    if (response.status === 404) {
      // Try alternative method - use agency token directly with location scoping
      // This is a fallback when the locationToken endpoint isn't available
      console.log(`[ghl-location-token] locationToken endpoint not available, using agency token with location scoping`);
      
      return {
        success: false,
        error: 'Location token exchange endpoint not available. Will use agency token with location scoping.',
      };
    }

    return {
      success: false,
      error: `Token exchange failed: ${response.status} - ${errorText}`,
    };
    
  } catch (error) {
    console.error('[ghl-location-token] Exchange error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during token exchange',
    };
  }
}

/**
 * Get the best available token for GHL API calls
 * Priority: 1) Location-scoped token, 2) Agency token
 */
export function getEffectiveToken(
  locationToken: string | null,
  agencyToken: string,
  tokenExpiresAt: string | null
): { token: string; tokenType: 'location' | 'agency' } {
  // Check if we have a valid location token
  if (locationToken && tokenExpiresAt) {
    const expiryDate = new Date(tokenExpiresAt);
    const now = new Date();
    
    // Add 5 minute buffer before expiry
    const bufferMs = 5 * 60 * 1000;
    if (expiryDate.getTime() - now.getTime() > bufferMs) {
      return { token: locationToken, tokenType: 'location' };
    }
    
    console.log('[ghl-location-token] Location token expired or expiring soon, using agency token');
  }
  
  return { token: agencyToken, tokenType: 'agency' };
}
