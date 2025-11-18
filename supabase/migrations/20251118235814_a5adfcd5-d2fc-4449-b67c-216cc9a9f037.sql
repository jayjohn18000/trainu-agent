-- Add OAuth token columns to ghl_config
ALTER TABLE public.ghl_config
  ADD COLUMN IF NOT EXISTS access_token TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS company_id TEXT,
  ADD COLUMN IF NOT EXISTS primary_user_id TEXT;

-- Add index for token expiration lookups
CREATE INDEX IF NOT EXISTS idx_ghl_config_token_expires 
  ON public.ghl_config(token_expires_at)
  WHERE token_expires_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.ghl_config.access_token IS 'GHL OAuth access token';
COMMENT ON COLUMN public.ghl_config.refresh_token IS 'GHL OAuth refresh token';
COMMENT ON COLUMN public.ghl_config.token_expires_at IS 'When the access token expires';
COMMENT ON COLUMN public.ghl_config.company_id IS 'GHL company ID';
COMMENT ON COLUMN public.ghl_config.primary_user_id IS 'GHL primary user ID';