-- ========================================
-- SECURITY FIX: Add user_in_organization function
-- Prevents recursive RLS issues in organization isolation
-- ========================================

-- Create SECURITY DEFINER function to check organization membership
-- This prevents recursive RLS issues when policies query organization_users
CREATE OR REPLACE FUNCTION public.user_in_organization(
  _user_id UUID,
  _organization_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_users
    WHERE user_id = _user_id
      AND organization_id = _organization_id
      AND status = 'active'
  )
$$;

-- ========================================
-- Update RLS policies to use the new function
-- ========================================

-- Drop existing recursive policies
DROP POLICY IF EXISTS organizations_isolation ON public.organizations;
DROP POLICY IF EXISTS org_users_isolation ON public.organization_users;
DROP POLICY IF EXISTS roles_isolation ON public.roles;
DROP POLICY IF EXISTS api_keys_isolation ON public.api_keys;
DROP POLICY IF EXISTS nlp_isolation ON public.nlp_analyses;
DROP POLICY IF EXISTS smart_content_isolation ON public.smart_content;
DROP POLICY IF EXISTS integrations_isolation ON public.integrations;
DROP POLICY IF EXISTS business_metrics_isolation ON public.business_metrics;

-- Recreate policies using the SECURITY DEFINER function
CREATE POLICY organizations_isolation ON public.organizations
  FOR ALL 
  USING (public.user_in_organization(auth.uid(), id));

CREATE POLICY org_users_isolation ON public.organization_users
  FOR ALL 
  USING (public.user_in_organization(auth.uid(), organization_id));

CREATE POLICY roles_isolation ON public.roles
  FOR ALL 
  USING (public.user_in_organization(auth.uid(), organization_id));

CREATE POLICY api_keys_isolation ON public.api_keys
  FOR ALL 
  USING (public.user_in_organization(auth.uid(), organization_id));

CREATE POLICY nlp_isolation ON public.nlp_analyses
  FOR ALL 
  USING (public.user_in_organization(auth.uid(), organization_id));

CREATE POLICY smart_content_isolation ON public.smart_content
  FOR ALL 
  USING (public.user_in_organization(auth.uid(), organization_id));

CREATE POLICY integrations_isolation ON public.integrations
  FOR ALL 
  USING (public.user_in_organization(auth.uid(), organization_id));

CREATE POLICY business_metrics_isolation ON public.business_metrics
  FOR ALL 
  USING (public.user_in_organization(auth.uid(), organization_id));