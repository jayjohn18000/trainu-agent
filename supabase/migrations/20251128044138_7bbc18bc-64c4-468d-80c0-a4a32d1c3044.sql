-- Add streak tracking columns to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMP WITH TIME ZONE;