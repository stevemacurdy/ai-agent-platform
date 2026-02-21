-- ============================================================
-- WOULF 3PL Customer Portal — v1 Schema Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  branding_json JSONB DEFAULT '{}',
  contract_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ============================================================
-- 2. ORG_USERS
-- ============================================================
CREATE TABLE org_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('org_admin', 'member', 'warehouse_staff')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_org_users_org ON org_users(org_id);
CREATE INDEX idx_org_users_user ON org_users(user_id);

-- ============================================================
-- 3. WAREHOUSES
-- ============================================================
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ship_from_address_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. INVENTORY_PALLETS
-- ============================================================
CREATE TABLE inventory_pallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id),
  pallet_label_text TEXT,
  sku TEXT,
  product_name TEXT,
  lot_number TEXT,
  qty_each INTEGER DEFAULT 0,
  uom TEXT DEFAULT 'each',
  weight_total NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','allocated','picked','shipped','hold','damaged')),
  received_at TIMESTAMPTZ,
  last_movement_at TIMESTAMPTZ,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pallets_org ON inventory_pallets(org_id);
CREATE INDEX idx_pallets_status ON inventory_pallets(org_id, status);
CREATE INDEX idx_pallets_sku ON inventory_pallets(org_id, sku);

-- ============================================================
-- 5. PALLET_MEDIA
-- ============================================================
CREATE TABLE pallet_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pallet_id UUID NOT NULL REFERENCES inventory_pallets(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('label_photo','pallet_photo','other')),
  storage_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pallet_media_pallet ON pallet_media(pallet_id);

-- ============================================================
-- 6. INBOUND_ASNS
-- ============================================================
CREATE TABLE inbound_asns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','scheduled','receiving','received','closed')),
  reference_number TEXT,
  expected_arrival_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_asns_org ON inbound_asns(org_id);

-- ============================================================
-- 7. ASN_DOCUMENTS
-- ============================================================
CREATE TABLE asn_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asn_id UUID NOT NULL REFERENCES inbound_asns(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. RECEIPTS
-- ============================================================
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id),
  asn_id UUID REFERENCES inbound_asns(id),
  received_by_user_id UUID,
  received_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

CREATE INDEX idx_receipts_org ON receipts(org_id);

-- ============================================================
-- 9. RECEIPT_LINES
-- ============================================================
CREATE TABLE receipt_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  pallet_id UUID REFERENCES inventory_pallets(id),
  qty_received INTEGER DEFAULT 0,
  discrepancies_json JSONB DEFAULT '{}'
);

-- ============================================================
-- 10. ORDERS
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','picking','packed','shipped','delivered','canceled')),
  bol_id UUID,
  po_id UUID,
  destination_json JSONB DEFAULT '{}',
  shipping_json JSONB DEFAULT '{}',
  created_by_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_org ON orders(org_id);
CREATE INDEX idx_orders_status ON orders(org_id, status);

-- ============================================================
-- 11. ORDER_LINES
-- ============================================================
CREATE TABLE order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  pallet_id UUID REFERENCES inventory_pallets(id),
  sku TEXT,
  product_name TEXT,
  pick_type TEXT NOT NULL CHECK (pick_type IN ('full_pallet','weight','units')),
  qty_units INTEGER,
  qty_weight NUMERIC(12,2),
  uom TEXT,
  notes TEXT
);

CREATE INDEX idx_order_lines_order ON order_lines(order_id);

-- ============================================================
-- 12. ORDER_DOCUMENTS
-- ============================================================
CREATE TABLE order_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bol','po','customer_upload','other')),
  storage_url TEXT NOT NULL,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_docs_order ON order_documents(order_id);

-- ============================================================
-- 13. BILLING_EVENTS
-- ============================================================
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('wms','cfo','manual')),
  event_type TEXT NOT NULL CHECK (event_type IN ('storage','inbound','outbound','handling','accessorial','other')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  occurred_at TIMESTAMPTZ DEFAULT now(),
  order_id UUID REFERENCES orders(id),
  pallet_id UUID REFERENCES inventory_pallets(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_billing_org ON billing_events(org_id);
CREATE INDEX idx_billing_occurred ON billing_events(org_id, occurred_at);

-- ============================================================
-- 14. INVOICES
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','paid','void')),
  external_id TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_org ON invoices(org_id);

-- ============================================================
-- 15. INVOICE_LINES
-- ============================================================
CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  occurred_at TIMESTAMPTZ,
  order_id UUID REFERENCES orders(id),
  pallet_id UUID REFERENCES inventory_pallets(id)
);

-- ============================================================
-- 16. ORG_INTEGRATIONS
-- ============================================================
CREATE TABLE org_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('netsuite','odoo','salesforce','hubspot','custom')),
  status TEXT NOT NULL DEFAULT 'disconnected'
    CHECK (status IN ('disconnected','connecting','connected','error')),
  auth_json JSONB DEFAULT '{}',
  settings_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, provider)
);

CREATE INDEX idx_integrations_org ON org_integrations(org_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_pallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pallet_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_asns ENABLE ROW LEVEL SECURITY;
ALTER TABLE asn_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_integrations ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's org_ids
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT org_id FROM org_users WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations: users see only their orgs
CREATE POLICY org_select ON organizations
  FOR SELECT USING (id IN (SELECT get_user_org_ids()));

-- Org users: see members of your org
CREATE POLICY org_users_select ON org_users
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

-- Inventory pallets: org-scoped
CREATE POLICY pallets_select ON inventory_pallets
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY pallets_insert ON inventory_pallets
  FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY pallets_update ON inventory_pallets
  FOR UPDATE USING (org_id IN (SELECT get_user_org_ids()));

-- Pallet media: org-scoped
CREATE POLICY pallet_media_select ON pallet_media
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY pallet_media_insert ON pallet_media
  FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));

-- ASNs: org-scoped
CREATE POLICY asns_select ON inbound_asns
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY asns_insert ON inbound_asns
  FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY asns_update ON inbound_asns
  FOR UPDATE USING (org_id IN (SELECT get_user_org_ids()));

-- ASN documents: org-scoped
CREATE POLICY asn_docs_select ON asn_documents
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY asn_docs_insert ON asn_documents
  FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));

-- Receipts: org-scoped
CREATE POLICY receipts_select ON receipts
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY receipts_insert ON receipts
  FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));

-- Receipt lines: access through receipt
CREATE POLICY receipt_lines_select ON receipt_lines
  FOR SELECT USING (
    receipt_id IN (SELECT id FROM receipts WHERE org_id IN (SELECT get_user_org_ids()))
  );

-- Orders: org-scoped
CREATE POLICY orders_select ON orders
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY orders_insert ON orders
  FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY orders_update ON orders
  FOR UPDATE USING (org_id IN (SELECT get_user_org_ids()));

-- Order lines: access through order
CREATE POLICY order_lines_select ON order_lines
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE org_id IN (SELECT get_user_org_ids()))
  );
CREATE POLICY order_lines_insert ON order_lines
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE org_id IN (SELECT get_user_org_ids()))
  );

-- Order documents: org-scoped
CREATE POLICY order_docs_select ON order_documents
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY order_docs_insert ON order_documents
  FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));

-- Billing events: org-scoped
CREATE POLICY billing_select ON billing_events
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY billing_insert ON billing_events
  FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));

-- Invoices: org-scoped
CREATE POLICY invoices_select ON invoices
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

-- Invoice lines: access through invoice
CREATE POLICY invoice_lines_select ON invoice_lines
  FOR SELECT USING (
    invoice_id IN (SELECT id FROM invoices WHERE org_id IN (SELECT get_user_org_ids()))
  );

-- Integrations: org-scoped
CREATE POLICY integrations_select ON org_integrations
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY integrations_insert ON org_integrations
  FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));
CREATE POLICY integrations_update ON org_integrations
  FOR UPDATE USING (org_id IN (SELECT get_user_org_ids()));

-- ============================================================
-- SEED DATA (Demo org for testing)
-- ============================================================
INSERT INTO organizations (id, name, slug, branding_json) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Acme Foods Co.', 'acme-foods', '{"primary_color":"#2563eb","logo_url":null}');

INSERT INTO warehouses (id, name, ship_from_address_json) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'WOULF Warehouse A', '{"street":"1200 Industrial Pkwy","city":"Salt Lake City","state":"UT","zip":"84104","country":"US"}');
