-- Create storage bucket for trainer verification media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trainer-verification',
  'trainer-verification',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
);

-- Storage RLS policies for trainer-verification bucket
CREATE POLICY "Authenticated users can upload verification files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trainer-verification');

CREATE POLICY "Admins can view all verification files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'trainer-verification' 
  AND (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    OR auth.role() = 'service_role'
  )
);

CREATE POLICY "Users can view their own verification files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'trainer-verification'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create verification_method enum
CREATE TYPE verification_method AS ENUM ('email', 'ghl_oauth', 'social_proof');

-- Create verification_status enum
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Create trainer_verification_requests table
CREATE TABLE public.trainer_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  challenge_trainer_key TEXT NOT NULL,
  trainer_name TEXT NOT NULL,
  trainer_city TEXT,
  trainer_state TEXT,
  claimed_by_email TEXT NOT NULL,
  verification_method verification_method NOT NULL,
  proof_media_urls TEXT[] DEFAULT '{}',
  proof_description TEXT,
  status verification_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  ip_address TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trainer_id to challenge_leaderboard (materialized view, so we need to modify the underlying table)
ALTER TABLE public.challenge_ratings
ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_verification_requests_status ON trainer_verification_requests(status);
CREATE INDEX idx_verification_requests_trainer_key ON trainer_verification_requests(challenge_trainer_key);
CREATE INDEX idx_challenge_ratings_trainer_id ON challenge_ratings(trainer_id);

-- Enable RLS on trainer_verification_requests
ALTER TABLE public.trainer_verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for trainer_verification_requests
CREATE POLICY "Anyone can create verification requests"
ON public.trainer_verification_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own verification requests"
ON public.trainer_verification_requests FOR SELECT
USING (
  claimed_by_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR trainer_id = auth.uid()
);

CREATE POLICY "Admins can view all verification requests"
ON public.trainer_verification_requests FOR SELECT
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update verification requests"
ON public.trainer_verification_requests FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create function to check for duplicate claims (prevent spam)
CREATE OR REPLACE FUNCTION check_duplicate_claim(
  p_trainer_key TEXT,
  p_email TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trainer_verification_requests
    WHERE challenge_trainer_key = p_trainer_key
    AND claimed_by_email = p_email
    AND created_at > now() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the challenge_leaderboard view to include trainer_id
DROP MATERIALIZED VIEW IF EXISTS challenge_leaderboard;

CREATE MATERIALIZED VIEW challenge_leaderboard AS
WITH trainer_stats AS (
  SELECT 
    COALESCE(trainer_id::text, trainer_slug, trainer_name || '-' || COALESCE(trainer_city, '') || '-' || COALESCE(trainer_state, '')) as trainer_key,
    trainer_id,
    trainer_name,
    trainer_city,
    trainer_state,
    trainer_gym,
    -- Calculate weighted average: verified ratings count 2x
    AVG(
      (rating_expertise + rating_communication + rating_motivation + rating_results + rating_value) / 5.0 *
      CASE 
        WHEN verification_status = 'verified' THEN 2.0
        ELSE 1.0
      END
    ) as average_rating,
    COUNT(*) as total_ratings,
    MAX(created_at) as last_updated
  FROM challenge_ratings
  WHERE verification_status = 'verified'
  GROUP BY 
    COALESCE(trainer_id::text, trainer_slug, trainer_name || '-' || COALESCE(trainer_city, '') || '-' || COALESCE(trainer_state, '')),
    trainer_id,
    trainer_name,
    trainer_city,
    trainer_state,
    trainer_gym
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY average_rating DESC, total_ratings DESC) as rank,
  trainer_id,
  trainer_key,
  trainer_name,
  trainer_city,
  trainer_state,
  trainer_gym,
  ROUND(average_rating::numeric, 2) as average_rating,
  total_ratings,
  last_updated
FROM trainer_stats
ORDER BY average_rating DESC, total_ratings DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_challenge_leaderboard_trainer_key ON challenge_leaderboard(trainer_key);
CREATE INDEX idx_challenge_leaderboard_rank ON challenge_leaderboard(rank);

-- Create function to refresh leaderboard (call this after new ratings)
CREATE OR REPLACE FUNCTION refresh_challenge_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY challenge_leaderboard;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at on trainer_verification_requests
CREATE OR REPLACE FUNCTION update_verification_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trainer_verification_requests_updated_at
BEFORE UPDATE ON public.trainer_verification_requests
FOR EACH ROW
EXECUTE FUNCTION update_verification_request_timestamp();