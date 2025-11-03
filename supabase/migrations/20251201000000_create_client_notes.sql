-- Create client_notes table for multi-note system

CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Trainers can view own client notes"
  ON public.client_notes FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own client notes"
  ON public.client_notes FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own client notes"
  ON public.client_notes FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own client notes"
  ON public.client_notes FOR DELETE
  USING (auth.uid() = trainer_id);

-- Indexes
CREATE INDEX idx_client_notes_trainer_id ON public.client_notes(trainer_id);
CREATE INDEX idx_client_notes_contact_id ON public.client_notes(contact_id);
CREATE INDEX idx_client_notes_created_at ON public.client_notes(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_client_notes_updated_at
  BEFORE UPDATE ON public.client_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

