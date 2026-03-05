-- 025a: Collections Agent Tables
CREATE TABLE IF NOT EXISTS agent_collections_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  customer_name TEXT NOT NULL,
  invoice_number TEXT,
  amount DECIMAL(12,2),
  days_overdue INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 50 CHECK (risk_score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'open' CHECK (status IN ('current','30-day','60-day','90-day','120-plus','resolved','written-off')),
  last_contact_date TIMESTAMPTZ,
  next_action TEXT,
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_collections_company ON agent_collections_data(company_id);
ALTER TABLE agent_collections_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_collections_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
