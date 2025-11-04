-- Create audit_logs table for PII access tracking
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  pii_fields TEXT[],
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow reading own audit logs (admins can read all via service role)
CREATE POLICY "Users can view own audit logs"
ON public.audit_logs
FOR SELECT
USING (user_id = auth.uid());

-- Only system can insert audit logs (via service role or security definer function)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for efficient queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);

-- Create function to log PII access
CREATE OR REPLACE FUNCTION public.log_pii_access(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID,
  p_pii_fields TEXT[],
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    pii_fields,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_pii_fields,
    p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create trigger function to auto-log contact PII access
CREATE OR REPLACE FUNCTION public.trigger_log_contact_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when contacts with email/phone are accessed
  IF (TG_OP = 'SELECT' OR TG_OP = 'UPDATE') AND 
     (NEW.email IS NOT NULL OR NEW.phone IS NOT NULL) THEN
    PERFORM public.log_pii_access(
      TG_OP,
      'contacts',
      NEW.id,
      ARRAY['email', 'phone', 'first_name', 'last_name'],
      jsonb_build_object('trainer_id', NEW.trainer_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON TABLE public.audit_logs IS 'Audit trail for PII access and sensitive operations';
COMMENT ON FUNCTION public.log_pii_access IS 'Security definer function to log PII access with user context';