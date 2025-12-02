# Edge Functions & Endpoints Analysis

## Critical Issues Found

### 1. Missing Config.toml Entries ⚠️

**Problem:** Mindbody edge functions are NOT configured in `supabase/config.toml`

**Missing configurations:**
- `[functions.mindbody-oauth-init]` - Required for OAuth flow
- `[functions.mindbody-sync]` - Required for data synchronization  
- `[functions.mindbody-webhook]` - Required for real-time updates
- `[functions.generate-queue-insights]` - Missing from recent pull

**Impact:** These functions may not work correctly or may use default settings (verify_jwt = true)

**Recommendation:** Add configurations with appropriate `verify_jwt` settings:
- `mindbody-oauth-init`: `verify_jwt = true` (user must be authenticated)
- `mindbody-sync`: `verify_jwt = false` (can be called internally/by cron)
- `mindbody-webhook`: `verify_jwt = false` (external webhook, no JWT)

---

### 2. API Implementation Mismatch ⚠️

**Problem:** `src/lib/api/integrations.ts` was updated by GitHub and only supports GHL

**Current state:**
- `getIntegrationStatus()` - Only checks `ghl_config` table
- `getIntegrationStatusByName()` - Returns `null` for non-GHL integrations
- `getIntegrationActivityLog()` - Returns empty array (not implemented)
- `getIntegrationConfig()` - Only supports GHL
- `disconnectIntegration()` - Only supports GHL

**Expected state (from our implementation):**
- Should query `integration_status` table for all integrations
- Should support Mindbody, Trainerize, TrueCoach
- Should fetch activity logs from `integration_activity_log` table
- Should support disconnecting any integration

**Impact:** Frontend cannot see Mindbody connection status or trigger syncs

---

### 3. Database Table Usage Mismatch ⚠️

**Problem:** API uses old `ghl_config` table instead of new `integration_configs` table

**Current:**
- API queries `ghl_config` table directly
- No support for `integration_status` table we created
- No support for `integration_activity_log` table

**Expected:**
- Query `integration_status` table for status
- Query `integration_configs` table for configs
- Query `integration_activity_log` table for activity

---

### 4. Function Endpoint Mapping ✅

**Status:** Correctly mapped in `integrations.ts`

**OAuth Functions:**
- `ghl` → `ghl-oauth-init` ✅
- `mindbody` → `mindbody-oauth-init` ✅ (function exists, not configured)

**Sync Functions:**
- `ghl` → `ghl-sync` ✅
- `mindbody` → `mindbody-sync` ✅ (function exists, not configured)

**Webhook Functions:**
- `ghl` → `ghl-webhook` ✅ (configured)
- `mindbody` → `mindbody-webhook` ✅ (function exists, not configured)

---

### 5. OAuth Callback Handler ✅

**Status:** Properly handles both GHL and Mindbody

**File:** `supabase/functions/oauth-callback/index.ts`
- Routes based on `platform` in state parameter
- `handleMindbodyCallback()` function exists
- `handleGHLCallback()` function exists
- Both store tokens in appropriate tables

---

## Edge Functions Inventory

### Integration Functions

| Function | Status | Config | Purpose |
|----------|--------|--------|---------|
| `mindbody-oauth-init` | ✅ Exists | ❌ Missing | Generate OAuth URL |
| `mindbody-sync` | ✅ Exists | ❌ Missing | Sync clients/attendance |
| `mindbody-webhook` | ✅ Exists | ❌ Missing | Handle webhooks |
| `oauth-callback` | ✅ Exists | ✅ Configured | Handle OAuth redirects |
| `ghl-oauth-init` | ✅ Exists | ✅ Configured | GHL OAuth |
| `ghl-sync` | ✅ Exists | ✅ Configured | GHL sync |
| `ghl-webhook` | ✅ Exists | ✅ Configured | GHL webhooks |

### Shared Utilities ✅

| File | Status | Purpose |
|------|--------|---------|
| `integration-adapter.ts` | ✅ Exists | Base adapter interface |
| `oauth-helpers.ts` | ✅ Exists | Token refresh logic |
| `sync-logger.ts` | ✅ Exists | Activity logging |

---

## Required Fixes

### Priority 1: Config.toml
Add missing function configurations

### Priority 2: API Implementation  
Update `integrations.ts` to use new database tables and support all integrations

### Priority 3: Activity Logging
Implement `getIntegrationActivityLog()` to query `integration_activity_log` table

---

## Function Call Patterns

**Frontend → Edge Function:**
```typescript
await supabase.functions.invoke('function-name', {
  body: { trainerId: user.id },
});
```

**Edge Function → Edge Function:**
```typescript
await fetch(`${SUPABASE_URL}/functions/v1/function-name`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ trainerId }),
});
```

---

## Environment Variables Required

**Mindbody:**
- `MINDBODY_CLIENT_ID`
- `MINDBODY_CLIENT_SECRET`
- `MINDBODY_REDIRECT_URI`
- `MINDBODY_WEBHOOK_SECRET`

**General:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_URL`

