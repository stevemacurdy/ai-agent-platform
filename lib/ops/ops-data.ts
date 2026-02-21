// ============================================================================
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
    dailyBriefing: "## 🏗️ Operations Briefing — Feb 18, 2026\n\n**Active Projects:** 4 | Contract Value: $2.84M | Avg Completion: 48%\n**Crews Deployed:** 3 across 2 sites | Equipment: 6 deployed, 2 warehouse\n\n**Today's Critical Actions:**\n1. 🔴 Receive PO-0412 at Dock 1 (4 conveyor sections for Metro project) — CRITICAL for WO-0183 start\n2. 🟡 Crew Alpha: Complete bay 7 conveyor install (WO-0182 target: 5 of 8 sections done)\n3. 🟡 Crew Charlie: Finish rows 22-24 beams at Apex — targeting Feb 20 completion\n\n**Project Status:**\n🔴 Metro Conveyor (WG-042) — 38% | $486K/$1.22M | M2 at risk (7-day slip potential)\n🟢 Apex Racking (WG-038) — 72% | $412K/$620K | Ahead of schedule\n🔵 Harbor Dock (WG-045) — 5% | Mobilizing Feb 24\n⚪ National Grid Mezz (WG-047) — 0% | Planning (starts Mar 10)\n\n**Resource Alert:**\nCrew Charlie idle Feb 21-23 gap — recommend Harbor Dock demo prep\nForklift #1 service due Feb 22 — book Saturday appointment\n\n**Safety:** Score 96/100 | 34 days since last incident | 0 recordables YTD\n**Weather:** Snow today (28°F) — frozen anchor bolts caused 2hr delay at Metro",
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
