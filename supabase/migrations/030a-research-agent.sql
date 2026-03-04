CREATE TABLE IF NOT EXISTS agent_research_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  competitor_name TEXT NOT NULL,
  market_share DECIMAL(5,2),
  revenue_estimate TEXT,
  growth_rate DECIMAL(5,2),
  threat_level TEXT DEFAULT 'low' CHECK (threat_level IN ('low','medium','high','critical')),
  recent_moves JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_research_company ON agent_research_data(company_id);
ALTER TABLE agent_research_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_research_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
