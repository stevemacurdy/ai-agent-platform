CREATE TABLE IF NOT EXISTS agent_compliance_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  regulation TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'under-review' CHECK (status IN ('compliant','non-compliant','partial','under-review','exempt')),
  last_audit_date DATE,
  next_audit_date DATE,
  owner TEXT,
  findings INTEGER DEFAULT 0,
  remediation_plan TEXT,
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_compliance_company ON agent_compliance_data(company_id);
ALTER TABLE agent_compliance_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_compliance_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
