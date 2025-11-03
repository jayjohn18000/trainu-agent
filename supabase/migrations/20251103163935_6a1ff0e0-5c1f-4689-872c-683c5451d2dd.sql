-- Create conversation history table for AI agent
CREATE TABLE IF NOT EXISTS public.conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tool_calls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast retrieval of recent conversations
CREATE INDEX idx_conversation_history_trainer ON public.conversation_history(trainer_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_history
CREATE POLICY "Trainers can view own conversation history"
ON public.conversation_history
FOR SELECT
TO authenticated
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own conversation history"
ON public.conversation_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own conversation history"
ON public.conversation_history
FOR DELETE
TO authenticated
USING (auth.uid() = trainer_id);

-- Create tag suggestions table
CREATE TABLE IF NOT EXISTS public.tag_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  suggested_tag TEXT NOT NULL,
  reason TEXT NOT NULL,
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ
);

-- Create index for pending suggestions
CREATE INDEX idx_tag_suggestions_pending ON public.tag_suggestions(trainer_id, applied) WHERE applied = FALSE;

-- Enable RLS
ALTER TABLE public.tag_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tag_suggestions
CREATE POLICY "Trainers can view own tag suggestions"
ON public.tag_suggestions
FOR SELECT
TO authenticated
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own tag suggestions"
ON public.tag_suggestions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own tag suggestions"
ON public.tag_suggestions
FOR UPDATE
TO authenticated
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own tag suggestions"
ON public.tag_suggestions
FOR DELETE
TO authenticated
USING (auth.uid() = trainer_id);