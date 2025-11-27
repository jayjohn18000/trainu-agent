-- Create client_notes table for goals, milestones, and quick notes
CREATE TABLE public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'quick_note' CHECK (note_type IN ('goal', 'milestone', 'quick_note')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_client_notes_contact_id ON public.client_notes(contact_id);
CREATE INDEX idx_client_notes_trainer_id ON public.client_notes(trainer_id);

-- Enable RLS
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Trainers can only access their own notes
CREATE POLICY "Trainers can view own notes"
  ON public.client_notes FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own notes"
  ON public.client_notes FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own notes"
  ON public.client_notes FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own notes"
  ON public.client_notes FOR DELETE
  USING (auth.uid() = trainer_id);

-- Trigger for updated_at
CREATE TRIGGER update_client_notes_updated_at
  BEFORE UPDATE ON public.client_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Extend message_channel enum with social platforms
ALTER TYPE public.message_channel ADD VALUE IF NOT EXISTS 'instagram';
ALTER TYPE public.message_channel ADD VALUE IF NOT EXISTS 'facebook';
ALTER TYPE public.message_channel ADD VALUE IF NOT EXISTS 'whatsapp';
ALTER TYPE public.message_channel ADD VALUE IF NOT EXISTS 'dm';