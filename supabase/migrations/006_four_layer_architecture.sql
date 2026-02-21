-- WoulfAI Four-Layer Architecture Tables
-- Run in Supabase SQL Editor

-- 1. Agent Registry
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  status TEXT NOT NULL DEFAULT 'dev' CHECK (status IN ('live', 'dev', 'beta')),
  completion_pct INTEGER DEFAULT 0 CHECK (completion_pct >= 0 AND completion_pct <= 100),
  category TEXT,
  live_route TEXT,
  demo_route TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the 11 agents
INSERT INTO agents (slug, name, icon, status, completion_pct, category, live_route, demo_route, sort_order) VALUES
  ('cfo', 'CFO Agent', '📈', 'live', 92, 'finance', '/agents/cfo/console', '/demo/cfo', 1),
  ('sales', 'Sales Agent', '💼', 'live', 90, 'sales', '/admin/sales-reps', '/demo/sales', 2),
  ('finops', 'FinOps Agent', '💰', 'live', 88, 'finance', '/agents/cfo/finops', '/demo/finops', 3),
  ('payables', 'Payables Agent', '🧾', 'live', 85, 'finance', '/agents/cfo/payables', '/demo/payables', 4),
  ('collections', 'Collections Agent', '📬', 'live', 80, 'finance', '/agents/cfo/console', '/demo/collections', 5),
  ('hr', 'HR Agent', '👥', 'dev', 25, 'people', NULL, '/demo/hr', 6),
  ('operations', 'Operations Agent', '⚙️', 'dev', 30, 'operations', NULL, '/demo/operations', 7),
  ('legal', 'Legal Agent', '⚖️', 'dev', 20, 'compliance', NULL, '/demo/legal', 8),
  ('marketing', 'Marketing Agent', '📣', 'dev', 15, 'sales', NULL, '/demo/marketing', 9),
  ('wms', 'WMS Agent', '🏭', 'dev', 10, 'operations', NULL, '/demo/wms', 10),
  ('compliance', 'Compliance Agent', '🛡️', 'dev', 10, 'compliance', NULL, '/demo/compliance', 11)
ON CONFLICT (slug) DO UPDATE SET
  completion_pct = EXCLUDED.completion_pct,
  status = EXCLUDED.status,
  live_route = EXCLUDED.live_route;

-- 2. Click Tracking
CREATE TABLE IF NOT EXISTS agent_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  source TEXT NOT NULL DEFAULT 'unknown',
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_clicks_slug ON agent_clicks(agent_slug);
CREATE INDEX IF NOT EXISTS idx_agent_clicks_date ON agent_clicks(created_at);

-- 3. Lead Capture
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  source TEXT DEFAULT 'demo',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_agent ON leads(agent_slug);

-- 4. User-Agent Permissions (multi-tenant)
CREATE TABLE IF NOT EXISTS user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  onboarded_at TIMESTAMPTZ DEFAULT now(),
  config JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, agent_slug)
);

ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own agents" ON user_agents
  FOR SELECT USING (user_id = auth.uid());

-- Done
SELECT 'Four-layer architecture tables created' as status;
