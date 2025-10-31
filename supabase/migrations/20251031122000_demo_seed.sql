-- Demo seed data (only run when DEMO_MODE flag is enabled)
-- This should be conditionally executed via Lovable's seeding mechanism

-- Check if demo mode is enabled (via environment variable or config)
DO $$
DECLARE
  demo_enabled BOOLEAN;
BEGIN
  -- Try to get from app config or default to false
  -- In production, this should check VITE_DATA_PROVIDER=mock or DEMO_MODE flag
  demo_enabled := COALESCE(current_setting('app.demo_mode', true)::boolean, false);
  
  -- For safety, also check if we're in a preview/dev environment
  -- In Lovable, this can be controlled via environment variables
  
  IF NOT demo_enabled THEN
    RETURN;
  END IF;

  -- Seed sample clients (only if table exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    INSERT INTO public.clients (trainer_id, name, email, phone, status, risk, tags, ghl_contact_id, timezone, opt_out)
    SELECT
      auth.uid() as trainer_id,
      names.name,
      LOWER(REPLACE(names.name, ' ', '.')) || '@example.com' as email,
      '+1' || LPAD((ROW_NUMBER() OVER () + 5550000000)::TEXT, 10, '0') as phone,
      CASE (ROW_NUMBER() OVER () % 3)
        WHEN 0 THEN 'active'
        WHEN 1 THEN 'churnRisk'
        ELSE 'paused'
      END as status,
      (ROW_NUMBER() OVER () % 100) as risk,
      ARRAY['Morning Group', 'Night Warriors'][1 + (ROW_NUMBER() OVER () % 2)]::TEXT[] as tags,
      'mock_ghl_' || gen_random_uuid()::TEXT as ghl_contact_id,
      'America/New_York' as timezone,
      false as opt_out
    FROM (
      SELECT unnest(ARRAY['Alex Johnson', 'Sarah Wilson', 'Mike Chen', 'Emma Davis', 'Jordan Lee', 'Taylor Brown']) as name
    ) names
    WHERE NOT EXISTS (SELECT 1 FROM public.clients WHERE trainer_id = auth.uid() LIMIT 1)
    LIMIT 6;
  END IF;

  -- Seed sample drafts
  INSERT INTO public.drafts (trainer_id, client_id, channel, body, status, scheduled_at, metadata)
  SELECT
    auth.uid(),
    (SELECT id FROM public.clients WHERE trainer_id = auth.uid() LIMIT 1 OFFSET (ROW_NUMBER() OVER () % 6)),
    'sms' as channel,
    bodies.body,
    CASE (ROW_NUMBER() OVER () % 4)
      WHEN 0 THEN 'pending'
      WHEN 1 THEN 'approved'
      WHEN 2 THEN 'scheduled'
      ELSE 'sent'
    END as status,
    CASE 
      WHEN ROW_NUMBER() OVER () % 4 = 2 THEN now() + INTERVAL '1 day'
      ELSE NULL
    END as scheduled_at,
    jsonb_build_object('source', 'demo', 'confidence', 0.75 + (random() * 0.2))
  FROM (
    SELECT unnest(ARRAY[
      'Hey, quick check-in — how did your workout go?',
      'Can you confirm your session tomorrow at 10am?',
      'Missed you last time. Everything okay?',
      'Great progress this week! Keep it up.'
    ]) as body
  ) bodies
  WHERE EXISTS (SELECT 1 FROM public.clients WHERE trainer_id = auth.uid() LIMIT 1)
  LIMIT 4;

  -- Seed saved queries
  INSERT INTO public.saved_queries (trainer_id, name, dsl_json, starred)
  VALUES
    (
      auth.uid(),
      'Active Clients',
      jsonb_build_object(
        'table', 'clients',
        'metric', 'count',
        'filters', jsonb_build_array(
          jsonb_build_object('field', 'status', 'op', 'eq', 'value', 'active')
        )
      ),
      true
    ),
    (
      auth.uid(),
      'High Risk Clients',
      jsonb_build_object(
        'table', 'clients',
        'metric', 'count',
        'filters', jsonb_build_array(
          jsonb_build_object('field', 'risk', 'op', 'gte', 'value', 70)
        )
      ),
      false
    )
  ON CONFLICT DO NOTHING;

  -- Seed segments
  WITH morning_segment AS (
    INSERT INTO public.segments (trainer_id, name, description)
    VALUES (auth.uid(), 'Morning Group', 'Clients who prefer morning workouts')
    RETURNING id
  ),
  night_segment AS (
    INSERT INTO public.segments (trainer_id, name, description)
    VALUES (auth.uid(), 'Night Warriors', 'Evening workout enthusiasts')
    RETURNING id
  )
  INSERT INTO public.segment_rules (trainer_id, segment_id, name, dsl_json, schedule)
  SELECT
    auth.uid(),
    morning_segment.id,
    'Morning Filter',
    jsonb_build_object(
      'filters', jsonb_build_array(
        jsonb_build_object('field', 'tags', 'op', 'contains', 'value', 'Morning Group')
      )
    ),
    'daily'
  FROM morning_segment
  UNION ALL
  SELECT
    auth.uid(),
    night_segment.id,
    'Night Filter',
    jsonb_build_object(
      'filters', jsonb_build_array(
        jsonb_build_object('field', 'tags', 'op', 'contains', 'value', 'Night Warriors')
      )
    ),
    'daily'
  FROM night_segment
  ON CONFLICT DO NOTHING;

END $$;

