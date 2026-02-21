-- WoulfAI — Pricing + Auth + Invites Migration

-- 1. Plans table
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,     -- cents ($499 = 49900)
  price_annual INTEGER NOT NULL,      -- cents (20% discount)
  max_agents INTEGER DEFAULT 3,
  max_seats INTEGER DEFAULT 5,        -- -1 = unlimited
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO plans (id, name, price_monthly, price_annual, max_agents, max_seats) VALUES
  ('starter', 'Starter', 49900, 479000, 3, 5),
  ('professional', 'Professional', 120000, 1152000, 7, 25),
  ('enterprise', 'Enterprise', 249900, 2399000, 11, -1)
ON CONFLICT (id) DO UPDATE SET price_monthly = EXCLUDED.price_monthly, price_annual = EXCLUDED.price_annual;

-- 2. Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES plans(id) DEFAULT 'starter';

-- 3. Invites table
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  recipient_name TEXT,
  recipient_email TEXT NOT NULL,
  recipient_phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('employee', 'beta_tester', 'customer')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(recipient_email);

-- 4. Password reset codes
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact TEXT NOT NULL,              -- email or phone
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resets_contact ON password_resets(contact);

-- 5. Integration connections
CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  integration_id TEXT NOT NULL,       -- 'hubspot', 'quickbooks', etc.
  config JSONB DEFAULT '{}'::jsonb,   -- encrypted credentials
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error', 'disconnected')),
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see own integrations" ON integration_connections
  FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

SELECT 'Pricing + Auth + Invites tables created' as status;
