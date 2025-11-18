# GHL OAuth 2.0 Implementation Plan

## Problem
The `pit-*` Private Integration Token cannot be used directly as a Bearer token. All API endpoints return 404/403 errors.

## Root Cause
- `pit-*` is a Private Integration **App ID**, not an access token
- GHL SaaS Pro requires OAuth 2.0 flow to obtain access tokens
- Access tokens are location-scoped and obtained via user authorization

## Solution: Implement OAuth 2.0 Flow

### Phase 1: OAuth Setup
1. **Get OAuth Credentials from GHL Dashboard**
   - Navigate to: Settings → Private Integrations
   - Note the Client ID (this is your `pit-*` token)
   - Get the Client Secret
   - Configure Redirect URI: `https://your-project.supabase.co/functions/v1/ghl-oauth-callback`

2. **Required Scopes**
   ```
   locations.readonly
   locations.write
   contacts.readonly
   contacts.write
   calendars.readonly
   calendars.write
   workflows.readonly
   conversations.readonly
   conversations.write
   opportunities.readonly
   opportunities.write
   ```

### Phase 2: Environment Variables
Add to Supabase Edge Function secrets:
```bash
GHL_CLIENT_ID=pit-24e07c5c-9bb2-46f2-a9ba-060437e430a1
GHL_CLIENT_SECRET=<your_client_secret>
GHL_REDIRECT_URI=https://your-project.supabase.co/functions/v1/ghl-oauth-callback
```

### Phase 3: Database Schema Updates
Update `ghl_config` table (already has these fields):
```sql
-- Already exists:
access_token TEXT
refresh_token TEXT
token_expires_at TIMESTAMP WITH TIME ZONE

-- May need to add:
company_id TEXT
```

### Phase 4: Create OAuth Flow Functions

#### A. `ghl-oauth-init` - Start OAuth Flow
```typescript
// GET /ghl-oauth-init?trainerId=xxx
// Returns: redirect URL to GHL authorization page
{
  authUrl: "https://marketplace.gohighlevel.com/oauth/chooselocation?..."
}
```

#### B. `ghl-oauth-callback` - Handle OAuth Callback
```typescript
// GET /ghl-oauth-callback?code=xxx&state=trainerId
// 1. Exchange code for tokens
// 2. Store tokens in ghl_config
// 3. Redirect to TrainU dashboard
```

#### C. Update `ghl-provisioning`
```typescript
// Before provisioning:
// 1. Check if trainer has valid OAuth tokens
// 2. If not, return error: "OAuth required"
// 3. If yes, use access_token for all API calls
// 4. Apply snapshot to the authorized location
```

### Phase 5: Implementation Steps

**Step 1: Create OAuth Init Function**
```bash
supabase functions new ghl-oauth-init
```

**Step 2: Create OAuth Callback Function**
```bash
supabase functions new ghl-oauth-callback
```

**Step 3: Update Provisioning Flow**
- Remove reliance on global `GHL_PRIVATE_API_KEY` for Bearer auth
- Use per-location `access_token` from OAuth
- Add OAuth check before provisioning

**Step 4: Frontend Integration**
- Add "Connect GHL" button in onboarding
- Redirect to OAuth init endpoint
- Handle callback and show success

### Phase 6: Provisioning Flow (Updated)

```
1. Trainer signs up for TrainU
2. Trainer clicks "Connect GoHighLevel"
3. Redirect to /ghl-oauth-init
4. GHL shows location chooser
5. Trainer authorizes → callback to /ghl-oauth-callback
6. Store tokens in ghl_config
7. Call /ghl-provisioning (now has valid access_token)
8. Apply snapshot to authorized location
9. Complete onboarding
```

## Alternative: Use Existing Location

If trainers already have GHL locations:
1. They authorize via OAuth (gives us access to existing location)
2. We DON'T create a new location
3. We just apply snapshot/configuration to their existing location

This is likely the intended SaaS Pro flow:
- Each trainer already has a GHL location (sub-account)
- TrainU integrates WITH their location, doesn't create new ones
- OAuth gives us permission to configure their existing setup

## Recommendation

**Implement OAuth 2.0 with "Connect Existing Location" approach:**

1. ✅ User already has GHL location (via SaaS Pro subscription)
2. ✅ TrainU asks for OAuth authorization
3. ✅ User selects their location → grants access
4. ✅ TrainU gets access_token for that location
5. ✅ TrainU applies snapshot/config to that location
6. ✅ No need to create new locations via API

This aligns with SaaS Pro model where locations are provisioned through GHL's SaaS Configurator, not via API.

## Next Steps

1. **Verify OAuth Setup in GHL Dashboard**
   - Check Private Integration settings
   - Get Client Secret
   - Configure redirect URI

2. **Implement OAuth Functions**
   - Create `ghl-oauth-init`
   - Create `ghl-oauth-callback`
   - Update `ghl-provisioning` to require OAuth

3. **Update Frontend**
   - Add OAuth connect flow to onboarding
   - Handle OAuth callback redirect

4. **Test Flow**
   - Test OAuth authorization
   - Test token exchange
   - Test provisioning with OAuth tokens

