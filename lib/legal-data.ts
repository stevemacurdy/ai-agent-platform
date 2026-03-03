// ─── Legal Agent Data Layer ───────────────────────────────
// Contract tracking, compliance deadlines, risk assessment,
// lien management, and legal document status.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface Contract { id: string; title: string; counterparty: string; type: 'client' | 'vendor' | 'subcontractor' | 'lease' | 'insurance' | 'nda'; status: 'active' | 'pending-review' | 'expired' | 'draft' | 'terminated'; value: number; startDate: string; endDate: string; autoRenew: boolean; daysUntilExpiry: number; keyTerms: string[]; riskLevel: 'low' | 'medium' | 'high'; }
export interface LegalTask { id: string; title: string; type: 'filing' | 'review' | 'lien' | 'dispute' | 'compliance'; status: 'pending' | 'in-progress' | 'completed' | 'overdue'; dueDate: string; priority: 'low' | 'medium' | 'high' | 'critical'; assignee: string; description: string; }
export interface LegalData { source: 'live' | 'demo'; contracts: Contract[]; tasks: LegalTask[]; summary: { activeContracts: number; expiringContracts: number; pendingReviews: number; totalContractValue: number; openDisputes: number; overdueTasks: number; liensActive: number; complianceScore: number; }; recommendations: string[]; }

export async function getLegalData(companyId: string): Promise<LegalData> { return getDemoLegal(); }

function getDemoLegal(): LegalData {
  const contracts: Contract[] = [
    { id: 'con-1', title: 'Logicorp — Phase 2 Construction Agreement', counterparty: 'Logicorp', type: 'client', status: 'active', value: 285000, startDate: '2026-01-15', endDate: '2026-04-15', autoRenew: false, daysUntilExpiry: 44, keyTerms: ['Net 30 payment', 'Penalty clause for delays >14 days', 'Change order process defined'], riskLevel: 'medium' },
    { id: 'con-2', title: 'Cabelas — Bay 3 Conveyor Upgrade', counterparty: 'Cabelas', type: 'client', status: 'active', value: 92000, startDate: '2026-02-01', endDate: '2026-03-15', autoRenew: false, daysUntilExpiry: 13, keyTerms: ['Liquidated damages $500/day after deadline', 'Materials warranty 1 year', 'Insurance min $2M'], riskLevel: 'high' },
    { id: 'con-3', title: 'Daifuku — Equipment Supply Agreement', counterparty: 'Daifuku North America', type: 'vendor', status: 'active', value: 180000, startDate: '2025-06-01', endDate: '2026-04-15', autoRenew: true, daysUntilExpiry: 44, keyTerms: ['Volume discount Tier 2', 'Lead time guarantee 45 days', '90-day payment terms'], riskLevel: 'low' },
    { id: 'con-4', title: 'Prologis — Warehouse Lease', counterparty: 'Prologis', type: 'lease', status: 'active', value: 264000, startDate: '2024-01-01', endDate: '2027-01-01', autoRenew: true, daysUntilExpiry: 305, keyTerms: ['$22K/mo', 'Triple net', '3% annual escalation', '60-day termination notice'], riskLevel: 'low' },
    { id: 'con-5', title: 'Mountain West Staffing — Temp Labor', counterparty: 'Mountain West Staffing', type: 'vendor', status: 'active', value: 0, startDate: '2025-01-01', endDate: '2026-06-30', autoRenew: false, daysUntilExpiry: 120, keyTerms: ['Hourly rate schedule', '24hr cancellation', 'Workers comp covered by staffing agency'], riskLevel: 'low' },
    { id: 'con-6', title: 'FreshDirect — Cold Storage Proposal', counterparty: 'FreshDirect Logistics', type: 'client', status: 'pending-review', value: 185000, startDate: '2026-03-15', endDate: '2026-05-30', autoRenew: false, daysUntilExpiry: 89, keyTerms: ['Pending legal review', 'Non-standard indemnification clause', 'Performance bond required'], riskLevel: 'medium' },
  ];

  const tasks: LegalTask[] = [
    { id: 'lt-1', title: 'Review FreshDirect contract indemnification clause', type: 'review', status: 'in-progress', dueDate: '2026-03-07', priority: 'high', assignee: 'Steve Macurdy', description: 'Non-standard indemnification — need to negotiate mutual indemnity' },
    { id: 'lt-2', title: 'File mechanics lien — GreenLeaf Supply', type: 'lien', status: 'pending', dueDate: '2026-03-15', priority: 'critical', assignee: 'Steve Macurdy', description: '$8,200 overdue 15+ days. Utah lien deadline is 180 days from last work performed.' },
    { id: 'lt-3', title: 'Renew general liability insurance', type: 'compliance', status: 'pending', dueDate: '2026-04-01', priority: 'high', assignee: 'Sofia Ramirez', description: 'Policy renewal due. Get competing quotes — current premium $6,800/mo' },
    { id: 'lt-4', title: 'Cabelas penalty clause review', type: 'review', status: 'pending', dueDate: '2026-03-10', priority: 'critical', assignee: 'Steve Macurdy', description: 'Project at risk of delay — review penalty exposure ($500/day) and prepare mitigation letter' },
    { id: 'lt-5', title: 'Annual OSHA compliance audit', type: 'compliance', status: 'pending', dueDate: '2026-04-15', priority: 'medium', assignee: 'Sofia Ramirez', description: 'Schedule annual safety audit and update injury/illness log (OSHA 300)' },
  ];

  const expiring = contracts.filter(c => c.daysUntilExpiry <= 30 && c.status === 'active').length;

  return {
    source: 'demo', contracts, tasks,
    summary: {
      activeContracts: contracts.filter(c => c.status === 'active').length, expiringContracts: expiring,
      pendingReviews: contracts.filter(c => c.status === 'pending-review').length + tasks.filter(t => t.type === 'review' && t.status !== 'completed').length,
      totalContractValue: contracts.reduce((s, c) => s + c.value, 0), openDisputes: 0,
      overdueTasks: tasks.filter(t => t.status === 'overdue').length, liensActive: tasks.filter(t => t.type === 'lien').length, complianceScore: 82,
    },
    recommendations: [
      'Cabelas contract has $500/day penalty clause — project is at risk of delay, prepare force majeure / mitigation letter NOW',
      'FreshDirect indemnification clause is non-standard — counter with mutual indemnity before signing',
      'GreenLeaf mechanics lien deadline approaching — file to preserve rights on $8,200 receivable',
      'Insurance renewal due April 1 — start getting competitive quotes this week',
      'Daifuku agreement auto-renews — review pricing terms before April 15',
    ],
  };
}
