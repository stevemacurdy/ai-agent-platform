-- =============================================================================
-- WoulfAI Migration 018: Legacy Cleanup
-- Deprecates old tables superseded by new agent_* schema
-- Safe: renames instead of drops so data is preserved
-- =============================================================================

-- ── 1. Rename old `agents` table (from 006_four_layer_architecture) ──────────
-- Superseded by `agent_registry`
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agents' AND table_schema = 'public') THEN
    ALTER TABLE agents RENAME TO _legacy_agents_006;
    RAISE NOTICE 'Renamed agents → _legacy_agents_006';
  END IF;
END $$;

-- ── 2. Rename old `company_agent_access` (from 005_deploy_5_agents) ──────────
-- Superseded by `agent_company_access`
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_agent_access' AND table_schema = 'public') THEN
    ALTER TABLE company_agent_access RENAME TO _legacy_company_agent_access_005;
    RAISE NOTICE 'Renamed company_agent_access → _legacy_company_agent_access_005';
  END IF;
END $$;

-- ── 3. Rename old `user_agents` (from 006_four_layer_architecture) ───────────
-- Superseded by `agent_user_permissions`
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_agents' AND table_schema = 'public') THEN
    ALTER TABLE user_agents RENAME TO _legacy_user_agents_006;
    RAISE NOTICE 'Renamed user_agents → _legacy_user_agents_006';
  END IF;
END $$;

-- ── 4. Rename old `user_agent_access` (from 009) ────────────────────────────
-- Superseded by `agent_user_permissions`
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_agent_access' AND table_schema = 'public') THEN
    ALTER TABLE user_agent_access RENAME TO _legacy_user_agent_access_009;
    RAISE NOTICE 'Renamed user_agent_access → _legacy_user_agent_access_009';
  END IF;
END $$;

-- ── 5. Update agent_clicks FK to point to agent_registry ─────────────────────
-- agent_clicks.agent_slug currently references agents(slug) which we just renamed
-- Re-point it to agent_registry.slug
DO $$ BEGIN
  ALTER TABLE agent_clicks DROP CONSTRAINT IF EXISTS agent_clicks_agent_slug_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE agent_clicks ADD CONSTRAINT agent_clicks_agent_slug_fkey
    FOREIGN KEY (agent_slug) REFERENCES agent_registry(slug);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 6. Update leads FK similarly ─────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_agent_slug_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE leads ADD CONSTRAINT leads_agent_slug_fkey
    FOREIGN KEY (agent_slug) REFERENCES agent_registry(slug);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 7. Comment legacy tables for clarity ─────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_legacy_agents_006') THEN
    COMMENT ON TABLE _legacy_agents_006 IS 'DEPRECATED: Old agent registry from migration 006. Superseded by agent_registry. Safe to drop after 2026-04-01.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_legacy_company_agent_access_005') THEN
    COMMENT ON TABLE _legacy_company_agent_access_005 IS 'DEPRECATED: Old company access from migration 005. Superseded by agent_company_access. Safe to drop after 2026-04-01.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_legacy_user_agents_006') THEN
    COMMENT ON TABLE _legacy_user_agents_006 IS 'DEPRECATED: Old user-agent perms from migration 006. Superseded by agent_user_permissions. Safe to drop after 2026-04-01.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_legacy_user_agent_access_009') THEN
    COMMENT ON TABLE _legacy_user_agent_access_009 IS 'DEPRECATED: Old user access from migration 009. Superseded by agent_user_permissions. Safe to drop after 2026-04-01.';
  END IF;
END $$;

SELECT 'Migration 018 complete: legacy tables renamed with _legacy_ prefix' AS status;
