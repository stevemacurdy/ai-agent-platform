-- Migration 020: Integration connections (Unified.to)
-- Stores the connection_id returned by Unified.to after customer authorization

CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id TEXT NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,          -- e.g. 'quickbooks', 'hubspot', 'xero', 'odoo'
  category TEXT NOT NULL,          -- e.g. 'accounting', 'crm', 'hris', 'ticketing'
  status TEXT DEFAULT 'active',    -- 'active' | 'disconnected' | 'error'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_integration_connections_company
  ON integration_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_category
  ON integration_connections(company_id, category, status);

-- RLS
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company integrations"
  ON integration_connections FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access on integration_connections"
  ON integration_connections FOR ALL
  USING (auth.role() = 'service_role');
