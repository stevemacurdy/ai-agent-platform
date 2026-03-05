-- Migration 023: Drop legacy compatibility views and tables
-- Run after verifying no code references _legacy_ tables

-- Drop compatibility views first (they reference the legacy tables)
DROP VIEW IF EXISTS agent_usage_summary CASCADE;

-- Drop legacy tables (renamed with _legacy_ prefix in prior migrations)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%_legacy_%'
  LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    RAISE NOTICE 'Dropped: %', r.tablename;
  END LOOP;
END $$;

-- Ensure leads table exists (for contact form)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  interest TEXT DEFAULT 'general',
  message TEXT,
  source TEXT DEFAULT 'contact_form',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure onboarding_progress exists (for wizard)
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE,
  company_name TEXT,
  industry TEXT,
  team_size TEXT,
  selected_integrations JSONB DEFAULT '[]',
  team_emails JSONB DEFAULT '[]',
  selected_agents JSONB DEFAULT '[]',
  status TEXT DEFAULT 'in_progress',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure storage_usage table exists
CREATE TABLE IF NOT EXISTS storage_usage (
  company_id UUID PRIMARY KEY REFERENCES companies(id),
  bytes_used BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function for storage tracking
CREATE OR REPLACE FUNCTION increment_storage(p_company_id UUID, p_bytes BIGINT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO storage_usage (company_id, bytes_used, updated_at)
  VALUES (p_company_id, GREATEST(0, p_bytes), NOW())
  ON CONFLICT (company_id) DO UPDATE
  SET bytes_used = GREATEST(0, storage_usage.bytes_used + p_bytes),
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
