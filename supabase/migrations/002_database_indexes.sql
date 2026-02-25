-- supabase/migrations/002_database_indexes.sql
-- Created: 2026-02-25
-- Description: Performance indexes on frequently filtered columns

ALTER DATABASE postgres SET statement_timeout = '30s';

CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user_company ON company_members(user_id, company_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_access_user_id ON user_agent_access(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

DO $$
BEGIN
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_cfo_data_cid ON agent_cfo_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_sales_data_cid ON agent_sales_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_hr_data_cid ON agent_hr_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_operations_data_cid ON agent_operations_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_marketing_data_cid ON agent_marketing_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_subscriptions_cid ON subscriptions(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundles(is_active); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_chat_sessions_email ON chat_sessions(visitor_email); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
END $$;
