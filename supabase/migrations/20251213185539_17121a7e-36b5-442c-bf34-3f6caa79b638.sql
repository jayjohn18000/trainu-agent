-- Fix PII exposure in challenge_ratings table
-- Create a public-safe materialized view that excludes sensitive PII fields

-- Step 1: Create a public-safe materialized view for challenge ratings
CREATE MATERIALIZED VIEW IF NOT EXISTS public.challenge_ratings_public AS
SELECT 
  id,
  trainer_id,
  trainer_name,
  trainer_city,
  trainer_state,
  trainer_gym,
  trainer_slug,
  rating_expertise,
  rating_communication,
  rating_motivation,
  rating_results,
  rating_value,
  rating_overall,
  review_text,
  -- Anonymize rater name: show first initial and last name only
  CASE 
    WHEN rater_name IS NOT NULL AND LENGTH(rater_name) > 0 THEN
      LEFT(rater_name, 1) || '.' || COALESCE(' ' || SPLIT_PART(rater_name, ' ', 2), '')
    ELSE 'Anonymous'
  END as rater_display_name,
  created_at,
  updated_at
FROM challenge_ratings
WHERE verification_status = 'verified';

-- Step 2: Create index on the materialized view for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_challenge_ratings_public_id ON public.challenge_ratings_public(id);
CREATE INDEX IF NOT EXISTS idx_challenge_ratings_public_trainer ON public.challenge_ratings_public(trainer_id);

-- Step 3: Drop the existing overly permissive RLS policy
DROP POLICY IF EXISTS "Anyone can view verified ratings" ON public.challenge_ratings;

-- Step 4: Create new restricted RLS policies
-- Only admins can view full rating data (including PII)
CREATE POLICY "Admins can view all rating data"
  ON public.challenge_ratings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Service role can also access (for edge functions)
CREATE POLICY "Service role can view all rating data"
  ON public.challenge_ratings FOR SELECT
  USING (auth.role() = 'service_role');

-- Step 5: Grant SELECT on the public view to anon and authenticated roles
GRANT SELECT ON public.challenge_ratings_public TO anon;
GRANT SELECT ON public.challenge_ratings_public TO authenticated;

-- Step 6: Create function to refresh the public ratings view
CREATE OR REPLACE FUNCTION public.refresh_challenge_ratings_public()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY challenge_ratings_public;
END;
$$;

-- Step 7: Update the existing refresh_challenge_leaderboard function to also refresh the public view
CREATE OR REPLACE FUNCTION public.refresh_challenge_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY challenge_leaderboard;
  -- Also refresh the public ratings view
  REFRESH MATERIALIZED VIEW CONCURRENTLY challenge_ratings_public;
END;
$$;