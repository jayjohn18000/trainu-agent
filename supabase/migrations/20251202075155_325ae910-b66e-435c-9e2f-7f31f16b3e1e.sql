-- TrainU: Integration system tables

-- INTEGRATION_CONFIGS
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  integration_name TEXT NOT NULL CHECK (integration_name IN ('ghl', 'mindbody', 'trainerize', 'truecoach', 'apple_health', 'oura')),
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  external_account_id text NOT NULL,
  external_location_id text,
  last_sync_at timestamptz,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('connected', 'disconnected', 'error', 'syncing', 'warning', 'idle')),
  sync_error_message text,
  config_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, integration_name)
);

CREATE TABLE IF NOT EXISTS public.contact_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('ghl', 'mindbody', 'trainerize', 'truecoach', 'apple_health', 'oura')),
  external_id text NOT NULL,
  synced_at timestamptz,
  data_hash text,
  source_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(contact_id, source),
  UNIQUE(source, external_id)
);

CREATE TABLE IF NOT EXISTS public.integration_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  integration_name TEXT NOT NULL CHECK (integration_name IN ('ghl', 'mindbody', 'trainerize', 'truecoach', 'apple_health', 'oura')),
  connection_status TEXT DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error', 'syncing', 'warning', 'idle')),
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  last_error text,
  last_error_at timestamptz,
  error_count int DEFAULT 0,
  records_synced int DEFAULT 0,
  records_updated int DEFAULT 0,
  sync_duration_ms int,
  api_calls_used int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, integration_name)
);

CREATE TABLE IF NOT EXISTS public.integration_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  integration_name TEXT NOT NULL CHECK (integration_name IN ('ghl', 'mindbody', 'trainerize', 'truecoach', 'apple_health', 'oura')),
  activity_type text NOT NULL,
  activity_message text NOT NULL,
  activity_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.insight_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  contact_id UUID,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('churn', 'queue', 'client')),
  prompt_version TEXT NOT NULL,
  data_hash TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.ai_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  prompt_version TEXT,
  latency_ms INTEGER,
  used_fallback BOOLEAN DEFAULT false,
  cache_hit BOOLEAN DEFAULT false,
  tokens_used INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_integration_configs_trainer ON public.integration_configs(trainer_id);
CREATE INDEX IF NOT EXISTS idx_contact_sources_contact ON public.contact_sources(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_sources_source ON public.contact_sources(source);
CREATE INDEX IF NOT EXISTS idx_integration_status_trainer ON public.integration_status(trainer_id);
CREATE INDEX IF NOT EXISTS idx_integration_activity_trainer ON public.integration_activity_log(trainer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insight_cache_lookup ON insight_cache(trainer_id, contact_id, insight_type, data_hash);
CREATE INDEX IF NOT EXISTS idx_insight_cache_expires ON insight_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_trainer ON ai_analytics(trainer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_function ON ai_analytics(function_name, created_at DESC);

-- TRIGGERS
DO $$ BEGIN
  CREATE TRIGGER set_integration_configs_updated_at BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_contact_sources_updated_at BEFORE UPDATE ON public.contact_sources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_integration_status_updated_at BEFORE UPDATE ON public.integration_status
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insight_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY integration_configs_isolation ON public.integration_configs
    FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY contact_sources_isolation ON public.contact_sources
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = contact_sources.contact_id AND c.trainer_id = auth.uid())
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = contact_sources.contact_id AND c.trainer_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY integration_status_isolation ON public.integration_status
    FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY integration_activity_isolation ON public.integration_activity_log
    FOR SELECT USING (trainer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Trainers can view own cache" ON public.insight_cache FOR SELECT USING (auth.uid() = trainer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Trainers can insert own cache" ON public.insight_cache FOR INSERT WITH CHECK (auth.uid() = trainer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Trainers can update own cache" ON public.insight_cache FOR UPDATE USING (auth.uid() = trainer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Trainers can delete own cache" ON public.insight_cache FOR DELETE USING (auth.uid() = trainer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Trainers can view own analytics" ON public.ai_analytics FOR SELECT USING (auth.uid() = trainer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Trainers can insert own analytics" ON public.ai_analytics FOR INSERT WITH CHECK (auth.uid() = trainer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend contacts table
ALTER TABLE public.contacts 
  ADD COLUMN IF NOT EXISTS mindbody_id text,
  ADD COLUMN IF NOT EXISTS trainerize_id text,
  ADD COLUMN IF NOT EXISTS truecoach_id text,
  ADD COLUMN IF NOT EXISTS risk_score int,
  ADD COLUMN IF NOT EXISTS compliance_rate numeric(5,2),
  ADD COLUMN IF NOT EXISTS last_insight_at timestamptz,
  ADD COLUMN IF NOT EXISTS data_completeness numeric(5,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_contacts_mindbody_id ON public.contacts(mindbody_id) WHERE mindbody_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_trainerize_id ON public.contacts(trainerize_id) WHERE trainerize_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_truecoach_id ON public.contacts(truecoach_id) WHERE truecoach_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_risk_score ON public.contacts(trainer_id, risk_score DESC) WHERE risk_score IS NOT NULL;

-- Enhance insights table
ALTER TABLE public.insights
ADD COLUMN IF NOT EXISTS churn_probability DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS confidence_level TEXT,
ADD COLUMN IF NOT EXISTS risk_category TEXT,
ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS positive_indicators JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS warning_signals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS recommended_actions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS used_fallback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS prompt_version TEXT;

CREATE INDEX IF NOT EXISTS idx_insights_churn ON public.insights(trainer_id, churn_probability DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_insights_risk_category ON public.insights(trainer_id, risk_category);