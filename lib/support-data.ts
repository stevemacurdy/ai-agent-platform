// ─── Support Agent Data Layer ─────────────────────────────
// Customer support tickets, SLA tracking, satisfaction
// scores, and knowledge base analytics.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface Ticket { id: string; subject: string; client: string; contactEmail: string; category: string; priority: 'low' | 'medium' | 'high' | 'critical'; status: 'new' | 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed'; assignee: string; createdAt: string; updatedAt: string; slaDeadline: string; slaBreach: boolean; responseTime: number; resolutionTime: number | null; satisfaction: number | null; }
export interface SLAMetric { tier: string; targetResponseHrs: number; targetResolutionHrs: number; actualAvgResponseHrs: number; actualAvgResolutionHrs: number; complianceRate: number; status: 'met' | 'at-risk' | 'breached'; }
export interface SupportData { source: 'live' | 'demo'; tickets: Ticket[]; sla: SLAMetric[]; summary: { totalTickets: number; openTickets: number; criticalTickets: number; avgResponseTime: number; avgResolutionTime: number; slaCompliance: number; csat: number; ticketsToday: number; resolvedToday: number; backlog: number; }; recommendations: string[]; }

export async function getSupportData(companyId: string): Promise<SupportData> { return getDemoSupport(); }

function getDemoSupport(): SupportData {
  const tickets: Ticket[] = [
    { id: 'tkt-1', subject: 'Conveyor belt jamming at merge point', client: 'Cabelas', contactEmail: 'ops@cabelas.com', category: 'Equipment', priority: 'critical', status: 'in-progress', assignee: 'David Chen', createdAt: '2026-03-02T08:30:00Z', updatedAt: '2026-03-02T09:15:00Z', slaDeadline: '2026-03-02T12:30:00Z', slaBreach: false, responseTime: 0.75, resolutionTime: null, satisfaction: null },
    { id: 'tkt-2', subject: 'Pick module label printer offline', client: 'Sportsmans Warehouse', contactEmail: 'whse@sportsmans.com', category: 'IT/Systems', priority: 'high', status: 'open', assignee: 'Sofia Ramirez', createdAt: '2026-03-02T10:00:00Z', updatedAt: '2026-03-02T10:00:00Z', slaDeadline: '2026-03-02T18:00:00Z', slaBreach: false, responseTime: 0, resolutionTime: null, satisfaction: null },
    { id: 'tkt-3', subject: 'Racking bolt torque specs needed', client: 'Logicorp', contactEmail: 'mchen@logicorp.com', category: 'Documentation', priority: 'low', status: 'resolved', assignee: 'Marcus Torres', createdAt: '2026-03-01T14:00:00Z', updatedAt: '2026-03-01T15:30:00Z', slaDeadline: '2026-03-02T14:00:00Z', slaBreach: false, responseTime: 0.5, resolutionTime: 1.5, satisfaction: 5 },
    { id: 'tkt-4', subject: 'Forklift access badge not working', client: 'Clutch Client Co', contactEmail: 'atorres@clutchclient.com', category: 'Access', priority: 'medium', status: 'waiting', assignee: 'Sofia Ramirez', createdAt: '2026-02-28T16:00:00Z', updatedAt: '2026-03-01T09:00:00Z', slaDeadline: '2026-03-01T16:00:00Z', slaBreach: true, responseTime: 1.0, resolutionTime: null, satisfaction: null },
    { id: 'tkt-5', subject: 'Safety inspection report request', client: 'FreshDirect Logistics', contactEmail: 'skim@freshdirect.com', category: 'Documentation', priority: 'medium', status: 'new', assignee: 'Unassigned', createdAt: '2026-03-02T11:00:00Z', updatedAt: '2026-03-02T11:00:00Z', slaDeadline: '2026-03-03T11:00:00Z', slaBreach: false, responseTime: 0, resolutionTime: null, satisfaction: null },
    { id: 'tkt-6', subject: 'Mezzanine load rating signage missing', client: 'Logicorp', contactEmail: 'mchen@logicorp.com', category: 'Safety', priority: 'high', status: 'in-progress', assignee: 'Tyler Smith', createdAt: '2026-02-27T10:00:00Z', updatedAt: '2026-03-01T14:00:00Z', slaDeadline: '2026-02-28T10:00:00Z', slaBreach: true, responseTime: 2.0, resolutionTime: null, satisfaction: null },
  ];

  const sla: SLAMetric[] = [
    { tier: 'Critical', targetResponseHrs: 1, targetResolutionHrs: 4, actualAvgResponseHrs: 0.75, actualAvgResolutionHrs: 3.5, complianceRate: 92, status: 'met' },
    { tier: 'High', targetResponseHrs: 4, targetResolutionHrs: 8, actualAvgResponseHrs: 2.0, actualAvgResolutionHrs: 6.5, complianceRate: 88, status: 'met' },
    { tier: 'Medium', targetResponseHrs: 8, targetResolutionHrs: 24, actualAvgResponseHrs: 5.0, actualAvgResolutionHrs: 18.0, complianceRate: 78, status: 'at-risk' },
    { tier: 'Low', targetResponseHrs: 24, targetResolutionHrs: 72, actualAvgResponseHrs: 12.0, actualAvgResolutionHrs: 36.0, complianceRate: 95, status: 'met' },
  ];

  const open = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');

  return {
    source: 'demo', tickets, sla,
    summary: {
      totalTickets: tickets.length, openTickets: open.length, criticalTickets: open.filter(t => t.priority === 'critical').length,
      avgResponseTime: 1.2, avgResolutionTime: 8.5, slaCompliance: 88, csat: 4.6,
      ticketsToday: tickets.filter(t => t.createdAt.startsWith('2026-03-02')).length, resolvedToday: tickets.filter(t => t.status === 'resolved' && t.updatedAt.startsWith('2026-03')).length,
      backlog: open.filter(t => t.slaBreach).length,
    },
    recommendations: [
      'Ticket #4 (Clutch badge) has breached SLA — resolve immediately and send apology to client',
      'Ticket #6 (Logicorp signage) breached SLA by 2 days — safety item, prioritize today',
      'Ticket #5 unassigned — assign FreshDirect safety report to Sofia before EOD',
      'Medium-priority SLA compliance at 78% — consider hiring part-time support coordinator',
      'CSAT at 4.6/5.0 — strong performance, maintain response time standards',
    ],
  };
}
