/**
 * Temporary edge function to fetch GHL snapshot details
 * Invoke with: supabase functions invoke ghl-fetch-snapshot
 */

import { corsHeaders } from '../_shared/responses.ts';

const GHL_PRIVATE_API_KEY = Deno.env.get('GHL_PRIVATE_API_KEY');
const SNAPSHOT_ID = 'ZyDyVPypdONMcyasVKMR';
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!GHL_PRIVATE_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'GHL_PRIVATE_API_KEY not configured' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log(`Fetching snapshot ${SNAPSHOT_ID}...`);
    
    const response = await fetch(`${GHL_API_BASE}/snapshots/${SNAPSHOT_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_PRIVATE_API_KEY}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch snapshot: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch snapshot',
          status: response.status,
          details: errorText 
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const snapshotData = await response.json();
    
    // Log to console for analysis
    console.log('=== SNAPSHOT DATA ===');
    console.log(JSON.stringify(snapshotData, null, 2));
    
    return new Response(
      JSON.stringify({
        success: true,
        snapshotId: SNAPSHOT_ID,
        data: snapshotData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error fetching snapshot:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

