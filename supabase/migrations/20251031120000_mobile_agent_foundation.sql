-- Mobile Agent v1 Foundation: schema and RLS

-- 1) Extend GHL config per-trainer
ALTER TABLE public.ghl_config
  ADD COLUMN IF NOT EXISTS booking_widget_id TEXT,
  ADD COLUMN IF NOT EXISTS templates JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS backfill_checkpoint TEXT;

-- 2) Link clients to GHL contacts (only if clients table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;
  END IF;
END $$;

-- 3) Drafts: approval inbox items governed by queue-management
CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  client_id UUID,
  channel TEXT CHECK (channel IN ('sms','email','both')),
  body TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','approved','scheduled','sent','dismissed','failed')) DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  failed_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select drafts"
  ON public.drafts FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Owner can insert drafts"
  ON public.drafts FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Owner can update drafts"
  ON public.drafts FOR UPDATE
  USING (auth.uid() = trainer_id);

-- 4) Saved queries for metrics
CREATE TABLE IF NOT EXISTS public.saved_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  name TEXT NOT NULL,
  dsl_json JSONB NOT NULL,
  starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.saved_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select saved_queries"
  ON public.saved_queries FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Owner can insert saved_queries"
  ON public.saved_queries FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Owner can update saved_queries"
  ON public.saved_queries FOR UPDATE
  USING (auth.uid() = trainer_id);

-- 5) Segments and rules
CREATE TABLE IF NOT EXISTS public.segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select segments"
  ON public.segments FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Owner can insert segments"
  ON public.segments FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Owner can update segments"
  ON public.segments FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE TABLE IF NOT EXISTS public.segment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  segment_id UUID NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dsl_json JSONB NOT NULL,
  schedule TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.segment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select segment_rules"
  ON public.segment_rules FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Owner can insert segment_rules"
  ON public.segment_rules FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Owner can update segment_rules"
  ON public.segment_rules FOR UPDATE
  USING (auth.uid() = trainer_id);

-- 6) Documents (generated lists, exports, etc.)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL, -- e.g., 'list','export'
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Owner can insert documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Owner can update documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = trainer_id);

-- 7) Demo-only payments view (mock). Safe to create if not exists.
CREATE OR REPLACE VIEW public.payments_view AS
  SELECT
    gen_random_uuid() AS id,
    now() - make_interval(days => (g % 30)) AS paid_at,
    (1000 + (g % 10) * 500)::INT AS amount_cents,
    'usd'::TEXT AS currency
  FROM generate_series(1, 20) AS g;

-- 8) Add updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_drafts_updated_at ON public.drafts;
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON public.drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_queries_updated_at ON public.saved_queries;
CREATE TRIGGER update_saved_queries_updated_at BEFORE UPDATE ON public.saved_queries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_segments_updated_at ON public.segments;
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON public.segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_segment_rules_updated_at ON public.segment_rules;
CREATE TRIGGER update_segment_rules_updated_at BEFORE UPDATE ON public.segment_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9) Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_drafts_trainer_status ON public.drafts(trainer_id, status);
CREATE INDEX IF NOT EXISTS idx_drafts_scheduled_at ON public.drafts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_saved_queries_trainer ON public.saved_queries(trainer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_segments_trainer ON public.segments(trainer_id);
CREATE INDEX IF NOT EXISTS idx_segment_rules_segment ON public.segment_rules(segment_id);
CREATE INDEX IF NOT EXISTS idx_documents_trainer ON public.documents(trainer_id, created_at DESC);

-- 10) Add DELETE policies where needed
CREATE POLICY "Owner can delete drafts"
  ON public.drafts FOR DELETE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Owner can delete saved_queries"
  ON public.saved_queries FOR DELETE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Owner can delete segments"
  ON public.segments FOR DELETE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Owner can delete documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = trainer_id);

-- 11) Enable realtime for drafts (optional, for live updates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'drafts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.drafts;
  END IF;
END $$;


