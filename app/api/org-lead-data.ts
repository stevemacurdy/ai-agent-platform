// ─── Org Lead Agent Data Layer ────────────────────────────
// Executive dashboard: cross-department KPIs, strategic
// priorities, OKRs, and company-wide health metrics.

import { createClient } from '@supabase/supabase-js';
function supabaseAdmin() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } }); }

export interface OKR { id: string; objective: string; department: string; keyResults: { description: string; target: number; current: number; unit: string; status: 'on-track' | 'behind' | 'at-risk' | 'completed' }[]; owner: string; quarter: string; overallProgress: number; }
export interface DepartmentHealth { department: string; score: number; grade: string; activeProjects: number; headcount: number; budget: number; spent: number; keyMetric: string; keyMetricValue: string; trend: 'improving' | 'stable' | 'declining'; topRisk: string; }
export interface StrategicPriority { id: string; title: string; status: 'on-track' | 'behind' | 'at-risk' | 'completed'; owner: string; dueDate: string; progress: number; impact: 'high' | 'medium' | 'low'; dependencies: string[]; }
export interface OrgLeadData { source: 'live' | 'demo'; okrs: OKR[]; departments: DepartmentHealth[]; priorities: StrategicPriority[]; summary: { companyHealthScore: number; revenue: number; revenueTarget: number; revenueAttainment: number; activeProjects: number; totalHeadcount: number; cashPosition: number; burnRate: number; runway: number; okrProgress: number; }; recommendations: string[]; }

export async function getOrgLeadData(companyId: string): Promise<OrgLeadData> { return getDemoOrgLead(); }

function getDemoOrgLead(): OrgLeadData {
  const okrs: OKR[] = [
    { id: 'okr-1', objective: 'Grow revenue to $2M run-rate', department: 'Sales', keyResults: [
      { description: 'Close $500K in new contracts Q1', target: 500000, current: 320000, unit: '$', status: 'behind' },
      { description: 'Achieve 30% win rate on proposals', target: 30, current: 34, unit: '%', status: 'completed' },
      { description: 'Generate 20 qualified leads per month', target: 20, current: 14, unit: 'leads', status: 'behind' },
    ], owner: 'Steve Macurdy', quarter: 'Q1 2026', overallProgress: 62 },
    { id: 'okr-2', objective: 'Launch WoulfAI platform to market', department: 'Product', keyResults: [
      { description: 'Complete 21 agent intelligence layers', target: 21, current: 17, unit: 'agents', status: 'on-track' },
      { description: 'First 5 paying customers', target: 5, current: 0, unit: 'customers', status: 'behind' },
      { description: 'Achieve 99.5% API uptime', target: 99.5, current: 99.8, unit: '%', status: 'completed' },
    ], owner: 'Steve Macurdy', quarter: 'Q1 2026', overallProgress: 58 },
    { id: 'okr-3', objective: 'Zero safety incidents', department: 'Operations', keyResults: [
      { description: 'Complete all required safety training', target: 100, current: 75, unit: '%', status: 'at-risk' },
      { description: 'Zero recordable incidents', target: 0, current: 0, unit: 'incidents', status: 'completed' },
      { description: 'Daily toolbox talks compliance', target: 95, current: 88, unit: '%', status: 'on-track' },
    ], owner: 'Marcus Torres', quarter: 'Q1 2026', overallProgress: 72 },
  ];

  const departments: DepartmentHealth[] = [
    { department: 'Operations', score: 74, grade: 'B', activeProjects: 3, headcount: 6, budget: 160000, spent: 142000, keyMetric: 'On-Time Delivery', keyMetricValue: '94%', trend: 'stable', topRisk: 'Cabelas project at risk of deadline penalty' },
    { department: 'Sales', score: 65, grade: 'C', activeProjects: 5, headcount: 1, budget: 50000, spent: 32000, keyMetric: 'Pipeline Value', keyMetricValue: '$996K', trend: 'improving', topRisk: 'Single person sales team — no backup' },
    { department: 'Finance', score: 45, grade: 'D', activeProjects: 0, headcount: 1, budget: 20000, spent: 8000, keyMetric: 'Cash Position', keyMetricValue: '$48K', trend: 'declining', topRisk: 'High overdue AR ($77.7K) threatening cash flow' },
    { department: 'Engineering', score: 80, grade: 'A', activeProjects: 2, headcount: 1, budget: 30000, spent: 18000, keyMetric: 'API Uptime', keyMetricValue: '99.8%', trend: 'improving', topRisk: 'Single engineer — bus factor of 1' },
    { department: 'Admin/HR', score: 70, grade: 'B', activeProjects: 0, headcount: 1, budget: 15000, spent: 6000, keyMetric: 'Compliance Score', keyMetricValue: '82%', trend: 'stable', topRisk: 'Expired forklift cert — compliance gap' },
  ];

  const priorities: StrategicPriority[] = [
    { id: 'sp-1', title: 'Close FreshDirect contract and begin cold storage project', status: 'on-track', owner: 'Steve Macurdy', dueDate: '2026-03-15', progress: 40, impact: 'high', dependencies: ['Legal review', 'Crew availability'] },
    { id: 'sp-2', title: 'Resolve Cabelas project delay and budget overrun', status: 'at-risk', owner: 'Steve Macurdy', dueDate: '2026-03-15', progress: 68, impact: 'high', dependencies: ['Hytrol parts delivery', 'Penalty clause negotiation'] },
    { id: 'sp-3', title: 'Launch WoulfAI pricing page and acquire first customer', status: 'on-track', owner: 'Steve Macurdy', dueDate: '2026-03-31', progress: 85, impact: 'high', dependencies: ['Stripe integration', 'Agent intelligence layers'] },
    { id: 'sp-4', title: 'Hire 2 warehouse installers for Q2 project pipeline', status: 'behind', owner: 'Steve Macurdy', dueDate: '2026-03-20', progress: 30, impact: 'medium', dependencies: ['Job postings active', 'Interview pipeline'] },
    { id: 'sp-5', title: 'Collect overdue AR — $77.7K outstanding', status: 'behind', owner: 'Steve Macurdy', dueDate: '2026-03-15', progress: 15, impact: 'high', dependencies: ['Collections outreach', 'Mechanics lien filing'] },
  ];

  return {
    source: 'demo', okrs, departments, priorities,
    summary: {
      companyHealthScore: 68, revenue: 627000, revenueTarget: 1000000, revenueAttainment: 63,
      activeProjects: 4, totalHeadcount: 10, cashPosition: 48000, burnRate: 109630, runway: 0.44,
      okrProgress: Math.round(okrs.reduce((s, o) => s + o.overallProgress, 0) / okrs.length),
    },
    recommendations: [
      'CRITICAL: Cash runway is 13 days — collect Logicorp $69.5K immediately and delay non-essential spending',
      'Cabelas penalty clause exposure is $500/day — resolve parts delay this week or negotiate extension',
      'WoulfAI platform at 85% launch readiness — push to get first customer by end of March',
      'Sales pipeline is strong ($996K) but team is just you — hire Sales Engineer to increase capacity',
      'Finance health score is D — overdue AR is the root cause, Collections Agent strategies should be executed daily',
    ],
  };
}
