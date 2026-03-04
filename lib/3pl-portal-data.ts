// ============================================================================
// 3PL Customer Portal — Types, Demo Data, Utilities
// ============================================================================

/* ---------- Types --------------------------------------------------------- */

export interface Portal3PLCustomer {
  id: string;
  company_id?: string;
  customer_name: string;
  customer_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  billing_address: Address;
  shipping_address: Address;
  contract_start: string;
  contract_end: string;
  contract_url: string;
  terms_url: string;
  monthly_minimum: number;
  storage_rate_pallet: number;
  handling_rate_in: number;
  handling_rate_out: number;
  payment_terms: string;
  auto_pay_enabled: boolean;
  auto_pay_discount: number;
  convenience_fee_rate: number;
  stripe_customer_id?: string;
  api_key?: string;
  api_webhook_url?: string;
  status: 'active' | 'suspended' | 'onboarding' | 'terminated';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export type ProductType = 'powder' | 'cube' | 'whole' | 'liquid' | 'hazmat' | 'perishable';
export type UnitOfMeasure = 'pallet' | 'case' | 'bag' | 'box' | 'gallon' | 'lb' | 'each';
export type InventoryStatus = 'available' | 'allocated' | 'hold' | 'damaged' | 'expired' | 'quarantine';
export type OrderStatus = 'pending' | 'processing' | 'picking' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type InvoiceStatus = 'draft' | 'posted' | 'partial' | 'paid' | 'overdue' | 'credited' | 'written-off';
export type ShipMethod = 'ground' | 'express' | 'freight' | 'ltl' | 'ftl' | 'pickup' | 'other';
export type PaymentTimeliness = 'on-time' | 'late-15' | 'late-30';

export interface InventoryItem {
  id: string;
  customer_id: string;
  sku: string;
  lot_number: string;
  description: string;
  manufacturer: string;
  product_type: ProductType;
  date_received: string;
  expiration_date: string | null;
  quantity_on_hand: number;
  quantity_allocated: number;
  quantity_available: number;
  unit_of_measure: UnitOfMeasure;
  weight_per_unit: number;
  total_weight: number;
  warehouse_zone: string;
  bin_location: string;
  pallet_count: number;
  case_count: number;
  receiving_photos: string[];
  status: InventoryStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderLineItem {
  inventory_id: string;
  sku: string;
  description: string;
  unit_type: UnitOfMeasure;
  quantity: number;
  weight_per_unit: number;
  total_weight: number;
  product_type: ProductType;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  po_number: string;
  ship_to_name: string;
  ship_to_address: Address;
  ship_method: ShipMethod;
  shipping_class?: string;
  carrier: string;
  tracking_number?: string;
  requested_ship_date: string;
  actual_ship_date?: string;
  status: OrderStatus;
  line_items: OrderLineItem[];
  total_weight: number;
  total_pallets: number;
  total_cases: number;
  bol_number: string;
  bol_data: Record<string, unknown>;
  bol_pdf_url?: string;
  po_pdf_url?: string;
  coi_url?: string;
  asn_documents: string[];
  shipping_photos: string[];
  special_instructions?: string;
  placed_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  storage_charges: number;
  handling_in_charges: number;
  handling_out_charges: number;
  accessorial_charges: number;
  line_items: InvoiceLineItem[];
  subtotal: number;
  discount_amount: number;
  discount_reason?: string;
  convenience_fee: number;
  total_due: number;
  amount_paid: number;
  balance_due: number;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  stripe_payment_id?: string;
  status: InvoiceStatus;
  days_late: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  category: 'storage' | 'handling-in' | 'handling-out' | 'accessorial';
}

export interface Payment {
  id: string;
  customer_id: string;
  invoice_id: string;
  amount: number;
  convenience_fee: number;
  discount_applied: number;
  net_amount: number;
  payment_method: string;
  stripe_payment_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  days_from_due: number;
  timeliness: PaymentTimeliness;
  notes?: string;
  created_at: string;
}

export interface Document3PL {
  id: string;
  customer_id: string;
  order_id?: string;
  doc_type: 'po' | 'bol' | 'coi' | 'asn' | 'contract' | 'invoice' | 'receiving-photo' | 'shipping-photo' | 'other';
  title: string;
  file_url: string;
  file_type: string;
  uploaded_by: string;
  notes?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  subject: string;
  messages: ChatMessage[];
  status: 'open' | 'ai-handling' | 'escalated' | 'resolved' | 'closed';
  escalated_to?: string;
  escalated_at?: string;
  resolved_at?: string;
  satisfaction?: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface CartItem {
  inventory_id: string;
  sku: string;
  description: string;
  product_type: ProductType;
  unit_type: UnitOfMeasure;
  quantity: number;
  weight_per_unit: number;
  available: number;
}

export interface ReceivingRecord {
  id: string;
  date: string;
  vendor: string;
  items: { sku: string; lot: string; quantity: number; condition: string; description: string }[];
  pallet_count: number;
  status: 'received' | 'in-qc' | 'putaway-complete';
  photos: string[];
  putaway_locations: string[];
  notes: string;
  damage_notes?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'order' | 'shipment' | 'receiving' | 'payment' | 'invoice';
  description: string;
  timestamp: string;
  status: string;
}

/* ---------- Product Type Config ------------------------------------------ */

export const PRODUCT_TYPE_CONFIG: Record<ProductType, { label: string; color: string; bgColor: string; icon: string }> = {
  powder:     { label: 'Powder',     color: '#7C3AED', bgColor: '#EDE9FE', icon: '⛰️' },
  cube:       { label: 'Cube',       color: '#2563EB', bgColor: '#DBEAFE', icon: '📦' },
  whole:      { label: 'Whole',      color: '#059669', bgColor: '#D1FAE5', icon: '🌿' },
  liquid:     { label: 'Liquid',     color: '#0891B2', bgColor: '#CFFAFE', icon: '💧' },
  hazmat:     { label: 'Hazmat',     color: '#DC2626', bgColor: '#FEE2E2', icon: '☢️' },
  perishable: { label: 'Perishable', color: '#EA580C', bgColor: '#FFF7ED', icon: '🧊' },
};

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending:    { label: 'Pending',    color: '#2563EB', bgColor: '#DBEAFE' },
  processing: { label: 'Processing', color: '#D97706', bgColor: '#FEF3C7' },
  picking:    { label: 'Picking',    color: '#D97706', bgColor: '#FEF3C7' },
  packed:     { label: 'Packed',     color: '#D97706', bgColor: '#FEF3C7' },
  shipped:    { label: 'Shipped',    color: '#059669', bgColor: '#D1FAE5' },
  delivered:  { label: 'Delivered',  color: '#059669', bgColor: '#D1FAE5' },
  cancelled:  { label: 'Cancelled',  color: '#DC2626', bgColor: '#FEE2E2' },
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bgColor: string }> = {
  draft:        { label: 'Draft',      color: '#6B7280', bgColor: '#F3F4F6' },
  posted:       { label: 'Posted',     color: '#2563EB', bgColor: '#DBEAFE' },
  partial:      { label: 'Partial',    color: '#D97706', bgColor: '#FEF3C7' },
  paid:         { label: 'Paid',       color: '#059669', bgColor: '#D1FAE5' },
  overdue:      { label: 'Overdue',    color: '#DC2626', bgColor: '#FEE2E2' },
  credited:     { label: 'Credited',   color: '#7C3AED', bgColor: '#EDE9FE' },
  'written-off': { label: 'Written Off', color: '#6B7280', bgColor: '#F3F4F6' },
};

/* ---------- Demo Data ---------------------------------------------------- */

const DEMO_CUSTOMER_ID = 'demo-mws-001';

export const DEMO_CUSTOMER: Portal3PLCustomer = {
  id: DEMO_CUSTOMER_ID,
  customer_name: 'Mountain West Supplements',
  customer_code: 'MWS-001',
  contact_name: 'Jake Morrison',
  contact_email: 'jake@mwsupplements.com',
  contact_phone: '(801) 555-0192',
  billing_address: { street: '4521 Wasatch Blvd', city: 'Salt Lake City', state: 'UT', zip: '84124', country: 'US' },
  shipping_address: { street: '4521 Wasatch Blvd', city: 'Salt Lake City', state: 'UT', zip: '84124', country: 'US' },
  contract_start: '2025-01-01',
  contract_end: '2026-12-31',
  contract_url: '/docs/mws-contract-2025.pdf',
  terms_url: '/terms',
  monthly_minimum: 2500,
  storage_rate_pallet: 18,
  handling_rate_in: 8.5,
  handling_rate_out: 12,
  payment_terms: 'Net 30',
  auto_pay_enabled: false,
  auto_pay_discount: 3,
  convenience_fee_rate: 3.5,
  status: 'active',
  notes: 'Premium client — supplement and health product distributor.',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
};

export const DEMO_INVENTORY: InventoryItem[] = [
  { id: 'inv-001', customer_id: DEMO_CUSTOMER_ID, sku: 'WPI-5LB', lot_number: 'WPI-2024-112', description: 'Whey Protein Isolate 5lb Tub', manufacturer: 'ProBlend Nutrition', product_type: 'powder', date_received: '2025-11-15T00:00:00Z', expiration_date: '2026-12-15', quantity_on_hand: 450, quantity_allocated: 50, quantity_available: 400, unit_of_measure: 'each', weight_per_unit: 5.2, total_weight: 2340, warehouse_zone: 'A', bin_location: 'A-12-04', pallet_count: 8, case_count: 38, receiving_photos: ['/photos/wpi-recv-01.jpg', '/photos/wpi-recv-02.jpg'], status: 'available', created_at: '2025-11-15T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-002', customer_id: DEMO_CUSTOMER_ID, sku: 'CM-1KG', lot_number: 'CM-2024-089', description: 'Creatine Monohydrate 1kg Pouch', manufacturer: 'ProBlend Nutrition', product_type: 'powder', date_received: '2025-10-20T00:00:00Z', expiration_date: '2027-04-20', quantity_on_hand: 800, quantity_allocated: 20, quantity_available: 780, unit_of_measure: 'each', weight_per_unit: 2.3, total_weight: 1840, warehouse_zone: 'A', bin_location: 'A-14-02', pallet_count: 12, case_count: 67, receiving_photos: ['/photos/cm-recv-01.jpg'], status: 'available', created_at: '2025-10-20T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-003', customer_id: DEMO_CUSTOMER_ID, sku: 'MV-60CT', lot_number: 'MV-2025-003', description: 'Multivitamin 60ct Bottle', manufacturer: 'VitaPure Labs', product_type: 'cube', date_received: '2025-12-05T00:00:00Z', expiration_date: '2028-06-05', quantity_on_hand: 2400, quantity_allocated: 0, quantity_available: 2400, unit_of_measure: 'each', weight_per_unit: 0.45, total_weight: 1080, warehouse_zone: 'B', bin_location: 'B-03-08', pallet_count: 6, case_count: 100, receiving_photos: [], status: 'available', created_at: '2025-12-05T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-004', customer_id: DEMO_CUSTOMER_ID, sku: 'FO-120CT', lot_number: 'FO-2025-017', description: 'Fish Oil 120ct Softgels', manufacturer: 'OceanPure', product_type: 'perishable', date_received: '2025-09-10T00:00:00Z', expiration_date: '2026-03-28', quantity_on_hand: 1800, quantity_allocated: 100, quantity_available: 1700, unit_of_measure: 'each', weight_per_unit: 0.6, total_weight: 1080, warehouse_zone: 'C', bin_location: 'C-01-12', pallet_count: 4, case_count: 75, receiving_photos: ['/photos/fo-recv-01.jpg'], status: 'available', created_at: '2025-09-10T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-005', customer_id: DEMO_CUSTOMER_ID, sku: 'PWL-16OZ', lot_number: 'PW-2024-067', description: 'Pre-Workout Liquid 16oz Bottle', manufacturer: 'FuelForce', product_type: 'liquid', date_received: '2025-08-22T00:00:00Z', expiration_date: '2026-08-22', quantity_on_hand: 600, quantity_allocated: 0, quantity_available: 600, unit_of_measure: 'each', weight_per_unit: 1.1, total_weight: 660, warehouse_zone: 'D', bin_location: 'D-05-03', pallet_count: 3, case_count: 50, receiving_photos: [], status: 'available', created_at: '2025-08-22T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-006', customer_id: DEMO_CUSTOMER_ID, sku: 'BCAA-300G', lot_number: 'BC-2025-041', description: 'BCAAs Powder 300g Canister', manufacturer: 'ProBlend Nutrition', product_type: 'powder', date_received: '2026-01-12T00:00:00Z', expiration_date: '2027-07-12', quantity_on_hand: 350, quantity_allocated: 0, quantity_available: 350, unit_of_measure: 'each', weight_per_unit: 0.72, total_weight: 252, warehouse_zone: 'A', bin_location: 'A-16-01', pallet_count: 2, case_count: 15, receiving_photos: ['/photos/bcaa-recv-01.jpg'], status: 'available', created_at: '2026-01-12T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-007', customer_id: DEMO_CUSTOMER_ID, sku: 'CP-10OZ', lot_number: 'CP-2025-028', description: 'Collagen Peptides 10oz Tub', manufacturer: 'VitaPure Labs', product_type: 'powder', date_received: '2025-11-30T00:00:00Z', expiration_date: '2027-11-30', quantity_on_hand: 900, quantity_allocated: 30, quantity_available: 870, unit_of_measure: 'each', weight_per_unit: 0.68, total_weight: 612, warehouse_zone: 'A', bin_location: 'A-11-07', pallet_count: 4, case_count: 38, receiving_photos: [], status: 'available', created_at: '2025-11-30T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-008', customer_id: DEMO_CUSTOMER_ID, sku: 'VD3-2OZ', lot_number: 'VD-2025-055', description: 'Vitamin D3 Drops 2oz Bottle', manufacturer: 'OceanPure', product_type: 'perishable', date_received: '2025-12-18T00:00:00Z', expiration_date: '2026-06-18', quantity_on_hand: 1200, quantity_allocated: 0, quantity_available: 1200, unit_of_measure: 'each', weight_per_unit: 0.15, total_weight: 180, warehouse_zone: 'C', bin_location: 'C-02-05', pallet_count: 2, case_count: 50, receiving_photos: [], status: 'available', created_at: '2025-12-18T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-009', customer_id: DEMO_CUSTOMER_ID, sku: 'PB-12PK', lot_number: 'PB-2026-002', description: 'Protein Bars 12-Pack Box', manufacturer: 'FuelForce', product_type: 'cube', date_received: '2026-01-05T00:00:00Z', expiration_date: '2026-07-05', quantity_on_hand: 500, quantity_allocated: 0, quantity_available: 500, unit_of_measure: 'case', weight_per_unit: 3.6, total_weight: 1800, warehouse_zone: 'B', bin_location: 'B-07-03', pallet_count: 5, case_count: 500, receiving_photos: ['/photos/pb-recv-01.jpg', '/photos/pb-recv-02.jpg'], status: 'available', created_at: '2026-01-05T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-010', customer_id: DEMO_CUSTOMER_ID, sku: 'CS-1GAL', lot_number: 'CS-2025-019', description: 'Cleaning Solvent 1gal Drum', manufacturer: 'ChemSafe Inc', product_type: 'hazmat', date_received: '2025-07-14T00:00:00Z', expiration_date: null, quantity_on_hand: 80, quantity_allocated: 0, quantity_available: 80, unit_of_measure: 'gallon', weight_per_unit: 8.6, total_weight: 688, warehouse_zone: 'H', bin_location: 'H-01-01', pallet_count: 2, case_count: 0, receiving_photos: ['/photos/cs-recv-01.jpg'], status: 'available', created_at: '2025-07-14T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-011', customer_id: DEMO_CUSTOMER_ID, sku: 'ZMA-90CT', lot_number: 'ZM-2025-078', description: 'ZMA Sleep Support 90ct', manufacturer: 'VitaPure Labs', product_type: 'cube', date_received: '2025-10-03T00:00:00Z', expiration_date: '2027-10-03', quantity_on_hand: 1600, quantity_allocated: 0, quantity_available: 1600, unit_of_measure: 'each', weight_per_unit: 0.32, total_weight: 512, warehouse_zone: 'B', bin_location: 'B-04-11', pallet_count: 3, case_count: 67, receiving_photos: [], status: 'available', created_at: '2025-10-03T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-012', customer_id: DEMO_CUSTOMER_ID, sku: 'GS-16OZ', lot_number: 'GS-2025-033', description: 'Greens Superfood 16oz Powder', manufacturer: 'ProBlend Nutrition', product_type: 'powder', date_received: '2025-11-22T00:00:00Z', expiration_date: '2027-05-22', quantity_on_hand: 420, quantity_allocated: 0, quantity_available: 420, unit_of_measure: 'each', weight_per_unit: 1.1, total_weight: 462, warehouse_zone: 'A', bin_location: 'A-13-06', pallet_count: 3, case_count: 18, receiving_photos: [], status: 'available', created_at: '2025-11-22T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-013', customer_id: DEMO_CUSTOMER_ID, sku: 'MCT-32OZ', lot_number: 'MCT-2025-012', description: 'MCT Oil 32oz Bottle', manufacturer: 'OceanPure', product_type: 'liquid', date_received: '2025-12-01T00:00:00Z', expiration_date: '2027-06-01', quantity_on_hand: 300, quantity_allocated: 0, quantity_available: 300, unit_of_measure: 'each', weight_per_unit: 2.1, total_weight: 630, warehouse_zone: 'D', bin_location: 'D-03-08', pallet_count: 2, case_count: 25, receiving_photos: [], status: 'available', created_at: '2025-12-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-014', customer_id: DEMO_CUSTOMER_ID, sku: 'PRO-2LB', lot_number: 'PR-2026-001', description: 'Plant Protein 2lb Bag', manufacturer: 'FuelForce', product_type: 'powder', date_received: '2026-01-20T00:00:00Z', expiration_date: '2027-07-20', quantity_on_hand: 680, quantity_allocated: 0, quantity_available: 680, unit_of_measure: 'each', weight_per_unit: 2.2, total_weight: 1496, warehouse_zone: 'A', bin_location: 'A-15-02', pallet_count: 5, case_count: 28, receiving_photos: ['/photos/pro-recv-01.jpg'], status: 'available', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-015', customer_id: DEMO_CUSTOMER_ID, sku: 'EAA-250G', lot_number: 'EAA-2025-099', description: 'EAAs Essential Amino Acids 250g', manufacturer: 'ProBlend Nutrition', product_type: 'powder', date_received: '2025-12-28T00:00:00Z', expiration_date: '2027-12-28', quantity_on_hand: 550, quantity_allocated: 0, quantity_available: 550, unit_of_measure: 'each', weight_per_unit: 0.58, total_weight: 319, warehouse_zone: 'A', bin_location: 'A-17-04', pallet_count: 2, case_count: 23, receiving_photos: [], status: 'available', created_at: '2025-12-28T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'inv-016', customer_id: DEMO_CUSTOMER_ID, sku: 'PROB-30CT', lot_number: 'PB-2025-044', description: 'Probiotics 30ct Capsules', manufacturer: 'VitaPure Labs', product_type: 'perishable', date_received: '2025-11-10T00:00:00Z', expiration_date: '2026-05-10', quantity_on_hand: 2200, quantity_allocated: 0, quantity_available: 2200, unit_of_measure: 'each', weight_per_unit: 0.12, total_weight: 264, warehouse_zone: 'C', bin_location: 'C-04-02', pallet_count: 2, case_count: 92, receiving_photos: [], status: 'available', created_at: '2025-11-10T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
];

function makeMonth(offset: number): { start: string; end: string; due: string; period: string } {
  const d = new Date(2026, 2 - offset, 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const due = new Date(end.getFullYear(), end.getMonth() + 1, end.getDate());
  return {
    start: d.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    due: due.toISOString().split('T')[0],
    period: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
  };
}

function genInvoices(): Invoice[] {
  const invoices: Invoice[] = [];
  const baseStorage = 3200;
  const baseIn = 450;
  const baseOut = 960;
  const baseAccessorial = 237;

  const timelinessPattern: { daysLate: number; timeliness: PaymentTimeliness }[] = [
    { daysLate: 0, timeliness: 'on-time' },  // current month (unpaid)
    { daysLate: -5, timeliness: 'on-time' },
    { daysLate: 2, timeliness: 'on-time' },
    { daysLate: 0, timeliness: 'on-time' },
    { daysLate: 18, timeliness: 'late-15' },
    { daysLate: -3, timeliness: 'on-time' },
    { daysLate: 0, timeliness: 'on-time' },
    { daysLate: 37, timeliness: 'late-30' },
    { daysLate: 1, timeliness: 'on-time' },
    { daysLate: 22, timeliness: 'late-15' },
    { daysLate: -1, timeliness: 'on-time' },
    { daysLate: 40, timeliness: 'late-30' },
  ];

  for (let i = 0; i < 12; i++) {
    const m = makeMonth(i);
    const variation = (Math.sin(i * 1.3) * 200) + (i % 3 === 0 ? 100 : -50);
    const storage = +(baseStorage + variation * 0.4).toFixed(2);
    const handIn = +(baseIn + variation * 0.1).toFixed(2);
    const handOut = +(baseOut + variation * 0.2).toFixed(2);
    const accessorial = +(baseAccessorial + (i % 4 === 0 ? 85 : i % 3 === 0 ? -40 : 0)).toFixed(2);
    const subtotal = +(storage + handIn + handOut + accessorial).toFixed(2);
    const isCurrent = i === 0;
    const tp = timelinessPattern[i];

    invoices.push({
      id: `inv-${String(i + 1).padStart(3, '0')}`,
      customer_id: DEMO_CUSTOMER_ID,
      invoice_number: `INV-2026-${String(12 - i).padStart(2, '0')}`,
      period_start: m.start,
      period_end: m.end,
      storage_charges: storage,
      handling_in_charges: handIn,
      handling_out_charges: handOut,
      accessorial_charges: accessorial,
      line_items: [
        { description: `Pallet storage (${Math.round(storage / 18)} pallets)`, quantity: Math.round(storage / 18), rate: 18, amount: storage, category: 'storage' },
        { description: 'Inbound handling', quantity: Math.round(handIn / 8.5), rate: 8.5, amount: handIn, category: 'handling-in' },
        { description: 'Outbound handling', quantity: Math.round(handOut / 12), rate: 12, amount: handOut, category: 'handling-out' },
        { description: 'Accessorial charges', quantity: 1, rate: accessorial, amount: accessorial, category: 'accessorial' },
      ],
      subtotal,
      discount_amount: 0,
      convenience_fee: 0,
      total_due: subtotal,
      amount_paid: isCurrent ? 0 : subtotal,
      balance_due: isCurrent ? subtotal : 0,
      due_date: m.due,
      paid_date: isCurrent ? undefined : m.due,
      status: isCurrent ? 'posted' : 'paid',
      days_late: isCurrent ? 0 : tp.daysLate,
      created_at: m.start + 'T00:00:00Z',
      updated_at: m.end + 'T00:00:00Z',
    });
  }
  return invoices;
}

export const DEMO_INVOICES = genInvoices();

export const DEMO_PAYMENTS: Payment[] = DEMO_INVOICES.filter(inv => inv.status === 'paid').map((inv, i) => ({
  id: `pay-${String(i + 1).padStart(3, '0')}`,
  customer_id: DEMO_CUSTOMER_ID,
  invoice_id: inv.id,
  amount: inv.total_due,
  convenience_fee: 0,
  discount_applied: 0,
  net_amount: inv.total_due,
  payment_method: i % 3 === 0 ? 'ach' : 'card',
  status: 'completed' as const,
  days_from_due: inv.days_late,
  timeliness: inv.days_late <= 14 ? 'on-time' as const : inv.days_late <= 29 ? 'late-15' as const : 'late-30' as const,
  created_at: inv.paid_date ? inv.paid_date + 'T00:00:00Z' : inv.due_date + 'T00:00:00Z',
}));

export const DEMO_ORDERS: Order[] = [
  { id: 'ord-001', customer_id: DEMO_CUSTOMER_ID, order_number: 'ORD-20260228-0001', po_number: 'PO-MWS-2026-041', ship_to_name: 'Rocky Mountain Nutrition', ship_to_address: { street: '890 Commerce Dr', city: 'Denver', state: 'CO', zip: '80223' }, ship_method: 'ltl', carrier: 'FedEx Freight', tracking_number: 'FXFE-7829104562', requested_ship_date: '2026-03-01', actual_ship_date: '2026-03-01', status: 'shipped', line_items: [{ inventory_id: 'inv-001', sku: 'WPI-5LB', description: 'Whey Protein Isolate 5lb Tub', unit_type: 'case', quantity: 40, weight_per_unit: 5.2, total_weight: 208, product_type: 'powder' }, { inventory_id: 'inv-003', sku: 'MV-60CT', description: 'Multivitamin 60ct Bottle', unit_type: 'case', quantity: 100, weight_per_unit: 0.45, total_weight: 45, product_type: 'cube' }], total_weight: 253, total_pallets: 2, total_cases: 140, bol_number: 'BOL-20260228-0001', bol_data: {}, asn_documents: [], shipping_photos: ['/photos/ord1-ship-01.jpg'], special_instructions: 'Deliver to loading dock B', placed_by: 'Jake Morrison', created_at: '2026-02-26T14:30:00Z', updated_at: '2026-03-01T09:15:00Z' },
  { id: 'ord-002', customer_id: DEMO_CUSTOMER_ID, order_number: 'ORD-20260225-0002', po_number: 'PO-MWS-2026-039', ship_to_name: 'Fitness First Wholesale', ship_to_address: { street: '2210 Industrial Pkwy', city: 'Phoenix', state: 'AZ', zip: '85034' }, ship_method: 'ftl', carrier: 'YRC Freight', tracking_number: 'YRC-3391045728', requested_ship_date: '2026-02-27', actual_ship_date: '2026-02-27', status: 'delivered', line_items: [{ inventory_id: 'inv-002', sku: 'CM-1KG', description: 'Creatine Monohydrate 1kg Pouch', unit_type: 'case', quantity: 200, weight_per_unit: 2.3, total_weight: 460, product_type: 'powder' }, { inventory_id: 'inv-009', sku: 'PB-12PK', description: 'Protein Bars 12-Pack Box', unit_type: 'case', quantity: 150, weight_per_unit: 3.6, total_weight: 540, product_type: 'cube' }], total_weight: 1000, total_pallets: 4, total_cases: 350, bol_number: 'BOL-20260225-0002', bol_data: {}, asn_documents: [], shipping_photos: ['/photos/ord2-ship-01.jpg', '/photos/ord2-ship-02.jpg'], placed_by: 'Jake Morrison', created_at: '2026-02-23T10:00:00Z', updated_at: '2026-02-28T16:45:00Z' },
  { id: 'ord-003', customer_id: DEMO_CUSTOMER_ID, order_number: 'ORD-20260303-0012', po_number: 'PO-MWS-2026-043', ship_to_name: 'GNC Regional DC', ship_to_address: { street: '1500 Distribution Way', city: 'Las Vegas', state: 'NV', zip: '89115' }, ship_method: 'ltl', carrier: 'Estes Express', requested_ship_date: '2026-03-05', status: 'picking', line_items: [{ inventory_id: 'inv-001', sku: 'WPI-5LB', description: 'Whey Protein Isolate 5lb Tub', unit_type: 'case', quantity: 50, weight_per_unit: 5.2, total_weight: 260, product_type: 'powder' }, { inventory_id: 'inv-007', sku: 'CP-10OZ', description: 'Collagen Peptides 10oz Tub', unit_type: 'case', quantity: 30, weight_per_unit: 0.68, total_weight: 20.4, product_type: 'powder' }], total_weight: 280.4, total_pallets: 2, total_cases: 80, bol_number: 'BOL-20260303-0012', bol_data: {}, asn_documents: [], shipping_photos: [], special_instructions: 'Stack max 3 high — fragile labels', placed_by: 'Jake Morrison', created_at: '2026-03-03T08:20:00Z', updated_at: '2026-03-03T09:00:00Z' },
  { id: 'ord-004', customer_id: DEMO_CUSTOMER_ID, order_number: 'ORD-20260303-0015', po_number: 'PO-MWS-2026-044', ship_to_name: 'Vitamin Shoppe - Provo', ship_to_address: { street: '320 University Ave', city: 'Provo', state: 'UT', zip: '84601' }, ship_method: 'ground', carrier: 'UPS', requested_ship_date: '2026-03-06', status: 'pending', line_items: [{ inventory_id: 'inv-004', sku: 'FO-120CT', description: 'Fish Oil 120ct Softgels', unit_type: 'case', quantity: 100, weight_per_unit: 0.6, total_weight: 60, product_type: 'perishable' }, { inventory_id: 'inv-008', sku: 'VD3-2OZ', description: 'Vitamin D3 Drops 2oz Bottle', unit_type: 'case', quantity: 200, weight_per_unit: 0.15, total_weight: 30, product_type: 'perishable' }], total_weight: 90, total_pallets: 1, total_cases: 300, bol_number: 'BOL-20260303-0015', bol_data: {}, asn_documents: [], shipping_photos: [], placed_by: 'Jake Morrison', created_at: '2026-03-03T11:45:00Z', updated_at: '2026-03-03T11:45:00Z' },
  { id: 'ord-005', customer_id: DEMO_CUSTOMER_ID, order_number: 'ORD-20260215-0008', po_number: 'PO-MWS-2026-035', ship_to_name: 'Amazon FBA - SLC', ship_to_address: { street: '6050 W 2100 S', city: 'Salt Lake City', state: 'UT', zip: '84120' }, ship_method: 'pickup', carrier: 'Customer Pickup', tracking_number: undefined, requested_ship_date: '2026-02-17', actual_ship_date: '2026-02-17', status: 'delivered', line_items: [{ inventory_id: 'inv-006', sku: 'BCAA-300G', description: 'BCAAs Powder 300g Canister', unit_type: 'each', quantity: 100, weight_per_unit: 0.72, total_weight: 72, product_type: 'powder' }], total_weight: 72, total_pallets: 1, total_cases: 5, bol_number: 'BOL-20260215-0008', bol_data: {}, asn_documents: [], shipping_photos: [], placed_by: 'Jake Morrison', created_at: '2026-02-14T16:00:00Z', updated_at: '2026-02-17T10:30:00Z' },
  { id: 'ord-006', customer_id: DEMO_CUSTOMER_ID, order_number: 'ORD-20260210-0003', po_number: 'PO-MWS-2026-032', ship_to_name: 'Cancelled - Fitness First', ship_to_address: { street: '2210 Industrial Pkwy', city: 'Phoenix', state: 'AZ', zip: '85034' }, ship_method: 'ltl', carrier: 'YRC Freight', requested_ship_date: '2026-02-14', status: 'cancelled', line_items: [{ inventory_id: 'inv-005', sku: 'PWL-16OZ', description: 'Pre-Workout Liquid 16oz Bottle', unit_type: 'case', quantity: 60, weight_per_unit: 1.1, total_weight: 66, product_type: 'liquid' }], total_weight: 66, total_pallets: 1, total_cases: 60, bol_number: 'BOL-20260210-0003', bol_data: {}, asn_documents: [], shipping_photos: [], notes: 'Cancelled per customer request', placed_by: 'Jake Morrison', created_at: '2026-02-10T09:00:00Z', updated_at: '2026-02-11T14:00:00Z' },
];

export const DEMO_RECEIVING: ReceivingRecord[] = [
  { id: 'rcv-001', date: '2026-01-20T00:00:00Z', vendor: 'FuelForce Manufacturing', items: [{ sku: 'PRO-2LB', lot: 'PR-2026-001', quantity: 680, condition: 'Good', description: 'Plant Protein 2lb Bag' }], pallet_count: 5, status: 'putaway-complete', photos: ['/photos/rcv1-01.jpg', '/photos/rcv1-02.jpg', '/photos/rcv1-03.jpg'], putaway_locations: ['A-15-02'], notes: 'All pallets in good condition. Stretch wrap intact.', },
  { id: 'rcv-002', date: '2026-01-12T00:00:00Z', vendor: 'ProBlend Nutrition', items: [{ sku: 'BCAA-300G', lot: 'BC-2025-041', quantity: 350, condition: 'Good', description: 'BCAAs Powder 300g Canister' }], pallet_count: 2, status: 'putaway-complete', photos: ['/photos/rcv2-01.jpg'], putaway_locations: ['A-16-01'], notes: 'Standard receiving. No issues.' },
  { id: 'rcv-003', date: '2026-01-05T00:00:00Z', vendor: 'FuelForce Manufacturing', items: [{ sku: 'PB-12PK', lot: 'PB-2026-002', quantity: 500, condition: 'Good', description: 'Protein Bars 12-Pack Box' }], pallet_count: 5, status: 'putaway-complete', photos: ['/photos/rcv3-01.jpg', '/photos/rcv3-02.jpg'], putaway_locations: ['B-07-03'], notes: 'Temperature-controlled transfer. Product arrived at 68F.' },
  { id: 'rcv-004', date: '2026-02-18T00:00:00Z', vendor: 'ProBlend Nutrition', items: [{ sku: 'WPI-5LB', lot: 'WPI-2024-112', quantity: 200, condition: 'Good', description: 'Whey Protein Isolate 5lb Tub' }, { sku: 'GS-16OZ', lot: 'GS-2025-033', quantity: 120, condition: 'Good', description: 'Greens Superfood 16oz Powder' }], pallet_count: 4, status: 'putaway-complete', photos: ['/photos/rcv4-01.jpg', '/photos/rcv4-02.jpg'], putaway_locations: ['A-12-04', 'A-13-06'], notes: 'Replenishment shipment. All units accounted for.' },
  { id: 'rcv-005', date: '2026-03-01T00:00:00Z', vendor: 'OceanPure', items: [{ sku: 'FO-120CT', lot: 'FO-2025-017', quantity: 400, condition: '2 cases dented', description: 'Fish Oil 120ct Softgels' }], pallet_count: 2, status: 'in-qc', photos: ['/photos/rcv5-01.jpg', '/photos/rcv5-02.jpg', '/photos/rcv5-03.jpg'], putaway_locations: [], notes: 'QC review in progress for dented cases.', damage_notes: '2 cases with corner dents — contents appear undamaged. Awaiting customer disposition.' },
];

export const DEMO_ACTIVITY: ActivityEvent[] = [
  { id: 'evt-001', type: 'order', description: 'Order ORD-20260303-0015 placed for Vitamin Shoppe - Provo', timestamp: '2026-03-03T11:45:00Z', status: 'pending' },
  { id: 'evt-002', type: 'order', description: 'Order ORD-20260303-0012 moved to picking', timestamp: '2026-03-03T09:00:00Z', status: 'picking' },
  { id: 'evt-003', type: 'receiving', description: '2 pallets Fish Oil received from OceanPure — QC in progress', timestamp: '2026-03-01T14:30:00Z', status: 'in-qc' },
  { id: 'evt-004', type: 'shipment', description: 'Order ORD-20260228-0001 shipped via FedEx Freight', timestamp: '2026-03-01T09:15:00Z', status: 'shipped' },
  { id: 'evt-005', type: 'invoice', description: 'Invoice INV-2026-12 posted — $4,847.00 due Mar 31', timestamp: '2026-03-01T08:00:00Z', status: 'posted' },
];

/* ---------- Helpers ------------------------------------------------------- */

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateShort(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysUntil(d: string): number {
  const now = new Date();
  const target = new Date(d);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDemoKPIs() {
  const totalUnits = DEMO_INVENTORY.reduce((s, i) => s + i.quantity_on_hand, 0);
  const currentInvoice = DEMO_INVOICES[0];
  const openOrders = DEMO_ORDERS.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const latePayments = DEMO_PAYMENTS.filter(p => p.timeliness !== 'on-time');

  return {
    currentBalance: currentInvoice.total_due,
    balanceStatus: currentInvoice.status === 'overdue' ? 'overdue' : 'current',
    dueIn: daysUntil(currentInvoice.due_date),
    totalUnits,
    totalSKUs: DEMO_INVENTORY.length,
    openOrderCount: openOrders.length,
    paymentStatus: latePayments.length === 0 ? 'On Time' : 'Late',
    paymentHealth: latePayments.length === 0 ? 'good' : latePayments.some(p => p.timeliness === 'late-30') ? 'poor' : 'fair',
  };
}

export function generateOrderNumber(): string {
  const d = new Date();
  const date = d.toISOString().split('T')[0].replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `ORD-${date}-${seq}`;
}

export function generatePONumber(): string {
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `PO-MWS-2026-${seq}`;
}

export function generateBOLNumber(): string {
  const d = new Date();
  const date = d.toISOString().split('T')[0].replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `BOL-${date}-${seq}`;
}

export function getInventoryChartData() {
  const months: { month: string; powder: number; cube: number; whole: number; liquid: number; hazmat: number; perishable: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(2026, 2 - i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const factor = 1 - (i * 0.03) + (Math.sin(i * 0.8) * 0.05);
    months.push({
      month: label,
      powder: Math.round(3650 * factor),
      cube: Math.round(4500 * factor),
      whole: 0,
      liquid: Math.round(900 * factor),
      hazmat: Math.round(80 * factor),
      perishable: Math.round(5200 * factor * 0.85),
    });
  }
  return months;
}

export function getPaymentChartData() {
  return DEMO_INVOICES.slice().reverse().map(inv => ({
    month: new Date(inv.period_start).toLocaleDateString('en-US', { month: 'short' }),
    amount: inv.total_due,
    daysLate: inv.days_late,
    status: inv.status === 'posted' ? 'unpaid' : inv.days_late <= 14 ? 'on-time' : inv.days_late <= 29 ? 'late-15' : 'late-30',
    paidDate: inv.paid_date || null,
  }));
}
