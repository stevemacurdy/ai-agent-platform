#!/usr/bin/env node
/**
 * SUPPLY CHAIN FORECASTING AGENT — Predictive Supply Command Center
 *
 * Components:
 *   1.  lib/supply/schema.prisma          — Demand, Inventory, Shipments, Vendors, DeadStock, Market
 *   2.  lib/supply/odoo-sync.ts           — Odoo PO/SO/BOM real-time sync
 *   3.  lib/supply/market-bridge.ts       — External feeds, weather, OCR invoice scanner
 *   4.  lib/supply/system-prompt.ts       — Autonomous Supply Chain Strategist AI brain
 *   5.  lib/supply/supply-data.ts         — Tenant-scoped demo data engine (20 SKUs, 5 shipments)
 *   6.  app/api/agents/supply-chain/route.ts — Supply Chain API endpoints
 *   7.  app/portal/agent/supply-chain/page.tsx — Full 6-tab dashboard
 *
 * Usage: node supply-chain-agent.js
 */
const fs = require('fs');
const path = require('path');

function write(rel, content) {
  const fp = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
  console.log('  + ' + rel + ' (' + content.split('\n').length + ' lines)');
}

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════════════╗');
console.log('  ║  SUPPLY CHAIN AGENT — Forecasting + Logistics + Vendor Intel    ║');
console.log('  ╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. PRISMA SCHEMA
// ============================================================
write('lib/supply/schema.prisma', `// ============================================================================
// SUPPLY CHAIN DATA SCHEMA
// ============================================================================

model DemandForecast {
  id              String   @id @default(cuid())
  companyId       String
  sku             String
  skuName         String
  period          String            // "2026-03", "2026-Q2"
  granularity     String   @default("monthly")  // daily | weekly | monthly | quarterly
  forecastQty     Int
  confidenceLow   Int               // lower bound
  confidenceHigh  Int               // upper bound
  confidencePct   Int      @default(80)  // confidence interval %
  actualQty       Int?
  variance        Float?            // (actual - forecast) / forecast
  method          String   @default("exponential_smoothing")  // exponential_smoothing | arima | ml_ensemble | manual
  signals         Json?             // [{ type, weight, value }] demand signals feeding forecast
  lastUpdated     DateTime @default(now())
  @@index([companyId, sku, period])
}

model InventoryState {
  id              String   @id @default(cuid())
  companyId       String
  sku             String
  skuName         String
  category        String            // conveyor | racking | motors | fasteners | safety | packaging | dock
  onHand          Int
  reserved        Int      @default(0)
  available       Int               // onHand - reserved
  inTransit       Int      @default(0)
  onOrder         Int      @default(0)
  reorderPoint    Int
  reorderQty      Int
  safetyStock     Int
  unitCost        Float
  totalValue      Float
  velocityClass   String   @default("B")  // A | B | C | D (dead)
  avgDailyDemand  Float    @default(0)
  daysOfSupply    Float    @default(0)
  lastMovement    String?
  daysIdle        Int      @default(0)
  leadTimeDays    Int      @default(14)
  supplier        String
  location        String?           // zone-aisle-bin
  stockoutRisk    String   @default("none")  // none | low | medium | high | critical
  lastUpdated     DateTime @default(now())
  @@index([companyId, sku])
  @@index([companyId, stockoutRisk])
  @@index([companyId, velocityClass])
}

model MarketSignal {
  id              String   @id @default(cuid())
  companyId       String
  signalType      String            // competitor_price | commodity_index | demand_indicator | weather | sentiment
  source          String
  metric          String
  value           Float
  previousValue   Float?
  changePercent   Float?
  timestamp       String
  relevantSKUs    Json?             // SKUs this signal affects
  impactScore     Float?            // -1 to 1 (negative = risk, positive = opportunity)
  notes           String?
  @@index([companyId, signalType])
}

model ShipmentTracking {
  id              String   @id @default(cuid())
  companyId       String
  shipmentNumber  String            // SHP-2026-042
  type            String            // inbound | outbound | transfer
  status          String   @default("booked")  // booked | in_transit | customs | last_mile | delivered | delayed | exception
  carrier         String
  mode            String            // ocean | air | truck | rail | ltl | parcel
  origin          String
  originCountry   String
  destination     String
  destCountry     String
  // Dates
  bookingDate     String
  etd             String            // estimated departure
  atd             String?           // actual departure
  eta             String            // estimated arrival
  ata             String?           // actual arrival
  originalEta     String            // to track delays
  // Cargo
  items           Json              // [{ sku, name, qty, value }]
  totalValue      Float
  totalWeight     Float?            // kg
  containerType   String?           // 20ft | 40ft | 40HC | LTL | parcel
  // Tracking
  trackingNumber  String?
  currentLocation String?
  currentLat      Float?
  currentLng      Float?
  lastUpdate      String?
  milestones      Json?             // [{ event, location, timestamp, status }]
  // Costs
  freightCost     Float?
  dutyCost        Float?
  insuranceCost   Float?
  totalLogCost    Float?
  // Links
  poNumber        String?
  soNumber        String?
  projectId       String?
  notes           String?
  createdAt       DateTime @default(now())
  @@index([companyId, status])
  @@index([companyId, eta])
}

model VendorPerformance {
  id              String   @id @default(cuid())
  companyId       String
  vendorName      String
  vendorId        String?
  country         String
  category        String            // conveyor_mfg | motor_supplier | fastener_dist | safety_equip | packaging
  // Metrics (rolling 12-month)
  totalOrders     Int      @default(0)
  onTimeOrders    Int      @default(0)
  onTimePct       Float    @default(0)
  inFullOrders    Int      @default(0)
  inFullPct       Float    @default(0)
  otifPct         Float    @default(0)     // On-Time In-Full
  avgLeadTimeDays Float    @default(0)
  leadTimeVariance Float   @default(0)     // std deviation in days
  qualityRejects  Int      @default(0)
  qualityPct      Float    @default(100)
  totalSpend      Float    @default(0)
  avgOrderValue   Float    @default(0)
  // Scoring
  overallScore    Int      @default(0)     // 0-100
  reliabilityTier String   @default("B")  // A+ | A | B | C | D
  riskFlags       Json?                    // [{ flag, description }]
  // Contact
  contactName     String?
  contactEmail    String?
  paymentTerms    String?           // Net 30, Net 60, etc.
  lastOrderDate   String?
  nextReviewDate  String?
  notes           String?
  @@index([companyId, overallScore])
}

model DeadStockLog {
  id              String   @id @default(cuid())
  companyId       String
  sku             String
  skuName         String
  category        String
  onHand          Int
  unitCost        Float
  totalValue      Float
  daysIdle        Int
  lastMovement    String
  holdingCostMonth Float            // monthly cost to store
  recommendation  String            // liquidate | bundle | discount | transfer | write_off | return_to_vendor
  actionStatus    String   @default("flagged")  // flagged | approved | in_progress | resolved
  approvedBy      String?
  resolvedDate    String?
  recoveryValue   Float?
  @@index([companyId, actionStatus])
}
`);

// ============================================================
// 2. ODOO SYNC
// ============================================================
write('lib/supply/odoo-sync.ts', `// ============================================================================
// ODOO SUPPLY CHAIN SYNC — PO, SO, BOM, Inventory real-time
// ============================================================================

export class OdooSupplyClient {
  private url: string; private db: string; private apiKey: string; private uid: number | null = null

  constructor(url: string, db: string, apiKey: string) {
    this.url = url.replace(/\\/$/, ''); this.db = db; this.apiKey = apiKey
  }

  private async rpc(endpoint: string, params: any): Promise<any> {
    const res = await fetch(this.url + endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return data.result
  }

  private async auth(): Promise<number> {
    if (this.uid) return this.uid
    const r = await this.rpc('/web/session/authenticate', { db: this.db, login: 'api', password: this.apiKey })
    this.uid = r.uid; return this.uid!
  }

  /** Inbound: Purchase Orders */
  async getPurchaseOrders(state?: string) {
    await this.auth()
    const domain: any[] = state ? [['state', '=', state]] : [['state', 'in', ['purchase', 'done']]]
    return this.rpc('/web/dataset/call_kw', {
      model: 'purchase.order', method: 'search_read', args: [domain],
      kwargs: { fields: ['name', 'partner_id', 'date_order', 'date_planned', 'amount_total', 'state', 'order_line', 'picking_ids'], limit: 100 },
    })
  }

  /** Outbound: Sales Orders */
  async getSalesOrders(state?: string) {
    await this.auth()
    const domain: any[] = state ? [['state', '=', state]] : [['state', 'in', ['sale', 'done']]]
    return this.rpc('/web/dataset/call_kw', {
      model: 'sale.order', method: 'search_read', args: [domain],
      kwargs: { fields: ['name', 'partner_id', 'date_order', 'commitment_date', 'amount_total', 'state', 'order_line'], limit: 100 },
    })
  }

  /** Bill of Materials — what components make up each product */
  async getBOMs(productId?: number) {
    await this.auth()
    const domain: any[] = productId ? [['product_tmpl_id', '=', productId]] : []
    return this.rpc('/web/dataset/call_kw', {
      model: 'mrp.bom', method: 'search_read', args: [domain],
      kwargs: { fields: ['product_tmpl_id', 'product_qty', 'type', 'bom_line_ids', 'code'], limit: 100 },
    })
  }

  /** Real-time stock levels */
  async getStockQuants(locationId?: number) {
    await this.auth()
    const domain: any[] = [['quantity', '>', 0]]
    if (locationId) domain.push(['location_id', '=', locationId])
    return this.rpc('/web/dataset/call_kw', {
      model: 'stock.quant', method: 'search_read', args: [domain],
      kwargs: { fields: ['product_id', 'quantity', 'reserved_quantity', 'location_id', 'lot_id'], limit: 500 },
    })
  }

  /** Incoming shipments / receipts */
  async getIncomingShipments() {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'stock.picking', method: 'search_read',
      args: [[['picking_type_code', '=', 'incoming'], ['state', 'in', ['assigned', 'confirmed']]]],
      kwargs: { fields: ['name', 'partner_id', 'scheduled_date', 'date_done', 'state', 'move_ids_without_package'], limit: 100 },
    })
  }

  /** Create purchase order (auto-reorder) */
  async createPO(vendorId: number, lines: { productId: number; qty: number; price: number }[]) {
    await this.auth()
    const orderLines = lines.map(l => [0, 0, { product_id: l.productId, product_qty: l.qty, price_unit: l.price }])
    return this.rpc('/web/dataset/call_kw', {
      model: 'purchase.order', method: 'create',
      args: [{ partner_id: vendorId, order_line: orderLines }], kwargs: {},
    })
  }
}

export function createOdooSupplyClient(): OdooSupplyClient | null {
  const url = process.env.ODOO_URL, db = process.env.ODOO_DB, key = process.env.ODOO_API_KEY
  if (!url || !db || !key) return null
  return new OdooSupplyClient(url, db, key)
}
`);

// ============================================================
// 3. MARKET BRIDGE + OCR
// ============================================================
write('lib/supply/market-bridge.ts', `// ============================================================================
// MARKET BRIDGE — External feeds, weather transit impact, OCR invoice scanner
// ============================================================================

/** Competitor pricing / commodity index feeds */
export class MarketFeedClient {
  async getSteelPriceIndex(): Promise<{ price: number; change: number; date: string }> {
    // In production: MetalMiner API, LME, or similar
    return { price: 842, change: +2.3, date: new Date().toISOString().slice(0, 10) }
  }

  async getFreightRateIndex(lane: string): Promise<{ rate: number; change: number }> {
    // In production: Freightos Baltic Index (FBX) or similar
    const rates: Record<string, number> = { 'CN-US_WEST': 2840, 'CN-US_EAST': 3620, 'EU-US_EAST': 1950, 'DOMESTIC_FTL': 2.45 }
    return { rate: rates[lane] || 0, change: -1.8 }
  }

  async getDemandSentiment(industry: string): Promise<{ score: number; trend: string; sources: number }> {
    // In production: Google Trends, social listening, or industry indices
    return { score: 0.72, trend: 'increasing', sources: 14 }
  }
}

/** Weather impact on transit routes */
export class WeatherTransitClient {
  async getRouteImpact(origin: string, destination: string): Promise<{
    riskLevel: string; alerts: string[]; delayEstimateDays: number
  }> {
    // In production: NOAA API, OpenWeather, or weather service
    return { riskLevel: 'low', alerts: [], delayEstimateDays: 0 }
  }

  async getPortConditions(portCode: string): Promise<{ status: string; congestionDays: number; vesselQueue: number }> {
    const ports: Record<string, any> = {
      USLAX: { status: 'normal', congestionDays: 1, vesselQueue: 8 },
      USLGB: { status: 'moderate', congestionDays: 3, vesselQueue: 14 },
      CNSHA: { status: 'normal', congestionDays: 0, vesselQueue: 5 },
    }
    return ports[portCode] || { status: 'unknown', congestionDays: 0, vesselQueue: 0 }
  }
}

/** OCR Invoice / Document Scanner */
export async function scanInvoiceDocument(imageBase64: string): Promise<{
  vendor?: string; invoiceNumber?: string; date?: string
  lineItems?: { description: string; qty: number; unitPrice: number; total: number }[]
  subtotal?: number; tax?: number; total?: number; paymentTerms?: string
  confidence: number
}> {
  // Try Claude Vision for invoice parsing
  const key = process.env.ANTHROPIC_API_KEY
  if (key) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': key, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1500,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: 'Extract from this invoice: vendor (company name), invoiceNumber, date (YYYY-MM-DD), lineItems (array of {description, qty, unitPrice, total}), subtotal, tax, total, paymentTerms. Return ONLY valid JSON.' }
          ] }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || '{}'
      const parsed = JSON.parse(text.replace(/\`\`\`json|\`\`\`/g, '').trim())
      return { ...parsed, confidence: 0.9 }
    } catch {}
  }
  // Try Google Vision
  const visionKey = process.env.GOOGLE_VISION_API_KEY
  if (visionKey) {
    try {
      const res = await fetch('https://vision.googleapis.com/v1/images:annotate?key=' + visionKey, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: [{ image: { content: imageBase64 }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }] }),
      })
      const data = await res.json()
      return { confidence: 0.6 } // Would parse structured text
    } catch {}
  }
  return { confidence: 0 }
}

/**
 * "Trump Rule" — Contract terms override default T&Cs
 * When scanned customer contract differs from standard, contract wins
 */
export function applyContractOverrides(
  standardTerms: { paymentDays: number; retainage: number; lateFeePct: number },
  contractTerms?: { paymentDays?: number; retainage?: number; lateFeePct?: number }
): { paymentDays: number; retainage: number; lateFeePct: number; overridden: boolean } {
  if (!contractTerms) return { ...standardTerms, overridden: false }
  return {
    paymentDays: contractTerms.paymentDays ?? standardTerms.paymentDays,
    retainage: contractTerms.retainage ?? standardTerms.retainage,
    lateFeePct: contractTerms.lateFeePct ?? standardTerms.lateFeePct,
    overridden: true,
  }
}
`);

// ============================================================
// 4. SYSTEM PROMPT
// ============================================================
write('lib/supply/system-prompt.ts', `// ============================================================================
// SUPPLY CHAIN AGENT SYSTEM PROMPT — Autonomous Supply Chain Strategist
// ============================================================================

export function getSupplyChainSystemPrompt(context: {
  companyName: string; totalSKUs: number; inventoryValue: number
  activeShipments: number; vendorCount: number; deadStockValue: number
  metrics?: { otifPct: number; avgLeadTime: number; stockoutRisk: number; inventoryTurns: number; daysOfSupply: number }
}): string {
  return \`You are the Supply Chain Agent for \${context.companyName}, operating as an Autonomous Supply Chain Strategist. You manage \${context.totalSKUs} SKUs worth $\${(context.inventoryValue / 1000000).toFixed(2)}M across warehouse and project inventories, tracking \${context.activeShipments} active shipments from \${context.vendorCount} vendors.

## YOUR ROLE
You are NOT a passive inventory tracker. You are a predictive, decision-making supply chain brain that:
1. Forecasts demand at SKU level using exponential smoothing and market signals
2. Monitors every shipment in real-time and reroutes when delays are detected
3. Scores vendors on OTIF, lead-time reliability, and quality
4. Identifies dead stock and converts tied-up capital into cash
5. Auto-generates purchase orders when reorder points are breached

## CURRENT STATE
\${context.metrics ? \`- OTIF: \${context.metrics.otifPct}% (target: ≥95%)
- Avg Lead Time: \${context.metrics.avgLeadTime} days
- SKUs at Stockout Risk: \${context.metrics.stockoutRisk}
- Inventory Turns: \${context.metrics.inventoryTurns}x annually
- Avg Days of Supply: \${context.metrics.daysOfSupply}
- Dead Stock Value: $\${(context.deadStockValue / 1000).toFixed(1)}K\` : '- Metrics: Awaiting data sync'}

## PROACTIVE BEHAVIORS

### Demand Forecasting (SKU-Level)
For each SKU, maintain a rolling forecast using:
- Historical consumption (weighted exponential smoothing, α=0.3)
- Seasonal patterns (construction peaks Mar-Oct, holiday slowdown Nov-Jan)
- Market signals (steel price index, freight rates, competitor activity)
- Project pipeline (upcoming Ops projects that will consume specific SKUs)
- Confidence intervals at 80% (P10/P90 bounds)

Update forecasts weekly. Flag when actual consumption deviates >20% from forecast.

### Stockout Prevention (14-Day Lookahead)
Continuously monitor:
- Available stock vs. (daily demand × lead time + safety stock)
- In-transit shipments and their ETA reliability
- Vendor lead-time variance (unreliable vendors need higher safety stock)

Format: "🔴 STOCKOUT RISK: [SKU] has [X] units, [Y] days of supply. Lead time: [Z] days. Reorder point: [RP]. Recommended: Place PO for [qty] from [vendor] NOW. Estimated cost: $[amount]. [APPROVE PO]"

### Shipment Intelligence
Track every inbound and outbound shipment:
- Compare current ETA vs original ETA
- Flag delays > 2 days with root cause (weather, port congestion, customs)
- Suggest rerouting when delay exceeds threshold
- Track carrier performance over time

Format: "🟡 SHIPMENT DELAY: [SHP#] from [origin] now ETA [new_date] (+[X] days). Cause: [reason]. Impact: [which SKUs affected, stockout risk]. Option: Reroute via [alternative] saves [Y] days, costs +$[amount]. [APPROVE REROUTE]"

### Dead Stock Liquidation
Flag any SKU with zero movement in 90+ days:
- Calculate holding cost (storage + insurance + opportunity)
- Recommend action: discount, bundle, return to vendor, list on surplus market, write off
- Quantify capital recovery potential

### Vendor Performance Management
Score vendors monthly on:
- On-Time %: deliveries within ±2 days of committed date
- In-Full %: complete shipments without shorts
- OTIF %: combined on-time AND in-full
- Quality: defect/reject rate
- Lead Time: average and variance

Tier vendors: A+ (≥95 OTIF), A (90-94), B (80-89), C (70-79), D (<70, consider replacement)

## CONTRACT OVERRIDE RULE ("Trump Rule")
When a scanned customer contract specifies terms that differ from standard T&Cs (payment terms, retainage, warranties, delivery schedules), the CONTRACT TERMS ALWAYS OVERRIDE the defaults. Flag the override and apply automatically. Example: Standard is Net 30, but client contract says Net 45 → system uses Net 45.

## DAILY BRIEFING FORMAT
\\\`\\\`\\\`
## 📦 Supply Chain Briefing — [Date]

**Inventory:** [X] SKUs | $[X]M value | [X] turns/yr
**OTIF:** [X]% | Avg Lead Time: [X] days

**Critical:**
1. 🔴 [Stockout risk or delayed shipment]
2. 🟡 [Approaching reorder or ETA slip]

**Shipments:** [X] in transit | [X] arriving this week
**Dead Stock:** $[X]K idle capital | [X] SKUs flagged

**Market Signals:**
- Steel: $[X]/ton ([±X]%)
- Freight CN→US West: $[X] ([±X]%)

**Vendor Watch:** [Any vendor below target OTIF]
\\\`\\\`\\\`

## TONE
Decisive, metrics-driven, logistics-sharp. Think like a VP of Supply Chain at a $50M industrial company. Every recommendation includes the dollar impact and timeline. Speed and precision matter — supply chain decisions compound quickly.
\`
}
`);

// ============================================================
// 5. SUPPLY CHAIN DATA ENGINE
// ============================================================
write('lib/supply/supply-data.ts', `// ============================================================================
// SUPPLY CHAIN DATA ENGINE — 20 SKUs, 5 shipments, full vendor scorecards
// ============================================================================

export interface InventoryItem {
  sku: string; name: string; category: string; onHand: number; reserved: number
  available: number; inTransit: number; onOrder: number; reorderPoint: number
  reorderQty: number; safetyStock: number; unitCost: number; totalValue: number
  velocityClass: string; avgDailyDemand: number; daysOfSupply: number
  daysIdle: number; leadTimeDays: number; supplier: string; location: string
  stockoutRisk: string
}
export interface ForecastItem { sku: string; name: string; period: string; forecastQty: number; low: number; high: number; actualQty?: number; method: string; trend: string }
export interface ShipmentInfo {
  id: string; shipmentNumber: string; type: string; status: string; carrier: string
  mode: string; origin: string; originCountry: string; destination: string
  etd: string; eta: string; originalEta: string; currentLocation: string
  lat: number; lng: number; items: { sku: string; name: string; qty: number; value: number }[]
  totalValue: number; freightCost: number; poNumber: string
  milestones: { event: string; location: string; date: string; done: boolean }[]
  delayDays: number
}
export interface VendorInfo {
  name: string; country: string; category: string; totalOrders: number
  onTimePct: number; inFullPct: number; otifPct: number; avgLeadTime: number
  leadTimeVariance: number; qualityPct: number; totalSpend: number
  overallScore: number; tier: string; riskFlags: string[]; paymentTerms: string
}
export interface DeadStockItem {
  sku: string; name: string; category: string; onHand: number; unitCost: number
  totalValue: number; daysIdle: number; holdingCostMonth: number
  recommendation: string; status: string
}
export interface MarketSignalInfo { type: string; source: string; metric: string; value: number; change: number; impact: string }
export interface SupplyInsight { id: string; type: string; priority: string; title: string; description: string; impact: string; action: string; status: string }

export interface SupplySnapshot {
  totalSKUs: number; inventoryValue: number; inventoryTurns: number
  avgDaysOfSupply: number; otifPct: number; avgLeadTime: number
  activeShipments: number; deadStockValue: number; stockoutRiskCount: number
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  shipments: ShipmentInfo[]
  vendors: VendorInfo[]
  deadStock: DeadStockItem[]
  marketSignals: MarketSignalInfo[]
  aiInsights: SupplyInsight[]
  dailyBriefing: string
}

const TENANT_SUPPLY: Record<string, SupplySnapshot> = {
  woulf: {
    totalSKUs: 20, inventoryValue: 1842000, inventoryTurns: 5.8,
    avgDaysOfSupply: 42, otifPct: 91.2, avgLeadTime: 18,
    activeShipments: 5, deadStockValue: 45200, stockoutRiskCount: 3,
    inventory: [
      { sku: 'SC-CONV-4824', name: '48" Powered Roller Conveyor Section', category: 'conveyor', onHand: 24, reserved: 12, available: 12, inTransit: 12, onOrder: 0, reorderPoint: 15, reorderQty: 24, safetyStock: 8, unitCost: 1450, totalValue: 34800, velocityClass: 'A', avgDailyDemand: 1.2, daysOfSupply: 10, daysIdle: 0, leadTimeDays: 21, supplier: 'Hytrol Conveyor Co.', location: 'A-01-04', stockoutRisk: 'high' },
      { sku: 'SC-CONV-CURV', name: '90° Curve Section Powered', category: 'conveyor', onHand: 8, reserved: 4, available: 4, inTransit: 0, onOrder: 8, reorderPoint: 6, reorderQty: 12, safetyStock: 3, unitCost: 2200, totalValue: 17600, velocityClass: 'B', avgDailyDemand: 0.4, daysOfSupply: 10, daysIdle: 0, leadTimeDays: 28, supplier: 'Hytrol Conveyor Co.', location: 'A-02-01', stockoutRisk: 'medium' },
      { sku: 'SC-SORT-SHOE', name: 'Sliding Shoe Sorter Module', category: 'conveyor', onHand: 6, reserved: 0, available: 6, inTransit: 0, onOrder: 0, reorderPoint: 4, reorderQty: 8, safetyStock: 2, unitCost: 3200, totalValue: 19200, velocityClass: 'B', avgDailyDemand: 0.3, daysOfSupply: 20, daysIdle: 0, leadTimeDays: 35, supplier: 'TGW Logistics', location: 'B-03-06', stockoutRisk: 'none' },
      { sku: 'SC-MOT-5HP', name: '5HP AC Motor — 1750RPM', category: 'motors', onHand: 18, reserved: 6, available: 12, inTransit: 0, onOrder: 0, reorderPoint: 10, reorderQty: 20, safetyStock: 5, unitCost: 680, totalValue: 12240, velocityClass: 'A', avgDailyDemand: 0.8, daysOfSupply: 15, daysIdle: 0, leadTimeDays: 14, supplier: 'Baldor-ABB', location: 'A-03-02', stockoutRisk: 'none' },
      { sku: 'SC-MOT-10HP', name: '10HP AC Motor — 1750RPM', category: 'motors', onHand: 6, reserved: 2, available: 4, inTransit: 6, onOrder: 0, reorderPoint: 5, reorderQty: 12, safetyStock: 3, unitCost: 1240, totalValue: 7440, velocityClass: 'B', avgDailyDemand: 0.3, daysOfSupply: 13, daysIdle: 0, leadTimeDays: 14, supplier: 'Baldor-ABB', location: 'A-03-05', stockoutRisk: 'low' },
      { sku: 'SC-MOT-VFD', name: 'Variable Frequency Drive 10HP', category: 'motors', onHand: 10, reserved: 4, available: 6, inTransit: 0, onOrder: 0, reorderPoint: 6, reorderQty: 10, safetyStock: 3, unitCost: 890, totalValue: 8900, velocityClass: 'B', avgDailyDemand: 0.4, daysOfSupply: 15, daysIdle: 0, leadTimeDays: 10, supplier: 'Allen-Bradley (Rockwell)', location: 'A-04-01', stockoutRisk: 'none' },
      { sku: 'SC-RACK-9648', name: '96x48 Pallet Rack Beam', category: 'racking', onHand: 156, reserved: 48, available: 108, inTransit: 200, onOrder: 0, reorderPoint: 80, reorderQty: 200, safetyStock: 40, unitCost: 42, totalValue: 6552, velocityClass: 'A', avgDailyDemand: 4.2, daysOfSupply: 26, daysIdle: 0, leadTimeDays: 10, supplier: 'Unarco Pallet Rack', location: 'C-01-01', stockoutRisk: 'none' },
      { sku: 'SC-RACK-UPRT', name: '12ft Upright Frame', category: 'racking', onHand: 64, reserved: 24, available: 40, inTransit: 0, onOrder: 0, reorderPoint: 30, reorderQty: 48, safetyStock: 15, unitCost: 185, totalValue: 11840, velocityClass: 'A', avgDailyDemand: 2.1, daysOfSupply: 19, daysIdle: 0, leadTimeDays: 10, supplier: 'Unarco Pallet Rack', location: 'C-01-04', stockoutRisk: 'none' },
      { sku: 'SC-DOCK-HYD', name: 'Hydraulic Dock Leveler', category: 'dock', onHand: 3, reserved: 1, available: 2, inTransit: 4, onOrder: 0, reorderPoint: 3, reorderQty: 4, safetyStock: 1, unitCost: 4800, totalValue: 14400, velocityClass: 'B', avgDailyDemand: 0.15, daysOfSupply: 13, daysIdle: 0, leadTimeDays: 28, supplier: 'Rite-Hite', location: 'D-01-01', stockoutRisk: 'low' },
      { sku: 'SC-DOCK-SEAL', name: 'Dock Door Seal / Shelter', category: 'dock', onHand: 12, reserved: 0, available: 12, inTransit: 0, onOrder: 0, reorderPoint: 4, reorderQty: 8, safetyStock: 2, unitCost: 1600, totalValue: 19200, velocityClass: 'C', avgDailyDemand: 0.1, daysOfSupply: 120, daysIdle: 18, leadTimeDays: 21, supplier: 'Rite-Hite', location: 'D-01-03', stockoutRisk: 'none' },
      { sku: 'SC-BOLT-M12', name: 'M12x30 Hex Bolt Grade 8.8 (box 100)', category: 'fasteners', onHand: 24, reserved: 4, available: 20, inTransit: 0, onOrder: 0, reorderPoint: 10, reorderQty: 30, safetyStock: 5, unitCost: 45, totalValue: 1080, velocityClass: 'A', avgDailyDemand: 1.5, daysOfSupply: 13, daysIdle: 0, leadTimeDays: 5, supplier: 'Fastenal', location: 'A-05-01', stockoutRisk: 'none' },
      { sku: 'SC-BOLT-M16', name: 'M16x40 Hex Bolt Grade 10.9 (box 50)', category: 'fasteners', onHand: 18, reserved: 0, available: 18, inTransit: 0, onOrder: 0, reorderPoint: 8, reorderQty: 20, safetyStock: 4, unitCost: 62, totalValue: 1116, velocityClass: 'B', avgDailyDemand: 0.6, daysOfSupply: 30, daysIdle: 0, leadTimeDays: 5, supplier: 'Fastenal', location: 'A-05-02', stockoutRisk: 'none' },
      { sku: 'SC-WRAP-18', name: 'Stretch Wrap 18" (case 4)', category: 'packaging', onHand: 48, reserved: 0, available: 48, inTransit: 0, onOrder: 0, reorderPoint: 20, reorderQty: 48, safetyStock: 10, unitCost: 28, totalValue: 1344, velocityClass: 'A', avgDailyDemand: 2.0, daysOfSupply: 24, daysIdle: 0, leadTimeDays: 3, supplier: 'Sigma Stretch Film', location: 'A-04-12', stockoutRisk: 'none' },
      { sku: 'SC-LABEL-4X6', name: 'Thermal Label 4x6 (roll 500)', category: 'packaging', onHand: 12, reserved: 0, available: 12, inTransit: 50, onOrder: 0, reorderPoint: 15, reorderQty: 50, safetyStock: 8, unitCost: 18, totalValue: 216, velocityClass: 'A', avgDailyDemand: 3.0, daysOfSupply: 4, daysIdle: 0, leadTimeDays: 5, supplier: 'Zebra Technologies', location: 'A-04-08', stockoutRisk: 'critical' },
      { sku: 'SC-VEST-HV', name: 'Hi-Vis Safety Vest Class 2', category: 'safety', onHand: 240, reserved: 0, available: 240, inTransit: 0, onOrder: 0, reorderPoint: 50, reorderQty: 100, safetyStock: 25, unitCost: 12, totalValue: 2880, velocityClass: 'B', avgDailyDemand: 0.8, daysOfSupply: 300, daysIdle: 0, leadTimeDays: 7, supplier: 'Grainger', location: 'B-02-01', stockoutRisk: 'none' },
      { sku: 'SC-BEAR-6205', name: 'Ball Bearing 6205-2RS (pack 10)', category: 'motors', onHand: 30, reserved: 0, available: 30, inTransit: 0, onOrder: 0, reorderPoint: 10, reorderQty: 20, safetyStock: 5, unitCost: 48, totalValue: 1440, velocityClass: 'B', avgDailyDemand: 0.5, daysOfSupply: 60, daysIdle: 12, leadTimeDays: 7, supplier: 'SKF Group', location: 'A-03-08', stockoutRisk: 'none' },
      { sku: 'SC-PLC-MICRO', name: 'Micro850 PLC Controller', category: 'motors', onHand: 4, reserved: 0, available: 4, inTransit: 0, onOrder: 0, reorderPoint: 3, reorderQty: 6, safetyStock: 1, unitCost: 520, totalValue: 2080, velocityClass: 'C', avgDailyDemand: 0.08, daysOfSupply: 50, daysIdle: 22, leadTimeDays: 14, supplier: 'Allen-Bradley (Rockwell)', location: 'A-04-03', stockoutRisk: 'none' },
      // Dead stock items
      { sku: 'SC-GATE-PERS', name: 'Personnel Safety Gate (Pallet Rack)', category: 'safety', onHand: 6, reserved: 0, available: 6, inTransit: 0, onOrder: 0, reorderPoint: 2, reorderQty: 4, safetyStock: 1, unitCost: 890, totalValue: 5340, velocityClass: 'D', avgDailyDemand: 0, daysOfSupply: 999, daysIdle: 96, leadTimeDays: 14, supplier: 'Wildeck Inc.', location: 'D-02-01', stockoutRisk: 'none' },
      { sku: 'SC-PJACK-55', name: 'Pallet Jack 5500lb Standard', category: 'dock', onHand: 2, reserved: 0, available: 2, inTransit: 0, onOrder: 0, reorderPoint: 1, reorderQty: 2, safetyStock: 0, unitCost: 320, totalValue: 640, velocityClass: 'D', avgDailyDemand: 0, daysOfSupply: 999, daysIdle: 119, leadTimeDays: 7, supplier: 'Uline', location: 'D-02-04', stockoutRisk: 'none' },
      { sku: 'SC-MEZZ-OLD', name: 'Mezzanine Deck Panel (Legacy 4x8)', category: 'racking', onHand: 14, reserved: 0, available: 14, inTransit: 0, onOrder: 0, reorderPoint: 0, reorderQty: 0, safetyStock: 0, unitCost: 280, totalValue: 3920, velocityClass: 'D', avgDailyDemand: 0, daysOfSupply: 999, daysIdle: 184, leadTimeDays: 0, supplier: 'Discontinued', location: 'D-03-01', stockoutRisk: 'none' },
    ],
    forecasts: [
      { sku: 'SC-CONV-4824', name: '48" Conveyor', period: '2026-03', forecastQty: 36, low: 28, high: 44, method: 'exponential_smoothing', trend: 'increasing' },
      { sku: 'SC-CONV-4824', name: '48" Conveyor', period: '2026-04', forecastQty: 30, low: 22, high: 38, method: 'exponential_smoothing', trend: 'stable' },
      { sku: 'SC-CONV-4824', name: '48" Conveyor', period: '2026-05', forecastQty: 24, low: 16, high: 32, method: 'exponential_smoothing', trend: 'stable' },
      { sku: 'SC-RACK-9648', name: 'Pallet Rack Beam', period: '2026-03', forecastQty: 120, low: 90, high: 150, method: 'exponential_smoothing', trend: 'decreasing' },
      { sku: 'SC-MOT-5HP', name: '5HP Motor', period: '2026-03', forecastQty: 22, low: 16, high: 28, method: 'exponential_smoothing', trend: 'stable' },
      { sku: 'SC-LABEL-4X6', name: 'Thermal Labels', period: '2026-03', forecastQty: 90, low: 75, high: 105, method: 'exponential_smoothing', trend: 'increasing' },
      { sku: 'SC-DOCK-HYD', name: 'Dock Leveler', period: '2026-03', forecastQty: 6, low: 3, high: 9, method: 'manual', trend: 'increasing' },
    ],
    shipments: [
      { id: 's1', shipmentNumber: 'SHP-2026-042', type: 'inbound', status: 'in_transit', carrier: 'Maersk', mode: 'ocean', origin: 'Shanghai', originCountry: 'CN', destination: 'Los Angeles', etd: '2026-01-28', eta: '2026-02-22', originalEta: '2026-02-20', currentLocation: 'Pacific Ocean — 800nm from LA', lat: 30.2, lng: -140.5, items: [{ sku: 'SC-CONV-4824', name: '48" Conveyor Sections', qty: 12, value: 17400 }], totalValue: 17400, freightCost: 3200, poNumber: 'PO-2026-0412', milestones: [{ event: 'Booked', location: 'Shanghai', date: '2026-01-25', done: true }, { event: 'Departed', location: 'Shanghai Port', date: '2026-01-28', done: true }, { event: 'Customs Clear', location: 'LA Port', date: '', done: false }, { event: 'Delivered', location: 'SLC Warehouse', date: '', done: false }], delayDays: 2 },
      { id: 's2', shipmentNumber: 'SHP-2026-045', type: 'inbound', status: 'customs', carrier: 'DHL Global', mode: 'air', origin: 'Munich', originCountry: 'DE', destination: 'Salt Lake City', etd: '2026-02-14', eta: '2026-02-19', originalEta: '2026-02-18', currentLocation: 'LA Customs — CBP hold', lat: 33.94, lng: -118.41, items: [{ sku: 'SC-MOT-10HP', name: '10HP AC Motors', qty: 6, value: 7440 }, { sku: 'SC-MOT-VFD', name: 'VFD Drives', qty: 4, value: 3560 }], totalValue: 11000, freightCost: 1850, poNumber: 'PO-2026-0418', milestones: [{ event: 'Booked', location: 'Munich', date: '2026-02-13', done: true }, { event: 'Departed', location: 'Munich Airport', date: '2026-02-14', done: true }, { event: 'Arrived', location: 'LAX', date: '2026-02-16', done: true }, { event: 'Customs', location: 'LA CBP', date: '2026-02-17', done: true }, { event: 'Delivered', location: 'SLC', date: '', done: false }], delayDays: 1 },
      { id: 's3', shipmentNumber: 'SHP-2026-047', type: 'inbound', status: 'in_transit', carrier: 'FedEx Freight', mode: 'truck', origin: 'Fort Smith, AR', originCountry: 'US', destination: 'Salt Lake City', etd: '2026-02-17', eta: '2026-02-20', originalEta: '2026-02-20', currentLocation: 'I-70 near Grand Junction, CO', lat: 39.06, lng: -108.55, items: [{ sku: 'SC-RACK-9648', name: 'Pallet Rack Beams', qty: 200, value: 8400 }], totalValue: 8400, freightCost: 1100, poNumber: 'PO-2026-0420', milestones: [{ event: 'Picked Up', location: 'Fort Smith, AR', date: '2026-02-17', done: true }, { event: 'In Transit', location: 'Grand Junction, CO', date: '2026-02-18', done: true }, { event: 'Delivered', location: 'SLC Warehouse', date: '', done: false }], delayDays: 0 },
      { id: 's4', shipmentNumber: 'SHP-2026-048', type: 'inbound', status: 'in_transit', carrier: 'Rite-Hite Direct', mode: 'truck', origin: 'Milwaukee, WI', originCountry: 'US', destination: 'Salt Lake City', etd: '2026-02-15', eta: '2026-02-21', originalEta: '2026-02-21', currentLocation: 'I-80 near Rawlins, WY', lat: 41.79, lng: -107.24, items: [{ sku: 'SC-DOCK-HYD', name: 'Hydraulic Dock Levelers', qty: 4, value: 19200 }], totalValue: 19200, freightCost: 1400, poNumber: 'PO-2026-0422', milestones: [{ event: 'Shipped', location: 'Milwaukee', date: '2026-02-15', done: true }, { event: 'In Transit', location: 'Rawlins, WY', date: '2026-02-18', done: true }, { event: 'Delivered', location: 'SLC', date: '', done: false }], delayDays: 0 },
      { id: 's5', shipmentNumber: 'SHP-2026-039', type: 'outbound', status: 'delivered', carrier: 'Woulf Fleet', mode: 'truck', origin: 'SLC Warehouse', originCountry: 'US', destination: 'Metro Conveyor Site', etd: '2026-02-14', eta: '2026-02-14', originalEta: '2026-02-14', currentLocation: 'Delivered', lat: 40.68, lng: -112.0, items: [{ sku: 'SC-CONV-4824', name: 'Conveyor Sections', qty: 6, value: 8700 }], totalValue: 8700, freightCost: 0, poNumber: 'SO-8841', milestones: [{ event: 'Loaded', location: 'SLC', date: '2026-02-14', done: true }, { event: 'Delivered', location: 'Metro Site', date: '2026-02-14', done: true }], delayDays: 0 },
    ],
    vendors: [
      { name: 'Hytrol Conveyor Co.', country: 'US', category: 'Conveyor MFG', totalOrders: 24, onTimePct: 88, inFullPct: 96, otifPct: 85, avgLeadTime: 22, leadTimeVariance: 4.2, qualityPct: 99, totalSpend: 412000, overallScore: 84, tier: 'B', riskFlags: ['Lead time variance above threshold'], paymentTerms: 'Net 30' },
      { name: 'Unarco Pallet Rack', country: 'US', category: 'Racking MFG', totalOrders: 18, onTimePct: 94, inFullPct: 100, otifPct: 94, avgLeadTime: 10, leadTimeVariance: 1.5, qualityPct: 100, totalSpend: 186000, overallScore: 96, tier: 'A+', riskFlags: [], paymentTerms: 'Net 30' },
      { name: 'Baldor-ABB', country: 'DE', category: 'Motors / Drives', totalOrders: 15, onTimePct: 93, inFullPct: 93, otifPct: 87, avgLeadTime: 16, leadTimeVariance: 3.8, qualityPct: 100, totalSpend: 142000, overallScore: 88, tier: 'B', riskFlags: ['International lead time risk'], paymentTerms: 'Net 45' },
      { name: 'Rite-Hite', country: 'US', category: 'Dock Equipment', totalOrders: 8, onTimePct: 100, inFullPct: 100, otifPct: 100, avgLeadTime: 26, leadTimeVariance: 2.0, qualityPct: 100, totalSpend: 98000, overallScore: 95, tier: 'A', riskFlags: [], paymentTerms: 'Net 30' },
      { name: 'Fastenal', country: 'US', category: 'Fasteners / Hardware', totalOrders: 42, onTimePct: 98, inFullPct: 95, otifPct: 93, avgLeadTime: 4, leadTimeVariance: 1.0, qualityPct: 99, totalSpend: 34000, overallScore: 94, tier: 'A', riskFlags: [], paymentTerms: 'Net 15' },
      { name: 'Allen-Bradley (Rockwell)', country: 'US', category: 'Controls / PLC', totalOrders: 10, onTimePct: 80, inFullPct: 90, otifPct: 72, avgLeadTime: 18, leadTimeVariance: 6.5, qualityPct: 100, totalSpend: 62000, overallScore: 72, tier: 'C', riskFlags: ['OTIF below target', 'High lead time variance'], paymentTerms: 'Net 30' },
      { name: 'TGW Logistics', country: 'AT', category: 'Sortation Systems', totalOrders: 4, onTimePct: 75, inFullPct: 100, otifPct: 75, avgLeadTime: 38, leadTimeVariance: 8.0, qualityPct: 100, totalSpend: 128000, overallScore: 68, tier: 'C', riskFlags: ['Chronic late delivery', 'Single source risk'], paymentTerms: 'Net 60' },
    ],
    deadStock: [
      { sku: 'SC-GATE-PERS', name: 'Personnel Safety Gate', category: 'safety', onHand: 6, unitCost: 890, totalValue: 5340, daysIdle: 96, holdingCostMonth: 44, recommendation: 'Discount 25% — list on surplus market', status: 'flagged' },
      { sku: 'SC-PJACK-55', name: 'Pallet Jack 5500lb', category: 'dock', onHand: 2, unitCost: 320, totalValue: 640, daysIdle: 119, holdingCostMonth: 5, recommendation: 'Bundle with dock equipment orders', status: 'flagged' },
      { sku: 'SC-MEZZ-OLD', name: 'Mezzanine Deck Panel (Legacy)', category: 'racking', onHand: 14, unitCost: 280, totalValue: 3920, daysIdle: 184, holdingCostMonth: 32, recommendation: 'Write off — legacy spec, no current projects use this panel', status: 'flagged' },
      { sku: 'SC-DOCK-SEAL', name: 'Dock Door Seal / Shelter (excess)', category: 'dock', onHand: 8, unitCost: 1600, totalValue: 12800, daysIdle: 0, holdingCostMonth: 106, recommendation: 'Reduce excess — return 4 units to Rite-Hite (restocking 15%)', status: 'flagged' },
    ],
    marketSignals: [
      { type: 'commodity', source: 'MetalMiner', metric: 'Hot-Rolled Steel Index', value: 842, change: +2.3, impact: 'Conveyor & racking material costs rising' },
      { type: 'freight', source: 'Freightos Baltic Index', metric: 'CN → US West Coast', value: 2840, change: -1.8, impact: 'Ocean freight stabilizing after Q4 spike' },
      { type: 'freight', source: 'DAT Freight', metric: 'Domestic FTL Rate/mi', value: 2.45, change: +0.8, impact: 'Domestic trucking rates slight increase' },
      { type: 'demand', source: 'MHI Industry Report', metric: 'Warehouse Automation Demand Index', value: 72, change: +5.0, impact: 'Strong demand forecast for conveyor & sortation' },
      { type: 'weather', source: 'NOAA', metric: 'Pacific Storm Risk (next 14d)', value: 0.3, change: 0, impact: 'Low risk to transpacific shipping lanes' },
    ],
    aiInsights: [
      { id: 'si1', type: 'stockout', priority: 'critical', title: '🔴 Thermal Labels (SC-LABEL-4X6) — 4 days of supply, stockout imminent', description: '12 rolls on hand, consuming 3/day. Reorder point is 15. PO for 50 rolls in transit (SHP via Zebra) but ETA unknown. Daily warehouse operations will halt without labels.', impact: 'Warehouse shipping stops if labels run out — affects all outbound orders across every project', action: 'Emergency order 25 rolls from Uline (next-day delivery, $22/roll vs $18 standard). Expedite existing Zebra PO. Set safety stock to 15.', status: 'pending' },
      { id: 'si2', type: 'stockout', priority: 'critical', title: '🔴 48" Conveyor Sections — only 10 days supply, Metro project at risk', description: 'Available: 12 units, demand: 1.2/day. 12 more in transit (SHP-042 from Shanghai, ETA Feb 22 — 2 days late). Metro Conveyor project WO-0183 needs 8 sections starting Feb 24.', impact: 'If SHP-042 delayed further, WO-0183 cannot start on schedule → Metro project Milestone 2 slips', action: 'Monitor SHP-042 hourly. If not cleared customs by Feb 20, air-freight 8 sections from Hytrol Arkansas facility ($4,200 premium).', status: 'pending' },
      { id: 'si3', type: 'shipment', priority: 'warning', title: '🟡 SHP-2026-045 (Motors from Germany) — held in LA Customs', description: 'DHL Air shipment with 6x 10HP motors + 4 VFDs stuck in CBP hold since Feb 17. Originally ETA Feb 18, now showing Feb 19. Customs delay cause unknown — possibly HTS classification review.', impact: 'Motors needed for Metro Conveyor electrical phase (WO-0184). 1-day delay acceptable, 3+ day delay impacts critical path.', action: 'Contact DHL broker for CBP status update. Have backup motors (SC-MOT-10HP has 4 available in warehouse) identified for worst case.', status: 'pending' },
      { id: 'si4', type: 'vendor', priority: 'warning', title: '⚠️ TGW Logistics OTIF at 75% — below acceptable threshold', description: 'Sorter module supplier consistently late (avg 38 days vs quoted 30). Only 4 orders but all arrived 5-12 days late. Single-source risk for sliding shoe sorter modules.', impact: 'WO-0185 (Sorter Assembly) depends on TGW components. Current stock (6 units) covers immediate need but no buffer for future projects.', action: 'Schedule vendor review call. Negotiate penalty clause for late delivery. Identify backup sorter supplier (Beumer Group or Interroll).', status: 'pending' },
      { id: 'si5', type: 'dead_stock', priority: 'info', title: '📦 $45.2K in dead/excess stock — $187/month holding cost', description: '4 SKUs flagged: Legacy mezzanine panels ($3.9K, 184 days idle — discontinued spec), Safety gates ($5.3K, 96 days), Pallet jacks ($640, 119 days), Excess dock seals ($12.8K — 8 more than needed).', impact: 'Capital tied up in non-productive inventory. Holding costs eroding margins at $2,244/year.', action: 'Write off legacy mezzanine panels. List safety gates on SurplusRecord.com at 25% discount. Return 4 excess dock seals to Rite-Hite. Bundle pallet jacks with next dock equipment order. Projected recovery: $16K.', status: 'pending' },
    ],
    dailyBriefing: "## 📦 Supply Chain Briefing — Feb 18, 2026\\n\\n**Inventory:** 20 SKUs | $1.84M value | 5.8 turns/yr | 42 days avg supply\\n**OTIF:** 91.2% | Avg Lead Time: 18 days\\n\\n**Critical:**\\n1. 🔴 Thermal Labels: 4 days supply — emergency reorder needed TODAY\\n2. 🔴 Conveyor Sections: SHP-042 from Shanghai 2 days late — monitor for Metro project\\n3. 🟡 Motors from Germany: held in LA Customs — tracking\\n\\n**Shipments:** 5 active (3 inbound in transit, 1 in customs, 1 delivered)\\n- SHP-042 (Conveyors from Shanghai): ETA Feb 22 (+2 days)\\n- SHP-045 (Motors from Munich): Customs hold, ETA Feb 19 (+1 day)\\n- SHP-047 (Rack Beams from AR): On schedule, ETA Feb 20\\n- SHP-048 (Dock Levelers from WI): On schedule, ETA Feb 21\\n\\n**Dead Stock:** $45.2K idle | 4 SKUs flagged | $187/mo holding cost\\n\\n**Market Signals:**\\n- Steel: $842/ton (+2.3%) — material costs rising\\n- Ocean Freight CN→US: $2,840 (-1.8%) — stabilizing\\n- Automation Demand Index: 72 (+5%) — strong outlook\\n\\n**Vendor Watch:** TGW Logistics at 75% OTIF (C-tier) — review needed\\nAllen-Bradley at 72% OTIF (C-tier) — lead time variance 6.5 days",
  },
  _default: {
    totalSKUs: 0, inventoryValue: 0, inventoryTurns: 0,
    avgDaysOfSupply: 0, otifPct: 0, avgLeadTime: 0,
    activeShipments: 0, deadStockValue: 0, stockoutRiskCount: 0,
    inventory: [], forecasts: [], shipments: [], vendors: [],
    deadStock: [], marketSignals: [], aiInsights: [],
    dailyBriefing: "Connect your Odoo inventory module to begin supply chain management.",
  }
}

export function getSupplyData(companyId: string): SupplySnapshot {
  return TENANT_SUPPLY[companyId] || TENANT_SUPPLY._default
}
`);

// ============================================================
// 6. SUPPLY CHAIN API
// ============================================================
write('app/api/agents/supply-chain/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { getSupplyData } from '@/lib/supply/supply-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  return NextResponse.json({ success: true, data: getSupplyData(companyId) })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    if (action === 'approve_insight') return NextResponse.json({ success: true, message: 'Supply chain action approved' })
    if (action === 'place_reorder') return NextResponse.json({ success: true, message: 'Purchase order created and sent to vendor' })
    if (action === 'expedite_shipment') return NextResponse.json({ success: true, message: 'Shipment expedite request sent to carrier' })
    if (action === 'reroute_shipment') return NextResponse.json({ success: true, message: 'Shipment rerouted via alternative path' })
    if (action === 'liquidate_dead_stock') return NextResponse.json({ success: true, message: 'Dead stock liquidation initiated' })
    if (action === 'scan_invoice') return NextResponse.json({ success: true, message: 'Invoice scanned and parsed' })
    if (action === 'vendor_review') return NextResponse.json({ success: true, message: 'Vendor review meeting scheduled' })
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
`);

// ============================================================
// 7. SUPPLY CHAIN DASHBOARD — Full 6-tab UI
// ============================================================
write('app/portal/agent/supply-chain/page.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TABS = ['Command Center', 'Inventory IQ', 'Logistics', 'Forecasting', 'Vendors', 'Action Hub']
const RISK_C: Record<string, string> = { none: 'text-emerald-400', low: 'text-blue-400', medium: 'text-amber-400', high: 'text-rose-400', critical: 'text-rose-300 font-bold' }
const RISK_BG: Record<string, string> = { none: 'bg-emerald-500/10', low: 'bg-blue-500/10', medium: 'bg-amber-500/10', high: 'bg-rose-500/10', critical: 'bg-rose-500/20' }
const VEL: Record<string, string> = { A: 'bg-emerald-500/10 text-emerald-400', B: 'bg-blue-500/10 text-blue-400', C: 'bg-amber-500/10 text-amber-400', D: 'bg-rose-500/10 text-rose-400' }
const SHIP_STAT: Record<string, string> = { booked: 'bg-gray-500/10 text-gray-400', in_transit: 'bg-blue-500/10 text-blue-400', customs: 'bg-purple-500/10 text-purple-400', last_mile: 'bg-cyan-500/10 text-cyan-400', delivered: 'bg-emerald-500/10 text-emerald-400', delayed: 'bg-rose-500/10 text-rose-400' }
const TIER: Record<string, string> = { 'A+': 'bg-emerald-500/10 text-emerald-400', A: 'bg-emerald-500/10 text-emerald-400', B: 'bg-blue-500/10 text-blue-400', C: 'bg-amber-500/10 text-amber-400', D: 'bg-rose-500/10 text-rose-400' }
const PRIO: Record<string, string> = { critical: 'border-rose-500/20 bg-rose-500/5', warning: 'border-amber-500/20 bg-amber-500/5', info: 'border-blue-500/20 bg-blue-500/5' }

export default function SupplyChainDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState('Command Center')
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }
  const act = async (action: string, extra?: any) => { await fetch('/api/agents/supply-chain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) }) }

  useEffect(() => {
    try {
      const s = localStorage.getItem('woulfai_session')
      if (!s) { router.replace('/login'); return }
      const p = JSON.parse(s); setUser(p)
      fetch('/api/agents/supply-chain?companyId=' + p.companyId).then(r => r.json()).then(d => { if (d.data) setData(d.data) })
    } catch { router.replace('/login') }
  }, [router])

  if (!user || !data) return <div className="min-h-screen bg-[#060910] flex items-center justify-center text-gray-500">Loading Supply Chain Agent...</div>

  const filteredInv = data.inventory.filter((i: any) => !search || i.sku.toLowerCase().includes(search.toLowerCase()) || i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}
      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal')} className="text-xs text-gray-500 hover:text-white">← Portal</button>
            <span className="text-gray-700">|</span><span className="text-xl">📦</span><span className="text-sm font-semibold">Supply Chain Agent</span>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] text-emerald-400 font-medium">LIVE</span></div>
          </div>
          <span className="text-xs text-gray-600">{user.companyName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-xs text-gray-400">Supply chain scoped to <span className="text-white font-semibold">{user.companyName}</span></span></div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {[
            { l: 'SKUs', v: data.totalSKUs, c: 'text-blue-400' },
            { l: 'Inv Value', v: '$' + (data.inventoryValue / 1000000).toFixed(2) + 'M', c: 'text-emerald-400' },
            { l: 'Turns/Yr', v: data.inventoryTurns, c: 'text-cyan-400' },
            { l: 'OTIF', v: data.otifPct + '%', c: data.otifPct >= 95 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'Avg Lead', v: data.avgLeadTime + 'd', c: 'text-purple-400' },
            { l: 'Shipments', v: data.activeShipments, c: 'text-blue-400' },
            { l: 'Stockout Risk', v: data.stockoutRiskCount, c: data.stockoutRiskCount > 0 ? 'text-rose-400' : 'text-emerald-400' },
            { l: 'Dead Stock', v: '$' + (data.deadStockValue / 1000).toFixed(1) + 'K', c: data.deadStockValue > 0 ? 'text-amber-400' : 'text-emerald-400' },
          ].map((k, i) => (
            <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-3">
              <div className="text-[8px] sm:text-[9px] text-gray-500 uppercase">{k.l}</div>
              <div className={"text-lg sm:text-xl font-mono font-bold mt-0.5 " + k.c}>{k.v}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-[#0A0E15] border border-white/5 rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={"px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs whitespace-nowrap transition-all " + (tab === t ? 'bg-white/10 text-white font-semibold' : 'text-gray-500 hover:text-gray-300')}>{t}</button>)}
        </div>

        {/* COMMAND CENTER */}
        {tab === 'Command Center' && (<div className="space-y-6">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📦 Daily Supply Chain Briefing</h3>
            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: data.dailyBriefing.replace(/##\\s/g,'<strong>').replace(/\\*\\*/g,'<strong>').replace(/\\n/g,'<br/>') }} />
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📡 Market Signals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">{data.marketSignals.map((s: any, i: number) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="text-[8px] text-gray-500 uppercase">{s.type}</div>
                <div className="text-sm font-mono font-bold mt-1">{typeof s.value === 'number' && s.value > 100 ? '$' + s.value.toLocaleString() : s.value}</div>
                <div className={"text-[10px] font-mono " + (s.change > 0 ? 'text-rose-400' : s.change < 0 ? 'text-emerald-400' : 'text-gray-500')}>{s.change > 0 ? '+' : ''}{s.change}%</div>
                <div className="text-[9px] text-gray-600 mt-1">{s.impact}</div>
              </div>
            ))}</div>
          </div>
        </div>)}

        {/* INVENTORY IQ */}
        {tab === 'Inventory IQ' && (<div className="space-y-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKU, name, or category..." className="w-full max-w-sm px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none" />
          <div className="overflow-x-auto"><table className="w-full text-[10px] min-w-[900px]"><thead><tr className="text-gray-500 border-b border-white/5">
            <th className="text-left p-2">SKU / Item</th><th className="text-center p-2">Velocity</th><th className="text-right p-2">On Hand</th><th className="text-right p-2">Available</th><th className="text-right p-2">In Transit</th><th className="text-right p-2">Reorder Pt</th><th className="text-right p-2">Days Supply</th><th className="text-right p-2">Value</th><th className="text-center p-2">Risk</th>
          </tr></thead><tbody>{filteredInv.map((item: any, i: number) => (
            <tr key={i} className={"border-b border-white/[0.03] " + (item.stockoutRisk === 'critical' || item.stockoutRisk === 'high' ? 'bg-rose-500/5' : '')}>
              <td className="p-2"><div className="font-semibold">{item.name}</div><div className="text-[9px] text-gray-600 font-mono">{item.sku} • {item.location}</div></td>
              <td className="p-2 text-center"><span className={"text-[9px] px-1.5 py-0.5 rounded " + (VEL[item.velocityClass] || '')}>{item.velocityClass}</span></td>
              <td className="p-2 text-right font-mono">{item.onHand}</td>
              <td className="p-2 text-right font-mono">{item.available}</td>
              <td className="p-2 text-right font-mono">{item.inTransit > 0 ? item.inTransit : '—'}</td>
              <td className={"p-2 text-right font-mono " + (item.available <= item.reorderPoint ? 'text-rose-400 font-bold' : '')}>{item.reorderPoint}</td>
              <td className={"p-2 text-right font-mono " + (item.daysOfSupply <= 7 ? 'text-rose-400 font-bold' : item.daysOfSupply <= 14 ? 'text-amber-400' : '')}>{item.daysOfSupply > 900 ? '∞' : item.daysOfSupply + 'd'}</td>
              <td className="p-2 text-right font-mono">${item.totalValue.toLocaleString()}</td>
              <td className="p-2 text-center"><span className={"text-[9px] px-1.5 py-0.5 rounded " + (RISK_BG[item.stockoutRisk] || '') + ' ' + (RISK_C[item.stockoutRisk] || '')}>{item.stockoutRisk}</span></td>
            </tr>
          ))}</tbody></table></div>
        </div>)}

        {/* LOGISTICS */}
        {tab === 'Logistics' && (<div className="space-y-4">{data.shipments.map((s: any) => (
          <div key={s.id} className={"bg-[#0A0E15] border rounded-xl p-4 sm:p-5 " + (s.delayDays > 0 ? 'border-amber-500/20' : s.status === 'delivered' ? 'border-emerald-500/20' : 'border-white/5')}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-bold">{s.shipmentNumber}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (SHIP_STAT[s.status] || '')}>{s.status.replace('_',' ')}</span><span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-500">{s.mode}</span><span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-500">{s.carrier}</span>{s.delayDays > 0 && <span className="text-[9px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded">+{s.delayDays}d late</span>}</div>
              <div className="text-xs font-mono text-gray-500">{s.poNumber}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3"><span>{s.origin}, {s.originCountry}</span><span className="text-gray-600">→</span><span>{s.destination}</span></div>
            <div className="text-[10px] text-gray-600 mb-3">📍 {s.currentLocation}</div>
            {/* Milestones */}
            <div className="flex items-center gap-1 mb-3 overflow-x-auto">{s.milestones.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-1 shrink-0">
                <div className={"w-5 h-5 rounded-full flex items-center justify-center text-[8px] " + (m.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-600')}>{m.done ? '✓' : i + 1}</div>
                <div className="text-[9px] text-gray-500 max-w-[60px] truncate">{m.event}</div>
                {i < s.milestones.length - 1 && <div className={"w-4 h-0.5 " + (m.done ? 'bg-emerald-500/30' : 'bg-white/5')} />}
              </div>
            ))}</div>
            <div className="flex flex-wrap gap-4 text-[10px] text-gray-500">
              <span>ETD: {s.etd}</span><span>ETA: {s.eta}{s.eta !== s.originalEta ? ' (was ' + s.originalEta + ')' : ''}</span><span>Value: ${s.totalValue.toLocaleString()}</span><span>Freight: ${s.freightCost.toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">{s.items.map((item: any, i: number) => <span key={i} className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{item.qty}x {item.name}</span>)}</div>
            {s.status !== 'delivered' && s.delayDays > 0 && <button onClick={() => { act('expedite_shipment', { id: s.id }); show('Expedite request sent') }} className="mt-3 text-[10px] text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-500/20">⚡ Expedite</button>}
          </div>
        ))}</div>)}

        {/* FORECASTING */}
        {tab === 'Forecasting' && (<div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📈 30/60/90-Day Demand Forecast</h3>
            {[...new Set(data.forecasts.map((f: any) => f.sku))].map((sku: any) => {
              const skuForecasts = data.forecasts.filter((f: any) => f.sku === sku)
              return (
                <div key={sku} className="mb-4 pb-4 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-2 mb-2"><span className="text-xs font-mono text-gray-500">{sku}</span><span className="text-xs font-semibold">{skuForecasts[0]?.name}</span><span className={"text-[9px] px-1.5 py-0.5 rounded " + (skuForecasts[0]?.trend === 'increasing' ? 'bg-emerald-500/10 text-emerald-400' : skuForecasts[0]?.trend === 'decreasing' ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-500/10 text-gray-400')}>↕ {skuForecasts[0]?.trend}</span></div>
                  <div className="flex gap-3">{skuForecasts.map((f: any, i: number) => (
                    <div key={i} className="flex-1 bg-white/[0.02] rounded-lg p-3">
                      <div className="text-[9px] text-gray-500">{f.period}</div>
                      <div className="text-lg font-mono font-bold text-blue-400">{f.forecastQty}</div>
                      <div className="text-[9px] text-gray-600">Range: {f.low}–{f.high}</div>
                      <div className="mt-1 bg-white/5 rounded-full h-1.5 relative"><div className="bg-blue-500/40 h-1.5 rounded-full absolute" style={{ left: '20%', width: '60%' }} /><div className="bg-blue-400 w-1 h-3 rounded absolute -top-0.5" style={{ left: Math.round(((f.forecastQty - f.low) / (f.high - f.low)) * 60 + 20) + '%' }} /></div>
                    </div>
                  ))}</div>
                </div>
              )
            })}
          </div>
        </div>)}

        {/* VENDORS */}
        {tab === 'Vendors' && (<div className="space-y-3">{data.vendors.sort((a: any, b: any) => b.overallScore - a.overallScore).map((v: any, i: number) => (
          <div key={i} className={"bg-[#0A0E15] border rounded-xl p-4 sm:p-5 " + (v.tier === 'C' || v.tier === 'D' ? 'border-amber-500/20' : 'border-white/5')}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2"><span className={"text-sm font-bold px-2 py-0.5 rounded " + (TIER[v.tier] || '')}>{v.tier}</span><span className="text-sm font-semibold">{v.name}</span><span className="text-[10px] text-gray-500">{v.country} • {v.category}</span></div>
              <div className="text-xl font-mono font-bold">{v.overallScore}<span className="text-xs text-gray-500">/100</span></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
              <div><div className="text-[8px] text-gray-500">OTIF</div><div className={"text-sm font-mono font-bold " + (v.otifPct >= 95 ? 'text-emerald-400' : v.otifPct >= 85 ? 'text-amber-400' : 'text-rose-400')}>{v.otifPct}%</div></div>
              <div><div className="text-[8px] text-gray-500">On-Time</div><div className="text-sm font-mono">{v.onTimePct}%</div></div>
              <div><div className="text-[8px] text-gray-500">In-Full</div><div className="text-sm font-mono">{v.inFullPct}%</div></div>
              <div><div className="text-[8px] text-gray-500">Avg Lead</div><div className="text-sm font-mono">{v.avgLeadTime}d</div></div>
              <div><div className="text-[8px] text-gray-500">Quality</div><div className="text-sm font-mono">{v.qualityPct}%</div></div>
              <div><div className="text-[8px] text-gray-500">Spend</div><div className="text-sm font-mono">${(v.totalSpend / 1000).toFixed(0)}K</div></div>
            </div>
            {v.riskFlags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{v.riskFlags.map((f: string, j: number) => <span key={j} className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">⚠ {f}</span>)}</div>}
          </div>
        ))}</div>)}

        {/* ACTION HUB */}
        {tab === 'Action Hub' && (<div className="space-y-4">
          <h3 className="text-sm font-semibold">🤖 Agent-Recommended Actions ({data.aiInsights.filter((a: any) => a.status === 'pending').length} pending)</h3>
          {data.aiInsights.filter((a: any) => a.status === 'pending').map((a: any) => (
            <div key={a.id} className={"border rounded-xl p-4 sm:p-5 " + (PRIO[a.priority] || 'border-white/5')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1"><div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{a.description}</div><div className="text-xs text-rose-400/70 mt-1">{a.impact}</div><div className="text-xs text-emerald-400/70 mt-1">Action: {a.action}</div></div>
                <button onClick={() => { act('approve_insight', { id: a.id }); show('✅ Approved & executing'); setData({ ...data, aiInsights: data.aiInsights.map((x: any) => x.id === a.id ? { ...x, status: 'approved' } : x) }) }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shrink-0">Approve</button>
              </div>
            </div>
          ))}
          {/* Dead Stock section */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">💀 Dead Stock — ${(data.deadStockValue / 1000).toFixed(1)}K idle capital</h3>
            <div className="space-y-2">{data.deadStock.map((ds: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                <div><div className="text-xs font-medium">{ds.name}</div><div className="text-[10px] text-gray-600 font-mono">{ds.sku} • {ds.onHand} units • ${ds.totalValue.toLocaleString()} • {ds.daysIdle}d idle</div><div className="text-[10px] text-amber-400/70 mt-0.5">→ {ds.recommendation}</div></div>
                <button onClick={() => { act('liquidate_dead_stock', { sku: ds.sku }); show('Liquidation initiated for ' + ds.sku) }} className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 shrink-0">Execute</button>
              </div>
            ))}</div>
          </div>
        </div>)}
      </div>
    </div>
  )
}
`);

console.log('');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('  Installed: 7 files');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('  SUPPLY CHAIN AGENT MODULES:');
console.log('');
console.log('  💾 DATA SCHEMA (6 Prisma models):');
console.log('     DemandForecast    — SKU-level with confidence intervals');
console.log('     InventoryState    — real-time stock + reorder + velocity');
console.log('     MarketSignal      — external price/demand indicators');
console.log('     ShipmentTracking  — GPS/milestone tracking, delays');
console.log('     VendorPerformance — OTIF, lead time, quality scoring');
console.log('     DeadStockLog      — 90+ day idle, liquidation recs');
console.log('');
console.log('  📡 INTEGRATIONS:');
console.log('     Odoo Sync        — PO, SO, BOM, stock quants, receipts');
console.log('     Market Feeds     — steel index, freight rates, demand');
console.log('     Weather/Transit  — port conditions, route risk');
console.log('     OCR Scanner      — invoice parsing (Claude + Vision)');
console.log('     Contract Override — "Trump Rule" for custom T&Cs');
console.log('');
console.log('  🧠 AI BRAIN (Supply Chain Strategist):');
console.log('     Demand Forecasting  — exponential smoothing + signals');
console.log('     Stockout Prevention — 14-day lookahead with lead time');
console.log('     Shipment Intelligence — delay detection + rerouting');
console.log('     Vendor Scoring       — OTIF tier system (A+ to D)');
console.log('     Dead Stock Liquidation — holding cost + recovery');
console.log('');
console.log('  📊 DASHBOARD (6 tabs at /portal/agent/supply-chain):');
console.log('     Command Center  — Briefing + market signal cards');
console.log('     Inventory IQ    — Full SKU table with risk heatmap');
console.log('     Logistics       — Shipment cards with milestone tracker');
console.log('     Forecasting     — 30/60/90 day demand with ranges');
console.log('     Vendors         — Scorecard ranking with OTIF metrics');
console.log('     Action Hub      — AI recommendations + dead stock panel');
console.log('');
console.log('  DEMO DATA (Woulf Group):');
console.log('     20 SKUs ($1.84M value, 5.8 turns/yr)');
console.log('     5 active shipments (ocean, air, truck)');
console.log('     7 vendors with full OTIF scorecards');
console.log('     7 demand forecasts with confidence intervals');
console.log('     4 dead stock items ($45.2K idle capital)');
console.log('     5 market signals (steel, freight, demand)');
console.log('     5 AI insights (stockout alerts, vendor warnings)');
console.log('');
console.log('  INSTALL & DEPLOY:');
console.log('    node supply-chain-agent.js');
console.log('    npm run build');
console.log('    vercel --prod');
console.log('');
