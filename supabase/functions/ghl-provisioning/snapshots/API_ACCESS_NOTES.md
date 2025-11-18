# GHL Snapshot API Access Notes

## Current Status

**Snapshot ID:** `ZyDyVPypdONMcyasVKMR`  
**Private API Key Format:** `pit-*` (Private Integration Token)

## API Access Attempts

### Endpoints Tried:
- `GET /snapshots/{snapshotId}` - Returns empty array
- `GET /v1/snapshots/{snapshotId}` - 404 Not Found
- `GET /snapshots/?id={snapshotId}` - 422: "companyId not provided"
- `GET /snapshots/?companyId={companyId}&id={snapshotId}` - Not tested (no companyId available)

### Account/Location Access:
- `GET /users/me` - 400: "User id me not found"
- `GET /companies/me` - Not accessible
- `GET /v1/locations/` - 404 Not Found
- `GET /locations/` - 404: "Cannot GET /locations/"

## Observations

1. **Private API Key Behavior**: The `pit-*` format suggests this is a Private Integration Token, which may:
   - Require agency/company-level context
   - Need to be used with specific SaaS Pro endpoints
   - Work differently than standard OAuth tokens

2. **Snapshot Access**: Since the snapshot is visible in SaaS Configurator dashboard:
   - It definitely exists
   - May need to be accessed via SaaS-specific API endpoints
   - Might require companyId/agencyId parameter
   - Could be accessed through location context after provisioning

3. **Agency vs Subaccount**: Based on SaaS Pro architecture:
   - **Agency-level private key** should be used for:
     - Creating locations (sub-accounts)
     - Applying snapshots during provisioning
     - Initial setup operations
   - **Location-level OAuth tokens** should be used for:
     - Ongoing operations (messaging, contacts)
     - Per-location API calls
     - Daily operations

## Recommendation: Agency-Based Private API Key

**Use Agency-Level Private API Key** for provisioning because:

1. **Location Creation**: Creating locations (sub-accounts) requires agency-level permissions
   - The `ensureLocation()` function calls `POST /v1/locations` 
   - This is an agency-level operation

2. **Snapshot Application**: Applying snapshots likely requires agency-level access
   - Snapshots are typically managed at the agency/company level
   - The "companyId not provided" error suggests agency context is needed

3. **Security**: Private key only used server-side during provisioning
   - Not exposed to client-side code
   - Used only for initial setup, not ongoing operations

4. **Ongoing Operations**: Use per-location OAuth tokens stored in `ghl_config`
   - Each trainer gets their own location-scoped OAuth tokens
   - Used for messaging, contacts, and daily operations
   - Refreshed automatically via `refreshGHLToken()`

### Architecture

```
Agency-Level Private API Key (GHL_PRIVATE_API_KEY)
    │
    ├─> Creates Location (Sub-account) for Trainer
    │
    ├─> Applies Snapshot to Location
    │
    └─> Stores Location ID in ghl_config
            │
            └─> Location-Level OAuth Tokens (per trainer)
                    │
                    └─> Used for ongoing operations
```

## Current Implementation

The provisioning function is set up to:
1. Use private API key (agency-level) for location creation and snapshot application
2. Store per-location OAuth tokens in `ghl_config` for ongoing operations
3. Apply tier-specific snapshots automatically during provisioning

## Next Steps

1. **Proceed with Current Snapshot Definitions**: The tier JSON files we created are based on your detailed feature requirements and are ready to use.

2. **Test During Provisioning**: Once we provision a location, we can:
   - Try accessing the snapshot via the newly created location context
   - Refine snapshot definitions based on actual API responses
   - Update based on what gets created successfully

3. **Alternative Access**: Consider:
   - Exporting snapshot structure from SaaS Configurator dashboard
   - Using OAuth per-location tokens to access snapshot after location creation
   - Verifying snapshot ID format (may need different identifier)

## Snapshot Definitions Status

✅ **Created and Ready:**
- `starter.json` - Based on Starter tier features
- `professional.json` - Based on Professional tier features  
- `growth.json` - Based on Growth tier features

These definitions include:
- Tags
- Custom Fields
- Workflow definitions (structure ready, may need API endpoint refinement)
- Automation definitions (structure ready, may need API endpoint refinement)
- Calendars
- Pipelines (Growth tier)
- Funnels (Growth tier)
- Feature flags

The provisioning code will apply these automatically based on `planTier`.

