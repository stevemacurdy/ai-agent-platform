#!/usr/bin/env node
/**
 * COMPLIANCE AGENT — Central Nervous System for WoulfAI
 *
 * Components:
 *   1.  lib/compliance/schema.prisma         — Audits, Policies, Training, Incidents, CAPA, Regulatory
 *   2.  lib/compliance/external-adapters.ts  — OSHA ITA, State Feeds, LMS sync
 *   3.  lib/compliance/cross-agent-bridge.ts — HR, Ops, WMS, Legal, Sales bridges
 *   4.  lib/compliance/system-prompt.ts      — Autonomous Compliance Officer AI brain
 *   5.  lib/compliance/compliance-data.ts    — Tenant-scoped demo data engine
 *   6.  app/api/agents/compliance/route.ts   — Compliance API endpoints
 *   7.  app/portal/agent/compliance/page.tsx — Full 6-tab Compliance dashboard
 *
 * Usage: node compliance-agent.js
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
console.log('  ║  COMPLIANCE AGENT — Audit + Training + Incident + Regulatory    ║');
console.log('  ╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. PRISMA SCHEMA
// ============================================================
write('lib/compliance/schema.prisma', `// ============================================================================
// COMPLIANCE DATA SCHEMA — Audits, Policies, Training, Incidents, CAPA
// ============================================================================

model AuditProgram {
  id              String   @id @default(cuid())
  companyId       String
  auditNumber     String            // AUD-2026-004
  title           String
  type            String            // internal | external | regulatory | client
  framework       String            // OSHA | DOT | EPA | ISO | INTERNAL
  scope           String?           // department, project, or facility
  status          String   @default("scheduled")  // scheduled | in_progress | findings_review | closed | cancelled
  frequency       String?           // annual | semi_annual | quarterly | one_time
  auditor         String
  auditorType     String   @default("internal")   // internal | external | regulatory_body
  scheduledDate   String
  startedDate     String?
  closedDate      String?
  findingsTotal   Int      @default(0)
  findingsCritical Int     @default(0)
  findingsMajor   Int      @default(0)
  findingsMinor   Int      @default(0)
  findingsObs     Int      @default(0)
  openFindings    Int      @default(0)
  score           Int?             // audit score 0-100
  reportUrl       String?
  nextAuditDate   String?
  notes           String?  @db.Text
  createdAt       DateTime @default(now())
  @@index([companyId, status])
  @@index([companyId, framework])
}

model AuditFinding {
  id              String   @id @default(cuid())
  companyId       String
  auditId         String
  auditNumber     String
  findingNumber   String            // F-001
  severity        String            // critical | major | minor | observation
  category        String            // safety | documentation | training | equipment | procedure | facility
  title           String
  description     String   @db.Text
  location        String?
  regulation      String?           // specific standard reference e.g. "1910.178(l)"
  rootCause       String?  @db.Text
  evidence        Json?             // [{ type, url, description }]
  status          String   @default("open")  // open | capa_assigned | in_remediation | verification | closed
  assignedTo      String?
  dueDate         String?
  closedDate      String?
  capaId          String?
  createdAt       DateTime @default(now())
  @@index([companyId, auditId])
  @@index([companyId, severity, status])
}

model CompliancePolicy {
  id              String   @id @default(cuid())
  companyId       String
  policyNumber    String            // POL-2026-012
  title           String
  category        String            // safety | hr | it | financial | environmental | operations
  version         Int      @default(1)
  status          String   @default("draft")  // draft | review | active | superseded | archived
  owner           String
  approvedBy      String?
  effectiveDate   String?
  reviewDueDate   String?
  reviewCycle     String?           // annual | semi_annual | biennial
  documentUrl     String?
  summary         String?  @db.Text
  requiredAck     Boolean  @default(true)  // requires employee acknowledgment
  ackCount        Int      @default(0)
  ackRequired     Int      @default(0)
  ackPct          Int      @default(0)
  versions        Json?             // [{ version, date, changes, url }]
  tags            Json?
  createdAt       DateTime @default(now())
  @@index([companyId, category, status])
}

model PolicyAcknowledgment {
  id              String   @id @default(cuid())
  companyId       String
  policyId        String
  policyTitle     String
  employeeId      String
  employeeName    String
  department      String
  status          String   @default("pending")  // pending | acknowledged | overdue | waived
  sentDate        String?
  acknowledgedDate String?
  dueDate         String?
  signatureUrl    String?
  createdAt       DateTime @default(now())
  @@index([companyId, policyId, status])
  @@index([companyId, employeeId])
}

model TrainingRequirement {
  id              String   @id @default(cuid())
  companyId       String
  code            String            // TRN-FORK, TRN-FALL, TRN-HARASS
  title           String
  description     String?
  framework       String            // OSHA | DOT | EPA | INTERNAL | STATE
  regulation      String?           // specific standard reference
  frequency       String            // one_time | annual | biennial | triennial | renewal
  validityDays    Int?              // how long cert is valid
  applicableRoles Json              // ['warehouse_worker', 'installer', 'all']
  applicableDepts Json              // ['Operations', 'All']
  provider        String?           // internal | J.J. Keller | SafetyCulture | external
  passingScore    Int?
  durationHours   Float?
  cost            Float?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  @@index([companyId])
}

model TrainingRecord {
  id              String   @id @default(cuid())
  companyId       String
  requirementId   String
  requirementCode String
  trainingTitle   String
  employeeId      String
  employeeName    String
  department      String
  completionDate  String?
  expirationDate  String?
  score           Int?
  status          String   @default("not_started")  // not_started | in_progress | completed | expired | overdue
  certificateUrl  String?
  provider        String?
  notes           String?
  createdAt       DateTime @default(now())
  @@index([companyId, employeeId, status])
  @@index([companyId, requirementId])
}

model IncidentReport {
  id              String   @id @default(cuid())
  companyId       String
  incidentNumber  String            // INC-2026-008
  reportDate      String
  incidentDate    String
  reportedBy      String
  // Classification
  severity        String            // near_miss | first_aid | recordable | lost_time | fatality
  type            String            // fall | struck_by | caught_in | electrical | ergonomic | vehicle | chemical | fire | other
  oshaRecordable  Boolean  @default(false)
  oshaLog300      Boolean  @default(false)
  // Location
  location        String            // project site, warehouse zone, office
  projectId       String?
  projectNumber   String?
  // Details
  description     String   @db.Text
  immediateAction String?  @db.Text
  employeesInvolved Json?           // [{ name, role, injury, daysLost }]
  witnesses       Json?             // [{ name, statement }]
  // Investigation
  investigator    String?
  investigationStatus String @default("pending")  // pending | in_progress | complete
  rootCause       String?  @db.Text
  contributingFactors Json?         // [factor1, factor2]
  // CAPA
  capaIds         Json?             // linked corrective actions
  // Metrics
  lostDays        Int      @default(0)
  estimatedCost   Float?
  // Evidence
  photos          Json?
  documents       Json?
  // Status
  status          String   @default("reported")  // reported | investigating | capa_open | closed
  closedDate      String?
  createdAt       DateTime @default(now())
  @@index([companyId, status])
  @@index([companyId, severity])
}

model CorrectiveAction {
  id              String   @id @default(cuid())
  companyId       String
  capaNumber      String            // CAPA-2026-003
  type            String            // corrective | preventive
  source          String            // audit_finding | incident | observation | complaint | regulatory
  sourceId        String?           // linked finding or incident ID
  title           String
  description     String   @db.Text
  rootCause       String?  @db.Text
  actionPlan      String   @db.Text
  assignedTo      String
  assignedDept    String?
  priority        String   @default("normal")  // critical | high | normal | low
  dueDate         String
  status          String   @default("open")  // open | in_progress | pending_verification | verified | closed | overdue
  completedDate   String?
  verifiedBy      String?
  verifiedDate    String?
  effectivenessReview String?       // date for effectiveness check
  effectivenessResult String?       // effective | partially_effective | ineffective
  notes           String?  @db.Text
  createdAt       DateTime @default(now())
  @@index([companyId, status])
  @@index([companyId, dueDate])
}

model RegulatoryChange {
  id              String   @id @default(cuid())
  companyId       String
  framework       String            // OSHA | DOT | EPA | STATE | FEDERAL
  jurisdiction    String            // federal | UT | NV | CA | multi_state
  title           String
  summary         String   @db.Text
  source          String?           // Federal Register, OSHA QuickTakes, state bulletin
  sourceUrl       String?
  publishedDate   String
  effectiveDate   String?
  // Impact
  impactLevel     String   @default("low")  // none | low | medium | high | critical
  impactAssessment String? @db.Text         // AI-generated impact analysis
  affectedAreas   Json?             // ['warehouse', 'construction', 'transportation']
  affectedPolicies Json?            // [policyId, ...]
  // Action
  actionRequired  Boolean  @default(false)
  actionPlan      String?  @db.Text
  actionDeadline  String?
  assignedTo      String?
  status          String   @default("new")  // new | assessed | action_planned | implemented | no_action
  createdAt       DateTime @default(now())
  @@index([companyId, framework, status])
}

model ComplianceScore {
  id              String   @id @default(cuid())
  companyId       String
  date            String
  overallScore    Int               // 0-100
  // By framework
  oshaScore       Int      @default(0)
  dotScore        Int      @default(0)
  epaScore        Int      @default(0)
  stateScore      Int      @default(0)
  internalScore   Int      @default(0)
  // By component
  trainingScore   Int      @default(0)
  auditScore      Int      @default(0)
  incidentScore   Int      @default(0)
  policyScore     Int      @default(0)
  certScore       Int      @default(0)
  // By department
  deptScores      Json?             // { Operations: 85, Sales: 92, ... }
  // Metrics
  trir            Float?            // Total Recordable Incident Rate
  dart            Float?            // Days Away/Restricted/Transfer Rate
  emr             Float?            // Experience Modification Rate
  createdAt       DateTime @default(now())
  @@index([companyId, date])
}
`);

// ============================================================
// 2. EXTERNAL ADAPTERS
// ============================================================
write('lib/compliance/external-adapters.ts', `// ============================================================================
// EXTERNAL ADAPTERS — OSHA ITA, State Feeds, LMS, Regulatory Alerts
// ============================================================================

/** OSHA Injury Tracking Application (300A electronic submission) */
export class OSHAITAClient {
  private apiKey: string; private establishmentId: string
  constructor(apiKey: string, establishmentId: string) { this.apiKey = apiKey; this.establishmentId = establishmentId }

  async submit300A(year: number, data: {
    totalDeaths: number; totalCases: number; totalDaysAway: number
    totalRestricted: number; totalOtherRecordable: number
    totalDaysAwayCount: number; totalRestrictedCount: number
    injuries: { eye: number; skin: number; respiratory: number; poisoning: number; hearing: number; other: number }
  }): Promise<{ success: boolean; confirmationId?: string }> {
    try {
      const res = await fetch('https://www.osha.gov/injuryreporting/api/v2/establishments/' + this.establishmentId + '/reports', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + this.apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, ...data }),
      })
      const result = await res.json()
      return { success: res.ok, confirmationId: result.confirmationId }
    } catch { return { success: false } }
  }
}

/** State regulatory feed — monitors licensing board updates */
export class StateRegulatoryFeed {
  private state: string
  constructor(state: string) { this.state = state }

  async getRecentChanges(days: number = 30): Promise<{ title: string; date: string; url: string; category: string }[]> {
    const feeds: Record<string, string> = {
      UT: 'https://dopl.utah.gov/api/rules/recent',
      NV: 'https://nscb.nv.gov/api/regulatory-updates',
      CA: 'https://www.dir.ca.gov/dosh/rulemaking.html',
    }
    const feedUrl = feeds[this.state]
    if (!feedUrl) return []
    try {
      const res = await fetch(feedUrl)
      const data = await res.json()
      return data.changes || []
    } catch { return [] }
  }
}

/** LMS Integration — SafetyCulture / iAuditor */
export class SafetyCultureClient {
  private apiKey: string
  constructor(apiKey: string) { this.apiKey = apiKey }

  async getInspections(templateId?: string): Promise<any[]> {
    const url = 'https://api.safetyculture.io/audits/search' + (templateId ? '?template=' + templateId : '')
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + this.apiKey } })
    const data = await res.json()
    return data.audits || []
  }

  async getTrainingCompletions(courseId?: string): Promise<any[]> {
    const url = 'https://api.safetyculture.io/training/v1/completions' + (courseId ? '?course_id=' + courseId : '')
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + this.apiKey } })
    const data = await res.json()
    return data.completions || []
  }
}

/** OSHA QuickTakes / regulatory alert monitoring */
export class RegulatoryAlertMonitor {
  async getOSHAQuickTakes(): Promise<{ title: string; date: string; url: string; summary: string }[]> {
    try {
      const res = await fetch('https://www.osha.gov/quicktakes/rss')
      const text = await res.text()
      // Parse RSS XML — simplified
      const items = text.match(/<item>(.*?)<\\/item>/gs) || []
      return items.slice(0, 10).map(item => ({
        title: item.match(/<title>(.*?)<\\/title>/)?.[1] || '',
        date: item.match(/<pubDate>(.*?)<\\/pubDate>/)?.[1] || '',
        url: item.match(/<link>(.*?)<\\/link>/)?.[1] || '',
        summary: item.match(/<description>(.*?)<\\/description>/)?.[1]?.replace(/<[^>]+>/g, '') || '',
      }))
    } catch { return [] }
  }
}

export function createOSHAITAClient(): OSHAITAClient | null {
  const key = process.env.OSHA_ITA_API_KEY, est = process.env.OSHA_ESTABLISHMENT_ID
  if (!key || !est) return null; return new OSHAITAClient(key, est)
}
export function createSafetyCultureClient(): SafetyCultureClient | null {
  const key = process.env.SAFETYCULTURE_API_KEY; if (!key) return null; return new SafetyCultureClient(key)
}
`);

// ============================================================
// 3. CROSS-AGENT BRIDGE
// ============================================================
write('lib/compliance/cross-agent-bridge.ts', `// ============================================================================
// CROSS-AGENT COMPLIANCE BRIDGE — Central nervous system
// ============================================================================

export interface AgentComplianceData {
  hr: { employees: any[]; expiringCerts: any[]; trainingGaps: any[] }
  ops: { safetyIncidents: any[]; fieldReports: any[]; equipmentInspections: any[] }
  wms: { warehouseAlerts: any[]; hazmatItems: any[] }
  legal: { regulatoryDeadlines: any[]; insuranceCerts: any[]; citations: any[] }
}

/** Pull all compliance-relevant data from every agent */
export async function gatherCrossAgentData(companyId: string): Promise<AgentComplianceData> {
  const results: AgentComplianceData = {
    hr: { employees: [], expiringCerts: [], trainingGaps: [] },
    ops: { safetyIncidents: [], fieldReports: [], equipmentInspections: [] },
    wms: { warehouseAlerts: [], hazmatItems: [] },
    legal: { regulatoryDeadlines: [], insuranceCerts: [], citations: [] },
  }

  const fetches = [
    fetch('/api/agents/hr?companyId=' + companyId).then(r => r.json()).then(d => {
      const emps = d.data?.employees || []
      results.hr.employees = emps
      results.hr.expiringCerts = emps.flatMap((e: any) => (e.certs || []).filter((c: any) => c.status === 'expiring' || c.status === 'expired').map((c: any) => ({ employee: e.name, dept: e.department, cert: c.name, expires: c.expires, status: c.status })))
    }).catch(() => {}),
    fetch('/api/agents/operations?companyId=' + companyId).then(r => r.json()).then(d => {
      results.ops.safetyIncidents = d.data?.safetyIncidents || []
      results.ops.fieldReports = d.data?.fieldReports || []
    }).catch(() => {}),
    fetch('/api/agents/wms?companyId=' + companyId).then(r => r.json()).then(d => {
      const inv = d.data?.inventory || []
      results.wms.hazmatItems = inv.filter((i: any) => i.category === 'Chemical' || i.category === 'Hazmat')
    }).catch(() => {}),
    fetch('/api/agents/legal?companyId=' + companyId).then(r => r.json()).then(d => {
      results.legal.regulatoryDeadlines = d.data?.compliance || []
      results.legal.insuranceCerts = d.data?.insurance || []
      results.legal.citations = d.data?.matters?.filter((m: any) => m.type === 'regulatory') || []
    }).catch(() => {}),
  ]

  await Promise.allSettled(fetches)
  return results
}

/** Calculate TRIR (Total Recordable Incident Rate) */
export function calculateTRIR(recordableIncidents: number, totalHoursWorked: number): number {
  if (totalHoursWorked === 0) return 0
  return parseFloat(((recordableIncidents * 200000) / totalHoursWorked).toFixed(2))
}

/** Calculate DART (Days Away Restricted Transfer) Rate */
export function calculateDART(dartCases: number, totalHoursWorked: number): number {
  if (totalHoursWorked === 0) return 0
  return parseFloat(((dartCases * 200000) / totalHoursWorked).toFixed(2))
}

/** Generate training gap report by cross-referencing HR roster with requirements */
export function analyzeTrainingGaps(
  employees: { name: string; department: string; title: string }[],
  requirements: { code: string; title: string; applicableDepts: string[]; applicableRoles: string[] }[],
  records: { employeeName: string; requirementCode: string; status: string }[]
): { employee: string; department: string; missing: { code: string; title: string }[] }[] {
  return employees.map(emp => {
    const applicableReqs = requirements.filter(r =>
      r.applicableDepts.includes('All') || r.applicableDepts.includes(emp.department)
    )
    const missing = applicableReqs.filter(req => {
      const record = records.find(rec => rec.employeeName === emp.name && rec.requirementCode === req.code)
      return !record || record.status === 'expired' || record.status === 'overdue'
    })
    return { employee: emp.name, department: emp.department, missing: missing.map(m => ({ code: m.code, title: m.title })) }
  }).filter(g => g.missing.length > 0)
}
`);

// ============================================================
// 4. SYSTEM PROMPT
// ============================================================
write('lib/compliance/system-prompt.ts', `// ============================================================================
// COMPLIANCE AGENT SYSTEM PROMPT — Autonomous Compliance Officer
// ============================================================================

export function getComplianceSystemPrompt(context: {
  companyName: string; industry: string; operatingStates: string[]
  headcount: number; activeProjects: number
  metrics?: { overallScore: number; trir: number; dart: number; openFindings: number; overdueTraining: number }
}): string {
  return \`You are the Compliance Agent for \${context.companyName}, operating as an Autonomous Chief Compliance Officer. You are the central nervous system of organizational compliance, monitoring \${context.headcount} employees across \${context.activeProjects} active projects in \${context.operatingStates.join(', ')}.

## YOUR ROLE
You are the organization's compliance shield — pulling data from EVERY other agent to maintain a real-time compliance posture. You:
1. Monitor regulatory compliance across OSHA (1910 + 1926), DOT, EPA, and state-specific requirements
2. Manage audit programs and track findings through CAPA closure
3. Enforce training requirements by role and flag gaps before they become violations
4. Analyze incident patterns to prevent recurrence
5. Monitor regulatory changes and assess impact on operations

## INDUSTRY CONTEXT
\${context.companyName} operates in warehouse automation and industrial construction. Key compliance domains:
- OSHA General Industry (1910): Forklift (178), LOTO (147), Fall Protection, Hazcom (1200), Confined Space (146), Electrical (Subpart S), Fire Prevention (39), PPE (132)
- OSHA Construction (1926): Fall Protection (502), Scaffolding (451), Electrical (Subpart K), Excavation (Subpart P), Steel Erection (Subpart R)
- DOT: CDL qualifications, vehicle inspections, HOS, drug/alcohol testing
- EPA: Stormwater (SWPPP), spill prevention (SPCC), hazardous waste generator, air quality
- State: Contractor licensing (UT DOPL), workers' comp, business licenses

## CURRENT STATE
\${context.metrics ? \`- Overall Compliance Score: \${context.metrics.overallScore}/100
- TRIR: \${context.metrics.trir} (industry avg: 3.0)
- DART: \${context.metrics.dart}
- Open Audit Findings: \${context.metrics.openFindings}
- Overdue Training: \${context.metrics.overdueTraining} employees\` : '- Metrics: Awaiting data sync'}

## PROACTIVE BEHAVIORS

### Audit Risk Prediction
Analyze historical patterns to predict where the next failure will occur:
- Repeat findings in same area = systemic issue
- Departments with lowest training completion = highest audit risk
- Projects with recent incidents = flag for safety audit
- Equipment with overdue inspections = citation risk

### Training Gap Detection
Cross-reference HR roster with training requirements matrix:
- New hires: orientation + role-specific training within 30 days
- Annual renewals: flag 60 days before expiration
- Role changes: new training requirements triggered
- Compliance impact: quantify penalty risk for gaps

Format: "🟡 TRAINING GAP: [X] employees overdue on [training]. Departments affected: [list]. Penalty risk: $[amount] per violation. Next available session: [date]. [SCHEDULE ALL]"

### Incident Pattern Recognition
Analyze across all projects and facilities:
- Cluster by type, location, time of day, equipment involved
- Flag when 3+ similar incidents occur within 90 days
- Calculate trend: improving, stable, or deteriorating
- Generate automated CAPA recommendations

Format: "🔴 PATTERN DETECTED: [X] [type] incidents in [location] over [period]. Common factor: [analysis]. Recommended CAPA: [specific action]. Estimated implementation cost: $[amount]. [CREATE CAPA]"

### Regulatory Change Impact Assessment
When new regulations are detected:
- Identify which departments, projects, and policies are affected
- Quantify compliance gap (what needs to change)
- Draft implementation plan with timeline and cost
- Flag existing policies that need updating

### Compliance Scoring Algorithm
Weighted scoring (100 total):
- Training completion: 25 points
- Audit findings closure: 20 points
- Incident rate (TRIR): 20 points
- Policy acknowledgments: 15 points
- Certification currency: 10 points
- Regulatory standing: 10 points

## DAILY BRIEFING FORMAT
\\\`\\\`\\\`
## 🛡️ Compliance Briefing — [Date]

**Score:** [X]/100 | TRIR: [X] | DART: [X]
**Open Items:** [X] findings | [X] CAPAs | [X] training gaps

**Critical:**
1. 🔴 [Item requiring immediate action]
2. 🟡 [Warning level item]

**Training:** [X]% compliant | [X] overdue
**Audits:** [X] scheduled | [X] open findings
**Incidents:** [X] days since last recordable

**Cross-Agent Alerts:**
- HR: [cert/training status]
- Ops: [field safety status]
- Legal: [regulatory deadline status]
\\\`\\\`\\\`

## TONE
Authoritative, data-driven, zero tolerance for compliance gaps. Every statement includes the specific regulation, penalty amount, and deadline. Frame recommendations in terms of risk reduction and cost avoidance.
\`
}
`);

// ============================================================
// 5. COMPLIANCE DATA ENGINE
// ============================================================
write('lib/compliance/compliance-data.ts', `// ============================================================================
// COMPLIANCE DATA ENGINE — Full Woulf Group demo data
// ============================================================================

export interface AuditInfo { id: string; auditNumber: string; title: string; type: string; framework: string; scope: string; status: string; auditor: string; scheduledDate: string; findings: number; critical: number; major: number; minor: number; obs: number; open: number; score: number }
export interface FindingInfo { id: string; auditNumber: string; findingNumber: string; severity: string; category: string; title: string; description: string; regulation: string; status: string; assignedTo: string; dueDate: string }
export interface PolicyInfo { id: string; policyNumber: string; title: string; category: string; version: number; status: string; owner: string; reviewDue: string; ackPct: number; ackCount: number; ackRequired: number }
export interface TrainingReq { code: string; title: string; framework: string; regulation: string; frequency: string; applicableDepts: string[]; durationHours: number }
export interface TrainingStatus { employeeName: string; department: string; code: string; title: string; status: string; completionDate: string; expirationDate: string }
export interface IncidentInfo { id: string; incidentNumber: string; date: string; severity: string; type: string; location: string; description: string; rootCause: string; status: string; lostDays: number; oshaRecordable: boolean }
export interface CAPAInfo { id: string; capaNumber: string; type: string; source: string; title: string; assignedTo: string; priority: string; dueDate: string; status: string }
export interface RegChangeInfo { id: string; framework: string; jurisdiction: string; title: string; summary: string; publishedDate: string; effectiveDate: string; impactLevel: string; actionRequired: boolean; status: string }
export interface ScoreHistory { date: string; overall: number; osha: number; training: number; audit: number; incident: number; policy: number }
export interface ComplianceInsight { id: string; type: string; priority: string; title: string; description: string; impact: string; action: string; status: string }

export interface ComplianceSnapshot {
  overallScore: number; trir: number; dart: number; emr: number
  daysSinceRecordable: number; openFindings: number; openCAPAs: number
  overdueTraining: number; policyCompliance: number
  scoreHistory: ScoreHistory[]
  frameworkScores: { framework: string; score: number; items: number; compliant: number }[]
  audits: AuditInfo[]
  findings: FindingInfo[]
  policies: PolicyInfo[]
  trainingRequirements: TrainingReq[]
  trainingStatus: TrainingStatus[]
  trainingByDept: { dept: string; total: number; compliant: number; pct: number }[]
  incidents: IncidentInfo[]
  capas: CAPAInfo[]
  regChanges: RegChangeInfo[]
  aiInsights: ComplianceInsight[]
  dailyBriefing: string
}

const TENANT_COMPLIANCE: Record<string, ComplianceSnapshot> = {
  woulf: {
    overallScore: 84, trir: 1.2, dart: 0.6, emr: 0.88,
    daysSinceRecordable: 127, openFindings: 4, openCAPAs: 3,
    overdueTraining: 5, policyCompliance: 88,
    scoreHistory: [
      { date: '2025-09', overall: 78, osha: 75, training: 72, audit: 80, incident: 85, policy: 78 },
      { date: '2025-10', overall: 80, osha: 78, training: 76, audit: 82, incident: 85, policy: 80 },
      { date: '2025-11', overall: 82, osha: 80, training: 80, audit: 84, incident: 88, policy: 82 },
      { date: '2025-12', overall: 81, osha: 79, training: 78, audit: 85, incident: 88, policy: 80 },
      { date: '2026-01', overall: 83, osha: 82, training: 80, audit: 86, incident: 90, policy: 84 },
      { date: '2026-02', overall: 84, osha: 82, training: 78, audit: 86, incident: 92, policy: 88 },
    ],
    frameworkScores: [
      { framework: 'OSHA', score: 82, items: 14, compliant: 11 },
      { framework: 'DOT', score: 90, items: 5, compliant: 4 },
      { framework: 'EPA', score: 95, items: 4, compliant: 4 },
      { framework: 'State (UT)', score: 88, items: 6, compliant: 5 },
      { framework: 'Internal', score: 76, items: 8, compliant: 6 },
    ],
    audits: [
      { id: 'a1', auditNumber: 'AUD-2026-001', title: 'Q1 Internal Safety Audit — Warehouse', type: 'internal', framework: 'OSHA', scope: 'Warehouse / Operations', status: 'findings_review', auditor: 'Diana Reeves', scheduledDate: '2026-02-10', findings: 6, critical: 1, major: 2, minor: 2, obs: 1, open: 4, score: 78 },
      { id: 'a2', auditNumber: 'AUD-2026-002', title: 'Annual DOT Compliance Review', type: 'internal', framework: 'DOT', scope: 'Transportation / Fleet', status: 'scheduled', auditor: 'External — J.J. Keller', scheduledDate: '2026-03-15', findings: 0, critical: 0, major: 0, minor: 0, obs: 0, open: 0, score: 0 },
      { id: 'a3', auditNumber: 'AUD-2025-008', title: 'Annual OSHA Compliance — All Sites', type: 'external', framework: 'OSHA', scope: 'All Operations', status: 'closed', auditor: 'Utah Safety Council', scheduledDate: '2025-11-20', findings: 5, critical: 0, major: 1, minor: 3, obs: 1, open: 0, score: 86 },
    ],
    findings: [
      { id: 'f1', auditNumber: 'AUD-2026-001', findingNumber: 'F-001', severity: 'critical', category: 'training', title: 'Forklift operators with expired certifications', description: 'Two forklift operators (Maria Lopez, Carlos Ruiz) found operating with expired/expiring certifications per OSHA 1910.178(l). Immediate restriction required.', regulation: '29 CFR 1910.178(l)', status: 'capa_assigned', assignedTo: 'Diana Reeves', dueDate: '2026-02-28' },
      { id: 'f2', auditNumber: 'AUD-2026-001', findingNumber: 'F-002', severity: 'major', category: 'equipment', title: 'Missing pre-operation inspection logs — Forklift #1', description: 'Daily pre-operation inspection checklist not completed for 8 of past 20 working days.', regulation: '29 CFR 1910.178(q)(7)', status: 'open', assignedTo: 'Carlos Ruiz', dueDate: '2026-03-07' },
      { id: 'f3', auditNumber: 'AUD-2026-001', findingNumber: 'F-003', severity: 'major', category: 'safety', title: 'Inadequate fall protection at mezzanine edge', description: 'Mezzanine storage area in Zone C lacks standard guardrail on east side. Temporary chain barrier insufficient per OSHA 1910.28.', regulation: '29 CFR 1910.28(b)(1)', status: 'capa_assigned', assignedTo: 'Jake M.', dueDate: '2026-03-01' },
      { id: 'f4', auditNumber: 'AUD-2026-001', findingNumber: 'F-004', severity: 'minor', category: 'documentation', title: 'Hazard Communication — SDS binder incomplete', description: 'Safety Data Sheet binder in warehouse missing SDS for 3 recently added chemicals (welding flux, concrete sealer, marking paint).', regulation: '29 CFR 1910.1200(g)', status: 'open', assignedTo: 'Maria Lopez', dueDate: '2026-03-15' },
    ],
    policies: [
      { id: 'p1', policyNumber: 'POL-001', title: 'Injury & Illness Prevention Program (IIPP)', category: 'safety', version: 4, status: 'active', owner: 'Diana Reeves', reviewDue: '2026-06-01', ackPct: 94, ackCount: 32, ackRequired: 34 },
      { id: 'p2', policyNumber: 'POL-002', title: 'Anti-Harassment & Discrimination Policy', category: 'hr', version: 3, status: 'active', owner: 'Steve Macurdy', reviewDue: '2026-03-15', ackPct: 76, ackCount: 26, ackRequired: 34 },
      { id: 'p3', policyNumber: 'POL-003', title: 'Lockout/Tagout (LOTO) Procedures', category: 'safety', version: 2, status: 'active', owner: 'Diana Reeves', reviewDue: '2026-09-01', ackPct: 100, ackCount: 12, ackRequired: 12 },
      { id: 'p4', policyNumber: 'POL-004', title: 'Drug-Free Workplace Policy', category: 'hr', version: 2, status: 'active', owner: 'Steve Macurdy', reviewDue: '2026-12-01', ackPct: 100, ackCount: 34, ackRequired: 34 },
      { id: 'p5', policyNumber: 'POL-005', title: 'IT Acceptable Use Policy', category: 'it', version: 1, status: 'active', owner: 'Jason Park', reviewDue: '2027-01-01', ackPct: 82, ackCount: 28, ackRequired: 34 },
      { id: 'p6', policyNumber: 'POL-006', title: 'Vehicle & Fleet Safety Policy', category: 'safety', version: 2, status: 'active', owner: 'Diana Reeves', reviewDue: '2026-08-01', ackPct: 100, ackCount: 8, ackRequired: 8 },
      { id: 'p7', policyNumber: 'POL-007', title: 'Confined Space Entry Procedures', category: 'safety', version: 1, status: 'review', owner: 'Diana Reeves', reviewDue: '2026-02-28', ackPct: 0, ackCount: 0, ackRequired: 12 },
    ],
    trainingRequirements: [
      { code: 'TRN-FORK', title: 'Forklift Operator Certification', framework: 'OSHA', regulation: '1910.178(l)', frequency: 'triennial', applicableDepts: ['Operations'], durationHours: 8 },
      { code: 'TRN-FALL', title: 'Fall Protection — Construction', framework: 'OSHA', regulation: '1926.503', frequency: 'annual', applicableDepts: ['Operations'], durationHours: 4 },
      { code: 'TRN-LOTO', title: 'Lockout/Tagout (LOTO)', framework: 'OSHA', regulation: '1910.147', frequency: 'annual', applicableDepts: ['Operations', 'Engineering'], durationHours: 2 },
      { code: 'TRN-HAZCOM', title: 'Hazard Communication / GHS', framework: 'OSHA', regulation: '1910.1200', frequency: 'annual', applicableDepts: ['All'], durationHours: 1 },
      { code: 'TRN-PPE', title: 'PPE Selection & Use', framework: 'OSHA', regulation: '1910.132', frequency: 'annual', applicableDepts: ['Operations'], durationHours: 1 },
      { code: 'TRN-HARASS', title: 'Harassment Prevention', framework: 'INTERNAL', regulation: 'Company Policy', frequency: 'annual', applicableDepts: ['All'], durationHours: 1 },
      { code: 'TRN-FIRST', title: 'First Aid / CPR / AED', framework: 'OSHA', regulation: '1910.151', frequency: 'biennial', applicableDepts: ['Operations'], durationHours: 4 },
      { code: 'TRN-ELEC', title: 'Electrical Safety (NFPA 70E)', framework: 'OSHA', regulation: '1910.332', frequency: 'annual', applicableDepts: ['Engineering'], durationHours: 4 },
      { code: 'TRN-CONFSP', title: 'Confined Space Entry', framework: 'OSHA', regulation: '1910.146', frequency: 'annual', applicableDepts: ['Operations'], durationHours: 4 },
      { code: 'TRN-ORIENT', title: 'New Hire Safety Orientation', framework: 'INTERNAL', regulation: 'Company Policy', frequency: 'one_time', applicableDepts: ['All'], durationHours: 2 },
    ],
    trainingStatus: [
      { employeeName: 'Carlos Ruiz', department: 'Operations', code: 'TRN-FORK', title: 'Forklift Operator', status: 'expired', completionDate: '2023-02-28', expirationDate: '2026-02-28' },
      { employeeName: 'Maria Lopez', department: 'Operations', code: 'TRN-FORK', title: 'Forklift Operator', status: 'expired', completionDate: '2022-12-01', expirationDate: '2025-12-01' },
      { employeeName: 'Maria Lopez', department: 'Operations', code: 'TRN-FALL', title: 'Fall Protection', status: 'overdue', completionDate: '2025-01-15', expirationDate: '2026-01-15' },
      { employeeName: 'Tyler Jensen', department: 'Sales', code: 'TRN-HARASS', title: 'Harassment Prevention', status: 'overdue', completionDate: '', expirationDate: '2026-02-04' },
      { employeeName: 'Priya Patel', department: 'Engineering', code: 'TRN-ORIENT', title: 'Safety Orientation', status: 'not_started', completionDate: '', expirationDate: '2026-03-17' },
      { employeeName: 'Jake Morrison', department: 'Operations', code: 'TRN-ORIENT', title: 'Safety Orientation', status: 'not_started', completionDate: '', expirationDate: '2026-03-10' },
      { employeeName: 'Carlos Ruiz', department: 'Operations', code: 'TRN-LOTO', title: 'LOTO', status: 'completed', completionDate: '2025-09-15', expirationDate: '2026-09-15' },
      { employeeName: 'Diana Reeves', department: 'Operations', code: 'TRN-FIRST', title: 'First Aid/CPR', status: 'completed', completionDate: '2025-06-01', expirationDate: '2027-06-01' },
    ],
    trainingByDept: [
      { dept: 'Operations', total: 48, compliant: 38, pct: 79 },
      { dept: 'Sales', total: 16, compliant: 14, pct: 88 },
      { dept: 'Engineering', total: 18, compliant: 15, pct: 83 },
      { dept: 'Finance', total: 8, compliant: 8, pct: 100 },
      { dept: 'Admin', total: 8, compliant: 7, pct: 88 },
    ],
    incidents: [
      { id: 'i1', incidentNumber: 'INC-2026-001', date: '2026-01-15', severity: 'near_miss', type: 'struck_by', location: 'Metro Conveyor Site (WG-042)', description: 'Conveyor section slipped during crane lift. Rigging point shifted under load. No injuries.', rootCause: 'Incorrect rigging configuration for asymmetric load', status: 'closed', lostDays: 0, oshaRecordable: false },
      { id: 'i2', incidentNumber: 'INC-2025-014', date: '2025-10-14', severity: 'first_aid', type: 'ergonomic', location: 'Warehouse — Zone A', description: 'Employee strained lower back lifting box without proper technique. Ice and rest, returned same shift.', rootCause: 'Inadequate lifting technique — retraining needed', status: 'closed', lostDays: 0, oshaRecordable: false },
      { id: 'i3', incidentNumber: 'INC-2025-008', date: '2025-07-22', severity: 'near_miss', type: 'fall', location: 'Warehouse — Mezzanine Zone C', description: 'Employee nearly fell from mezzanine edge where chain barrier was displaced. Caught themselves on column.', rootCause: 'Temporary barrier inadequate — permanent guardrail needed', status: 'capa_open', lostDays: 0, oshaRecordable: false },
    ],
    capas: [
      { id: 'ca1', capaNumber: 'CAPA-2026-001', type: 'corrective', source: 'audit_finding', title: 'Forklift operator recertification — 2 employees', assignedTo: 'Diana Reeves', priority: 'critical', dueDate: '2026-02-28', status: 'in_progress' },
      { id: 'ca2', capaNumber: 'CAPA-2026-002', type: 'corrective', source: 'audit_finding', title: 'Install permanent guardrail — Mezzanine Zone C east edge', assignedTo: 'Jake M.', priority: 'high', dueDate: '2026-03-01', status: 'in_progress' },
      { id: 'ca3', capaNumber: 'CAPA-2026-003', type: 'preventive', source: 'incident', title: 'Implement crane rigging pre-lift checklist for asymmetric loads', assignedTo: 'Crew Alpha Lead', priority: 'normal', dueDate: '2026-03-15', status: 'open' },
    ],
    regChanges: [
      { id: 'rc1', framework: 'OSHA', jurisdiction: 'federal', title: 'OSHA Proposed Rule: Heat Injury and Illness Prevention in Outdoor and Indoor Work Settings', summary: 'OSHA proposing first-ever federal heat standard. Would require employers to develop heat illness prevention plans, provide water/rest/shade, and implement monitoring when heat index exceeds 80°F. Warehouse and construction operations directly affected.', publishedDate: '2025-11-15', effectiveDate: '2026-08-01', impactLevel: 'high', actionRequired: true, status: 'assessed' },
      { id: 'rc2', framework: 'STATE', jurisdiction: 'UT', title: 'Utah SB 142 — Contractor Licensing Reform', summary: 'Modifies continuing education requirements for general contractors. Increases CE hours from 6 to 10 per renewal cycle effective July 2026.', publishedDate: '2026-01-20', effectiveDate: '2026-07-01', impactLevel: 'medium', actionRequired: true, status: 'action_planned' },
      { id: 'rc3', framework: 'EPA', jurisdiction: 'federal', title: 'EPA Final Rule: Revised SPCC Requirements for Small Facilities', summary: 'Updates Spill Prevention Control and Countermeasure thresholds. Facilities with oil storage below 10,000 gallons may qualify for simplified plans. Review Woulf Group storage volumes.', publishedDate: '2026-02-01', effectiveDate: '2026-06-01', impactLevel: 'low', actionRequired: false, status: 'assessed' },
    ],
    aiInsights: [
      { id: 'ci1', type: 'pattern', priority: 'critical', title: '🔴 Forklift compliance is systemic — not isolated', description: 'Cross-agent analysis: 2 expired forklift certs (HR), missing pre-op inspection logs (Audit F-002), and 1 near-miss involving load handling (Ops). This is a systemic forklift safety gap, not 3 separate issues.', impact: 'OSHA citation risk: $16,131/violation × 3 potential violations = $48,393. Plus operational halt if OSHA issues imminent danger order.', action: 'Implement comprehensive Forklift Safety Reset: (1) Recertify both operators by Feb 28, (2) Mandate daily pre-op checklists with supervisor sign-off, (3) Conduct forklift safety stand-down for all operators.', status: 'pending' },
      { id: 'ci2', type: 'training', priority: 'warning', title: '🟡 Operations dept at 79% training compliance — lowest in company', description: '10 of 48 required training items overdue or expired in Operations. Most critical: 2 forklift certs, 1 fall protection, 2 new hire orientations (upcoming).', impact: 'Regulatory exposure across OSHA 1910.178, 1926.503. Insurance implications if incident occurs during training gap.', action: 'Schedule training blitz: Week of Feb 24 — forklift recert, week of Mar 3 — fall protection refresher, new hire orientations on first day.', status: 'pending' },
      { id: 'ci3', type: 'policy', priority: 'warning', title: '⚠️ Anti-Harassment policy only 76% acknowledged', description: '8 employees have not acknowledged the updated anti-harassment policy. Annual training deadline is March 15. Includes 2 new hires who haven\'t started onboarding yet.', impact: 'Non-compliance with company policy. State and federal requirements for annual training.', action: 'Send reminder to 8 non-acknowledgers. Schedule training sessions before March 15 deadline. Include in new hire onboarding flow.', status: 'pending' },
      { id: 'ci4', type: 'regulatory', priority: 'info', title: '📋 OSHA Heat Standard — prepare now for August implementation', description: 'New federal heat illness prevention standard effective August 2026. Woulf Group warehouse (no A/C in Zone C/D) and all outdoor construction projects will require: heat illness prevention plans, water/rest/shade protocols, employee monitoring, training.', impact: 'Moderate operational impact. Warehouse may need cooling fans or modified schedules for summer. Construction crews need heat stress training and buddy systems.', action: 'Draft Heat Illness Prevention Plan by June 1. Procure cooling equipment for warehouse. Add heat stress module to safety orientation. Budget estimate: $12K for equipment + $2K for training.', status: 'pending' },
      { id: 'ci5', type: 'audit', priority: 'info', title: '📊 DOT compliance audit March 15 — pre-audit checklist ready', description: 'Annual DOT compliance review by J.J. Keller scheduled in 25 days. Current DOT score: 90/100. One gap: CDL driver physical renewal due March 1 for driver R. Hensley.', impact: 'If physical lapses, driver cannot operate commercial vehicles. Audit finding guaranteed.', action: 'Schedule R. Hensley DOT physical by Feb 28. Pull all driver qualification files for pre-audit review. Verify HOS logs are current.', status: 'pending' },
    ],
    dailyBriefing: "## 🛡️ Compliance Briefing — Feb 18, 2026\\n\\n**Score:** 84/100 | TRIR: 1.2 | DART: 0.6 | Days Since Recordable: 127\\n**Open Items:** 4 findings | 3 CAPAs | 5 training gaps\\n\\n**Critical:**\\n1. 🔴 Forklift compliance is SYSTEMIC — certs + inspections + near-miss all connected\\n2. 🔴 Mezzanine guardrail CAPA due Mar 1 — parts ordered, install this week\\n3. 🟡 Operations training at 79% — lowest dept, schedule training blitz\\n\\n**Training:** 87% overall | 5 employees overdue\\n  - 2 forklift certs (CRITICAL)\\n  - 1 fall protection renewal\\n  - 1 harassment training\\n  - 1 new hire orientation (upcoming)\\n\\n**Audits:** Q1 warehouse audit in findings review (4 open). DOT audit Mar 15.\\n**Incidents:** 127 days since last recordable. 1 near-miss (crane rigging) closed.\\n\\n**Cross-Agent Alerts:**\\n- HR: Forklift cert expiry mirrors compliance gap (synced)\\n- Ops: Mezzanine fall hazard linked to audit finding F-003\\n- Legal: OSHA citation contest deadline Mar 1\\n\\n**Regulatory Watch:**\\n- OSHA Heat Standard: Effective Aug 2026 — begin planning now\\n- Utah CE hours increasing Jul 2026 — schedule additional CE",
  },
  _default: {
    overallScore: 0, trir: 0, dart: 0, emr: 0,
    daysSinceRecordable: 0, openFindings: 0, openCAPAs: 0,
    overdueTraining: 0, policyCompliance: 0,
    scoreHistory: [], frameworkScores: [], audits: [], findings: [],
    policies: [], trainingRequirements: [], trainingStatus: [],
    trainingByDept: [], incidents: [], capas: [], regChanges: [],
    aiInsights: [],
    dailyBriefing: "Connect your compliance data sources to begin monitoring.",
  }
}

export function getComplianceData(companyId: string): ComplianceSnapshot {
  return TENANT_COMPLIANCE[companyId] || TENANT_COMPLIANCE._default
}
`);

// ============================================================
// 6. COMPLIANCE API
// ============================================================
write('app/api/agents/compliance/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { getComplianceData } from '@/lib/compliance/compliance-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  return NextResponse.json({ success: true, data: getComplianceData(companyId) })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    if (action === 'approve_insight') return NextResponse.json({ success: true, message: 'Compliance action approved' })
    if (action === 'close_finding') return NextResponse.json({ success: true, message: 'Finding closed' })
    if (action === 'assign_capa') return NextResponse.json({ success: true, message: 'CAPA assigned' })
    if (action === 'schedule_training') return NextResponse.json({ success: true, message: 'Training scheduled for all overdue employees' })
    if (action === 'send_ack_reminder') return NextResponse.json({ success: true, message: 'Policy acknowledgment reminder sent' })
    if (action === 'submit_300a') return NextResponse.json({ success: true, message: 'OSHA 300A submitted electronically' })
    if (action === 'assess_reg_change') return NextResponse.json({ success: true, message: 'Impact assessment completed' })
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
`);

// ============================================================
// 7. COMPLIANCE DASHBOARD — Full 6-tab UI
// ============================================================
write('app/portal/agent/compliance/page.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TABS = ['Scorecard', 'Audits', 'Policy Hub', 'Training', 'Incidents', 'Reg Watch']
const SEV_C: Record<string, string> = { critical: 'bg-rose-500/10 text-rose-400', major: 'bg-amber-500/10 text-amber-400', minor: 'bg-blue-500/10 text-blue-400', observation: 'bg-gray-500/10 text-gray-400' }
const STAT_C: Record<string, string> = { open: 'bg-rose-500/10 text-rose-400', capa_assigned: 'bg-amber-500/10 text-amber-400', in_remediation: 'bg-blue-500/10 text-blue-400', closed: 'bg-emerald-500/10 text-emerald-400', in_progress: 'bg-blue-500/10 text-blue-400', findings_review: 'bg-amber-500/10 text-amber-400', scheduled: 'bg-purple-500/10 text-purple-400', completed: 'bg-emerald-500/10 text-emerald-400', expired: 'bg-rose-500/10 text-rose-400', overdue: 'bg-rose-500/10 text-rose-400', not_started: 'bg-gray-500/10 text-gray-400' }
const PRIO: Record<string, string> = { critical: 'text-rose-400 bg-rose-500/10', warning: 'text-amber-400 bg-amber-500/10', info: 'text-blue-400 bg-blue-500/10', high: 'text-amber-400 bg-amber-500/10', normal: 'text-gray-400 bg-gray-500/10' }
const IMP: Record<string, string> = { critical: 'bg-rose-500/10 text-rose-400', high: 'bg-amber-500/10 text-amber-400', medium: 'bg-blue-500/10 text-blue-400', low: 'bg-gray-500/10 text-gray-400' }

export default function ComplianceDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState('Scorecard')
  const [toast, setToast] = useState<string | null>(null)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }
  const act = async (action: string, extra?: any) => { await fetch('/api/agents/compliance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) }) }

  useEffect(() => {
    try {
      const s = localStorage.getItem('woulfai_session')
      if (!s) { router.replace('/login'); return }
      const p = JSON.parse(s); setUser(p)
      fetch('/api/agents/compliance?companyId=' + p.companyId).then(r => r.json()).then(d => { if (d.data) setData(d.data) })
    } catch { router.replace('/login') }
  }, [router])

  if (!user || !data) return <div className="min-h-screen bg-[#060910] flex items-center justify-center text-gray-500">Loading Compliance Agent...</div>

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}
      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal')} className="text-xs text-gray-500 hover:text-white">← Portal</button>
            <span className="text-gray-700">|</span><span className="text-xl">🛡️</span><span className="text-sm font-semibold">Compliance Agent</span>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] text-emerald-400 font-medium">LIVE</span></div>
          </div>
          <span className="text-xs text-gray-600">{user.companyName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-xs text-gray-400">Compliance data scoped to <span className="text-white font-semibold">{user.companyName}</span></span></div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {[
            { l: 'Score', v: data.overallScore + '/100', c: data.overallScore >= 90 ? 'text-emerald-400' : data.overallScore >= 80 ? 'text-amber-400' : 'text-rose-400' },
            { l: 'TRIR', v: data.trir, c: data.trir <= 2.0 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'DART', v: data.dart, c: 'text-blue-400' },
            { l: 'No Recordable', v: data.daysSinceRecordable + 'd', c: 'text-emerald-400' },
            { l: 'Findings', v: data.openFindings, c: data.openFindings > 0 ? 'text-amber-400' : 'text-emerald-400' },
            { l: 'CAPAs', v: data.openCAPAs, c: data.openCAPAs > 0 ? 'text-amber-400' : 'text-emerald-400' },
            { l: 'Trn Overdue', v: data.overdueTraining, c: data.overdueTraining > 0 ? 'text-rose-400' : 'text-emerald-400' },
            { l: 'Policy %', v: data.policyCompliance + '%', c: data.policyCompliance >= 90 ? 'text-emerald-400' : 'text-amber-400' },
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

        {/* SCORECARD */}
        {tab === 'Scorecard' && (<div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">🛡️ Daily Compliance Briefing</h3>
            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: data.dailyBriefing.replace(/##\\s/g,'<strong>').replace(/\\*\\*/g,'<strong>').replace(/\\n/g,'<br/>') }} />
          </div>
          {/* Framework scores */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📊 Framework Compliance Scores</h3>
            <div className="space-y-3">{data.frameworkScores.map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs text-gray-400 w-24 shrink-0">{f.framework}</span>
                <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden relative">
                  <div className={(f.score >= 90 ? 'bg-emerald-500/40' : f.score >= 80 ? 'bg-amber-500/40' : 'bg-rose-500/40') + ' h-full rounded-full'} style={{ width: f.score + '%' }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">{f.score}/100</span>
                </div>
                <span className="text-[10px] text-gray-500 w-16 text-right">{f.compliant}/{f.items}</span>
              </div>
            ))}</div>
          </div>
          {/* Score trend */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📈 Score Trend (6 months)</h3>
            <div className="flex items-end gap-2 h-32">{data.scoreHistory.map((s: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono">{s.overall}</span>
                <div className="w-full bg-white/5 rounded-t relative flex-1"><div className={(s.overall >= 85 ? 'bg-emerald-500/40' : s.overall >= 80 ? 'bg-amber-500/40' : 'bg-rose-500/40') + ' absolute bottom-0 w-full rounded-t'} style={{ height: s.overall + '%' }} /></div>
                <span className="text-[8px] text-gray-600">{s.date.split('-')[1]}/{s.date.split('-')[0].slice(2)}</span>
              </div>
            ))}</div>
          </div>
          {/* AI Insights */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">🤖 Compliance Intelligence ({data.aiInsights.filter((a: any) => a.status === 'pending').length} pending)</h3>
            <div className="space-y-3">{data.aiInsights.filter((a: any) => a.status === 'pending').map((a: any) => (
              <div key={a.id} className={"border rounded-xl p-4 " + (a.priority === 'critical' ? 'border-rose-500/20 bg-rose-500/5' : a.priority === 'warning' ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-semibold">{a.title}</span><span className={"text-[9px] px-1.5 py-0.5 rounded " + (PRIO[a.priority] || '')}>{a.priority}</span></div>
                    <div className="text-xs text-gray-500 mt-1">{a.description}</div><div className="text-xs text-rose-400/70 mt-1">{a.impact}</div><div className="text-xs text-emerald-400/70 mt-1">Action: {a.action}</div></div>
                  <button onClick={() => { act('approve_insight', { id: a.id }); show('✅ Approved'); setData({ ...data, aiInsights: data.aiInsights.map((x: any) => x.id === a.id ? { ...x, status: 'approved' } : x) }) }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 shrink-0">Approve</button>
                </div>
              </div>
            ))}</div>
          </div>
        </div>)}

        {/* AUDITS */}
        {tab === 'Audits' && (<div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{data.audits.map((a: any) => (
            <div key={a.id} className={"bg-[#0A0E15] border rounded-xl p-4 sm:p-5 " + (a.status === 'findings_review' ? 'border-amber-500/20' : 'border-white/5')}>
              <div className="flex items-center gap-2 mb-2"><span className="text-xs font-mono text-gray-500">{a.auditNumber}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (STAT_C[a.status] || '')}>{a.status.replace('_',' ')}</span></div>
              <div className="text-sm font-bold">{a.title}</div>
              <div className="text-[10px] text-gray-500 mt-1">{a.framework} • {a.scope} • {a.auditor}</div>
              <div className="text-[10px] text-gray-600 mt-1">Scheduled: {a.scheduledDate}</div>
              {a.findings > 0 && <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                <div><div className="text-[8px] text-gray-500">Critical</div><div className={"text-sm font-bold " + (a.critical > 0 ? 'text-rose-400' : 'text-gray-600')}>{a.critical}</div></div>
                <div><div className="text-[8px] text-gray-500">Major</div><div className={"text-sm font-bold " + (a.major > 0 ? 'text-amber-400' : 'text-gray-600')}>{a.major}</div></div>
                <div><div className="text-[8px] text-gray-500">Minor</div><div className="text-sm font-bold text-blue-400">{a.minor}</div></div>
                <div><div className="text-[8px] text-gray-500">Open</div><div className={"text-sm font-bold " + (a.open > 0 ? 'text-rose-400' : 'text-emerald-400')}>{a.open}</div></div>
              </div>}
              {a.score > 0 && <div className="mt-3"><div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>Score</span><span>{a.score}/100</span></div><div className="bg-white/5 rounded-full h-2"><div className={(a.score >= 85 ? 'bg-emerald-500' : a.score >= 75 ? 'bg-amber-500' : 'bg-rose-500') + ' h-2 rounded-full'} style={{ width: a.score + '%' }} /></div></div>}
            </div>
          ))}</div>
          {/* Findings */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">⚠️ Open Findings ({data.findings.filter((f: any) => f.status !== 'closed').length})</h3>
            <div className="space-y-3">{data.findings.filter((f: any) => f.status !== 'closed').map((f: any) => (
              <div key={f.id} className={"border rounded-xl p-4 " + (f.severity === 'critical' ? 'border-rose-500/20 bg-rose-500/5' : f.severity === 'major' ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5')}>
                <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-mono text-gray-500">{f.auditNumber} / {f.findingNumber}</span><span className={"text-[9px] px-2 py-0.5 rounded font-medium " + (SEV_C[f.severity] || '')}>{f.severity}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (STAT_C[f.status] || '')}>{f.status.replace('_',' ')}</span></div>
                <div className="text-sm font-semibold">{f.title}</div>
                <div className="text-xs text-gray-500 mt-1">{f.description}</div>
                <div className="flex items-center justify-between mt-2 text-[10px]"><span className="text-gray-600">Reg: {f.regulation} • Assigned: {f.assignedTo} • Due: {f.dueDate}</span>
                  {f.status !== 'closed' && <button onClick={() => { act('close_finding', { id: f.id }); show('Finding closed'); setData({ ...data, findings: data.findings.map((x: any) => x.id === f.id ? { ...x, status: 'closed' } : x) }) }} className="text-[9px] text-emerald-400 hover:underline">Close</button>}
                </div>
              </div>
            ))}</div>
          </div>
          {/* CAPAs */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">🔧 Corrective Actions (CAPAs)</h3>
            <div className="space-y-2">{data.capas.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                <div><div className="flex items-center gap-2"><span className="text-[10px] font-mono text-gray-500">{c.capaNumber}</span><span className={"text-[9px] px-1.5 py-0.5 rounded " + (PRIO[c.priority] || '')}>{c.priority}</span><span className={"text-[9px] px-1.5 py-0.5 rounded " + (STAT_C[c.status] || '')}>{c.status.replace('_',' ')}</span></div><div className="text-xs font-medium mt-0.5">{c.title}</div><div className="text-[10px] text-gray-600">Assigned: {c.assignedTo} • Due: {c.dueDate}</div></div>
              </div>
            ))}</div>
          </div>
        </div>)}

        {/* POLICY HUB */}
        {tab === 'Policy Hub' && (<div className="space-y-3">{data.policies.map((p: any) => (
          <div key={p.id} className={"bg-[#0A0E15] border rounded-xl p-4 " + (p.ackPct < 80 ? 'border-amber-500/20' : 'border-white/5')}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2"><span className="text-[10px] font-mono text-gray-500">{p.policyNumber}</span><span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-500">v{p.version}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : p.status === 'review' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400')}>{p.status}</span></div>
                <div className="text-sm font-semibold mt-1">{p.title}</div>
                <div className="text-[10px] text-gray-600">Owner: {p.owner} • Review due: {p.reviewDue}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-28"><div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>Ack</span><span>{p.ackPct}%</span></div><div className="bg-white/5 rounded-full h-2"><div className={(p.ackPct >= 90 ? 'bg-emerald-500' : p.ackPct >= 70 ? 'bg-amber-500' : 'bg-rose-500') + ' h-2 rounded-full'} style={{ width: p.ackPct + '%' }} /></div><div className="text-[9px] text-gray-600 mt-0.5 text-right">{p.ackCount}/{p.ackRequired}</div></div>
                {p.ackPct < 100 && <button onClick={() => { act('send_ack_reminder', { policyId: p.id }); show('Reminders sent') }} className="text-[9px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Remind</button>}
              </div>
            </div>
          </div>
        ))}</div>)}

        {/* TRAINING */}
        {tab === 'Training' && (<div className="space-y-6">
          {/* Dept compliance */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📊 Training Compliance by Department</h3>
            <div className="space-y-3">{data.trainingByDept.map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs text-gray-400 w-24 shrink-0">{d.dept}</span>
                <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden relative">
                  <div className={(d.pct >= 90 ? 'bg-emerald-500/40' : d.pct >= 80 ? 'bg-amber-500/40' : 'bg-rose-500/40') + ' h-full rounded-full'} style={{ width: d.pct + '%' }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">{d.pct}%</span>
                </div>
                <span className="text-[10px] text-gray-500 w-16 text-right">{d.compliant}/{d.total}</span>
              </div>
            ))}</div>
          </div>
          {/* Overdue */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">⚠️ Overdue & Expiring Training</h3><button onClick={() => { act('schedule_training'); show('Training sessions scheduled') }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500">Schedule All</button></div>
            <div className="space-y-2">{data.trainingStatus.filter((t: any) => t.status === 'expired' || t.status === 'overdue' || t.status === 'not_started').map((t: any, i: number) => (
              <div key={i} className={"flex items-center justify-between py-2 border-b border-white/[0.03] " + (t.status === 'expired' ? 'bg-rose-500/5' : '')}>
                <div><div className="text-xs font-medium">{t.employeeName}</div><div className="text-[10px] text-gray-500">{t.department} • {t.title} ({t.code})</div></div>
                <div className="flex items-center gap-2"><span className="text-[10px] text-gray-600">{t.expirationDate || 'Not started'}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (STAT_C[t.status] || '')}>{t.status.replace('_',' ')}</span></div>
              </div>
            ))}</div>
          </div>
          {/* Training Matrix */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6 overflow-x-auto">
            <h3 className="text-sm font-semibold mb-4">📋 Training Requirements Matrix</h3>
            <table className="w-full text-[10px] min-w-[600px]"><thead><tr className="text-gray-500 border-b border-white/5">
              <th className="text-left p-2">Training</th><th className="text-center p-2">Framework</th><th className="text-center p-2">Regulation</th><th className="text-center p-2">Frequency</th><th className="text-center p-2">Depts</th><th className="text-center p-2">Hours</th>
            </tr></thead><tbody>{data.trainingRequirements.map((t: any, i: number) => (
              <tr key={i} className="border-b border-white/[0.03]">
                <td className="p-2 font-medium">{t.title}<div className="text-[9px] text-gray-600 font-mono">{t.code}</div></td>
                <td className="p-2 text-center"><span className="bg-white/5 px-1.5 py-0.5 rounded">{t.framework}</span></td>
                <td className="p-2 text-center text-gray-500">{t.regulation}</td>
                <td className="p-2 text-center">{t.frequency}</td>
                <td className="p-2 text-center text-gray-500">{t.applicableDepts.join(', ')}</td>
                <td className="p-2 text-center">{t.durationHours}h</td>
              </tr>
            ))}</tbody></table>
          </div>
        </div>)}

        {/* INCIDENTS */}
        {tab === 'Incidents' && (<div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">TRIR</div><div className={"text-xl font-mono font-bold mt-1 " + (data.trir <= 2.0 ? 'text-emerald-400' : 'text-amber-400')}>{data.trir}</div><div className="text-[9px] text-gray-600">Industry avg: 3.0</div></div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">DART</div><div className="text-xl font-mono font-bold mt-1 text-blue-400">{data.dart}</div></div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">EMR</div><div className={"text-xl font-mono font-bold mt-1 " + (data.emr <= 1.0 ? 'text-emerald-400' : 'text-amber-400')}>{data.emr}</div></div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Days Safe</div><div className="text-xl font-mono font-bold mt-1 text-emerald-400">{data.daysSinceRecordable}</div></div>
          </div>
          {data.incidents.map((inc: any) => (
            <div key={inc.id} className={"bg-[#0A0E15] border rounded-xl p-4 sm:p-5 " + (inc.severity === 'recordable' || inc.severity === 'lost_time' ? 'border-rose-500/20' : 'border-white/5')}>
              <div className="flex items-center gap-2 mb-2"><span className="text-xs font-mono text-gray-500">{inc.incidentNumber}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (SEV_C[inc.severity] || 'bg-gray-500/10 text-gray-400')}>{inc.severity.replace('_',' ')}</span><span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-500">{inc.type}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (STAT_C[inc.status] || '')}>{inc.status.replace('_',' ')}</span>{inc.oshaRecordable && <span className="text-[9px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded">OSHA Recordable</span>}</div>
              <div className="text-sm font-semibold">{inc.description}</div>
              <div className="text-xs text-gray-500 mt-1">{inc.date} • {inc.location}</div>
              {inc.rootCause && <div className="text-xs text-amber-400/70 mt-1">Root cause: {inc.rootCause}</div>}
            </div>
          ))}
        </div>)}

        {/* REG WATCH */}
        {tab === 'Reg Watch' && (<div className="space-y-3">{data.regChanges.map((rc: any) => (
          <div key={rc.id} className={"bg-[#0A0E15] border rounded-xl p-4 sm:p-5 " + (rc.impactLevel === 'high' || rc.impactLevel === 'critical' ? 'border-amber-500/20' : 'border-white/5')}>
            <div className="flex items-center gap-2 mb-2"><span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500">{rc.framework}</span><span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500">{rc.jurisdiction}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (IMP[rc.impactLevel] || '')}>{rc.impactLevel} impact</span>{rc.actionRequired && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Action Required</span>}<span className={"text-[9px] px-2 py-0.5 rounded " + (STAT_C[rc.status] || 'bg-gray-500/10 text-gray-400')}>{rc.status.replace('_',' ')}</span></div>
            <div className="text-sm font-bold">{rc.title}</div>
            <div className="text-xs text-gray-500 mt-1">{rc.summary}</div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-gray-600">
              <span>Published: {rc.publishedDate} • Effective: {rc.effectiveDate || 'TBD'}</span>
              {rc.status === 'new' && <button onClick={() => { act('assess_reg_change', { id: rc.id }); show('Assessment completed'); setData({ ...data, regChanges: data.regChanges.map((x: any) => x.id === rc.id ? { ...x, status: 'assessed' } : x) }) }} className="text-[9px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Assess Impact</button>}
            </div>
          </div>
        ))}</div>)}
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
console.log('  COMPLIANCE AGENT MODULES:');
console.log('');
console.log('  💾 DATA SCHEMA (10 Prisma models):');
console.log('     AuditProgram, AuditFinding');
console.log('     CompliancePolicy, PolicyAcknowledgment');
console.log('     TrainingRequirement, TrainingRecord');
console.log('     IncidentReport, CorrectiveAction');
console.log('     RegulatoryChange, ComplianceScore');
console.log('');
console.log('  📡 INTEGRATIONS:');
console.log('     OSHA ITA           — electronic 300A submission');
console.log('     State Feeds        — UT DOPL, NV licensing');
console.log('     SafetyCulture      — LMS / inspection sync');
console.log('     OSHA QuickTakes    — regulatory alert monitoring');
console.log('');
console.log('  🔗 CROSS-AGENT BRIDGES:');
console.log('     HR      → employee certs, training records');
console.log('     Ops     → field incidents, safety reports');
console.log('     WMS     → warehouse inspections, hazmat');
console.log('     Legal   → regulatory deadlines, citations, COIs');
console.log('');
console.log('  🧠 AI BRAIN:');
console.log('     Audit Risk Prediction');
console.log('     Training Gap Detection (role × requirement matrix)');
console.log('     Incident Pattern Recognition');
console.log('     Regulatory Change Impact Assessment');
console.log('     Automated CAPA Generation');
console.log('     Weighted Compliance Scoring Algorithm');
console.log('');
console.log('  📊 DASHBOARD (6 tabs at /portal/agent/compliance):');
console.log('     Scorecard     — Framework scores, 6-month trend, AI insights');
console.log('     Audits        — Audit cards + findings + CAPAs');
console.log('     Policy Hub    — Repository with ack % bars + remind');
console.log('     Training      — Dept compliance bars + overdue list + matrix');
console.log('     Incidents     — TRIR/DART/EMR cards + incident history');
console.log('     Reg Watch     — Regulatory changes with impact assessment');
console.log('');
console.log('  DEMO DATA (Woulf Group):');
console.log('     3 audits (Q1 warehouse in review, DOT scheduled, annual closed)');
console.log('     4 open findings (forklift certs CRITICAL, fall protection)');
console.log('     7 policies with acknowledgment tracking (76-100%)');
console.log('     10 training requirements (OSHA 1910/1926 + internal)');
console.log('     8 training status records (5 overdue/expired)');
console.log('     3 incidents (near-miss, first aid, mezzanine near-miss)');
console.log('     3 CAPAs (forklift recert, guardrail, rigging checklist)');
console.log('     3 regulatory changes (OSHA heat standard, UT CE hours, EPA SPCC)');
console.log('     5 AI insights (systemic forklift gap, training blitz, heat prep)');
console.log('     6-month compliance score history with trending');
console.log('');
console.log('  INSTALL & DEPLOY:');
console.log('    node compliance-agent.js');
console.log('    npm run build');
console.log('    vercel --prod');
console.log('');
