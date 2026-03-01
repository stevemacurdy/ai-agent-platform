-- =============================================================================
-- WoulfAI Migration 015: Permissions & Tenant Module Config
-- Closes gaps: per-user permissions (4.2), per-tenant module toggles (3.1),
--   permission level CHECK (4.1), company access CHECK
-- =============================================================================

-- ── Per-User Agent Permissions ───────────────────────────────────────────────
-- Grants specific users specific permission levels on specific agents
-- This supplements company-level access (agent_company_access)
CREATE TABLE IF NOT EXISTS agent_user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,                   -- FK to agent_registry.id
  company_id UUID NOT NULL,                 -- scoped to company
  permission_level TEXT NOT NULL DEFAULT 'use' 
    CHECK (permission_level IN ('view', 'use', 'configure', 'admin')),
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, agent_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_aup_user ON agent_user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_aup_agent ON agent_user_permissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_aup_company ON agent_user_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_aup_user_company ON agent_user_permissions(user_id, company_id);

ALTER TABLE agent_user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own permissions" ON agent_user_permissions
  FOR SELECT USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Company admins manage permissions" ON agent_user_permissions
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ── Per-Tenant Module Configuration ──────────────────────────────────────────
-- Allows companies to enable/disable specific modules per agent
-- Also stores per-tenant module config (e.g. custom thresholds)
CREATE TABLE IF NOT EXISTS agent_tenant_module_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  agent_id UUID NOT NULL,                   -- FK to agent_registry.id
  module_id UUID NOT NULL,                  -- FK to agent_modules.id
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}',                -- module-specific tenant overrides
  configured_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, agent_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_atmc_company ON agent_tenant_module_config(company_id);
CREATE INDEX IF NOT EXISTS idx_atmc_agent ON agent_tenant_module_config(agent_id);
CREATE INDEX IF NOT EXISTS idx_atmc_company_agent ON agent_tenant_module_config(company_id, agent_id);

ALTER TABLE agent_tenant_module_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members see own module config" ON agent_tenant_module_config
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company admins manage module config" ON agent_tenant_module_config
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ── Fix agent_company_access permission_level CHECK ──────────────────────────
DO $$ BEGIN
  ALTER TABLE agent_company_access DROP CONSTRAINT IF EXISTS agent_company_access_permission_level_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE agent_company_access ADD CONSTRAINT agent_company_access_permission_level_check
    CHECK (permission_level IN ('view', 'use', 'configure', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Verify agent_tenant_config has display_order ─────────────────────────────
ALTER TABLE agent_tenant_config ADD COLUMN IF NOT EXISTS display_order INTEGER;
ALTER TABLE agent_tenant_config ADD COLUMN IF NOT EXISTS custom_display_name TEXT;
ALTER TABLE agent_tenant_config ADD COLUMN IF NOT EXISTS custom_icon TEXT;
ALTER TABLE agent_tenant_config ADD COLUMN IF NOT EXISTS custom_description TEXT;
ALTER TABLE agent_tenant_config ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

SELECT 'Migration 015 complete: permissions + tenant module config' AS status;
