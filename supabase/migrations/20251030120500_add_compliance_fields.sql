-- TrainU: Add compliance fields to ghl_config

-- Quiet hours as time-of-day (local policy); caps as integers
ALTER TABLE IF EXISTS public.ghl_config
  ADD COLUMN IF NOT EXISTS quiet_hours_start time,
  ADD COLUMN IF NOT EXISTS quiet_hours_end time,
  ADD COLUMN IF NOT EXISTS frequency_cap_daily int DEFAULT 5,
  ADD COLUMN IF NOT EXISTS frequency_cap_weekly int DEFAULT 20;


