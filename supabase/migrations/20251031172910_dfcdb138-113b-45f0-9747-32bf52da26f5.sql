-- Add missing columns to ghl_config table
ALTER TABLE public.ghl_config 
ADD COLUMN IF NOT EXISTS booking_widget_id text,
ADD COLUMN IF NOT EXISTS templates jsonb DEFAULT '{}'::jsonb;