# `ghl-provisioning`

Provision a GoHighLevel location, seed automation assets, and sync metadata back into Supabase.

## Environment variables

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (automatically injected when deployed). |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for privileged queries. |
| `GHL_API_BASE` | Optional override for the GHL REST base URL (defaults to `https://rest.gohighlevel.com`). |
| `GHL_API_VERSION` | Optional GoHighLevel API version header (defaults to `2021-07-28`). |
| `GHL_ACCESS_TOKEN` | OAuth or legacy API token with permissions to manage locations, tags, custom fields, calendars, and users. |

## Running locally

```bash
supabase functions serve ghl-provisioning \
  --env-file supabase/.env.local
```

## Example payload

```json
{
  "planTier": "core",
  "trainerId": "86b8af5d-b7c2-4b8f-93ce-1a6f1d9921a5",
  "trainer": {
    "email": "owner@example.com",
    "firstName": "Casey",
    "lastName": "Trainer",
    "stripeCustomerId": "cus_123",
    "timezone": "America/Los_Angeles"
  },
  "business": {
    "brandName": "Casey Fitness",
    "supportEmail": "support@caseyfitness.com",
    "websiteUrl": "https://caseyfitness.com",
    "address": {
      "line1": "123 Market St",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94105",
      "country": "US"
    }
  },
  "links": {
    "discoveryCall": "https://caseyfitness.com/book/intro",
    "trainingSession": "https://caseyfitness.com/book/session"
  }
}
```

## Testing with `curl`

```bash
curl -X POST "${SUPABASE_URL}/functions/v1/ghl-provisioning" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d @payload.json
```

The function responds with provisioning metadata including the location ID, created calendars, and seeded tags. Errors will return `500` with a correlation ID for log lookup.
