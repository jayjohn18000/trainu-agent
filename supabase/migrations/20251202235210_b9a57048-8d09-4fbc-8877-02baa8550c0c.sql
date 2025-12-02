-- Fix refresh_challenge_leaderboard function to set explicit search_path
CREATE OR REPLACE FUNCTION public.refresh_challenge_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY challenge_leaderboard;
END;
$$;