CREATE TABLE IF NOT EXISTS agent_str_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  property_name TEXT NOT NULL,
  location TEXT,
  occupancy_rate DECIMAL(5,2),
  nightly_rate DECIMAL(10,2),
  monthly_revenue DECIMAL(10,2),
  guest_rating DECIMAL(3,1) CHECK (guest_rating BETWEEN 0 AND 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','maintenance','listed','unlisted','seasonal')),
  platform TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_str_company ON agent_str_data(company_id);
ALTER TABLE agent_str_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_str_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
