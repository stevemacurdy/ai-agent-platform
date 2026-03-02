// ─── Collections Agent Data Layer ─────────────────────────
// Specialized in accounts receivable recovery, aging analysis,
// and automated collection workflows. Uses CFO's accounting
// connection for live data.

import { createClient } from '@supabase/supabase-js';
import { accounting } from '@/lib/unified';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Connection lookup ──────────────────────────────────

async function getAccountingConnection(companyId: string): Promise<string | null> {
  try {
    const sb = supabaseAdmin();
    const { data } = await (sb as any)
      .from('integration_connections')
      .select('connection_id')
      .eq('company_id', companyId)
      .eq('category', 'accounting')
      .eq('status', 'active')
      .single();
    return data?.connection_id || null;
  } catch {
    return null;
  }
}

// ─── Types ──────────────────────────────────────────────

export interface CollectionsAccount {
  id: string;
  client: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  totalOwed: number;
  invoiceCount: number;
  oldestOverdueDays: number;
  avgDaysOverdue: number;
  reliabilityScore: number;
  riskTier: 'low' | 'medium' | 'high' | 'critical';
  lastContactDate: string | null;
  lastPaymentDate: string | null;
  suggestedAction: string;
}

export interface AgingBucket {
  label: string;
  range: string;
  count: number;
  totalAmount: number;
  percentOfTotal: number;
}

export interface CollectionsData {
  source: 'live' | 'demo';
  provider?: string;
  accounts: CollectionsAccount[];
  aging: AgingBucket[];
  summary: {
    totalAR: number;
    totalOverdue: number;
    overduePercent: number;
    accountsAtRisk: number;
    avgDSO: number;
    estimatedRecovery: number;
    collectionRate: number;
    totalAccounts: number;
  };
  workflows: CollectionWorkflow[];
}

export interface CollectionWorkflow {
  id: string;
  accountId: string;
  client: string;
  type: 'reminder' | 'follow-up' | 'escalation' | 'final-notice' | 'legal';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  scheduledDate: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// ─── Risk scoring ───────────────────────────────────────

function calcRiskTier(daysOverdue: number, reliabilityScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (daysOverdue > 60 || (daysOverdue > 30 && reliabilityScore < 50)) return 'critical';
  if (daysOverdue > 30 || (daysOverdue > 15 && reliabilityScore < 65)) return 'high';
  if (daysOverdue > 7 || reliabilityScore < 75) return 'medium';
  return 'low';
}

function suggestAction(daysOverdue: number, reliabilityScore: number, totalOwed: number): string {
  if (daysOverdue > 60) return totalOwed > 10000 ? 'Engage collections attorney' : 'Send final notice with 10-day cure period';
  if (daysOverdue > 30) return reliabilityScore > 80 ? 'Offer payment plan — high-trust client' : 'Formal demand letter + suspend new work';
  if (daysOverdue > 15) return 'Phone call to AP + request payment timeline';
  if (daysOverdue > 7) return 'Send formal past-due notice';
  return 'Friendly payment reminder email';
}

// ─── Live data fetching ─────────────────────────────────

async function fetchLiveCollections(connId: string): Promise<CollectionsAccount[]> {
  try {
    const raw = await accounting.listInvoices(connId, { limit: '200' });
    const invoices = Array.isArray(raw) ? raw : raw?.results || raw?.data || [];

    // Group by client
    const clientMap = new Map<string, any[]>();
    for (const inv of invoices) {
      const client = inv.customer?.name || inv.contact?.name || inv.company_name || 'Unknown';
      if (!clientMap.has(client)) clientMap.set(client, []);
      clientMap.get(client)!.push(inv);
    }

    const accounts: CollectionsAccount[] = [];
    for (const [client, invs] of clientMap) {
      const overdue = invs.filter((i: any) => {
        const due = new Date(i.due_date || i.due_at || '');
        return due < new Date() && (i.balance_amount > 0 || i.status !== 'paid');
      });

      if (overdue.length === 0) continue;

      const totalOwed = overdue.reduce((s: number, i: any) => s + (i.balance_amount || i.total_amount || 0), 0);
      const daysArr = overdue.map((i: any) => {
        const due = new Date(i.due_date || i.due_at || '');
        return Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000));
      });
      const oldestDays = Math.max(...daysArr);
      const avgDays = Math.round(daysArr.reduce((a: number, b: number) => a + b, 0) / daysArr.length);

      accounts.push({
        id: `coll-${client.replace(/\s+/g, '-').toLowerCase()}`,
        client,
        contactName: overdue[0]?.customer?.name || overdue[0]?.contact?.name || '',
        contactEmail: overdue[0]?.customer?.emails?.[0]?.email || overdue[0]?.contact?.email || '',
        contactPhone: overdue[0]?.customer?.phone || '',
        totalOwed,
        invoiceCount: overdue.length,
        oldestOverdueDays: oldestDays,
        avgDaysOverdue: avgDays,
        reliabilityScore: 75,
        riskTier: calcRiskTier(oldestDays, 75),
        lastContactDate: null,
        lastPaymentDate: null,
        suggestedAction: suggestAction(oldestDays, 75, totalOwed),
      });
    }

    return accounts.sort((a, b) => b.totalOwed - a.totalOwed);
  } catch (err) {
    console.error('[collections-data] Failed to fetch live data:', err);
    return [];
  }
}

// ─── Aging analysis ─────────────────────────────────────

function buildAging(accounts: CollectionsAccount[]): AgingBucket[] {
  const buckets = [
    { label: 'Current', range: '0-7 days', min: 0, max: 7 },
    { label: 'Early', range: '8-15 days', min: 8, max: 15 },
    { label: 'Mid', range: '16-30 days', min: 16, max: 30 },
    { label: 'Late', range: '31-60 days', min: 31, max: 60 },
    { label: 'Delinquent', range: '60+ days', min: 61, max: 9999 },
  ];

  const totalAR = accounts.reduce((s, a) => s + a.totalOwed, 0);

  return buckets.map(b => {
    const inBucket = accounts.filter(a => a.oldestOverdueDays >= b.min && a.oldestOverdueDays <= b.max);
    const amount = inBucket.reduce((s, a) => s + a.totalOwed, 0);
    return {
      label: b.label,
      range: b.range,
      count: inBucket.length,
      totalAmount: amount,
      percentOfTotal: totalAR > 0 ? Math.round((amount / totalAR) * 100) : 0,
    };
  });
}

// ─── Workflow generator ─────────────────────────────────

function generateWorkflows(accounts: CollectionsAccount[]): CollectionWorkflow[] {
  const now = new Date();
  return accounts.map((acc, idx) => {
    let type: CollectionWorkflow['type'];
    let description: string;

    if (acc.oldestOverdueDays > 60) {
      type = 'legal';
      description = `Prepare legal filing for ${acc.client} — $${acc.totalOwed.toLocaleString()} outstanding ${acc.oldestOverdueDays} days`;
    } else if (acc.oldestOverdueDays > 30) {
      type = 'escalation';
      description = `Escalate: CEO-to-CEO call with ${acc.client} re: $${acc.totalOwed.toLocaleString()}`;
    } else if (acc.oldestOverdueDays > 15) {
      type = 'follow-up';
      description = `Phone follow-up with ${acc.contactName || acc.client} AP department`;
    } else if (acc.oldestOverdueDays > 7) {
      type = 'follow-up';
      description = `Send formal past-due notice to ${acc.client}`;
    } else {
      type = 'reminder';
      description = `Friendly reminder email to ${acc.contactEmail || acc.client}`;
    }

    const scheduledDate = new Date(now.getTime() + (idx + 1) * 86400000).toISOString().split('T')[0];

    return {
      id: `wf-${idx + 1}`,
      accountId: acc.id,
      client: acc.client,
      type,
      status: 'pending' as const,
      scheduledDate,
      description,
      priority: acc.riskTier,
    };
  });
}

// ─── Main data fetcher ──────────────────────────────────

export async function getCollectionsData(companyId: string): Promise<CollectionsData> {
  const connId = await getAccountingConnection(companyId);

  if (connId) {
    const accounts = await fetchLiveCollections(connId);
    const aging = buildAging(accounts);
    const workflows = generateWorkflows(accounts);

    const sb = supabaseAdmin();
    const { data: conn } = await (sb as any)
      .from('integration_connections')
      .select('provider')
      .eq('connection_id', connId)
      .single();

    const totalAR = accounts.reduce((s, a) => s + a.totalOwed, 0);
    const totalOverdue = accounts.filter(a => a.oldestOverdueDays > 0).reduce((s, a) => s + a.totalOwed, 0);

    return {
      source: 'live',
      provider: conn?.provider || 'accounting',
      accounts,
      aging,
      workflows,
      summary: {
        totalAR,
        totalOverdue,
        overduePercent: totalAR > 0 ? Math.round((totalOverdue / totalAR) * 100) : 0,
        accountsAtRisk: accounts.filter(a => a.riskTier === 'high' || a.riskTier === 'critical').length,
        avgDSO: accounts.length > 0 ? Math.round(accounts.reduce((s, a) => s + a.avgDaysOverdue, 0) / accounts.length) : 0,
        estimatedRecovery: accounts.reduce((s, a) => {
          const rate = a.riskTier === 'critical' ? 0.5 : a.riskTier === 'high' ? 0.7 : a.riskTier === 'medium' ? 0.85 : 0.95;
          return s + a.totalOwed * rate;
        }, 0),
        collectionRate: 78,
        totalAccounts: accounts.length,
      },
    };
  }

  // ─── DEMO DATA ────────────────────────────────
  return getDemoCollections();
}

function getDemoCollections(): CollectionsData {
  const accounts: CollectionsAccount[] = [
    {
      id: 'coll-1', client: 'Logicorp', contactName: 'Marcus Chen', contactEmail: 'mchen@logicorp.com', contactPhone: '(801) 555-0142',
      totalOwed: 69500, invoiceCount: 2, oldestOverdueDays: 32, avgDaysOverdue: 24, reliabilityScore: 95,
      riskTier: 'high', lastContactDate: '2026-02-20', lastPaymentDate: '2026-01-05',
      suggestedAction: 'Offer payment plan — high-trust client',
    },
    {
      id: 'coll-2', client: 'GreenLeaf Supply', contactName: 'Tom Bradley', contactEmail: 'tbradley@greenleaf.com', contactPhone: '(801) 555-0198',
      totalOwed: 8200, invoiceCount: 1, oldestOverdueDays: 15, avgDaysOverdue: 15, reliabilityScore: 65,
      riskTier: 'medium', lastContactDate: '2026-02-25', lastPaymentDate: '2025-12-15',
      suggestedAction: 'Phone call to AP + request payment timeline',
    },
    {
      id: 'coll-3', client: 'TechForge Inc', contactName: 'Daniel Park', contactEmail: 'dpark@techforge.io', contactPhone: '(385) 555-0167',
      totalOwed: 16000, invoiceCount: 1, oldestOverdueDays: 5, avgDaysOverdue: 5, reliabilityScore: 72,
      riskTier: 'low', lastContactDate: null, lastPaymentDate: '2026-02-10',
      suggestedAction: 'Friendly payment reminder email',
    },
    {
      id: 'coll-4', client: 'Summit Logistics', contactName: 'Karen Wells', contactEmail: 'kwells@summitlog.com', contactPhone: '(801) 555-0231',
      totalOwed: 23400, invoiceCount: 3, oldestOverdueDays: 45, avgDaysOverdue: 35, reliabilityScore: 55,
      riskTier: 'critical', lastContactDate: '2026-02-10', lastPaymentDate: '2025-11-28',
      suggestedAction: 'Formal demand letter + suspend new work',
    },
  ];

  const aging = buildAging(accounts);
  const workflows = generateWorkflows(accounts);
  const totalAR = accounts.reduce((s, a) => s + a.totalOwed, 0);
  const totalOverdue = accounts.filter(a => a.oldestOverdueDays > 7).reduce((s, a) => s + a.totalOwed, 0);

  return {
    source: 'demo',
    accounts,
    aging,
    workflows,
    summary: {
      totalAR,
      totalOverdue,
      overduePercent: Math.round((totalOverdue / totalAR) * 100),
      accountsAtRisk: accounts.filter(a => a.riskTier === 'high' || a.riskTier === 'critical').length,
      avgDSO: Math.round(accounts.reduce((s, a) => s + a.avgDaysOverdue, 0) / accounts.length),
      estimatedRecovery: Math.round(totalAR * 0.78),
      collectionRate: 78,
      totalAccounts: accounts.length,
    },
  };
}
