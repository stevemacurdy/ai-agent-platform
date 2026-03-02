-- =============================================================================
-- WoulfAI Migration 017: Integrations, Data Domains, Webhooks, Usage
-- Closes gaps: integration declarations (6.1), data domains (4.4, 6.2),
--   webhooks (12.2), usage metering (10.4)
-- =============================================================================

-- ── Agent Integration Requirements ───────────────────────────────────────────
-- Declarative: which integrations each agent needs (not credentials — those live in integration_connections)
CREATE TABLE IF NOT EXISTS agent_integration_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,                   -- FK to agent_registry.id
  integration_slug TEXT NOT NULL,            -- e.g. 'hubspot', 'odoo', 'quickbooks', 'stripe', 'google-sheets'
  display_name TEXT NOT NULL,               -- 'HubSpot CRM'
  is_required BOOLEAN DEFAULT false,        -- true = agent won't function without it
  description TEXT,                         -- 'Used to sync pipeline data and contacts'
  setup_url TEXT,                           -- link to integration setup page
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id, integration_slug)
);

CREATE INDEX IF NOT EXISTS idx_air_agent ON agent_integration_requirements(agent_id);
CREATE INDEX IF NOT EXISTS idx_air_integration ON agent_integration_requirements(integration_slug);

-- ── Seed: Integration Requirements ───────────────────────────────────────────
INSERT INTO agent_integration_requirements (agent_id, integration_slug, display_name, is_required, description)
SELECT a.id, reqs.integration, reqs.display, reqs.required, reqs.description
FROM (VALUES
  ('cfo', 'odoo', 'Odoo ERP', false, 'Syncs invoices, payments, and financial data'),
  ('cfo', 'quickbooks', 'QuickBooks', false, 'Alternative accounting data source'),
  ('sales', 'hubspot', 'HubSpot CRM', false, 'Syncs pipeline, contacts, and deal data'),
  ('sales', 'salesforce', 'Salesforce', false, 'Alternative CRM data source'),
  ('sales-intel', 'hubspot', 'HubSpot CRM', true, 'Required for conversation and deal analysis'),
  ('seo', 'google-search-console', 'Google Search Console', false, 'Pulls ranking and click data'),
  ('seo', 'google-analytics', 'Google Analytics', false, 'Traffic and conversion data'),
  ('marketing', 'google-ads', 'Google Ads', false, 'Ad performance data'),
  ('marketing', 'meta-ads', 'Meta Ads', false, 'Facebook/Instagram ad data'),
  ('hr', 'gusto', 'Gusto', false, 'Payroll and benefits data'),
  ('wms', 'shipstation', 'ShipStation', false, 'Shipping label and tracking'),
  ('supply-chain', 'odoo', 'Odoo ERP', false, 'Purchase order and vendor data'),
  ('str', 'airbnb', 'Airbnb', false, 'Listing and booking sync'),
  ('str', 'vrbo', 'VRBO', false, 'Listing and booking sync'),
  ('str', 'guesty', 'Guesty', false, 'Property management platform')
) AS reqs(agent_slug, integration, display, required, description)
JOIN agent_registry a ON a.slug = reqs.agent_slug
ON CONFLICT (agent_id, integration_slug) DO NOTHING;

-- ── Agent Data Domains ───────────────────────────────────────────────────────
-- Declares what data domains each agent reads/writes and at what sensitivity
CREATE TABLE IF NOT EXISTS agent_data_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,                   -- FK to agent_registry.id
  domain TEXT NOT NULL,                     -- e.g. 'invoices', 'contacts', 'inventory', 'employees'
  access_type TEXT NOT NULL DEFAULT 'read' 
    CHECK (access_type IN ('read', 'write', 'readwrite')),
  sensitivity_level TEXT NOT NULL DEFAULT 'standard' 
    CHECK (sensitivity_level IN ('public', 'standard', 'sensitive', 'pii', 'financial', 'restricted')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id, domain, access_type)
);

CREATE INDEX IF NOT EXISTS idx_add_agent ON agent_data_domains(agent_id);
CREATE INDEX IF NOT EXISTS idx_add_domain ON agent_data_domains(domain);
CREATE INDEX IF NOT EXISTS idx_add_sensitivity ON agent_data_domains(sensitivity_level);

-- ── Seed: Data Domains ───────────────────────────────────────────────────────
INSERT INTO agent_data_domains (agent_id, domain, access_type, sensitivity_level, description)
SELECT a.id, dd.domain, dd.access, dd.sensitivity, dd.description
FROM (VALUES
  ('cfo', 'invoices', 'readwrite', 'financial', 'Creates and manages invoices'),
  ('cfo', 'payments', 'readwrite', 'financial', 'Tracks payment records'),
  ('cfo', 'financial_reports', 'read', 'financial', 'Generates P&L, balance sheet'),
  ('sales', 'contacts', 'readwrite', 'pii', 'Manages prospect and customer contacts'),
  ('sales', 'deals', 'readwrite', 'standard', 'Pipeline and deal management'),
  ('sales', 'activities', 'readwrite', 'standard', 'Call logs, emails, meetings'),
  ('hr', 'employees', 'readwrite', 'pii', 'Employee records and profiles'),
  ('hr', 'pto', 'readwrite', 'sensitive', 'Time off requests and balances'),
  ('hr', 'payroll', 'read', 'financial', 'Payroll data for reporting'),
  ('wms', 'inventory', 'readwrite', 'standard', 'SKU counts and locations'),
  ('wms', 'shipments', 'readwrite', 'standard', 'Inbound/outbound shipments'),
  ('wms', 'orders', 'readwrite', 'standard', 'Customer orders for fulfillment'),
  ('operations', 'projects', 'readwrite', 'standard', 'Project tracking and milestones'),
  ('operations', 'resources', 'readwrite', 'standard', 'Crew and equipment scheduling'),
  ('legal', 'contracts', 'readwrite', 'restricted', 'Contract documents and analysis'),
  ('compliance', 'regulations', 'read', 'standard', 'Regulatory requirements'),
  ('compliance', 'audits', 'readwrite', 'sensitive', 'Audit records and findings'),
  ('support', 'tickets', 'readwrite', 'pii', 'Customer support tickets'),
  ('marketing', 'campaigns', 'readwrite', 'standard', 'Marketing campaigns and metrics'),
  ('seo', 'rankings', 'readwrite', 'standard', 'Search ranking data'),
  ('str', 'listings', 'readwrite', 'standard', 'Rental property listings'),
  ('str', 'bookings', 'readwrite', 'pii', 'Guest booking and payment info')
) AS dd(agent_slug, domain, access, sensitivity, description)
JOIN agent_registry a ON a.slug = dd.agent_slug
ON CONFLICT (agent_id, domain, access_type) DO NOTHING;

-- ── Agent Webhooks ───────────────────────────────────────────────────────────
-- Per-company webhook endpoints for agent events
CREATE TABLE IF NOT EXISTS agent_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  agent_id UUID,                            -- NULL = all agents for this company
  url TEXT NOT NULL,
  secret TEXT,                              -- HMAC signing secret
  events TEXT[] DEFAULT '{}',               -- which event slugs to send, empty = all
  is_active BOOLEAN DEFAULT true,
  -- Reliability
  retry_count INTEGER DEFAULT 3,
  last_triggered_at TIMESTAMPTZ,
  last_status_code INTEGER,
  failure_count INTEGER DEFAULT 0,
  -- Metadata
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_company ON agent_webhooks(company_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_agent ON agent_webhooks(agent_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON agent_webhooks(is_active);

ALTER TABLE agent_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins manage webhooks" ON agent_webhooks
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ── Agent Usage Metrics ──────────────────────────────────────────────────────
-- Tracks usage for metering, billing, and popularity analytics
CREATE TABLE IF NOT EXISTS agent_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,                   -- FK to agent_registry.id
  company_id UUID NOT NULL,
  metric TEXT NOT NULL,                     -- e.g. 'api_calls', 'chat_messages', 'documents_processed'
  value BIGINT NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,               -- start of the metering period
  period_end DATE NOT NULL,                 -- end of the metering period
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id, company_id, metric, period_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_agent ON agent_usage_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_usage_company ON agent_usage_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_period ON agent_usage_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_metric ON agent_usage_metrics(metric);

-- ── Usage Summary View ───────────────────────────────────────────────────────
CREATE OR REPLACE VIEW agent_usage_summary AS
SELECT 
  agent_id,
  company_id,
  metric,
  SUM(value) AS total_value,
  MIN(period_start) AS first_usage,
  MAX(period_end) AS last_usage,
  COUNT(*) AS periods_active
FROM agent_usage_metrics
GROUP BY agent_id, company_id, metric;

SELECT 'Migration 017 complete: integrations, data domains, webhooks, usage' AS status;
