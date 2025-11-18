/**
 * Helper script to fetch GHL snapshot details
 * Run with: deno run --allow-net --allow-env fetch-snapshot.ts
 */

const GHL_PRIVATE_API_KEY = Deno.env.get('GHL_PRIVATE_API_KEY');
const SNAPSHOT_ID = 'ZyDyVPypdONMcyasVKMR';
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

if (!GHL_PRIVATE_API_KEY) {
  console.error('GHL_PRIVATE_API_KEY environment variable is not set');
  Deno.exit(1);
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
    console.error(`Failed to fetch snapshot: ${response.status} ${response.statusText}`);
    console.error('Response:', errorText);
    Deno.exit(1);
  }

  const snapshotData = await response.json();
  
  console.log('\n=== SNAPSHOT DATA ===\n');
  console.log(JSON.stringify(snapshotData, null, 2));
  
  // Also try to get list of snapshots to see structure
  console.log('\n=== FETCHING ALL SNAPSHOTS (for reference) ===\n');
  const listResponse = await fetch(`${GHL_API_BASE}/snapshots/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_API_KEY}`,
      'Version': GHL_API_VERSION,
      'Content-Type': 'application/json',
    },
  });

  if (listResponse.ok) {
    const snapshotsList = await listResponse.json();
    console.log(JSON.stringify(snapshotsList, null, 2));
  } else {
    console.log('Could not fetch snapshot list (this is optional)');
  }

} catch (error) {
  console.error('Error fetching snapshot:', error);
  Deno.exit(1);
}

