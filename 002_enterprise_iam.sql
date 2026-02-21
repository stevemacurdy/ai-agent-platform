-- ============================================================================
-- WoulfAI Enterprise Migration: IAM + Multi-Tenant + Seats
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise', 'beta')),
  max_seats INTEGER DEFAULT 3,
  used_seats INTEGER DEFAULT 0,
  branding JSONB DEFAULT '{}',
  -- branding: { logo_url, primary_color, company_url }
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('super_admin', 'org_admin', 'employee', 'beta_tester', 'member')),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '{"sales_agent": false, "cfo_agent": false, "admin_analytics": false, "agent_creator": false}',
  avatar_url TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'invited', 'deactivated')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEAT USAGE TRACKING
CREATE TABLE IF NOT EXISTS seat_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  UNIQUE(org_id, user_id)
);

-- 4. BUG REPORTS TABLE (for Bug Bash)
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id),
  scenario TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  description TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'fixed', 'wontfix')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUDIT LOG (track admin actions)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'org', 'invoice', 'seat'
  target_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SALES CRM TABLES
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
  bio_notes TEXT, -- personality/life bio
  source TEXT, -- how they found us
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value DECIMAL(12,2) DEFAULT 0,
  stage TEXT DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  assigned_to UUID REFERENCES profiles(id),
  expected_close DATE,
  notes TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN ('note', 'call', 'email', 'meeting', 'stage_change', 'document')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;

-- Super admins can see everything
CREATE POLICY "super_admin_all" ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

CREATE POLICY "super_admin_orgs" ON organizations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

-- Users can read their own profile
CREATE POLICY "users_read_own" ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (limited fields handled by API)
CREATE POLICY "users_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Org admins can manage users in their org
CREATE POLICY "org_admin_manage" ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'org_admin'
      AND p.org_id = profiles.org_id
    )
  );

-- Org members can see their org
CREATE POLICY "org_members_read" ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- CRM policies - org-scoped
CREATE POLICY "contacts_org_access" ON contacts FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "deals_org_access" ON deals FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "activities_deal_access" ON deal_activities FOR ALL
  USING (deal_id IN (SELECT id FROM deals WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())));

-- Bug reports - reporters see their own, admins see all
CREATE POLICY "bug_reports_own" ON bug_reports FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "bug_reports_admin" ON bug_reports FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'employee')));

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_seat_usage_org ON seat_usage(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_org ON deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_reporter ON bug_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id);

-- 9. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION update_org_seat_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organizations SET used_seats = (
    SELECT COUNT(*) FROM seat_usage
    WHERE org_id = COALESCE(NEW.org_id, OLD.org_id)
    AND deactivated_at IS NULL
  ) WHERE id = COALESCE(NEW.org_id, OLD.org_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seat_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON seat_usage
  FOR EACH ROW EXECUTE FUNCTION update_org_seat_count();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orgs_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contacts_updated BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER deals_updated BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 10. SEED: Default WoulfGroup org + super admin profile
-- (Run after first user signs up via Supabase Auth)
-- INSERT INTO organizations (name, slug, plan, max_seats) VALUES ('Woulf Group', 'woulf-group', 'enterprise', 100);
-- UPDATE profiles SET role = 'super_admin', org_id = (SELECT id FROM organizations WHERE slug = 'woulf-group') WHERE email = 'steve@woulfgroup.com';
