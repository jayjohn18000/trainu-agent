-- TrainU: Segments, Saved Queries, Documents, GHL config extensions, demo payments view

-- Extend ghl_config with booking widget and template overrides
ALTER TABLE IF EXISTS public.ghl_config
  ADD COLUMN IF NOT EXISTS booking_widget_id TEXT,
  ADD COLUMN IF NOT EXISTS templates JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Segments
CREATE TABLE IF NOT EXISTS public.segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY segments_tenant_rw ON public.segments
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_segments_trainer ON public.segments(trainer_id);

-- Segment rules (DSL + schedule)
CREATE TABLE IF NOT EXISTS public.segment_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  segment_id uuid NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  dsl_json jsonb NOT NULL,
  schedule text DEFAULT '0 4 * * *', -- daily 4am
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.segment_rules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY segment_rules_tenant_rw ON public.segment_rules
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_segment_rules_trainer ON public.segment_rules(trainer_id);

-- Saved queries for Agent metrics
CREATE TABLE IF NOT EXISTS public.saved_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  name text NOT NULL,
  dsl_json jsonb NOT NULL,
  starred boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_queries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY saved_queries_tenant_rw ON public.saved_queries
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_saved_queries_trainer ON public.saved_queries(trainer_id);

-- Documents for List→Document outputs
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  title text NOT NULL,
  markdown text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY documents_tenant_rw ON public.documents
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_documents_trainer ON public.documents(trainer_id);

-- Demo-friendly payments view (mock)
CREATE OR REPLACE VIEW public.payments_view AS
SELECT
  c.id AS contact_id,
  c.trainer_id,
  (random() > 0.85) AS is_past_due,
  (random() * 100)::int AS days_since_payment
FROM public.contacts c;

GRANT SELECT ON public.payments_view TO anon, authenticated;


