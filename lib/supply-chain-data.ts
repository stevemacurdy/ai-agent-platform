// ─── Supply Chain Agent Data Layer ────────────────────────
// Inventory levels, supplier performance, lead times,
// demand forecasting, and reorder optimization.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getERPConnection(companyId: string): Promise<string | null> {
  try {
    const sb = supabaseAdmin();
    const { data } = await (sb as any)
      .from('integration_connections')
      .select('connection_id')
      .eq('company_id', companyId)
      .eq('category', 'erp')
      .eq('status', 'active')
      .single();
    return data?.connection_id || null;
  } catch { return null; }
}

// ─── Types ──────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantityOnHand: number;
  reorderPoint: number;
  reorderQty: number;
  unitCost: number;
  totalValue: number;
  daysOfSupply: number;
  status: 'healthy' | 'low' | 'critical' | 'overstock';
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  onTimeRate: number;
  qualityScore: number;
  avgLeadDays: number;
  activeOrders: number;
  totalSpendYTD: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastDelivery: string;
  nextExpectedDelivery: string | null;
}

export interface DemandForecast {
  month: string;
  projected: number;
  actual: number | null;
  confidence: number;
  trend: 'up' | 'down' | 'flat';
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: number;
  totalValue: number;
  status: 'draft' | 'submitted' | 'confirmed' | 'in-transit' | 'delivered' | 'late';
  orderDate: string;
  expectedDelivery: string;
  daysUntilDelivery: number;
}

export interface SupplyChainData {
  source: 'live' | 'demo';
  provider?: string;
  inventory: InventoryItem[];
  suppliers: Supplier[];
  forecast: DemandForecast[];
  purchaseOrders: PurchaseOrder[];
  summary: {
    totalSKUs: number;
    totalInventoryValue: number;
    lowStockItems: number;
    criticalItems: number;
    overstockItems: number;
    avgDaysOfSupply: number;
    supplierCount: number;
    avgOnTimeRate: number;
    openPOs: number;
    latePOs: number;
    inventoryTurnover: number;
  };
  recommendations: string[];
}

// ─── Main data fetcher ──────────────────────────────────

export async function getSupplyChainData(companyId: string): Promise<SupplyChainData> {
  const connId = await getERPConnection(companyId);
  if (connId) { /* Future: live ERP data */ }
  return getDemoSupplyChain();
}

function getDemoSupplyChain(): SupplyChainData {
  const inventory: InventoryItem[] = [
    { id: 'inv-1', sku: 'RACK-STD-48', name: 'Standard Pallet Rack Beam 48"', category: 'Racking', quantityOnHand: 340, reorderPoint: 200, reorderQty: 500, unitCost: 42, totalValue: 14280, daysOfSupply: 45, status: 'healthy', location: 'Bay A' },
    { id: 'inv-2', sku: 'CONV-BELT-24', name: 'Conveyor Belt Section 24"', category: 'Conveyors', quantityOnHand: 28, reorderPoint: 30, reorderQty: 50, unitCost: 385, totalValue: 10780, daysOfSupply: 12, status: 'low', location: 'Bay C' },
    { id: 'inv-3', sku: 'MOTOR-1HP', name: '1HP Drive Motor', category: 'Motors', quantityOnHand: 6, reorderPoint: 10, reorderQty: 20, unitCost: 620, totalValue: 3720, daysOfSupply: 8, status: 'critical', location: 'Parts Room' },
    { id: 'inv-4', sku: 'BOLT-GR8-M12', name: 'Grade 8 Bolt M12x50mm', category: 'Fasteners', quantityOnHand: 4200, reorderPoint: 1000, reorderQty: 5000, unitCost: 0.45, totalValue: 1890, daysOfSupply: 120, status: 'overstock', location: 'Bay B' },
    { id: 'inv-5', sku: 'WIRE-DECK-42', name: 'Wire Mesh Deck 42x46', category: 'Racking', quantityOnHand: 180, reorderPoint: 100, reorderQty: 200, unitCost: 28, totalValue: 5040, daysOfSupply: 35, status: 'healthy', location: 'Bay A' },
    { id: 'inv-6', sku: 'LABEL-THERM', name: 'Thermal Label Roll 4x6', category: 'Supplies', quantityOnHand: 45, reorderPoint: 50, reorderQty: 100, unitCost: 12, totalValue: 540, daysOfSupply: 15, status: 'low', location: 'Office' },
    { id: 'inv-7', sku: 'SAFETY-VEST-L', name: 'Hi-Vis Safety Vest Large', category: 'Safety', quantityOnHand: 3, reorderPoint: 15, reorderQty: 50, unitCost: 18, totalValue: 54, daysOfSupply: 4, status: 'critical', location: 'Safety Cage' },
    { id: 'inv-8', sku: 'STRETCH-WRAP', name: 'Stretch Wrap 18" 80ga', category: 'Supplies', quantityOnHand: 24, reorderPoint: 12, reorderQty: 48, unitCost: 32, totalValue: 768, daysOfSupply: 30, status: 'healthy', location: 'Shipping' },
    { id: 'inv-9', sku: 'UPRIGHT-192', name: 'Rack Upright Frame 192"', category: 'Racking', quantityOnHand: 85, reorderPoint: 40, reorderQty: 60, unitCost: 165, totalValue: 14025, daysOfSupply: 52, status: 'healthy', location: 'Bay A' },
    { id: 'inv-10', sku: 'PHOTO-SENSOR', name: 'Photoelectric Sensor', category: 'Controls', quantityOnHand: 12, reorderPoint: 8, reorderQty: 20, unitCost: 145, totalValue: 1740, daysOfSupply: 22, status: 'healthy', location: 'Parts Room' },
  ];

  const suppliers: Supplier[] = [
    { id: 'sup-1', name: 'Unistrut Midwest', category: 'Racking & Steel', onTimeRate: 92, qualityScore: 94, avgLeadDays: 14, activeOrders: 2, totalSpendYTD: 42000, riskLevel: 'low', lastDelivery: '2026-02-22', nextExpectedDelivery: '2026-03-08' },
    { id: 'sup-2', name: 'Daifuku North America', category: 'Conveyors & Automation', onTimeRate: 78, qualityScore: 96, avgLeadDays: 45, activeOrders: 1, totalSpendYTD: 128000, riskLevel: 'medium', lastDelivery: '2026-01-15', nextExpectedDelivery: '2026-03-20' },
    { id: 'sup-3', name: 'Grainger', category: 'MRO & Safety', onTimeRate: 97, qualityScore: 90, avgLeadDays: 3, activeOrders: 1, totalSpendYTD: 8500, riskLevel: 'low', lastDelivery: '2026-02-28', nextExpectedDelivery: '2026-03-05' },
    { id: 'sup-4', name: 'AutomationDirect', category: 'Controls & Sensors', onTimeRate: 95, qualityScore: 92, avgLeadDays: 5, activeOrders: 0, totalSpendYTD: 6200, riskLevel: 'low', lastDelivery: '2026-02-18', nextExpectedDelivery: null },
    { id: 'sup-5', name: 'Hytrol', category: 'Conveyor Components', onTimeRate: 68, qualityScore: 88, avgLeadDays: 35, activeOrders: 1, totalSpendYTD: 34000, riskLevel: 'high', lastDelivery: '2026-01-28', nextExpectedDelivery: '2026-03-25' },
  ];

  const forecast: DemandForecast[] = [
    { month: 'Jan 2026', projected: 145000, actual: 152000, confidence: 85, trend: 'up' },
    { month: 'Feb 2026', projected: 155000, actual: 148000, confidence: 82, trend: 'flat' },
    { month: 'Mar 2026', projected: 168000, actual: null, confidence: 78, trend: 'up' },
    { month: 'Apr 2026', projected: 175000, actual: null, confidence: 72, trend: 'up' },
    { month: 'May 2026', projected: 190000, actual: null, confidence: 65, trend: 'up' },
    { month: 'Jun 2026', projected: 185000, actual: null, confidence: 60, trend: 'flat' },
  ];

  const purchaseOrders: PurchaseOrder[] = [
    { id: 'po-1', supplier: 'Unistrut Midwest', items: 3, totalValue: 18500, status: 'in-transit', orderDate: '2026-02-20', expectedDelivery: '2026-03-08', daysUntilDelivery: 6 },
    { id: 'po-2', supplier: 'Daifuku North America', items: 1, totalValue: 42000, status: 'confirmed', orderDate: '2026-02-10', expectedDelivery: '2026-03-20', daysUntilDelivery: 18 },
    { id: 'po-3', supplier: 'Grainger', items: 8, totalValue: 1200, status: 'submitted', orderDate: '2026-03-01', expectedDelivery: '2026-03-05', daysUntilDelivery: 3 },
    { id: 'po-4', supplier: 'Hytrol', items: 2, totalValue: 15600, status: 'late', orderDate: '2026-01-15', expectedDelivery: '2026-02-20', daysUntilDelivery: -10 },
    { id: 'po-5', supplier: 'Unistrut Midwest', items: 5, totalValue: 8200, status: 'draft', orderDate: '2026-03-02', expectedDelivery: '2026-03-16', daysUntilDelivery: 14 },
  ];

  const lowStock = inventory.filter(i => i.status === 'low').length;
  const critical = inventory.filter(i => i.status === 'critical').length;
  const overstock = inventory.filter(i => i.status === 'overstock').length;

  return {
    source: 'demo',
    inventory,
    suppliers,
    forecast,
    purchaseOrders,
    summary: {
      totalSKUs: inventory.length,
      totalInventoryValue: inventory.reduce((s, i) => s + i.totalValue, 0),
      lowStockItems: lowStock,
      criticalItems: critical,
      overstockItems: overstock,
      avgDaysOfSupply: Math.round(inventory.reduce((s, i) => s + i.daysOfSupply, 0) / inventory.length),
      supplierCount: suppliers.length,
      avgOnTimeRate: Math.round(suppliers.reduce((s, sp) => s + sp.onTimeRate, 0) / suppliers.length),
      openPOs: purchaseOrders.filter(p => p.status !== 'delivered').length,
      latePOs: purchaseOrders.filter(p => p.status === 'late').length,
      inventoryTurnover: 6.2,
    },
    recommendations: [
      '2 critical items (1HP motors, safety vests) need immediate reorder — place POs today',
      'Hytrol PO is 10 days late — escalate with supplier and identify backup source',
      'Grade 8 bolts are overstocked at 120 days supply — reduce next order quantity',
      'Conveyor belt stock drops below reorder point in 12 days — trigger PO to Daifuku',
      'Demand forecast shows 15% increase through May — pre-order racking components for Q2 projects',
    ],
  };
}
