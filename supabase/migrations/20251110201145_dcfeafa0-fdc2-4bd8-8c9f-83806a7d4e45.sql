-- Create challenge_ratings table (self-contained trainer data)
CREATE TABLE public.challenge_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID,
  trainer_name TEXT NOT NULL,
  trainer_gym TEXT,
  trainer_city TEXT,
  trainer_state TEXT,
  trainer_slug TEXT,
  rater_email TEXT NOT NULL,
  rater_phone TEXT,
  rater_name TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_code TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('email', 'phone')),
  verification_completed_at TIMESTAMPTZ,
  rating_expertise INTEGER NOT NULL CHECK (rating_expertise BETWEEN 1 AND 5),
  rating_communication INTEGER NOT NULL CHECK (rating_communication BETWEEN 1 AND 5),
  rating_motivation INTEGER NOT NULL CHECK (rating_motivation BETWEEN 1 AND 5),
  rating_results INTEGER NOT NULL CHECK (rating_results BETWEEN 1 AND 5),
  rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
  rating_overall NUMERIC GENERATED ALWAYS AS (
    (rating_expertise + rating_communication + rating_motivation + rating_results + rating_value) / 5.0
  ) STORED,
  review_text TEXT,
  proof_file_url TEXT,
  device_fingerprint TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create challenge_fraud_checks table
CREATE TABLE public.challenge_fraud_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID REFERENCES public.challenge_ratings(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  flagged_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  notes TEXT
);

-- Create materialized view for leaderboard (aggregated by trainer_name)
CREATE MATERIALIZED VIEW public.challenge_leaderboard AS
SELECT 
  COALESCE(trainer_id::text, trainer_name) as trainer_key,
  trainer_id,
  trainer_name,
  trainer_city,
  trainer_state,
  trainer_gym,
  ROUND(AVG(rating_overall), 2) as average_rating,
  COUNT(id) as total_ratings,
  COUNT(CASE WHEN verification_status = 'verified' AND proof_file_url IS NOT NULL THEN 1 END) as verified_ratings,
  ROW_NUMBER() OVER (ORDER BY AVG(rating_overall) DESC, COUNT(id) DESC) as rank,
  now() as last_updated
FROM public.challenge_ratings
WHERE verification_status = 'verified'
GROUP BY COALESCE(trainer_id::text, trainer_name), trainer_id, trainer_name, trainer_city, trainer_state, trainer_gym
ORDER BY average_rating DESC, total_ratings DESC;

-- Create indexes for faster queries
CREATE INDEX idx_challenge_ratings_trainer ON public.challenge_ratings(trainer_name, verification_status);
CREATE INDEX idx_challenge_ratings_device ON public.challenge_ratings(device_fingerprint);
CREATE INDEX idx_challenge_ratings_ip ON public.challenge_ratings(ip_address);
CREATE INDEX idx_challenge_ratings_email ON public.challenge_ratings(rater_email);
CREATE INDEX idx_challenge_ratings_verification ON public.challenge_ratings(verification_status);

-- Enable RLS
ALTER TABLE public.challenge_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_fraud_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenge_ratings
CREATE POLICY "Anyone can view verified ratings"
  ON public.challenge_ratings FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Anyone can insert ratings"
  ON public.challenge_ratings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update ratings"
  ON public.challenge_ratings FOR UPDATE
  USING (true);

-- RLS Policies for challenge_fraud_checks  
CREATE POLICY "Admins can view fraud checks"
  ON public.challenge_fraud_checks FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert fraud checks"
  ON public.challenge_fraud_checks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update fraud checks"
  ON public.challenge_fraud_checks FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Create function to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_challenge_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.challenge_leaderboard;
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_challenge_ratings_updated_at
  BEFORE UPDATE ON public.challenge_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();