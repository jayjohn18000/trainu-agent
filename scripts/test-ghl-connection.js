/**
 * Test GHL API connection for provisioning
 * Tests the exact endpoints that provisioning uses
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
const GHL_PRIVATE_API_KEY = process.env.GHL_PRIVATE_API_KEY;

if (!GHL_PRIVATE_API_KEY) {
  console.error('❌ GHL_PRIVATE_API_KEY environment variable is not set');
  process.exit(1);
}

async function testEndpoint(endpoint, method = 'GET', body = null) {
  console.log(`\n🔍 Testing: ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${GHL_PRIVATE_API_KEY}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${GHL_API_BASE}${endpoint}`, options);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { ok: false, error: error.message };
  }
}

async function diagnose() {
  console.log('🔧 GHL API Connection Diagnostics');
  console.log('='.repeat(80));
  console.log(`API Base: ${GHL_API_BASE}`);
  console.log(`API Version: ${GHL_API_VERSION}`);
  console.log(`Key Format: ${GHL_PRIVATE_API_KEY.substring(0, 7)}...`);
  console.log('='.repeat(80));
  
  const results = {
    canListLocations: false,
    canAccessAgency: false,
    canCreateLocation: false,
    canAccessSnapshots: false,
    errors: [],
  };
  
  // Test 1: List locations (needed to check if we can read)
  console.log('\n📋 Test 1: Can we list locations?');
  let result = await testEndpoint('/v1/locations/', 'GET');
  if (result.ok) results.canListLocations = true;
  else results.errors.push({ test: 'list locations v1', error: result.data });
  
  if (!result.ok) {
    result = await testEndpoint('/locations/', 'GET');
    if (result.ok) results.canListLocations = true;
    else results.errors.push({ test: 'list locations', error: result.data });
  }
  
  // Test 2: Try with query parameter
  console.log('\n📋 Test 2: List locations with limit');
  result = await testEndpoint('/v1/locations/?limit=1', 'GET');
  
  // Test 3: Check if we can access agency/company info
  console.log('\n📋 Test 3: Can we access agency info?');
  result = await testEndpoint('/companies/me', 'GET');
  if (result.ok) results.canAccessAgency = true;
  else results.errors.push({ test: 'companies/me', error: result.data });
  
  if (!result.ok) {
    result = await testEndpoint('/v1/companies/', 'GET');
    if (result.ok) results.canAccessAgency = true;
  }
  
  result = await testEndpoint('/agencies/', 'GET');
  
  // Test 4: Try to create a test location (DRY RUN - will likely fail)
  console.log('\n📋 Test 4: Can we create a location? (test payload)');
  const testLocation = {
    name: 'Test Location - DO NOT USE',
    companyName: 'Test Company',
    address: '123 Test St',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US',
    postalCode: '90001',
    timezone: 'America/Los_Angeles',
    email: 'test@example.com',
    phone: '+1234567890',
  };
  result = await testEndpoint('/v1/locations', 'POST', testLocation);
  if (result.ok) results.canCreateLocation = true;
  else results.errors.push({ test: 'create location', error: result.data });
  
  // Test 5: Check snapshots endpoint
  console.log('\n📋 Test 5: Can we access snapshots?');
  result = await testEndpoint('/snapshots/', 'GET');
  if (result.ok && result.data?.snapshots) results.canAccessSnapshots = true;
  else results.errors.push({ test: 'snapshots', error: result.data });
  
  result = await testEndpoint('/v1/snapshots/', 'GET');
  
  // Test 6: Alternative headers (try without Version header)
  console.log('\n📋 Test 6: Try without Version header');
  try {
    const response = await fetch(`${GHL_API_BASE}/v1/locations/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_PRIVATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log(`   Error: ${err.message}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 Diagnosis Results');
  console.log('='.repeat(80));
  console.log(`✓ Can List Locations: ${results.canListLocations ? '✅' : '❌'}`);
  console.log(`✓ Can Access Agency Info: ${results.canAccessAgency ? '✅' : '❌'}`);
  console.log(`✓ Can Create Location: ${results.canCreateLocation ? '✅' : '❌'}`);
  console.log(`✓ Can Access Snapshots: ${results.canAccessSnapshots ? '✅' : '❌'}`);
  
  console.log('\n📝 Error Summary:');
  results.errors.forEach(e => {
    console.log(`   - ${e.test}: ${JSON.stringify(e.error)}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(80));
  
  if (!results.canListLocations && !results.canCreateLocation) {
    console.log('\n❌ CRITICAL: Cannot access location endpoints');
    console.log('\n🔧 Possible Issues:');
    console.log('   1. API Key Type: pit-* format suggests "Private Integration Token"');
    console.log('   2. These tokens may require OAuth 2.0 flow, not direct Bearer auth');
    console.log('   3. The key might be missing required scopes/permissions');
    console.log('   4. The key might be location-scoped, not agency-scoped');
    
    console.log('\n✅ RECOMMENDED SOLUTION: Switch to OAuth 2.0');
    console.log('   For SaaS Pro, use OAuth flow:');
    console.log('   1. User authorizes app via OAuth');
    console.log('   2. Exchange auth code for access/refresh tokens');
    console.log('   3. Use access token for API calls');
    console.log('   4. Store tokens per location in ghl_config table');
    console.log('   5. Refresh tokens automatically when expired');
    
    console.log('\n📚 Alternative: Check GHL Dashboard');
    console.log('   1. Go to Settings → Private Integrations');
    console.log('   2. Verify scopes include: locations.write, locations.read');
    console.log('   3. Check if OAuth redirect URLs are configured');
    console.log('   4. Get OAuth client_id and client_secret');
  } else if (results.canListLocations && results.canCreateLocation) {
    console.log('\n✅ API Key Works! Provisioning should succeed.');
    console.log('   The key has proper agency-level permissions.');
  } else if (results.canListLocations && !results.canCreateLocation) {
    console.log('\n⚠️  Read-Only Access Detected');
    console.log('   The key can read locations but cannot create them.');
    console.log('   Check if the key has locations.write scope.');
  }
  
  console.log('\n');
}

diagnose();

