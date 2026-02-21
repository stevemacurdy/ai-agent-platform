-- ============================================================
-- WoulfAI — Deploy 5 Agents Migration (FIXED)
-- ============================================================
-- Fix: PostgreSQL doesn't support CREATE POLICY IF NOT EXISTS
-- Using DROP POLICY IF EXISTS + CREATE POLICY instead
-- ============================================================

-- ── 1. Company Agent Access (Comp / Subscription tracking) ──
CREATE TABLE IF NOT EXISTS company_agent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  agent_slug TEXT NOT NULL,
  access_type TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'active',
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, agent_slug)
);

CREATE INDEX IF NOT EXISTS idx_caa_company ON company_agent_access(company_id);
CREATE INDEX IF NOT EXISTS idx_caa_slug ON company_agent_access(agent_slug);

-- ── 2. Per-Agent Data Tables ──────────────────────────────

CREATE TABLE IF NOT EXISTS agent_org_lead_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  name TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_org_lead_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_seo_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  name TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_seo_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_marketing_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  name TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_marketing_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_wms_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  name TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_wms_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_hr_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  name TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_hr_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_cfo_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_cfo_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_sales_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_sales_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_operations_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_legal_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_compliance_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_supply_chain_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_finops_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_payables_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_collections_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Row-Level Security ─────────────────────────────────
-- Enable RLS and create policies using DROP + CREATE pattern

DO $$
DECLARE
  tbl TEXT;
  policy_name TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'company_agent_access',
      'agent_org_lead_data', 'agent_org_lead_data_kpis',
      'agent_seo_data', 'agent_seo_data_kpis',
      'agent_marketing_data', 'agent_marketing_data_kpis',
      'agent_wms_data', 'agent_wms_data_kpis',
      'agent_hr_data', 'agent_hr_data_kpis',
      'agent_cfo_data', 'agent_cfo_data_kpis',
      'agent_sales_data', 'agent_sales_data_kpis',
      'agent_operations_data', 'agent_legal_data',
      'agent_compliance_data', 'agent_supply_chain_data',
      'agent_finops_data', 'agent_payables_data',
      'agent_collections_data'
    ])
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    
    -- Drop existing policy if any, then create new one
    policy_name := 'company_isolation_' || tbl;
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, tbl);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()))',
      policy_name, tbl
    );
  END LOOP;
END $$;

-- ── 4. Admin Comp Functions ───────────────────────────────

CREATE OR REPLACE FUNCTION admin_comp_agent(
  p_company_id UUID,
  p_agent_slug TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO company_agent_access (company_id, agent_slug, access_type, status)
  VALUES (p_company_id, p_agent_slug, 'comp', 'active')
  ON CONFLICT (company_id, agent_slug) 
  DO UPDATE SET access_type = 'comp', status = 'active', granted_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_comp_all_agents(
  p_company_id UUID
) RETURNS void AS $$
DECLARE
  agent_rec RECORD;
BEGIN
  FOR agent_rec IN SELECT slug FROM agents WHERE status = 'live' LOOP
    PERFORM admin_comp_agent(p_company_id, agent_rec.slug);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. Update agents table — set all 5 to LIVE ───────────

INSERT INTO agents (slug, name, description, icon, status, completion_pct, category, live_route, demo_route, sort_order)
VALUES
  ('org-lead', 'Organization Lead', 'Command center for org-wide KPIs and team management', '🏢', 'live', 95, 'operations', '/agents/org-lead', '/demo/org-lead', 6),
  ('seo', 'SEO Agent', 'Search rankings, keyword tracking, and technical audits', '🔍', 'live', 95, 'sales', '/agents/seo', '/demo/seo', 7),
  ('marketing', 'Marketing Agent', 'Campaign management, content calendar, and analytics', '📣', 'live', 95, 'sales', '/agents/marketing', '/demo/marketing', 8),
  ('wms', 'WMS Agent', 'Warehouse inventory, receiving, and shipping management', '📦', 'live', 95, 'operations', '/agents/wms', '/demo/wms', 9),
  ('hr', 'HR Agent', 'Employee directory, PTO tracking, and onboarding', '👥', 'live', 95, 'operations', '/agents/hr', '/demo/hr', 10)
ON CONFLICT (slug) DO UPDATE SET
  status = 'live',
  completion_pct = EXCLUDED.completion_pct,
  live_route = EXCLUDED.live_route,
  updated_at = now();

-- Also set any remaining agents to live
UPDATE agents SET status = 'live', updated_at = now() WHERE status != 'live';
