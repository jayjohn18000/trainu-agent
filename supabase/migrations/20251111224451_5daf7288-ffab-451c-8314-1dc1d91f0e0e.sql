-- Fix critical security issue: Restrict challenge_ratings updates to service role only
-- This prevents unauthorized rating manipulation and leaderboard fraud

DROP POLICY IF EXISTS "System can update ratings" ON public.challenge_ratings;

CREATE POLICY "Service role can update ratings"
  ON public.challenge_ratings FOR UPDATE
  USING (auth.role() = 'service_role');