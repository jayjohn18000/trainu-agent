-- Create enums
CREATE TYPE public.consent_status AS ENUM ('active', 'pending', 'opted_out');
CREATE TYPE public.booking_status AS ENUM ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE public.message_status AS ENUM ('draft', 'queued', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE public.message_channel AS ENUM ('sms', 'email', 'both');

-- =====================================================
-- CONTACTS TABLE
-- =====================================================
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ghl_contact_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  tags TEXT[] DEFAULT '{}',
  consent_status consent_status DEFAULT 'active',
  last_message_sent_at TIMESTAMP WITH TIME ZONE,
  messages_sent_today INTEGER DEFAULT 0,
  messages_sent_this_week INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own contacts"
  ON public.contacts FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own contacts"
  ON public.contacts FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own contacts"
  ON public.contacts FOR DELETE
  USING (auth.uid() = trainer_id);

CREATE INDEX idx_contacts_trainer_id ON public.contacts(trainer_id);
CREATE INDEX idx_contacts_ghl_contact_id ON public.contacts(ghl_contact_id);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  ghl_appointment_id TEXT UNIQUE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status booking_status DEFAULT 'scheduled',
  session_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own bookings"
  ON public.bookings FOR DELETE
  USING (auth.uid() = trainer_id);

CREATE INDEX idx_bookings_trainer_id ON public.bookings(trainer_id);
CREATE INDEX idx_bookings_contact_id ON public.bookings(contact_id);
CREATE INDEX idx_bookings_scheduled_at ON public.bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status message_status DEFAULT 'draft',
  content TEXT NOT NULL,
  channel message_channel DEFAULT 'sms',
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  why_reasons TEXT[] DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  ghl_message_id TEXT,
  ghl_status TEXT,
  ghl_delivered_at TIMESTAMP WITH TIME ZONE,
  ghl_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = trainer_id);

CREATE INDEX idx_messages_trainer_id ON public.messages(trainer_id);
CREATE INDEX idx_messages_contact_id ON public.messages(contact_id);
CREATE INDEX idx_messages_status ON public.messages(status);
CREATE INDEX idx_messages_scheduled_for ON public.messages(scheduled_for);

-- =====================================================
-- INSIGHTS TABLE
-- =====================================================
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  last_activity_at TIMESTAMP WITH TIME ZONE,
  total_sessions INTEGER DEFAULT 0,
  missed_sessions INTEGER DEFAULT 0,
  response_rate NUMERIC(3,2) DEFAULT 0.00,
  current_streak INTEGER DEFAULT 0,
  engagement_score NUMERIC(3,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trainer_id, contact_id)
);

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own insights"
  ON public.insights FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own insights"
  ON public.insights FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own insights"
  ON public.insights FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE INDEX idx_insights_trainer_id ON public.insights(trainer_id);
CREATE INDEX idx_insights_contact_id ON public.insights(contact_id);
CREATE INDEX idx_insights_risk_score ON public.insights(risk_score);

-- =====================================================
-- EVENTS TABLE (Audit Log)
-- =====================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own events"
  ON public.events FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE INDEX idx_events_trainer_id ON public.events(trainer_id);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_events_created_at ON public.events(created_at);

-- =====================================================
-- FEATURE FLAGS TABLE
-- =====================================================
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trainer_id, flag_name)
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own flags"
  ON public.feature_flags FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own flags"
  ON public.feature_flags FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own flags"
  ON public.feature_flags FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE INDEX idx_feature_flags_trainer_id ON public.feature_flags(trainer_id);
CREATE INDEX idx_feature_flags_flag_name ON public.feature_flags(flag_name);

-- =====================================================
-- UPDATE GHL_CONFIG TABLE (Add compliance fields)
-- =====================================================
ALTER TABLE public.ghl_config
  ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '08:00:00',
  ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '21:00:00',
  ADD COLUMN IF NOT EXISTS frequency_cap_daily INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS frequency_cap_weekly INTEGER DEFAULT 5;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insights_updated_at
  BEFORE UPDATE ON public.insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();