-- Migration: Onboarding Sessions
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  agent_id TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  data_payload JSONB DEFAULT '{}',
  is_complete BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only see their own sessions
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own onboarding" ON onboarding_sessions 
FOR SELECT USING (auth.uid() = user_id);
