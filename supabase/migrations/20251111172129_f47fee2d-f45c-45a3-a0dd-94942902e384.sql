-- Update challenge_leaderboard materialized view to include location
DROP MATERIALIZED VIEW IF EXISTS public.challenge_leaderboard;

CREATE MATERIALIZED VIEW public.challenge_leaderboard AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY 
    SUM(CASE WHEN verification_status = 'verified' THEN 2 ELSE 1 END) DESC,
    AVG(rating_overall::numeric) DESC
  ) as rank,
  trainer_id,
  COALESCE(trainer_slug, LOWER(REPLACE(trainer_name, ' ', '-'))) as trainer_key,
  trainer_name,
  trainer_city,
  trainer_state,
  trainer_gym,
  ROUND(AVG(rating_overall::numeric), 2) as average_rating,
  COUNT(*) as total_ratings,
  MAX(updated_at) as last_updated
FROM public.challenge_ratings
WHERE verification_status = 'verified'
GROUP BY 
  trainer_id,
  trainer_slug,
  trainer_name,
  trainer_city,
  trainer_state,
  trainer_gym
HAVING COUNT(*) >= 1
ORDER BY rank;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_challenge_leaderboard_rank ON public.challenge_leaderboard(rank);

-- Refresh the view
REFRESH MATERIALIZED VIEW public.challenge_leaderboard;