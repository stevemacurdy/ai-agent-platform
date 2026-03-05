-- 025b: FinOps Agent Tables
CREATE TABLE IF NOT EXISTS agent_finops_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  department TEXT NOT NULL,
  category TEXT NOT NULL,
  period TEXT NOT NULL,
  budget_amount DECIMAL(12,2),
  actual_amount DECIMAL(12,2),
  variance DECIMAL(12,2) GENERATED ALWAYS AS (budget_amount - actual_amount) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_finops_company ON agent_finops_data(company_id);
ALTER TABLE agent_finops_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_finops_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
