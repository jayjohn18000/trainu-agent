-- Add conflict tracking and performance metrics
ALTER TABLE ghl_config ADD COLUMN IF NOT EXISTS webhook_url text;
ALTER TABLE ghl_config ADD COLUMN IF NOT EXISTS webhook_secret text;
ALTER TABLE ghl_config ADD COLUMN IF NOT EXISTS avg_sync_duration_ms integer DEFAULT 0;
ALTER TABLE ghl_config ADD COLUMN IF NOT EXISTS sync_throughput_per_min numeric DEFAULT 0;
ALTER TABLE ghl_config ADD COLUMN IF NOT EXISTS conflict_count integer DEFAULT 0;

-- Create sync conflicts table
CREATE TABLE IF NOT EXISTS ghl_sync_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  trainu_data jsonb NOT NULL,
  ghl_data jsonb NOT NULL,
  trainu_updated_at timestamptz NOT NULL,
  ghl_updated_at timestamptz NOT NULL,
  resolution_strategy text DEFAULT 'manual',
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- RLS for sync conflicts
ALTER TABLE ghl_sync_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own conflicts"
  ON ghl_sync_conflicts FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own conflicts"
  ON ghl_sync_conflicts FOR UPDATE
  USING (auth.uid() = trainer_id);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS ghl_sync_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type text NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  duration_ms integer,
  records_processed integer DEFAULT 0,
  records_succeeded integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  throughput_per_min numeric,
  error_details jsonb
);

-- RLS for sync metrics
ALTER TABLE ghl_sync_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own metrics"
  ON ghl_sync_metrics FOR SELECT
  USING (auth.uid() = trainer_id);

-- System can insert metrics
CREATE POLICY "System can insert metrics"
  ON ghl_sync_metrics FOR INSERT
  WITH CHECK (auth.role() = 'service_role');