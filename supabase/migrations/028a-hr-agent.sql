CREATE TABLE IF NOT EXISTS agent_hr_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  position_title TEXT NOT NULL,
  department TEXT,
  applicants INTEGER DEFAULT 0,
  interviews INTEGER DEFAULT 0,
  offers INTEGER DEFAULT 0,
  days_open INTEGER DEFAULT 0,
  hiring_manager TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','open','interviewing','offer','filled','closed')),
  salary_range TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hr_company ON agent_hr_data(company_id);
ALTER TABLE agent_hr_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_hr_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
