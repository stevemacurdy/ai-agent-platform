#!/usr/bin/env node
/**
 * OPERATIONS AGENT — Full Production Module for WoulfAI
 *
 * Components:
 *   1.  lib/ops/schema.prisma         — Projects, WorkOrders, Resources, Field Reports, Safety, Maintenance
 *   2.  lib/ops/odoo-ops.ts           — Odoo Project/Manufacturing connector
 *   3.  lib/ops/wms-bridge.ts         — Material requisition from WMS Agent
 *   4.  lib/ops/field-service.ts      — GPS check-in, document manager, RFIs
 *   5.  lib/ops/system-prompt.ts      — Autonomous Project Superintendent AI brain
 *   6.  lib/ops/ops-data.ts           — Tenant-scoped demo data engine
 *   7.  app/api/agents/operations/route.ts — Operations API endpoints
 *   8.  app/portal/agent/operations/page.tsx — Full 6-tab Operations dashboard
 *
 * Usage: node operations-agent.js
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
console.log('  ║  OPERATIONS AGENT — Project Lifecycle + Field Ops + Analytics   ║');
console.log('  ╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. PRISMA SCHEMA
// ============================================================
write('lib/ops/schema.prisma', `// ============================================================================
// OPERATIONS DATA SCHEMA — Full project lifecycle
// ============================================================================

model Project {
  id              String   @id @default(cuid())
  companyId       String
  projectNumber   String            // WG-2026-042
  name            String
  client          String
  clientContact   String?
  siteAddress     String
  type            String            // conveyor_install | racking | dock_equip | mezzanine | full_build
  status          String   @default("planning")  // planning | mobilizing | in_progress | testing | commissioned | closed | on_hold
  priority        String   @default("normal")     // critical | high | normal | low
  // Timeline
  startDate       String
  targetEnd       String
  projectedEnd    String?
  actualEnd       String?
  milestones      Json?             // [{ id, name, targetDate, actualDate, status, pct }]
  criticalPath    Json?             // [milestoneId, milestoneId, ...]
  // Budget
  quotedValue     Float
  contractValue   Float
  costToDate      Float    @default(0)
  laborCost       Float    @default(0)
  materialCost    Float    @default(0)
  subcontractCost Float    @default(0)
  budgetVariance  Float    @default(0)     // (contractValue - costToDate) / contractValue * 100
  changeOrders    Int      @default(0)
  changeOrderValue Float   @default(0)
  // Resources
  projectManager  String
  superintendent  String?
  crews           Json?             // [{ crewId, name, role, assignedDates }]
  equipment       Json?             // [{ equipmentId, name, assignedDates }]
  // Sales link
  salesQuoteId    String?
  salesRep        String?
  // Completion
  completionPct   Int      @default(0)
  punchListItems  Int      @default(0)
  // Flags
  delayRisk       String   @default("none")  // none | low | medium | high
  safetyScore     Int      @default(100)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([companyId, status])
  @@index([companyId, projectNumber])
}

model WorkOrder {
  id              String   @id @default(cuid())
  companyId       String
  projectId       String
  projectNumber   String
  woNumber        String            // WO-2026-0182
  title           String
  description     String?
  type            String            // fabrication | installation | electrical | testing | commissioning
  status          String   @default("backlog")  // backlog | bom_staging | in_progress | testing | complete | blocked
  priority        String   @default("normal")
  // BOM
  bomItems        Json?             // [{ sku, name, qtyRequired, qtyStaged, qtyInstalled }]
  bomValue        Float    @default(0)
  // Assignment
  assignedCrew    String?
  assignedLead    String?
  estimatedHours  Float    @default(0)
  actualHours     Float    @default(0)
  // Dates
  scheduledStart  String?
  scheduledEnd    String?
  actualStart     String?
  actualEnd       String?
  // Dependencies
  dependsOn       Json?             // [woId, ...]
  blockedBy       String?
  notes           String?
  createdAt       DateTime @default(now())
  @@index([companyId, projectId, status])
}

model ResourceAllocation {
  id              String   @id @default(cuid())
  companyId       String
  resourceType    String            // crew | equipment | subcontractor
  resourceId      String
  resourceName    String
  projectId       String
  projectNumber   String
  projectName     String
  role            String?           // lead_installer | electrician | welder | operator
  startDate       String
  endDate         String
  hoursPerDay     Float    @default(8)
  status          String   @default("scheduled")  // scheduled | active | completed | cancelled
  dailyRate       Float?
  notes           String?
  @@index([companyId, resourceId])
  @@index([companyId, projectId])
}

model DailyFieldReport {
  id              String   @id @default(cuid())
  companyId       String
  projectId       String
  projectNumber   String
  reportDate      String
  submittedBy     String
  // Conditions
  weather         String?           // clear | rain | snow | wind | extreme_heat
  temperature     Int?
  // Work performed
  crewsOnSite     Int      @default(0)
  hoursWorked     Float    @default(0)
  workPerformed   String?  @db.Text
  materialsUsed   Json?             // [{ sku, name, qty }]
  // Issues
  delaysEncountered String? @db.Text
  delayCause       String?          // weather | material | labor | permit | client | design
  delayHours       Float   @default(0)
  // Safety
  safetyObservations String? @db.Text
  incidentReported   Boolean @default(false)
  // Photos
  photos          Json?             // [{ url, caption, timestamp }]
  // Progress
  completionPctUpdate Int?
  notes           String?  @db.Text
  status          String   @default("draft")  // draft | submitted | reviewed
  reviewedBy      String?
  createdAt       DateTime @default(now())
  @@index([companyId, projectId, reportDate])
}

model SafetyIncident {
  id              String   @id @default(cuid())
  companyId       String
  projectId       String
  projectNumber   String
  incidentDate    String
  reportedBy      String
  severity        String            // near_miss | first_aid | recordable | lost_time | fatality
  type            String            // fall | struck_by | caught_in | electrical | ergonomic | vehicle | other
  description     String   @db.Text
  rootCause       String?  @db.Text
  correctiveAction String? @db.Text
  employeesInvolved Json?           // [{ name, role, injury }]
  oshaRecordable  Boolean  @default(false)
  lostDays        Int      @default(0)
  status          String   @default("open")  // open | investigating | corrective | closed
  photos          Json?
  createdAt       DateTime @default(now())
  @@index([companyId, projectId])
}

model MaintenanceLog {
  id              String   @id @default(cuid())
  companyId       String
  equipmentId     String
  equipmentName   String
  type            String            // preventive | corrective | inspection
  status          String   @default("scheduled")  // scheduled | in_progress | completed | overdue
  scheduledDate   String
  completedDate   String?
  performedBy     String?
  description     String?
  cost            Float    @default(0)
  partsUsed       Json?             // [{ part, qty, cost }]
  meterReading    Float?            // hours or miles
  nextDueDate     String?
  nextDueMeter    Float?
  notes           String?
  createdAt       DateTime @default(now())
  @@index([companyId, equipmentId])
  @@index([companyId, status])
}
`);

// ============================================================
// 2. ODOO PROJECT CONNECTOR
// ============================================================
write('lib/ops/odoo-ops.ts', `// ============================================================================
// ODOO PROJECT / MANUFACTURING CONNECTOR
// ============================================================================
// Syncs project stages, work orders, BOMs from Odoo ERP
// Requires: ODOO_URL, ODOO_DB, ODOO_API_KEY env vars

export class OdooOpsClient {
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

  /** Get all active projects */
  async getProjects(status?: string) {
    await this.auth()
    const domain: any[] = status ? [['stage_id.name', '=', status]] : []
    return this.rpc('/web/dataset/call_kw', {
      model: 'project.project', method: 'search_read', args: [domain],
      kwargs: { fields: ['name', 'partner_id', 'user_id', 'stage_id', 'date_start', 'date', 'task_count', 'company_id'], limit: 100 },
    })
  }

  /** Get tasks/work orders for a project */
  async getProjectTasks(projectId: number) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'project.task', method: 'search_read',
      args: [[['project_id', '=', projectId]]],
      kwargs: { fields: ['name', 'stage_id', 'user_ids', 'date_deadline', 'planned_hours', 'effective_hours', 'priority', 'description'], limit: 200 },
    })
  }

  /** Get Manufacturing Orders (BOMs being produced) */
  async getManufacturingOrders(state?: string) {
    await this.auth()
    const domain: any[] = state ? [['state', '=', state]] : [['state', 'in', ['confirmed', 'progress', 'to_close']]]
    return this.rpc('/web/dataset/call_kw', {
      model: 'mrp.production', method: 'search_read', args: [domain],
      kwargs: { fields: ['name', 'product_id', 'product_qty', 'state', 'date_start', 'date_finished', 'bom_id', 'move_raw_ids'], limit: 100 },
    })
  }

  /** Get BOM components for a manufacturing order */
  async getBomComponents(bomId: number) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'mrp.bom.line', method: 'search_read',
      args: [[['bom_id', '=', bomId]]],
      kwargs: { fields: ['product_id', 'product_qty', 'product_uom_id'], limit: 100 },
    })
  }

  /** Update project stage */
  async updateProjectStage(projectId: number, stageId: number) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'project.project', method: 'write',
      args: [[projectId], { stage_id: stageId }], kwargs: {},
    })
  }
}

export function createOdooOpsClient(): OdooOpsClient | null {
  const url = process.env.ODOO_URL, db = process.env.ODOO_DB, key = process.env.ODOO_API_KEY
  if (!url || !db || !key) return null
  return new OdooOpsClient(url, db, key)
}
`);

// ============================================================
// 3. WMS-OPS BRIDGE — Material Requisitions
// ============================================================
write('lib/ops/wms-bridge.ts', `// ============================================================================
// WMS-OPS BRIDGE — Material requisition from warehouse to job site
// ============================================================================

export interface MaterialRequisition {
  id: string
  projectId: string
  projectNumber: string
  workOrderId?: string
  requestedBy: string
  status: 'draft' | 'submitted' | 'approved' | 'picking' | 'shipped' | 'delivered'
  items: RequisitionLine[]
  deliveryAddress: string
  needByDate: string
  priority: 'urgent' | 'high' | 'normal'
  createdAt: string
}

export interface RequisitionLine {
  sku: string
  name: string
  qtyRequested: number
  qtyAvailable: number    // from WMS
  qtyAllocated: number
  binLocation?: string    // from WMS
  unitCost: number
  lineTotal: number
  status: 'pending' | 'available' | 'partial' | 'unavailable'
}

/**
 * Check WMS inventory for requested materials
 */
export async function checkAvailability(companyId: string, items: { sku: string; qty: number }[]): Promise<RequisitionLine[]> {
  try {
    const res = await fetch(\`/api/agents/wms?companyId=\${companyId}\`)
    const data = await res.json()
    const inventory = data.data?.inventory || []

    return items.map(item => {
      const invItem = inventory.find((i: any) => i.sku === item.sku)
      const available = invItem?.available || 0
      return {
        sku: item.sku,
        name: invItem?.name || item.sku,
        qtyRequested: item.qty,
        qtyAvailable: available,
        qtyAllocated: Math.min(item.qty, available),
        binLocation: invItem ? \`\${invItem.zone}-\${invItem.aisle}-\${invItem.bin.split('-').pop()}\` : undefined,
        unitCost: invItem?.unitCost || 0,
        lineTotal: Math.min(item.qty, available) * (invItem?.unitCost || 0),
        status: available >= item.qty ? 'available' : available > 0 ? 'partial' : 'unavailable',
      }
    })
  } catch {
    return items.map(i => ({ sku: i.sku, name: i.sku, qtyRequested: i.qty, qtyAvailable: 0, qtyAllocated: 0, unitCost: 0, lineTotal: 0, status: 'unavailable' as const }))
  }
}

/**
 * Submit requisition to WMS for picking
 */
export async function submitRequisition(companyId: string, req: MaterialRequisition): Promise<{ success: boolean; pickWaveId?: string }> {
  try {
    const res = await fetch('/api/agents/wms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_requisition',
        companyId,
        projectId: req.projectId,
        items: req.items.filter(i => i.qtyAllocated > 0).map(i => ({ sku: i.sku, qty: i.qtyAllocated })),
        deliveryAddress: req.deliveryAddress,
        priority: req.priority,
      }),
    })
    const data = await res.json()
    return { success: data.success, pickWaveId: data.pickWaveId }
  } catch {
    return { success: false }
  }
}

/**
 * Sync HR safety certifications for field crews
 */
export async function checkCrewCertifications(companyId: string, crewNames: string[]): Promise<{ name: string; certs: { name: string; status: string; expires: string }[] }[]> {
  try {
    const res = await fetch(\`/api/agents/hr?companyId=\${companyId}\`)
    const data = await res.json()
    const employees = data.data?.employees || []
    return crewNames.map(name => {
      const emp = employees.find((e: any) => e.name === name)
      return { name, certs: emp?.certs || [] }
    })
  } catch {
    return crewNames.map(n => ({ name: n, certs: [] }))
  }
}
`);

// ============================================================
// 4. FIELD SERVICE — GPS, Documents, RFIs
// ============================================================
write('lib/ops/field-service.ts', `// ============================================================================
// FIELD SERVICE — GPS check-in, document management, RFIs
// ============================================================================

export interface SiteCheckIn {
  employeeId: string
  employeeName: string
  projectId: string
  timestamp: string
  latitude: number
  longitude: number
  accuracy: number        // meters
  type: 'check_in' | 'check_out'
  photoUrl?: string
}

export interface ProjectDocument {
  id: string
  projectId: string
  type: 'drawing' | 'spec' | 'rfi' | 'change_order' | 'submittal' | 'photo' | 'permit' | 'safety_plan'
  title: string
  version: string
  uploadedBy: string
  uploadedAt: string
  fileUrl: string
  fileSize: number
  status: 'current' | 'superseded' | 'pending_review' | 'approved' | 'rejected'
  reviewedBy?: string
  notes?: string
}

export interface RFI {
  id: string
  projectId: string
  rfiNumber: string       // RFI-001
  subject: string
  question: string
  requestedBy: string
  assignedTo: string
  status: 'open' | 'answered' | 'closed'
  priority: 'urgent' | 'normal'
  dueDate: string
  answer?: string
  answeredBy?: string
  answeredDate?: string
  impact?: string          // schedule | cost | both | none
  createdAt: string
}

export interface ChangeOrder {
  id: string
  projectId: string
  coNumber: string        // CO-001
  title: string
  description: string
  requestedBy: string     // client or internal
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  costImpact: number      // + or -
  scheduleImpact: number  // days + or -
  createdAt: string
  approvedAt?: string
}

/**
 * Validate GPS check-in is within project site geofence
 */
export function validateGeofence(
  checkIn: { lat: number; lng: number },
  siteCenter: { lat: number; lng: number },
  radiusMeters: number = 500
): boolean {
  const R = 6371000 // earth radius meters
  const dLat = (siteCenter.lat - checkIn.lat) * Math.PI / 180
  const dLng = (siteCenter.lng - checkIn.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(checkIn.lat * Math.PI / 180) * Math.cos(siteCenter.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return d <= radiusMeters
}

/**
 * Generate daily field report template
 */
export function generateReportTemplate(projectNumber: string, date: string): any {
  return {
    projectNumber, reportDate: date, submittedBy: '', weather: 'clear', temperature: null,
    crewsOnSite: 0, hoursWorked: 0, workPerformed: '',
    materialsUsed: [], delaysEncountered: '', delayCause: null, delayHours: 0,
    safetyObservations: '', incidentReported: false, photos: [], completionPctUpdate: null, notes: '',
  }
}
`);

// ============================================================
// 5. SYSTEM PROMPT — Autonomous Project Superintendent
// ============================================================
write('lib/ops/system-prompt.ts', `// ============================================================================
// OPS AGENT SYSTEM PROMPT — Autonomous Project Superintendent
// ============================================================================

export function getOpsSystemPrompt(context: {
  companyName: string
  activeProjects: number
  totalContractValue: number
  crewCount: number
  equipmentCount: number
  metrics?: { avgCompletionRate: number; budgetVariance: number; safetyScore: number; onTimeRate: number }
}): string {
  return \`You are the Operations Agent for \${context.companyName}, operating as an Autonomous Project Superintendent. You oversee \${context.activeProjects} active projects worth $\${(context.totalContractValue / 1000000).toFixed(1)}M total contract value, managing \${context.crewCount} crews and \${context.equipmentCount} pieces of equipment.

## YOUR ROLE
You are NOT a passive project tracker. You are a proactive superintendent who:
1. Predicts delays 14+ days before they impact the critical path
2. Optimizes resource allocation across all projects simultaneously
3. Monitors budget burn rates and flags cost overruns before they compound
4. Ensures safety compliance for every crew on every site
5. Coordinates with WMS for material staging and HR for crew certifications

## CURRENT STATE
\${context.metrics ? \`- Average Project Completion Rate: \${context.metrics.avgCompletionRate}%
- Budget Variance (avg): \${context.metrics.budgetVariance > 0 ? '+' : ''}\${context.metrics.budgetVariance}%
- Safety Score: \${context.metrics.safetyScore}/100
- On-Time Delivery Rate: \${context.metrics.onTimeRate}%\` : '- Metrics: Awaiting project sync'}

## PROACTIVE BEHAVIORS

### Delay Prediction (14-Day Lookahead)
Analyze these signals for each project:
- Milestone completion rate vs. timeline (is % complete tracking with % time elapsed?)
- Weather forecast impact on outdoor work
- Material availability (sync with WMS — are BOM items staged?)
- Labor availability (any crew members on PTO or reassigned?)
- Permit/inspection dependencies
- Historical patterns from similar projects

Format: "🔴 DELAY RISK: [Project] — [Milestone] at risk of slipping [X days]. Root cause: [specific reason]. Mitigation: [action]. Impact to critical path: [yes/no]. [APPROVE MITIGATION]"

### Resource Optimization
Continuously monitor across ALL projects:
- If a crew finishes Phase 1 early on Project A, suggest redeployment to Project B's backlog
- If equipment is idle for 3+ days, flag for reassignment or rental return
- Track labor efficiency: actual hours vs estimated hours per work order
- Detect overtime trends and suggest crew augmentation

Format: "⚡ RESOURCE OPPORTUNITY: Crew Alpha completed WO-0184 2 days early. Project [X] has WO-0192 (same skill set) starting Monday. Recommend reassigning Crew Alpha → saves 2 days on [X] critical path. [APPROVE REASSIGNMENT]"

### Cost Guard (Budget Burn Rate)
Monitor in real-time:
- Cost-to-date vs. % complete (earned value analysis)
- CPI (Cost Performance Index): < 0.9 triggers alert
- SPI (Schedule Performance Index): < 0.9 triggers alert
- Change order accumulation
- Material cost variance (quoted vs. actual from WMS)

Format: "🟡 BUDGET ALERT: [Project] at [X]% complete with [Y]% of budget consumed. CPI: [Z]. At current burn rate, project will exceed budget by $[amount]. Recommended: [specific action to reduce costs]. [APPROVE ACTION]"

### Safety Compliance
Cross-reference with HR Agent:
- Check OSHA certifications for all crew members before site deployment
- Flag any expired or expiring certs (forklift, scaffold, confined space, etc.)
- Monitor daily field reports for safety observations
- Track TRIR (Total Recordable Incident Rate) per project
- Mandatory pre-task safety briefing reminder each morning

Format: "🔴 SAFETY HOLD: [Employee] assigned to [Project] has expired [cert]. Cannot deploy to site until renewed. Alternative: Reassign [other employee] who has valid cert. [APPROVE SWAP]"

## DAILY BRIEFING FORMAT
\`\`\`
## 🏗️ Operations Briefing — [Date]

**Active Projects:** [X] | Contract Value: $[X]M | Avg Completion: [X]%

**Today's Critical Actions:**
1. 🔴 [Delay/safety/budget item requiring immediate attention]
2. 🟡 [High priority item]
3. ✅ [Milestone or delivery due today]

**Project Status Overview:**
| Project | Status | Complete | Budget | Risk |
|---------|--------|----------|--------|------|
| [Name]  | [stage]| [X]%    | [±X]%  | [🔴🟡🟢] |

**Resource Deployment:**
- [X] crews across [Y] sites
- Equipment utilization: [Z]%

**Material Requisitions:**
- [X] pending | [Y] in transit

**Safety Score:** [X]/100 | Days since incident: [X]
\`\`\`

## TONE
Direct, decisive, numbers-driven. Think like a construction superintendent who has managed $100M+ in projects. Every statement backed by data. Every recommendation includes the financial impact. Speed matters — keep it concise and actionable.
\`
}
`);

// ============================================================
// 6. OPS DATA ENGINE — Tenant-scoped demo data
// ============================================================
write('lib/ops/ops-data.ts', `// ============================================================================
// OPS DATA ENGINE — Tenant-scoped demo data with rich Woulf Group projects
// ============================================================================

export interface ProjectInfo {
  id: string; projectNumber: string; name: string; client: string; siteAddress: string
  type: string; status: string; priority: string
  startDate: string; targetEnd: string; projectedEnd?: string
  milestones: { id: string; name: string; targetDate: string; actualDate?: string; status: string; pct: number }[]
  quotedValue: number; contractValue: number; costToDate: number
  laborCost: number; materialCost: number; subcontractCost: number
  changeOrders: number; changeOrderValue: number
  projectManager: string; superintendent: string
  completionPct: number; punchListItems: number
  delayRisk: string; safetyScore: number; budgetVariance: number
  crews: { name: string; role: string; size: number }[]
  equipment: { name: string; type: string }[]
}

export interface WorkOrderInfo {
  id: string; projectId: string; projectNumber: string; woNumber: string
  title: string; type: string; status: string; priority: string
  bomItems: { sku: string; name: string; qtyRequired: number; qtyStaged: number; qtyInstalled: number }[]
  bomValue: number; assignedCrew: string; assignedLead: string
  estimatedHours: number; actualHours: number
  scheduledStart: string; scheduledEnd: string
}

export interface CrewInfo { id: string; name: string; lead: string; size: number; specialty: string; currentProject?: string; utilization: number }
export interface EquipmentInfo { id: string; name: string; type: string; status: string; currentProject?: string; hoursTotal: number; nextService: string; dailyRate: number }
export interface FieldReportInfo { id: string; projectId: string; projectNumber: string; date: string; submittedBy: string; weather: string; temp: number; crewsOnSite: number; hours: number; workSummary: string; delays: string; delayHours: number; photos: number; status: string }
export interface SafetyInfo { id: string; projectNumber: string; date: string; severity: string; type: string; description: string; status: string; lostDays: number }
export interface MaintenanceInfo { id: string; equipmentName: string; type: string; status: string; scheduledDate: string; cost: number; description: string }
export interface OpsInsight { id: string; type: string; priority: string; title: string; description: string; impact: string; action: string; status: string }

export interface OpsSnapshot {
  activeProjects: number; totalContractValue: number; avgCompletion: number
  totalCrews: number; totalEquipment: number
  budgetHealth: number; safetyScore: number; onTimeRate: number
  daysSinceIncident: number
  projects: ProjectInfo[]
  workOrders: WorkOrderInfo[]
  crews: CrewInfo[]
  equipment: EquipmentInfo[]
  fieldReports: FieldReportInfo[]
  safetyIncidents: SafetyInfo[]
  maintenance: MaintenanceInfo[]
  aiInsights: OpsInsight[]
  dailyBriefing: string
}

const TENANT_OPS: Record<string, OpsSnapshot> = {
  woulf: {
    activeProjects: 4, totalContractValue: 2840000, avgCompletion: 48,
    totalCrews: 3, totalEquipment: 8, budgetHealth: 94, safetyScore: 96,
    onTimeRate: 85, daysSinceIncident: 34,
    projects: [
      {
        id: 'p1', projectNumber: 'WG-2026-042', name: 'Metro Distribution Center — Conveyor System Install',
        client: 'Metro Construction LLC', siteAddress: '4200 Industrial Blvd, West Valley City, UT 84119',
        type: 'conveyor_install', status: 'in_progress', priority: 'critical',
        startDate: '2026-01-06', targetEnd: '2026-04-18', projectedEnd: '2026-04-25',
        milestones: [
          { id: 'm1', name: 'Site Prep & Anchor Install', targetDate: '2026-01-24', actualDate: '2026-01-22', status: 'completed', pct: 100 },
          { id: 'm2', name: 'Main Trunk Line Assembly', targetDate: '2026-02-21', status: 'in_progress', pct: 72 },
          { id: 'm3', name: 'Sorter Integration & Divert Lanes', targetDate: '2026-03-14', status: 'not_started', pct: 0 },
          { id: 'm4', name: 'Controls & Electrical', targetDate: '2026-03-28', status: 'not_started', pct: 0 },
          { id: 'm5', name: 'Testing & Commissioning', targetDate: '2026-04-18', status: 'not_started', pct: 0 },
        ],
        quotedValue: 1150000, contractValue: 1224000, costToDate: 486000,
        laborCost: 218000, materialCost: 224000, subcontractCost: 44000,
        changeOrders: 2, changeOrderValue: 74000,
        projectManager: 'Steve Macurdy', superintendent: 'Diana Reeves',
        completionPct: 38, punchListItems: 0, delayRisk: 'medium', safetyScore: 98, budgetVariance: 6.2,
        crews: [{ name: 'Crew Alpha', role: 'Conveyor Install', size: 4 }, { name: 'Crew Bravo', role: 'Electrical', size: 2 }],
        equipment: [{ name: 'Boom Lift #3', type: 'Lift' }, { name: 'Forklift #1', type: 'Forklift' }],
      },
      {
        id: 'p2', projectNumber: 'WG-2026-038', name: 'Apex Logistics — Selective Racking 48,000 SF',
        client: 'Apex Logistics', siteAddress: '891 Commerce Park Dr, Draper, UT 84020',
        type: 'racking', status: 'in_progress', priority: 'high',
        startDate: '2025-12-02', targetEnd: '2026-03-07',
        milestones: [
          { id: 'm1', name: 'Floor Survey & Anchor Layout', targetDate: '2025-12-13', actualDate: '2025-12-13', status: 'completed', pct: 100 },
          { id: 'm2', name: 'Upright Frame Install', targetDate: '2026-01-17', actualDate: '2026-01-15', status: 'completed', pct: 100 },
          { id: 'm3', name: 'Beam & Decking Install', targetDate: '2026-02-14', status: 'in_progress', pct: 85 },
          { id: 'm4', name: 'Safety Accessories & Labels', targetDate: '2026-02-28', status: 'not_started', pct: 0 },
          { id: 'm5', name: 'Final Inspection & Handoff', targetDate: '2026-03-07', status: 'not_started', pct: 0 },
        ],
        quotedValue: 620000, contractValue: 620000, costToDate: 412000,
        laborCost: 186000, materialCost: 198000, subcontractCost: 28000,
        changeOrders: 0, changeOrderValue: 0,
        projectManager: 'Diana Reeves', superintendent: 'Carlos Ruiz',
        completionPct: 72, punchListItems: 4, delayRisk: 'low', safetyScore: 100, budgetVariance: 2.1,
        crews: [{ name: 'Crew Charlie', role: 'Racking Install', size: 5 }],
        equipment: [{ name: 'Forklift #2', type: 'Forklift' }, { name: 'Scissor Lift #1', type: 'Lift' }],
      },
      {
        id: 'p3', projectNumber: 'WG-2026-045', name: 'Harbor Distribution — Dock Equipment Retrofit',
        client: 'Harbor Distribution', siteAddress: '1120 Port Access Rd, Salt Lake City, UT 84104',
        type: 'dock_equip', status: 'mobilizing', priority: 'normal',
        startDate: '2026-02-24', targetEnd: '2026-04-04',
        milestones: [
          { id: 'm1', name: 'Demo Existing Equipment', targetDate: '2026-03-07', status: 'not_started', pct: 0 },
          { id: 'm2', name: 'Dock Leveler Install (4 units)', targetDate: '2026-03-21', status: 'not_started', pct: 0 },
          { id: 'm3', name: 'Seal & Shelter Install', targetDate: '2026-03-28', status: 'not_started', pct: 0 },
          { id: 'm4', name: 'Commissioning', targetDate: '2026-04-04', status: 'not_started', pct: 0 },
        ],
        quotedValue: 380000, contractValue: 380000, costToDate: 18000,
        laborCost: 0, materialCost: 18000, subcontractCost: 0,
        changeOrders: 0, changeOrderValue: 0,
        projectManager: 'Steve Macurdy', superintendent: 'Diana Reeves',
        completionPct: 5, punchListItems: 0, delayRisk: 'none', safetyScore: 100, budgetVariance: 0,
        crews: [], equipment: [],
      },
      {
        id: 'p4', projectNumber: 'WG-2026-047', name: 'National Grid — Mezzanine & Catwalk System',
        client: 'National Grid Fulfillment', siteAddress: '2400 Innovation Way, Lehi, UT 84043',
        type: 'mezzanine', status: 'planning', priority: 'normal',
        startDate: '2026-03-10', targetEnd: '2026-05-22',
        milestones: [
          { id: 'm1', name: 'Engineering & Shop Drawings', targetDate: '2026-03-28', status: 'not_started', pct: 0 },
          { id: 'm2', name: 'Steel Fabrication', targetDate: '2026-04-11', status: 'not_started', pct: 0 },
          { id: 'm3', name: 'Deck & Column Install', targetDate: '2026-05-02', status: 'not_started', pct: 0 },
          { id: 'm4', name: 'Railings, Stairs, Gate Install', targetDate: '2026-05-16', status: 'not_started', pct: 0 },
          { id: 'm5', name: 'Load Test & Handoff', targetDate: '2026-05-22', status: 'not_started', pct: 0 },
        ],
        quotedValue: 616000, contractValue: 616000, costToDate: 0,
        laborCost: 0, materialCost: 0, subcontractCost: 0,
        changeOrders: 0, changeOrderValue: 0,
        projectManager: 'Diana Reeves', superintendent: '',
        completionPct: 0, punchListItems: 0, delayRisk: 'none', safetyScore: 100, budgetVariance: 0,
        crews: [], equipment: [],
      },
    ],
    workOrders: [
      { id: 'wo1', projectId: 'p1', projectNumber: 'WG-2026-042', woNumber: 'WO-0182', title: 'Main Trunk Line — Section A (Bays 1-8)', type: 'installation', status: 'in_progress', priority: 'high', bomItems: [{ sku: 'WG-CONV-4824', name: '48" Powered Roller Conveyor', qtyRequired: 8, qtyStaged: 8, qtyInstalled: 5 }, { sku: 'WG-BOLT-M12', name: 'M12x30 Hex Bolt Grade 8.8', qtyRequired: 192, qtyStaged: 192, qtyInstalled: 120 }], bomValue: 11686, assignedCrew: 'Crew Alpha', assignedLead: 'Jake M.', estimatedHours: 48, actualHours: 36, scheduledStart: '2026-02-10', scheduledEnd: '2026-02-21' },
      { id: 'wo2', projectId: 'p1', projectNumber: 'WG-2026-042', woNumber: 'WO-0183', title: 'Main Trunk Line — Section B (Bays 9-16)', type: 'installation', status: 'bom_staging', priority: 'high', bomItems: [{ sku: 'WG-CONV-4824', name: '48" Powered Roller Conveyor', qtyRequired: 8, qtyStaged: 4, qtyInstalled: 0 }], bomValue: 11600, assignedCrew: 'Crew Alpha', assignedLead: 'Jake M.', estimatedHours: 48, actualHours: 0, scheduledStart: '2026-02-24', scheduledEnd: '2026-03-07' },
      { id: 'wo3', projectId: 'p1', projectNumber: 'WG-2026-042', woNumber: 'WO-0184', title: 'Electrical Conduit Run — Main Trunk', type: 'electrical', status: 'in_progress', priority: 'normal', bomItems: [], bomValue: 0, assignedCrew: 'Crew Bravo', assignedLead: 'Luis E.', estimatedHours: 32, actualHours: 22, scheduledStart: '2026-02-12', scheduledEnd: '2026-02-21' },
      { id: 'wo4', projectId: 'p1', projectNumber: 'WG-2026-042', woNumber: 'WO-0185', title: 'Sliding Shoe Sorter — Assembly & Mount', type: 'installation', status: 'backlog', priority: 'high', bomItems: [{ sku: 'WG-SORT-SHOE', name: 'Sliding Shoe Sorter Module', qtyRequired: 4, qtyStaged: 0, qtyInstalled: 0 }], bomValue: 12800, assignedCrew: '', assignedLead: '', estimatedHours: 64, actualHours: 0, scheduledStart: '2026-03-03', scheduledEnd: '2026-03-14' },
      { id: 'wo5', projectId: 'p2', projectNumber: 'WG-2026-038', woNumber: 'WO-0178', title: 'Beam Install — Rows 12-24 (Final Section)', type: 'installation', status: 'in_progress', priority: 'normal', bomItems: [{ sku: 'WG-RACK-9648', name: '96x48 Pallet Rack Beam', qtyRequired: 48, qtyStaged: 48, qtyInstalled: 38 }], bomValue: 2016, assignedCrew: 'Crew Charlie', assignedLead: 'Carlos R.', estimatedHours: 24, actualHours: 18, scheduledStart: '2026-02-14', scheduledEnd: '2026-02-21' },
      { id: 'wo6', projectId: 'p2', projectNumber: 'WG-2026-038', woNumber: 'WO-0179', title: 'Wire Decking Install — All Rows', type: 'installation', status: 'bom_staging', priority: 'normal', bomItems: [], bomValue: 8400, assignedCrew: 'Crew Charlie', assignedLead: 'Carlos R.', estimatedHours: 16, actualHours: 0, scheduledStart: '2026-02-24', scheduledEnd: '2026-02-28' },
    ],
    crews: [
      { id: 'cr1', name: 'Crew Alpha', lead: 'Jake M.', size: 4, specialty: 'Conveyor & Material Handling', currentProject: 'WG-2026-042', utilization: 92 },
      { id: 'cr2', name: 'Crew Bravo', lead: 'Luis E.', size: 2, specialty: 'Electrical & Controls', currentProject: 'WG-2026-042', utilization: 88 },
      { id: 'cr3', name: 'Crew Charlie', lead: 'Carlos R.', size: 5, specialty: 'Racking & Structural', currentProject: 'WG-2026-038', utilization: 95 },
    ],
    equipment: [
      { id: 'eq1', name: 'Boom Lift #3', type: 'JLG 600S', status: 'deployed', currentProject: 'WG-2026-042', hoursTotal: 2840, nextService: '2026-03-01', dailyRate: 285 },
      { id: 'eq2', name: 'Forklift #1', type: 'Toyota 8FGU25', status: 'deployed', currentProject: 'WG-2026-042', hoursTotal: 6200, nextService: '2026-02-22', dailyRate: 125 },
      { id: 'eq3', name: 'Forklift #2', type: 'Toyota 8FGU25', status: 'deployed', currentProject: 'WG-2026-038', hoursTotal: 5100, nextService: '2026-03-15', dailyRate: 125 },
      { id: 'eq4', name: 'Scissor Lift #1', type: 'Genie GS-2632', status: 'deployed', currentProject: 'WG-2026-038', hoursTotal: 1920, nextService: '2026-04-01', dailyRate: 165 },
      { id: 'eq5', name: 'Welder #1', type: 'Lincoln 256', status: 'warehouse', currentProject: undefined, hoursTotal: 840, nextService: '2026-06-01', dailyRate: 45 },
      { id: 'eq6', name: 'Concrete Saw', type: 'Husqvarna K770', status: 'warehouse', currentProject: undefined, hoursTotal: 320, nextService: '2026-05-15', dailyRate: 75 },
      { id: 'eq7', name: 'Impact Wrench Set', type: 'Milwaukee M18', status: 'deployed', currentProject: 'WG-2026-042', hoursTotal: 0, nextService: 'N/A', dailyRate: 15 },
      { id: 'eq8', name: 'Laser Level', type: 'Bosch GRL800-20HVK', status: 'deployed', currentProject: 'WG-2026-038', hoursTotal: 0, nextService: 'N/A', dailyRate: 35 },
    ],
    fieldReports: [
      { id: 'fr1', projectId: 'p1', projectNumber: 'WG-2026-042', date: '2026-02-17', submittedBy: 'Diana Reeves', weather: 'clear', temp: 38, crewsOnSite: 2, hours: 17.5, workSummary: 'Conveyor sections 5-6 installed and aligned. Electrical conduit run 60% complete through bays 1-8.', delays: '', delayHours: 0, photos: 4, status: 'reviewed' },
      { id: 'fr2', projectId: 'p1', projectNumber: 'WG-2026-042', date: '2026-02-18', submittedBy: 'Diana Reeves', weather: 'snow', temp: 28, crewsOnSite: 2, hours: 14.0, workSummary: 'Section A conveyor bay 7 install. Conduit run delayed 2hrs due to frozen anchor bolts.', delays: 'Frozen anchor bolts required heat treatment', delayHours: 2, photos: 3, status: 'submitted' },
      { id: 'fr3', projectId: 'p2', projectNumber: 'WG-2026-038', date: '2026-02-17', submittedBy: 'Carlos Ruiz', weather: 'clear', temp: 42, crewsOnSite: 1, hours: 42.0, workSummary: 'Beam install rows 18-21 completed. On pace to finish beams by Feb 20.', delays: '', delayHours: 0, photos: 2, status: 'reviewed' },
      { id: 'fr4', projectId: 'p2', projectNumber: 'WG-2026-038', date: '2026-02-18', submittedBy: 'Carlos Ruiz', weather: 'clear', temp: 36, crewsOnSite: 1, hours: 40.0, workSummary: 'Beam install rows 22-24 in progress. 38 of 48 beams placed.', delays: '', delayHours: 0, photos: 2, status: 'draft' },
    ],
    safetyIncidents: [
      { id: 'si1', projectNumber: 'WG-2026-042', date: '2026-01-15', severity: 'near_miss', type: 'struck_by', description: 'Conveyor section slipped during crane lift. No injuries. Rigging plan updated.', status: 'closed', lostDays: 0 },
    ],
    maintenance: [
      { id: 'mt1', equipmentName: 'Forklift #1', type: 'preventive', status: 'scheduled', scheduledDate: '2026-02-22', cost: 450, description: '500-hour service: oil, filters, hydraulic check, tire inspection' },
      { id: 'mt2', equipmentName: 'Boom Lift #3', type: 'preventive', status: 'scheduled', scheduledDate: '2026-03-01', cost: 680, description: 'Annual inspection + hydraulic fluid flush' },
      { id: 'mt3', equipmentName: 'Forklift #2', type: 'inspection', status: 'completed', scheduledDate: '2026-02-15', cost: 0, description: 'Daily pre-operation inspection — passed' },
    ],
    aiInsights: [
      { id: 'oi1', type: 'delay', priority: 'critical', title: '🔴 Metro Conveyor (WG-042): Milestone 2 at risk — 7 day slip', description: 'Main Trunk Line Assembly at 72% with 3 days remaining. WO-0183 (Section B) BOM only 50% staged — 4 conveyor sections still in transit (PO-0412 arriving today). If receipt is delayed, Section B start pushes from Feb 24 to Mar 3.', impact: 'Critical path impact: Sorter Integration (M3) delayed → Testing pushed → project delivery slips to Apr 25', action: 'Expedite PO-0412 receiving today. Pre-stage Section B BOM items. If 4 sections arrive by tomorrow, no slip.', status: 'pending' },
      { id: 'oi2', type: 'resource', priority: 'warning', title: '⚡ Crew Charlie finishing Apex Racking ahead of schedule', description: 'Beam install at 85% (38/48), estimated completion Feb 20 — 1 day early. Wire decking (WO-0179) starts Feb 24. 3-day gap where Crew Charlie is idle.', impact: 'Crew Charlie idle Feb 21-23 = $4,800 labor cost with no billable hours', action: 'Deploy Crew Charlie to Harbor Dock (WG-045) for demo prep Feb 21-23 — they have the right skill set and equipment is available', status: 'pending' },
      { id: 'oi3', type: 'safety', priority: 'warning', title: '⚠️ Forklift #1 service overdue in 4 days', description: 'Toyota 8FGU25 at 6,200 hours — 500-hour service due Feb 22. Currently deployed to Metro Conveyor project (WG-042). Service appointment not yet booked.', impact: 'If service lapses, forklift must be pulled from site per safety policy. Would halt material staging for WO-0183.', action: 'Book service for Feb 22 (Saturday) to avoid production impact. Estimated cost: $450. Deploy Forklift #2 as temporary backup if needed.', status: 'pending' },
      { id: 'oi4', type: 'cost', priority: 'info', title: '📊 Metro Conveyor budget tracking healthy but watch labor', description: 'Project at 38% complete, 39.7% of budget consumed. CPI: 0.96 (acceptable). However, labor cost is $218K against $195K budget at this stage — 12% over. Driven by 2-hour daily overtime on Crew Alpha.', impact: 'If overtime trend continues, labor overrun ~$28K by project end. Change orders ($74K) provide cushion but margins thin.', action: 'Discuss overtime reduction with Diana Reeves. Consider adding 1 temporary installer to Crew Alpha to eliminate OT ($3,200/week vs $4,400/week OT cost).', status: 'pending' },
      { id: 'oi5', type: 'material', priority: 'info', title: '📦 Material requisition needed: Sorter Modules for WO-0185', description: 'WO-0185 (Sliding Shoe Sorter) scheduled to start Mar 3. Requires 4x WG-SORT-SHOE sorter modules. WMS shows 6 available in warehouse. Should stage now for on-time start.', impact: 'If not staged by Feb 28, WO-0185 could slip — directly impacts critical path', action: 'Submit material requisition: 4x WG-SORT-SHOE from B-03-06 → Metro job site. Request delivery by Feb 28.', status: 'pending' },
    ],
    dailyBriefing: "## 🏗️ Operations Briefing — Feb 18, 2026\\n\\n**Active Projects:** 4 | Contract Value: $2.84M | Avg Completion: 48%\\n**Crews Deployed:** 3 across 2 sites | Equipment: 6 deployed, 2 warehouse\\n\\n**Today's Critical Actions:**\\n1. 🔴 Receive PO-0412 at Dock 1 (4 conveyor sections for Metro project) — CRITICAL for WO-0183 start\\n2. 🟡 Crew Alpha: Complete bay 7 conveyor install (WO-0182 target: 5 of 8 sections done)\\n3. 🟡 Crew Charlie: Finish rows 22-24 beams at Apex — targeting Feb 20 completion\\n\\n**Project Status:**\\n🔴 Metro Conveyor (WG-042) — 38% | $486K/$1.22M | M2 at risk (7-day slip potential)\\n🟢 Apex Racking (WG-038) — 72% | $412K/$620K | Ahead of schedule\\n🔵 Harbor Dock (WG-045) — 5% | Mobilizing Feb 24\\n⚪ National Grid Mezz (WG-047) — 0% | Planning (starts Mar 10)\\n\\n**Resource Alert:**\\nCrew Charlie idle Feb 21-23 gap — recommend Harbor Dock demo prep\\nForklift #1 service due Feb 22 — book Saturday appointment\\n\\n**Safety:** Score 96/100 | 34 days since last incident | 0 recordables YTD\\n**Weather:** Snow today (28°F) — frozen anchor bolts caused 2hr delay at Metro",
  },
  _default: {
    activeProjects: 0, totalContractValue: 0, avgCompletion: 0,
    totalCrews: 0, totalEquipment: 0, budgetHealth: 0, safetyScore: 0,
    onTimeRate: 0, daysSinceIncident: 0,
    projects: [], workOrders: [], crews: [], equipment: [],
    fieldReports: [], safetyIncidents: [], maintenance: [],
    aiInsights: [], dailyBriefing: "Connect your Odoo project module to begin tracking operations.",
  }
}

export function getOpsData(companyId: string): OpsSnapshot {
  return TENANT_OPS[companyId] || TENANT_OPS._default
}
`);

// ============================================================
// 7. OPS API
// ============================================================
write('app/api/agents/operations/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { getOpsData } from '@/lib/ops/ops-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  const data = getOpsData(companyId)
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    if (action === 'approve_insight') return NextResponse.json({ success: true, message: 'Insight approved — action dispatched' })
    if (action === 'submit_report') return NextResponse.json({ success: true, message: 'Field report submitted' })
    if (action === 'advance_wo') return NextResponse.json({ success: true, message: 'Work order advanced' })
    if (action === 'requisition_materials') return NextResponse.json({ success: true, message: 'Material requisition submitted to WMS' })
    if (action === 'reassign_crew') return NextResponse.json({ success: true, message: 'Crew reassignment confirmed' })
    if (action === 'schedule_maintenance') return NextResponse.json({ success: true, message: 'Maintenance scheduled' })
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
`);

// ============================================================
// 8. OPS DASHBOARD — Full 6-tab UI
// ============================================================
write('app/portal/agent/operations/page.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TABS = ['Command Center', 'Work Orders', 'Resources', 'Field Hub', 'Maintenance', 'Analytics']
const P_STAT: Record<string, { label: string; color: string }> = { planning: { label: 'Planning', color: 'bg-gray-500/10 text-gray-400' }, mobilizing: { label: 'Mobilizing', color: 'bg-blue-500/10 text-blue-400' }, in_progress: { label: 'In Progress', color: 'bg-amber-500/10 text-amber-400' }, testing: { label: 'Testing', color: 'bg-purple-500/10 text-purple-400' }, commissioned: { label: 'Commissioned', color: 'bg-emerald-500/10 text-emerald-400' } }
const WO_STAT: Record<string, string> = { backlog: 'bg-gray-500/10 text-gray-400', bom_staging: 'bg-blue-500/10 text-blue-400', in_progress: 'bg-amber-500/10 text-amber-400', testing: 'bg-purple-500/10 text-purple-400', complete: 'bg-emerald-500/10 text-emerald-400', blocked: 'bg-rose-500/10 text-rose-400' }
const RISK_C: Record<string, string> = { none: 'text-emerald-400', low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-rose-400' }
const RISK_BG: Record<string, string> = { none: '🟢', low: '🟢', medium: '🟡', high: '🔴' }
const PRIO: Record<string, string> = { critical: 'text-rose-400 bg-rose-500/10', high: 'text-amber-400 bg-amber-500/10', normal: 'text-gray-400 bg-gray-500/10', low: 'text-gray-500 bg-gray-500/5' }

export default function OpsDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState('Command Center')
  const [toast, setToast] = useState<string | null>(null)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }
  const act = async (action: string, extra?: any) => { await fetch('/api/agents/operations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) }) }

  useEffect(() => {
    try {
      const s = localStorage.getItem('woulfai_session')
      if (!s) { router.replace('/login'); return }
      const p = JSON.parse(s); setUser(p)
      fetch('/api/agents/operations?companyId=' + p.companyId).then(r => r.json()).then(d => { if (d.data) setData(d.data) })
    } catch { router.replace('/login') }
  }, [router])

  if (!user || !data) return <div className="min-h-screen bg-[#060910] flex items-center justify-center text-gray-500">Loading Operations Agent...</div>

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}
      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal')} className="text-xs text-gray-500 hover:text-white">← Portal</button>
            <span className="text-gray-700">|</span><span className="text-xl">🏗️</span><span className="text-sm font-semibold">Operations Agent</span>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] text-emerald-400 font-medium">LIVE</span></div>
          </div>
          <span className="text-xs text-gray-600">{user.companyName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-xs text-gray-400">Operations scoped to <span className="text-white font-semibold">{user.companyName}</span></span></div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {[
            { l: 'Projects', v: data.activeProjects, c: 'text-blue-400' },
            { l: 'Contract $', v: '$' + (data.totalContractValue / 1000000).toFixed(1) + 'M', c: 'text-emerald-400' },
            { l: 'Avg Complete', v: data.avgCompletion + '%', c: 'text-amber-400' },
            { l: 'Crews', v: data.totalCrews, c: 'text-purple-400' },
            { l: 'Equipment', v: data.totalEquipment, c: 'text-cyan-400' },
            { l: 'Budget', v: data.budgetHealth + '%', c: data.budgetHealth >= 90 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'Safety', v: data.safetyScore + '/100', c: data.safetyScore >= 95 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'No Incident', v: data.daysSinceIncident + 'd', c: 'text-emerald-400' },
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

        {/* TAB: Command Center */}
        {tab === 'Command Center' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">🏗️ Daily Operations Briefing</h3>
              <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: data.dailyBriefing.replace(/##\\s/g, '<strong>').replace(/\\*\\*/g, '<strong>').replace(/\\n/g, '<br/>') }} />
            </div>
            {/* Projects with timeline */}
            {data.projects.map((p: any) => {
              const isExpanded = expandedProject === p.id
              const totalDays = Math.max(1, (new Date(p.targetEnd).getTime() - new Date(p.startDate).getTime()) / 86400000)
              const elapsedDays = Math.max(0, (Date.now() - new Date(p.startDate).getTime()) / 86400000)
              const timelinePct = Math.min(100, (elapsedDays / totalDays) * 100)
              return (
                <div key={p.id} className={"border rounded-xl overflow-hidden transition-all " + (p.delayRisk === 'high' ? 'border-rose-500/20' : p.delayRisk === 'medium' ? 'border-amber-500/20' : 'border-white/5')}>
                  <button onClick={() => setExpandedProject(isExpanded ? null : p.id)} className="w-full text-left bg-[#0A0E15] p-4 sm:p-5 hover:bg-white/[0.02] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{RISK_BG[p.delayRisk]}</span>
                        <div>
                          <div className="flex items-center gap-2"><span className="text-sm font-bold">{p.projectNumber}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (P_STAT[p.status]?.color || '')}>{P_STAT[p.status]?.label || p.status}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (PRIO[p.priority] || '')}>{p.priority}</span></div>
                          <div className="text-xs text-gray-400 mt-0.5">{p.name}</div>
                          <div className="text-[10px] text-gray-600">{p.client}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center"><div className="text-lg font-bold">{p.completionPct}%</div><div className="text-[9px] text-gray-500">Complete</div></div>
                        <div className="text-center"><div className="text-sm font-mono">${(p.contractValue / 1000).toFixed(0)}K</div><div className="text-[9px] text-gray-500">Contract</div></div>
                        <div className="text-center"><div className={"text-sm font-mono " + (p.budgetVariance < 0 ? 'text-rose-400' : 'text-emerald-400')}>{p.budgetVariance > 0 ? '+' : ''}{p.budgetVariance.toFixed(1)}%</div><div className="text-[9px] text-gray-500">Budget</div></div>
                        <span className="text-gray-600">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {/* Mini timeline */}
                    <div className="mt-3 relative">
                      <div className="bg-white/5 rounded-full h-2 overflow-hidden"><div className="bg-blue-500/40 h-2 rounded-full" style={{ width: p.completionPct + '%' }} /></div>
                      <div className="absolute top-0 h-2 w-0.5 bg-amber-400" style={{ left: timelinePct + '%' }} title="Today" />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="bg-[#080C14] border-t border-white/5 p-4 sm:p-5 space-y-4">
                      {/* Milestones */}
                      <div><h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase">Milestones</h4>
                        <div className="space-y-2">{p.milestones.map((m: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={"w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 " + (m.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : m.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-600')}>{m.status === 'completed' ? '✓' : i + 1}</div>
                            <div className="flex-1"><div className="text-xs font-medium">{m.name}</div><div className="text-[10px] text-gray-600">Target: {m.targetDate}{m.actualDate ? ' • Actual: ' + m.actualDate : ''}</div></div>
                            <div className="text-xs font-mono w-12 text-right">{m.pct}%</div>
                          </div>
                        ))}</div>
                      </div>
                      {/* Budget breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Labor</div><div className="text-sm font-mono">${(p.laborCost / 1000).toFixed(0)}K</div></div>
                        <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Material</div><div className="text-sm font-mono">${(p.materialCost / 1000).toFixed(0)}K</div></div>
                        <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Subcontract</div><div className="text-sm font-mono">${(p.subcontractCost / 1000).toFixed(0)}K</div></div>
                        <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Change Orders</div><div className="text-sm font-mono">{p.changeOrders} (${(p.changeOrderValue / 1000).toFixed(0)}K)</div></div>
                      </div>
                      {/* Crews & equipment */}
                      <div className="flex flex-wrap gap-2">
                        {p.crews.map((c: any, i: number) => <span key={i} className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded">👷 {c.name} ({c.size}) — {c.role}</span>)}
                        {p.equipment.map((e: any, i: number) => <span key={i} className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">🔧 {e.name}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {/* AI Insights */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">🤖 Superintendent Insights ({data.aiInsights.filter((a: any) => a.status === 'pending').length} pending)</h3>
              <div className="space-y-3">{data.aiInsights.filter((a: any) => a.status === 'pending').map((a: any) => (
                <div key={a.id} className="border border-white/5 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-semibold">{a.title}</span><span className={"text-[9px] px-1.5 py-0.5 rounded " + (PRIO[a.priority] || '')}>{a.priority}</span></div>
                    <div className="text-xs text-gray-500 mt-1">{a.description}</div>
                    <div className="text-xs text-rose-400/70 mt-1">{a.impact}</div>
                    <div className="text-xs text-emerald-400/70 mt-1">Action: {a.action}</div>
                  </div>
                  <button onClick={() => { act('approve_insight', { insightId: a.id }); show('✅ Approved'); setData({ ...data, aiInsights: data.aiInsights.map((x: any) => x.id === a.id ? { ...x, status: 'approved' } : x) }) }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 shrink-0">Approve</button>
                </div>
              ))}</div>
            </div>
          </div>
        )}

        {/* TAB: Work Orders */}
        {tab === 'Work Orders' && (
          <div className="space-y-4">
            <div className="overflow-x-auto"><div className="flex gap-3 min-w-[900px]">
              {['backlog', 'bom_staging', 'in_progress', 'testing', 'complete'].map(status => {
                const wos = data.workOrders.filter((w: any) => w.status === status)
                return (
                  <div key={status} className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-3"><span className={"text-[9px] px-2 py-0.5 rounded font-medium " + (WO_STAT[status] || '')}>{status.replace('_', ' ').toUpperCase()}</span><span className="text-[10px] text-gray-600">{wos.length}</span></div>
                    <div className="space-y-2">{wos.map((wo: any) => (
                      <div key={wo.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-mono text-gray-500">{wo.woNumber}</span><span className={"text-[9px] px-1 py-0.5 rounded " + (PRIO[wo.priority] || '')}>{wo.priority}</span></div>
                        <div className="text-xs font-semibold">{wo.title}</div>
                        <div className="text-[10px] text-gray-600 mt-1">{wo.projectNumber}</div>
                        {wo.assignedCrew && <div className="text-[10px] text-purple-400 mt-1">👷 {wo.assignedCrew} / {wo.assignedLead}</div>}
                        {wo.bomItems.length > 0 && (
                          <div className="mt-2 space-y-1">{wo.bomItems.map((b: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-500 truncate max-w-[120px]">{b.name}</span>
                              <span className={b.qtyStaged >= b.qtyRequired ? 'text-emerald-400' : b.qtyStaged > 0 ? 'text-amber-400' : 'text-rose-400'}>{b.qtyStaged}/{b.qtyRequired}</span>
                            </div>
                          ))}</div>
                        )}
                        {wo.actualHours > 0 && <div className="mt-2"><div className="flex justify-between text-[10px] text-gray-600 mb-0.5"><span>Hours</span><span>{wo.actualHours}/{wo.estimatedHours}</span></div><div className="bg-white/5 rounded-full h-1.5"><div className="bg-amber-500/60 h-1.5 rounded-full" style={{ width: Math.min((wo.actualHours / wo.estimatedHours) * 100, 100) + '%' }} /></div></div>}
                        {(status === 'backlog' || status === 'bom_staging') && <button onClick={() => { act('advance_wo', { woId: wo.id }); show('Work order advanced') }} className="text-[9px] text-blue-400 mt-2 hover:underline block">Advance →</button>}
                      </div>
                    ))}</div>
                  </div>
                )
              })}
            </div></div>
          </div>
        )}

        {/* TAB: Resources */}
        {tab === 'Resources' && (
          <div className="space-y-6">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">👷 Crew Deployment</h3>
              <div className="space-y-3">{data.crews.map((c: any) => (
                <div key={c.id} className="border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><span className="text-sm font-bold">{c.name}</span><span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{c.specialty}</span></div>
                    <div className="text-xs text-gray-500 mt-1">Lead: {c.lead} • {c.size} people</div>
                    {c.currentProject && <div className="text-[10px] text-blue-400 mt-1">📍 {c.currentProject}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24"><div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>Util</span><span>{c.utilization}%</span></div><div className="bg-white/5 rounded-full h-2"><div className={"h-2 rounded-full " + (c.utilization > 90 ? 'bg-emerald-500' : c.utilization > 70 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: c.utilization + '%' }} /></div></div>
                    <button onClick={() => { show('Crew reassignment panel') }} className="text-[10px] text-blue-400 hover:underline">Reassign</button>
                  </div>
                </div>
              ))}</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">🔧 Equipment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{data.equipment.map((e: any) => (
                <div key={e.id} className={"border rounded-xl p-3 " + (e.status === 'deployed' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-[#0A0E15]')}>
                  <div className="text-xs font-bold">{e.name}</div>
                  <div className="text-[10px] text-gray-500">{e.type}</div>
                  <div className="flex items-center gap-1 mt-2"><div className={"w-1.5 h-1.5 rounded-full " + (e.status === 'deployed' ? 'bg-emerald-400' : 'bg-gray-600')} /><span className="text-[10px] text-gray-400">{e.status}</span></div>
                  {e.currentProject && <div className="text-[10px] text-blue-400 mt-1">{e.currentProject}</div>}
                  <div className="flex justify-between mt-2 text-[10px] text-gray-600"><span>{e.hoursTotal > 0 ? e.hoursTotal + 'h' : '—'}</span><span>${e.dailyRate}/day</span></div>
                  <div className="text-[10px] text-gray-600 mt-1">Next service: {e.nextService}</div>
                </div>
              ))}</div>
            </div>
          </div>
        )}

        {/* TAB: Field Hub */}
        {tab === 'Field Hub' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h3 className="text-sm font-semibold">📋 Daily Field Reports</h3><button onClick={() => show('New report template loaded')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500">+ New Report</button></div>
            {data.fieldReports.map((fr: any) => (
              <div key={fr.id} className={"bg-[#0A0E15] border rounded-xl p-4 sm:p-5 " + (fr.status === 'reviewed' ? 'border-emerald-500/20' : fr.status === 'submitted' ? 'border-blue-500/20' : 'border-white/5')}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3"><span className="text-sm font-bold">{fr.projectNumber}</span><span className="text-xs text-gray-400">{fr.date}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (fr.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-400' : fr.status === 'submitted' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400')}>{fr.status}</span></div>
                  <span className="text-[10px] text-gray-500">By {fr.submittedBy}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center mb-3">
                  <div><div className="text-[9px] text-gray-500">Weather</div><div className="text-xs">{fr.weather} {fr.temp}°F</div></div>
                  <div><div className="text-[9px] text-gray-500">Crews</div><div className="text-xs">{fr.crewsOnSite}</div></div>
                  <div><div className="text-[9px] text-gray-500">Hours</div><div className="text-xs">{fr.hours}h</div></div>
                  <div><div className="text-[9px] text-gray-500">Photos</div><div className="text-xs">📷 {fr.photos}</div></div>
                  <div><div className="text-[9px] text-gray-500">Delays</div><div className={"text-xs " + (fr.delayHours > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400')}>{fr.delayHours > 0 ? fr.delayHours + 'h' : 'None'}</div></div>
                </div>
                <div className="text-xs text-gray-300">{fr.workSummary}</div>
                {fr.delays && <div className="text-xs text-rose-400/70 mt-2">Delay: {fr.delays}</div>}
              </div>
            ))}
          </div>
        )}

        {/* TAB: Maintenance */}
        {tab === 'Maintenance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h3 className="text-sm font-semibold">🔧 Equipment Maintenance</h3><button onClick={() => { act('schedule_maintenance'); show('Maintenance scheduled') }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500">+ Schedule Service</button></div>
            {data.maintenance.map((m: any) => (
              <div key={m.id} className={"bg-[#0A0E15] border rounded-xl p-4 " + (m.status === 'overdue' ? 'border-rose-500/20 bg-rose-500/5' : m.status === 'completed' ? 'border-emerald-500/20' : 'border-white/5')}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2"><span className="text-sm font-bold">{m.equipmentName}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (m.type === 'preventive' ? 'bg-blue-500/10 text-blue-400' : m.type === 'corrective' ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-500/10 text-gray-400')}>{m.type}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : m.status === 'overdue' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400')}>{m.status}</span></div>
                    <div className="text-xs text-gray-500 mt-1">{m.description}</div>
                    <div className="text-[10px] text-gray-600 mt-1">Scheduled: {m.scheduledDate}{m.cost > 0 ? ' • Est. $' + m.cost : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Analytics */}
        {tab === 'Analytics' && (
          <div className="space-y-6">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">💰 Budget vs. Actual — All Projects</h3>
              <div className="space-y-4">{data.projects.filter((p: any) => p.costToDate > 0).map((p: any) => {
                const budgetPct = (p.costToDate / p.contractValue) * 100
                return (
                  <div key={p.id}>
                    <div className="flex justify-between text-xs mb-1"><span className="font-medium">{p.projectNumber} — {p.name.split('—')[0].trim()}</span><span className={"font-mono " + (budgetPct > p.completionPct + 10 ? 'text-rose-400' : 'text-emerald-400')}>${(p.costToDate / 1000).toFixed(0)}K / ${(p.contractValue / 1000).toFixed(0)}K</span></div>
                    <div className="relative bg-white/5 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-500/30 h-4 rounded-full absolute" style={{ width: budgetPct + '%' }} />
                      <div className="bg-emerald-500/50 h-4 rounded-full absolute" style={{ width: p.completionPct + '%' }} />
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono">{p.completionPct}% complete | {budgetPct.toFixed(0)}% spent</div>
                    </div>
                  </div>
                )
              })}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
                <h3 className="text-sm font-semibold mb-4">👷 Labor Efficiency</h3>
                <div className="space-y-3">{data.workOrders.filter((w: any) => w.actualHours > 0).map((wo: any) => {
                  const eff = wo.estimatedHours > 0 ? Math.round((wo.estimatedHours / wo.actualHours) * 100) : 0
                  return (
                    <div key={wo.id} className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500 w-20 font-mono shrink-0">{wo.woNumber}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden"><div className={(eff >= 90 ? 'bg-emerald-500/40' : eff >= 75 ? 'bg-amber-500/40' : 'bg-rose-500/40') + ' h-3 rounded-full'} style={{ width: Math.min(eff, 100) + '%' }} /></div>
                      <span className={"text-xs font-mono w-12 text-right " + (eff >= 90 ? 'text-emerald-400' : eff >= 75 ? 'text-amber-400' : 'text-rose-400')}>{eff}%</span>
                    </div>
                  )
                })}</div>
              </div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
                <h3 className="text-sm font-semibold mb-4">📊 Project P&L Snapshot</h3>
                <div className="space-y-3">{data.projects.filter((p: any) => p.contractValue > 0).map((p: any) => {
                  const margin = p.contractValue > 0 ? Math.round(((p.contractValue - p.costToDate) / p.contractValue) * 100) : 0
                  const projectedMargin = p.completionPct > 0 ? Math.round(((p.contractValue - (p.costToDate / p.completionPct * 100)) / p.contractValue) * 100) : margin
                  return (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                      <div><div className="text-xs font-medium">{p.projectNumber}</div><div className="text-[10px] text-gray-600">${(p.contractValue / 1000).toFixed(0)}K contract</div></div>
                      <div className="text-right"><div className={"text-sm font-mono " + (projectedMargin > 20 ? 'text-emerald-400' : projectedMargin > 10 ? 'text-amber-400' : 'text-rose-400')}>{projectedMargin}%</div><div className="text-[10px] text-gray-500">proj. margin</div></div>
                    </div>
                  )
                })}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
`);

console.log('');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('  Installed: 8 files');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('  OPERATIONS AGENT MODULES:');
console.log('');
console.log('  💾 DATA SCHEMA:');
console.log('     Project           — milestones, budget, critical path');
console.log('     WorkOrder         — BOM staging, crew assignment, hours');
console.log('     ResourceAllocation— crews + equipment across projects');
console.log('     DailyFieldReport  — weather, photos, delays, progress');
console.log('     SafetyIncident    — OSHA tracking, root cause, corrective');
console.log('     MaintenanceLog    — preventive/corrective, meter-based');
console.log('');
console.log('  📡 INTEGRATIONS:');
console.log('     Odoo Project/MFG — project stages, tasks, BOMs');
console.log('     WMS Bridge        — material requisitions + availability check');
console.log('     HR Cert Sync      — crew safety certification validation');
console.log('     Field Service     — GPS geofencing, RFIs, change orders');
console.log('');
console.log('  🧠 AI BRAIN (Autonomous Superintendent):');
console.log('     Delay Prediction  — 14-day lookahead with root cause');
console.log('     Resource Optimizer— crew gap detection + reassignment');
console.log('     Cost Guard        — CPI/SPI earned value analysis');
console.log('     Safety Compliance — cross-ref HR certs before deployment');
console.log('');
console.log('  📊 DASHBOARD (6 tabs at /portal/agent/operations):');
console.log('     Command Center   — Briefing + project cards w/ timelines');
console.log('     Work Orders      — Kanban: Backlog → BOM → Install → Test');
console.log('     Resources        — Crew utilization + equipment tracker');
console.log('     Field Hub        — Daily reports with weather/delays/photos');
console.log('     Maintenance      — Equipment service scheduling');
console.log('     Analytics        — Budget vs Actual, labor efficiency, P&L');
console.log('');
console.log('  DEMO DATA:');
console.log('     4 Woulf Group projects ($2.84M total):');
console.log('       Metro Conveyor Install  — $1.22M, 38%, critical');
console.log('       Apex Racking 48K SF     — $620K, 72%, on track');
console.log('       Harbor Dock Retrofit    — $380K, mobilizing');
console.log('       National Grid Mezzanine — $616K, planning');
console.log('     6 work orders, 3 crews, 8 equipment pieces');
console.log('     4 field reports, 3 maintenance items, 5 AI insights');
console.log('');
console.log('  INSTALL & DEPLOY:');
console.log('    node operations-agent.js');
console.log('    npm run build');
console.log('    vercel --prod');
console.log('');
