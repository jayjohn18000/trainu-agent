-- Add last_sync_at to ghl_config if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ghl_config' 
    AND column_name = 'last_sync_at'
  ) THEN
    ALTER TABLE public.ghl_config ADD COLUMN last_sync_at TIMESTAMPTZ;
  END IF;
END $$;