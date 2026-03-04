-- 025c: Payables Agent Tables
CREATE TABLE IF NOT EXISTS agent_payables_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  vendor_name TEXT NOT NULL,
  invoice_number TEXT,
  amount DECIMAL(12,2),
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','scheduled','paid','disputed','overdue')),
  early_pay_discount DECIMAL(5,2) DEFAULT 0,
  discount_deadline DATE,
  approved_by TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payables_company ON agent_payables_data(company_id);
ALTER TABLE agent_payables_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_payables_data FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
