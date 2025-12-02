-- Enhanced AI Insights System
-- Adds AI-powered columns, caching, and analytics

-- 1. Enhance insights table with AI columns
ALTER TABLE public.insights
ADD COLUMN IF NOT EXISTS churn_probability DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS risk_category TEXT CHECK (risk_category IN ('critical', 'high', 'medium', 'low', 'healthy')),
ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS positive_indicators JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS warning_signals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS recommended_actions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS used_fallback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS prompt_version TEXT;

-- Create index for faster churn queries
CREATE INDEX IF NOT EXISTS idx_insights_churn ON public.insights(trainer_id, churn_probability DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_insights_risk_category ON public.insights(trainer_id, risk_category);

-- 2. Insight cache table for AI response caching
CREATE TABLE IF NOT EXISTS public.insight_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  contact_id UUID, -- NULL for queue insights
  insight_type TEXT NOT NULL CHECK (insight_type IN ('churn', 'queue', 'client')),
  prompt_version TEXT NOT NULL,
  data_hash TEXT NOT NULL, -- Hash of input data for invalidation
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.insight_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for insight_cache
CREATE POLICY "Trainers can view own cache"
  ON public.insight_cache FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own cache"
  ON public.insight_cache FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own cache"
  ON public.insight_cache FOR UPDATE
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own cache"
  ON public.insight_cache FOR DELETE
  USING (auth.uid() = trainer_id);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_insight_cache_lookup 
ON insight_cache(trainer_id, contact_id, insight_type, data_hash);

CREATE INDEX IF NOT EXISTS idx_insight_cache_expires 
ON insight_cache(expires_at) WHERE expires_at > NOW();

-- 3. AI analytics table for monitoring
CREATE TABLE IF NOT EXISTS public.ai_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  prompt_version TEXT,
  latency_ms INTEGER,
  used_fallback BOOLEAN DEFAULT false,
  cache_hit BOOLEAN DEFAULT false,
  tokens_used INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_analytics
CREATE POLICY "Trainers can view own analytics"
  ON public.ai_analytics FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own analytics"
  ON public.ai_analytics FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_ai_analytics_trainer 
ON ai_analytics(trainer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_analytics_errors 
ON ai_analytics(used_fallback, created_at DESC) WHERE used_fallback = true;

CREATE INDEX IF NOT EXISTS idx_ai_analytics_function 
ON ai_analytics(function_name, created_at DESC);

