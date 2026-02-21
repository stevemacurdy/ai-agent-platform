// ============================================================================
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
    dailyBriefing: "## 👥 HR Briefing — Feb 18, 2026\n\n**Headcount:** 34 active | 2 onboarding | 3 open positions\n**Compliance Score:** 91/100\n\n**Today's Priorities:**\n1. 🔴 Maria Lopez — forklift cert EXPIRED, cannot operate until renewed\n2. 🟡 Carlos Ruiz — forklift cert expires in 10 days, book training\n3. ✅ Jake Morrison onboarding at 75% — W-4 step next\n\n**Attrition Alerts:**\n🔴 Maria Lopez — flight risk HIGH (low review, no PTO, expired cert)\n🟡 Jason Park — monitor (PTO depleted, cert expiring, tenure risk)\n\n**Onboarding Status:**\n- Priya Patel: 42% complete, starts Mar 3 (13 days) — on track\n- Jake Morrison: 75% complete, starts Feb 24 (6 days) — slightly behind on W-4\n\n**Recruitment:**\n- Mike Torres → OFFER stage for Sr. Installation Tech (rating: 5/5)\n- David Chen → Interview scheduled Feb 20 for Full-Stack Dev\n\n**Upcoming:**\n- Mar 15: Annual harassment training deadline (8 incomplete)\n- Q1 reviews due: Marcus, Jason, Maria (probation)",
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
