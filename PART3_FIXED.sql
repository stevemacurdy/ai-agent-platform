-- ============================================================
-- PART 3 (FIXED): RLS + Functions + Agent Seeding
-- ============================================================
-- Creates agents table first since it doesn't exist yet

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  status TEXT NOT NULL DEFAULT 'dev',
  completion_pct INTEGER DEFAULT 0,
  category TEXT,
  live_route TEXT,
  demo_route TEXT,
  features JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- RLS on all agent data tables
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
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    policy_name := 'company_isolation_' || tbl;
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, tbl);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()))',
      policy_name, tbl
    );
  END LOOP;
END $$;

-- Admin comp functions
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

-- Seed ALL 14 agents
INSERT INTO agents (slug, name, description, icon, status, completion_pct, category, live_route, demo_route, sort_order)
VALUES
  ('cfo', 'CFO Agent', 'AI-powered financial intelligence and cash flow management', '💰', 'live', 92, 'finance', '/agents/cfo/console', '/demo/cfo', 1),
  ('sales', 'Sales Agent', 'CRM pipeline, behavioral profiles, and battle cards', '🎯', 'live', 95, 'sales', '/agents/sales/intel', '/demo/sales', 2),
  ('finops', 'FinOps Agent', 'AP management, debt tracking, labor analysis', '📊', 'live', 88, 'finance', '/agents/cfo/finops', '/demo/finops', 3),
  ('payables', 'Payables Agent', 'Invoice intake, approval workflows, payment processing', '🧾', 'live', 85, 'finance', '/agents/cfo/payables', '/demo/payables', 4),
  ('collections', 'Collections Agent', '4-tier AI collections with behavioral intelligence', '📞', 'live', 80, 'finance', '/agents/cfo/console', '/demo/collections', 5),
  ('org-lead', 'Organization Lead', 'Command center for org-wide KPIs and team management', '🏢', 'live', 95, 'operations', '/agents/org-lead', '/demo/org-lead', 6),
  ('seo', 'SEO Agent', 'Search rankings, keyword tracking, and technical audits', '🔍', 'live', 95, 'sales', '/agents/seo', '/demo/seo', 7),
  ('marketing', 'Marketing Agent', 'Campaign management, content calendar, and analytics', '📣', 'live', 95, 'sales', '/agents/marketing', '/demo/marketing', 8),
  ('wms', 'WMS Agent', 'Warehouse inventory, receiving, and shipping management', '📦', 'live', 95, 'operations', '/agents/wms', '/demo/wms', 9),
  ('hr', 'HR Agent', 'Employee directory, PTO tracking, and onboarding', '👥', 'live', 95, 'operations', '/agents/hr', '/demo/hr', 10),
  ('operations', 'Operations Agent', 'Project tracking, crew scheduling, resource management', '⚙️', 'live', 95, 'operations', '/agents/operations', '/demo/operations', 11),
  ('legal', 'Legal Agent', 'Contract analysis, risk assessment, compliance tracking', '⚖️', 'live', 95, 'compliance', '/agents/legal', '/demo/legal', 12),
  ('compliance', 'Compliance Agent', 'Regulatory tracking, audit prep, policy management', '🛡️', 'live', 95, 'compliance', '/agents/compliance', '/demo/compliance', 13),
  ('supply-chain', 'Supply Chain Agent', 'Vendor management, procurement, logistics optimization', '🚛', 'live', 95, 'operations', '/agents/supply-chain', '/demo/supply-chain', 14)
ON CONFLICT (slug) DO UPDATE SET
  status = 'live',
  completion_pct = EXCLUDED.completion_pct,
  live_route = EXCLUDED.live_route,
  updated_at = now();
