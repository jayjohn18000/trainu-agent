/**
 * Script to fetch GHL snapshot data
 * Run with: node scripts/fetch-ghl-snapshot.js
 * 
 * Requires GHL_PRIVATE_API_KEY to be set as environment variable
 * or passed as argument: GHL_PRIVATE_API_KEY=your_key node scripts/fetch-ghl-snapshot.js
 */

const SNAPSHOT_ID = 'ZyDyVPypdONMcyasVKMR';
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

const GHL_PRIVATE_API_KEY = process.env.GHL_PRIVATE_API_KEY;

if (!GHL_PRIVATE_API_KEY) {
  console.error('❌ GHL_PRIVATE_API_KEY environment variable is not set');
  console.error('   Set it with: export GHL_PRIVATE_API_KEY=your_key');
  console.error('   Or run: GHL_PRIVATE_API_KEY=your_key node scripts/fetch-ghl-snapshot.js');
  process.exit(1);
}

async function fetchSnapshot() {
  try {
    console.log(`📥 Fetching snapshot ${SNAPSHOT_ID}...\n`);
    
    let snapshotData = null;
    let lastError = null;

    // First, try to get account/company info to find companyId
    console.log('📋 Getting account/company information...\n');
    let companyId = null;
    let locations = [];
    try {
      // Try multiple endpoints to get company info
      const accountEndpoints = [
        `${GHL_API_BASE}/companies/me`,
        `${GHL_API_BASE}/v1/companies/me`,
        `${GHL_API_BASE}/company`,
        `${GHL_API_BASE}/v1/company`,
        `${GHL_API_BASE}/users/me`,
      ];
      
      for (const accountEndpoint of accountEndpoints) {
        try {
          const accountResponse = await fetch(accountEndpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${GHL_PRIVATE_API_KEY}`,
              'Version': GHL_API_VERSION,
              'Content-Type': 'application/json',
            },
          });
          if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            console.log(`👤 Account info from ${accountEndpoint}:`);
            console.log(JSON.stringify(accountData, null, 2));
            console.log('\n');
            companyId = accountData.companyId || accountData.company?.id || accountData.id || accountData._id;
            if (companyId) break;
          }
        } catch (err) {
          // Continue to next endpoint
        }
      }
      
      if (!companyId) {
        console.log('⚠️  Could not determine companyId from account endpoints\n');
      }
      
      // Try to get locations (try multiple endpoint variations)
      const locationEndpoints = companyId
        ? [
            `${GHL_API_BASE}/v1/locations/?companyId=${companyId}`,
            `${GHL_API_BASE}/locations/?companyId=${companyId}`,
            `${GHL_API_BASE}/v1/locations/`,
            `${GHL_API_BASE}/locations/`,
            `${GHL_API_BASE}/v1/locations`,
          ]
        : [
            `${GHL_API_BASE}/v1/locations/`,
            `${GHL_API_BASE}/locations/`,
            `${GHL_API_BASE}/v1/locations`,
          ];
      
      for (const locEndpoint of locationEndpoints) {
        try {
          const locationsResponse = await fetch(locEndpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${GHL_PRIVATE_API_KEY}`,
              'Version': GHL_API_VERSION,
              'Content-Type': 'application/json',
            },
          });
          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            console.log(`📍 Locations from ${locEndpoint}:`);
            console.log(JSON.stringify(locationsData, null, 2));
            console.log('\n');
            locations = locationsData.locations || locationsData.data || [];
            if (locations.length > 0 && !companyId) {
              companyId = locations[0].companyId || locations[0].company?.id;
            }
            break; // Success, stop trying other endpoints
          } else {
            const errorText = await locationsResponse.text();
            console.log(`⚠️  ${locEndpoint} failed: ${locationsResponse.status} - ${errorText}\n`);
          }
        } catch (err) {
          console.log(`⚠️  ${locEndpoint} error: ${err.message}\n`);
        }
      }
      
      if (locations.length === 0) {
        console.log(`⚠️  Could not fetch locations from any endpoint\n`);
      }
    } catch (err) {
      console.log(`⚠️  Could not fetch account/location info: ${err.message}\n`);
    }

    // Try to list all snapshots to see the structure
    console.log('📋 Attempting to list all snapshots...\n');
    const listEndpoints = [];
    if (companyId) {
      listEndpoints.push(
        `${GHL_API_BASE}/snapshots/?companyId=${companyId}`,
        `${GHL_API_BASE}/v1/snapshots/?companyId=${companyId}`,
        `${GHL_API_BASE}/companies/${companyId}/snapshots/`,
        `${GHL_API_BASE}/v1/companies/${companyId}/snapshots/`
      );
    }
    // Try location-specific snapshot lists
    for (const location of locations.slice(0, 2)) {
      const locationId = location.id || location.locationId;
      if (locationId) {
        listEndpoints.push(
          `${GHL_API_BASE}/snapshots/?locationId=${locationId}`,
          `${GHL_API_BASE}/locations/${locationId}/snapshots/`,
          `${GHL_API_BASE}/v1/locations/${locationId}/snapshots/`
        );
      }
    }
    // Add generic endpoints
    listEndpoints.push(
      `${GHL_API_BASE}/snapshots/`,
      `${GHL_API_BASE}/v1/snapshots/`
    );
    
    for (const listEndpoint of listEndpoints) {
      try {
        const listResponse = await fetch(listEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${GHL_PRIVATE_API_KEY}`,
            'Version': GHL_API_VERSION,
            'Content-Type': 'application/json',
          },
        });

        if (listResponse.ok) {
          const listData = await listResponse.json();
          console.log(`📋 Snapshot list response from ${listEndpoint}:`);
          console.log(JSON.stringify(listData, null, 2));
          console.log('\n');
          
          // Try to find our snapshot in the list
          if (listData.snapshots && Array.isArray(listData.snapshots)) {
            const found = listData.snapshots.find(s => 
              s.id === SNAPSHOT_ID || 
              s.snapshotId === SNAPSHOT_ID ||
              s._id === SNAPSHOT_ID
            );
            if (found) {
              console.log(`✅ Found snapshot in list!`);
              snapshotData = { snapshot: found };
              break;
            }
          }
        }
      } catch (err) {
        console.log(`⚠️  Failed to list from ${listEndpoint}: ${err.message}\n`);
      }
    }

    // If not found in list, try direct endpoints
    if (!snapshotData) {
      console.log('🔍 Trying direct snapshot endpoints...\n');
      // Build endpoints based on whether we have companyId
      const endpoints = [];
      if (companyId) {
        endpoints.push(
          `${GHL_API_BASE}/snapshots/${SNAPSHOT_ID}?companyId=${companyId}`,
          `${GHL_API_BASE}/snapshots/?id=${SNAPSHOT_ID}&companyId=${companyId}`
        );
      }
      // Also try location-specific endpoints if we have locations
      for (const location of locations.slice(0, 3)) { // Try first 3 locations
        const locationId = location.id || location.locationId;
        if (locationId) {
          endpoints.push(
            `${GHL_API_BASE}/snapshots/${SNAPSHOT_ID}?locationId=${locationId}`,
            `${GHL_API_BASE}/locations/${locationId}/snapshots/${SNAPSHOT_ID}`
          );
        }
      }
      // Add generic endpoints
      endpoints.push(
        `${GHL_API_BASE}/snapshots/${SNAPSHOT_ID}`,
        `${GHL_API_BASE}/v1/snapshots/${SNAPSHOT_ID}`,
        `${GHL_API_BASE}/snapshots/?id=${SNAPSHOT_ID}`
      );
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${GHL_PRIVATE_API_KEY}`,
              'Version': GHL_API_VERSION,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`📦 Response from ${endpoint}:`);
            console.log(JSON.stringify(data, null, 2));
            console.log('\n');
            if (data && (data.id || data.snapshotId || data.snapshot || (data.snapshots && data.snapshots.length > 0))) {
              snapshotData = data;
              console.log(`✅ Success with endpoint: ${endpoint}\n`);
              break;
            }
          } else {
            const errorText = await response.text();
            lastError = `${response.status} ${response.statusText}: ${errorText}`;
            console.log(`❌ Endpoint ${endpoint} failed: ${lastError}\n`);
          }
        } catch (err) {
          lastError = err.message;
        }
      }
    }

    if (!snapshotData || (snapshotData.snapshots && snapshotData.snapshots.length === 0)) {
      console.error(`❌ Snapshot ${SNAPSHOT_ID} not found or empty`);
      console.error(`   Last error: ${lastError || 'No data returned'}`);
      console.error('\n💡 Suggestions:');
      console.error('   1. Verify the snapshot ID is correct');
      console.error('   2. Check that the API key has access to snapshots');
      console.error('   3. The snapshot might need to be accessed via a different endpoint');
      process.exit(1);
    }
    
    console.log('✅ Snapshot fetched successfully!\n');
    console.log('='.repeat(80));
    console.log('SNAPSHOT DATA');
    console.log('='.repeat(80));
    console.log(JSON.stringify(snapshotData, null, 2));
    console.log('='.repeat(80));
    
    // Save to file for analysis
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const outputPath = path.join(__dirname, '..', 'supabase', 'functions', 'ghl-provisioning', 'snapshots', 'fetched-snapshot.json');
    fs.writeFileSync(outputPath, JSON.stringify(snapshotData, null, 2));
    console.log(`\n💾 Saved to: ${outputPath}`);
    
    // Print summary
    console.log('\n📊 Snapshot Summary:');
    const snapshot = snapshotData.snapshot || snapshotData;
    console.log(`   - Snapshot ID: ${snapshot.id || snapshot.snapshotId || SNAPSHOT_ID}`);
    console.log(`   - Name: ${snapshot.name || 'N/A'}`);
    console.log(`   - Description: ${snapshot.description || 'N/A'}`);
    
    if (snapshot.workflows) {
      console.log(`   - Workflows: ${Array.isArray(snapshot.workflows) ? snapshot.workflows.length : 'N/A'}`);
    }
    if (snapshot.automations) {
      console.log(`   - Automations: ${Array.isArray(snapshot.automations) ? snapshot.automations.length : 'N/A'}`);
    }
    if (snapshot.tags) {
      console.log(`   - Tags: ${Array.isArray(snapshot.tags) ? snapshot.tags.length : 'N/A'}`);
    }
    if (snapshot.customFields) {
      console.log(`   - Custom Fields: ${Array.isArray(snapshot.customFields) ? snapshot.customFields.length : 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ Error fetching snapshot:', error.message);
    process.exit(1);
  }
}

fetchSnapshot();

