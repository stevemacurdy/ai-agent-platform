-- ═══════════════════════════════════════════════════════════
-- Migration 019: Checkout auto-provisioning support
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. company_agent_access — tracks which agents each company can use
CREATE TABLE IF NOT EXISTS company_agent_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES agent_bundles(id),
  granted_by TEXT DEFAULT 'manual',        -- 'stripe-checkout' | 'manual' | 'trial'
  status TEXT DEFAULT 'active',            -- 'active' | 'revoked' | 'expired'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, agent_id)
);

-- 2. Add company_id to subscriptions if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- 3. Ensure company_members has unique constraint for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'company_members_company_id_user_id_key'
  ) THEN
    ALTER TABLE company_members
      ADD CONSTRAINT company_members_company_id_user_id_key UNIQUE(company_id, user_id);
  END IF;
END $$;

-- 4. Index for fast access lookups
CREATE INDEX IF NOT EXISTS idx_company_agent_access_company
  ON company_agent_access(company_id);
CREATE INDEX IF NOT EXISTS idx_company_agent_access_status
  ON company_agent_access(company_id, status);

-- 5. RLS policies for company_agent_access
ALTER TABLE company_agent_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company agent access"
  ON company_agent_access FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

-- Service role can do everything (for webhook)
CREATE POLICY "Service role full access on company_agent_access"
  ON company_agent_access FOR ALL
  USING (auth.role() = 'service_role');
