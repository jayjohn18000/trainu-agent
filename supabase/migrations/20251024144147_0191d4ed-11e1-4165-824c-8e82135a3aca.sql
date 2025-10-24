-- Add RPC function to increment trainer stats

CREATE OR REPLACE FUNCTION increment_trainer_stat(
  trainer_id UUID,
  stat_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format('
    UPDATE public.trainer_profiles 
    SET %I = COALESCE(%I, 0) + 1 
    WHERE id = $1
  ', stat_name, stat_name)
  USING trainer_id;
END;
$$;