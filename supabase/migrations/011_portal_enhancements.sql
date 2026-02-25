-- Migration: 011_portal_enhancements.sql
-- WoulfAI Portal: branding, feature requests, seat management
-- Warehouse 3PL Portal: inventory, orders, PO, BOL, ASN

-- ============================================================
-- WOULFAI PORTAL ENHANCEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS company_branding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#06B6D4',
  sidebar_style TEXT DEFAULT 'dark' CHECK (sidebar_style IN ('dark', 'light', 'branded')),
  welcome_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE company_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cb_select" ON company_branding FOR SELECT USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "cb_all" ON company_branding FOR ALL USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid() AND cm.role IN ('owner','admin'))
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general','agent','integration','ui','billing','other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new','reviewed','planned','building','shipped','declined')),
  votes INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fr_company ON feature_requests(company_id);
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fr_select" ON feature_requests FOR SELECT USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "fr_insert" ON feature_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fr_update" ON feature_requests FOR UPDATE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='max_seats') THEN
    ALTER TABLE companies ADD COLUMN max_seats INTEGER DEFAULT 5;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='portal_type') THEN
    ALTER TABLE companies ADD COLUMN portal_type TEXT DEFAULT 'woulfai' CHECK (portal_type IN ('woulfai','warehouse','both'));
  END IF;
END $$;

-- ============================================================
-- WAREHOUSE 3PL PORTAL
-- ============================================================

CREATE TABLE IF NOT EXISTS warehouse_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_code TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address_line1 TEXT, address_line2 TEXT, city TEXT, state TEXT, zip TEXT,
  country TEXT DEFAULT 'US',
  erp_type TEXT,
  erp_connection_config JSONB,
  order_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, customer_code)
);
CREATE INDEX IF NOT EXISTS idx_wc_company ON warehouse_customers(company_id);
ALTER TABLE warehouse_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_select" ON warehouse_customers FOR SELECT USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "wc_all" ON warehouse_customers FOR ALL USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid() AND cm.role IN ('owner','admin'))
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES warehouse_customers(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  upc TEXT,
  lot_number TEXT,
  expiration_date DATE,
  location_code TEXT,
  qty_on_hand INTEGER DEFAULT 0,
  qty_allocated INTEGER DEFAULT 0,
  qty_available INTEGER GENERATED ALWAYS AS (qty_on_hand - qty_allocated) STORED,
  unit_of_measure TEXT DEFAULT 'EA' CHECK (unit_of_measure IN ('EA','CS','PL','LB','KG')),
  items_per_case INTEGER DEFAULT 1,
  cases_per_pallet INTEGER DEFAULT 1,
  weight_per_unit NUMERIC(10,3),
  weight_unit TEXT DEFAULT 'LB' CHECK (weight_unit IN ('LB','KG')),
  hazmat_class TEXT,
  temperature_zone TEXT CHECK (temperature_zone IN ('ambient','refrigerated','frozen',NULL)),
  last_received TIMESTAMPTZ,
  last_shipped TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wi_company ON warehouse_inventory(company_id);
CREATE INDEX IF NOT EXISTS idx_wi_customer ON warehouse_inventory(customer_id);
CREATE INDEX IF NOT EXISTS idx_wi_sku ON warehouse_inventory(customer_id, sku);
ALTER TABLE warehouse_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wi_select" ON warehouse_inventory FOR SELECT USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "wi_all" ON warehouse_inventory FOR ALL USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid() AND cm.role IN ('owner','admin'))
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS warehouse_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES warehouse_customers(id),
  order_number TEXT NOT NULL,
  order_type TEXT DEFAULT 'outbound' CHECK (order_type IN ('outbound','inbound','transfer')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','confirmed','picking','packed','shipped','delivered','cancelled')),
  ship_to_name TEXT, ship_to_address1 TEXT, ship_to_address2 TEXT,
  ship_to_city TEXT, ship_to_state TEXT, ship_to_zip TEXT, ship_to_country TEXT DEFAULT 'US',
  carrier TEXT, service_level TEXT,
  requested_ship_date DATE, actual_ship_date DATE,
  tracking_number TEXT, po_number TEXT,
  special_instructions TEXT,
  total_pallets INTEGER DEFAULT 0, total_cases INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0, total_weight NUMERIC(12,3) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ, shipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, order_number)
);
CREATE INDEX IF NOT EXISTS idx_wo_company ON warehouse_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_wo_customer ON warehouse_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_wo_status ON warehouse_orders(status);
ALTER TABLE warehouse_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wo_select" ON warehouse_orders FOR SELECT USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "wo_insert" ON warehouse_orders FOR INSERT WITH CHECK (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "wo_update" ON warehouse_orders FOR UPDATE USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS warehouse_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES warehouse_orders(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES warehouse_inventory(id),
  sku TEXT NOT NULL, product_name TEXT NOT NULL,
  qty_ordered INTEGER NOT NULL, qty_picked INTEGER DEFAULT 0, qty_shipped INTEGER DEFAULT 0,
  order_unit TEXT DEFAULT 'EA' CHECK (order_unit IN ('EA','CS','PL','LB','KG')),
  unit_qty INTEGER DEFAULT 1,
  line_weight NUMERIC(10,3) DEFAULT 0,
  lot_number TEXT, special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_woi_order ON warehouse_order_items(order_id);
ALTER TABLE warehouse_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "woi_select" ON warehouse_order_items FOR SELECT USING (
  order_id IN (SELECT wo.id FROM warehouse_orders wo WHERE wo.company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "woi_all" ON warehouse_order_items FOR ALL USING (
  order_id IN (SELECT wo.id FROM warehouse_orders wo WHERE wo.company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS bills_of_lading (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES warehouse_orders(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  bol_number TEXT NOT NULL,
  shipper_name TEXT NOT NULL, shipper_address TEXT,
  consignee_name TEXT NOT NULL, consignee_address TEXT,
  carrier_name TEXT, carrier_scac TEXT, pro_number TEXT,
  ship_date DATE, delivery_date DATE,
  freight_charge_terms TEXT DEFAULT 'prepaid' CHECK (freight_charge_terms IN ('prepaid','collect','third_party')),
  special_instructions TEXT,
  hazmat BOOLEAN DEFAULT false, hazmat_class TEXT, hazmat_un_number TEXT,
  total_pieces INTEGER DEFAULT 0, total_weight NUMERIC(12,3) DEFAULT 0, total_pallets INTEGER DEFAULT 0,
  freight_class TEXT, nmfc_number TEXT,
  seal_number TEXT, trailer_number TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','finalized','signed','void')),
  signed_by TEXT, signed_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, bol_number)
);
CREATE INDEX IF NOT EXISTS idx_bol_order ON bills_of_lading(order_id);
ALTER TABLE bills_of_lading ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bol_select" ON bills_of_lading FOR SELECT USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "bol_all" ON bills_of_lading FOR ALL USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS bol_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bol_id UUID NOT NULL REFERENCES bills_of_lading(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  packaging_type TEXT DEFAULT 'PLT' CHECK (packaging_type IN ('PLT','CS','PC','DRM','CRT','BDL','OTH')),
  quantity INTEGER NOT NULL,
  weight NUMERIC(10,3) NOT NULL,
  weight_unit TEXT DEFAULT 'LB',
  freight_class TEXT, nmfc_number TEXT,
  hazmat BOOLEAN DEFAULT false, hazmat_class TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_boli_bol ON bol_items(bol_id);
ALTER TABLE bol_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boli_select" ON bol_items FOR SELECT USING (
  bol_id IN (SELECT b.id FROM bills_of_lading b WHERE b.company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "boli_all" ON bol_items FOR ALL USING (
  bol_id IN (SELECT b.id FROM bills_of_lading b WHERE b.company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS asn_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES warehouse_orders(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  asn_number TEXT,
  file_name TEXT NOT NULL, file_url TEXT NOT NULL, file_size INTEGER,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_asn_order ON asn_documents(order_id);
ALTER TABLE asn_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "asn_select" ON asn_documents FOR SELECT USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "asn_all" ON asn_documents FOR ALL USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES warehouse_orders(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  po_number TEXT NOT NULL,
  vendor_name TEXT, buyer_name TEXT, buyer_email TEXT,
  payment_terms TEXT, ship_via TEXT, fob TEXT, notes TEXT,
  subtotal NUMERIC(12,2) DEFAULT 0, tax NUMERIC(12,2) DEFAULT 0, total NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','received','cancelled')),
  pdf_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, po_number)
);
CREATE INDEX IF NOT EXISTS idx_po_order ON purchase_orders(order_id);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "po_select" ON purchase_orders FOR SELECT USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);
CREATE POLICY "po_all" ON purchase_orders FOR ALL USING (
  company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS po_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  sku TEXT, description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  unit_of_measure TEXT DEFAULT 'EA',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_poi_po ON po_items(po_id);
ALTER TABLE po_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "poi_select" ON po_items FOR SELECT USING (
  po_id IN (SELECT p.id FROM purchase_orders p WHERE p.company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role = 'super_admin')
);
CREATE POLICY "poi_all" ON po_items FOR ALL USING (
  po_id IN (SELECT p.id FROM purchase_orders p WHERE p.company_id IN (SELECT cm.company_id FROM company_members cm WHERE cm.user_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role = 'super_admin')
);
