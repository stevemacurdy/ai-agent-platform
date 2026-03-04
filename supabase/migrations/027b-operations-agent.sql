CREATE TABLE IF NOT EXISTS agent_operations_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  project_name TEXT NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','active','at-risk','behind','complete','on-hold')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  due_date DATE,
  lead TEXT,
  budget DECIMAL(12,2),
  budget_used DECIMAL(12,2),
  team_size INTEGER,
  priority TEXT DEFAULT 'medium',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_operations_company ON agent_operations_data(company_id);
ALTER TABLE agent_operations_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_operations_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
