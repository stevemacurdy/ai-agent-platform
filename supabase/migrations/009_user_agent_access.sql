-- ============================================================
-- User Agent Access + Profile Updates
-- ============================================================

-- Add must_reset_password to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- User-Agent access control table
CREATE TABLE IF NOT EXISTS user_agent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_slug TEXT NOT NULL,
  granted_by TEXT DEFAULT 'admin',
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_slug)
);

CREATE INDEX IF NOT EXISTS idx_uaa_user ON user_agent_access(user_id);
CREATE INDEX IF NOT EXISTS idx_uaa_slug ON user_agent_access(agent_slug);

-- RLS
ALTER TABLE user_agent_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_agent_access_self ON user_agent_access;
CREATE POLICY user_agent_access_self ON user_agent_access
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_agent_access_admin ON user_agent_access;
CREATE POLICY user_agent_access_admin ON user_agent_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Give your admin accounts full access to all agents
INSERT INTO user_agent_access (user_id, agent_slug)
SELECT u.id, a.slug
FROM auth.users u
CROSS JOIN agents a
WHERE u.email IN ('stevemacurdy@gmail.com', 'steve@woulfgroup.com')
  AND a.status = 'live'
ON CONFLICT (user_id, agent_slug) DO NOTHING;
