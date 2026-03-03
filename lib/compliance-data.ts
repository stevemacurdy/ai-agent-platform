// ─── Compliance Agent Data Layer ──────────────────────────
// Regulatory tracking, safety compliance, certifications,
// audit schedules, and violation risk monitoring.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface ComplianceItem { id: string; category: string; requirement: string; status: 'compliant' | 'at-risk' | 'non-compliant' | 'pending'; dueDate: string; lastAuditDate: string | null; nextAuditDate: string; owner: string; severity: 'low' | 'medium' | 'high' | 'critical'; notes: string; }
export interface SafetyMetric { category: string; incidents: number; nearMisses: number; daysWithoutIncident: number; trainingCompliance: number; status: 'good' | 'warning' | 'critical'; }
export interface ComplianceData { source: 'live' | 'demo'; items: ComplianceItem[]; safety: SafetyMetric[]; summary: { overallScore: number; totalRequirements: number; compliant: number; atRisk: number; nonCompliant: number; upcomingAudits: number; expiringCerts: number; daysWithoutIncident: number; trainingCompliance: number; }; recommendations: string[]; }

export async function getComplianceData(companyId: string): Promise<ComplianceData> { return getDemoCompliance(); }

function getDemoCompliance(): ComplianceData {
  const items: ComplianceItem[] = [
    { id: 'comp-1', category: 'OSHA', requirement: 'Workplace safety program documentation', status: 'compliant', dueDate: '2026-12-31', lastAuditDate: '2025-11-15', nextAuditDate: '2026-04-15', owner: 'Steve Macurdy', severity: 'high', notes: 'Annual update completed. Next audit scheduled.' },
    { id: 'comp-2', category: 'OSHA', requirement: 'Injury & Illness Log (Form 300)', status: 'compliant', dueDate: '2026-02-01', lastAuditDate: '2026-02-01', nextAuditDate: '2027-02-01', owner: 'Sofia Ramirez', severity: 'high', notes: 'Filed on time. Zero recordable incidents.' },
    { id: 'comp-3', category: 'OSHA', requirement: 'Forklift operator certification', status: 'non-compliant', dueDate: '2026-03-01', lastAuditDate: null, nextAuditDate: '2026-03-10', owner: 'Marcus Torres', severity: 'critical', notes: 'Kevin Park certification expired. Cannot operate until recertified.' },
    { id: 'comp-4', category: 'DOT', requirement: 'Vehicle inspection records', status: 'compliant', dueDate: '2026-06-30', lastAuditDate: '2025-12-15', nextAuditDate: '2026-06-15', owner: 'Sofia Ramirez', severity: 'medium', notes: 'All 4 company vehicles inspected and current.' },
    { id: 'comp-5', category: 'Insurance', requirement: 'General liability insurance minimum', status: 'at-risk', dueDate: '2026-04-01', lastAuditDate: null, nextAuditDate: '2026-03-15', owner: 'Steve Macurdy', severity: 'high', notes: 'Policy renewal due April 1. Some client contracts require $2M minimum.' },
    { id: 'comp-6', category: 'State', requirement: 'Utah contractor license renewal', status: 'compliant', dueDate: '2026-09-30', lastAuditDate: '2025-09-15', nextAuditDate: '2026-09-01', owner: 'Steve Macurdy', severity: 'high', notes: 'License current through Sept 2026.' },
    { id: 'comp-7', category: 'Environmental', requirement: 'Hazardous materials handling certification', status: 'compliant', dueDate: '2026-08-01', lastAuditDate: '2025-08-01', nextAuditDate: '2026-07-15', owner: 'Marcus Torres', severity: 'medium', notes: 'Annual refresher due in July.' },
    { id: 'comp-8', category: 'Tax', requirement: 'Quarterly payroll tax filing', status: 'at-risk', dueDate: '2026-03-31', lastAuditDate: '2025-12-31', nextAuditDate: '2026-03-31', owner: 'Sofia Ramirez', severity: 'high', notes: 'Q1 filing due March 31. Data collection in progress.' },
    { id: 'comp-9', category: 'Safety', requirement: 'Fall protection training (all field crew)', status: 'at-risk', dueDate: '2026-03-15', lastAuditDate: '2025-03-10', nextAuditDate: '2026-03-15', owner: 'Marcus Torres', severity: 'high', notes: 'Annual refresher due. 3 of 6 field crew completed.' },
  ];

  const safety: SafetyMetric[] = [
    { category: 'Workplace Injuries', incidents: 0, nearMisses: 2, daysWithoutIncident: 142, trainingCompliance: 88, status: 'good' },
    { category: 'Vehicle Incidents', incidents: 0, nearMisses: 0, daysWithoutIncident: 365, trainingCompliance: 100, status: 'good' },
    { category: 'Equipment Safety', incidents: 0, nearMisses: 1, daysWithoutIncident: 98, trainingCompliance: 75, status: 'warning' },
    { category: 'Fall Protection', incidents: 0, nearMisses: 0, daysWithoutIncident: 200, trainingCompliance: 50, status: 'warning' },
  ];

  const compliant = items.filter(i => i.status === 'compliant').length;
  const atRisk = items.filter(i => i.status === 'at-risk').length;
  const nonCompliant = items.filter(i => i.status === 'non-compliant').length;

  return {
    source: 'demo', items, safety,
    summary: {
      overallScore: Math.round((compliant / items.length) * 100), totalRequirements: items.length, compliant, atRisk, nonCompliant,
      upcomingAudits: items.filter(i => { const d = new Date(i.nextAuditDate); return d.getTime() - Date.now() < 30 * 86400000 && d.getTime() > Date.now(); }).length,
      expiringCerts: 4, daysWithoutIncident: 142, trainingCompliance: Math.round(safety.reduce((s, m) => s + m.trainingCompliance, 0) / safety.length),
    },
    recommendations: [
      'CRITICAL: Kevin Park forklift cert expired — remove from forklift duties immediately and schedule recertification',
      'Fall protection training only 50% complete — schedule remaining crew for refresher before March 15 deadline',
      'Insurance renewal due April 1 — confirm $2M minimum coverage required by Cabelas and Logicorp contracts',
      'Q1 payroll tax filing due March 31 — ensure data collection is completed by March 20',
      '142 days without recordable incident — excellent record, maintain daily toolbox talks',
    ],
  };
}
