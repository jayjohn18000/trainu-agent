# `stripe-webhook`

Verifies Stripe events, hydrates customer metadata, and kicks off GoHighLevel provisioning by calling the `ghl-provisioning` function.

## Environment variables

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key used for privileged Supabase access and to authenticate the provisioning call. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from your Stripe webhook endpoint configuration. |
| `STRIPE_SECRET_KEY` | Stripe API secret used to hydrate customers/subscriptions. |
| `STRIPE_API_VERSION` | Optional Stripe API version (defaults to `2022-11-15`). |
| `STRIPE_WEBHOOK_TOLERANCE` | Optional signature tolerance window in seconds (defaults to `300`). |

## Running locally

```bash
supabase functions serve stripe-webhook \
  --env-file supabase/.env.local
```

Then forward Stripe CLI events:

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## Testing with Stripe CLI

```bash
stripe trigger customer.subscription.created \
  --add api_version=2022-11-15
```

The handler will:

1. Verify the signature using the supplied webhook secret.
2. Fetch the latest subscription + customer from Stripe when needed.
3. Build a provisioning payload from subscription/customer metadata.
4. Call the `ghl-provisioning` function with a correlation ID.
5. Store the processed event in `public.stripe_events` to ensure idempotency.

A successful response returns HTTP `200` with `{ "ok": true }` and the `x-correlation-id` header to help trace logs.
