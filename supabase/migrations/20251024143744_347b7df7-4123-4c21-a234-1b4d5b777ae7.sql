-- Create tables for TrainU agent system

-- 1. Trainer profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.trainer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_messages_approved INTEGER DEFAULT 0,
  total_messages_edited INTEGER DEFAULT 0,
  total_clients_nudged INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Queue items table (messages pending review)
CREATE TABLE IF NOT EXISTS public.queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  preview TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.80,
  status TEXT DEFAULT 'review' CHECK (status IN ('review', 'approved', 'edited', 'rejected')),
  why TEXT[] DEFAULT '{}',
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activity feed table
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('sent', 'edited', 'nudged', 'scheduled')),
  client_name TEXT NOT NULL,
  client_id UUID,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'pending', 'failed')),
  message_preview TEXT,
  confidence DECIMAL(3,2),
  why TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Agent status table
CREATE TABLE IF NOT EXISTS public.agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT DEFAULT 'active' CHECK (state IN ('active', 'paused', 'offline')),
  messages_sent_today INTEGER DEFAULT 0,
  clients_at_risk INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_response_time TEXT DEFAULT '2h',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Message templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  tone TEXT DEFAULT 'friendly' CHECK (tone IN ('friendly', 'professional', 'motivational', 'casual')),
  category TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Achievements table
CREATE TABLE IF NOT EXISTS public.trainer_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trainer_id, achievement_id)
);

-- 7. XP history table
CREATE TABLE IF NOT EXISTS public.xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainer_profiles
CREATE POLICY "Users can view own profile" ON public.trainer_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.trainer_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.trainer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for queue_items
CREATE POLICY "Trainers can view own queue" ON public.queue_items
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own queue items" ON public.queue_items
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own queue items" ON public.queue_items
  FOR UPDATE USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own queue items" ON public.queue_items
  FOR DELETE USING (auth.uid() = trainer_id);

-- RLS Policies for activity_feed
CREATE POLICY "Trainers can view own feed" ON public.activity_feed
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own feed items" ON public.activity_feed
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

-- RLS Policies for agent_status
CREATE POLICY "Trainers can view own status" ON public.agent_status
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own status" ON public.agent_status
  FOR UPDATE USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own status" ON public.agent_status
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

-- RLS Policies for message_templates
CREATE POLICY "Trainers can view own templates" ON public.message_templates
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own templates" ON public.message_templates
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own templates" ON public.message_templates
  FOR UPDATE USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete own templates" ON public.message_templates
  FOR DELETE USING (auth.uid() = trainer_id);

-- RLS Policies for achievements
CREATE POLICY "Trainers can view own achievements" ON public.trainer_achievements
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own achievements" ON public.trainer_achievements
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

-- RLS Policies for xp_history
CREATE POLICY "Trainers can view own XP history" ON public.xp_history
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert own XP history" ON public.xp_history
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

-- Create indexes for better performance
CREATE INDEX idx_queue_items_trainer ON public.queue_items(trainer_id, created_at DESC);
CREATE INDEX idx_activity_feed_trainer ON public.activity_feed(trainer_id, created_at DESC);
CREATE INDEX idx_queue_items_status ON public.queue_items(trainer_id, status);
CREATE INDEX idx_xp_history_trainer ON public.xp_history(trainer_id, created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trainer_profiles_updated_at BEFORE UPDATE ON public.trainer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_items_updated_at BEFORE UPDATE ON public.queue_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_status_updated_at BEFORE UPDATE ON public.agent_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create trainer profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_trainer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.trainer_profiles (id)
  VALUES (NEW.id);
  
  INSERT INTO public.agent_status (trainer_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_trainer();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trainer_profiles;