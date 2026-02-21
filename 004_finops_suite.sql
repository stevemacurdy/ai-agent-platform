-- ============================================================================
-- WoulfAI Phase 5: CFO FinOps & Intelligence Suite
-- Run AFTER 003_phase3_intelligence.sql
-- ============================================================================

-- ============================
-- 1. AP EXPENSES (with mandatory categorization)
-- ============================
CREATE TABLE IF NOT EXISTS ap_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  invoice_number TEXT,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'advertising','car_truck','commissions_fees','contract_labor',
    'employee_benefits','insurance','interest_mortgage','legal_professional',
    'office_expense','profit_sharing','rent_lease_vehicles','rent_lease_machinery',
    'rent_lease_property','repairs_maintenance','supplies','taxes_licenses',
    'travel_meals','utilities','wages'
  )),
  allocation_type TEXT DEFAULT 'overhead' CHECK (allocation_type IN ('project','overhead')),
  project_id UUID,
  invoice_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','rejected','void')),
  odoo_account TEXT DEFAULT 'woulf' CHECK (odoo_account IN ('woulf','clutch')),
  receipt_url TEXT,
  ocr_data JSONB DEFAULT '{}',
  approved_by UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 2. PROJECTS (for P&L allocation)
-- ============================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  client TEXT,
  odoo_account TEXT DEFAULT 'woulf' CHECK (odoo_account IN ('woulf','clutch')),
  budget DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','on_hold','cancelled')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 3. EQUIPMENT LEDGER
-- ============================
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  serial_number TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  current_value DECIMAL(12,2),
  depreciation_method TEXT DEFAULT 'straight_line' CHECK (depreciation_method IN ('straight_line','declining_balance','units_of_production')),
  useful_life_years INTEGER DEFAULT 5,
  salvage_value DECIMAL(12,2) DEFAULT 0,
  location TEXT,
  assigned_project UUID REFERENCES projects(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','maintenance','decommissioned','sold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 4. LOANS & DEBT
-- ============================
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lender TEXT NOT NULL,
  loan_type TEXT CHECK (loan_type IN ('mortgage','equipment','line_of_credit','term_loan','sba','vehicle','other')),
  original_amount DECIMAL(12,2) NOT NULL,
  current_balance DECIMAL(12,2),
  interest_rate DECIMAL(5,3),
  monthly_payment DECIMAL(10,2),
  origination_date DATE,
  maturity_date DATE,
  collateral TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paid_off','refinanced','defaulted')),
  contract_url TEXT,
  ocr_terms JSONB DEFAULT '{}',
  ai_recommendations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 5. LABOR TRACKING
-- ============================
CREATE TABLE IF NOT EXISTS labor_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  task_description TEXT,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  hours DECIMAL(5,2),
  hourly_rate DECIMAL(8,2),
  total_cost DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','approved')),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 6. CASH FLOW FORECASTS
-- ============================
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  forecast_type TEXT CHECK (forecast_type IN ('30day','60day','90day','12month','24month')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  inputs JSONB DEFAULT '{}',
  projections JSONB DEFAULT '{}',
  assumptions JSONB DEFAULT '{}',
  generated_by TEXT DEFAULT 'ai'
);

-- ============================
-- 7. BUSINESS IDEAS SANDBOX
-- ============================
CREATE TABLE IF NOT EXISTS business_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  initial_investment DECIMAL(12,2),
  monthly_revenue_estimate DECIMAL(12,2),
  monthly_cost_estimate DECIMAL(12,2),
  time_to_profit_months INTEGER,
  risk_level TEXT CHECK (risk_level IN ('low','medium','high')),
  ai_analysis JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','analyzing','viable','not_viable','pursuing')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 8. RLS POLICIES
-- ============================
ALTER TABLE ap_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_ideas ENABLE ROW LEVEL SECURITY;

-- Super admin access all
CREATE POLICY "sa_ap" ON ap_expenses FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_projects" ON projects FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_equipment" ON equipment FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_loans" ON loans FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_labor" ON labor_entries FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_forecasts" ON forecasts FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_ideas" ON business_ideas FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

-- Org scoped
CREATE POLICY "org_ap" ON ap_expenses FOR ALL USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_projects" ON projects FOR ALL USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_equipment" ON equipment FOR ALL USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_loans" ON loans FOR ALL USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_labor" ON labor_entries FOR ALL USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_forecasts" ON forecasts FOR ALL USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_ideas" ON business_ideas FOR ALL USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Employee: own labor entries
CREATE POLICY "own_labor" ON labor_entries FOR ALL USING (employee_id = auth.uid());

-- ============================
-- 9. INDEXES
-- ============================
CREATE INDEX IF NOT EXISTS idx_ap_org ON ap_expenses(org_id);
CREATE INDEX IF NOT EXISTS idx_ap_category ON ap_expenses(category);
CREATE INDEX IF NOT EXISTS idx_ap_project ON ap_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_ap_status ON ap_expenses(status);
CREATE INDEX IF NOT EXISTS idx_ap_odoo ON ap_expenses(odoo_account);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_equipment_org ON equipment(org_id);
CREATE INDEX IF NOT EXISTS idx_loans_org ON loans(org_id);
CREATE INDEX IF NOT EXISTS idx_labor_employee ON labor_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_labor_project ON labor_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_org ON forecasts(org_id);
CREATE INDEX IF NOT EXISTS idx_ideas_org ON business_ideas(org_id);

-- ============================
-- 10. TRIGGERS
-- ============================
-- Auto-calculate labor cost
CREATE OR REPLACE FUNCTION calc_labor_cost()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL AND NEW.clock_in IS NOT NULL THEN
    NEW.hours = EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0;
    NEW.total_cost = NEW.hours * COALESCE(NEW.hourly_rate, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS labor_cost_trigger ON labor_entries;
CREATE TRIGGER labor_cost_trigger
  BEFORE INSERT OR UPDATE ON labor_entries
  FOR EACH ROW EXECUTE FUNCTION calc_labor_cost();

-- Auto-update timestamps
DROP TRIGGER IF EXISTS ap_ts ON ap_expenses;
CREATE TRIGGER ap_ts BEFORE UPDATE ON ap_expenses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS projects_ts ON projects;
CREATE TRIGGER projects_ts BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS equipment_ts ON equipment;
CREATE TRIGGER equipment_ts BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS loans_ts ON loans;
CREATE TRIGGER loans_ts BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS ideas_ts ON business_ideas;
CREATE TRIGGER ideas_ts BEFORE UPDATE ON business_ideas FOR EACH ROW EXECUTE FUNCTION set_updated_at();
