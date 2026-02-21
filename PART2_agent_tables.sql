-- ============================================================
-- PART 2: Agent Data Tables (run AFTER Part 1)
-- ============================================================

-- Company Agent Access (comp/paid tracking)
CREATE TABLE IF NOT EXISTS company_agent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_slug TEXT NOT NULL,
  access_type TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'active',
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, agent_slug)
);

-- Org Lead
CREATE TABLE IF NOT EXISTS agent_org_lead_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, description TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS agent_org_lead_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SEO
CREATE TABLE IF NOT EXISTS agent_seo_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, description TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS agent_seo_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Marketing
CREATE TABLE IF NOT EXISTS agent_marketing_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, description TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS agent_marketing_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- WMS
CREATE TABLE IF NOT EXISTS agent_wms_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, description TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS agent_wms_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HR
CREATE TABLE IF NOT EXISTS agent_hr_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, description TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS agent_hr_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CFO
CREATE TABLE IF NOT EXISTS agent_cfo_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS agent_cfo_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sales
CREATE TABLE IF NOT EXISTS agent_sales_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS agent_sales_data_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Operations
CREATE TABLE IF NOT EXISTS agent_operations_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Legal
CREATE TABLE IF NOT EXISTS agent_legal_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance
CREATE TABLE IF NOT EXISTS agent_compliance_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Supply Chain
CREATE TABLE IF NOT EXISTS agent_supply_chain_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FinOps
CREATE TABLE IF NOT EXISTS agent_finops_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payables
CREATE TABLE IF NOT EXISTS agent_payables_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Collections
CREATE TABLE IF NOT EXISTS agent_collections_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL, data JSONB DEFAULT '{}',
  name TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
