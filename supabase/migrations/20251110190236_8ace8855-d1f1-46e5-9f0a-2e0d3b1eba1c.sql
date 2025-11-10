-- Fix mutable search_path in SECURITY DEFINER functions
-- These functions need fixed search_path to prevent search_path hijacking attacks

-- Fix increment_trainer_stat
CREATE OR REPLACE FUNCTION public.increment_trainer_stat(trainer_id uuid, stat_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- CRITICAL: Validate caller owns this trainer_id
  IF trainer_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: cannot modify other trainers stats';
  END IF;
  
  -- Whitelist allowed stat names to prevent column injection
  IF stat_name NOT IN ('messages_sent', 'clients_added', 'sessions_completed') THEN
    RAISE EXCEPTION 'Invalid stat name: %', stat_name;
  END IF;
  
  EXECUTE format('
    UPDATE public.trainer_profiles 
    SET %I = COALESCE(%I, 0) + 1 
    WHERE id = $1
  ', stat_name, stat_name)
  USING trainer_id;
END;
$function$;

-- Fix increment_message_counters
CREATE OR REPLACE FUNCTION public.increment_message_counters(contact_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  last_sent TIMESTAMP WITH TIME ZONE;
  messages_today INTEGER;
  messages_week INTEGER;
BEGIN
  -- CRITICAL: Validate caller owns this contact
  IF NOT EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE id = contact_id AND trainer_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: contact not found or not owned by caller';
  END IF;

  -- Get current counters
  SELECT last_message_sent_at, messages_sent_today, messages_sent_this_week
  INTO last_sent, messages_today, messages_week
  FROM public.contacts
  WHERE id = contact_id;

  -- Reset daily counter if last message was not today
  IF last_sent IS NULL OR DATE(last_sent) < CURRENT_DATE THEN
    messages_today := 0;
  END IF;

  -- Reset weekly counter if last message was more than 7 days ago
  IF last_sent IS NULL OR (CURRENT_DATE - DATE(last_sent)) >= 7 THEN
    messages_week := 0;
  END IF;

  -- Increment counters
  UPDATE public.contacts
  SET 
    messages_sent_today = messages_today + 1,
    messages_sent_this_week = messages_week + 1,
    last_message_sent_at = NOW()
  WHERE id = contact_id;
END;
$function$;

-- Fix handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, onboarding_completed)
  VALUES (NEW.id, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix queue_contact_sync
CREATE OR REPLACE FUNCTION public.queue_contact_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix queue_booking_sync
CREATE OR REPLACE FUNCTION public.queue_booking_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;