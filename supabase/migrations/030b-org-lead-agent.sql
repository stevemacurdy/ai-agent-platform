CREATE TABLE IF NOT EXISTS agent_org_lead_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  objective TEXT NOT NULL,
  key_results JSONB DEFAULT '[]',
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  owner TEXT,
  status TEXT DEFAULT 'on-track' CHECK (status IN ('on-track','at-risk','behind','complete','paused')),
  due_date DATE,
  department TEXT,
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_org_lead_company ON agent_org_lead_data(company_id);
ALTER TABLE agent_org_lead_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_org_lead_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
