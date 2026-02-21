#!/usr/bin/env node
/**
 * HR AGENT — Full Production Module for WoulfAI
 *
 * Components:
 *   1.  lib/hr/schema.prisma            — Employee, Department, TimeEntry, PTO, Jobs, Applicants, Reviews
 *   2.  lib/hr/odoo-sync.ts             — Odoo HR/Leave/Attendance connector
 *   3.  lib/hr/payroll-adapter.ts       — ADP/Gusto stubs + Checkr background checks
 *   4.  lib/hr/recruitment-adapter.ts   — Indeed/LinkedIn + DocuSign/HelloSign
 *   5.  lib/hr/onboarding-engine.ts     — Mobile onboarding link generator + OCR + e-sign
 *   6.  lib/hr/system-prompt.ts         — Proactive HR Manager AI brain
 *   7.  lib/hr/hr-data.ts              — Tenant-scoped demo data engine
 *   8.  app/api/agents/hr/route.ts      — HR agent API endpoints
 *   9.  app/api/onboarding/[token]/route.ts — Public onboarding API
 *  10.  app/portal/agent/hr/page.tsx    — Full 6-tab HR dashboard
 *  11.  app/onboarding/[token]/page.tsx — Mobile-first onboarding experience
 *
 * Usage: node hr-agent.js
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
console.log('  ║  HR AGENT — Full Employee Lifecycle + Mobile Onboarding         ║');
console.log('  ╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. PRISMA SCHEMA
// ============================================================
write('lib/hr/schema.prisma', `// ============================================================================
// HR DATA SCHEMA — Full employee lifecycle
// ============================================================================

model Department {
  id          String   @id @default(cuid())
  companyId   String
  name        String
  managerId   String?
  managerName String?
  headcount   Int      @default(0)
  budget      Float?
  costCenter  String?
  createdAt   DateTime @default(now())
  @@index([companyId])
}

model Employee {
  id              String   @id @default(cuid())
  companyId       String
  employeeNumber  String
  firstName       String
  lastName        String
  email           String
  phone           String?
  title           String
  department      String
  managerId       String?
  managerName     String?
  location        String?
  startDate       String
  status          String   @default("active")  // active | onboarding | leave | terminated
  type            String   @default("full_time") // full_time | part_time | contractor | intern
  salary          Float?
  payFrequency    String?  // biweekly | monthly | semimonthly
  photoUrl        String?
  // Emergency contact
  emergencyName   String?
  emergencyPhone  String?
  emergencyRelation String?
  // Bank / direct deposit
  bankName        String?
  routingNumber   String?  // encrypted in production
  accountNumber   String?  // encrypted in production
  accountType     String?  // checking | savings
  // Compliance
  i9Completed     Boolean  @default(false)
  w4Completed     Boolean  @default(false)
  handbookSigned  Boolean  @default(false)
  bgCheckStatus   String?  // pending | clear | flagged
  // Certifications
  certifications  Json?    // [{ name, expiresAt, status }]
  // Sentiment / risk
  flightRisk      String   @default("low")  // low | medium | high
  lastReviewScore Float?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([companyId, department])
  @@index([companyId, status])
}

model TimeEntry {
  id          String   @id @default(cuid())
  companyId   String
  employeeId  String
  employeeName String
  date        String
  clockIn     String?   // HH:mm
  clockOut    String?
  hoursWorked Float     @default(0)
  overtime    Float     @default(0)
  status      String    @default("pending")  // pending | approved | rejected
  approvedBy  String?
  notes       String?
  createdAt   DateTime  @default(now())
  @@index([companyId, employeeId, date])
}

model PTOBalance {
  id          String   @id @default(cuid())
  companyId   String
  employeeId  String
  employeeName String
  type        String   // vacation | sick | personal | floating
  totalDays   Float
  usedDays    Float    @default(0)
  pendingDays Float    @default(0)
  remaining   Float    // totalDays - usedDays - pendingDays
  requests    Json?    // [{ startDate, endDate, days, status, reason }]
  @@index([companyId, employeeId])
}

model JobPosting {
  id            String   @id @default(cuid())
  companyId     String
  title         String
  department    String
  location      String
  type          String   // full_time | part_time | contract
  salaryMin     Float?
  salaryMax     Float?
  description   String?  @db.Text
  requirements  String?  @db.Text
  status        String   @default("draft")  // draft | open | closed | filled
  postedTo      Json?    // ['indeed', 'linkedin', 'website']
  applicantCount Int     @default(0)
  createdAt     DateTime @default(now())
  closedAt      DateTime?
  @@index([companyId, status])
}

model Applicant {
  id            String   @id @default(cuid())
  companyId     String
  jobPostingId  String
  name          String
  email         String
  phone         String?
  resumeUrl     String?
  stage         String   @default("applied")  // applied | screening | interview | offer | hired | rejected
  rating        Int?     // 1-5
  notes         String?  @db.Text
  interviewDate DateTime?
  offerAmount   Float?
  offerStatus   String?  // pending | accepted | declined
  source        String?  // indeed | linkedin | referral | website
  createdAt     DateTime @default(now())
  @@index([companyId, jobPostingId, stage])
}

model ReviewCycle {
  id            String   @id @default(cuid())
  companyId     String
  employeeId    String
  employeeName  String
  reviewerId    String?
  reviewerName  String?
  period        String   // "Q1 2026" | "Annual 2025"
  type          String   // quarterly | annual | 360 | probation
  status        String   @default("pending")  // pending | in_progress | completed
  overallScore  Float?   // 1-5
  goals         Json?    // [{ goal, weight, score, comment }]
  strengths     String?  @db.Text
  improvements  String?  @db.Text
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  @@index([companyId, employeeId])
}

model OnboardingSession {
  id            String   @id @default(cuid())
  companyId     String
  employeeId    String
  token         String   @unique
  employeeName  String
  employeeEmail String
  status        String   @default("pending")  // pending | in_progress | completed
  steps         Json     // [{ id, label, status, completedAt }]
  progress      Int      @default(0)  // 0-100
  expiresAt     DateTime
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  @@index([token])
  @@index([companyId, status])
}
`);

// ============================================================
// 2. ODOO HR SYNC
// ============================================================
write('lib/hr/odoo-sync.ts', `// ============================================================================
// ODOO HR CONNECTOR — Sync employees, leave, and attendance
// ============================================================================
// Requires: ODOO_URL, ODOO_DB, ODOO_API_KEY env vars

export class OdooHRClient {
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
    if (data.error) throw new Error(data.error.message || 'Odoo RPC error')
    return data.result
  }

  private async auth(): Promise<number> {
    if (this.uid) return this.uid
    const r = await this.rpc('/web/session/authenticate', { db: this.db, login: 'api', password: this.apiKey })
    this.uid = r.uid; return this.uid!
  }

  async getEmployees(limit = 200) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.employee', method: 'search_read', args: [[]],
      kwargs: { fields: ['name', 'work_email', 'job_title', 'department_id', 'parent_id', 'work_phone', 'birthday', 'identification_id', 'company_id'], limit },
    })
  }

  async getLeaveRequests(state?: string) {
    await this.auth()
    const domain = state ? [['state', '=', state]] : []
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.leave', method: 'search_read', args: [domain],
      kwargs: { fields: ['employee_id', 'holiday_status_id', 'date_from', 'date_to', 'number_of_days', 'state', 'name'], limit: 100 },
    })
  }

  async getAttendance(employeeId?: number, days = 30) {
    await this.auth()
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
    const domain: any[] = [['check_in', '>=', since]]
    if (employeeId) domain.push(['employee_id', '=', employeeId])
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.attendance', method: 'search_read', args: [domain],
      kwargs: { fields: ['employee_id', 'check_in', 'check_out', 'worked_hours'], limit: 500 },
    })
  }

  async getDepartments() {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.department', method: 'search_read', args: [[]],
      kwargs: { fields: ['name', 'manager_id', 'member_ids', 'company_id'], limit: 50 },
    })
  }

  async approveLeave(leaveId: number) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.leave', method: 'action_approve', args: [[leaveId]], kwargs: {},
    })
  }
}

export function createOdooHRClient(): OdooHRClient | null {
  const url = process.env.ODOO_URL, db = process.env.ODOO_DB, key = process.env.ODOO_API_KEY
  if (!url || !db || !key) return null
  return new OdooHRClient(url, db, key)
}
`);

// ============================================================
// 3. PAYROLL & BENEFITS ADAPTERS
// ============================================================
write('lib/hr/payroll-adapter.ts', `// ============================================================================
// PAYROLL & BENEFITS — ADP/Gusto + Checkr background checks
// ============================================================================

// --- ADP PAYROLL ---
export class ADPClient {
  private clientId: string; private clientSecret: string

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId; this.clientSecret = clientSecret
  }

  async getWorkers(): Promise<any[]> {
    const token = await this.getToken()
    const res = await fetch('https://api.adp.com/hr/v2/workers', {
      headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    return data.workers || []
  }

  async getPayStatements(workerId: string): Promise<any[]> {
    const token = await this.getToken()
    const res = await fetch(\`https://api.adp.com/payroll/v1/workers/\${workerId}/pay-statements\`, {
      headers: { 'Authorization': \`Bearer \${token}\` },
    })
    const data = await res.json()
    return data.payStatements || []
  }

  private async getToken(): Promise<string> {
    const res = await fetch('https://accounts.adp.com/auth/oauth/v2/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: \`grant_type=client_credentials&client_id=\${this.clientId}&client_secret=\${this.clientSecret}\`,
    })
    const data = await res.json()
    return data.access_token
  }
}

// --- GUSTO PAYROLL ---
export class GustoClient {
  private accessToken: string

  constructor(accessToken: string) { this.accessToken = accessToken }

  async getEmployees(companyId: string): Promise<any[]> {
    const res = await fetch(\`https://api.gusto.com/v1/companies/\${companyId}/employees\`, {
      headers: { 'Authorization': \`Bearer \${this.accessToken}\` },
    })
    return res.json()
  }

  async getPayrolls(companyId: string): Promise<any[]> {
    const res = await fetch(\`https://api.gusto.com/v1/companies/\${companyId}/payrolls\`, {
      headers: { 'Authorization': \`Bearer \${this.accessToken}\` },
    })
    return res.json()
  }
}

// --- CHECKR BACKGROUND CHECKS ---
export class CheckrClient {
  private apiKey: string

  constructor(apiKey: string) { this.apiKey = apiKey }

  async createCandidate(data: { firstName: string; lastName: string; email: string; dob?: string; ssn?: string }): Promise<{ id: string }> {
    const res = await fetch('https://api.checkr.com/v1/candidates', {
      method: 'POST',
      headers: { 'Authorization': \`Basic \${btoa(this.apiKey + ':')}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: data.firstName, last_name: data.lastName, email: data.email, dob: data.dob, ssn: data.ssn }),
    })
    return res.json()
  }

  async createInvitation(candidateId: string, packageSlug: string = 'tasker_standard'): Promise<{ id: string; invitation_url: string }> {
    const res = await fetch('https://api.checkr.com/v1/invitations', {
      method: 'POST',
      headers: { 'Authorization': \`Basic \${btoa(this.apiKey + ':')}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, package: packageSlug }),
    })
    return res.json()
  }

  async getReport(reportId: string): Promise<any> {
    const res = await fetch(\`https://api.checkr.com/v1/reports/\${reportId}\`, {
      headers: { 'Authorization': \`Basic \${btoa(this.apiKey + ':')}\` },
    })
    return res.json()
  }
}

export function createADPClient(): ADPClient | null {
  const id = process.env.ADP_CLIENT_ID, secret = process.env.ADP_CLIENT_SECRET
  if (!id || !secret) return null
  return new ADPClient(id, secret)
}
export function createGustoClient(): GustoClient | null {
  const token = process.env.GUSTO_ACCESS_TOKEN
  if (!token) return null
  return new GustoClient(token)
}
export function createCheckrClient(): CheckrClient | null {
  const key = process.env.CHECKR_API_KEY
  if (!key) return null
  return new CheckrClient(key)
}
`);

// ============================================================
// 4. RECRUITMENT ADAPTER
// ============================================================
write('lib/hr/recruitment-adapter.ts', `// ============================================================================
// RECRUITMENT — Job boards + E-signature
// ============================================================================

// --- INDEED ---
export class IndeedClient {
  private employerId: string; private apiKey: string

  constructor(employerId: string, apiKey: string) {
    this.employerId = employerId; this.apiKey = apiKey
  }

  async postJob(job: { title: string; description: string; location: string; salary?: string; type: string }): Promise<{ success: boolean; jobKey?: string }> {
    const res = await fetch('https://apis.indeed.com/v2/jobs', {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.apiKey}\`, 'Content-Type': 'application/json', 'Indeed-Employer-ID': this.employerId },
      body: JSON.stringify({ title: job.title, description: job.description, location: { city: job.location }, compensation: job.salary ? { range: { min: job.salary } } : undefined, employmentType: job.type }),
    })
    const data = await res.json()
    return { success: res.ok, jobKey: data.jobKey }
  }
}

// --- LINKEDIN JOBS ---
export class LinkedInJobsClient {
  private accessToken: string; private orgId: string

  constructor(accessToken: string, orgId: string) {
    this.accessToken = accessToken; this.orgId = orgId
  }

  async postJob(job: { title: string; description: string; location: string }): Promise<{ success: boolean; postId?: string }> {
    const res = await fetch('https://api.linkedin.com/v2/simpleJobPostings', {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.accessToken}\`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify({
        integrationContext: \`urn:li:organization:\${this.orgId}\`,
        jobPostingOperationType: 'CREATE',
        title: job.title, description: { text: job.description },
        location: job.location, listedAt: Date.now(),
      }),
    })
    return { success: res.ok, postId: res.ok ? 'posted' : undefined }
  }
}

// --- DOCUSIGN E-SIGNATURE ---
export class DocuSignClient {
  private accessToken: string; private accountId: string

  constructor(accessToken: string, accountId: string) {
    this.accessToken = accessToken; this.accountId = accountId
  }

  async sendEnvelope(params: { signerEmail: string; signerName: string; documentBase64: string; documentName: string; subject: string }): Promise<{ envelopeId?: string; success: boolean }> {
    const res = await fetch(\`https://demo.docusign.net/restapi/v2.1/accounts/\${this.accountId}/envelopes\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.accessToken}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailSubject: params.subject,
        documents: [{ documentBase64: params.documentBase64, name: params.documentName, fileExtension: 'pdf', documentId: '1' }],
        recipients: { signers: [{ email: params.signerEmail, name: params.signerName, recipientId: '1', routingOrder: '1', tabs: { signHereTabs: [{ xPosition: '200', yPosition: '700', documentId: '1', pageNumber: '1' }] } }] },
        status: 'sent',
      }),
    })
    const data = await res.json()
    return { success: res.ok, envelopeId: data.envelopeId }
  }
}

export function createIndeedClient(): IndeedClient | null {
  const id = process.env.INDEED_EMPLOYER_ID, key = process.env.INDEED_API_KEY
  if (!id || !key) return null; return new IndeedClient(id, key)
}
export function createDocuSignClient(): DocuSignClient | null {
  const token = process.env.DOCUSIGN_ACCESS_TOKEN, acct = process.env.DOCUSIGN_ACCOUNT_ID
  if (!token || !acct) return null; return new DocuSignClient(token, acct)
}
`);

// ============================================================
// 5. MOBILE ONBOARDING ENGINE
// ============================================================
write('lib/hr/onboarding-engine.ts', `// ============================================================================
// MOBILE ONBOARDING ENGINE — Link generator, OCR, e-sign, photo capture
// ============================================================================

export interface OnboardingStep {
  id: string; label: string; description: string; type: 'form' | 'upload' | 'sign' | 'review'
  required: boolean; status: 'pending' | 'in_progress' | 'completed'
  completedAt?: string
}

export interface OnboardingConfig {
  steps: OnboardingStep[]
  companyName: string
  companyLogo?: string
  welcomeMessage: string
}

export const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'welcome', label: 'Welcome & Verify Email', description: 'Confirm your identity and review your offer details', type: 'review', required: true, status: 'pending' },
  { id: 'personal', label: 'Personal Information', description: 'Name, address, date of birth, SSN (encrypted)', type: 'form', required: true, status: 'pending' },
  { id: 'id_scan', label: 'ID Verification', description: 'Scan your Driver License or Passport — AI auto-fills your details', type: 'upload', required: true, status: 'pending' },
  { id: 'photo', label: 'Profile Photo', description: 'Take or upload a headshot for your employee directory', type: 'upload', required: true, status: 'pending' },
  { id: 'emergency', label: 'Emergency Contacts', description: 'Add at least one emergency contact', type: 'form', required: true, status: 'pending' },
  { id: 'banking', label: 'Direct Deposit', description: 'Bank routing and account number for payroll', type: 'form', required: true, status: 'pending' },
  { id: 'w4', label: 'W-4 Tax Withholding', description: 'Federal tax withholding elections', type: 'form', required: true, status: 'pending' },
  { id: 'i9', label: 'I-9 Employment Eligibility', description: 'Section 1 — employer completes Section 2 on Day 1', type: 'form', required: true, status: 'pending' },
  { id: 'handbook', label: 'Employee Handbook', description: 'Review and sign the company handbook', type: 'sign', required: true, status: 'pending' },
  { id: 'policies', label: 'Policy Acknowledgments', description: 'Safety policy, IT usage, anti-harassment', type: 'sign', required: true, status: 'pending' },
  { id: 'benefits', label: 'Benefits Election', description: 'Health, dental, vision, 401K enrollment (if eligible)', type: 'form', required: false, status: 'pending' },
  { id: 'complete', label: 'Onboarding Complete', description: 'All set — welcome to the team!', type: 'review', required: true, status: 'pending' },
]

/**
 * Generate a unique onboarding link
 */
export function generateOnboardingToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < 32; i++) token += chars[Math.floor(Math.random() * chars.length)]
  return token
}

/**
 * OCR ID Scanning — extracts data from driver license / passport image
 * In production: calls Google Vision API or AWS Textract
 */
export async function scanIdDocument(imageBase64: string): Promise<{
  firstName?: string; lastName?: string; dateOfBirth?: string
  address?: string; documentNumber?: string; expirationDate?: string
  documentType?: 'drivers_license' | 'passport'; confidence: number
}> {
  // Production: Google Vision API
  const visionKey = process.env.GOOGLE_VISION_API_KEY
  if (visionKey) {
    try {
      const res = await fetch(\`https://vision.googleapis.com/v1/images:annotate?key=\${visionKey}\`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: [{ image: { content: imageBase64 }, features: [{ type: 'TEXT_DETECTION' }, { type: 'DOCUMENT_TEXT_DETECTION' }] }] }),
      })
      const data = await res.json()
      const text = data.responses?.[0]?.fullTextAnnotation?.text || ''
      return parseIdText(text)
    } catch {}
  }

  // Fallback: Claude Vision
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': anthropicKey, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 500,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: 'Extract from this ID document: firstName, lastName, dateOfBirth (YYYY-MM-DD), address, documentNumber, expirationDate, documentType (drivers_license or passport). Return ONLY valid JSON, no markdown.' }
          ] }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || '{}'
      const parsed = JSON.parse(text.replace(/\`\`\`json|\\n|\`\`\`/g, '').trim())
      return { ...parsed, confidence: 0.85 }
    } catch {}
  }

  return { confidence: 0 }
}

function parseIdText(text: string): any {
  // Basic regex parsing for common ID formats
  const lines = text.split('\\n').map(l => l.trim()).filter(Boolean)
  return {
    firstName: lines.find(l => /^[A-Z]{2,20}$/.test(l))?.toLowerCase().replace(/^./, c => c.toUpperCase()),
    confidence: 0.6,
  }
}

/**
 * Calculate onboarding progress
 */
export function calculateProgress(steps: OnboardingStep[]): number {
  const required = steps.filter(s => s.required)
  const completed = required.filter(s => s.status === 'completed')
  return Math.round((completed.length / required.length) * 100)
}
`);

// ============================================================
// 6. SYSTEM PROMPT — Proactive HR Manager
// ============================================================
write('lib/hr/system-prompt.ts', `// ============================================================================
// HR AGENT SYSTEM PROMPT — Proactive HR Manager
// ============================================================================

export function getHrSystemPrompt(context: {
  companyName: string; headcount: number; departments: string[]
  openPositions: number; onboardingActive: number
  metrics?: { turnoverRate: number; avgTenure: number; ptoUtilization: number; complianceScore: number }
}): string {
  return \`You are the HR Agent for \${context.companyName}, operating as a Proactive HR Manager. You manage \${context.headcount} employees across \${context.departments.length} departments with \${context.openPositions} open positions and \${context.onboardingActive} people currently onboarding.

## YOUR ROLE
You are an autonomous HR operations manager who:
1. Monitors compliance and flags risks BEFORE they become problems
2. Predicts attrition and recommends retention actions
3. Automates document generation (offer letters, job descriptions, reviews)
4. Manages the full employee lifecycle from recruiting through offboarding

## CURRENT STATE
\${context.metrics ? \`- Turnover Rate: \${context.metrics.turnoverRate}% (annualized)
- Average Tenure: \${context.metrics.avgTenure} years
- PTO Utilization: \${context.metrics.ptoUtilization}%
- Compliance Score: \${context.metrics.complianceScore}/100\` : '- Metrics: Awaiting data sync'}

## PROACTIVE BEHAVIORS

### Attrition Risk Prediction
Analyze these signals to flag flight risks:
- Low review scores (< 3.0) combined with no raise in 12+ months
- PTO usage spike (using all remaining PTO rapidly)
- Attendance irregularities (late arrivals increasing)
- Tenure milestones (2-year and 5-year marks are high-risk)
- Market salary gap (current salary vs market rate)

Format: "🔴 FLIGHT RISK: [Name] in [Department] — [signals detected]. Recommended retention action: [specific action]. Estimated replacement cost: $[amount]."

### Compliance Guard
Continuously monitor:
- I-9 completion: Must be done by Day 3 of employment. Flag on Day 1.
- Expiring certifications: Alert 60 days before expiry
- Overdue performance reviews: Flag when 30+ days past schedule
- Mandatory training: Annual harassment training, safety certs
- Work authorization expiry: Flag 90 days before

Format: "🟡 COMPLIANCE ALERT: [Name]'s [certification] expires on [date]. I have drafted a renewal reminder email. [SEND]"

### Automated Drafting
On demand, generate:
- Job descriptions from 3-5 bullet points → full professional JD
- Offer letters with salary, start date, benefits summary
- Performance review templates pre-filled with employee data
- PIP documentation when performance issues are noted
- Exit interview questionnaires

### Workforce Planning
Based on department workload trends:
- Flag departments with > 10% overtime sustained for 4+ weeks
- Recommend headcount when workload/employee ratio exceeds threshold
- Suggest rebalancing when teams are understaffed vs overstaffed

## DAILY BRIEFING FORMAT
\`\`\`
## 👥 HR Briefing — [Date]

**Headcount:** [X] active | [X] onboarding | [X] open positions
**Compliance Score:** [X]/100

**Today's Priorities:**
1. [Urgent compliance item]
2. [Onboarding check-in]
3. [PTO request to approve]

**Attrition Alerts:**
🔴 [High-risk employee and recommended action]

**Onboarding Status:**
- [Name]: [X]% complete — next step: [step]

**Upcoming:**
- [Certification expiry, review deadline, etc.]
\`\`\`

## TONE
Empathetic but operationally efficient. HR requires both warmth and precision. Lead with people impact, back with compliance data. Never compromise on privacy — all sensitive data references use employee ID, not SSN or bank details.
\`
}
`);

// ============================================================
// 7. HR DATA ENGINE — Tenant-scoped
// ============================================================
write('lib/hr/hr-data.ts', `// ============================================================================
// HR DATA ENGINE — Tenant-scoped demo data
// ============================================================================

export interface Employee {
  id: string; employeeNumber: string; name: string; email: string; title: string
  department: string; manager: string; location: string; startDate: string
  status: 'active' | 'onboarding' | 'leave' | 'terminated'; type: string
  salary: number; photoUrl?: string; flightRisk: 'low' | 'medium' | 'high'
  reviewScore?: number; i9: boolean; w4: boolean; handbook: boolean; bgCheck: string
  certs: { name: string; expires: string; status: 'valid' | 'expiring' | 'expired' }[]
}

export interface DepartmentInfo { name: string; headcount: number; manager: string; budget: number; openRoles: number }
export interface TimeRecord { employeeId: string; name: string; date: string; clockIn: string; clockOut: string; hours: number; overtime: number; status: string }
export interface PTOEntry { employeeId: string; name: string; type: string; total: number; used: number; pending: number; remaining: number }
export interface JobPost { id: string; title: string; department: string; location: string; type: string; salaryRange: string; status: string; applicants: number; posted: string[]; daysOpen: number }
export interface ApplicantInfo { id: string; jobId: string; name: string; email: string; stage: string; rating: number; source: string; appliedDate: string; interviewDate?: string }
export interface ReviewInfo { employeeId: string; name: string; period: string; type: string; status: string; score?: number; reviewer: string }
export interface OnboardingInfo { id: string; name: string; email: string; startDate: string; progress: number; currentStep: string; token: string; daysUntilStart: number }
export interface ComplianceAlert { id: string; type: string; severity: 'critical' | 'warning' | 'info'; title: string; description: string; dueDate?: string; employee?: string; status: 'open' | 'resolved' }

export interface HRSnapshot {
  headcount: number; onboardingCount: number; openPositions: number; turnoverRate: number
  avgTenure: number; complianceScore: number; ptoUtilization: number
  departments: DepartmentInfo[]; employees: Employee[]
  timeRecords: TimeRecord[]; ptoBalances: PTOEntry[]
  jobPostings: JobPost[]; applicants: ApplicantInfo[]
  reviews: ReviewInfo[]; onboarding: OnboardingInfo[]
  complianceAlerts: ComplianceAlert[]
  aiInsights: { id: string; type: string; priority: string; title: string; description: string; action: string; status: string }[]
  dailyBriefing: string
}

const TENANT_HR: Record<string, HRSnapshot> = {
  woulf: {
    headcount: 34, onboardingCount: 2, openPositions: 3, turnoverRate: 8.2,
    avgTenure: 3.4, complianceScore: 91, ptoUtilization: 68,
    departments: [
      { name: 'Operations', headcount: 12, manager: 'Diana Reeves', budget: 890000, openRoles: 1 },
      { name: 'Sales', headcount: 8, manager: 'Marcus Williams', budget: 620000, openRoles: 1 },
      { name: 'Engineering', headcount: 6, manager: 'Jason Park', budget: 540000, openRoles: 1 },
      { name: 'Finance', headcount: 4, manager: 'Jess Scharmer', budget: 320000, openRoles: 0 },
      { name: 'Admin', headcount: 4, manager: 'Steve Macurdy', budget: 280000, openRoles: 0 },
    ],
    employees: [
      { id: 'e1', employeeNumber: 'WG-001', name: 'Steve Macurdy', email: 'steve@woulfgroup.com', title: 'CEO', department: 'Admin', manager: '—', location: 'Salt Lake City', startDate: '2020-03-15', status: 'active', type: 'Full-time', salary: 185000, flightRisk: 'low', reviewScore: 4.8, i9: true, w4: true, handbook: true, bgCheck: 'clear', certs: [] },
      { id: 'e2', employeeNumber: 'WG-004', name: 'Marcus Williams', email: 'marcus@woulfgroup.com', title: 'VP Sales', department: 'Sales', manager: 'Steve Macurdy', location: 'Salt Lake City', startDate: '2021-06-01', status: 'active', type: 'Full-time', salary: 142000, flightRisk: 'low', reviewScore: 4.2, i9: true, w4: true, handbook: true, bgCheck: 'clear', certs: [{ name: 'HubSpot Sales Cert', expires: '2026-08-15', status: 'valid' }] },
      { id: 'e3', employeeNumber: 'WG-006', name: 'Diana Reeves', email: 'diana@woulfgroup.com', title: 'Operations Director', department: 'Operations', manager: 'Steve Macurdy', location: 'Salt Lake City', startDate: '2021-01-10', status: 'active', type: 'Full-time', salary: 128000, flightRisk: 'low', reviewScore: 4.5, i9: true, w4: true, handbook: true, bgCheck: 'clear', certs: [{ name: 'OSHA 30', expires: '2026-04-22', status: 'valid' }, { name: 'PMP', expires: '2027-01-15', status: 'valid' }] },
      { id: 'e4', employeeNumber: 'WG-008', name: 'Jason Park', email: 'jason@woulfgroup.com', title: 'Engineering Lead', department: 'Engineering', manager: 'Steve Macurdy', location: 'Salt Lake City', startDate: '2022-03-01', status: 'active', type: 'Full-time', salary: 135000, flightRisk: 'medium', reviewScore: 3.8, i9: true, w4: true, handbook: true, bgCheck: 'clear', certs: [{ name: 'AWS Solutions Architect', expires: '2026-03-10', status: 'expiring' }] },
      { id: 'e5', employeeNumber: 'WG-011', name: 'Jess Scharmer', email: 'jess@woulfgroup.com', title: 'Finance Manager', department: 'Finance', manager: 'Steve Macurdy', location: 'Salt Lake City', startDate: '2023-08-14', status: 'active', type: 'Full-time', salary: 98000, flightRisk: 'low', reviewScore: 4.6, i9: true, w4: true, handbook: true, bgCheck: 'clear', certs: [{ name: 'CPA', expires: '2027-06-30', status: 'valid' }] },
      { id: 'e6', employeeNumber: 'WG-015', name: 'Carlos Ruiz', email: 'carlos@woulfgroup.com', title: 'Warehouse Supervisor', department: 'Operations', manager: 'Diana Reeves', location: 'Salt Lake City', startDate: '2022-09-05', status: 'active', type: 'Full-time', salary: 72000, flightRisk: 'medium', reviewScore: 3.2, i9: true, w4: true, handbook: true, bgCheck: 'clear', certs: [{ name: 'Forklift Operator', expires: '2026-02-28', status: 'expiring' }, { name: 'OSHA 10', expires: '2026-09-15', status: 'valid' }] },
      { id: 'e7', employeeNumber: 'WG-019', name: 'Maria Lopez', email: 'maria@woulfgroup.com', title: 'Picker/Packer', department: 'Operations', manager: 'Carlos Ruiz', location: 'Salt Lake City', startDate: '2024-01-22', status: 'active', type: 'Full-time', salary: 44000, flightRisk: 'high', reviewScore: 2.8, i9: true, w4: true, handbook: true, bgCheck: 'clear', certs: [{ name: 'Forklift Operator', expires: '2025-12-01', status: 'expired' }] },
      { id: 'e8', employeeNumber: 'WG-022', name: 'Tyler Jensen', email: 'tyler@woulfgroup.com', title: 'Sales Rep', department: 'Sales', manager: 'Marcus Williams', location: 'Remote', startDate: '2024-11-04', status: 'active', type: 'Full-time', salary: 65000, flightRisk: 'low', reviewScore: undefined, i9: true, w4: true, handbook: true, bgCheck: 'clear', certs: [] },
      { id: 'e9', employeeNumber: 'WG-024', name: 'Priya Patel', email: 'priya@woulfgroup.com', title: 'Software Engineer', department: 'Engineering', manager: 'Jason Park', location: 'Salt Lake City', startDate: '2026-03-03', status: 'onboarding', type: 'Full-time', salary: 115000, flightRisk: 'low', i9: false, w4: false, handbook: false, bgCheck: 'pending', certs: [] },
      { id: 'e10', employeeNumber: 'WG-025', name: 'Jake Morrison', email: 'jake@woulfgroup.com', title: 'Installation Tech', department: 'Operations', manager: 'Diana Reeves', location: 'Salt Lake City', startDate: '2026-02-24', status: 'onboarding', type: 'Full-time', salary: 52000, flightRisk: 'low', i9: false, w4: false, handbook: false, bgCheck: 'pending', certs: [] },
    ],
    timeRecords: [
      { employeeId: 'e6', name: 'Carlos Ruiz', date: '2026-02-17', clockIn: '06:45', clockOut: '16:30', hours: 9.75, overtime: 1.75, status: 'pending' },
      { employeeId: 'e7', name: 'Maria Lopez', date: '2026-02-17', clockIn: '07:02', clockOut: '15:28', hours: 8.43, overtime: 0.43, status: 'pending' },
      { employeeId: 'e6', name: 'Carlos Ruiz', date: '2026-02-18', clockIn: '06:50', clockOut: '', hours: 0, overtime: 0, status: 'clocked_in' },
      { employeeId: 'e7', name: 'Maria Lopez', date: '2026-02-18', clockIn: '07:15', clockOut: '', hours: 0, overtime: 0, status: 'clocked_in' },
    ],
    ptoBalances: [
      { employeeId: 'e2', name: 'Marcus Williams', type: 'Vacation', total: 15, used: 5, pending: 2, remaining: 8 },
      { employeeId: 'e3', name: 'Diana Reeves', type: 'Vacation', total: 18, used: 8, pending: 0, remaining: 10 },
      { employeeId: 'e4', name: 'Jason Park', type: 'Vacation', total: 15, used: 12, pending: 3, remaining: 0 },
      { employeeId: 'e5', name: 'Jess Scharmer', type: 'Vacation', total: 12, used: 3, pending: 0, remaining: 9 },
      { employeeId: 'e6', name: 'Carlos Ruiz', type: 'Vacation', total: 10, used: 4, pending: 0, remaining: 6 },
      { employeeId: 'e7', name: 'Maria Lopez', type: 'Vacation', total: 10, used: 8, pending: 2, remaining: 0 },
    ],
    jobPostings: [
      { id: 'j1', title: 'Senior Installation Technician', department: 'Operations', location: 'Salt Lake City', type: 'Full-time', salaryRange: '$55K-$70K', status: 'open', applicants: 12, posted: ['indeed', 'linkedin'], daysOpen: 18 },
      { id: 'j2', title: 'Account Executive — Industrial', department: 'Sales', location: 'Remote / SLC', type: 'Full-time', salaryRange: '$75K-$95K + commission', status: 'open', applicants: 8, posted: ['linkedin'], daysOpen: 11 },
      { id: 'j3', title: 'Full-Stack Developer', department: 'Engineering', location: 'Salt Lake City', type: 'Full-time', salaryRange: '$110K-$135K', status: 'open', applicants: 24, posted: ['indeed', 'linkedin', 'website'], daysOpen: 6 },
    ],
    applicants: [
      { id: 'a1', jobId: 'j3', name: 'David Chen', email: 'dchen@gmail.com', stage: 'interview', rating: 4, source: 'linkedin', appliedDate: '2026-02-13', interviewDate: '2026-02-20' },
      { id: 'a2', jobId: 'j3', name: 'Sarah Kim', email: 'skim@outlook.com', stage: 'screening', rating: 3, source: 'indeed', appliedDate: '2026-02-14' },
      { id: 'a3', jobId: 'j1', name: 'Mike Torres', email: 'mtorres@yahoo.com', stage: 'offer', rating: 5, source: 'referral', appliedDate: '2026-02-05', interviewDate: '2026-02-12' },
      { id: 'a4', jobId: 'j2', name: 'Lisa Park', email: 'lpark@gmail.com', stage: 'interview', rating: 4, source: 'linkedin', appliedDate: '2026-02-10', interviewDate: '2026-02-21' },
      { id: 'a5', jobId: 'j3', name: 'Alex Rivera', email: 'arivera@proton.me', stage: 'applied', rating: 0, source: 'website', appliedDate: '2026-02-17' },
    ],
    reviews: [
      { employeeId: 'e2', name: 'Marcus Williams', period: 'Q1 2026', type: 'quarterly', status: 'pending', score: undefined, reviewer: 'Steve Macurdy' },
      { employeeId: 'e4', name: 'Jason Park', period: 'Q1 2026', type: 'quarterly', status: 'in_progress', score: undefined, reviewer: 'Steve Macurdy' },
      { employeeId: 'e7', name: 'Maria Lopez', period: 'Probation', type: 'probation', status: 'pending', score: undefined, reviewer: 'Carlos Ruiz' },
    ],
    onboarding: [
      { id: 'ob1', name: 'Priya Patel', email: 'priya@woulfgroup.com', startDate: '2026-03-03', progress: 42, currentStep: 'Emergency Contacts', token: 'onb_PriyaPatel2026', daysUntilStart: 13 },
      { id: 'ob2', name: 'Jake Morrison', email: 'jake@woulfgroup.com', startDate: '2026-02-24', progress: 75, currentStep: 'W-4 Tax Withholding', token: 'onb_JakeMorrison2026', daysUntilStart: 6 },
    ],
    complianceAlerts: [
      { id: 'ca1', type: 'certification', severity: 'critical', title: "Maria Lopez — Forklift cert EXPIRED", description: 'Forklift Operator certification expired Dec 1, 2025. Employee cannot operate forklifts until renewed.', dueDate: '2025-12-01', employee: 'Maria Lopez', status: 'open' },
      { id: 'ca2', type: 'certification', severity: 'warning', title: "Carlos Ruiz — Forklift cert expiring Feb 28", description: 'Forklift Operator certification expires in 10 days. Schedule renewal training immediately.', dueDate: '2026-02-28', employee: 'Carlos Ruiz', status: 'open' },
      { id: 'ca3', type: 'certification', severity: 'warning', title: "Jason Park — AWS cert expiring Mar 10", description: 'AWS Solutions Architect certification expires in 20 days.', dueDate: '2026-03-10', employee: 'Jason Park', status: 'open' },
      { id: 'ca4', type: 'onboarding', severity: 'warning', title: "Priya Patel — I-9 not yet completed", description: 'Start date Mar 3. I-9 Section 1 must be completed by Day 1. Currently at 42% onboarding.', dueDate: '2026-03-03', employee: 'Priya Patel', status: 'open' },
      { id: 'ca5', type: 'review', severity: 'info', title: "3 performance reviews due this quarter", description: 'Marcus Williams (Q1), Jason Park (Q1), Maria Lopez (Probation) — reviews not yet started.', status: 'open' },
      { id: 'ca6', type: 'training', severity: 'info', title: "Annual harassment training due March 15", description: '8 employees have not completed annual training. Deadline: March 15, 2026.', dueDate: '2026-03-15', status: 'open' },
    ],
    aiInsights: [
      { id: 'hi1', type: 'attrition', priority: 'critical', title: '🔴 Flight Risk: Maria Lopez (Operations)', description: 'Low review score (2.8), expired forklift cert, PTO fully depleted (0 remaining), and 2-year tenure approaching. Estimated replacement cost: $22,000.', action: 'Schedule 1-on-1 with Carlos Ruiz, discuss raise to $48K (market rate), expedite forklift recertification', status: 'pending' },
      { id: 'hi2', type: 'attrition', priority: 'warning', title: '🟡 Monitor: Jason Park (Engineering)', description: 'PTO nearly depleted (0 remaining with 3 pending), AWS cert expiring, medium-tenure risk at 4 years. Review score 3.8 is below team average.', action: 'Fast-track Q1 review, discuss career growth path, approve PTO request to reduce burnout signals', status: 'pending' },
      { id: 'hi3', type: 'workforce', priority: 'warning', title: '📊 Operations team overtime trending up', description: 'Operations averaging 6.2 overtime hours/employee/week over past 4 weeks. Pre-expansion baseline was 2.1 hours.', action: 'Accelerate Sr. Installation Tech hire (Mike Torres at offer stage), consider temp staffing for March surge', status: 'pending' },
      { id: 'hi4', type: 'compliance', priority: 'warning', title: '⚠️ 2 forklift certs need immediate attention', description: 'Maria Lopez EXPIRED, Carlos Ruiz expiring Feb 28. Both are daily forklift operators. Non-compliance risk.', action: 'Book forklift recertification training for both — I have found a Feb 22 slot at Utah Safety Training ($450/person)', status: 'pending' },
      { id: 'hi5', type: 'draft', priority: 'info', title: '📝 Draft ready: Job description for Full-Stack Developer', description: 'Based on the posting requirements, I have generated a complete JD with tech stack, responsibilities, and culture section.', action: 'Review and publish to Indeed + LinkedIn', status: 'pending' },
    ],
    dailyBriefing: "## 👥 HR Briefing — Feb 18, 2026\\n\\n**Headcount:** 34 active | 2 onboarding | 3 open positions\\n**Compliance Score:** 91/100\\n\\n**Today's Priorities:**\\n1. 🔴 Maria Lopez — forklift cert EXPIRED, cannot operate until renewed\\n2. 🟡 Carlos Ruiz — forklift cert expires in 10 days, book training\\n3. ✅ Jake Morrison onboarding at 75% — W-4 step next\\n\\n**Attrition Alerts:**\\n🔴 Maria Lopez — flight risk HIGH (low review, no PTO, expired cert)\\n🟡 Jason Park — monitor (PTO depleted, cert expiring, tenure risk)\\n\\n**Onboarding Status:**\\n- Priya Patel: 42% complete, starts Mar 3 (13 days) — on track\\n- Jake Morrison: 75% complete, starts Feb 24 (6 days) — slightly behind on W-4\\n\\n**Recruitment:**\\n- Mike Torres → OFFER stage for Sr. Installation Tech (rating: 5/5)\\n- David Chen → Interview scheduled Feb 20 for Full-Stack Dev\\n\\n**Upcoming:**\\n- Mar 15: Annual harassment training deadline (8 incomplete)\\n- Q1 reviews due: Marcus, Jason, Maria (probation)",
  },
  _default: {
    headcount: 0, onboardingCount: 0, openPositions: 0, turnoverRate: 0,
    avgTenure: 0, complianceScore: 0, ptoUtilization: 0,
    departments: [], employees: [], timeRecords: [], ptoBalances: [],
    jobPostings: [], applicants: [], reviews: [], onboarding: [],
    complianceAlerts: [], aiInsights: [],
    dailyBriefing: "Connect your Odoo HR module to begin managing employees.",
  }
}

export function getHRData(companyId: string): HRSnapshot {
  return TENANT_HR[companyId] || TENANT_HR._default
}
`);

// ============================================================
// 8. HR API
// ============================================================
write('app/api/agents/hr/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { getHRData } from '@/lib/hr/hr-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  const data = getHRData(companyId)
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    if (action === 'approve_insight') return NextResponse.json({ success: true, message: 'Insight approved' })
    if (action === 'approve_pto') return NextResponse.json({ success: true, message: 'PTO request approved' })
    if (action === 'approve_time') return NextResponse.json({ success: true, message: 'Timesheet approved' })
    if (action === 'resolve_alert') return NextResponse.json({ success: true, message: 'Alert resolved' })
    if (action === 'generate_onboarding_link') {
      const token = 'onb_' + Date.now().toString(36)
      return NextResponse.json({ success: true, token, link: '/onboarding/' + token })
    }
    if (action === 'post_job') return NextResponse.json({ success: true, message: 'Job posted to selected platforms' })
    if (action === 'send_offer') return NextResponse.json({ success: true, message: 'Offer letter sent via DocuSign' })
    if (action === 'advance_applicant') return NextResponse.json({ success: true, message: 'Applicant advanced to next stage' })
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
`);

// ============================================================
// 9. ONBOARDING API (Public)
// ============================================================
write('app/api/onboarding/[token]/route.ts', `import { NextRequest, NextResponse } from 'next/server'

// In production: look up OnboardingSession by token in DB
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params
  // Demo: return mock onboarding data
  return NextResponse.json({
    success: true,
    session: {
      token,
      employeeName: token.includes('Priya') ? 'Priya Patel' : token.includes('Jake') ? 'Jake Morrison' : 'New Hire',
      companyName: 'Woulf Group',
      progress: token.includes('Jake') ? 75 : 42,
      steps: [
        { id: 'welcome', label: 'Welcome', status: 'completed' },
        { id: 'personal', label: 'Personal Info', status: 'completed' },
        { id: 'id_scan', label: 'ID Verification', status: token.includes('Jake') ? 'completed' : 'in_progress' },
        { id: 'photo', label: 'Profile Photo', status: token.includes('Jake') ? 'completed' : 'pending' },
        { id: 'emergency', label: 'Emergency Contacts', status: token.includes('Jake') ? 'completed' : 'pending' },
        { id: 'banking', label: 'Direct Deposit', status: token.includes('Jake') ? 'completed' : 'pending' },
        { id: 'w4', label: 'W-4', status: token.includes('Jake') ? 'in_progress' : 'pending' },
        { id: 'i9', label: 'I-9', status: 'pending' },
        { id: 'handbook', label: 'Handbook', status: 'pending' },
        { id: 'policies', label: 'Policies', status: 'pending' },
        { id: 'benefits', label: 'Benefits', status: 'pending' },
        { id: 'complete', label: 'Complete', status: 'pending' },
      ],
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // In production: save step data, advance progress
  return NextResponse.json({ success: true, message: 'Step saved' })
}
`);

// ============================================================
// 10. MOBILE ONBOARDING UI
// ============================================================
write('app/onboarding/[token]/page.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Step { id: string; label: string; status: string }

export default function OnboardingPage() {
  const params = useParams()
  const token = params.token as string
  const [session, setSession] = useState<any>(null)
  const [activeStep, setActiveStep] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/onboarding/' + token).then(r => r.json()).then(d => {
      if (d.session) { setSession(d.session); const cur = d.session.steps.find((s: Step) => s.status === 'in_progress' || s.status === 'pending'); if (cur) setActiveStep(cur.id) }
    })
  }, [token])

  if (!session) return <div className="min-h-screen bg-[#060910] flex items-center justify-center text-gray-500">Loading...</div>

  const completedCount = session.steps.filter((s: Step) => s.status === 'completed').length
  const totalSteps = session.steps.length

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {/* Mobile header */}
      <div className="bg-[#0A0E15] border-b border-white/5 px-4 py-4 text-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">W</div>
        <h1 className="text-lg font-bold mt-1">Welcome, {session.employeeName}!</h1>
        <p className="text-xs text-gray-500 mt-0.5">{session.companyName} Onboarding</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2"><span>{completedCount} of {totalSteps} steps</span><span>{session.progress}%</span></div>
          <div className="bg-white/5 rounded-full h-3 overflow-hidden"><div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" style={{ width: session.progress + '%' }} /></div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {session.steps.map((step: Step, i: number) => {
            const isActive = activeStep === step.id
            const isDone = step.status === 'completed'
            const isLocked = step.status === 'pending' && i > 0 && session.steps[i - 1].status !== 'completed'
            return (
              <button key={step.id} onClick={() => !isLocked && setActiveStep(step.id)} disabled={isLocked}
                className={"w-full text-left border rounded-xl p-4 transition-all " +
                  (isDone ? 'border-emerald-500/20 bg-emerald-500/5' :
                  isActive ? 'border-blue-500/30 bg-blue-500/5 ring-1 ring-blue-500/20' :
                  isLocked ? 'border-white/5 bg-[#0A0E15] opacity-40' :
                  'border-white/5 bg-[#0A0E15] hover:border-white/10')}>
                <div className="flex items-center gap-3">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 " +
                    (isDone ? 'bg-emerald-500/20 text-emerald-400' : isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-600')}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={"text-sm font-semibold " + (isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-gray-400')}>{step.label}</div>
                    <div className="text-[10px] text-gray-600 mt-0.5">{isDone ? 'Completed' : isActive ? 'In progress' : isLocked ? 'Complete previous step first' : 'Ready'}</div>
                  </div>
                  {!isDone && !isLocked && <span className="text-gray-600 text-sm">→</span>}
                </div>

                {/* Expanded step content */}
                {isActive && !isDone && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                    {step.id === 'id_scan' && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-400">Scan your Driver License or Passport. Our AI will auto-fill your information.</p>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
                          <div className="text-3xl mb-2">📷</div>
                          <p className="text-xs text-gray-500">Tap to take photo or upload</p>
                          <input type="file" accept="image/*" capture="environment" className="hidden" id="id-upload" />
                          <label htmlFor="id-upload" className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer">Open Camera</label>
                        </div>
                      </div>
                    )}
                    {step.id === 'photo' && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-400">Take a professional headshot for your employee directory.</p>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
                          <div className="text-3xl mb-2">🤳</div>
                          <input type="file" accept="image/*" capture="user" className="hidden" id="photo-upload" />
                          <label htmlFor="photo-upload" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer">Take Photo</label>
                        </div>
                      </div>
                    )}
                    {(step.id === 'personal' || step.id === 'emergency' || step.id === 'banking' || step.id === 'w4' || step.id === 'i9' || step.id === 'benefits') && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-400">Fill out the form below. All fields marked * are required.</p>
                        <div className="space-y-2">
                          {step.id === 'personal' && <>
                            <input placeholder="First Name *" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <input placeholder="Last Name *" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <input placeholder="Date of Birth *" type="date" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <input placeholder="SSN (encrypted) *" type="password" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <input placeholder="Street Address *" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <div className="grid grid-cols-3 gap-2">
                              <input placeholder="City" className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                              <input placeholder="State" className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                              <input placeholder="Zip" className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            </div>
                          </>}
                          {step.id === 'banking' && <>
                            <input placeholder="Bank Name *" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <input placeholder="Routing Number *" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <input placeholder="Account Number *" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400"><option>Checking</option><option>Savings</option></select>
                          </>}
                          {(step.id === 'emergency') && <>
                            <input placeholder="Contact Name *" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <input placeholder="Phone Number *" type="tel" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                            <input placeholder="Relationship *" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm" />
                          </>}
                          {(step.id === 'w4' || step.id === 'i9' || step.id === 'benefits') && <p className="text-xs text-gray-500">Simplified mobile form — tap to fill each field.</p>}
                        </div>
                      </div>
                    )}
                    {(step.id === 'handbook' || step.id === 'policies') && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-400">{step.id === 'handbook' ? 'Review the employee handbook and sign below.' : 'Read and acknowledge each policy.'}</p>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-32 overflow-y-auto text-[10px] text-gray-500">
                          {step.id === 'handbook' ? 'Employee Handbook content would load here from document store...' : 'Policy documents would load here...'}
                        </div>
                        <div className="border border-white/10 rounded-xl p-4">
                          <p className="text-[10px] text-gray-500 mb-2">Sign below (draw with finger)</p>
                          <div className="bg-white/5 rounded-lg h-20 flex items-center justify-center text-gray-600 text-xs">✍️ Signature pad</div>
                        </div>
                      </div>
                    )}
                    <button onClick={() => { /* save step */ }} className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] transition-all">Save & Continue</button>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-center text-[10px] text-gray-700 pt-4">Powered by WoulfAI • Your data is encrypted in transit and at rest</p>
      </div>
    </div>
  )
}
`);

// ============================================================
// 11. HR DASHBOARD — Full 6-tab UI
// ============================================================
write('app/portal/agent/hr/page.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TABS = ['Dashboard', 'Directory', 'Attendance', 'Recruitment', 'Onboarding', 'Compliance']
const STAT: Record<string, string> = { active: 'bg-emerald-500/10 text-emerald-400', onboarding: 'bg-blue-500/10 text-blue-400', leave: 'bg-amber-500/10 text-amber-400', terminated: 'bg-rose-500/10 text-rose-400', open: 'bg-blue-500/10 text-blue-400', resolved: 'bg-emerald-500/10 text-emerald-400', pending: 'bg-amber-500/10 text-amber-400', completed: 'bg-emerald-500/10 text-emerald-400', in_progress: 'bg-blue-500/10 text-blue-400' }
const RISK: Record<string, string> = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-rose-400' }
const SEV: Record<string, string> = { critical: 'border-rose-500/20 bg-rose-500/5', warning: 'border-amber-500/20 bg-amber-500/5', info: 'border-blue-500/20 bg-blue-500/5' }
const STAGE_ORDER = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']
const STAGE_COLOR: Record<string, string> = { applied: 'bg-gray-500/10 text-gray-400', screening: 'bg-blue-500/10 text-blue-400', interview: 'bg-purple-500/10 text-purple-400', offer: 'bg-amber-500/10 text-amber-400', hired: 'bg-emerald-500/10 text-emerald-400', rejected: 'bg-rose-500/10 text-rose-400' }

export default function HRDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState('Dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    try {
      const s = localStorage.getItem('woulfai_session')
      if (!s) { router.replace('/login'); return }
      const p = JSON.parse(s); setUser(p)
      fetch('/api/agents/hr?companyId=' + p.companyId).then(r => r.json()).then(d => { if (d.data) setData(d.data) })
    } catch { router.replace('/login') }
  }, [router])

  const act = async (action: string, extra?: any) => {
    const res = await fetch('/api/agents/hr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, companyId: user?.companyId, ...extra }) })
    return res.json()
  }

  if (!user || !data) return <div className="min-h-screen bg-[#060910] flex items-center justify-center text-gray-500">Loading HR Agent...</div>

  const filteredEmps = data.employees.filter((e: any) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()) || e.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal')} className="text-xs text-gray-500 hover:text-white">← Portal</button>
            <span className="text-gray-700">|</span><span className="text-xl">👥</span>
            <span className="text-sm font-semibold">HR Agent</span>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] text-emerald-400 font-medium">LIVE</span></div>
          </div>
          <span className="text-xs text-gray-600">{user.companyName} • {user.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-xs text-gray-400">HR data scoped to <span className="text-white font-semibold">{user.companyName}</span></span></div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {[
            { l: 'Headcount', v: data.headcount, c: 'text-blue-400' },
            { l: 'Onboarding', v: data.onboardingCount, c: 'text-cyan-400' },
            { l: 'Open Roles', v: data.openPositions, c: 'text-purple-400' },
            { l: 'Turnover', v: data.turnoverRate + '%', c: data.turnoverRate < 10 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'Avg Tenure', v: data.avgTenure + 'yr', c: 'text-emerald-400' },
            { l: 'Compliance', v: data.complianceScore + '/100', c: data.complianceScore >= 95 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'PTO Util', v: data.ptoUtilization + '%', c: 'text-pink-400' },
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

        {/* TAB: Dashboard */}
        {tab === 'Dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">👥 Daily HR Briefing</h3>
              <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: data.dailyBriefing.replace(/##\\s/g, '<strong>').replace(/\\*\\*/g, '<strong>').replace(/\\n/g, '<br/>') }} />
            </div>
            {/* Department headcount */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">🏢 Department Overview</h3>
              <div className="space-y-3">{data.departments.map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 w-24 shrink-0">{d.name}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden relative">
                    <div className="bg-blue-500/40 h-full rounded-full" style={{ width: Math.min((d.headcount / data.headcount) * 100 * 2.5, 100) + '%' }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">{d.headcount} staff</span>
                  </div>
                  <span className="text-[10px] text-gray-500 w-20 text-right">{d.openRoles > 0 ? d.openRoles + ' open' : '—'}</span>
                </div>
              ))}</div>
            </div>
            {/* AI Insights */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">🤖 AI Insights ({data.aiInsights.filter((a: any) => a.status === 'pending').length} pending)</h3>
              <div className="space-y-3">{data.aiInsights.filter((a: any) => a.status === 'pending').slice(0, 3).map((a: any) => (
                <div key={a.id} className="border border-white/5 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="flex-1"><div className="text-sm font-semibold">{a.title}</div><div className="text-xs text-gray-500 mt-1">{a.description}</div><div className="text-xs text-emerald-400/70 mt-1">Action: {a.action}</div></div>
                  <button onClick={() => { act('approve_insight', { insightId: a.id }); show('✅ Approved'); setData({ ...data, aiInsights: data.aiInsights.map((x: any) => x.id === a.id ? { ...x, status: 'approved' } : x) }) }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 shrink-0">Approve</button>
                </div>
              ))}</div>
            </div>
          </div>
        )}

        {/* TAB: Directory */}
        {tab === 'Directory' && (
          <div className="space-y-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, title, or department..." className="w-full max-w-sm px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredEmps.map((emp: any) => (
                <div key={emp.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{emp.name.split(' ').map((n: string) => n[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-sm font-semibold truncate">{emp.name}</span><span className={"text-[9px] px-1.5 py-0.5 rounded " + (STAT[emp.status] || '')}>{emp.status}</span></div>
                      <div className="text-xs text-gray-400 mt-0.5">{emp.title}</div>
                      <div className="text-[10px] text-gray-600">{emp.department} • {emp.location}</div>
                      <div className="flex items-center gap-3 mt-2 text-[10px]">
                        <span className={"font-medium " + (RISK[emp.flightRisk] || '')}>Risk: {emp.flightRisk}</span>
                        {emp.reviewScore && <span className="text-gray-500">Review: {emp.reviewScore}/5</span>}
                        {!emp.i9 && <span className="text-rose-400 font-bold">No I-9</span>}
                        {emp.certs.some((c: any) => c.status === 'expired') && <span className="text-rose-400 font-bold">Expired cert</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Attendance */}
        {tab === 'Attendance' && (
          <div className="space-y-6">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">⏰ Today's Clock Status</h3>
              <div className="space-y-2">{data.timeRecords.filter((t: any) => t.date === '2026-02-18').map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                  <div><div className="text-sm font-medium">{t.name}</div><div className="text-[10px] text-gray-500">In: {t.clockIn} {t.clockOut ? '• Out: ' + t.clockOut : ''}</div></div>
                  <div className="flex items-center gap-2"><div className={"w-2 h-2 rounded-full " + (t.status === 'clocked_in' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600')} /><span className="text-[10px] text-gray-400">{t.status === 'clocked_in' ? 'On floor' : t.hours.toFixed(1) + 'h'}</span></div>
                </div>
              ))}</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">🏖️ PTO Balances</h3>
              <div className="space-y-3">{data.ptoBalances.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs w-32 shrink-0">{p.name}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden relative">
                    <div className="bg-blue-500/40 h-full rounded-full" style={{ width: Math.max((p.used / p.total) * 100, 0) + '%' }} />
                    {p.pending > 0 && <div className="bg-amber-500/40 h-full rounded-full absolute top-0" style={{ left: (p.used / p.total) * 100 + '%', width: (p.pending / p.total) * 100 + '%' }} />}
                  </div>
                  <span className={"text-xs font-mono w-16 text-right " + (p.remaining <= 0 ? 'text-rose-400 font-bold' : 'text-gray-400')}>{p.remaining}d left</span>
                  <span className="text-[10px] text-gray-600 w-16 text-right">{p.used}/{p.total}</span>
                </div>
              ))}</div>
            </div>
          </div>
        )}

        {/* TAB: Recruitment */}
        {tab === 'Recruitment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{data.jobPostings.map((j: any) => (
              <div key={j.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-5">
                <div className="flex justify-between items-start mb-2"><span className={"text-[9px] px-2 py-0.5 rounded " + (STAT[j.status] || '')}>{j.status}</span><span className="text-[10px] text-gray-600">{j.daysOpen}d open</span></div>
                <h4 className="text-sm font-bold">{j.title}</h4>
                <div className="text-[10px] text-gray-500 mt-1">{j.department} • {j.location} • {j.type}</div>
                <div className="text-xs text-emerald-400 mt-1">{j.salaryRange}</div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-xs text-gray-400">{j.applicants} applicants</span>
                  <div className="flex gap-1">{j.posted.map((p: string) => <span key={p} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500">{p}</span>)}</div>
                </div>
              </div>
            ))}</div>
            {/* Pipeline */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">📊 Applicant Pipeline</h3>
              <div className="overflow-x-auto"><div className="flex gap-3 min-w-[800px]">
                {STAGE_ORDER.filter(s => s !== 'hired' && s !== 'rejected').map(stage => {
                  const stageApps = data.applicants.filter((a: any) => a.stage === stage)
                  return (
                    <div key={stage} className="flex-1 min-w-[180px]">
                      <div className="flex items-center gap-2 mb-3"><span className={"text-[9px] px-2 py-0.5 rounded font-medium capitalize " + (STAGE_COLOR[stage] || '')}>{stage}</span><span className="text-[10px] text-gray-600">{stageApps.length}</span></div>
                      <div className="space-y-2">{stageApps.map((a: any) => (
                        <div key={a.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                          <div className="text-xs font-semibold">{a.name}</div>
                          <div className="text-[10px] text-gray-500">{data.jobPostings.find((j: any) => j.id === a.jobId)?.title || ''}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-600">{a.source}</span>
                            {a.rating > 0 && <span className="text-[10px] text-amber-400">{'★'.repeat(a.rating)}</span>}
                          </div>
                          {a.interviewDate && <div className="text-[10px] text-purple-400 mt-1">📅 {a.interviewDate}</div>}
                          <button onClick={() => { act('advance_applicant', { applicantId: a.id }); show('Applicant advanced') }} className="text-[9px] text-blue-400 mt-2 hover:underline">Advance →</button>
                        </div>
                      ))}</div>
                    </div>
                  )
                })}
              </div></div>
            </div>
          </div>
        )}

        {/* TAB: Onboarding */}
        {tab === 'Onboarding' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">{data.onboarding.length} Active Onboardings</h3>
              <button onClick={async () => { const r = await act('generate_onboarding_link'); if (r.link) { navigator.clipboard.writeText(window.location.origin + r.link); show('📋 Onboarding link copied!') } }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500">+ Generate Onboarding Link</button>
            </div>
            {data.onboarding.map((ob: any) => (
              <div key={ob.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-sm font-bold">{ob.name.split(' ').map((n: string) => n[0]).join('')}</div>
                    <div><div className="text-sm font-bold">{ob.name}</div><div className="text-[10px] text-gray-500">{ob.email} • Starts {ob.startDate} ({ob.daysUntilStart} days)</div></div>
                  </div>
                  <a href={'/onboarding/' + ob.token} target="_blank" className="text-[10px] text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-500/20">View Onboarding →</a>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>Progress</span><span>{ob.progress}%</span></div>
                <div className="bg-white/5 rounded-full h-3 overflow-hidden mb-3"><div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: ob.progress + '%' }} /></div>
                <div className="text-xs text-gray-400">Current step: <span className="text-white font-medium">{ob.currentStep}</span></div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Compliance */}
        {tab === 'Compliance' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Score</div><div className={"text-xl font-mono font-bold mt-1 " + (data.complianceScore >= 95 ? 'text-emerald-400' : 'text-amber-400')}>{data.complianceScore}/100</div></div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Critical</div><div className="text-xl font-mono font-bold mt-1 text-rose-400">{data.complianceAlerts.filter((a: any) => a.severity === 'critical').length}</div></div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Warnings</div><div className="text-xl font-mono font-bold mt-1 text-amber-400">{data.complianceAlerts.filter((a: any) => a.severity === 'warning').length}</div></div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Open Alerts</div><div className="text-xl font-mono font-bold mt-1 text-blue-400">{data.complianceAlerts.filter((a: any) => a.status === 'open').length}</div></div>
            </div>
            {data.complianceAlerts.map((alert: any) => (
              <div key={alert.id} className={"border rounded-xl p-4 sm:p-5 " + (SEV[alert.severity] || 'border-white/5')}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{alert.title}</span>
                      <span className={"text-[9px] px-1.5 py-0.5 rounded font-medium " + (alert.severity === 'critical' ? 'bg-rose-500/10 text-rose-400' : alert.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400')}>{alert.severity}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{alert.description}</div>
                    {alert.dueDate && <div className="text-[10px] text-gray-600 mt-1">Due: {alert.dueDate}</div>}
                  </div>
                  {alert.status === 'open' && (
                    <button onClick={() => { act('resolve_alert', { alertId: alert.id }); show('Alert resolved'); setData({ ...data, complianceAlerts: data.complianceAlerts.map((x: any) => x.id === alert.id ? { ...x, status: 'resolved' } : x) }) }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 shrink-0">Resolve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
`);

console.log('');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('  Installed: 11 files');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('  HR AGENT MODULES:');
console.log('');
console.log('  💾 DATA SCHEMA:');
console.log('     Employee, Department, TimeEntry, PTOBalance');
console.log('     JobPosting, Applicant, ReviewCycle, OnboardingSession');
console.log('');
console.log('  📡 INTEGRATIONS:');
console.log('     Odoo HR          — employees, leave, attendance');
console.log('     ADP / Gusto      — payroll sync');
console.log('     Checkr            — background checks');
console.log('     Indeed / LinkedIn — job board posting');
console.log('     DocuSign          — offer letter e-signatures');
console.log('');
console.log('  📱 MOBILE ONBOARDING ENGINE:');
console.log('     12-step wizard (welcome → complete)');
console.log('     AI ID scanning (Google Vision / Claude fallback)');
console.log('     Camera capture for photos + documents');
console.log('     Mobile-first forms: personal, W-4, I-9, banking');
console.log('     Signature pad for handbook + policies');
console.log('     Progress tracking with % completion');
console.log('     Public route: /onboarding/[token]');
console.log('');
console.log('  🧠 AI BRAIN:');
console.log('     Attrition risk prediction (review + PTO + tenure signals)');
console.log('     Compliance guard (I-9, certs, training deadlines)');
console.log('     Automated drafting (JDs, offer letters, PIPs)');
console.log('     Workforce planning (overtime trends → headcount)');
console.log('');
console.log('  📊 DASHBOARD (6 tabs at /portal/agent/hr):');
console.log('     Dashboard    — Briefing + dept overview + AI insights');
console.log('     Directory    — Search, employee cards, risk + cert flags');
console.log('     Attendance   — Clock status + PTO balances with bars');
console.log('     Recruitment  — Job cards + Kanban applicant pipeline');
console.log('     Onboarding   — Progress tracker + generate link button');
console.log('     Compliance   — Severity alerts + resolve actions');
console.log('');
console.log('  DEMO DATA: 10 Woulf Group employees, 5 departments,');
console.log('  3 open jobs, 5 applicants, 2 active onboardings,');
console.log('  6 compliance alerts, 5 AI insights');
console.log('');
console.log('  INSTALL & DEPLOY:');
console.log('    node hr-agent.js');
console.log('    npm run build');
console.log('    vercel --prod');
console.log('');
