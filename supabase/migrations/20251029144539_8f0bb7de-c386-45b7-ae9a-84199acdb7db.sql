-- Create GHL configuration table
CREATE TABLE IF NOT EXISTS public.ghl_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  location_id TEXT NOT NULL,
  default_channel TEXT DEFAULT 'both' CHECK (default_channel IN ('sms', 'email', 'both')),
  sms_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  contact_field_mapping JSONB DEFAULT '{"firstName": "first_name", "lastName": "last_name", "email": "email", "phone": "phone"}'::jsonb,
  webhook_registered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trainer_id)
);

-- Enable RLS
ALTER TABLE public.ghl_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Trainers can view own GHL config"
  ON public.ghl_config FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own GHL config"
  ON public.ghl_config FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own GHL config"
  ON public.ghl_config FOR UPDATE
  USING (auth.uid() = trainer_id);

-- Add GHL message tracking to activity_feed
ALTER TABLE public.activity_feed
ADD COLUMN IF NOT EXISTS ghl_message_id TEXT,
ADD COLUMN IF NOT EXISTS ghl_status TEXT,
ADD COLUMN IF NOT EXISTS ghl_channel TEXT,
ADD COLUMN IF NOT EXISTS ghl_delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ghl_read_at TIMESTAMP WITH TIME ZONE;

-- Update trigger for ghl_config
CREATE TRIGGER update_ghl_config_updated_at
  BEFORE UPDATE ON public.ghl_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();