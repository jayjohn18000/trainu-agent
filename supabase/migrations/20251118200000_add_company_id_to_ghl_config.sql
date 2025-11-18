-- Add company_id field to ghl_config if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ghl_config' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.ghl_config ADD COLUMN company_id TEXT;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.ghl_config.company_id IS 'GHL Company/Agency ID from OAuth';

