-- Fix overly permissive system table RLS policies
-- Restrict to service role only to prevent billing fraud and data manipulation

-- 1. ab_test_performance
DROP POLICY "System can manage test performance" ON public.ab_test_performance;

CREATE POLICY "Service role can manage test performance"
  ON public.ab_test_performance FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. webhook_events
DROP POLICY "System can manage webhook events" ON public.webhook_events;

CREATE POLICY "Service role can manage webhook events"
  ON public.webhook_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. subscription_usage
DROP POLICY "System can manage subscription usage" ON public.subscription_usage;

CREATE POLICY "Service role can manage subscription usage"
  ON public.subscription_usage FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. sync_jobs
DROP POLICY "System can manage sync jobs" ON public.sync_jobs;

CREATE POLICY "Service role can manage sync jobs"
  ON public.sync_jobs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');