# Snapshot Fetch Notes

## Current Status

**Snapshot ID:** `ZyDyVPypdONMcyasVKMR`

**Fetch Attempt Results:**
- Direct snapshot endpoint returns: `{ "snapshots": [], "totalCount": 0 }`
- Account info endpoint: `400 - User id me not found` (private API key may work differently)
- Locations endpoint: `404 Not Found` (endpoint may be `/v1/locations` instead)

## Observations

1. **Private API Key Behavior**: The private API key (`pit-*` format) may be:
   - Location-scoped rather than account-scoped
   - Require different authentication flow
   - Need to be used with specific location context

2. **Snapshot Access**: Since the snapshot is visible in SaaS Configurator dashboard, it exists but may need:
   - Location-specific access
   - SaaS-level API endpoints
   - Different authentication method

3. **Current Approach**: We've created tier snapshot definitions based on:
   - Your detailed feature descriptions for each tier
   - Current provisioning code structure
   - GHL API capabilities

## Recommendations

1. **Proceed with Current Definitions**: The snapshot JSON files we created (`starter.json`, `professional.json`, `growth.json`) are based on your tier feature requirements and can be refined later.

2. **Alternative Access Methods**:
   - Try accessing snapshot via OAuth per-location tokens during provisioning
   - Check if snapshot can be exported from SaaS Configurator dashboard
   - Verify if snapshot needs to be accessed through a specific location context

3. **Testing**: Once provisioning is set up, we can:
   - Test snapshot application during actual provisioning
   - Refine snapshot definitions based on what gets created
   - Update based on actual GHL API responses

## Next Steps

The provisioning function is ready to apply snapshots. We can:
1. Test provisioning with the current snapshot definitions
2. Refine based on actual API responses
3. Update snapshot files as we learn more about the GHL snapshot structure

