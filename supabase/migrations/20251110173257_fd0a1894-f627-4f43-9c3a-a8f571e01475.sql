-- Add sync tracking columns to prevent infinite loops
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS sync_source TEXT DEFAULT 'trainu',
ADD COLUMN IF NOT EXISTS last_synced_to_ghl_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS sync_source TEXT DEFAULT 'trainu',
ADD COLUMN IF NOT EXISTS last_synced_to_ghl_at TIMESTAMP WITH TIME ZONE;

-- Create a queue table for bidirectional sync operations
CREATE TABLE IF NOT EXISTS public.ghl_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'contact' or 'booking'
  entity_id UUID NOT NULL,
  operation TEXT NOT NULL, -- 'create', 'update', 'delete'
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on sync queue
ALTER TABLE public.ghl_sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for sync queue
CREATE POLICY "Trainers can view own sync queue"
  ON public.ghl_sync_queue
  FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "System can manage sync queue"
  ON public.ghl_sync_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ghl_sync_queue_status ON public.ghl_sync_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_ghl_sync_queue_trainer ON public.ghl_sync_queue(trainer_id);

-- Function to queue contact changes for GHL sync
CREATE OR REPLACE FUNCTION queue_contact_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if this change originated from TrainU (not from GHL sync)
  IF (TG_OP = 'INSERT' AND NEW.sync_source = 'trainu') OR 
     (TG_OP = 'UPDATE' AND NEW.sync_source = 'trainu' AND 
      (OLD.first_name IS DISTINCT FROM NEW.first_name OR
       OLD.last_name IS DISTINCT FROM NEW.last_name OR
       OLD.email IS DISTINCT FROM NEW.email OR
       OLD.phone IS DISTINCT FROM NEW.phone OR
       OLD.tags IS DISTINCT FROM NEW.tags)) THEN
    
    INSERT INTO public.ghl_sync_queue (
      trainer_id,
      entity_type,
      entity_id,
      operation,
      payload
    ) VALUES (
      NEW.trainer_id,
      'contact',
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END,
      jsonb_build_object(
        'ghl_contact_id', NEW.ghl_contact_id,
        'first_name', NEW.first_name,
        'last_name', NEW.last_name,
        'email', NEW.email,
        'phone', NEW.phone,
        'tags', NEW.tags
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue booking changes for GHL sync
CREATE OR REPLACE FUNCTION queue_booking_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if this change originated from TrainU (not from GHL sync)
  IF (TG_OP = 'INSERT' AND NEW.sync_source = 'trainu') OR 
     (TG_OP = 'UPDATE' AND NEW.sync_source = 'trainu' AND 
      (OLD.scheduled_at IS DISTINCT FROM NEW.scheduled_at OR
       OLD.status IS DISTINCT FROM NEW.status OR
       OLD.notes IS DISTINCT FROM NEW.notes)) THEN
    
    INSERT INTO public.ghl_sync_queue (
      trainer_id,
      entity_type,
      entity_id,
      operation,
      payload
    ) VALUES (
      NEW.trainer_id,
      'booking',
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END,
      jsonb_build_object(
        'ghl_appointment_id', NEW.ghl_appointment_id,
        'contact_id', NEW.contact_id,
        'scheduled_at', NEW.scheduled_at,
        'status', NEW.status,
        'session_type', NEW.session_type,
        'notes', NEW.notes
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for bidirectional sync
DROP TRIGGER IF EXISTS trigger_queue_contact_sync ON public.contacts;
CREATE TRIGGER trigger_queue_contact_sync
  AFTER INSERT OR UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION queue_contact_sync();

DROP TRIGGER IF EXISTS trigger_queue_booking_sync ON public.bookings;
CREATE TRIGGER trigger_queue_booking_sync
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION queue_booking_sync();