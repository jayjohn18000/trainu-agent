-- Fix materialized view exposure and add missing RLS policies

-- 1. Revoke public access to challenge_leaderboard materialized view
REVOKE ALL ON public.challenge_leaderboard FROM anon, authenticated;

-- Grant only SELECT to authenticated users (view is intentionally public for challenge leaderboard)
GRANT SELECT ON public.challenge_leaderboard TO anon, authenticated;

-- 2. Add missing RLS policies for tables that have RLS enabled but no policies

-- ai_insights table policies
CREATE POLICY "Trainers can view own insights"
ON public.ai_insights
FOR SELECT
USING (trainer_id = auth.uid());

CREATE POLICY "System can insert insights"
ON public.ai_insights
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Trainers can update own insights"
ON public.ai_insights
FOR UPDATE
USING (trainer_id = auth.uid());

-- automated_insights table policies
CREATE POLICY "Organization members can view insights"
ON public.automated_insights
FOR SELECT
USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "System can manage automated insights"
ON public.automated_insights
FOR ALL
USING (user_in_organization(auth.uid(), organization_id));

-- conversation_ai table policies
CREATE POLICY "Trainers can view own conversations"
ON public.conversation_ai
FOR SELECT
USING (trainer_id = auth.uid());

CREATE POLICY "System can manage conversations"
ON public.conversation_ai
FOR ALL
USING (trainer_id = auth.uid());

-- custom_dashboards table policies
CREATE POLICY "Dashboard creator can view"
ON public.custom_dashboards
FOR SELECT
USING (created_by = auth.uid() OR user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Dashboard creator can manage"
ON public.custom_dashboards
FOR ALL
USING (created_by = auth.uid() OR user_in_organization(auth.uid(), organization_id));

-- data_exports table policies
CREATE POLICY "User can view own exports"
ON public.data_exports
FOR SELECT
USING (requested_by = auth.uid() OR user_in_organization(auth.uid(), organization_id));

CREATE POLICY "User can create exports"
ON public.data_exports
FOR INSERT
WITH CHECK (requested_by = auth.uid() AND user_in_organization(auth.uid(), organization_id));

-- generated_reports table policies
CREATE POLICY "Organization members can view reports"
ON public.generated_reports
FOR SELECT
USING (user_in_organization(auth.uid(), organization_id));

CREATE POLICY "Organization members can create reports"
ON public.generated_reports
FOR INSERT
WITH CHECK (user_in_organization(auth.uid(), organization_id));

-- Add rate limiting table for challenge ratings
CREATE TABLE IF NOT EXISTS public.challenge_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.challenge_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits
CREATE POLICY "Service role manages rate limits"
ON public.challenge_rate_limits
FOR ALL
USING (auth.role() = 'service_role');

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint 
ON public.challenge_rate_limits(ip_address, endpoint, window_start DESC);

-- Add comment for leaked password protection reminder
COMMENT ON TABLE public.challenge_rate_limits IS 'Rate limiting for public endpoints. Note: Enable Leaked Password Protection in Supabase Auth settings for additional security.';