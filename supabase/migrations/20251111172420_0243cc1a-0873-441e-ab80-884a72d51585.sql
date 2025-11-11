-- Fix security warning: Set search_path for refresh_challenge_leaderboard function
CREATE OR REPLACE FUNCTION public.refresh_challenge_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.challenge_leaderboard;
END;
$$;