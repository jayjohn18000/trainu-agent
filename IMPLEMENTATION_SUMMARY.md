# GHL OAuth Integration - Implementation Summary

## ✅ Completed

### 1. OAuth Flow Implementation
- ✅ Created `ghl-oauth-init` edge function to generate OAuth authorization URL
- ✅ Created `ghl-oauth-callback` edge function to handle OAuth callback and store tokens
- ✅ Added token refresh logic in `_shared/ghl-token.ts`
- ✅ Updated `ghl-integration` to use per-location OAuth tokens
- ✅ Updated `ghl-provisioning` to require OAuth before provisioning

### 2. Stripe Integration
- ✅ Updated pricing page with Stripe payment links:
  - **Starter** ($79/month): `https://buy.stripe.com/28E4gB5M31lP4eP8I2frW00`
  - **Professional** ($99/month): `https://buy.stripe.com/9B600lcarfcF8v5gaufrW01`
  - **Growth+** ($497/month): `https://buy.stripe.com/00waEZ3DV0hL6mX2jEfrW02`
- ✅ Created `src/config/stripe.ts` for plan mapping
- ✅ All "Get Started" buttons now link to Stripe checkout

### 3. Frontend Implementation
- ✅ Created `/onboarding` page with OAuth connection flow
- ✅ Added onboarding route to App.tsx
- ✅ Automatic provisioning trigger after OAuth success
- ✅ Error handling and user feedback throughout flow

### 4. Snapshot System
- ✅ Created tier-specific snapshot JSON files:
  - `starter.json` - Essential CRM features
  - `professional.json` - Unlimited scale with advanced automation
  - `growth.json` - Full GHL suite with agency tools
- ✅ Implemented `applySnapshotAssets()` function to apply configurations
- ✅ Automatic snapshot application during provisioning based on plan tier

### 5. Database Updates
- ✅ Added migration for `company_id` field in `ghl_config` table
- ✅ Updated `ghl_config` schema to store OAuth tokens per trainer

### 6. Documentation
- ✅ Created `DEPLOYMENT_CHECKLIST.md` with setup instructions
- ✅ Created `OAUTH_IMPLEMENTATION_PLAN.md` with technical details
- ✅ Created `API_ACCESS_NOTES.md` documenting API challenges

### 7. Code Pushed to GitHub
- ✅ All changes committed and pushed to `main` branch
- ✅ Lovable will automatically sync and deploy changes

## 🔄 User Flow

```
1. User clicks "Get Started" on pricing page
   ↓
2. Redirected to Stripe checkout
   ↓
3. Completes payment
   ↓
4. Redirected to /onboarding?tier={tier}&payment=success
   ↓
5. Clicks "Connect GoHighLevel"
   ↓
6. Redirected to GHL OAuth authorization page
   ↓
7. User selects their GHL location and authorizes
   ↓
8. Callback stores access_token, refresh_token in ghl_config
   ↓
9. Automatically triggers provisioning
   ↓
10. Applies tier-specific snapshot (tags, fields, workflows)
   ↓
11. Redirected to /today dashboard
   ↓
12. Ready to use TrainU with GHL integration!
```

## 📋 Next Steps (Require User Action)

### Step 1: Configure GHL Private Integration
1. Go to your GHL SaaS Pro dashboard
2. Navigate to **Settings → Private Integrations**
3. Find integration ID: `pit-24e07c5c-9bb2-46f2-a9ba-060437e430a1`
4. **Copy the Client Secret** (you'll need this for Step 2)
5. Add redirect URI: `https://your-project.supabase.co/functions/v1/ghl-oauth-callback`
6. Verify these OAuth scopes are enabled:
   - locations.readonly
   - locations.write
   - contacts.readonly
   - contacts.write
   - calendars.readonly
   - calendars.write
   - workflows.readonly
   - conversations.readonly
   - conversations.write
   - opportunities.readonly
   - opportunities.write

### Step 2: Add Supabase Environment Variables
Run these commands (replace `<client_secret>` with value from Step 1):

```bash
supabase secrets set GHL_CLIENT_ID=pit-24e07c5c-9bb2-46f2-a9ba-060437e430a1
supabase secrets set GHL_CLIENT_SECRET=<your_client_secret_here>
supabase secrets set GHL_REDIRECT_URI=https://your-project.supabase.co/functions/v1/ghl-oauth-callback
supabase secrets set APP_URL=https://trainu.app
```

### Step 3: Configure Stripe Success URLs (Optional)
If Stripe allows custom success URLs in payment links, configure:
- Success URL: `https://trainu.app/onboarding?tier={tier}&payment=success`
- Cancel URL: `https://trainu.app/pricing?payment=cancelled`

Note: Some Stripe payment link types may not support custom URLs. If that's the case, users will need to manually navigate to `/onboarding` after payment.

### Step 4: Deploy Edge Functions
```bash
supabase functions deploy ghl-oauth-init
supabase functions deploy ghl-oauth-callback
supabase functions deploy ghl-provisioning
supabase functions deploy ghl-integration
```

### Step 5: Push Database Migration
```bash
supabase db push
```

Or simply let Lovable sync handle it automatically.

### Step 6: Test the Flow
1. Visit `/pricing`
2. Click "Get Started" on any tier
3. Complete payment (use Stripe test mode if available)
4. Should redirect to `/onboarding`
5. Click "Connect GoHighLevel"
6. Authorize in GHL
7. Verify provisioning completes
8. Check GHL dashboard for created assets

## 🔍 Diagnostic Tools

### Test GHL Connection
```bash
GHL_PRIVATE_API_KEY=pit-24e07c5c-9bb2-46f2-a9ba-060437e430a1 node scripts/test-ghl-connection.js
```

This will show which API endpoints are accessible with your credentials.

### Check OAuth Tokens
Query the `ghl_config` table to verify tokens are stored:
```sql
SELECT trainer_id, location_id, 
       access_token IS NOT NULL as has_access_token,
       refresh_token IS NOT NULL as has_refresh_token,
       token_expires_at
FROM ghl_config
WHERE trainer_id = '<trainer_id>';
```

### View Provisioning Logs
Check Supabase Edge Function logs for:
- `ghl-oauth-init` - OAuth URL generation
- `ghl-oauth-callback` - Token exchange
- `ghl-provisioning` - Provisioning execution

## 🎯 What Changed

### Files Added
- `src/pages/Onboarding.tsx` - New onboarding page
- `src/config/stripe.ts` - Stripe configuration
- `supabase/functions/ghl-oauth-init/index.ts` - OAuth init
- `supabase/functions/ghl-oauth-callback/index.ts` - OAuth callback
- `supabase/functions/_shared/ghl-token.ts` - Token management
- `supabase/functions/ghl-provisioning/snapshots/*.json` - Tier snapshots
- `supabase/migrations/20251118200000_add_company_id_to_ghl_config.sql` - DB migration

### Files Modified
- `src/App.tsx` - Added onboarding route
- `src/pages/landing/Pricing.tsx` - Updated with Stripe links
- `supabase/config.toml` - Added OAuth function configs
- `supabase/functions/ghl-provisioning/index.ts` - OAuth requirement
- `supabase/functions/ghl-integration/index.ts` - Token refresh

## 🚨 Important Notes

1. **OAuth is Required**: The private integration token (`pit-*`) cannot be used directly as a Bearer token. It's the OAuth client ID. Users MUST go through OAuth flow.

2. **Per-Location Tokens**: Each trainer gets their own location-scoped OAuth tokens stored in `ghl_config`. These are automatically refreshed when needed.

3. **Snapshot Application**: During provisioning, the system applies tier-specific configurations (tags, custom fields, calendars) to the authorized GHL location.

4. **Token Refresh**: Tokens are automatically refreshed before API calls if they're expired or missing.

## 📞 Support

If issues arise after deployment:
1. Check Supabase Edge Function logs
2. Verify environment variables are set
3. Test OAuth flow manually
4. Check `ghl_config` table for stored tokens
5. Run diagnostic script: `node scripts/test-ghl-connection.js`

## 🎉 Success!

All code has been pushed to GitHub and is ready for deployment via Lovable. Complete the configuration steps above to activate the OAuth flow!

