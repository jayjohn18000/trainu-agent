-- Fix security warnings by setting search_path on functions

-- Update the update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update the handle_new_trainer function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_trainer()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trainer_profiles (id)
  VALUES (NEW.id);
  
  INSERT INTO public.agent_status (trainer_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;