-- 026b: Sales Coach Agent Tables
CREATE TABLE IF NOT EXISTS agent_sales_coach_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  rep_name TEXT NOT NULL,
  quota DECIMAL(12,2),
  actual DECIMAL(12,2),
  win_rate DECIMAL(5,2),
  deals_closed INTEGER DEFAULT 0,
  avg_deal_size DECIMAL(12,2),
  avg_cycle_days INTEGER,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  coaching_notes TEXT,
  period TEXT DEFAULT 'Q1 2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_coach_company ON agent_sales_coach_data(company_id);
ALTER TABLE agent_sales_coach_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_sales_coach_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
