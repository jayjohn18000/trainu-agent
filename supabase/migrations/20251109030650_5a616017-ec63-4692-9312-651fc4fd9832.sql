-- Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  total_sessions INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Trainers can view own programs
CREATE POLICY "Trainers can view own programs"
  ON public.programs
  FOR SELECT
  USING (auth.uid() = trainer_id);

-- Trainers can insert own programs
CREATE POLICY "Trainers can insert own programs"
  ON public.programs
  FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

-- Trainers can update own programs
CREATE POLICY "Trainers can update own programs"
  ON public.programs
  FOR UPDATE
  USING (auth.uid() = trainer_id);

-- Trainers can delete own programs
CREATE POLICY "Trainers can delete own programs"
  ON public.programs
  FOR DELETE
  USING (auth.uid() = trainer_id);

-- Add program_id to contacts table
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_contacts_program_id ON public.contacts(program_id);
CREATE INDEX IF NOT EXISTS idx_programs_trainer_id ON public.programs(trainer_id);

-- Add trigger for updated_at on programs
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default programs for existing trainers
INSERT INTO public.programs (trainer_id, name, description, duration_weeks, total_sessions, is_active)
SELECT 
  id as trainer_id,
  'Beginner Fundamentals',
  'Foundation program for new clients focusing on form and basic movements',
  8,
  24,
  true
FROM auth.users
WHERE id IN (SELECT DISTINCT trainer_id FROM public.contacts)
ON CONFLICT DO NOTHING;

INSERT INTO public.programs (trainer_id, name, description, duration_weeks, total_sessions, is_active)
SELECT 
  id as trainer_id,
  'Strength Building',
  'Progressive overload program for building muscle and increasing strength',
  12,
  36,
  true
FROM auth.users
WHERE id IN (SELECT DISTINCT trainer_id FROM public.contacts)
ON CONFLICT DO NOTHING;

INSERT INTO public.programs (trainer_id, name, description, duration_weeks, total_sessions, is_active)
SELECT 
  id as trainer_id,
  'Fat Loss Journey',
  'High-intensity program designed for maximum fat loss and conditioning',
  8,
  32,
  true
FROM auth.users
WHERE id IN (SELECT DISTINCT trainer_id FROM public.contacts)
ON CONFLICT DO NOTHING;

INSERT INTO public.programs (trainer_id, name, description, duration_weeks, total_sessions, is_active)
SELECT 
  id as trainer_id,
  'Athletic Performance',
  'Advanced program for athletes focusing on sport-specific movements',
  16,
  48,
  true
FROM auth.users
WHERE id IN (SELECT DISTINCT trainer_id FROM public.contacts)
ON CONFLICT DO NOTHING;

INSERT INTO public.programs (trainer_id, name, description, duration_weeks, total_sessions, is_active)
SELECT 
  id as trainer_id,
  'Post-Injury Recovery',
  'Careful rehabilitation program with progressive mobility work',
  6,
  18,
  true
FROM auth.users
WHERE id IN (SELECT DISTINCT trainer_id FROM public.contacts)
ON CONFLICT DO NOTHING;