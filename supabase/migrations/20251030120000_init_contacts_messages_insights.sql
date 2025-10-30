-- TrainU: Initial schema for contacts, bookings, messages, insights, events, feature_flags
-- Notes:
-- - Uses trainer_id for multi-tenancy. Do not FK to auth.users.
-- - RLS ensures row access by matching trainer_id to auth.uid().

-- ENUMS
DO $$ BEGIN
  CREATE TYPE consent_status AS ENUM ('active','pending','opted_out');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('scheduled','confirmed','cancelled','completed','no_show','rescheduled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE message_status AS ENUM ('draft','queued','sent','delivered','read','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE message_channel AS ENUM ('sms','email','both');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  ghl_contact_id text,
  first_name text,
  last_name text,
  email text,
  phone text,
  tags text[],
  consent_status consent_status NOT NULL DEFAULT 'active',
  last_message_sent_at timestamptz,
  messages_sent_today int NOT NULL DEFAULT 0,
  messages_sent_this_week int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  ghl_appointment_id text,
  scheduled_at timestamptz NOT NULL,
  status booking_status NOT NULL DEFAULT 'scheduled',
  session_type text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status message_status NOT NULL DEFAULT 'draft',
  content text NOT NULL,
  channel message_channel NOT NULL DEFAULT 'sms',
  confidence numeric(5,2),
  why_reasons text[],
  scheduled_for timestamptz,
  ghl_message_id text,
  ghl_status text,
  ghl_delivered_at timestamptz,
  ghl_read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- INSIGHTS
CREATE TABLE IF NOT EXISTS public.insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  risk_score int CHECK (risk_score BETWEEN 0 AND 100),
  last_activity_at timestamptz,
  total_sessions int,
  missed_sessions int,
  response_rate numeric(5,2),
  current_streak int,
  engagement_score numeric(5,2),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- EVENTS (audit log)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- FEATURE FLAGS
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  flag_name text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, flag_name)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_contacts_trainer ON public.contacts(trainer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trainer ON public.bookings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_contact ON public.bookings(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_trainer_status ON public.messages(trainer_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_contact_scheduled ON public.messages(contact_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_insights_trainer_contact ON public.insights(trainer_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_events_trainer_created ON public.events(trainer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flags_trainer_name ON public.feature_flags(trainer_id, flag_name);

-- TRIGGERS: updated_at auto-update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_insights_updated_at BEFORE UPDATE ON public.insights
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Basic tenant isolation: trainer_id = auth.uid()
-- In production you may map via profiles; for demo, direct match.
CREATE POLICY contacts_isolation ON public.contacts
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

CREATE POLICY bookings_isolation ON public.bookings
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

CREATE POLICY messages_isolation ON public.messages
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

CREATE POLICY insights_isolation ON public.insights
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY events_read ON public.events
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY feature_flags_rw ON public.feature_flags
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());


