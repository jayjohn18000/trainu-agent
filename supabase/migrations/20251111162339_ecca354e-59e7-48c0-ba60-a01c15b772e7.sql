-- Fix search_path vulnerability in refresh_challenge_leaderboard function
-- This prevents search_path hijacking attacks on SECURITY DEFINER functions

CREATE OR REPLACE FUNCTION public.refresh_challenge_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW public.challenge_leaderboard;
END;
$function$;