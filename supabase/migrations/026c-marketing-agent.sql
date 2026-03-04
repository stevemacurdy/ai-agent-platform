CREATE TABLE IF NOT EXISTS agent_marketing_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  campaign_name TEXT NOT NULL,
  channel TEXT,
  spend DECIMAL(10,2) DEFAULT 0,
  leads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cpl DECIMAL(10,2),
  roi DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft','active','paused','completed','archived')),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketing_company ON agent_marketing_data(company_id);
ALTER TABLE agent_marketing_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_marketing_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
