-- Phase 1: Auto-Approval System Database Schema

-- 1.1 Add columns to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS auto_approval_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0 NOT NULL;

-- 1.2 Create trainer_edits table
CREATE TABLE IF NOT EXISTS public.trainer_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  edited_content TEXT NOT NULL,
  original_confidence NUMERIC,
  edit_type TEXT NOT NULL DEFAULT 'content_change',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 1.3 Create auto_approval_settings table
CREATE TABLE IF NOT EXISTS public.auto_approval_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT false NOT NULL,
  high_confidence_threshold NUMERIC DEFAULT 0.90 NOT NULL,
  preview_window_minutes INTEGER DEFAULT 15 NOT NULL,
  max_daily_auto_approvals INTEGER DEFAULT 20 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 1.4 Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_auto_approval 
ON public.messages(trainer_id, auto_approval_at) 
WHERE auto_approval_at IS NOT NULL AND status = 'draft';

CREATE INDEX IF NOT EXISTS idx_trainer_edits_trainer 
ON public.trainer_edits(trainer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trainer_edits_message 
ON public.trainer_edits(message_id);

-- 1.5 Enable RLS on new tables
ALTER TABLE public.trainer_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_approval_settings ENABLE ROW LEVEL SECURITY;

-- 1.6 RLS Policies for trainer_edits
CREATE POLICY "Trainers can view own edits"
ON public.trainer_edits FOR SELECT
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own edits"
ON public.trainer_edits FOR INSERT
WITH CHECK (auth.uid() = trainer_id);

-- 1.7 RLS Policies for auto_approval_settings
CREATE POLICY "Trainers can view own settings"
ON public.auto_approval_settings FOR SELECT
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own settings"
ON public.auto_approval_settings FOR INSERT
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own settings"
ON public.auto_approval_settings FOR UPDATE
USING (auth.uid() = trainer_id);

-- 1.8 Add trigger to update updated_at on auto_approval_settings
CREATE TRIGGER update_auto_approval_settings_updated_at
BEFORE UPDATE ON public.auto_approval_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();