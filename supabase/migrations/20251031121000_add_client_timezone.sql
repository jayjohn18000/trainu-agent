-- Add client timezone for quiet-hours (client-local)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    ALTER TABLE public.clients
      ADD COLUMN IF NOT EXISTS timezone TEXT;
  END IF;
END $$;


