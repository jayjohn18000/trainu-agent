-- Add profile fields to trainer_profiles table
ALTER TABLE public.trainer_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_session_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_progress_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_marketing BOOLEAN DEFAULT false;

-- Create agent_settings table for agent behavior preferences
CREATE TABLE IF NOT EXISTS public.agent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  autonomy TEXT NOT NULL DEFAULT 'review',
  tone TEXT NOT NULL DEFAULT 'casual',
  length TEXT NOT NULL DEFAULT 'concise',
  emoji TEXT NOT NULL DEFAULT 'rarely',
  quiet_start TIME NOT NULL DEFAULT '21:00',
  quiet_end TIME NOT NULL DEFAULT '09:00',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trainer_id)
);

-- Enable RLS on agent_settings
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_settings
CREATE POLICY "Trainers can view own agent settings"
  ON public.agent_settings FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own agent settings"
  ON public.agent_settings FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own agent settings"
  ON public.agent_settings FOR UPDATE
  USING (auth.uid() = trainer_id);

-- Add trigger for updated_at
CREATE TRIGGER update_agent_settings_updated_at
  BEFORE UPDATE ON public.agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();