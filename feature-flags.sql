-- ============================================================================
-- Feature Flags Table — Run in Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false NOT NULL,
  description TEXT,
  company_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read flags (needed for client-side checks)
CREATE POLICY "Anyone can read feature flags"
  ON feature_flags FOR SELECT
  USING (true);

-- Only super_admin can modify flags
CREATE POLICY "Super admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

-- Seed initial flags
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('odoo_integration', false, 'Live Odoo ERP connection for CFO/Operations agents'),
  ('hubspot_integration', false, 'Live HubSpot CRM connection for Sales agent'),
  ('employee_onboarding', false, 'Self-service employee onboarding flow'),
  ('external_portal', false, 'Customer-facing external portal access'),
  ('ai_chat_widget', true, 'Public-facing AI chat widget on landing page'),
  ('stripe_live_billing', false, 'Live Stripe billing (vs test mode)')
ON CONFLICT (key) DO NOTHING;
