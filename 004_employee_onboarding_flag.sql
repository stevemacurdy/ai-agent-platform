-- supabase/migrations/004_employee_onboarding_flag.sql
-- Created: 2026-02-25
-- Description: Enable the employee_onboarding feature flag

UPDATE feature_flags SET enabled = true WHERE key = 'employee_onboarding';
