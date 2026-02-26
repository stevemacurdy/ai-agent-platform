-- ============================================================================
-- 012: Pallet Tracking, Packing Lists, COA, QR Codes
-- ============================================================================

-- ── Warehouse Pallets (core tracking unit) ────────────────────────────────
CREATE TABLE IF NOT EXISTS warehouse_pallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  asn_id uuid REFERENCES asn_documents(id),
  order_id uuid REFERENCES warehouse_orders(id),
  pallet_number text NOT NULL,

  -- Key fields in priority order
  product_name text NOT NULL,           -- 1) What it is (apple, orange, cherry)
  product_form text NOT NULL,           -- 2) How it comes (Sliced, Ground, Cubed, Whole)
  expiration_date date,                 -- 3) Expiration date
  manufacturer text,                    -- 4) Manufacturer
  lot_number text,                      -- 5) Lot #
  received_date date,                   -- 6) Received date

  sku text,
  supplier_barcode text,                -- Supplier's own barcode value
  case_qty integer DEFAULT 0,
  case_weight numeric(10,2) DEFAULT 0,
  pallet_weight numeric(10,2),          -- Added after receiving
  pallet_weight_confirmed boolean DEFAULT false,

  qr_code_data jsonb,                   -- All pallet data for QR
  direction text NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'staged', 'picked', 'shipped')),

  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(company_id, pallet_number)
);

CREATE INDEX idx_pallets_company ON warehouse_pallets(company_id);
CREATE INDEX idx_pallets_asn ON warehouse_pallets(asn_id);
CREATE INDEX idx_pallets_order ON warehouse_pallets(order_id);
CREATE INDEX idx_pallets_lot ON warehouse_pallets(company_id, lot_number);
CREATE INDEX idx_pallets_product ON warehouse_pallets(company_id, product_name);
CREATE INDEX idx_pallets_status ON warehouse_pallets(company_id, status);

ALTER TABLE warehouse_pallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY pallets_select ON warehouse_pallets FOR SELECT USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY pallets_insert ON warehouse_pallets FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY pallets_update ON warehouse_pallets FOR UPDATE USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin', 'company_admin'))
);
CREATE POLICY pallets_delete ON warehouse_pallets FOR DELETE USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin', 'company_admin'))
);

-- ── Packing Lists ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packing_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  asn_id uuid REFERENCES asn_documents(id),
  order_id uuid REFERENCES warehouse_orders(id),
  packing_list_number text NOT NULL,
  direction text NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  file_name text,
  file_url text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),

  UNIQUE(company_id, packing_list_number)
);

ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY pl_select ON packing_lists FOR SELECT USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY pl_insert ON packing_lists FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY pl_update ON packing_lists FOR UPDATE USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin', 'company_admin'))
);

-- ── Packing List Items (per pallet) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS packing_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  packing_list_id uuid NOT NULL REFERENCES packing_lists(id) ON DELETE CASCADE,
  pallet_id uuid REFERENCES warehouse_pallets(id),
  product_name text NOT NULL,
  product_form text,
  sku text,
  lot_number text,
  case_qty integer DEFAULT 0,
  case_weight numeric(10,2) DEFAULT 0,
  pallet_weight numeric(10,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE packing_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY pli_select ON packing_list_items FOR SELECT USING (
  packing_list_id IN (SELECT id FROM packing_lists WHERE company_id IN (
    SELECT company_id FROM company_members WHERE user_id = auth.uid()
  ))
);
CREATE POLICY pli_insert ON packing_list_items FOR INSERT WITH CHECK (
  packing_list_id IN (SELECT id FROM packing_lists WHERE company_id IN (
    SELECT company_id FROM company_members WHERE user_id = auth.uid()
  ))
);

-- ── Certificates of Analysis ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates_of_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  asn_id uuid REFERENCES asn_documents(id),
  coa_number text NOT NULL,
  manufacturer text,
  lot_number text NOT NULL,
  expiration_date date,
  sku text,
  file_name text,
  file_url text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),

  UNIQUE(company_id, coa_number)
);

ALTER TABLE certificates_of_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY coa_select ON certificates_of_analysis FOR SELECT USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY coa_insert ON certificates_of_analysis FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY coa_update ON certificates_of_analysis FOR UPDATE USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin', 'company_admin'))
);

-- ── Manufacturer Quotes (inbound workflow start) ─────────────────────────
CREATE TABLE IF NOT EXISTS manufacturer_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  manufacturer text NOT NULL,
  quote_number text NOT NULL,
  product_name text NOT NULL,
  product_form text,
  quoted_price numeric(10,2),
  quoted_qty integer,
  unit_of_measure text DEFAULT 'LB',
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'accepted', 'po_sent', 'declined', 'expired')),
  po_id uuid REFERENCES purchase_orders(id),
  file_name text,
  file_url text,
  notes text,
  valid_until date,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),

  UNIQUE(company_id, quote_number)
);

ALTER TABLE manufacturer_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY quotes_select ON manufacturer_quotes FOR SELECT USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY quotes_insert ON manufacturer_quotes FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY quotes_update ON manufacturer_quotes FOR UPDATE USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin', 'company_admin'))
);

NOTIFY pgrst, 'reload schema';
