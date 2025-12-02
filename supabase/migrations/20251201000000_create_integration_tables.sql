-- TrainU: Integration system tables for multi-platform data sync
-- Supports Mindbody, Trainerize, TrueCoach, and future integrations

-- ENUMS
DO $$ BEGIN
  CREATE TYPE integration_status AS ENUM ('connected', 'disconnected', 'error', 'syncing', 'warning');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE integration_source AS ENUM ('ghl', 'mindbody', 'trainerize', 'truecoach', 'apple_health', 'oura');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- INTEGRATION_CONFIGS: OAuth credentials per platform
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  integration_name integration_source NOT NULL,
  
  -- OAuth Tokens (encrypted in application layer)
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  
  -- Platform-specific identifiers
  external_account_id text NOT NULL,
  external_location_id text,
  
  -- Sync Config
  last_sync_at timestamptz,
  sync_status integration_status DEFAULT 'idle',
  sync_error_message text,
  
  -- Metadata
  config_data jsonb, -- Platform-specific config (webhook URLs, etc.)
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(trainer_id, integration_name)
);

-- CONTACT_SOURCES: Multi-source client tracking
CREATE TABLE IF NOT EXISTS public.contact_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  
  source integration_source NOT NULL,
  external_id text NOT NULL, -- Mindbody client ID, Trainerize client ID, etc.
  
  -- Last sync metadata
  synced_at timestamptz,
  data_hash text, -- Hash of last synced data for change detection
  
  -- Data from this source (normalized)
  source_data jsonb, -- Raw/normalized data from source
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(contact_id, source),
  UNIQUE(source, external_id)
);

-- INTEGRATION_STATUS: Sync health dashboard
CREATE TABLE IF NOT EXISTS public.integration_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  integration_name integration_source NOT NULL,
  
  -- Status
  connection_status integration_status DEFAULT 'disconnected',
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  
  -- Error tracking
  last_error text,
  last_error_at timestamptz,
  error_count int DEFAULT 0,
  
  -- Record counts
  records_synced int DEFAULT 0,
  records_updated int DEFAULT 0,
  
  -- Health metrics
  sync_duration_ms int, -- How long last sync took
  api_calls_used int, -- For rate limiting
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(trainer_id, integration_name)
);

-- INTEGRATION_ACTIVITY_LOG: Activity entries per integration
CREATE TABLE IF NOT EXISTS public.integration_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  integration_name integration_source NOT NULL,
  
  -- Activity details
  activity_type text NOT NULL, -- 'sync_started', 'sync_completed', 'sync_error', 'webhook_received', etc.
  activity_message text NOT NULL,
  activity_data jsonb, -- Additional context
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_integration_configs_trainer ON public.integration_configs(trainer_id);
CREATE INDEX IF NOT EXISTS idx_integration_configs_name ON public.integration_configs(integration_name);
CREATE INDEX IF NOT EXISTS idx_contact_sources_contact ON public.contact_sources(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_sources_source ON public.contact_sources(source);
CREATE INDEX IF NOT EXISTS idx_contact_sources_external ON public.contact_sources(source, external_id);
CREATE INDEX IF NOT EXISTS idx_integration_status_trainer ON public.integration_status(trainer_id);
CREATE INDEX IF NOT EXISTS idx_integration_status_name ON public.integration_status(integration_name);
CREATE INDEX IF NOT EXISTS idx_integration_activity_trainer ON public.integration_activity_log(trainer_id, integration_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_activity_created ON public.integration_activity_log(created_at DESC);

-- TRIGGERS: updated_at auto-update
DO $$ BEGIN
  CREATE TRIGGER set_integration_configs_updated_at BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_contact_sources_updated_at BEFORE UPDATE ON public.contact_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_integration_status_updated_at BEFORE UPDATE ON public.integration_status
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: tenant isolation
CREATE POLICY integration_configs_isolation ON public.integration_configs
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

CREATE POLICY contact_sources_isolation ON public.contact_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.contacts c 
      WHERE c.id = contact_sources.contact_id 
      AND c.trainer_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts c 
      WHERE c.id = contact_sources.contact_id 
      AND c.trainer_id = auth.uid()
    )
  );

CREATE POLICY integration_status_isolation ON public.integration_status
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

CREATE POLICY integration_activity_isolation ON public.integration_activity_log
  FOR SELECT USING (trainer_id = auth.uid());

-- Extend contacts table with integration fields
ALTER TABLE public.contacts 
  ADD COLUMN IF NOT EXISTS mindbody_id text,
  ADD COLUMN IF NOT EXISTS trainerize_id text,
  ADD COLUMN IF NOT EXISTS truecoach_id text,
  ADD COLUMN IF NOT EXISTS risk_score int CHECK (risk_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS compliance_rate numeric(5,2) CHECK (compliance_rate BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS last_insight_at timestamptz,
  ADD COLUMN IF NOT EXISTS data_completeness numeric(5,2) DEFAULT 0 CHECK (data_completeness BETWEEN 0 AND 100);

-- Indexes for new contact columns
CREATE INDEX IF NOT EXISTS idx_contacts_mindbody_id ON public.contacts(mindbody_id) WHERE mindbody_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_trainerize_id ON public.contacts(trainerize_id) WHERE trainerize_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_truecoach_id ON public.contacts(truecoach_id) WHERE truecoach_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_risk_score ON public.contacts(trainer_id, risk_score DESC) WHERE risk_score IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE public.integration_configs IS 'OAuth credentials and configuration for each integration platform';
COMMENT ON TABLE public.contact_sources IS 'Tracks which external systems have data for each contact';
COMMENT ON TABLE public.integration_status IS 'Health and sync status dashboard for each integration';
COMMENT ON TABLE public.integration_activity_log IS 'Activity log for integration syncs and webhooks';

