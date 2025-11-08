-- Extend ghl_config table with DFY tracking fields
ALTER TABLE public.ghl_config
  ALTER COLUMN location_id DROP NOT NULL;

ALTER TABLE public.ghl_config
  ADD COLUMN IF NOT EXISTS setup_type TEXT DEFAULT 'managed' CHECK (setup_type IN ('managed')),
  ADD COLUMN IF NOT EXISTS provisioning_status TEXT DEFAULT 'pending' CHECK (provisioning_status IN ('pending', 'provisioning', 'active', 'failed')),
  ADD COLUMN IF NOT EXISTS provisioned_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS provisioned_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Index for querying pending requests
CREATE INDEX IF NOT EXISTS idx_ghl_config_status ON public.ghl_config(provisioning_status);

-- Create dfy_requests table
CREATE TABLE IF NOT EXISTS public.dfy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  current_ghl_account TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trainer_id)
);

-- Enable RLS on dfy_requests
ALTER TABLE public.dfy_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dfy_requests
CREATE POLICY "Trainers can view own DFY request"
  ON public.dfy_requests FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create own DFY request"
  ON public.dfy_requests FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own DFY request"
  ON public.dfy_requests FOR UPDATE
  USING (auth.uid() = trainer_id);

-- Service role can manage all DFY requests
CREATE POLICY "Service role can manage all DFY requests"
  ON public.dfy_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Add updated_at trigger for dfy_requests
CREATE TRIGGER update_dfy_requests_updated_at
  BEFORE UPDATE ON public.dfy_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();