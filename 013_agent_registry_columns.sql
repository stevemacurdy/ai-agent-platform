-- =============================================================================
-- WoulfAI Migration 013: agent_registry column additions
-- Closes gaps: lifecycle (9.3, 9.4), billing (10.5), capabilities (3.4),
--   infrastructure (6.5), onboarding (7.5), dashboard (7.4), A/B (11.4)
-- =============================================================================

-- ── Lifecycle & Audit ────────────────────────────────────────────────────────
ALTER TABLE agent_registry ADD COLUMN IF NOT EXISTS sunset_date TIMESTAMPTZ;
ALTER TABLE agent_registry ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);

-- ── Billing ──────────────────────────────────────────────────────────────────
ALTER TABLE agent_registry ADD COLUMN IF NOT EXISTS cost_to_serve_cents INTEGER DEFAULT 0;

-- ── AI Routing Capabilities ──────────────────────────────────────────────────
-- Example: {"can_read_invoices": true, "can_send_email": false, "domains": ["finance","accounting"]}
ALTER TABLE agent_registry ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{}';

-- ── Infrastructure Dependencies ──────────────────────────────────────────────
-- Example: {"requires_gpu": false, "worker_type": "railway", "min_memory_mb": 512}
ALTER TABLE agent_registry ADD COLUMN IF NOT EXISTS infrastructure JSONB DEFAULT '{}';

-- ── Onboarding Step Declarations ─────────────────────────────────────────────
-- Example: [{"step":1,"title":"Connect CRM","type":"integration"},{"step":2,"title":"Import Contacts","type":"action"}]
ALTER TABLE agent_registry ADD COLUMN IF NOT EXISTS onboarding_steps JSONB DEFAULT '[]';

-- ── Dashboard Component Declarations ─────────────────────────────────────────
-- Example: [{"type":"kpi","key":"revenue","label":"Monthly Revenue"},{"type":"chart","key":"pipeline","label":"Pipeline"}]
ALTER TABLE agent_registry ADD COLUMN IF NOT EXISTS dashboard_components JSONB DEFAULT '[]';

-- ── A/B Testing Variants ─────────────────────────────────────────────────────
-- Example: {"variant_a": {"tagline": "AI-powered finance"}, "variant_b": {"tagline": "Your virtual CFO"}}
ALTER TABLE agent_registry ADD COLUMN IF NOT EXISTS ab_variants JSONB DEFAULT NULL;

-- ── Fix status CHECK to include full lifecycle ───────────────────────────────
-- Drop old constraint if it exists (safe — does nothing if not found)
DO $$ BEGIN
  ALTER TABLE agent_registry DROP CONSTRAINT IF EXISTS agent_registry_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE agent_registry ADD CONSTRAINT agent_registry_status_check 
  CHECK (status IN ('draft', 'beta', 'live', 'deprecated', 'archived'));

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agent_registry_status ON agent_registry(status);
CREATE INDEX IF NOT EXISTS idx_agent_registry_sunset ON agent_registry(sunset_date) WHERE sunset_date IS NOT NULL;

SELECT 'Migration 013 complete: agent_registry columns added' AS status;
