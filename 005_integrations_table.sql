-- supabase/migrations/005_integrations_table.sql
-- Created: 2026-02-25
-- Description: Per-company integration credentials (Odoo, HubSpot, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('hubspot', 'odoo', 'quickbooks', 'xero', 'slack', 'custom')),
  label TEXT DEFAULT '',
  config JSONB DEFAULT '{}',
  -- config stores: { api_key, base_url, access_token, refresh_token, oauth_data, custom fields }
  -- In production, consider pgcrypto encryption for sensitive values
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'pending_auth')),
  last_synced_at TIMESTAMPTZ,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, provider)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Admins can manage all integrations
DO $$ BEGIN
  CREATE POLICY "Admins can manage integrations"
    ON integrations FOR ALL
    USING (public.current_user_role() IN ('super_admin', 'admin'))
    WITH CHECK (public.current_user_role() IN ('super_admin', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Company admins can manage their own company integrations
DO $$ BEGIN
  CREATE POLICY "Company admins can manage own integrations"
    ON integrations FOR ALL
    USING (company_id IN (SELECT unnest(public.current_user_company_ids())))
    WITH CHECK (company_id IN (SELECT unnest(public.current_user_company_ids())));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_integrations_company_id ON integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
