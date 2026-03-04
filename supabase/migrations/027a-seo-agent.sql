CREATE TABLE IF NOT EXISTS agent_seo_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  keyword TEXT NOT NULL,
  current_position INTEGER,
  previous_position INTEGER,
  search_volume INTEGER,
  difficulty INTEGER CHECK (difficulty BETWEEN 0 AND 100),
  url TEXT,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seo_company ON agent_seo_data(company_id);
ALTER TABLE agent_seo_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_seo_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
