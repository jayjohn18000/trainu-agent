-- Add source tracking fields to programs table for integration support
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.programs.source IS 'Origin of program: manual, trainerize, csv, etc.';
COMMENT ON COLUMN public.programs.external_id IS 'ID from external system (e.g., Trainerize program ID)';
COMMENT ON COLUMN public.programs.imported_at IS 'Timestamp when program was imported from external source';

-- Create function to seed default programs for new trainers
CREATE OR REPLACE FUNCTION public.seed_trainer_programs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default starter programs for the new trainer
  INSERT INTO public.programs (trainer_id, name, description, duration_weeks, total_sessions, source)
  VALUES
    (NEW.id, 'Strength Training - Beginner', 'Foundation strength program for new clients focusing on compound movements and proper form.', 8, 24, 'default'),
    (NEW.id, 'Weight Loss Program', 'Comprehensive fat loss program combining cardio, strength, and nutrition guidance.', 12, 36, 'default'),
    (NEW.id, 'HIIT Conditioning', 'High-intensity interval training for improved cardiovascular fitness and endurance.', 6, 18, 'default'),
    (NEW.id, 'Flexibility & Mobility', 'Dedicated stretching and mobility work for injury prevention and recovery.', 4, 12, 'default'),
    (NEW.id, 'Custom Program Template', 'Blank template to customize for individual client needs.', NULL, NULL, 'default');
  
  RETURN NEW;
END;
$$;

-- Create trigger to seed programs when a new trainer profile is created
DROP TRIGGER IF EXISTS seed_programs_for_new_trainer ON public.trainer_profiles;
CREATE TRIGGER seed_programs_for_new_trainer
  AFTER INSERT ON public.trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_trainer_programs();