-- Add RLS policies for 7 enterprise tables
-- These tables have RLS enabled but no policies, blocking all access

-- 1. Integration Events - Users can view events for integrations in their organizations
CREATE POLICY "Users can view organization integration events"
  ON public.integration_events FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.integrations
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_users
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "System can insert integration events"
  ON public.integration_events FOR INSERT
  WITH CHECK (true);

-- 2. Integration Messages - Users can manage messages in their organizations
CREATE POLICY "Users can view organization integration messages"
  ON public.integration_messages FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert organization integration messages"
  ON public.integration_messages FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update organization integration messages"
  ON public.integration_messages FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 3. Webhook Events - Users can view webhook events for their organization's integrations
CREATE POLICY "Users can view organization webhook events"
  ON public.webhook_events FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.integrations
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_users
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "System can manage webhook events"
  ON public.webhook_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Organization Invitations - Users can manage invitations for their organizations
CREATE POLICY "Users can view organization invitations"
  ON public.organization_invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create organization invitations"
  ON public.organization_invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update organization invitations"
  ON public.organization_invitations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete organization invitations"
  ON public.organization_invitations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 5. Report Templates - Users can manage report templates in their organizations
CREATE POLICY "Users can view organization report templates"
  ON public.report_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create organization report templates"
  ON public.report_templates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update organization report templates"
  ON public.report_templates FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete organization report templates"
  ON public.report_templates FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 6. Subscription Usage - Users can view subscription usage for their organizations
CREATE POLICY "Users can view organization subscription usage"
  ON public.subscription_usage FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "System can manage subscription usage"
  ON public.subscription_usage FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. Sync Jobs - Users can view sync jobs for their organization's integrations
CREATE POLICY "Users can view organization sync jobs"
  ON public.sync_jobs FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.integrations
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_users
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "System can manage sync jobs"
  ON public.sync_jobs FOR ALL
  USING (true)
  WITH CHECK (true);