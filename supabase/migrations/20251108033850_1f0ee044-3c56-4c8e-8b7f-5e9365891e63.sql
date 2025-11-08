-- Add missing columns to existing message_templates table
ALTER TABLE public.message_templates 
  ADD COLUMN IF NOT EXISTS template_id TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'email'));

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'message_templates_trainer_id_template_id_key'
  ) THEN
    ALTER TABLE public.message_templates 
      ADD CONSTRAINT message_templates_trainer_id_template_id_key 
      UNIQUE(trainer_id, template_id);
  END IF;
END $$;