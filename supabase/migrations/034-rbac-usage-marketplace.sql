-- =============================================================================
-- WoulfAI Migration 034: RBAC, Usage Tracking & Marketplace Foundation
-- =============================================================================

-- ═══════════════════════════════════════════
-- 1. EXTEND PROFILES WITH RBAC FIELDS
-- ═══════════════════════════════════════════

-- Ensure role column supports all 5 roles
DO $$ BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'free';
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'employee', 'subscription', 'beta_tester', 'free'));

-- Agent access arrays
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assigned_agents JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paid_agents JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_granted_agents JSONB DEFAULT '[]';

-- Subscription metadata
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'
  CHECK (subscription_status IN ('none', 'active', 'past_due', 'cancelled', 'trialing'));

-- Beta tester tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beta_active BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beta_last_suggestion TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beta_suggestion_count INTEGER DEFAULT 0;

-- Profile fields (add if missing)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_source TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);


-- ═══════════════════════════════════════════
-- 2. USAGE TRACKING
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  agent_slug TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'console_view', 'api_get', 'api_post', 'demo_view',
    'export', 'ai_generation', 'document_upload', 'payment'
  )),
  action_detail TEXT,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_user ON platform_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_agent ON platform_usage_log(agent_slug);
CREATE INDEX IF NOT EXISTS idx_usage_date ON platform_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_type ON platform_usage_log(action_type);

-- Daily rollup for fast dashboard queries
CREATE TABLE IF NOT EXISTS platform_usage_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  agent_slug TEXT NOT NULL,
  date DATE NOT NULL,
  console_views INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  ai_generations INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  UNIQUE(user_id, agent_slug, date)
);

CREATE INDEX IF NOT EXISTS idx_usage_daily_user ON platform_usage_daily(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_daily_date ON platform_usage_daily(date);


-- ═══════════════════════════════════════════
-- 3. BETA TESTER SUGGESTIONS
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beta_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  agent_slug TEXT,
  suggestion TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'bug', 'feature', 'ux', 'performance', 'design', 'data', 'general'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'helpful', 'not-helpful', 'implemented', 'duplicate', 'declined'
  )),
  admin_response TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_suggestions_user ON beta_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_suggestions_status ON beta_suggestions(status);


-- ═══════════════════════════════════════════
-- 4. CUSTOMER SERVICE MESSAGE BOARD
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS customer_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  company_id UUID,
  source TEXT DEFAULT 'portal' CHECK (source IN ('portal', 'chatbot', 'email', 'api')),
  subject TEXT,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'billing', 'technical', 'feature-request', 'bug-report',
    'complaint', 'question', 'feedback', 'general'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'open', 'in-progress', 'waiting-on-customer', 'resolved', 'closed'
  )),
  assigned_to UUID,
  is_subscriber BOOLEAN DEFAULT false,
  thread JSONB DEFAULT '[]',
  resolved_at TIMESTAMPTZ,
  satisfaction INTEGER CHECK (satisfaction BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_status ON customer_messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON customer_messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_user ON customer_messages(user_id);


-- ═══════════════════════════════════════════
-- 5. AGENT SUBSCRIPTIONS (marketplace/billing)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  agent_slug TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN (
    'paid', 'assigned', 'free_granted', 'beta', 'admin', 'trial'
  )),
  stripe_subscription_item_id TEXT,
  granted_by UUID,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'suspended')),
  UNIQUE(user_id, agent_slug)
);

CREATE INDEX IF NOT EXISTS idx_agent_subs_user ON agent_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_subs_slug ON agent_subscriptions(agent_slug);


-- ═══════════════════════════════════════════
-- 6. RLS POLICIES
-- ═══════════════════════════════════════════

ALTER TABLE platform_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_subscriptions ENABLE ROW LEVEL SECURITY;

-- Open access via service_role (API routes use service key)
CREATE POLICY "service_role_usage_log" ON platform_usage_log FOR ALL USING (true);
CREATE POLICY "service_role_usage_daily" ON platform_usage_daily FOR ALL USING (true);
CREATE POLICY "service_role_beta" ON beta_suggestions FOR ALL USING (true);
CREATE POLICY "service_role_messages" ON customer_messages FOR ALL USING (true);
CREATE POLICY "service_role_subs" ON agent_subscriptions FOR ALL USING (true);


SELECT 'Migration 034 complete: RBAC columns + 5 tables + RLS' AS status;
