-- Add ghl_calendars JSONB column to store all calendar metadata
ALTER TABLE ghl_config 
ADD COLUMN IF NOT EXISTS ghl_calendars JSONB DEFAULT '[]';

COMMENT ON COLUMN ghl_config.ghl_calendars IS 'Array of all GHL calendars: [{id, name, duration, type}, ...]';