-- Fix search_path vulnerability in check_duplicate_claim function
-- This prevents privilege escalation attacks via schema manipulation

CREATE OR REPLACE FUNCTION public.check_duplicate_claim(
  p_trainer_key TEXT,
  p_email TEXT
) RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trainer_verification_requests
    WHERE challenge_trainer_key = p_trainer_key
    AND claimed_by_email = p_email
    AND created_at > now() - INTERVAL '24 hours'
  );
END;
$$;