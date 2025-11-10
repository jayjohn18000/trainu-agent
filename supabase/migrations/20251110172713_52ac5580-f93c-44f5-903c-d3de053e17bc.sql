-- Add sync statistics columns to ghl_config
ALTER TABLE public.ghl_config 
ADD COLUMN IF NOT EXISTS last_sync_status TEXT,
ADD COLUMN IF NOT EXISTS last_sync_error TEXT,
ADD COLUMN IF NOT EXISTS contacts_synced INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversations_synced INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS appointments_synced INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sync_count INTEGER DEFAULT 0;

-- Create index for faster sync status queries
CREATE INDEX IF NOT EXISTS idx_ghl_config_last_sync ON public.ghl_config(last_sync_at DESC);

-- Create a view for sync health monitoring
CREATE OR REPLACE VIEW public.ghl_sync_health AS
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
    WHEN gc.last_sync_status = 'error' THEN 'error'
    WHEN gc.last_sync_at < NOW() - INTERVAL '1 hour' THEN 'stale'
    WHEN gc.last_sync_at < NOW() - INTERVAL '35 minutes' THEN 'warning'
    ELSE 'healthy'
  END as health_status
FROM public.ghl_config gc;