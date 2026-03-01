-- =============================================================================
-- WoulfAI Migration 014: Bundle Tables
-- Closes gaps: bundles (2.4), bundle pricing (10.1)
-- =============================================================================

-- ── Agent Bundles ────────────────────────────────────────────────────────────
-- A bundle is a named group of agents sold together (e.g. "Finance Suite")
CREATE TABLE IF NOT EXISTS agent_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  -- Pricing
  stripe_product_id TEXT,
  stripe_price_monthly TEXT,
  stripe_price_annual TEXT,
  price_monthly_cents INTEGER NOT NULL DEFAULT 0,
  price_annual_cents INTEGER NOT NULL DEFAULT 0,
  discount_pct INTEGER DEFAULT 0,           -- e.g. 20 = 20% off vs individual pricing
  -- Presentation
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  -- Targeting
  target_tier TEXT CHECK (target_tier IN ('starter', 'professional', 'enterprise')),
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bundles_active ON agent_bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_bundles_tier ON agent_bundles(target_tier);

-- ── Bundle → Agent Junction ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bundle_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES agent_bundles(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,                   -- FK to agent_registry.id
  display_order INTEGER DEFAULT 0,
  is_highlighted BOOLEAN DEFAULT false,     -- "star" agent in the bundle
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bundle_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_bundle_agents_bundle ON bundle_agents(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_agents_agent ON bundle_agents(agent_id);

-- ── Company Bundle Access ────────────────────────────────────────────────────
-- When a company buys a bundle, this tracks it
CREATE TABLE IF NOT EXISTS company_bundle_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  bundle_id UUID NOT NULL REFERENCES agent_bundles(id),
  plan_type TEXT NOT NULL DEFAULT 'trial' CHECK (plan_type IN ('trial', 'monthly', 'annual', 'comp', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'paused')),
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  granted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, bundle_id)
);

CREATE INDEX IF NOT EXISTS idx_cba_company ON company_bundle_access(company_id);
CREATE INDEX IF NOT EXISTS idx_cba_bundle ON company_bundle_access(bundle_id);
CREATE INDEX IF NOT EXISTS idx_cba_status ON company_bundle_access(status);

-- ── Seed: Example Bundles ────────────────────────────────────────────────────
INSERT INTO agent_bundles (slug, display_name, description, icon, price_monthly_cents, price_annual_cents, discount_pct, display_order, target_tier) VALUES
  ('finance-suite', 'Finance Suite', 'CFO + FinOps + Payables + Collections — complete financial intelligence', '💰', 149900, 1439000, 20, 1, 'professional'),
  ('sales-suite', 'Sales Suite', 'Sales + Sales Intel + Sales Coach + Marketing + SEO — full revenue engine', '🚀', 129900, 1247000, 20, 2, 'professional'),
  ('operations-suite', 'Operations Suite', 'Operations + WMS + Supply Chain + Org Lead — end-to-end ops management', '⚙️', 119900, 1151000, 20, 3, 'professional'),
  ('starter-pack', 'Starter Pack', 'Pick any 3 agents — perfect for getting started', '⭐', 89900, 863000, 15, 4, 'starter'),
  ('full-platform', 'Full Platform', 'All agents + priority support + custom integrations', '👑', 349900, 3359000, 25, 5, 'enterprise')
ON CONFLICT (slug) DO NOTHING;

SELECT 'Migration 014 complete: bundle tables created' AS status;
