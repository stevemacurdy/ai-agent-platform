-- ═══════════════════════════════════════════════════════
-- 3PL Customer Portal — 7 Tables + Indexes + RLS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS portal_3pl_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  customer_name TEXT NOT NULL,
  customer_code TEXT UNIQUE NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  billing_address JSONB DEFAULT '{}',
  shipping_address JSONB DEFAULT '{}',
  contract_start DATE,
  contract_end DATE,
  contract_url TEXT,
  terms_url TEXT DEFAULT '/terms',
  monthly_minimum DECIMAL(10,2) DEFAULT 0,
  storage_rate_pallet DECIMAL(8,2) DEFAULT 0,
  handling_rate_in DECIMAL(8,2) DEFAULT 0,
  handling_rate_out DECIMAL(8,2) DEFAULT 0,
  payment_terms TEXT DEFAULT 'Net 30',
  auto_pay_enabled BOOLEAN DEFAULT false,
  auto_pay_discount DECIMAL(5,2) DEFAULT 3.00,
  convenience_fee_rate DECIMAL(5,2) DEFAULT 3.50,
  stripe_customer_id TEXT,
  api_key TEXT,
  api_webhook_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','onboarding','terminated')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_3pl_customers_company ON portal_3pl_customers(company_id);
CREATE INDEX IF NOT EXISTS idx_3pl_customers_code ON portal_3pl_customers(customer_code);

CREATE TABLE IF NOT EXISTS portal_3pl_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES portal_3pl_customers(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  lot_number TEXT,
  description TEXT,
  manufacturer TEXT,
  product_type TEXT DEFAULT 'cube' CHECK (product_type IN ('powder','cube','whole','liquid','hazmat','perishable')),
  date_received TIMESTAMPTZ DEFAULT NOW(),
  expiration_date DATE,
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_allocated INTEGER DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_allocated) STORED,
  unit_of_measure TEXT DEFAULT 'each' CHECK (unit_of_measure IN ('pallet','case','bag','box','gallon','lb','each')),
  weight_per_unit DECIMAL(10,4),
  total_weight DECIMAL(12,4),
  warehouse_zone TEXT,
  bin_location TEXT,
  pallet_count INTEGER DEFAULT 0,
  case_count INTEGER DEFAULT 0,
  receiving_photos JSONB DEFAULT '[]',
  status TEXT DEFAULT 'available' CHECK (status IN ('available','allocated','hold','damaged','expired','quarantine')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_3pl_inventory_customer ON portal_3pl_inventory(customer_id);
CREATE INDEX IF NOT EXISTS idx_3pl_inventory_sku ON portal_3pl_inventory(sku);
CREATE INDEX IF NOT EXISTS idx_3pl_inventory_lot ON portal_3pl_inventory(lot_number);
CREATE INDEX IF NOT EXISTS idx_3pl_inventory_type ON portal_3pl_inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_3pl_inventory_expiration ON portal_3pl_inventory(expiration_date);

CREATE TABLE IF NOT EXISTS portal_3pl_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES portal_3pl_customers(id),
  order_number TEXT UNIQUE NOT NULL,
  po_number TEXT,
  ship_to_name TEXT,
  ship_to_address JSONB DEFAULT '{}',
  ship_method TEXT DEFAULT 'ground' CHECK (ship_method IN ('ground','express','freight','ltl','ftl','pickup','other')),
  shipping_class TEXT,
  carrier TEXT,
  tracking_number TEXT,
  requested_ship_date DATE,
  actual_ship_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','picking','packed','shipped','delivered','cancelled')),
  line_items JSONB DEFAULT '[]',
  total_weight DECIMAL(12,4),
  total_pallets INTEGER DEFAULT 0,
  total_cases INTEGER DEFAULT 0,
  bol_number TEXT,
  bol_data JSONB DEFAULT '{}',
  bol_pdf_url TEXT,
  po_pdf_url TEXT,
  coi_url TEXT,
  asn_documents JSONB DEFAULT '[]',
  shipping_photos JSONB DEFAULT '[]',
  special_instructions TEXT,
  placed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_3pl_orders_customer ON portal_3pl_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_3pl_orders_status ON portal_3pl_orders(status);
CREATE INDEX IF NOT EXISTS idx_3pl_orders_number ON portal_3pl_orders(order_number);

CREATE TABLE IF NOT EXISTS portal_3pl_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES portal_3pl_customers(id),
  invoice_number TEXT UNIQUE NOT NULL,
  period_start DATE,
  period_end DATE,
  storage_charges DECIMAL(10,2) DEFAULT 0,
  handling_in_charges DECIMAL(10,2) DEFAULT 0,
  handling_out_charges DECIMAL(10,2) DEFAULT 0,
  accessorial_charges DECIMAL(10,2) DEFAULT 0,
  line_items JSONB DEFAULT '[]',
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_reason TEXT,
  convenience_fee DECIMAL(10,2) DEFAULT 0,
  total_due DECIMAL(10,2) DEFAULT 0,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) GENERATED ALWAYS AS (total_due - amount_paid) STORED,
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','posted','partial','paid','overdue','credited','written-off')),
  days_late INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_3pl_invoices_customer ON portal_3pl_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_3pl_invoices_status ON portal_3pl_invoices(status);
CREATE INDEX IF NOT EXISTS idx_3pl_invoices_due ON portal_3pl_invoices(due_date);

CREATE TABLE IF NOT EXISTS portal_3pl_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES portal_3pl_customers(id),
  invoice_id UUID REFERENCES portal_3pl_invoices(id),
  amount DECIMAL(10,2) NOT NULL,
  convenience_fee DECIMAL(10,2) DEFAULT 0,
  discount_applied DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  payment_method TEXT DEFAULT 'card',
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','refunded')),
  days_from_due INTEGER DEFAULT 0,
  timeliness TEXT GENERATED ALWAYS AS (
    CASE
      WHEN days_from_due <= 0 THEN 'on-time'
      WHEN days_from_due BETWEEN 1 AND 14 THEN 'on-time'
      WHEN days_from_due BETWEEN 15 AND 29 THEN 'late-15'
      ELSE 'late-30'
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_3pl_payments_customer ON portal_3pl_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_3pl_payments_invoice ON portal_3pl_payments(invoice_id);

CREATE TABLE IF NOT EXISTS portal_3pl_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES portal_3pl_customers(id),
  order_id UUID REFERENCES portal_3pl_orders(id),
  doc_type TEXT NOT NULL CHECK (doc_type IN ('po','bol','coi','asn','contract','invoice','receiving-photo','shipping-photo','other')),
  title TEXT,
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  uploaded_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_3pl_documents_customer ON portal_3pl_documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_3pl_documents_order ON portal_3pl_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_3pl_documents_type ON portal_3pl_documents(doc_type);

CREATE TABLE IF NOT EXISTS portal_3pl_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES portal_3pl_customers(id),
  subject TEXT,
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'open' CHECK (status IN ('open','ai-handling','escalated','resolved','closed')),
  escalated_to TEXT,
  escalated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  satisfaction INTEGER CHECK (satisfaction BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_3pl_conversations_customer ON portal_3pl_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_3pl_conversations_status ON portal_3pl_conversations(status);

-- RLS
ALTER TABLE portal_3pl_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_3pl_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_3pl_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_3pl_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_3pl_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_3pl_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_3pl_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company isolation" ON portal_3pl_customers FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Customer isolation" ON portal_3pl_inventory FOR ALL
  USING (customer_id IN (SELECT id FROM portal_3pl_customers WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Customer isolation" ON portal_3pl_orders FOR ALL
  USING (customer_id IN (SELECT id FROM portal_3pl_customers WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Customer isolation" ON portal_3pl_invoices FOR ALL
  USING (customer_id IN (SELECT id FROM portal_3pl_customers WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Customer isolation" ON portal_3pl_payments FOR ALL
  USING (customer_id IN (SELECT id FROM portal_3pl_customers WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Customer isolation" ON portal_3pl_documents FOR ALL
  USING (customer_id IN (SELECT id FROM portal_3pl_customers WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Customer isolation" ON portal_3pl_conversations FOR ALL
  USING (customer_id IN (SELECT id FROM portal_3pl_customers WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));
