-- ============================================================
-- PART 1 (FIXED): Foundation Tables
-- ============================================================
-- Your companies table already exists but is missing columns.
-- This safely adds them without touching existing data.

-- Add missing columns to companies (each one is safe to re-run)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS odoo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS odoo_db TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_api_key TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Company Members (who belongs to which company)
CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_cm_user ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cm_company ON company_members(company_id);

-- Seed your three businesses
INSERT INTO companies (name, slug, odoo_url)
VALUES
  ('Woulf Group', 'woulf-group', 'https://woulf-group.odoo.com'),
  ('Clutch 3PL', 'clutch-3pl', NULL),
  ('WoulfAI', 'woulfai', NULL)
ON CONFLICT (slug) DO NOTHING;
