-- 026a: Sales Intel Agent Tables
CREATE TABLE IF NOT EXISTS agent_sales_intel_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  prospect_name TEXT NOT NULL,
  prospect_company TEXT,
  industry TEXT,
  lead_score INTEGER DEFAULT 50 CHECK (lead_score BETWEEN 0 AND 100),
  intent_signals JSONB DEFAULT '[]',
  last_activity TIMESTAMPTZ,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','nurturing','converted','lost')),
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_intel_company ON agent_sales_intel_data(company_id);
ALTER TABLE agent_sales_intel_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_sales_intel_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
