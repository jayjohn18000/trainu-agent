# Edge Functions & Endpoints - Fixes Applied

## ✅ Fixes Completed

### 1. Config.toml - Added Missing Function Configurations

**Added:**
```toml
[functions.mindbody-oauth-init]
verify_jwt = true

[functions.mindbody-sync]
verify_jwt = false

[functions.mindbody-webhook]
verify_jwt = false

[functions.generate-queue-insights]
verify_jwt = true
```

**Rationale:**
- `mindbody-oauth-init`: Requires authentication (user must be logged in)
- `mindbody-sync`: Can be called internally/by cron (no JWT needed)
- `mindbody-webhook`: External webhook from Mindbody (no JWT)
- `generate-queue-insights`: Requires authentication

---

### 2. Integration API - Updated to Use New Database Tables

**Fixed Functions:**

#### `getIntegrationStatus()`
- ✅ Now queries `integration_status` table
- ✅ Falls back to `ghl_config` for backward compatibility
- ✅ Returns status for all integrations, not just GHL

#### `getIntegrationStatusByName()`
- ✅ Queries `integration_status` table first
- ✅ Supports all integration types (mindbody, trainerize, etc.)
- ✅ Falls back to `ghl_config` for GHL backward compatibility

#### `getIntegrationActivityLog()`
- ✅ Now queries `integration_activity_log` table
- ✅ Returns actual activity logs instead of empty array
- ✅ Supports all integration types

#### `getIntegrationConfig()`
- ✅ Queries `integration_configs` table first
- ✅ Supports all integration types
- ✅ Falls back to `ghl_config` for GHL backward compatibility

#### `disconnectIntegration()`
- ✅ Deletes from `integration_configs` table
- ✅ Updates `integration_status` table
- ✅ Supports all integration types
- ✅ Handles GHL backward compatibility

---

## ✅ Verification Status

### Edge Functions Structure

| Function | File Exists | Config Exists | Imports Correct | Status |
|----------|-------------|---------------|-----------------|--------|
| `mindbody-oauth-init` | ✅ | ✅ | ✅ | Ready |
| `mindbody-sync` | ✅ | ✅ | ✅ | Ready |
| `mindbody-webhook` | ✅ | ✅ | ✅ | Ready |
| `oauth-callback` | ✅ | ✅ | ✅ | Ready |

### Shared Utilities

| Utility | File Exists | Used By Functions | Status |
|---------|-------------|-------------------|--------|
| `integration-adapter.ts` | ✅ | mindbody-sync, mindbody-webhook | ✅ |
| `oauth-helpers.ts` | ✅ | mindbody-sync | ✅ |
| `sync-logger.ts` | ✅ | mindbody-sync | ✅ |

### Frontend API Mapping

| API Function | Edge Function | Status |
|--------------|---------------|--------|
| `initiateOAuth('mindbody')` | `mindbody-oauth-init` | ✅ Mapped |
| `triggerManualSync('mindbody')` | `mindbody-sync` | ✅ Mapped |
| `getIntegrationStatus()` | Queries DB | ✅ Fixed |
| `getIntegrationActivityLog()` | Queries DB | ✅ Fixed |
| `disconnectIntegration('mindbody')` | Updates DB | ✅ Fixed |

### Database Tables

| Table | Used By API | Used By Functions | Status |
|-------|-------------|-------------------|--------|
| `integration_configs` | ✅ | ✅ | Ready |
| `integration_status` | ✅ | ✅ | Ready |
| `integration_activity_log` | ✅ | ✅ | Ready |
| `contact_sources` | ✅ | ✅ | Ready |
| `ghl_config` | ✅ (fallback) | ✅ | Backward compat |

---

## Endpoint URLs

### Frontend → Edge Functions
```
POST /functions/v1/mindbody-oauth-init
POST /functions/v1/mindbody-sync
POST /functions/v1/mindbody-webhook
POST /functions/v1/oauth-callback (GET for redirects)
```

### External → Edge Functions
```
POST /functions/v1/mindbody-webhook (from Mindbody)
GET  /functions/v1/oauth-callback (OAuth redirect)
```

---

## Environment Variables Required

**Mindbody:**
- `MINDBODY_CLIENT_ID` - OAuth client ID
- `MINDBODY_CLIENT_SECRET` - OAuth client secret
- `MINDBODY_REDIRECT_URI` - OAuth callback URL
- `MINDBODY_WEBHOOK_SECRET` - Webhook signature verification

**General:**
- `SUPABASE_URL` - Already configured
- `SUPABASE_SERVICE_ROLE_KEY` - Already configured
- `APP_URL` - Frontend URL for redirects

---

## Testing Checklist

- [ ] Test `mindbody-oauth-init` endpoint (requires JWT)
- [ ] Test `mindbody-sync` endpoint (no JWT required)
- [ ] Test `mindbody-webhook` endpoint (no JWT, verify signature)
- [ ] Test OAuth callback flow end-to-end
- [ ] Verify `integration_status` table updates
- [ ] Verify `integration_activity_log` table populates
- [ ] Test frontend `getIntegrationStatus()` returns Mindbody status
- [ ] Test frontend `triggerManualSync('mindbody')` works

---

## Next Steps

1. **Deploy edge functions** to Supabase
2. **Set environment variables** in Supabase dashboard
3. **Run database migration** (`20251201000000_create_integration_tables.sql`)
4. **Test OAuth flow** with Mindbody sandbox
5. **Configure webhook** in Mindbody dashboard
6. **Test sync** manually via frontend

