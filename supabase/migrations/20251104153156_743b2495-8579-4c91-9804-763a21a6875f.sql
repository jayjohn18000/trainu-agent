-- ========================================
-- DAY 4: ENTERPRISE IMPLEMENTATION SCHEMA
-- ========================================

-- ========================================
-- PART 1: MULTI-TENANT ARCHITECTURE
-- ========================================

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  plan_tier text NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'enterprise', 'custom')),
  custom_domain text,
  branding jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'trial')),
  trial_ends_at timestamptz,
  billing_email text,
  max_trainers int DEFAULT 1,
  max_clients int DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Organization users (many-to-many relationship between users and orgs)
CREATE TABLE IF NOT EXISTS public.organization_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role_id uuid,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz,
  UNIQUE(organization_id, user_id)
);

-- Roles and permissions
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  permissions jsonb DEFAULT '[]',
  is_system_role boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Organization invitations
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role_id uuid REFERENCES public.roles(id) ON DELETE SET NULL,
  invited_by uuid NOT NULL,
  token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- API Keys for external access
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  permissions jsonb DEFAULT '[]',
  rate_limit int DEFAULT 1000,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

-- Subscription usage tracking
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  messages_sent int DEFAULT 0,
  ai_requests int DEFAULT 0,
  storage_gb numeric(10,2) DEFAULT 0,
  api_calls int DEFAULT 0,
  overage_charges numeric(10,2) DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, period_start)
);

-- ========================================
-- PART 2: ADVANCED AI & NLP
-- ========================================

-- NLP Analysis results
CREATE TABLE IF NOT EXISTS public.nlp_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL,
  contact_id uuid,
  input_text text NOT NULL,
  analysis_type text NOT NULL CHECK (analysis_type IN ('sentiment', 'intent', 'entity', 'full')),
  sentiment_score numeric(3,2),
  sentiment_label text,
  detected_intent text,
  entities jsonb DEFAULT '[]',
  keywords jsonb DEFAULT '[]',
  language text DEFAULT 'en',
  confidence_score numeric(3,2),
  processing_time_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Smart generated content
CREATE TABLE IF NOT EXISTS public.smart_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('message', 'motivation', 'coaching', 'email', 'workout')),
  prompt text NOT NULL,
  generated_content text NOT NULL,
  tone text DEFAULT 'friendly',
  personalization_data jsonb DEFAULT '{}',
  quality_score numeric(3,2),
  used boolean DEFAULT false,
  edited_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Conversation AI sessions
CREATE TABLE IF NOT EXISTS public.conversation_ai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  session_id text NOT NULL,
  message_history jsonb DEFAULT '[]',
  context jsonb DEFAULT '{}',
  current_intent text,
  conversation_state text DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

-- AI-generated insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL,
  insight_type text NOT NULL CHECK (insight_type IN ('client_behavior', 'engagement_pattern', 'churn_risk', 'opportunity', 'performance')),
  title text NOT NULL,
  description text NOT NULL,
  confidence_score numeric(3,2),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  actionable_recommendations jsonb DEFAULT '[]',
  data_source jsonb DEFAULT '{}',
  status text DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'acted_on', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- ========================================
-- PART 3: INTEGRATION ECOSYSTEM
-- ========================================

-- Integration configurations
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_type text NOT NULL CHECK (integration_type IN ('calendar', 'payment', 'crm', 'messaging', 'analytics', 'storage')),
  provider text NOT NULL,
  display_name text NOT NULL,
  credentials jsonb NOT NULL,
  settings jsonb DEFAULT '{}',
  webhook_url text,
  webhook_secret text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'disconnected')),
  last_sync_at timestamptz,
  sync_frequency text DEFAULT 'realtime',
  error_count int DEFAULT 0,
  last_error text,
  installed_by uuid NOT NULL,
  installed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Webhook events from integrations
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  headers jsonb,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  retry_count int DEFAULT 0,
  error_message text,
  received_at timestamptz NOT NULL DEFAULT now()
);

-- Data synchronization jobs
CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  sync_type text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound', 'bidirectional')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  records_processed int DEFAULT 0,
  records_failed int DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  error_details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Integration messages (cross-platform messaging)
CREATE TABLE IF NOT EXISTS public.integration_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  external_id text,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  platform text NOT NULL,
  from_address text NOT NULL,
  to_address text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  status text DEFAULT 'sent',
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Integration events log
CREATE TABLE IF NOT EXISTS public.integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_data jsonb NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ========================================
-- PART 4: BUSINESS INTELLIGENCE
-- ========================================

-- Business metrics definitions
CREATE TABLE IF NOT EXISTS public.business_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('count', 'sum', 'average', 'percentage', 'ratio')),
  calculation_query text NOT NULL,
  display_format text DEFAULT 'number',
  target_value numeric,
  current_value numeric,
  previous_value numeric,
  change_percentage numeric(5,2),
  time_period text DEFAULT 'daily',
  last_calculated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, metric_name)
);

-- Report templates
CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  report_type text NOT NULL CHECK (report_type IN ('executive', 'trainer_performance', 'client_engagement', 'financial', 'custom')),
  template_config jsonb NOT NULL,
  metrics_included jsonb DEFAULT '[]',
  schedule text,
  recipients jsonb DEFAULT '[]',
  format text DEFAULT 'pdf' CHECK (format IN ('pdf', 'html', 'excel', 'json')),
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Generated reports
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.report_templates(id) ON DELETE SET NULL,
  report_name text NOT NULL,
  report_data jsonb NOT NULL,
  file_path text,
  file_size_kb int,
  period_start date,
  period_end date,
  generated_by uuid,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Data exports
CREATE TABLE IF NOT EXISTS public.data_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  export_type text NOT NULL,
  table_name text NOT NULL,
  filters jsonb DEFAULT '{}',
  format text NOT NULL CHECK (format IN ('csv', 'json', 'sql', 'excel')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_path text,
  file_size_kb int,
  row_count int,
  requested_by uuid NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz,
  download_count int DEFAULT 0
);

-- Automated insights
CREATE TABLE IF NOT EXISTS public.automated_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  insight_category text NOT NULL,
  insight_text text NOT NULL,
  data_points jsonb NOT NULL,
  trend_direction text CHECK (trend_direction IN ('up', 'down', 'stable')),
  significance_score numeric(3,2),
  recommended_actions jsonb DEFAULT '[]',
  dismissed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Custom dashboards
CREATE TABLE IF NOT EXISTS public.custom_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  layout_config jsonb NOT NULL,
  widgets jsonb NOT NULL,
  filters jsonb DEFAULT '{}',
  refresh_interval int DEFAULT 300,
  is_default boolean DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========================================
-- PART 5: PRODUCTION QA & MONITORING
-- ========================================

-- Test suites
CREATE TABLE IF NOT EXISTS public.test_suites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  test_type text NOT NULL CHECK (test_type IN ('unit', 'integration', 'e2e', 'security', 'performance')),
  test_config jsonb NOT NULL,
  last_run_at timestamptz,
  last_run_status text,
  last_run_duration_ms int,
  pass_rate numeric(5,2),
  total_tests int DEFAULT 0,
  passed_tests int DEFAULT 0,
  failed_tests int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Security audits
CREATE TABLE IF NOT EXISTS public.security_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type text NOT NULL CHECK (audit_type IN ('vulnerability_scan', 'penetration_test', 'compliance_check', 'access_review')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  finding_title text NOT NULL,
  finding_description text NOT NULL,
  affected_component text,
  remediation_steps text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted_risk')),
  found_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  assigned_to uuid
);

-- Data backups
CREATE TABLE IF NOT EXISTS public.data_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
  storage_location text NOT NULL,
  file_size_gb numeric(10,2),
  backup_status text DEFAULT 'in_progress' CHECK (backup_status IN ('in_progress', 'completed', 'failed', 'expired')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz,
  retention_days int DEFAULT 30,
  encryption_enabled boolean DEFAULT true,
  verification_status text,
  error_message text
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Multi-tenant indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON public.organizations(plan_tier);
CREATE INDEX IF NOT EXISTS idx_org_users_org ON public.organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user ON public.organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_org ON public.roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON public.api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_org ON public.subscription_usage(organization_id, period_start);

-- AI/NLP indexes
CREATE INDEX IF NOT EXISTS idx_nlp_org_trainer ON public.nlp_analyses(organization_id, trainer_id);
CREATE INDEX IF NOT EXISTS idx_smart_content_org ON public.smart_content(organization_id, trainer_id);
CREATE INDEX IF NOT EXISTS idx_conversation_ai_session ON public.conversation_ai(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_org ON public.ai_insights(organization_id, trainer_id);

-- Integration indexes
CREATE INDEX IF NOT EXISTS idx_integrations_org ON public.integrations(organization_id, integration_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_integration ON public.webhook_events(integration_id, processed);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_integration ON public.sync_jobs(integration_id, status);
CREATE INDEX IF NOT EXISTS idx_integration_messages_org ON public.integration_messages(organization_id);

-- BI indexes
CREATE INDEX IF NOT EXISTS idx_business_metrics_org ON public.business_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_org ON public.report_templates(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_generated_reports_org ON public.generated_reports(organization_id, generated_at);
CREATE INDEX IF NOT EXISTS idx_data_exports_org ON public.data_exports(organization_id, status);

-- QA indexes
CREATE INDEX IF NOT EXISTS idx_security_audits_status ON public.security_audits(status, severity);
CREATE INDEX IF NOT EXISTS idx_data_backups_status ON public.data_backups(backup_status, started_at);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nlp_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;

-- Organization-based RLS policies (users can only access their organization's data)
CREATE POLICY org_isolation_policy ON public.organizations
  FOR ALL USING (
    id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY org_users_isolation ON public.organization_users
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY roles_isolation ON public.roles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY api_keys_isolation ON public.api_keys
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY nlp_isolation ON public.nlp_analyses
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY smart_content_isolation ON public.smart_content
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY integrations_isolation ON public.integrations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY business_metrics_isolation ON public.business_metrics
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_metrics_updated_at BEFORE UPDATE ON public.business_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();