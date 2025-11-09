-- Add RLS policies for admin role to manage DFY requests and GHL configs

-- Allow admins to manage all DFY requests
CREATE POLICY "Admins can manage all DFY requests"
ON public.dfy_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to manage all GHL configs  
CREATE POLICY "Admins can manage all GHL configs"
ON public.ghl_config
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);