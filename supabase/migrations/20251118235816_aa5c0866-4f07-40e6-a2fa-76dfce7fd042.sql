-- Add plan_tier column to trainer_profiles
ALTER TABLE public.trainer_profiles
  ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'starter'
    CHECK (plan_tier IN ('starter', 'professional', 'growth'));

-- Add index for plan tier filtering
CREATE INDEX IF NOT EXISTS idx_trainer_profiles_plan_tier 
  ON public.trainer_profiles(plan_tier);

-- Add comment
COMMENT ON COLUMN public.trainer_profiles.plan_tier IS 'Subscription plan tier: starter, professional, or growth';