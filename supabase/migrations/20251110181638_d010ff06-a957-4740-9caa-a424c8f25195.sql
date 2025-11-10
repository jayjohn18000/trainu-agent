
-- Fix Security Definer View: Recreate ghl_sync_health without SECURITY DEFINER
DROP VIEW IF EXISTS public.ghl_sync_health;

CREATE VIEW public.ghl_sync_health 
WITH (security_invoker=true) AS
SELECT 
  gc.trainer_id,
  gc.location_id,
  gc.last_sync_at,
  gc.last_sync_status,
  gc.last_sync_error,
  gc.contacts_synced,
  gc.conversations_synced,
  gc.appointments_synced,
  gc.total_sync_count,
  CASE 
    WHEN gc.last_sync_at IS NULL THEN 'never_synced'
    WHEN gc.last_sync_at < NOW() - INTERVAL '2 hours' THEN 'stale'
    WHEN gc.last_sync_status = 'error' THEN 'error'
    ELSE 'healthy'
  END as health_status
FROM public.ghl_config gc
WHERE gc.trainer_id = auth.uid();

-- Add RLS policies for ab_test_events
CREATE POLICY "Trainers can view own test events"
ON public.ab_test_events
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ab_test_performance p
  JOIN public.ab_test_assignments a ON p.assignment_id = a.id
  JOIN public.ab_tests t ON a.test_id = t.id
  WHERE p.id = ab_test_events.performance_id
  AND t.trainer_id = auth.uid()
));

CREATE POLICY "System can insert test events"
ON public.ab_test_events
FOR INSERT
WITH CHECK (true);

-- Add RLS policies for ab_test_performance
CREATE POLICY "Trainers can view own test performance"
ON public.ab_test_performance
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ab_tests t
  JOIN public.ab_test_assignments a ON t.id = a.test_id
  WHERE a.id = ab_test_performance.assignment_id
  AND t.trainer_id = auth.uid()
));

CREATE POLICY "System can manage test performance"
ON public.ab_test_performance
FOR ALL
USING (true)
WITH CHECK (true);
