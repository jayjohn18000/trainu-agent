-- Create function to increment message counters for frequency cap tracking
CREATE OR REPLACE FUNCTION public.increment_message_counters(contact_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_sent timestamp with time zone;
  messages_today integer;
  messages_week integer;
BEGIN
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
$$;