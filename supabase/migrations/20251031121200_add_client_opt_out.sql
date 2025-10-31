-- Add client STOP/opt-out fields
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    ALTER TABLE public.clients
      ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS opt_out_reason TEXT;
  END IF;
END $$;


