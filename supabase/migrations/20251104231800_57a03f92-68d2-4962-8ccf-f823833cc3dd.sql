-- Fix all CRITICAL security issues

-- 1. Create role infrastructure
CREATE TYPE public.app_role AS ENUM ('client', 'trainer', 'gym_admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Only service role can insert/update roles (manual admin assignment)
CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role');

-- 2. Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Fix increment_trainer_stat function
CREATE OR REPLACE FUNCTION public.increment_trainer_stat(
  trainer_id UUID,
  stat_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- CRITICAL: Validate caller owns this trainer_id
  IF trainer_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: cannot modify other trainers stats';
  END IF;
  
  -- Whitelist allowed stat names to prevent column injection
  IF stat_name NOT IN ('messages_sent', 'clients_added', 'sessions_completed') THEN
    RAISE EXCEPTION 'Invalid stat name: %', stat_name;
  END IF;
  
  EXECUTE format('
    UPDATE public.trainer_profiles 
    SET %I = COALESCE(%I, 0) + 1 
    WHERE id = $1
  ', stat_name, stat_name)
  USING trainer_id;
END;
$$;

-- 4. Fix increment_message_counters function
CREATE OR REPLACE FUNCTION public.increment_message_counters(contact_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_sent TIMESTAMP WITH TIME ZONE;
  messages_today INTEGER;
  messages_week INTEGER;
BEGIN
  -- CRITICAL: Validate caller owns this contact
  IF NOT EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE id = contact_id AND trainer_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: contact not found or not owned by caller';
  END IF;

  -- Get current counters
  SELECT last_message_sent_at, messages_sent_today, messages_sent_this_week
  INTO last_sent, messages_today, messages_week
  FROM public.contacts
  WHERE id = contact_id;

  -- Reset daily counter if last message was not today
  IF last_sent IS NULL OR DATE(last_sent) < CURRENT_DATE THEN
    messages_today := 0;
  END IF;

  -- Reset weekly counter if last message was more than 7 days ago
  IF last_sent IS NULL OR (CURRENT_DATE - DATE(last_sent)) >= 7 THEN
    messages_week := 0;
  END IF;

  -- Increment counters
  UPDATE public.contacts
  SET 
    messages_sent_today = messages_today + 1,
    messages_sent_this_week = messages_week + 1,
    last_message_sent_at = NOW()
  WHERE id = contact_id;
END;
$$;

-- 5. Enable RLS on unprotected tables
ALTER TABLE public.test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_backups ENABLE ROW LEVEL SECURITY;

-- Add restrictive policies (system/admin only)
CREATE POLICY "Only service role can access test_suites"
ON public.test_suites
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can access security_audits"
ON public.security_audits
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can access data_backups"
ON public.data_backups
FOR ALL
USING (auth.role() = 'service_role');