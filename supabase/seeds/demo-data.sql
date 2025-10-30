-- TrainU Demo Seed Data
-- Adjust TRAINER_ID to your current authenticated user for best results.

\set TRAINER_ID '00000000-0000-0000-0000-000000000001'

-- Contacts
INSERT INTO public.contacts (trainer_id, ghl_contact_id, first_name, last_name, email, phone, tags, consent_status)
VALUES
  (:TRAINER_ID, 'ghl_c_1', 'Ava', 'Reed', 'ava@example.com', '+15550000001', ARRAY['vip'], 'active'),
  (:TRAINER_ID, 'ghl_c_2', 'Ben', 'Lopez', 'ben@example.com', '+15550000002', ARRAY['new'], 'active'),
  (:TRAINER_ID, 'ghl_c_3', 'Cara', 'Nguyen', 'cara@example.com', '+15550000003', ARRAY['at-risk'], 'active'),
  (:TRAINER_ID, 'ghl_c_4', 'Drew', 'Singh', 'drew@example.com', '+15550000004', ARRAY['optout'], 'opted_out'),
  (:TRAINER_ID, 'ghl_c_5', 'Elle', 'Kim', 'elle@example.com', '+15550000005', ARRAY['consistent'], 'active')
ON CONFLICT DO NOTHING;

-- Bookings (past and upcoming)
WITH c AS (
  SELECT id, first_name FROM public.contacts WHERE trainer_id = :TRAINER_ID
)
INSERT INTO public.bookings (trainer_id, contact_id, ghl_appointment_id, scheduled_at, status, session_type, notes)
SELECT :TRAINER_ID, id, 'ghl_a_'||substr(id::text,1,8),
       CASE first_name
         WHEN 'Ava' THEN now() + interval '1 day'
         WHEN 'Ben' THEN now() - interval '2 days'
         WHEN 'Cara' THEN now() - interval '7 days'
         WHEN 'Drew' THEN now() + interval '2 days'
         ELSE now() + interval '3 days'
       END,
       CASE first_name
         WHEN 'Ben' THEN 'completed'
         WHEN 'Cara' THEN 'cancelled'
         ELSE 'scheduled'
       END::booking_status,
       'Personal Training',
       'Seeded booking'
FROM c
ON CONFLICT DO NOTHING;

-- Insights (risk: low to high)
WITH c AS (
  SELECT id, first_name FROM public.contacts WHERE trainer_id = :TRAINER_ID
)
INSERT INTO public.insights (trainer_id, contact_id, risk_score, last_activity_at, total_sessions, missed_sessions, response_rate, current_streak, engagement_score)
SELECT :TRAINER_ID, id,
       CASE first_name
         WHEN 'Ava' THEN 18
         WHEN 'Ben' THEN 35
         WHEN 'Cara' THEN 92
         WHEN 'Drew' THEN 78
         ELSE 55
       END,
       now() - interval '1 day',
       10, 1, 80.0, 4, 72.5
FROM c
ON CONFLICT DO NOTHING;

-- Messages (mix of drafts with varying confidence)
WITH c AS (
  SELECT id, first_name FROM public.contacts WHERE trainer_id = :TRAINER_ID
)
INSERT INTO public.messages (trainer_id, contact_id, status, content, channel, confidence, why_reasons, scheduled_for)
SELECT :TRAINER_ID, id,
       'draft',
       CASE first_name
         WHEN 'Ava' THEN 'Great work lately! Want to lock in your next session?'
         WHEN 'Ben' THEN 'Nice session this week. Ready to push the next milestone?'
         WHEN 'Cara' THEN 'We missed you last week—want help rescheduling?'
         WHEN 'Drew' THEN 'Quick check-in: how are you feeling about workouts this week?'
         ELSE 'Congrats on your consistency! Up for a new challenge?'
       END,
       'sms',
       CASE first_name
         WHEN 'Ava' THEN 0.92
         WHEN 'Ben' THEN 0.85
         WHEN 'Cara' THEN 0.65
         WHEN 'Drew' THEN 0.40
         ELSE 0.78
       END,
       ARRAY['recent activity','goal alignment','tone fit'],
       CASE first_name
         WHEN 'Drew' THEN (date_trunc('day', now()) + time '08:00')
         ELSE NULL
       END
FROM c
ON CONFLICT DO NOTHING;

-- Feature flags defaults
INSERT INTO public.feature_flags (trainer_id, flag_name, enabled)
VALUES
  (:TRAINER_ID, 'ai_drafts_on', true),
  (:TRAINER_ID, 'approve_all_safe_on', true),
  (:TRAINER_ID, 'digest_on', false),
  (:TRAINER_ID, 'streaks_on', true)
ON CONFLICT (trainer_id, flag_name) DO NOTHING;


