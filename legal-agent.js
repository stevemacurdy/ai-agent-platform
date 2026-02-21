#!/usr/bin/env node
/**
 * LEGAL AGENT — Full Production Module for WoulfAI
 *
 * Components:
 *   1.  lib/legal/schema.prisma          — Contracts, Clauses, Compliance, Insurance, Liens, IP
 *   2.  lib/legal/esign-client.ts        — DocuSign/HelloSign + CLM stubs
 *   3.  lib/legal/cross-agent-bridge.ts  — HR, Ops, Sales legal compliance wiring
 *   4.  lib/legal/clause-analyzer.ts     — AI contract clause risk scoring
 *   5.  lib/legal/system-prompt.ts       — Autonomous General Counsel AI brain
 *   6.  lib/legal/legal-data.ts          — Tenant-scoped demo data engine
 *   7.  app/api/agents/legal/route.ts    — Legal agent API endpoints
 *   8.  app/portal/agent/legal/page.tsx  — Full 6-tab Legal dashboard
 *
 * Usage: node legal-agent.js
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
console.log('  ║  LEGAL AGENT — General Counsel + Compliance + Contract Mgmt     ║');
console.log('  ╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. PRISMA SCHEMA
// ============================================================
write('lib/legal/schema.prisma', `// ============================================================================
// LEGAL DATA SCHEMA — Contracts, compliance, insurance, IP, litigation
// ============================================================================

model Contract {
  id              String   @id @default(cuid())
  companyId       String
  contractNumber  String            // CON-2026-018
  title           String
  type            String            // msa | nda | sow | subcontract | lease | service | employment | license
  category        String?           // customer | vendor | subcontractor | landlord | insurance | government
  counterparty    String            // company or person name
  counterpartyContact String?
  // Status
  status          String   @default("draft")  // draft | review | pending_signature | active | expired | terminated | renewed
  // Dates
  effectiveDate   String?
  expirationDate  String?
  renewalDate     String?
  autoRenew       Boolean  @default(false)
  renewalTermDays Int?              // auto-renew period
  terminationNotice Int?            // days notice required
  // Value
  contractValue   Float?
  liabilityCap    Float?
  insuranceRequired Float?
  // Documents
  currentVersion  Int      @default(1)
  documentUrl     String?
  amendments      Json?             // [{ version, date, description, url }]
  // Signatures
  signatureStatus String?           // pending | partially_signed | fully_executed
  envelopeId      String?           // DocuSign envelope
  // Links
  projectId       String?           // linked Ops project
  salesDealId     String?           // linked Sales deal
  // Risk
  overallRiskScore Int?             // 0-100 (100 = highest risk)
  flaggedClauses  Int     @default(0)
  // Metadata
  tags            Json?             // ['construction', 'utah', 'conveyor']
  notes           String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([companyId, status])
  @@index([companyId, type])
  @@index([companyId, expirationDate])
}

model ContractClause {
  id              String   @id @default(cuid())
  companyId       String
  contractId      String
  contractNumber  String
  clauseType      String            // indemnification | liability_cap | termination | ip_ownership | non_compete | warranty | insurance | payment_terms | force_majeure | dispute_resolution | confidentiality | change_order
  title           String
  originalText    String   @db.Text
  riskScore       Int      @default(50)  // 0-100 (100 = most risk)
  riskLevel       String   @default("medium")  // low | medium | high | critical
  aiAnalysis      String?  @db.Text     // AI explanation of risk
  recommendation  String?  @db.Text     // Suggested revision
  status          String   @default("flagged")  // flagged | reviewed | accepted | revised
  reviewedBy      String?
  revisedText     String?  @db.Text
  @@index([companyId, contractId])
  @@index([companyId, riskLevel])
}

model LegalMatter {
  id              String   @id @default(cuid())
  companyId       String
  matterNumber    String            // LM-2026-003
  title           String
  type            String            // litigation | dispute | regulatory | investigation | advisory
  status          String   @default("open")  // open | active | discovery | trial | settled | closed
  priority        String   @default("normal")
  // Parties
  opposingParty   String?
  outsideCounsel  String?
  jurisdiction    String?
  caseNumber      String?
  // Dates
  filingDate      String?
  nextDeadline    String?
  nextDeadlineDesc String?
  trialDate       String?
  // Budget
  budgetEstimate  Float?
  costToDate      Float?
  // Resolution
  exposure        Float?            // potential liability
  settlementRange String?           // "$50K-$150K"
  resolution      String?
  // Notes
  description     String?  @db.Text
  keyDocuments    Json?
  timeline        Json?             // [{ date, event, description }]
  createdAt       DateTime @default(now())
  @@index([companyId, status])
}

model ComplianceAuditTrail {
  id              String   @id @default(cuid())
  companyId       String
  framework       String            // OSHA | DOT | EPA | STATE_LICENSE | INSURANCE | TAX | EMPLOYMENT
  requirement     String
  status          String   @default("compliant")  // compliant | non_compliant | expiring | pending_review | waived
  dueDate         String?
  completedDate   String?
  evidence        String?           // document URL or reference
  responsibleParty String?
  notes           String?
  lastAuditDate   String?
  nextAuditDate   String?
  riskScore       Int      @default(0)
  createdAt       DateTime @default(now())
  @@index([companyId, framework, status])
}

model RegulatoryDeadline {
  id              String   @id @default(cuid())
  companyId       String
  framework       String
  title           String
  description     String?
  dueDate         String
  status          String   @default("upcoming")  // upcoming | overdue | completed | waived
  filingType      String?           // annual | quarterly | monthly | one_time
  jurisdiction    String?           // federal | state:UT | state:NV etc.
  penalty         String?           // penalty for non-compliance
  responsibleParty String?
  reminderSent    Boolean  @default(false)
  createdAt       DateTime @default(now())
  @@index([companyId, dueDate])
}

model InsuranceCertificate {
  id              String   @id @default(cuid())
  companyId       String
  holder          String            // subcontractor or vendor name
  holderType      String            // subcontractor | vendor | self
  policyType      String            // general_liability | workers_comp | auto | professional | umbrella | property
  policyNumber    String
  carrier         String
  effectiveDate   String
  expirationDate  String
  coverageAmount  Float
  additionalInsured Boolean @default(false)
  waiverOfSubrogation Boolean @default(false)
  certificateUrl  String?
  status          String   @default("active")  // active | expiring | expired | pending
  linkedProjectId String?
  verifiedDate    String?
  verifiedBy      String?
  createdAt       DateTime @default(now())
  @@index([companyId, holder])
  @@index([companyId, expirationDate])
}

model LienWaiver {
  id              String   @id @default(cuid())
  companyId       String
  projectId       String
  projectNumber   String
  type            String            // conditional_progress | unconditional_progress | conditional_final | unconditional_final
  party           String            // subcontractor or supplier name
  throughDate     String
  amount          Float
  status          String   @default("draft")  // draft | sent | signed | recorded
  documentUrl     String?
  envelopeId      String?
  signedDate      String?
  createdAt       DateTime @default(now())
  @@index([companyId, projectId])
}

model IPRegistry {
  id              String   @id @default(cuid())
  companyId       String
  type            String            // trademark | patent | copyright | trade_secret | domain
  name            String
  registrationNumber String?
  filingDate      String?
  registrationDate String?
  expirationDate  String?
  jurisdiction    String?
  status          String   @default("active")  // pending | active | expired | abandoned
  classes         Json?             // trademark classes
  attorney        String?
  renewalDate     String?
  annualCost      Float?
  notes           String?
  createdAt       DateTime @default(now())
  @@index([companyId, type])
}

model LicenseRenewal {
  id              String   @id @default(cuid())
  companyId       String
  licenseType     String            // contractor | business | specialty | environmental | dot | professional
  licenseName     String
  licenseNumber   String
  issuingAuthority String
  jurisdiction    String
  effectiveDate   String
  expirationDate  String
  status          String   @default("active")  // active | expiring | expired | pending_renewal
  renewalCost     Float?
  requirements    String?           // CE hours, bonds, etc.
  responsibleParty String?
  createdAt       DateTime @default(now())
  @@index([companyId, expirationDate])
}
`);

// ============================================================
// 2. E-SIGN CLIENT + CLM
// ============================================================
write('lib/legal/esign-client.ts', `// ============================================================================
// E-SIGNATURE & CLM — DocuSign, HelloSign, Ironclad
// ============================================================================

export class DocuSignLegalClient {
  private accessToken: string; private accountId: string

  constructor(accessToken: string, accountId: string) {
    this.accessToken = accessToken; this.accountId = accountId
  }

  async sendForSignature(params: {
    documentBase64: string; documentName: string; subject: string
    signers: { email: string; name: string; role: string }[]
  }): Promise<{ envelopeId: string; status: string }> {
    const res = await fetch(\`https://demo.docusign.net/restapi/v2.1/accounts/\${this.accountId}/envelopes\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.accessToken}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailSubject: params.subject,
        documents: [{ documentBase64: params.documentBase64, name: params.documentName, fileExtension: 'pdf', documentId: '1' }],
        recipients: {
          signers: params.signers.map((s, i) => ({
            email: s.email, name: s.name, recipientId: String(i + 1), routingOrder: String(i + 1),
            tabs: { signHereTabs: [{ xPosition: '200', yPosition: '700', documentId: '1', pageNumber: '1' }] }
          }))
        },
        status: 'sent',
      }),
    })
    const data = await res.json()
    return { envelopeId: data.envelopeId || '', status: data.status || 'error' }
  }

  async getEnvelopeStatus(envelopeId: string): Promise<{ status: string; signers: { name: string; status: string; signedAt?: string }[] }> {
    const res = await fetch(\`https://demo.docusign.net/restapi/v2.1/accounts/\${this.accountId}/envelopes/\${envelopeId}/recipients\`, {
      headers: { 'Authorization': \`Bearer \${this.accessToken}\` },
    })
    const data = await res.json()
    return {
      status: data.signers?.every((s: any) => s.status === 'completed') ? 'fully_executed' : 'pending',
      signers: (data.signers || []).map((s: any) => ({ name: s.name, status: s.status, signedAt: s.signedDateTime })),
    }
  }

  async voidEnvelope(envelopeId: string, reason: string): Promise<boolean> {
    const res = await fetch(\`https://demo.docusign.net/restapi/v2.1/accounts/\${this.accountId}/envelopes/\${envelopeId}\`, {
      method: 'PUT',
      headers: { 'Authorization': \`Bearer \${this.accessToken}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'voided', voidedReason: reason }),
    })
    return res.ok
  }
}

export class HelloSignClient {
  private apiKey: string
  constructor(apiKey: string) { this.apiKey = apiKey }

  async sendSignatureRequest(params: { title: string; subject: string; signers: { email: string; name: string }[]; fileUrl: string }): Promise<{ signatureRequestId: string }> {
    const res = await fetch('https://api.hellosign.com/v3/signature_request/send', {
      method: 'POST',
      headers: { 'Authorization': \`Basic \${btoa(this.apiKey + ':')}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: params.title, subject: params.subject, signers: params.signers.map((s, i) => ({ ...s, order: i })), file_urls: [params.fileUrl] }),
    })
    const data = await res.json()
    return { signatureRequestId: data.signature_request?.signature_request_id || '' }
  }
}

// --- Ironclad CLM Stub ---
export class IroncladClient {
  private apiKey: string
  constructor(apiKey: string) { this.apiKey = apiKey }

  async createWorkflow(templateId: string, params: Record<string, any>): Promise<{ workflowId: string }> {
    const res = await fetch('https://ironcladapp.com/public/api/v1/workflows', {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.apiKey}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: templateId, attributes: params }),
    })
    const data = await res.json()
    return { workflowId: data.id || '' }
  }

  async getWorkflowStatus(workflowId: string): Promise<{ status: string; step: string }> {
    const res = await fetch(\`https://ironcladapp.com/public/api/v1/workflows/\${workflowId}\`, {
      headers: { 'Authorization': \`Bearer \${this.apiKey}\` },
    })
    const data = await res.json()
    return { status: data.status || '', step: data.step || '' }
  }
}

export function createDocuSignLegalClient(): DocuSignLegalClient | null {
  const token = process.env.DOCUSIGN_ACCESS_TOKEN, acct = process.env.DOCUSIGN_ACCOUNT_ID
  if (!token || !acct) return null; return new DocuSignLegalClient(token, acct)
}
export function createHelloSignClient(): HelloSignClient | null {
  const key = process.env.HELLOSIGN_API_KEY; if (!key) return null; return new HelloSignClient(key)
}
export function createIroncladClient(): IroncladClient | null {
  const key = process.env.IRONCLAD_API_KEY; if (!key) return null; return new IroncladClient(key)
}
`);

// ============================================================
// 3. CROSS-AGENT BRIDGE — HR, Ops, Sales
// ============================================================
write('lib/legal/cross-agent-bridge.ts', `// ============================================================================
// CROSS-AGENT LEGAL BRIDGE — HR, Ops, Sales compliance wiring
// ============================================================================

/** HR Bridge: Employment law compliance */
export async function getHRComplianceStatus(companyId: string): Promise<{
  handbookCurrent: boolean; lastReviewDate: string
  terminationsRequiringReview: number
  expiringCerts: { employee: string; cert: string; expires: string }[]
}> {
  try {
    const res = await fetch(\`/api/agents/hr?companyId=\${companyId}\`)
    const data = await res.json()
    const employees = data.data?.employees || []
    const expiringCerts = employees.flatMap((e: any) =>
      (e.certs || []).filter((c: any) => c.status === 'expiring' || c.status === 'expired')
        .map((c: any) => ({ employee: e.name, cert: c.name, expires: c.expires }))
    )
    return { handbookCurrent: true, lastReviewDate: '2025-11-15', terminationsRequiringReview: 0, expiringCerts }
  } catch { return { handbookCurrent: true, lastReviewDate: '', terminationsRequiringReview: 0, expiringCerts: [] } }
}

/** Ops Bridge: Construction contract & insurance tracking */
export async function getOpsContractStatus(companyId: string): Promise<{
  activeProjects: { projectNumber: string; name: string; contractValue: number; changeOrders: number }[]
  pendingLienWaivers: number
  subcontractorsWithoutInsurance: string[]
}> {
  try {
    const res = await fetch(\`/api/agents/operations?companyId=\${companyId}\`)
    const data = await res.json()
    const projects = data.data?.projects || []
    return {
      activeProjects: projects.map((p: any) => ({ projectNumber: p.projectNumber, name: p.name, contractValue: p.contractValue, changeOrders: p.changeOrders })),
      pendingLienWaivers: 2,
      subcontractorsWithoutInsurance: [],
    }
  } catch { return { activeProjects: [], pendingLienWaivers: 0, subcontractorsWithoutInsurance: [] } }
}

/** Sales Bridge: Contract approval workflow */
export async function getSalesPendingContracts(companyId: string): Promise<{
  pendingApprovals: { dealId: string; client: string; value: number; contractType: string }[]
}> {
  try {
    return { pendingApprovals: [
      { dealId: 'D-2026-089', client: 'Summit Fulfillment', value: 340000, contractType: 'MSA + SOW' },
    ] }
  } catch { return { pendingApprovals: [] } }
}

/** Generate termination checklist from HR data */
export function generateTerminationChecklist(employeeName: string, reason: string): string[] {
  return [
    'Review employment agreement for non-compete and non-solicitation clauses',
    'Check for any pending PTO payout obligations (state law: ' + (reason === 'involuntary' ? 'required within 24 hours in UT' : 'next regular payroll') + ')',
    'Prepare separation agreement if offering severance',
    'Revoke system access (IT checklist)',
    'Collect company property (keys, badges, equipment)',
    'COBRA notification (within 44 days)',
    'Update I-9 records',
    'Document reason for termination (file retention: 3 years)',
    reason === 'involuntary' ? 'Ensure final paycheck includes all owed wages (UT: within 24 hours)' : 'Process final paycheck on next regular payroll date',
    'Schedule exit interview (optional but recommended)',
  ]
}

/** Construction lien waiver rules by state */
export const LIEN_WAIVER_RULES: Record<string, { conditionalAllowed: boolean; maxRetention: number; filingDeadlineDays: number; noticeRequired: boolean }> = {
  UT: { conditionalAllowed: true, maxRetention: 5, filingDeadlineDays: 180, noticeRequired: true },
  NV: { conditionalAllowed: true, maxRetention: 5, filingDeadlineDays: 90, noticeRequired: true },
  CA: { conditionalAllowed: true, maxRetention: 10, filingDeadlineDays: 90, noticeRequired: true },
  TX: { conditionalAllowed: true, maxRetention: 10, filingDeadlineDays: 60, noticeRequired: true },
  ID: { conditionalAllowed: true, maxRetention: 5, filingDeadlineDays: 90, noticeRequired: false },
}
`);

// ============================================================
// 4. AI CLAUSE ANALYZER
// ============================================================
write('lib/legal/clause-analyzer.ts', `// ============================================================================
// AI CONTRACT CLAUSE ANALYZER — Risk scoring and redlining
// ============================================================================

export interface ClauseAnalysis {
  clauseType: string
  title: string
  originalText: string
  riskScore: number       // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  aiAnalysis: string
  recommendation: string
  suggestedRevision?: string
}

const CLAUSE_RISK_PATTERNS: { type: string; patterns: RegExp[]; baseRisk: number; title: string }[] = [
  { type: 'indemnification', patterns: [/indemnif/i, /hold harmless/i, /defend and indemnify/i], baseRisk: 70, title: 'Indemnification' },
  { type: 'liability_cap', patterns: [/liability.*cap/i, /aggregate liability/i, /maximum liability/i, /limitation of liability/i], baseRisk: 65, title: 'Liability Cap' },
  { type: 'termination', patterns: [/terminat/i, /right to cancel/i, /early termination/i], baseRisk: 50, title: 'Termination' },
  { type: 'insurance', patterns: [/insurance/i, /policy of insurance/i, /coverage/i], baseRisk: 40, title: 'Insurance Requirements' },
  { type: 'warranty', patterns: [/warrant/i, /guarantee/i, /as[- ]is/i], baseRisk: 55, title: 'Warranty' },
  { type: 'payment_terms', patterns: [/payment.*terms/i, /net \\d+/i, /retainage/i, /retention/i], baseRisk: 45, title: 'Payment Terms' },
  { type: 'ip_ownership', patterns: [/intellectual property/i, /work.?for.?hire/i, /ownership of/i], baseRisk: 60, title: 'IP Ownership' },
  { type: 'non_compete', patterns: [/non[- ]?compet/i, /restrictive covenant/i], baseRisk: 65, title: 'Non-Compete' },
  { type: 'force_majeure', patterns: [/force majeure/i, /act of god/i, /unforeseeable/i], baseRisk: 35, title: 'Force Majeure' },
  { type: 'dispute_resolution', patterns: [/arbitrat/i, /mediat/i, /dispute resolution/i, /governing law/i], baseRisk: 40, title: 'Dispute Resolution' },
  { type: 'change_order', patterns: [/change order/i, /modification/i, /amendment/i, /scope change/i], baseRisk: 50, title: 'Change Order Process' },
  { type: 'confidentiality', patterns: [/confidential/i, /non[- ]?disclosure/i, /proprietary/i], baseRisk: 35, title: 'Confidentiality' },
]

/**
 * Local pattern-based clause detection (no API needed)
 */
export function analyzeClausesLocal(contractText: string): ClauseAnalysis[] {
  const paragraphs = contractText.split(/\\n\\n+/).filter(p => p.trim().length > 20)
  const results: ClauseAnalysis[] = []

  for (const para of paragraphs) {
    for (const pattern of CLAUSE_RISK_PATTERNS) {
      if (pattern.patterns.some(p => p.test(para))) {
        let riskAdj = 0
        // Risk modifiers
        if (/unlimited/i.test(para)) riskAdj += 25
        if (/sole discretion/i.test(para)) riskAdj += 15
        if (/waive/i.test(para)) riskAdj += 10
        if (/mutual/i.test(para)) riskAdj -= 15
        if (/reasonable/i.test(para)) riskAdj -= 10
        if (/not.*exceed/i.test(para)) riskAdj -= 5

        const score = Math.max(0, Math.min(100, pattern.baseRisk + riskAdj))
        const level = score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low'

        results.push({
          clauseType: pattern.type,
          title: pattern.title,
          originalText: para.slice(0, 500),
          riskScore: score,
          riskLevel: level,
          aiAnalysis: generateLocalAnalysis(pattern.type, score, para),
          recommendation: generateLocalRecommendation(pattern.type, score),
        })
        break // One match per paragraph
      }
    }
  }
  return results.sort((a, b) => b.riskScore - a.riskScore)
}

/**
 * AI-powered deep analysis using Claude
 */
export async function analyzeClausesAI(contractText: string): Promise<ClauseAnalysis[]> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return analyzeClausesLocal(contractText)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 4000,
        system: 'You are a construction law attorney reviewing a contract. Identify and analyze risky clauses. For each clause found, return a JSON array of objects with: clauseType, title, originalText (first 200 chars), riskScore (0-100), riskLevel (low/medium/high/critical), aiAnalysis (2-3 sentences), recommendation (1-2 sentences). Focus on: indemnification, liability caps, termination, insurance, warranties, payment terms, IP ownership, and change order processes. Return ONLY valid JSON array.',
        messages: [{ role: 'user', content: 'Analyze this contract for legal risks:\\n\\n' + contractText.slice(0, 8000) }],
      }),
    })
    const data = await res.json()
    const text = data.content?.[0]?.text || '[]'
    return JSON.parse(text.replace(/\`\`\`json|\\n|\`\`\`/g, '').trim())
  } catch {
    return analyzeClausesLocal(contractText)
  }
}

function generateLocalAnalysis(type: string, score: number, text: string): string {
  const analyses: Record<string, string> = {
    indemnification: score > 70 ? 'Broad indemnification clause that may expose Woulf Group to uncapped liability. One-sided indemnification without mutual protections.' : 'Standard indemnification language with reasonable scope.',
    liability_cap: score > 70 ? 'Liability cap may be insufficient relative to contract value. Consider negotiating cap to match contract value or insurance coverage limits.' : 'Liability cap appears proportional to contract value.',
    termination: score > 60 ? 'Termination clause allows counterparty broad termination rights without adequate cure period. Review notice requirements.' : 'Balanced termination provisions with reasonable notice period.',
    insurance: 'Insurance requirements should be cross-referenced with actual COI on file. Verify additional insured status.',
    warranty: score > 60 ? 'Warranty period or scope may exceed industry standard. Review warranty limitations and exclusions.' : 'Standard warranty provisions.',
    payment_terms: score > 60 ? 'Payment terms include retainage above industry standard or extended net terms that impact cash flow.' : 'Payment terms within acceptable range.',
    ip_ownership: 'IP ownership clause should be reviewed to ensure Woulf Group retains rights to proprietary processes and designs.',
    non_compete: 'Non-compete scope and duration should comply with Utah non-compete reform act (effective 2016).',
    force_majeure: 'Force majeure clause present. Verify pandemic/epidemic is included in triggering events.',
    dispute_resolution: 'Review governing law and venue provisions. Ensure disputes resolve in a favorable jurisdiction.',
    change_order: score > 60 ? 'Change order process lacks specificity on pricing methodology and timeline for approval.' : 'Change order provisions appear adequate.',
    confidentiality: 'Standard confidentiality provisions. Verify carve-outs for required disclosures.',
  }
  return analyses[type] || 'Clause identified for review.'
}

function generateLocalRecommendation(type: string, score: number): string {
  const recs: Record<string, string> = {
    indemnification: 'Negotiate mutual indemnification. Cap indemnity at contract value or insurance limits. Add carve-out for gross negligence.',
    liability_cap: 'Set liability cap at minimum 1x contract value. Exclude cap for IP infringement, bodily injury, and willful misconduct.',
    termination: 'Add 30-day cure period for non-material breaches. Include termination for convenience with reasonable wind-down payment.',
    insurance: 'Require COI within 10 business days of execution. Add Woulf Group as additional insured. Require 30-day cancellation notice.',
    warranty: 'Limit warranty to 12 months from substantial completion. Exclude normal wear and tear.',
    payment_terms: 'Negotiate net 30 terms. Cap retainage at 5%. Include prompt payment clause with interest on late payments.',
    ip_ownership: 'Retain ownership of all pre-existing IP. License deliverable-specific IP upon full payment only.',
    non_compete: 'Limit to 1 year and specific geographic radius per Utah law. Ensure consideration is adequate.',
    change_order: 'Require written change orders with cost estimate approval before work begins. Include time impact analysis.',
  }
  return recs[type] || 'Review with outside counsel before execution.'
}
`);

// ============================================================
// 5. SYSTEM PROMPT — Autonomous General Counsel
// ============================================================
write('lib/legal/system-prompt.ts', `// ============================================================================
// LEGAL AGENT SYSTEM PROMPT — Autonomous General Counsel
// ============================================================================

export function getLegalSystemPrompt(context: {
  companyName: string; industry: string; headquarters: string
  activeContracts: number; pendingMatters: number; complianceScore: number
  operatingStates: string[]
}): string {
  return \`You are the Legal Agent for \${context.companyName}, operating as an Autonomous General Counsel & Compliance Officer. You manage \${context.activeContracts} active contracts and \${context.pendingMatters} legal matters, maintaining a \${context.complianceScore}/100 compliance score across operations in \${context.operatingStates.join(', ')}.

## YOUR ROLE
You are the company's protective shield — an autonomous legal operations manager who:
1. Monitors every contract deadline, renewal, and expiration across the organization
2. Scores incoming contracts for risk and recommends specific clause revisions
3. Tracks regulatory compliance across OSHA, DOT, EPA, and state-specific requirements
4. Coordinates with HR (employment law), Ops (construction contracts), and Sales (deal approvals)
5. Drafts legal documents on demand: NDAs, MSAs, SOWs, lien waivers, change orders

## INDUSTRY CONTEXT
\${context.companyName} operates in warehouse automation, industrial construction, and material handling across \${context.operatingStates.join(', ')}. Key legal domains:
- **Construction law**: Mechanic's liens, bond claims, change order disputes, Miller Act compliance
- **OSHA compliance**: General industry (1910) + construction standards (1926), multi-employer doctrine
- **Employment law**: Multi-state wage/hour, non-compete (UT reform act), workers' comp
- **Commercial contracts**: MSAs, subcontractor agreements, equipment leases, SaaS terms
- **Insurance**: CGL, workers' comp, commercial auto, umbrella, builder's risk

## PROACTIVE BEHAVIORS

### Contract Lifecycle Management
- Flag contracts expiring within 90 days with auto-renewal trap alerts
- Score every new contract clause for risk (0-100) with specific revision recommendations
- Track signature status and chase overdue executions
- Monitor change orders against original contract terms

Format: "📋 CONTRACT ALERT: [Contract] with [Counterparty] expires [date]. Auto-renew clause triggers in [X] days. Current liability exposure: $[amount]. Recommended action: [renew/renegotiate/terminate]. [APPROVE ACTION]"

### Compliance Monitoring (Multi-State, Multi-Framework)
Continuously monitor across all 50 states:
- OSHA: Injury logs (300A posting Feb 1-Apr 30), training records, PPE compliance
- DOT: CDL driver qualifications, vehicle inspections, hours of service
- EPA: Hazardous waste, stormwater permits, spill prevention plans
- State licensing: Contractor licenses, business registrations, tax filings
- Insurance: COI expirations for all subcontractors, additional insured verification

Format: "🔴 COMPLIANCE ALERT: [Framework] [Requirement] — [Status]. Due: [Date]. Penalty risk: [Amount]. Action: [Specific step]. [RESOLVE]"

### Risk Scoring for Contract Clauses
When analyzing contracts, score each clause:
- 0-25: Low risk — standard, balanced language
- 26-50: Medium risk — acceptable but worth noting
- 51-75: High risk — recommend revision before execution
- 76-100: Critical risk — do NOT execute without revision

Key risk amplifiers: unlimited liability, sole discretion, waiver of jury trial, one-sided indemnification, no termination for convenience

### Automated Document Drafting
Generate on demand:
- **NDAs**: Mutual, one-way, or construction-specific with carve-outs
- **MSAs**: Full master service agreements with industry-standard terms
- **SOWs**: Scope of work with payment milestones tied to deliverables
- **Lien Waivers**: State-specific conditional/unconditional progress/final
- **Change Orders**: AIA-style with cost breakdown and schedule impact
- **Subcontractor Agreements**: With flow-down clauses from prime contract

### Cross-Agent Compliance Wiring
- **HR Bridge**: Flag when employment handbook needs update for new regulations. Generate termination checklists. Monitor non-compete enforceability.
- **Ops Bridge**: Verify subcontractor insurance before mobilization. Track lien waiver collection per project draw. Flag change orders exceeding 10% of original contract.
- **Sales Bridge**: Review customer contracts before execution. Flag non-standard terms. Approve or reject within SLA.

## DAILY BRIEFING FORMAT
\\\`\\\`\\\`
## ⚖️ Legal Briefing — [Date]

**Compliance Score:** [X]/100
**Active Contracts:** [X] | Expiring <90 days: [X]
**Open Matters:** [X] | Next deadline: [Date]

**Critical Actions:**
1. 🔴 [Urgent legal/compliance item]
2. 🟡 [Expiring contract or deadline]
3. ✅ [Completed item]

**Contract Pipeline:**
- [X] pending signature | [X] in review | [X] expiring soon

**Compliance Watch:**
- OSHA: [Status] | DOT: [Status] | EPA: [Status]
- Insurance certs: [X] active, [X] expiring, [X] expired

**Cross-Agent Alerts:**
- Ops: [lien waiver / insurance status]
- HR: [employment compliance status]
- Sales: [pending contract approvals]
\\\`\\\`\\\`

## TONE
Precise, authoritative, risk-aware. Think like a seasoned in-house counsel who protects the company while enabling business. Always quantify risk in dollars. Never give legal advice without appropriate disclaimers — frame as "risk analysis" and "recommendations for counsel review." Default to caution on compliance matters.

## DISCLAIMER
All analysis is for informational purposes and internal risk assessment. This agent does not constitute legal advice. Recommend outside counsel review for all contracts exceeding $100K and all litigation matters.
\`
}
`);

// ============================================================
// 6. LEGAL DATA ENGINE — Tenant-scoped
// ============================================================
write('lib/legal/legal-data.ts', `// ============================================================================
// LEGAL DATA ENGINE — Tenant-scoped demo data
// ============================================================================

export interface ContractInfo {
  id: string; contractNumber: string; title: string; type: string; category: string
  counterparty: string; status: string; effectiveDate: string; expirationDate: string
  autoRenew: boolean; contractValue: number; liabilityCap: number
  riskScore: number; flaggedClauses: number; signatureStatus: string; projectId?: string
}
export interface ClauseInfo { id: string; contractId: string; contractNumber: string; clauseType: string; title: string; riskScore: number; riskLevel: string; analysis: string; recommendation: string; status: string }
export interface MatterInfo { id: string; matterNumber: string; title: string; type: string; status: string; priority: string; opposingParty: string; nextDeadline: string; nextDeadlineDesc: string; exposure: number; costToDate: number; budgetEstimate: number }
export interface ComplianceItem { id: string; framework: string; requirement: string; status: string; dueDate: string; riskScore: number; responsibleParty: string }
export interface InsuranceCert { id: string; holder: string; holderType: string; policyType: string; carrier: string; expirationDate: string; coverageAmount: number; status: string; additionalInsured: boolean; linkedProject?: string }
export interface LienWaiverInfo { id: string; projectNumber: string; type: string; party: string; throughDate: string; amount: number; status: string }
export interface IPItem { id: string; type: string; name: string; registrationNumber: string; expirationDate: string; status: string; jurisdiction: string }
export interface LicenseInfo { id: string; licenseType: string; name: string; number: string; jurisdiction: string; expirationDate: string; status: string; renewalCost: number }
export interface LegalInsight { id: string; type: string; priority: string; title: string; description: string; impact: string; action: string; status: string }

export interface LegalSnapshot {
  activeContracts: number; pendingSignatures: number; expiringContracts90: number
  openMatters: number; complianceScore: number; totalContractValue: number
  insuranceCertsExpiring: number; pendingLienWaivers: number
  contracts: ContractInfo[]
  flaggedClauses: ClauseInfo[]
  matters: MatterInfo[]
  compliance: ComplianceItem[]
  insurance: InsuranceCert[]
  lienWaivers: LienWaiverInfo[]
  ipRegistry: IPItem[]
  licenses: LicenseInfo[]
  aiInsights: LegalInsight[]
  dailyBriefing: string
  templates: { id: string; name: string; type: string; description: string }[]
}

const TENANT_LEGAL: Record<string, LegalSnapshot> = {
  woulf: {
    activeContracts: 18, pendingSignatures: 3, expiringContracts90: 4,
    openMatters: 2, complianceScore: 88, totalContractValue: 8420000,
    insuranceCertsExpiring: 1, pendingLienWaivers: 2,
    contracts: [
      { id: 'c1', contractNumber: 'CON-2024-008', title: 'Master Service Agreement — Metro Construction LLC', type: 'msa', category: 'customer', counterparty: 'Metro Construction LLC', status: 'active', effectiveDate: '2024-06-01', expirationDate: '2027-05-31', autoRenew: true, contractValue: 2500000, liabilityCap: 2500000, riskScore: 42, flaggedClauses: 3, signatureStatus: 'fully_executed', projectId: 'WG-2026-042' },
      { id: 'c2', contractNumber: 'CON-2025-014', title: 'Subcontractor Agreement — Apex Electrical Services', type: 'subcontract', category: 'subcontractor', counterparty: 'Apex Electrical Services', status: 'active', effectiveDate: '2025-09-01', expirationDate: '2026-08-31', autoRenew: false, contractValue: 180000, liabilityCap: 500000, riskScore: 58, flaggedClauses: 2, signatureStatus: 'fully_executed' },
      { id: 'c3', contractNumber: 'CON-2025-019', title: 'Equipment Lease — JLG Boom Lift #3', type: 'lease', category: 'vendor', counterparty: 'United Rentals', status: 'active', effectiveDate: '2025-11-01', expirationDate: '2026-04-30', autoRenew: true, contractValue: 34200, liabilityCap: 0, riskScore: 28, flaggedClauses: 1, signatureStatus: 'fully_executed' },
      { id: 'c4', contractNumber: 'CON-2026-022', title: 'SOW — Harbor Distribution Dock Retrofit', type: 'sow', category: 'customer', counterparty: 'Harbor Distribution', status: 'pending_signature', effectiveDate: '2026-02-20', expirationDate: '2026-06-30', autoRenew: false, contractValue: 380000, liabilityCap: 380000, riskScore: 35, flaggedClauses: 1, signatureStatus: 'pending' },
      { id: 'c5', contractNumber: 'CON-2026-024', title: 'NDA — Summit Fulfillment (Pre-Bid)', type: 'nda', category: 'customer', counterparty: 'Summit Fulfillment', status: 'pending_signature', effectiveDate: '', expirationDate: '2028-02-28', autoRenew: false, contractValue: 0, liabilityCap: 0, riskScore: 12, flaggedClauses: 0, signatureStatus: 'pending' },
      { id: 'c6', contractNumber: 'CON-2023-003', title: 'Office Lease — 1847 Industrial Blvd', type: 'lease', category: 'landlord', counterparty: 'Gateway Commercial Properties', status: 'active', effectiveDate: '2023-07-01', expirationDate: '2026-06-30', autoRenew: true, contractValue: 216000, liabilityCap: 0, riskScore: 45, flaggedClauses: 2, signatureStatus: 'fully_executed' },
      { id: 'c7', contractNumber: 'CON-2026-025', title: 'MSA — National Grid Fulfillment (Mezzanine)', type: 'msa', category: 'customer', counterparty: 'National Grid Fulfillment', status: 'review', effectiveDate: '', expirationDate: '', autoRenew: false, contractValue: 616000, liabilityCap: 616000, riskScore: 52, flaggedClauses: 4, signatureStatus: 'pending', projectId: 'WG-2026-047' },
    ],
    flaggedClauses: [
      { id: 'cl1', contractId: 'c1', contractNumber: 'CON-2024-008', clauseType: 'indemnification', title: 'Broad Indemnification (§8.1)', riskScore: 72, riskLevel: 'high', analysis: 'One-sided indemnification requiring Woulf Group to defend and hold harmless Metro Construction from all claims including those arising from Metro\'s own negligence.', recommendation: 'Negotiate mutual indemnification. Add carve-out for claims arising from counterparty\'s own negligence or willful misconduct.', status: 'reviewed' },
      { id: 'cl2', contractId: 'c1', contractNumber: 'CON-2024-008', clauseType: 'liability_cap', title: 'Liability Cap at $2.5M (§8.3)', riskScore: 48, riskLevel: 'medium', analysis: 'Liability cap set at contract value ($2.5M) which is appropriate for project scope. Cap excludes IP claims and bodily injury.', recommendation: 'Acceptable. Verify insurance coverage aligns with cap amount.', status: 'accepted' },
      { id: 'cl3', contractId: 'c1', contractNumber: 'CON-2024-008', clauseType: 'change_order', title: 'Change Order Process (§12.2)', riskScore: 62, riskLevel: 'high', analysis: 'Change order process lacks defined timeline for client approval. Woulf may be required to proceed with changes before cost approval is received.', recommendation: 'Add clause: "No changed work shall commence until written cost estimate is approved by both parties within 10 business days."', status: 'flagged' },
      { id: 'cl4', contractId: 'c2', contractNumber: 'CON-2025-014', clauseType: 'insurance', title: 'Insurance Requirements (§5)', riskScore: 55, riskLevel: 'high', analysis: 'Subcontractor insurance minimums ($1M GL, $1M WC) meet baseline but lack umbrella requirement for high-risk electrical work.', recommendation: 'Require $2M umbrella policy for electrical subcontractor work. Add waiver of subrogation clause.', status: 'flagged' },
      { id: 'cl5', contractId: 'c6', contractNumber: 'CON-2023-003', clauseType: 'termination', title: 'Auto-Renewal Trap (§3.2)', riskScore: 68, riskLevel: 'high', analysis: 'Lease auto-renews for 3-year term with 180-day notice requirement. Notice deadline: Dec 31, 2025 — ALREADY PASSED if not sent.', recommendation: 'URGENT: Verify if 180-day non-renewal notice was sent. If not, lease auto-renewed through June 2029. Consult with real estate counsel.', status: 'flagged' },
      { id: 'cl6', contractId: 'c7', contractNumber: 'CON-2026-025', clauseType: 'indemnification', title: 'Mutual Indemnification (§9)', riskScore: 38, riskLevel: 'medium', analysis: 'Mutual indemnification with reasonable scope. Each party indemnifies for their own negligence and breach.', recommendation: 'Acceptable. Standard balanced language.', status: 'accepted' },
    ],
    matters: [
      { id: 'lm1', matterNumber: 'LM-2025-008', title: 'Payment Dispute — Valley Steel Fabricators', type: 'dispute', status: 'active', priority: 'high', opposingParty: 'Valley Steel Fabricators LLC', nextDeadline: '2026-03-15', nextDeadlineDesc: 'Mediation session scheduled', exposure: 145000, costToDate: 12400, budgetEstimate: 35000 },
      { id: 'lm2', matterNumber: 'LM-2026-001', title: 'OSHA Citation — Guardrail Violation (WG-2025-031)', type: 'regulatory', status: 'open', priority: 'normal', opposingParty: 'OSHA Area Office — SLC', nextDeadline: '2026-03-01', nextDeadlineDesc: 'Contest deadline (15 business days)', exposure: 15000, costToDate: 2800, budgetEstimate: 8000 },
    ],
    compliance: [
      { id: 'cp1', framework: 'OSHA', requirement: 'OSHA 300A Log Posting (Feb 1 - Apr 30)', status: 'compliant', dueDate: '2026-04-30', riskScore: 0, responsibleParty: 'Diana Reeves' },
      { id: 'cp2', framework: 'OSHA', requirement: 'Annual Forklift Operator Recertification', status: 'non_compliant', dueDate: '2026-02-28', riskScore: 75, responsibleParty: 'Carlos Ruiz' },
      { id: 'cp3', framework: 'STATE_LICENSE', requirement: 'Utah General Contractor License Renewal', status: 'expiring', dueDate: '2026-05-31', riskScore: 40, responsibleParty: 'Steve Macurdy' },
      { id: 'cp4', framework: 'INSURANCE', requirement: 'Workers Comp Policy Renewal', status: 'compliant', dueDate: '2026-07-01', riskScore: 0, responsibleParty: 'Jess Scharmer' },
      { id: 'cp5', framework: 'EPA', requirement: 'Stormwater Permit — Industrial Facility', status: 'compliant', dueDate: '2026-09-15', riskScore: 0, responsibleParty: 'Diana Reeves' },
      { id: 'cp6', framework: 'TAX', requirement: 'Q1 Estimated Tax Payment (Federal)', status: 'upcoming', dueDate: '2026-04-15', riskScore: 10, responsibleParty: 'Jess Scharmer' },
      { id: 'cp7', framework: 'EMPLOYMENT', requirement: 'Annual Harassment Training Completion', status: 'expiring', dueDate: '2026-03-15', riskScore: 35, responsibleParty: 'Steve Macurdy' },
      { id: 'cp8', framework: 'DOT', requirement: 'Commercial Vehicle Inspection (Annual)', status: 'compliant', dueDate: '2026-08-01', riskScore: 0, responsibleParty: 'Carlos Ruiz' },
    ],
    insurance: [
      { id: 'ins1', holder: 'Apex Electrical Services', holderType: 'subcontractor', policyType: 'General Liability', carrier: 'Hartford', expirationDate: '2026-09-01', coverageAmount: 1000000, status: 'active', additionalInsured: true, linkedProject: 'WG-2026-042' },
      { id: 'ins2', holder: 'Apex Electrical Services', holderType: 'subcontractor', policyType: 'Workers Comp', carrier: 'Hartford', expirationDate: '2026-09-01', coverageAmount: 500000, status: 'active', additionalInsured: false },
      { id: 'ins3', holder: 'Rocky Mountain Concrete', holderType: 'subcontractor', policyType: 'General Liability', carrier: 'Zurich', expirationDate: '2026-02-28', coverageAmount: 2000000, status: 'expiring', additionalInsured: true, linkedProject: 'WG-2026-042' },
      { id: 'ins4', holder: 'Wasatch Welding LLC', holderType: 'subcontractor', policyType: 'General Liability', carrier: 'Liberty Mutual', expirationDate: '2026-12-15', coverageAmount: 1000000, status: 'active', additionalInsured: true },
      { id: 'ins5', holder: 'Woulf Group (Self)', holderType: 'self', policyType: 'Commercial General Liability', carrier: 'Travelers', expirationDate: '2026-07-01', coverageAmount: 5000000, status: 'active', additionalInsured: false },
      { id: 'ins6', holder: 'Woulf Group (Self)', holderType: 'self', policyType: 'Umbrella', carrier: 'Travelers', expirationDate: '2026-07-01', coverageAmount: 10000000, status: 'active', additionalInsured: false },
    ],
    lienWaivers: [
      { id: 'lw1', projectNumber: 'WG-2026-042', type: 'Conditional Progress', party: 'Apex Electrical Services', throughDate: '2026-02-15', amount: 44000, status: 'signed' },
      { id: 'lw2', projectNumber: 'WG-2026-042', type: 'Conditional Progress', party: 'Rocky Mountain Concrete', throughDate: '2026-01-31', amount: 28000, status: 'draft' },
      { id: 'lw3', projectNumber: 'WG-2026-038', type: 'Unconditional Progress', party: 'Unarco Pallet Rack', throughDate: '2026-02-01', amount: 198000, status: 'signed' },
    ],
    ipRegistry: [
      { id: 'ip1', type: 'trademark', name: 'WOULF GROUP', registrationNumber: 'US-6,842,391', expirationDate: '2033-04-12', status: 'active', jurisdiction: 'USPTO' },
      { id: 'ip2', type: 'trademark', name: 'WOULFAI', registrationNumber: 'US-7,104,228', expirationDate: '2035-01-18', status: 'active', jurisdiction: 'USPTO' },
      { id: 'ip3', type: 'domain', name: 'woulfgroup.com', registrationNumber: '', expirationDate: '2027-03-15', status: 'active', jurisdiction: 'ICANN' },
      { id: 'ip4', type: 'domain', name: 'woulfai.com', registrationNumber: '', expirationDate: '2027-03-15', status: 'active', jurisdiction: 'ICANN' },
    ],
    licenses: [
      { id: 'lic1', licenseType: 'contractor', name: 'Utah General Contractor License', number: 'GC-2019-84201', jurisdiction: 'Utah DOPL', expirationDate: '2026-05-31', status: 'active', renewalCost: 200 },
      { id: 'lic2', licenseType: 'business', name: 'Salt Lake City Business License', number: 'BL-2024-19847', jurisdiction: 'SLC', expirationDate: '2026-12-31', status: 'active', renewalCost: 150 },
      { id: 'lic3', licenseType: 'specialty', name: 'Electrical Specialty Contractor', number: 'EC-2022-6104', jurisdiction: 'Utah DOPL', expirationDate: '2026-09-30', status: 'active', renewalCost: 175 },
    ],
    templates: [
      { id: 't1', name: 'Mutual NDA', type: 'nda', description: 'Standard mutual non-disclosure agreement' },
      { id: 't2', name: 'Master Service Agreement', type: 'msa', description: 'Construction/industrial services MSA' },
      { id: 't3', name: 'Scope of Work', type: 'sow', description: 'Project SOW with payment milestones' },
      { id: 't4', name: 'Subcontractor Agreement', type: 'subcontract', description: 'With flow-down clauses and insurance reqs' },
      { id: 't5', name: 'Conditional Lien Waiver (UT)', type: 'lien_waiver', description: 'Utah-specific conditional progress waiver' },
      { id: 't6', name: 'AIA Change Order (G701)', type: 'change_order', description: 'Standard AIA-style change order form' },
      { id: 't7', name: 'Equipment Lease', type: 'lease', description: 'Short-term equipment rental agreement' },
    ],
    aiInsights: [
      { id: 'li1', type: 'insurance', priority: 'critical', title: "🔴 Rocky Mountain Concrete — GL insurance expires Feb 28", description: "Subcontractor's general liability policy expires in 10 days. They are actively working on Metro Conveyor project (WG-042). Cannot remain on site without valid COI.", impact: 'If COI lapses, must remove from site per contract §5.2. Delays concrete anchor work for Sorter phase.', action: 'Send COI renewal request immediately. Draft conditional stop-work notice if not received by Feb 25.', status: 'pending' },
      { id: 'li2', type: 'contract', priority: 'critical', title: '🔴 Office lease auto-renewal trap — verify notice sent', description: 'CON-2023-003 (office lease) has 180-day non-renewal notice requirement. Deadline was Dec 31, 2025. If notice was NOT sent, lease auto-renewed through June 2029 at current rate ($6K/mo).', impact: 'Potential 3-year lease commitment ($216K) without renegotiation opportunity', action: 'Check records for Dec 2025 non-renewal notice. If not sent, engage real estate counsel for early termination options.', status: 'pending' },
      { id: 'li3', type: 'compliance', priority: 'warning', title: '⚠️ OSHA forklift recertification — 2 operators non-compliant', description: 'Cross-referenced with HR Agent: Maria Lopez (expired Dec 2025) and Carlos Ruiz (expiring Feb 28). Both are daily forklift operators. OSHA §1910.178(l) violation risk.', impact: 'Potential OSHA citation: $16,131 per violation (serious). Both employees must be restricted from forklift operation until recertified.', action: 'Coordinate with HR Agent to book recertification training ASAP. Restrict forklift access until completed. Document compliance effort.', status: 'pending' },
      { id: 'li4', type: 'contract', priority: 'warning', title: '🟡 National Grid MSA (CON-2026-025) — 4 clauses flagged', description: 'New MSA in review has 4 flagged clauses including broad indemnification (risk: 72) and vague change order process (risk: 62). Overall contract risk score: 52.', impact: '$616K contract. Unrevised indemnification could expose Woulf Group to uncapped claims from client\'s own negligence.', action: 'Send redline to National Grid: (1) mutual indemnification, (2) add 10-day change order approval timeline, (3) require umbrella policy. Target execution by Feb 28.', status: 'pending' },
      { id: 'li5', type: 'matter', priority: 'info', title: '📋 Valley Steel mediation scheduled March 15', description: 'Payment dispute (LM-2025-008) mediation session confirmed. Exposure: $145K. Legal spend to date: $12.4K of $35K budget.', impact: 'If mediation fails, litigation costs projected at $80-120K. Settlement range: $50-90K would be favorable.', action: 'Prepare mediation brief by March 8. Gather all delivery receipts and signed change orders as evidence. Set settlement authority at $75K.', status: 'pending' },
    ],
    dailyBriefing: "## ⚖️ Legal Briefing — Feb 18, 2026\\n\\n**Compliance Score:** 88/100\\n**Active Contracts:** 18 | Expiring <90 days: 4 | Pending Signature: 3\\n**Open Matters:** 2 | Next deadline: Mar 1 (OSHA contest deadline)\\n\\n**Critical Actions:**\\n1. 🔴 Rocky Mountain Concrete COI expires Feb 28 — send renewal request TODAY\\n2. 🔴 Verify office lease non-renewal notice was sent (Dec 2025 deadline)\\n3. 🟡 National Grid MSA needs redline — 4 flagged clauses\\n\\n**Contract Pipeline:**\\n- Harbor Dock SOW (CON-2026-022): Pending client signature\\n- Summit NDA (CON-2026-024): Pending signature\\n- National Grid MSA (CON-2026-025): In legal review — 4 flags\\n\\n**Compliance Watch:**\\n- OSHA: ⚠️ Forklift recertification non-compliant (2 operators)\\n- Contractor License: Renewal due May 31 — file by April\\n- Insurance: Rocky Mountain Concrete GL expiring Feb 28\\n\\n**Cross-Agent Alerts:**\\n- Ops: 2 lien waivers pending (Metro Conveyor project)\\n- HR: Forklift cert issue mirrors OSHA compliance gap\\n- Sales: Summit Fulfillment NDA pending before bid submission\\n\\n**Litigation:** Valley Steel mediation Mar 15 ($145K exposure, $75K target settlement)",
  },
  _default: {
    activeContracts: 0, pendingSignatures: 0, expiringContracts90: 0,
    openMatters: 0, complianceScore: 0, totalContractValue: 0,
    insuranceCertsExpiring: 0, pendingLienWaivers: 0,
    contracts: [], flaggedClauses: [], matters: [], compliance: [],
    insurance: [], lienWaivers: [], ipRegistry: [], licenses: [],
    aiInsights: [], templates: [],
    dailyBriefing: "Connect your document repository to begin legal management.",
  }
}

export function getLegalData(companyId: string): LegalSnapshot {
  return TENANT_LEGAL[companyId] || TENANT_LEGAL._default
}
`);

// ============================================================
// 7. LEGAL API
// ============================================================
write('app/api/agents/legal/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { getLegalData } from '@/lib/legal/legal-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  const data = getLegalData(companyId)
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    if (action === 'approve_insight') return NextResponse.json({ success: true, message: 'Legal action approved' })
    if (action === 'send_for_signature') return NextResponse.json({ success: true, message: 'Sent to DocuSign for signature' })
    if (action === 'resolve_compliance') return NextResponse.json({ success: true, message: 'Compliance item resolved' })
    if (action === 'accept_clause') return NextResponse.json({ success: true, message: 'Clause accepted' })
    if (action === 'revise_clause') return NextResponse.json({ success: true, message: 'Clause marked for revision' })
    if (action === 'generate_document') return NextResponse.json({ success: true, message: 'Document generated from template' })
    if (action === 'send_coi_request') return NextResponse.json({ success: true, message: 'COI renewal request sent' })
    if (action === 'generate_lien_waiver') return NextResponse.json({ success: true, message: 'Lien waiver generated' })
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
`);

// ============================================================
// 8. LEGAL DASHBOARD — Full 6-tab UI
// ============================================================
write('app/portal/agent/legal/page.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TABS = ['Dashboard', 'Contracts', 'Compliance', 'Clause Review', 'Litigation', 'IP & Licensing']
const C_STAT: Record<string, string> = { draft: 'bg-gray-500/10 text-gray-400', review: 'bg-amber-500/10 text-amber-400', pending_signature: 'bg-purple-500/10 text-purple-400', active: 'bg-emerald-500/10 text-emerald-400', expired: 'bg-rose-500/10 text-rose-400', renewed: 'bg-blue-500/10 text-blue-400' }
const RISK_BG: Record<string, string> = { low: 'bg-emerald-500/10 text-emerald-400', medium: 'bg-amber-500/10 text-amber-400', high: 'bg-rose-500/10 text-rose-400', critical: 'bg-rose-500/20 text-rose-300' }
const COMP_STAT: Record<string, string> = { compliant: 'bg-emerald-500/10 text-emerald-400', non_compliant: 'bg-rose-500/10 text-rose-400', expiring: 'bg-amber-500/10 text-amber-400', upcoming: 'bg-blue-500/10 text-blue-400', pending_review: 'bg-purple-500/10 text-purple-400' }
const INS_STAT: Record<string, string> = { active: 'bg-emerald-500/10 text-emerald-400', expiring: 'bg-amber-500/10 text-amber-400', expired: 'bg-rose-500/10 text-rose-400' }
const PRIO: Record<string, string> = { critical: 'text-rose-400 bg-rose-500/10', warning: 'text-amber-400 bg-amber-500/10', info: 'text-blue-400 bg-blue-500/10', high: 'text-amber-400 bg-amber-500/10', normal: 'text-gray-400 bg-gray-500/10' }
const SEV: Record<string, string> = { critical: 'border-rose-500/20 bg-rose-500/5', warning: 'border-amber-500/20 bg-amber-500/5', info: 'border-blue-500/20 bg-blue-500/5' }

export default function LegalDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState('Dashboard')
  const [toast, setToast] = useState<string | null>(null)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }
  const act = async (action: string, extra?: any) => { await fetch('/api/agents/legal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) }) }

  useEffect(() => {
    try {
      const s = localStorage.getItem('woulfai_session')
      if (!s) { router.replace('/login'); return }
      const p = JSON.parse(s); setUser(p)
      fetch('/api/agents/legal?companyId=' + p.companyId).then(r => r.json()).then(d => { if (d.data) setData(d.data) })
    } catch { router.replace('/login') }
  }, [router])

  if (!user || !data) return <div className="min-h-screen bg-[#060910] flex items-center justify-center text-gray-500">Loading Legal Agent...</div>

  const riskLevel = (s: number) => s >= 76 ? 'critical' : s >= 51 ? 'high' : s >= 26 ? 'medium' : 'low'

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}
      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal')} className="text-xs text-gray-500 hover:text-white">← Portal</button>
            <span className="text-gray-700">|</span><span className="text-xl">⚖️</span><span className="text-sm font-semibold">Legal Agent</span>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] text-emerald-400 font-medium">LIVE</span></div>
          </div>
          <span className="text-xs text-gray-600">{user.companyName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-xs text-gray-400">Legal data scoped to <span className="text-white font-semibold">{user.companyName}</span></span></div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {[
            { l: 'Contracts', v: data.activeContracts, c: 'text-blue-400' },
            { l: 'Pending Sig', v: data.pendingSignatures, c: 'text-purple-400' },
            { l: 'Expiring <90d', v: data.expiringContracts90, c: 'text-amber-400' },
            { l: 'Compliance', v: data.complianceScore + '/100', c: data.complianceScore >= 90 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'Open Matters', v: data.openMatters, c: data.openMatters > 0 ? 'text-amber-400' : 'text-emerald-400' },
            { l: 'Contract $', v: '$' + (data.totalContractValue / 1000000).toFixed(1) + 'M', c: 'text-emerald-400' },
            { l: 'COIs Expiring', v: data.insuranceCertsExpiring, c: data.insuranceCertsExpiring > 0 ? 'text-rose-400' : 'text-emerald-400' },
            { l: 'Lien Waivers', v: data.pendingLienWaivers, c: 'text-cyan-400' },
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

        {/* DASHBOARD */}
        {tab === 'Dashboard' && (<div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">⚖️ Daily Legal Briefing</h3>
            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: data.dailyBriefing.replace(/##\\s/g,'<strong>').replace(/\\*\\*/g,'<strong>').replace(/\\n/g,'<br/>') }} />
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">🤖 Legal Insights ({data.aiInsights.filter((a: any) => a.status === 'pending').length} pending)</h3>
            <div className="space-y-3">{data.aiInsights.filter((a: any) => a.status === 'pending').map((a: any) => (
              <div key={a.id} className={"border rounded-xl p-4 " + (SEV[a.priority] || 'border-white/5')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-semibold">{a.title}</span><span className={"text-[9px] px-1.5 py-0.5 rounded " + (PRIO[a.priority] || '')}>{a.priority}</span></div>
                    <div className="text-xs text-gray-500 mt-1">{a.description}</div><div className="text-xs text-rose-400/70 mt-1">{a.impact}</div><div className="text-xs text-emerald-400/70 mt-1">Action: {a.action}</div></div>
                  <button onClick={() => { act('approve_insight', { id: a.id }); show('✅ Approved'); setData({ ...data, aiInsights: data.aiInsights.map((x: any) => x.id === a.id ? { ...x, status: 'approved' } : x) }) }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 shrink-0">Approve</button>
                </div>
              </div>
            ))}</div>
          </div>
          {/* Templates */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📄 Document Templates</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">{data.templates.map((t: any) => (
              <button key={t.id} onClick={() => { act('generate_document', { templateId: t.id }); show('📄 ' + t.name + ' generated') }} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center hover:border-blue-500/20 hover:bg-blue-500/5 transition-all">
                <div className="text-lg mb-1">📋</div><div className="text-[10px] font-semibold">{t.name}</div><div className="text-[8px] text-gray-600 mt-0.5">{t.type}</div>
              </button>
            ))}</div>
          </div>
        </div>)}

        {/* CONTRACTS */}
        {tab === 'Contracts' && (<div className="space-y-3">{data.contracts.map((c: any) => (
          <div key={c.id} className={"bg-[#0A0E15] border rounded-xl p-4 sm:p-5 " + (c.riskScore > 50 ? 'border-amber-500/20' : 'border-white/5')}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-gray-500">{c.contractNumber}</span>
                <span className={"text-[9px] px-2 py-0.5 rounded " + (C_STAT[c.status] || '')}>{c.status.replace('_',' ')}</span>
                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-500">{c.type.toUpperCase()}</span>
                {c.autoRenew && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Auto-Renew</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className={"text-[10px] px-2 py-0.5 rounded font-medium " + (RISK_BG[riskLevel(c.riskScore)] || '')}>{c.riskScore}/100 risk</div>
                {c.flaggedClauses > 0 && <span className="text-[10px] text-rose-400">⚠️ {c.flaggedClauses} flags</span>}
                {c.status === 'pending_signature' && <button onClick={() => { act('send_for_signature', { contractId: c.id }); show('Sent for signature') }} className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded hover:bg-purple-500/20">Send for Sig →</button>}
              </div>
            </div>
            <div className="text-sm font-semibold">{c.title}</div>
            <div className="text-xs text-gray-500 mt-1">{c.counterparty} • {c.category}</div>
            <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-gray-600">
              {c.contractValue > 0 && <span>Value: ${(c.contractValue / 1000).toFixed(0)}K</span>}
              {c.liabilityCap > 0 && <span>Liability Cap: ${(c.liabilityCap / 1000).toFixed(0)}K</span>}
              <span>Effective: {c.effectiveDate || 'TBD'}</span>
              <span>Expires: {c.expirationDate || 'TBD'}</span>
            </div>
          </div>
        ))}</div>)}

        {/* COMPLIANCE */}
        {tab === 'Compliance' && (<div className="space-y-6">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📊 Regulatory Scoreboard</h3>
            <div className="space-y-2">{data.compliance.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                <div className="flex items-center gap-3"><span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 w-20 text-center">{c.framework}</span><div><div className="text-xs font-medium">{c.requirement}</div><div className="text-[10px] text-gray-600">Due: {c.dueDate} • {c.responsibleParty}</div></div></div>
                <div className="flex items-center gap-2"><span className={"text-[9px] px-2 py-0.5 rounded " + (COMP_STAT[c.status] || '')}>{c.status.replace('_',' ')}</span>
                  {(c.status === 'non_compliant' || c.status === 'expiring') && <button onClick={() => { act('resolve_compliance', { id: c.id }); show('Resolved'); setData({ ...data, compliance: data.compliance.map((x: any) => x.id === c.id ? { ...x, status: 'compliant' } : x) }) }} className="text-[9px] text-emerald-400 hover:underline">Resolve</button>}
                </div>
              </div>
            ))}</div>
          </div>
          {/* Insurance Certs */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">🛡️ Insurance Certificates</h3>
            <div className="space-y-2">{data.insurance.map((ins: any) => (
              <div key={ins.id} className={"flex items-center justify-between py-2 border-b border-white/[0.03] " + (ins.status === 'expiring' ? 'bg-amber-500/5' : '')}>
                <div><div className="text-xs font-medium">{ins.holder}</div><div className="text-[10px] text-gray-500">{ins.policyType} — {ins.carrier} — ${(ins.coverageAmount / 1000000).toFixed(1)}M</div></div>
                <div className="flex items-center gap-2">
                  {ins.additionalInsured && <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">Add'l Insured</span>}
                  <span className="text-[10px] text-gray-500">{ins.expirationDate}</span>
                  <span className={"text-[9px] px-2 py-0.5 rounded " + (INS_STAT[ins.status] || '')}>{ins.status}</span>
                  {ins.status === 'expiring' && <button onClick={() => { act('send_coi_request', { id: ins.id }); show('COI request sent') }} className="text-[9px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded hover:bg-amber-500/20">Request COI</button>}
                </div>
              </div>
            ))}</div>
          </div>
          {/* Lien Waivers */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📜 Lien Waivers</h3>
            <div className="space-y-2">{data.lienWaivers.map((lw: any) => (
              <div key={lw.id} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                <div><div className="text-xs font-medium">{lw.party} — {lw.type}</div><div className="text-[10px] text-gray-500">{lw.projectNumber} • Through {lw.throughDate} • ${lw.amount.toLocaleString()}</div></div>
                <div className="flex items-center gap-2">
                  <span className={"text-[9px] px-2 py-0.5 rounded " + (lw.status === 'signed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>{lw.status}</span>
                  {lw.status === 'draft' && <button onClick={() => { act('generate_lien_waiver', { id: lw.id }); show('Lien waiver sent') }} className="text-[9px] text-blue-400 hover:underline">Send →</button>}
                </div>
              </div>
            ))}</div>
          </div>
        </div>)}

        {/* CLAUSE REVIEW */}
        {tab === 'Clause Review' && (<div className="space-y-3">
          <div className="flex justify-between items-center"><h3 className="text-sm font-semibold">AI Clause Analysis ({data.flaggedClauses.length} clauses reviewed)</h3></div>
          {data.flaggedClauses.map((cl: any) => (
            <div key={cl.id} className={"border rounded-xl p-4 sm:p-5 " + (cl.riskLevel === 'critical' ? 'border-rose-500/20 bg-rose-500/5' : cl.riskLevel === 'high' ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5 bg-[#0A0E15]')}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-mono text-gray-500">{cl.contractNumber}</span><span className="text-sm font-bold">{cl.title}</span><span className={"text-[9px] px-2 py-0.5 rounded font-medium " + (RISK_BG[cl.riskLevel] || '')}>{cl.riskScore}/100</span></div>
                <div className="flex gap-1.5 shrink-0">
                  {cl.status === 'flagged' && <>
                    <button onClick={() => { act('accept_clause', { id: cl.id }); show('Accepted'); setData({ ...data, flaggedClauses: data.flaggedClauses.map((x: any) => x.id === cl.id ? { ...x, status: 'accepted' } : x) }) }} className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Accept</button>
                    <button onClick={() => { act('revise_clause', { id: cl.id }); show('Marked for revision'); setData({ ...data, flaggedClauses: data.flaggedClauses.map((x: any) => x.id === cl.id ? { ...x, status: 'revised' } : x) }) }} className="text-[9px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Revise</button>
                  </>}
                  {cl.status !== 'flagged' && <span className={"text-[9px] px-2 py-0.5 rounded " + (cl.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400')}>{cl.status}</span>}
                </div>
              </div>
              <div className="text-xs text-gray-400 bg-white/[0.02] rounded-lg p-3 mb-2 font-mono leading-relaxed">{cl.analysis}</div>
              <div className="text-xs text-blue-400/80">💡 {cl.recommendation}</div>
            </div>
          ))}
        </div>)}

        {/* LITIGATION */}
        {tab === 'Litigation' && (<div className="space-y-4">{data.matters.map((m: any) => (
          <div key={m.id} className={"bg-[#0A0E15] border rounded-xl p-4 sm:p-5 " + (m.priority === 'high' ? 'border-amber-500/20' : 'border-white/5')}>
            <div className="flex items-center gap-2 mb-2"><span className="text-xs font-mono text-gray-500">{m.matterNumber}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (PRIO[m.priority] || '')}>{m.priority}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (C_STAT[m.status] || 'bg-blue-500/10 text-blue-400')}>{m.status}</span></div>
            <div className="text-sm font-bold">{m.title}</div>
            <div className="text-xs text-gray-500 mt-1">{m.type} • Opposing: {m.opposingParty}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="bg-white/[0.02] rounded-lg p-2"><div className="text-[9px] text-gray-500">Exposure</div><div className="text-sm font-mono text-rose-400">${(m.exposure / 1000).toFixed(0)}K</div></div>
              <div className="bg-white/[0.02] rounded-lg p-2"><div className="text-[9px] text-gray-500">Spend</div><div className="text-sm font-mono">${(m.costToDate / 1000).toFixed(1)}K / ${(m.budgetEstimate / 1000).toFixed(0)}K</div></div>
              <div className="bg-white/[0.02] rounded-lg p-2"><div className="text-[9px] text-gray-500">Next Deadline</div><div className="text-xs font-semibold">{m.nextDeadline}</div></div>
              <div className="bg-white/[0.02] rounded-lg p-2"><div className="text-[9px] text-gray-500">Action</div><div className="text-xs">{m.nextDeadlineDesc}</div></div>
            </div>
          </div>
        ))}</div>)}

        {/* IP & LICENSING */}
        {tab === 'IP & Licensing' && (<div className="space-y-6">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">🏛️ Intellectual Property Registry</h3>
            <div className="space-y-2">{data.ipRegistry.map((ip: any) => (
              <div key={ip.id} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                <div className="flex items-center gap-3"><span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500">{ip.type}</span><div><div className="text-xs font-bold">{ip.name}</div><div className="text-[10px] text-gray-600">{ip.registrationNumber || ip.jurisdiction} • Exp: {ip.expirationDate}</div></div></div>
                <span className={"text-[9px] px-2 py-0.5 rounded " + (ip.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{ip.status}</span>
              </div>
            ))}</div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">📋 Licenses & Registrations</h3>
            <div className="space-y-2">{data.licenses.map((lic: any) => (
              <div key={lic.id} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                <div><div className="text-xs font-medium">{lic.name}</div><div className="text-[10px] text-gray-600">{lic.number} • {lic.jurisdiction} • Exp: {lic.expirationDate}</div></div>
                <div className="flex items-center gap-2"><span className="text-[10px] text-gray-500">${lic.renewalCost}</span><span className={"text-[9px] px-2 py-0.5 rounded " + (lic.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{lic.status}</span></div>
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
console.log('  Installed: 8 files');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('  LEGAL AGENT MODULES:');
console.log('');
console.log('  💾 DATA SCHEMA (10 Prisma models):');
console.log('     Contract, ContractClause, LegalMatter');
console.log('     ComplianceAuditTrail, RegulatoryDeadline');
console.log('     InsuranceCertificate, LienWaiver');
console.log('     IPRegistry, LicenseRenewal');
console.log('');
console.log('  📡 INTEGRATIONS:');
console.log('     DocuSign / HelloSign — e-signature workflows');
console.log('     Ironclad CLM          — contract lifecycle management');
console.log('     HR Bridge             — employment law, termination checklists');
console.log('     Ops Bridge            — construction contracts, lien waivers');
console.log('     Sales Bridge          — contract approval workflows');
console.log('');
console.log('  🧠 AI BRAIN:');
console.log('     Clause Risk Scoring   — 0-100 per clause with revision recs');
console.log('     Pattern + AI analysis — local regex + Claude deep analysis');
console.log('     Compliance Guard      — OSHA/DOT/EPA/state multi-framework');
console.log('     Deadline Prediction   — renewals, expirations, filings');
console.log('     Document Drafting     — 7 templates (NDA, MSA, SOW, etc.)');
console.log('');
console.log('  📊 DASHBOARD (6 tabs at /portal/agent/legal):');
console.log('     Dashboard      — Briefing + AI insights + template library');
console.log('     Contracts      — Lifecycle tracker with risk scores & flags');
console.log('     Compliance     — Regulatory scoreboard + COIs + lien waivers');
console.log('     Clause Review  — AI analysis cards with accept/revise actions');
console.log('     Litigation     — Matter management with budgets & deadlines');
console.log('     IP & Licensing — Trademark/domain registry + state licenses');
console.log('');
console.log('  DEMO DATA:');
console.log('     7 contracts (MSA with $2.5M cap, subcontract, leases, SOWs)');
console.log('     6 flagged clauses (indemnification 72, change order 62, etc.)');
console.log('     2 legal matters (payment dispute + OSHA citation)');
console.log('     8 compliance items, 6 insurance certs, 3 lien waivers');
console.log('     4 IP registrations, 3 licenses, 7 document templates');
console.log('     5 AI insights including auto-renewal trap detection');
console.log('');
console.log('  INSTALL & DEPLOY:');
console.log('    node legal-agent.js');
console.log('    npm run build');
console.log('    vercel --prod');
console.log('');
