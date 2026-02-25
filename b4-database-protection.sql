-- ============================================================================
-- B4: Database Query Protection
-- Run in Supabase SQL Editor
-- ============================================================================

-- 1. Statement timeout: kill any query running longer than 30 seconds
-- This prevents runaway queries from locking the database
ALTER DATABASE postgres SET statement_timeout = '30s';

-- 2. Indexes on frequently filtered columns
-- Based on actual .eq() usage patterns in the codebase

-- profiles.id is already PK (indexed)
-- companies.id is already PK (indexed)

-- company_members: filtered by user_id, company_id, and both together
CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user_company ON company_members(user_id, company_id);

-- user_agent_access: filtered by user_id
CREATE INDEX IF NOT EXISTS idx_user_agent_access_user_id ON user_agent_access(user_id);

-- companies: filtered by slug (used in lookups)
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- profiles: filtered by role (admin checks), email (login lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- chat_sessions: filtered by id (updates)
-- Already PK, but add index on visitor_email for lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor_email ON chat_sessions(visitor_email);

-- agent data tables: all filtered by company_id
-- These are the tenant isolation queries so they MUST be fast
CREATE INDEX IF NOT EXISTS idx_agent_cfo_data_company_id ON agent_cfo_data(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_sales_data_company_id ON agent_sales_data(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_hr_data_company_id ON agent_hr_data(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_operations_data_company_id ON agent_operations_data(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_marketing_data_company_id ON agent_marketing_data(company_id);

-- bundles: filtered by is_active
CREATE INDEX IF NOT EXISTS idx_bundles_is_active ON bundles(is_active);

-- subscriptions: filtered by company_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions(company_id);

-- leads: common lookup patterns
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- 3. Verify indexes were created
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
