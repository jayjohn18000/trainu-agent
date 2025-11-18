# GHL OAuth Integration - Deployment Checklist

## 🚀 Pre-Deployment Setup

### 1. GHL Private Integration Configuration
Navigate to your GHL SaaS Pro dashboard:

1. **Go to Settings → Private Integrations**
2. **Find your integration** (ID: `pit-24e07c5c-9bb2-46f2-a9ba-060437e430a1`)
3. **Get Client Secret**: Copy the client secret value
4. **Configure OAuth Scopes**: Ensure these are enabled:
   - ✅ `locations.readonly`
   - ✅ `locations.write`
   - ✅ `contacts.readonly`
   - ✅ `contacts.write`
   - ✅ `calendars.readonly`
   - ✅ `calendars.write`
   - ✅ `workflows.readonly`
   - ✅ `conversations.readonly`
   - ✅ `conversations.write`
   - ✅ `opportunities.readonly`
   - ✅ `opportunities.write`

5. **Set Redirect URI**: Add your callback URL:
   ```
   https://your-project.supabase.co/functions/v1/ghl-oauth-callback
   ```

### 2. Supabase Environment Variables
Add these secrets to your Supabase project:

```bash
# GHL OAuth Credentials
GHL_CLIENT_ID=pit-24e07c5c-9bb2-46f2-a9ba-060437e430a1
GHL_CLIENT_SECRET=<your_client_secret_from_step_1>
GHL_REDIRECT_URI=https://your-project.supabase.co/functions/v1/ghl-oauth-callback

# App URL
APP_URL=https://trainu.app  # or your production domain
```

**To add secrets via Supabase CLI:**
```bash
supabase secrets set GHL_CLIENT_ID=pit-24e07c5c-9bb2-46f2-a9ba-060437e430a1
supabase secrets set GHL_CLIENT_SECRET=<your_secret>
supabase secrets set GHL_REDIRECT_URI=https://<your-project>.supabase.co/functions/v1/ghl-oauth-callback
supabase secrets set APP_URL=https://trainu.app
```

### 3. Stripe Success URLs
Update your Stripe payment links to redirect to onboarding:

1. **Go to Stripe Dashboard → Payment Links**
2. **For each plan, configure:**
   - Success URL: `https://trainu.app/onboarding?tier={tier}&payment=success`
   - Cancel URL: `https://trainu.app/pricing?payment=cancelled`

**Plan tier mappings:**
- `https://buy.stripe.com/28E4gB5M31lP4eP8I2frW00` → `tier=starter`
- `https://buy.stripe.com/9B600lcarfcF8v5gaufrW01` → `tier=professional`
- `https://buy.stripe.com/00waEZ3DV0hL6mX2jEfrW02` → `tier=growth`

## 📦 Deployment Steps

### 1. Push Database Migration
```bash
# Push the company_id migration
supabase db push

# Or via Lovable sync (automatically syncs migrations)
git push origin main
```

### 2. Deploy Edge Functions
```bash
# Deploy OAuth functions
supabase functions deploy ghl-oauth-init
supabase functions deploy ghl-oauth-callback

# Redeploy provisioning with OAuth check
supabase functions deploy ghl-provisioning

# Redeploy integration function with updated token handling
supabase functions deploy ghl-integration
```

### 3. Push Frontend Changes
```bash
# Commit all changes
git add .
git commit -m "feat: implement GHL OAuth flow with Stripe integration"
git push origin main

# Lovable will auto-deploy the changes
```

## 🧪 Testing Checklist

### Test OAuth Flow
1. ✅ Navigate to `/pricing`
2. ✅ Click "Get Started" on any tier
3. ✅ Complete Stripe payment
4. ✅ Redirected to `/onboarding` with tier parameter
5. ✅ Click "Connect GoHighLevel"
6. ✅ Authorize app in GHL
7. ✅ Redirected back to `/onboarding?oauth=success`
8. ✅ Provisioning starts automatically
9. ✅ Redirected to `/today` when complete

### Test Provisioning
1. ✅ Check `ghl_config` table has OAuth tokens stored
2. ✅ Check `trainer_profiles` has `plan_tier` set
3. ✅ Verify location created in GHL dashboard
4. ✅ Verify tags created per tier
5. ✅ Verify custom fields created per tier
6. ✅ Verify calendars created

### Test Token Refresh
1. ✅ Wait for token to expire (or manually expire it)
2. ✅ Make an API call via `ghl-integration`
3. ✅ Verify token is automatically refreshed
4. ✅ Verify API call succeeds

## 🔗 Updated Links & Buttons

### Landing Pages Updated
- ✅ `/pricing` - All "Get Started" buttons now link to Stripe
- ✅ `/` - Home page CTA links to `/pricing`
- ✅ All tier prices updated to $79, $99, $497

### New Pages Created
- ✅ `/onboarding` - OAuth connection and provisioning flow

### New API Endpoints
- ✅ `POST /functions/v1/ghl-oauth-init` - Start OAuth flow
- ✅ `GET /functions/v1/ghl-oauth-callback` - OAuth callback handler

## 📋 User Flow

```
1. User visits pricing page
   ↓
2. Clicks "Get Started" → Stripe checkout
   ↓
3. Completes payment → Redirected to /onboarding
   ↓
4. Clicks "Connect GoHighLevel"
   ↓
5. GHL OAuth authorization → Select location
   ↓
6. Callback stores tokens → /onboarding?oauth=success
   ↓
7. Auto-triggers provisioning with OAuth tokens
   ↓
8. Applies tier-specific snapshot (tags, fields, workflows)
   ↓
9. Redirected to /today → Ready to use!
```

## 🛠️ Troubleshooting

### OAuth fails with "Invalid redirect URI"
- Verify redirect URI in GHL dashboard matches exactly
- Check trailing slashes

### Provisioning fails with "OAuth required"
- User needs to complete OAuth flow first
- Check `ghl_config` table has `access_token`

### Token refresh fails
- Verify `GHL_CLIENT_SECRET` is set correctly
- Check refresh token is stored in `ghl_config`

### Snapshot assets not applied
- Check snapshot JSON files in `supabase/functions/ghl-provisioning/snapshots/`
- Verify tier mapping (`starter`, `professional`, `growth`)

## 🎯 Success Criteria

- ✅ Users can purchase via Stripe
- ✅ Users connect GHL via OAuth
- ✅ Provisioning applies tier-specific features
- ✅ Tokens refresh automatically
- ✅ All existing GHL integrations still work

## 📞 Support

If issues arise:
1. Check Supabase Edge Function logs
2. Check browser console for frontend errors
3. Verify GHL OAuth settings
4. Check `ghl_config` table for stored tokens
5. Test with diagnostic script: `node scripts/test-ghl-connection.js`

