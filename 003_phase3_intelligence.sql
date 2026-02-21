-- ============================================================================
-- WoulfAI Phase 3: Contact Intelligence + Voice Debriefs
-- Run AFTER the master migration
-- ============================================================================

-- Contact Intelligence (AI-generated personality profiles)
CREATE TABLE IF NOT EXISTS contact_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  personality_type TEXT CHECK (personality_type IN ('Analytical','Driver','Expressive','Amiable')),
  buying_style TEXT,
  decision_speed TEXT CHECK (decision_speed IN ('fast','moderate','slow')),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('high','medium','low')),
  communication_pref TEXT CHECK (communication_pref IN ('email','slack','phone','in-person')),
  relationship_strength TEXT CHECK (relationship_strength IN ('strong','growing','new','at-risk')),
  do_list JSONB DEFAULT '[]',
  dont_list JSONB DEFAULT '[]',
  negotiation_tips TEXT,
  key_motivators JSONB DEFAULT '[]',
  objection_predictions JSONB DEFAULT '[]',
  reality_score INTEGER DEFAULT 0,
  score_factors JSONB DEFAULT '[]',
  next_best_action TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by TEXT DEFAULT 'ai',
  UNIQUE(contact_id)
);

-- Voice Debriefs
CREATE TABLE IF NOT EXISTS voice_debriefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name TEXT NOT NULL,
  contact_company TEXT,
  deal_title TEXT,
  outcome TEXT CHECK (outcome IN ('positive','neutral','negative')),
  stage_update TEXT,
  next_action TEXT,
  next_date DATE,
  notes TEXT,
  has_receipt BOOLEAN DEFAULT false,
  receipt_amount DECIMAL(10,2),
  receipt_category TEXT,
  submitted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Scans
CREATE TABLE IF NOT EXISTS document_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  vendor_name TEXT,
  contract_date DATE,
  contract_value DECIMAL(12,2),
  payment_terms TEXT,
  line_items JSONB DEFAULT '[]',
  special_conditions JSONB DEFAULT '[]',
  conflicts JSONB DEFAULT '[]',
  trump_rule_applied BOOLEAN DEFAULT false,
  final_payment_terms TEXT,
  draft_invoice_status TEXT DEFAULT 'draft' CHECK (draft_invoice_status IN ('draft','approved','rejected','synced')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  odoo_invoice_id INTEGER,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE contact_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_debriefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sa_intel" ON contact_intelligence FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "org_intel" ON contact_intelligence FOR SELECT
  USING (contact_id IN (SELECT id FROM contacts WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "sa_debriefs" ON voice_debriefs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "own_debriefs" ON voice_debriefs FOR ALL
  USING (submitted_by = auth.uid());

CREATE POLICY "sa_scans" ON document_scans FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "org_scans" ON document_scans FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_intel_contact ON contact_intelligence(contact_id);
CREATE INDEX IF NOT EXISTS idx_debriefs_submitted ON voice_debriefs(submitted_by);
CREATE INDEX IF NOT EXISTS idx_scans_org ON document_scans(org_id);
