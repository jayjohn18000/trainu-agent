-- Nudge Settings Table (per-trainer configuration)
CREATE TABLE IF NOT EXISTS public.nudge_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  daily_limit int DEFAULT 5 CHECK (daily_limit BETWEEN 1 AND 20),
  min_hours_between_nudges int DEFAULT 4 CHECK (min_hours_between_nudges BETWEEN 1 AND 72),
  quiet_hours_start int DEFAULT 21 CHECK (quiet_hours_start BETWEEN 0 AND 23),
  quiet_hours_end int DEFAULT 8 CHECK (quiet_hours_end BETWEEN 0 AND 23),
  preferred_channels text[] DEFAULT ARRAY['sms'],
  auto_send_enabled boolean DEFAULT false,
  min_risk_threshold int DEFAULT 50 CHECK (min_risk_threshold BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Nudge Campaigns Table (tracks all nudge campaigns)
CREATE TABLE IF NOT EXISTS public.nudge_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  campaign_type text NOT NULL,
  priority_score numeric(5,2) NOT NULL,
  urgency_level int CHECK (urgency_level BETWEEN 1 AND 5),
  content text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'delivered', 'failed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  response_received_at timestamptz,
  error_message text
);

-- Nudge Analytics Table (tracks performance metrics)
CREATE TABLE IF NOT EXISTS public.nudge_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_campaigns_created int DEFAULT 0,
  total_campaigns_sent int DEFAULT 0,
  total_responses_received int DEFAULT 0,
  average_response_time_hours numeric(5,2),
  most_effective_template text,
  clients_re_engaged int DEFAULT 0,
  revenue_attributed numeric(10,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, date)
);

-- Nudge Templates Table (customizable message templates)
CREATE TABLE IF NOT EXISTS public.nudge_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  name text NOT NULL,
  template_type text NOT NULL,
  content_template text NOT NULL,
  personalization_fields text[],
  triggers text[],
  optimal_days int[],
  optimal_hours int[],
  max_frequency_per_week int DEFAULT 1,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, template_id)
);

-- Client Nudge History Table (tracks nudge interaction history per client)
CREATE TABLE IF NOT EXISTS public.client_nudge_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.nudge_campaigns(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  sent_at timestamptz,
  response_received boolean DEFAULT false,
  response_time_hours numeric(5,2),
  booking_generated boolean DEFAULT false,
  revenue_attributed numeric(10,2) DEFAULT 0,
  effectiveness_score numeric(3,2) CHECK (effectiveness_score BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_nudge_settings_trainer ON public.nudge_settings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_nudge_campaigns_trainer_status ON public.nudge_campaigns(trainer_id, status);
CREATE INDEX IF NOT EXISTS idx_nudge_campaigns_scheduled ON public.nudge_campaigns(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_nudge_campaigns_contact ON public.nudge_campaigns(contact_id);
CREATE INDEX IF NOT EXISTS idx_nudge_analytics_trainer_date ON public.nudge_analytics(trainer_id, date);
CREATE INDEX IF NOT EXISTS idx_nudge_templates_trainer_active ON public.nudge_templates(trainer_id, active);
CREATE INDEX IF NOT EXISTS idx_client_nudge_history_trainer_contact ON public.client_nudge_history(trainer_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_client_nudge_history_campaign ON public.client_nudge_history(campaign_id);

-- Enable RLS
ALTER TABLE public.nudge_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudge_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudge_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_nudge_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (trainer isolation)
CREATE POLICY nudge_settings_isolation ON public.nudge_settings
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

CREATE POLICY nudge_campaigns_isolation ON public.nudge_campaigns
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

CREATE POLICY nudge_analytics_isolation ON public.nudge_analytics
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

CREATE POLICY nudge_templates_isolation ON public.nudge_templates
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

CREATE POLICY client_nudge_history_isolation ON public.client_nudge_history
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_nudge_settings_updated_at
  BEFORE UPDATE ON public.nudge_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nudge_templates_updated_at
  BEFORE UPDATE ON public.nudge_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();