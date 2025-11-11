-- Extend trainer_profiles and ghl_config with provisioning metadata
ALTER TABLE public.trainer_profiles
  ADD COLUMN IF NOT EXISTS plan_tier TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_trainer_profiles_stripe_customer_id
  ON public.trainer_profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE public.ghl_config
  ADD COLUMN IF NOT EXISTS primary_user_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'provisioning', 'error'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public'
      AND table_name = 'ghl_config'
      AND constraint_name = 'ghl_config_setup_type_check'
  ) THEN
    ALTER TABLE public.ghl_config
      DROP CONSTRAINT ghl_config_setup_type_check;
  END IF;
END $$;

ALTER TABLE public.ghl_config
  ADD CONSTRAINT ghl_config_setup_type_check
  CHECK (setup_type IN ('managed', 'dfy'));

CREATE INDEX IF NOT EXISTS idx_ghl_config_primary_user
  ON public.ghl_config(primary_user_id)
  WHERE primary_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now(),
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_type_processed_at
  ON public.stripe_events(type, processed_at DESC);
