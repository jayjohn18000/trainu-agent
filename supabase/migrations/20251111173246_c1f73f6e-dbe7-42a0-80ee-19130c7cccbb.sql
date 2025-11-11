-- Add code_expires_at column to challenge_ratings table
ALTER TABLE public.challenge_ratings
ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient expiry checks
CREATE INDEX IF NOT EXISTS idx_challenge_ratings_code_expires_at 
ON public.challenge_ratings(code_expires_at) 
WHERE verification_status = 'pending';