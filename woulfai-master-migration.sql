-- ============================================================================
-- WoulfAI: Master Enterprise Migration
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================
-- Tables: organizations, profiles, seat_usage, org_branding,
--         contacts, deals, deal_activities, bug_reports, audit_log,
--         reimbursements, reimbursement_items
-- ============================================================================

-- ============================
-- 1. ORGANIZATIONS
-- ============================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter','professional','enterprise','beta')),
  max_seats INTEGER DEFAULT 3,
  used_seats INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 2. ORG BRANDING (white-label)
-- ============================
CREATE TABLE IF NOT EXISTS org_branding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#8B5CF6',
  accent_color TEXT DEFAULT '#10B981',
  bg_color TEXT DEFAULT '#06080D',
  card_color TEXT DEFAULT '#0A0E15',
  font_family TEXT DEFAULT 'Inter',
  company_url TEXT,
  support_email TEXT,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 3. PROFILES (extends auth.users)
-- ============================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('super_admin','org_admin','employee','beta_tester','member')),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '{"sales_agent":false,"cfo_agent":false,"admin_analytics":false,"agent_creator":false,"wms_agent":false}',
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','invited','deactivated')),
  last_login TIMESTAMPTZ,
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 4. SEAT USAGE
-- ============================
CREATE TABLE IF NOT EXISTS seat_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  UNIQUE(org_id, user_id)
);

-- ============================
-- 5. CRM: CONTACTS
-- ============================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  bio_notes TEXT,
  source TEXT,
  odoo_partner_id INTEGER,
  hubspot_contact_id TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 6. CRM: DEALS
-- ============================
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value DECIMAL(12,2) DEFAULT 0,
  stage TEXT DEFAULT 'prospecting' CHECK (stage IN ('prospecting','discovery','proposal','negotiation','closed_won','closed_lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  reality_score INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES profiles(id),
  expected_close DATE,
  notes TEXT,
  closed_at TIMESTAMPTZ,
  odoo_invoice_ids INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 7. CRM: ACTIVITIES
-- ============================
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN ('note','call','email','meeting','stage_change','document','voice_debrief','receipt')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  recording_url TEXT,
  transcript TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 8. BUG REPORTS
-- ============================
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id),
  scenario TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('critical','high','medium','low')),
  description TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','confirmed','fixed','wontfix')),
  admin_notes TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 9. REIMBURSEMENTS
-- ============================
CREATE TABLE IF NOT EXISTS reimbursements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  batch_month TEXT NOT NULL, -- '2026-02'
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  odoo_bill_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reimbursement_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reimbursement_id UUID NOT NULL REFERENCES reimbursements(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('travel','meals','lodging','supplies','mileage','other')),
  receipt_url TEXT,
  ocr_data JSONB DEFAULT '{}',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 10. AUDIT LOG
-- ============================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 11. ROW LEVEL SECURITY
-- ============================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimbursement_items ENABLE ROW LEVEL SECURITY;

-- Super admin: full access
CREATE POLICY "sa_profiles" ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_orgs" ON organizations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_branding" ON org_branding FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_contacts" ON contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_deals" ON deals FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_activities" ON deal_activities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_bugs" ON bug_reports FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_reimb" ON reimbursements FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "sa_reimb_items" ON reimbursement_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

-- Users: own profile
CREATE POLICY "own_profile_read" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "own_profile_update" ON profiles FOR UPDATE USING (id = auth.uid());

-- Org admin: manage org members
CREATE POLICY "oa_profiles" ON profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'org_admin'
    AND p.org_id = profiles.org_id
  ));

-- Org scoped: members see own org data
CREATE POLICY "org_read" ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_branding_read" ON org_branding FOR SELECT
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_contacts" ON contacts FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_deals" ON deals FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_activities" ON deal_activities FOR ALL
  USING (contact_id IN (SELECT id FROM contacts WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY "org_reimb" ON reimbursements FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "org_reimb_items" ON reimbursement_items FOR ALL
  USING (reimbursement_id IN (SELECT id FROM reimbursements WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())));

-- Bug reports: own + admin
CREATE POLICY "own_bugs" ON bug_reports FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "own_bugs_insert" ON bug_reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Seat usage
CREATE POLICY "sa_seats" ON seat_usage FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "oa_seats" ON seat_usage FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role = 'org_admin'));

-- ============================
-- 12. INDEXES
-- ============================
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_odoo ON contacts(odoo_partner_id);
CREATE INDEX IF NOT EXISTS idx_deals_org ON deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_assigned ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_deal ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON deal_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_bugs_reporter ON bug_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_reimb_org ON reimbursements(org_id);
CREATE INDEX IF NOT EXISTS idx_reimb_submitter ON reimbursements(submitted_by);
CREATE INDEX IF NOT EXISTS idx_reimb_items_parent ON reimbursement_items(reimbursement_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_seat_org ON seat_usage(org_id);

-- ============================
-- 13. TRIGGERS
-- ============================

-- Auto-update seat count
CREATE OR REPLACE FUNCTION update_org_seat_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organizations SET used_seats = (
    SELECT COUNT(*) FROM seat_usage
    WHERE org_id = COALESCE(NEW.org_id, OLD.org_id)
    AND deactivated_at IS NULL
  ), updated_at = NOW()
  WHERE id = COALESCE(NEW.org_id, OLD.org_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS seat_count_trigger ON seat_usage;
CREATE TRIGGER seat_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON seat_usage
  FOR EACH ROW EXECUTE FUNCTION update_org_seat_count();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_ts ON profiles;
CREATE TRIGGER profiles_ts BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS orgs_ts ON organizations;
CREATE TRIGGER orgs_ts BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS contacts_ts ON contacts;
CREATE TRIGGER contacts_ts BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS deals_ts ON deals;
CREATE TRIGGER deals_ts BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS bugs_ts ON bug_reports;
CREATE TRIGGER bugs_ts BEFORE UPDATE ON bug_reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS reimb_ts ON reimbursements;
CREATE TRIGGER reimb_ts BEFORE UPDATE ON reimbursements FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-calculate reimbursement total
CREATE OR REPLACE FUNCTION update_reimb_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reimbursements SET total_amount = (
    SELECT COALESCE(SUM(amount), 0) FROM reimbursement_items
    WHERE reimbursement_id = COALESCE(NEW.reimbursement_id, OLD.reimbursement_id)
  ) WHERE id = COALESCE(NEW.reimbursement_id, OLD.reimbursement_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reimb_total_trigger ON reimbursement_items;
CREATE TRIGGER reimb_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reimbursement_items
  FOR EACH ROW EXECUTE FUNCTION update_reimb_total();

-- Bug report points auto-calc
CREATE OR REPLACE FUNCTION set_bug_points()
RETURNS TRIGGER AS $$
BEGIN
  NEW.points = CASE NEW.severity
    WHEN 'critical' THEN 25
    WHEN 'high' THEN 10
    WHEN 'medium' THEN 5
    WHEN 'low' THEN 2
    ELSE 0
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bug_points_trigger ON bug_reports;
CREATE TRIGGER bug_points_trigger
  BEFORE INSERT OR UPDATE OF severity ON bug_reports
  FOR EACH ROW EXECUTE FUNCTION set_bug_points();

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'member'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================
-- 14. SEED DATA (uncomment after first admin signup)
-- ============================
/*
INSERT INTO organizations (name, slug, plan, max_seats) VALUES
  ('Woulf Group', 'woulf-group', 'enterprise', 100),
  ('Logicorp', 'logicorp', 'professional', 15),
  ('TechForge Inc', 'techforge', 'enterprise', 50),
  ('GreenLeaf Supply', 'greenleaf', 'starter', 3),
  ('Pinnacle Group', 'pinnacle', 'professional', 25);

INSERT INTO org_branding (org_id, primary_color, secondary_color) VALUES
  ((SELECT id FROM organizations WHERE slug = 'woulf-group'), '#3B82F6', '#8B5CF6'),
  ((SELECT id FROM organizations WHERE slug = 'logicorp'), '#10B981', '#059669'),
  ((SELECT id FROM organizations WHERE slug = 'techforge'), '#F59E0B', '#D97706');

-- After Steve signs up via Supabase Auth:
-- UPDATE profiles SET role = 'super_admin', org_id = (SELECT id FROM organizations WHERE slug = 'woulf-group') WHERE email = 'steve@woulfgroup.com';
*/
