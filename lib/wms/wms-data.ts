// ============================================================================
// WMS DATA ENGINE — Tenant-scoped demo data
// ============================================================================

export interface InventoryItem {
  sku: string; name: string; category: string; zone: string; aisle: string; bin: string
  quantity: number; reserved: number; available: number; reorderPoint: number
  unitCost: number; totalValue: number; velocity: 'A' | 'B' | 'C' | 'D'
  lastMovement: string; daysIdle: number; uom: string; supplier: string
}

export interface Movement {
  id: string; type: 'receipt' | 'shipment' | 'transfer'; reference: string
  status: 'pending' | 'in_progress' | 'completed'; sku: string; itemName: string
  from: string; to: string; qty: number; carrier?: string; tracking?: string
  scheduled: string; assignedTo?: string
}

export interface PickWave {
  id: string; waveNumber: string; status: 'planning' | 'released' | 'in_progress' | 'packed' | 'shipped'
  priority: 'urgent' | 'high' | 'normal'; orders: number; lines: number; units: number
  assignedTo: string; zone: string; progress: number; startedAt?: string
}

export interface CycleCount {
  id: string; zone: string; aisle: string; sku: string; itemName: string
  systemQty: number; countedQty: number; variance: number; variancePct: number
  status: 'pending' | 'counted' | 'reconciled'; countedBy?: string; date: string
}

export interface BinLocation {
  zone: string; aisle: string; bin: string; sku?: string; itemName?: string
  quantity: number; capacity: number; utilization: number
}

export interface AIInsight {
  id: string; type: 'reorder' | 'slotting' | 'dead_stock' | 'accuracy' | 'forecast'
  priority: 'critical' | 'warning' | 'info'
  title: string; description: string; impact: string; action: string
  status: 'pending' | 'approved' | 'deployed'
}

export interface WmsSnapshot {
  totalSKUs: number; totalUnits: number; totalValue: number
  accuracy: number; avgPickTime: number; utilization: number
  inboundToday: number; outboundToday: number
  lowStockAlerts: number; deadStockSKUs: number
  zones: { name: string; aisles: number; bins: number; utilization: number; color: string }[]
  inventory: InventoryItem[]
  inbound: Movement[]
  outbound: Movement[]
  pickWaves: PickWave[]
  cycleCounts: CycleCount[]
  locations: BinLocation[]
  aiInsights: AIInsight[]
  dailyBriefing: string
}

const TENANT_WMS: Record<string, WmsSnapshot> = {
  woulf: {
    totalSKUs: 342, totalUnits: 28450, totalValue: 1284000,
    accuracy: 97.8, avgPickTime: 4.2, utilization: 74,
    inboundToday: 4, outboundToday: 12,
    lowStockAlerts: 6, deadStockSKUs: 18,
    zones: [
      { name: 'A — Fast Pick', aisles: 6, bins: 144, utilization: 92, color: 'bg-emerald-500' },
      { name: 'B — Standard', aisles: 8, bins: 192, utilization: 78, color: 'bg-blue-500' },
      { name: 'C — Bulk Storage', aisles: 4, bins: 96, utilization: 65, color: 'bg-amber-500' },
      { name: 'D — Overflow', aisles: 3, bins: 72, utilization: 41, color: 'bg-gray-500' },
      { name: 'DOCK — Staging', aisles: 2, bins: 24, utilization: 88, color: 'bg-rose-500' },
    ],
    inventory: [
      { sku: 'WG-CONV-4824', name: '48" Powered Roller Conveyor Section', category: 'Conveyor', zone: 'A', aisle: '02', bin: 'A-02-04', quantity: 24, reserved: 6, available: 18, reorderPoint: 10, unitCost: 1450, totalValue: 34800, velocity: 'A', lastMovement: '2026-02-17', daysIdle: 0, uom: 'EA', supplier: 'Hytrol' },
      { sku: 'WG-RACK-9648', name: '96x48 Selective Pallet Rack Beam', category: 'Racking', zone: 'A', aisle: '01', bin: 'A-01-02', quantity: 156, reserved: 24, available: 132, reorderPoint: 50, unitCost: 42, totalValue: 6552, velocity: 'A', lastMovement: '2026-02-17', daysIdle: 0, uom: 'EA', supplier: 'Unarco' },
      { sku: 'WG-UPRT-1242', name: '12ft Upright Frame 42" Deep', category: 'Racking', zone: 'A', aisle: '01', bin: 'A-01-08', quantity: 64, reserved: 12, available: 52, reorderPoint: 20, unitCost: 185, totalValue: 11840, velocity: 'A', lastMovement: '2026-02-16', daysIdle: 1, uom: 'EA', supplier: 'Unarco' },
      { sku: 'WG-DOCK-HYD8', name: 'Hydraulic Dock Leveler 8x6', category: 'Dock Equipment', zone: 'B', aisle: '05', bin: 'B-05-01', quantity: 3, reserved: 1, available: 2, reorderPoint: 2, unitCost: 4800, totalValue: 14400, velocity: 'B', lastMovement: '2026-02-14', daysIdle: 3, uom: 'EA', supplier: 'Rite-Hite' },
      { sku: 'WG-SAFE-VEST', name: 'High-Vis Safety Vest Class III', category: 'Safety', zone: 'C', aisle: '10', bin: 'C-10-24', quantity: 240, reserved: 0, available: 240, reorderPoint: 50, unitCost: 12, totalValue: 2880, velocity: 'B', lastMovement: '2026-02-12', daysIdle: 5, uom: 'EA', supplier: 'Ergodyne' },
      { sku: 'WG-SORT-SHOE', name: 'Sliding Shoe Sorter Module', category: 'Conveyor', zone: 'B', aisle: '03', bin: 'B-03-06', quantity: 8, reserved: 2, available: 6, reorderPoint: 4, unitCost: 3200, totalValue: 25600, velocity: 'B', lastMovement: '2026-02-10', daysIdle: 7, uom: 'EA', supplier: 'Bastian Solutions' },
      { sku: 'WG-MEZZ-DECK', name: 'Mezzanine Deck Panel 4x8', category: 'Mezzanine', zone: 'C', aisle: '07', bin: 'C-07-01', quantity: 32, reserved: 0, available: 32, reorderPoint: 8, unitCost: 280, totalValue: 8960, velocity: 'C', lastMovement: '2026-01-28', daysIdle: 20, uom: 'EA', supplier: 'Wildeck' },
      { sku: 'WG-WRAP-18', name: 'Stretch Wrap 18" x 1500ft', category: 'Packaging', zone: 'A', aisle: '04', bin: 'A-04-12', quantity: 48, reserved: 8, available: 40, reorderPoint: 20, unitCost: 28, totalValue: 1344, velocity: 'A', lastMovement: '2026-02-17', daysIdle: 0, uom: 'RL', supplier: 'Sigma Stretch' },
      { sku: 'WG-BOLT-M12', name: 'M12x30 Hex Bolt Grade 8.8', category: 'Parts', zone: 'C', aisle: '12', bin: 'C-12-18', quantity: 2400, reserved: 0, available: 2400, reorderPoint: 500, unitCost: 0.45, totalValue: 1080, velocity: 'C', lastMovement: '2026-02-05', daysIdle: 12, uom: 'EA', supplier: 'Fastenal' },
      { sku: 'WG-GATE-PERS', name: 'Personnel Safety Gate 4ft', category: 'Safety', zone: 'D', aisle: '15', bin: 'D-15-02', quantity: 6, reserved: 0, available: 6, reorderPoint: 2, unitCost: 890, totalValue: 5340, velocity: 'D', lastMovement: '2025-11-14', daysIdle: 96, uom: 'EA', supplier: 'Kee Safety' },
      { sku: 'WG-LABEL-4X6', name: 'Thermal Label 4x6 Fanfold', category: 'Packaging', zone: 'A', aisle: '04', bin: 'A-04-15', quantity: 12, reserved: 4, available: 8, reorderPoint: 15, unitCost: 18, totalValue: 216, velocity: 'A', lastMovement: '2026-02-17', daysIdle: 0, uom: 'PK', supplier: 'Zebra' },
      { sku: 'WG-PJACK-55', name: 'Pallet Jack 5500lb Standard', category: 'Equipment', zone: 'D', aisle: '14', bin: 'D-14-01', quantity: 2, reserved: 0, available: 2, reorderPoint: 1, unitCost: 320, totalValue: 640, velocity: 'D', lastMovement: '2025-10-22', daysIdle: 119, uom: 'EA', supplier: 'Crown' },
    ],
    inbound: [
      { id: 'mv1', type: 'receipt', reference: 'PO-2026-0412', status: 'pending', sku: 'WG-CONV-4824', itemName: '48" Powered Roller Conveyor', from: 'Hytrol', to: 'DOCK-01', qty: 12, scheduled: '2026-02-18', assignedTo: 'Jake M.' },
      { id: 'mv2', type: 'receipt', reference: 'PO-2026-0418', status: 'in_progress', sku: 'WG-RACK-9648', itemName: '96x48 Pallet Rack Beam', from: 'Unarco', to: 'DOCK-02', qty: 200, scheduled: '2026-02-18', assignedTo: 'Carlos R.', carrier: 'Freight', tracking: 'PRO-884521' },
      { id: 'mv3', type: 'receipt', reference: 'PO-2026-0420', status: 'pending', sku: 'WG-WRAP-18', itemName: 'Stretch Wrap 18"', from: 'Sigma Stretch', to: 'DOCK-01', qty: 96, carrier: 'UPS', tracking: '1Z999AA10123456784', scheduled: '2026-02-19' },
      { id: 'mv4', type: 'receipt', reference: 'PO-2026-0422', status: 'pending', sku: 'WG-LABEL-4X6', itemName: 'Thermal Labels 4x6', from: 'Zebra', to: 'DOCK-01', qty: 50, carrier: 'FedEx', tracking: '789456123012', scheduled: '2026-02-19' },
    ],
    outbound: [
      { id: 'mv5', type: 'shipment', reference: 'SO-8841', status: 'in_progress', sku: 'WG-CONV-4824', itemName: 'Conveyor Sections', from: 'A-02-04', to: 'Metro Construction', qty: 6, carrier: 'Freight', scheduled: '2026-02-18', assignedTo: 'Wave W-0234' },
      { id: 'mv6', type: 'shipment', reference: 'SO-8843', status: 'pending', sku: 'WG-RACK-9648', itemName: 'Pallet Rack Beams', from: 'A-01-02', to: 'Apex Logistics', qty: 48, carrier: 'Freight', scheduled: '2026-02-18' },
      { id: 'mv7', type: 'shipment', reference: 'SO-8845', status: 'pending', sku: 'WG-UPRT-1242', itemName: 'Upright Frames', from: 'A-01-08', to: 'Harbor Distribution', qty: 12, carrier: 'Freight', scheduled: '2026-02-19' },
      { id: 'mv8', type: 'shipment', reference: 'SO-8847', status: 'completed', sku: 'WG-DOCK-HYD8', itemName: 'Hydraulic Dock Leveler', from: 'B-05-01', to: 'National Grid', qty: 1, carrier: 'Flatbed', tracking: 'FLT-99234', scheduled: '2026-02-17' },
    ],
    pickWaves: [
      { id: 'pw1', waveNumber: 'W-0234', status: 'in_progress', priority: 'urgent', orders: 3, lines: 8, units: 42, assignedTo: 'Jake M.', zone: 'A', progress: 62, startedAt: '2026-02-18T08:15:00' },
      { id: 'pw2', waveNumber: 'W-0235', status: 'released', priority: 'high', orders: 5, lines: 14, units: 86, assignedTo: 'Carlos R.', zone: 'A,B', progress: 0 },
      { id: 'pw3', waveNumber: 'W-0236', status: 'planning', priority: 'normal', orders: 4, lines: 11, units: 52, assignedTo: '', zone: 'B,C', progress: 0 },
      { id: 'pw4', waveNumber: 'W-0233', status: 'shipped', priority: 'normal', orders: 2, lines: 5, units: 24, assignedTo: 'Maria L.', zone: 'A', progress: 100 },
    ],
    cycleCounts: [
      { id: 'cc1', zone: 'A', aisle: '01', sku: 'WG-RACK-9648', itemName: 'Pallet Rack Beam', systemQty: 156, countedQty: 154, variance: -2, variancePct: 1.3, status: 'counted', countedBy: 'Maria L.', date: '2026-02-17' },
      { id: 'cc2', zone: 'A', aisle: '02', sku: 'WG-CONV-4824', itemName: 'Conveyor Section', systemQty: 24, countedQty: 24, variance: 0, variancePct: 0, status: 'reconciled', countedBy: 'Jake M.', date: '2026-02-17' },
      { id: 'cc3', zone: 'A', aisle: '04', sku: 'WG-WRAP-18', itemName: 'Stretch Wrap', systemQty: 48, countedQty: 45, variance: -3, variancePct: 6.3, status: 'counted', countedBy: 'Carlos R.', date: '2026-02-16' },
      { id: 'cc4', zone: 'B', aisle: '03', sku: 'WG-SORT-SHOE', itemName: 'Sorter Module', systemQty: 8, countedQty: 8, variance: 0, variancePct: 0, status: 'reconciled', countedBy: 'Maria L.', date: '2026-02-15' },
      { id: 'cc5', zone: 'C', aisle: '07', sku: 'WG-MEZZ-DECK', itemName: 'Mezzanine Deck', systemQty: 32, countedQty: 31, variance: -1, variancePct: 3.1, status: 'counted', countedBy: 'Jake M.', date: '2026-02-14' },
      { id: 'cc6', zone: 'A', aisle: '04', sku: 'WG-LABEL-4X6', itemName: 'Thermal Labels', systemQty: 12, countedQty: 12, variance: 0, variancePct: 0, status: 'pending', date: '2026-02-18' },
    ],
    locations: [
      { zone: 'A', aisle: '01', bin: 'A-01-02', sku: 'WG-RACK-9648', itemName: 'Pallet Rack Beam', quantity: 156, capacity: 200, utilization: 78 },
      { zone: 'A', aisle: '02', bin: 'A-02-04', sku: 'WG-CONV-4824', itemName: 'Conveyor Section', quantity: 24, capacity: 30, utilization: 80 },
      { zone: 'A', aisle: '04', bin: 'A-04-12', sku: 'WG-WRAP-18', itemName: 'Stretch Wrap', quantity: 48, capacity: 100, utilization: 48 },
      { zone: 'B', aisle: '05', bin: 'B-05-01', sku: 'WG-DOCK-HYD8', itemName: 'Dock Leveler', quantity: 3, capacity: 4, utilization: 75 },
      { zone: 'D', aisle: '15', bin: 'D-15-02', sku: 'WG-GATE-PERS', itemName: 'Safety Gate', quantity: 6, capacity: 12, utilization: 50 },
    ],
    aiInsights: [
      { id: 'wi1', type: 'reorder', priority: 'critical', title: '🔴 Thermal Labels below reorder point', description: 'WG-LABEL-4X6 has 12 units (reorder at 15). At current velocity of 3/day, stockout in 4 days. Supplier lead time is 2 days.', impact: 'Stockout risk on Feb 22 — will halt all outbound labeling', action: 'Create PO for 50 packs from Zebra — est. $900', status: 'pending' },
      { id: 'wi2', type: 'reorder', priority: 'warning', title: '🟡 Dock Levelers approaching reorder point', description: 'WG-DOCK-HYD8 has 2 available (reorder at 2). Next project install consumes 1 unit on Feb 25.', impact: 'Will drop below reorder point after SO-8849 ships', action: 'Create PO for 2 units from Rite-Hite — est. $9,600, 14-day lead', status: 'pending' },
      { id: 'wi3', type: 'slotting', priority: 'warning', title: '⚡ Stretch Wrap misslotted — move to pick face', description: 'WG-WRAP-18 is A-velocity (picked 8x/day) but in bin A-04-12 (back of aisle). Bin A-04-01 is 60% empty and closer to packing.', impact: 'Reduces pick travel by ~22 seconds per order (264 seconds/day saved)', action: 'Transfer 48 rolls from A-04-12 to A-04-01', status: 'pending' },
      { id: 'wi4', type: 'dead_stock', priority: 'warning', title: '📦 2 SKUs flagged as dead stock (90+ days idle)', description: 'WG-GATE-PERS (96 days, $5,340 value) and WG-PJACK-55 (119 days, $640 value). Combined holding cost: ~$48/month.', impact: 'Freeing these bins recovers 2 locations in Zone D', action: 'Move to clearance, bundle with project quotes, or write off', status: 'pending' },
      { id: 'wi5', type: 'accuracy', priority: 'info', title: '📊 Stretch Wrap variance needs investigation', description: 'Cycle count found -3 variance (6.3%) on WG-WRAP-18. Possible causes: unrecorded use on floor, damage, or count error.', impact: 'Accuracy for Zone A aisle 04 dropped to 93.7%', action: 'Recount and investigate missing 3 rolls', status: 'pending' },
      { id: 'wi6', type: 'forecast', priority: 'info', title: '📈 Conveyor demand spike predicted for March', description: 'Based on 3 pending quotes totaling 36 conveyor sections, plus seasonal pattern from 2025, expect 40% increase in WG-CONV-4824 demand.', impact: 'Current stock (24) may be insufficient — need 48+ by March 1', action: 'Pre-order 24 additional sections from Hytrol — est. $34,800', status: 'pending' },
    ],
    dailyBriefing: "## 🏭 Warehouse Briefing — Feb 18, 2026\n\n**Health Score:** 82/100\n**Accuracy:** 97.8% | **Pick Time:** 4.2 min/order | **Utilization:** 74%\n\n**Today's Priorities:**\n1. 🔴 Order thermal labels NOW — stockout in 4 days\n2. ⚡ Receive PO-0412 (12 conveyor sections) at Dock 1\n3. 📦 Pick Wave W-0234 in progress (62%) — 3 urgent orders\n\n**Inbound Today:** 4 receipts (PO-0412, PO-0418 in progress, 2 arriving tomorrow)\n**Outbound Today:** 12 orders across 3 pick waves\n\n**Alerts:**\n🔴 Thermal Labels below reorder point (12 of 15 min)\n🟡 Dock Levelers at reorder threshold\n🟡 Stretch Wrap count variance 6.3% — recount needed\n\n**Slotting:** Move stretch wrap from A-04-12 to A-04-01 — saves 22 sec/pick\n**Dead Stock:** 2 SKUs idle 90+ days ($5,980 tied up, $48/mo holding cost)\n**Forecast:** Conveyor demand +40% expected in March — pre-order recommended",
  },
  _default: {
    totalSKUs: 0, totalUnits: 0, totalValue: 0, accuracy: 0, avgPickTime: 0, utilization: 0,
    inboundToday: 0, outboundToday: 0, lowStockAlerts: 0, deadStockSKUs: 0,
    zones: [], inventory: [], inbound: [], outbound: [], pickWaves: [], cycleCounts: [],
    locations: [], aiInsights: [], dailyBriefing: "Connect your Odoo inventory to begin warehouse management.",
  }
}

export function getWmsData(companyId: string): WmsSnapshot {
  return TENANT_WMS[companyId] || TENANT_WMS._default
}
