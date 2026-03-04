CREATE TABLE IF NOT EXISTS agent_supply_chain_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  vendor_name TEXT NOT NULL,
  on_time_rate DECIMAL(5,2),
  quality_score DECIMAL(3,1) CHECK (quality_score BETWEEN 0 AND 5),
  avg_lead_time INTEGER,
  open_pos INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
  category TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_supply_chain_company ON agent_supply_chain_data(company_id);
ALTER TABLE agent_supply_chain_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_supply_chain_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
