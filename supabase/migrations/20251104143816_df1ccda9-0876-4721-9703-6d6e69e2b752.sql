-- Day 3 Database Schema: A/B Testing, Advanced Analytics, Integration Enhancements, Performance Optimization

-- ================================================================
-- A/B TESTING FRAMEWORK TABLES
-- ================================================================

-- A/B Tests table
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('message_template', 'nudge_strategy', 'timing_optimization', 'campaign_format')),
  hypothesis TEXT NOT NULL,
  target_metrics JSONB DEFAULT '[]',
  sample_size_target INTEGER DEFAULT 100,
  significance_level DECIMAL(3,2) DEFAULT 0.05,
  test_duration_days INTEGER NOT NULL,
  target_audience JSONB DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'stopped', 'cancelled')) DEFAULT 'draft',
  trainer_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  winner_variant_id UUID,
  effect_size DECIMAL(5,4),
  
  CONSTRAINT ab_tests_duration_check CHECK (test_duration_days > 0 AND test_duration_days <= 365),
  CONSTRAINT ab_tests_sample_size_check CHECK (sample_size_target > 0),
  CONSTRAINT ab_tests_significance_check CHECK (significance_level > 0 AND significance_level < 1)
);

-- A/B Test Variants table
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  template_id UUID,
  strategy_config JSONB DEFAULT '{}',
  content_modifications JSONB DEFAULT '[]',
  traffic_split INTEGER NOT NULL CHECK (traffic_split > 0 AND traffic_split <= 100),
  variant_index INTEGER NOT NULL,
  is_control BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B Test Assignments table
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(test_id, client_id)
);

-- A/B Test Performance table
CREATE TABLE IF NOT EXISTS ab_test_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES ab_test_assignments(id) ON DELETE CASCADE,
  conversion_event BOOLEAN DEFAULT FALSE,
  click_event BOOLEAN DEFAULT FALSE,
  engagement_score DECIMAL(3,2),
  response_time_minutes INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B Test Events table
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_id UUID NOT NULL REFERENCES ab_test_performance(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'conversion', 'engagement')),
  event_value JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- ADVANCED ANALYTICS TABLES
-- ================================================================

-- Client Lifecycle Analytics
CREATE TABLE IF NOT EXISTS lifecycle_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL,
  current_stage TEXT NOT NULL CHECK (current_stage IN ('acquisition', 'onboarding', 'engagement', 'retention', 'churn_risk', 'reactivation')),
  stage_confidence DECIMAL(3,2) DEFAULT 0.0,
  days_in_stage INTEGER DEFAULT 0,
  risk_score DECIMAL(3,2) DEFAULT 0.0,
  engagement_score DECIMAL(3,2) DEFAULT 0.0,
  next_action_recommended TEXT,
  key_indicators JSONB DEFAULT '[]',
  predicted_churn_date DATE,
  lifecycle_metrics JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, trainer_id)
);

-- Predictive Insights
CREATE TABLE IF NOT EXISTS predictive_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('churn_risk', 'lifetime_value', 'engagement_score', 'referral_potential')),
  prediction_value DECIMAL(5,4) NOT NULL,
  confidence_level DECIMAL(3,2) NOT NULL,
  timeframe_days INTEGER NOT NULL,
  recommended_actions JSONB DEFAULT '[]',
  model_version TEXT DEFAULT 'v1.0',
  prediction_factors JSONB DEFAULT '{}',
  actual_outcome BOOLEAN,
  outcome_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT predictive_insights_confidence_check CHECK (confidence_level >= 0 AND confidence_level <= 1)
);

-- Trainer Performance Metrics
CREATE TABLE IF NOT EXISTS trainer_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  performance_period TEXT NOT NULL CHECK (performance_period IN ('daily', 'weekly', 'monthly', 'quarterly')),
  client_satisfaction_score DECIMAL(3,2),
  response_time_avg DECIMAL(8,2),
  automation_efficiency DECIMAL(5,2),
  retention_rate DECIMAL(5,2),
  engagement_improvement DECIMAL(5,2),
  revenue_per_client DECIMAL(10,2),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'declining', 'stable')) DEFAULT 'stable',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(trainer_id, performance_period, period_start, period_end)
);

-- Engagement Trends
CREATE TABLE IF NOT EXISTS engagement_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  date DATE NOT NULL,
  total_events INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  nudge_count INTEGER DEFAULT 0,
  meeting_count INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2),
  engagement_rate DECIMAL(5,2),
  breakdown JSONB DEFAULT '{}',
  
  UNIQUE(trainer_id, date)
);

-- ================================================================
-- INTEGRATION ENHANCEMENTS TABLES
-- ================================================================

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  user_id UUID,
  trainer_id UUID,
  client_id UUID,
  source TEXT DEFAULT 'posthog',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error Events
CREATE TABLE IF NOT EXISTS error_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_context JSONB DEFAULT '{}',
  request_context JSONB DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  trainer_id UUID,
  client_id UUID,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Health Metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  response_time_ms INTEGER,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  details JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Endpoint Status
CREATE TABLE IF NOT EXISTS api_endpoint_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  status INTEGER,
  response_time_ms INTEGER,
  last_successful TIMESTAMP WITH TIME ZONE,
  consecutive_failures INTEGER DEFAULT 0,
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB DEFAULT '{}'
);

-- Performance Metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12,4) NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
  trainer_id UUID,
  client_id UUID,
  service_name TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Alerts
CREATE TABLE IF NOT EXISTS performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  threshold_value DECIMAL(12,4) NOT NULL,
  actual_value DECIMAL(12,4) NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  service_name TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- PERFORMANCE OPTIMIZATION TABLES
-- ================================================================

-- Resource Utilization
CREATE TABLE IF NOT EXISTS resource_utilization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('cpu', 'memory', 'storage', 'network', 'database')),
  utilization_percentage DECIMAL(5,2) NOT NULL,
  capacity_gb DECIMAL(10,2),
  used_gb DECIMAL(10,2),
  service_name TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Database Performance Metrics
CREATE TABLE IF NOT EXISTS database_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_time_ms INTEGER,
  active_connections INTEGER,
  query_cache_hit_rate DECIMAL(5,2),
  slow_query_count INTEGER,
  total_query_count INTEGER,
  database_size_gb DECIMAL(10,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query Performance Logs
CREATE TABLE IF NOT EXISTS query_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  affected_rows INTEGER,
  query_type TEXT,
  table_name TEXT,
  trainer_id UUID,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Edge Function Metrics
CREATE TABLE IF NOT EXISTS edge_function_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  execution_time_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  memory_usage_mb DECIMAL(8,2),
  cpu_usage_percentage DECIMAL(5,2),
  trainer_id UUID,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Experience Metrics
CREATE TABLE IF NOT EXISTS user_experience_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL,
  load_time_ms INTEGER NOT NULL,
  time_to_interactive INTEGER,
  user_satisfaction DECIMAL(3,2),
  bounce_rate DECIMAL(5,2),
  session_id TEXT,
  trainer_id UUID,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Frontend Performance Logs
CREATE TABLE IF NOT EXISTS frontend_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  load_time_ms INTEGER NOT NULL,
  first_contentful_paint INTEGER,
  largest_contentful_paint INTEGER,
  time_to_interactive INTEGER,
  user_agent TEXT,
  session_id TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cost Tracking Metrics
CREATE TABLE IF NOT EXISTS cost_tracking_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  cost_usd DECIMAL(10,2) NOT NULL,
  usage_units INTEGER,
  cost_per_unit DECIMAL(10,4),
  billing_period TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- A/B Testing indexes
CREATE INDEX IF NOT EXISTS idx_ab_tests_trainer_id ON ab_tests(trainer_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_created_at ON ab_tests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_client_id ON ab_test_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_performance_variant_id ON ab_test_performance(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_performance_recorded_at ON ab_test_performance(recorded_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_lifecycle_analytics_trainer_id ON lifecycle_analytics(trainer_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_analytics_client_id ON lifecycle_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_trainer_id ON predictive_insights(trainer_id);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_client_id ON predictive_insights(client_id);
CREATE INDEX IF NOT EXISTS idx_trainer_performance_trainer_id ON trainer_performance_metrics(trainer_id);
CREATE INDEX IF NOT EXISTS idx_engagement_trends_trainer_id ON engagement_trends(trainer_id);
CREATE INDEX IF NOT EXISTS idx_engagement_trends_date ON engagement_trends(date DESC);

-- Integration indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_trainer_id ON analytics_events(trainer_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_client_id ON analytics_events(client_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_events_service_name ON error_events(service_name);
CREATE INDEX IF NOT EXISTS idx_error_events_severity ON error_events(severity);
CREATE INDEX IF NOT EXISTS idx_error_events_resolved ON error_events(resolved);
CREATE INDEX IF NOT EXISTS idx_system_health_service_name ON system_health_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_recorded_at ON system_health_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_service_name ON performance_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at DESC);

-- Performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_resource_utilization_resource_type ON resource_utilization(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_recorded_at ON resource_utilization(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_performance_execution_time ON query_performance_logs(execution_time_ms DESC);
CREATE INDEX IF NOT EXISTS idx_query_performance_executed_at ON query_performance_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_edge_function_metrics_function_name ON edge_function_metrics(function_name);
CREATE INDEX IF NOT EXISTS idx_edge_function_metrics_executed_at ON edge_function_metrics(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ux_metrics_page_name ON user_experience_metrics(page_name);
CREATE INDEX IF NOT EXISTS idx_ux_metrics_recorded_at ON user_experience_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_service_name ON cost_tracking_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_recorded_at ON cost_tracking_metrics(recorded_at DESC);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS for all new tables
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_endpoint_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_utilization ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_function_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE frontend_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainer-specific data
CREATE POLICY "Trainers can only access their own A/B tests" ON ab_tests
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can only access A/B test variants for their tests" ON ab_test_variants
  FOR ALL USING (test_id IN (SELECT id FROM ab_tests WHERE trainer_id = auth.uid()));

CREATE POLICY "Trainers can only access A/B test assignments for their clients" ON ab_test_assignments
  FOR ALL USING (test_id IN (SELECT id FROM ab_tests WHERE trainer_id = auth.uid()));

CREATE POLICY "Trainers can only access lifecycle analytics for their clients" ON lifecycle_analytics
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can only access predictive insights for their clients" ON predictive_insights
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can only access their performance metrics" ON trainer_performance_metrics
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can only access engagement trends for themselves" ON engagement_trends
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can only access analytics events for their data" ON analytics_events
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can only access error events related to their context" ON error_events
  FOR ALL USING (trainer_id = auth.uid() OR trainer_id IS NULL);

CREATE POLICY "Trainers can only access performance metrics for their services" ON performance_metrics
  FOR ALL USING (trainer_id = auth.uid() OR trainer_id IS NULL);

CREATE POLICY "Trainers can only access UX metrics for their context" ON user_experience_metrics
  FOR ALL USING (trainer_id = auth.uid() OR trainer_id IS NULL);

-- System-level tables (accessible to authenticated users only)
CREATE POLICY "Authenticated users can view system health metrics" ON system_health_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view API endpoint status" ON api_endpoint_status
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view performance alerts" ON performance_alerts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view resource utilization" ON resource_utilization
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view database performance metrics" ON database_performance_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view query performance logs" ON query_performance_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view edge function metrics" ON edge_function_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view frontend performance logs" ON frontend_performance_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view cost tracking metrics" ON cost_tracking_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- ================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ================================================================

-- Add updated_at triggers where needed
CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON ab_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lifecycle_analytics_updated_at BEFORE UPDATE ON lifecycle_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();