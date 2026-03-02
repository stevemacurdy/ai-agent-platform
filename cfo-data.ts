// ─── CFO Data Layer ─────────────────────────────────────
// Fetches real accounting data via Unified.to when a company
// has connected their accounting software. Falls back to demo data.

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

export async function getAccountingConnection(companyId: string): Promise<string | null> {
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

// ─── Invoice fetching ───────────────────────────────────

export interface CFOInvoice {
  id: string;
  number: string;
  client: string;
  contactName: string;
  contactEmail: string;
  amount: number;
  amountPaid: number;
  status: 'paid' | 'partial' | 'overdue' | 'sent' | 'draft';
  issueDate: string;
  dueDate: string;
  daysOverdue: number;
  lineItems: Array<{ id: string; description: string; qty: number; unitPrice: number; total: number }>;
  vendorReliabilityScore: number;
}

function calcDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function mapUnifiedInvoiceStatus(inv: any): string {
  if (inv.balance_amount === 0 || inv.status === 'paid') return 'paid';
  if (inv.paid_amount > 0) return 'partial';
  if (calcDaysOverdue(inv.due_date || inv.due_at) > 0) return 'overdue';
  return 'sent';
}

async function fetchLiveInvoices(connId: string): Promise<CFOInvoice[]> {
  try {
    const raw = await accounting.listInvoices(connId, { limit: '100' });
    const invoices = Array.isArray(raw) ? raw : raw?.results || raw?.data || [];

    return invoices.map((inv: any, idx: number) => {
      const dueDate = inv.due_date || inv.due_at || inv.updated_at || '';
      const issueDate = inv.invoice_date || inv.created_at || inv.updated_at || '';
      const total = inv.total_amount || inv.amount || 0;
      const paid = inv.paid_amount || 0;

      return {
        id: inv.id || `inv-live-${idx}`,
        number: inv.number || inv.invoice_number || `INV-${idx + 1}`,
        client: inv.customer?.name || inv.contact?.name || inv.company_name || 'Unknown',
        contactName: inv.customer?.name || inv.contact?.name || '',
        contactEmail: inv.customer?.emails?.[0]?.email || inv.contact?.email || '',
        amount: total,
        amountPaid: paid,
        status: mapUnifiedInvoiceStatus(inv) as any,
        issueDate,
        dueDate,
        daysOverdue: calcDaysOverdue(dueDate),
        lineItems: (inv.line_items || inv.lineitems || []).map((li: any, liIdx: number) => ({
          id: li.id || `li-${idx}-${liIdx}`,
          description: li.description || li.name || 'Line item',
          qty: li.quantity || 1,
          unitPrice: li.unit_amount || li.unit_price || 0,
          total: li.total_amount || (li.quantity || 1) * (li.unit_amount || 0),
        })),
        vendorReliabilityScore: 75, // Default; could be computed from payment history
      };
    });
  } catch (err) {
    console.error('[cfo-data] Failed to fetch live invoices:', err);
    return [];
  }
}

// ─── Account / P&L fetching ─────────────────────────────

export interface CFOAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

async function fetchLiveAccounts(connId: string): Promise<CFOAccount[]> {
  try {
    const raw = await accounting.listAccounts(connId, { limit: '100' });
    const accounts = Array.isArray(raw) ? raw : raw?.results || raw?.data || [];

    return accounts.map((acc: any) => ({
      id: acc.id,
      name: acc.name || 'Unknown Account',
      type: acc.type || acc.classification || 'other',
      balance: acc.current_balance || acc.balance || 0,
      currency: acc.currency || 'USD',
    }));
  } catch (err) {
    console.error('[cfo-data] Failed to fetch accounts:', err);
    return [];
  }
}

// ─── Financial Reports ──────────────────────────────────

async function fetchLiveProfitLoss(connId: string) {
  try {
    return await accounting.getProfitLoss(connId);
  } catch {
    return null;
  }
}

async function fetchLiveBalanceSheet(connId: string) {
  try {
    return await accounting.getBalanceSheet(connId);
  } catch {
    return null;
  }
}

async function fetchLiveCashflow(connId: string) {
  try {
    return await accounting.getCashflow(connId);
  } catch {
    return null;
  }
}

// ─── Main data fetcher ──────────────────────────────────

export interface CFOData {
  source: 'live' | 'demo';
  provider?: string;
  invoices: CFOInvoice[];
  accounts: CFOAccount[];
  profitLoss: any;
  balanceSheet: any;
  cashflow: any;
  summary: {
    totalRevenue: number;
    totalOutstanding: number;
    totalOverdue: number;
    totalPaid: number;
    invoiceCount: number;
    overdueCount: number;
    cashOnHand: number;
  };
}

export async function getCFOData(companyId: string): Promise<CFOData> {
  const connId = await getAccountingConnection(companyId);

  if (connId) {
    // ─── LIVE DATA ────────────────────────────
    const [invoices, accounts, profitLoss, balanceSheet, cashflow] = await Promise.all([
      fetchLiveInvoices(connId),
      fetchLiveAccounts(connId),
      fetchLiveProfitLoss(connId),
      fetchLiveBalanceSheet(connId),
      fetchLiveCashflow(connId),
    ]);

    // Lookup provider name
    const sb = supabaseAdmin();
    const { data: conn } = await (sb as any)
      .from('integration_connections')
      .select('provider')
      .eq('connection_id', connId)
      .single();

    const cashAccounts = accounts.filter(a =>
      a.type.toLowerCase().includes('bank') || a.type.toLowerCase().includes('cash')
    );
    const cashOnHand = cashAccounts.reduce((sum, a) => sum + a.balance, 0);

    const totalOutstanding = invoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

    const overdueInvs = invoices.filter(i => i.status === 'overdue');
    const totalOverdue = overdueInvs.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

    const totalPaid = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      source: 'live',
      provider: conn?.provider,
      invoices,
      accounts,
      profitLoss,
      balanceSheet,
      cashflow,
      summary: {
        totalRevenue: invoices.reduce((sum, i) => sum + i.amount, 0),
        totalOutstanding,
        totalOverdue,
        totalPaid,
        invoiceCount: invoices.length,
        overdueCount: overdueInvs.length,
        cashOnHand,
      },
    };
  }

  // ─── DEMO DATA ──────────────────────────────
  return getDemoData();
}

// ─── Demo data (existing hardcoded data) ────────────────

function getDemoData(): CFOData {
  const invoices: CFOInvoice[] = [
    { id: 'inv-1', number: 'INV/2026/00001', client: 'Logicorp', contactName: 'Marcus Chen', contactEmail: 'mchen@logicorp.com', amount: 24500, amountPaid: 0, status: 'overdue', issueDate: '2026-01-10', dueDate: '2026-01-15', daysOverdue: 32, vendorReliabilityScore: 95, lineItems: [
      { id: 'li-1a', description: 'Conveyor installation — Bay 3', qty: 1, unitPrice: 18000, total: 18000 },
      { id: 'li-1b', description: 'Electrical hookup + commissioning', qty: 1, unitPrice: 4500, total: 4500 },
      { id: 'li-1c', description: 'Safety certification', qty: 1, unitPrice: 2000, total: 2000 },
    ]},
    { id: 'inv-2', number: 'INV/2026/00002', client: 'Pinnacle Group', contactName: 'Sarah Kim', contactEmail: 'skim@pinnacle.com', amount: 14500, amountPaid: 14500, status: 'paid', issueDate: '2026-01-05', dueDate: '2026-02-05', daysOverdue: 0, vendorReliabilityScore: 88, lineItems: [
      { id: 'li-2a', description: 'Automation consulting — Phase 1', qty: 40, unitPrice: 250, total: 10000 },
      { id: 'li-2b', description: 'Travel & accommodation', qty: 1, unitPrice: 4500, total: 4500 },
    ]},
    { id: 'inv-3', number: 'INV/2026/00003', client: 'GreenLeaf Supply', contactName: 'Tom Bradley', contactEmail: 'tbradley@greenleaf.com', amount: 8200, amountPaid: 0, status: 'overdue', issueDate: '2026-01-20', dueDate: '2026-02-01', daysOverdue: 15, vendorReliabilityScore: 65, lineItems: [
      { id: 'li-3a', description: 'Racking system — 200 pallet positions', qty: 200, unitPrice: 35, total: 7000 },
      { id: 'li-3b', description: 'Installation labor', qty: 8, unitPrice: 150, total: 1200 },
    ]},
    { id: 'inv-4', number: 'INV/2026/00004', client: 'TechForge Inc', contactName: 'Daniel Park', contactEmail: 'dpark@techforge.io', amount: 32000, amountPaid: 16000, status: 'partial', issueDate: '2026-01-25', dueDate: '2026-02-25', daysOverdue: 0, vendorReliabilityScore: 72, lineItems: [
      { id: 'li-4a', description: 'Sortation system design', qty: 1, unitPrice: 12000, total: 12000 },
      { id: 'li-4b', description: 'Equipment procurement', qty: 1, unitPrice: 15000, total: 15000 },
      { id: 'li-4c', description: 'Project management', qty: 20, unitPrice: 250, total: 5000 },
    ]},
    { id: 'inv-5', number: 'INV/2026/00005', client: 'Clutch Client Co', contactName: 'Amy Torres', contactEmail: 'atorres@clutchclient.com', amount: 12400, amountPaid: 0, status: 'sent', issueDate: '2026-02-10', dueDate: '2026-03-10', daysOverdue: 0, vendorReliabilityScore: 80, lineItems: [
      { id: 'li-5a', description: 'Warehouse layout optimization', qty: 1, unitPrice: 8000, total: 8000 },
      { id: 'li-5b', description: 'CAD drawings (3 revisions)', qty: 3, unitPrice: 1200, total: 3600 },
      { id: 'li-5c', description: 'Site visit', qty: 1, unitPrice: 800, total: 800 },
    ]},
    { id: 'inv-6', number: 'INV/2026/00006', client: 'Logicorp', contactName: 'Marcus Chen', contactEmail: 'mchen@logicorp.com', amount: 45000, amountPaid: 0, status: 'overdue', issueDate: '2026-01-20', dueDate: '2026-01-30', daysOverdue: 17, vendorReliabilityScore: 95, lineItems: [
      { id: 'li-6a', description: 'Phase 2 — mezzanine construction', qty: 1, unitPrice: 35000, total: 35000 },
      { id: 'li-6b', description: 'Steel fabrication', qty: 1, unitPrice: 8000, total: 8000 },
      { id: 'li-6c', description: 'Engineering stamps', qty: 1, unitPrice: 2000, total: 2000 },
    ]},
  ];

  return {
    source: 'demo',
    invoices,
    accounts: [
      { id: 'acc-1', name: 'Business Checking', type: 'bank', balance: 48000, currency: 'USD' },
      { id: 'acc-2', name: 'Accounts Receivable', type: 'receivable', balance: 77700, currency: 'USD' },
      { id: 'acc-3', name: 'Accounts Payable', type: 'payable', balance: -32400, currency: 'USD' },
    ],
    profitLoss: null,
    balanceSheet: null,
    cashflow: null,
    summary: {
      totalRevenue: 136600,
      totalOutstanding: 106100,
      totalOverdue: 77700,
      totalPaid: 30500,
      invoiceCount: 6,
      overdueCount: 3,
      cashOnHand: 48000,
    },
  };
}

// ─── Health Score Calculator ────────────────────────────

export function calculateHealthScore(data: CFOData) {
  const { summary } = data;
  const cash = summary.cashOnHand;
  const totalAR = summary.totalOutstanding;
  const overdueAR = summary.totalOverdue;
  const monthlyRevenue = summary.totalRevenue / 3; // Approximate from invoice history
  const monthlyBurn = 109630; // Could be pulled from bills in future

  const currentLiabilities = monthlyBurn;
  const quickRatio = currentLiabilities > 0 ? (cash + totalAR) / currentLiabilities : 0;
  const dso = monthlyRevenue > 0 ? Math.round((totalAR / monthlyRevenue) * 30) : 0;
  const burnRate = monthlyBurn;
  const runway = burnRate > 0 ? cash / burnRate : 0;
  const overdueRatio = totalAR > 0 ? overdueAR / totalAR : 0;

  let score = 50;
  score += quickRatio >= 1.5 ? 20 : quickRatio >= 1.0 ? 10 : 0;
  score += dso < 30 ? 20 : dso <= 45 ? 15 : dso <= 60 ? 10 : 0;
  score += runway >= 3 ? 10 : runway >= 1 ? 5 : 0;
  if (overdueRatio > 0.5) score -= 15;
  else if (overdueRatio > 0.3) score -= 10;
  score = Math.max(0, Math.min(100, score));

  return {
    healthScore: score,
    grade: score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F',
    metrics: {
      quickRatio: { value: Math.round(quickRatio * 100) / 100, target: 1.5, status: quickRatio >= 1.5 ? 'good' : quickRatio >= 1.0 ? 'warning' : 'critical' },
      dso: { value: dso, target: 45, status: dso <= 45 ? 'good' : dso <= 60 ? 'warning' : 'critical', unit: 'days' },
      burnRate: { value: burnRate, status: 'info' },
      runway: { value: Math.round(runway * 10) / 10, status: runway >= 3 ? 'good' : runway >= 1 ? 'warning' : 'critical', unit: 'months' },
      overdueRatio: { value: Math.round(overdueRatio * 100), status: overdueRatio <= 0.2 ? 'good' : overdueRatio <= 0.4 ? 'warning' : 'critical', unit: '%' },
    },
    recommendations: generateRecommendations(score, quickRatio, dso, overdueRatio, runway),
  };
}

function generateRecommendations(score: number, quickRatio: number, dso: number, overdueRatio: number, runway: number): string[] {
  const recs: string[] = [];
  if (overdueRatio > 0.3) recs.push('High overdue ratio — run collection strategies on aging invoices immediately');
  if (dso > 45) recs.push('DSO exceeds 45 days — tighten payment terms on new contracts to Net 15');
  if (quickRatio < 1.0) recs.push('Quick ratio below 1.0 — consider a line of credit or accelerate AR collections');
  if (runway < 2) recs.push('Less than 2 months runway — prioritize cash preservation and fast-track overdue collections');
  if (score >= 75) recs.push('Financial position is solid — consider investing surplus cash in growth initiatives');
  if (recs.length === 0) recs.push('No urgent actions needed. Continue monitoring weekly.');
  return recs;
}

// ─── Collections Strategy Generator ─────────────────────

export function generateCollectionStrategies(invoices: CFOInvoice[]) {
  const overdue = invoices.filter(i => i.status === 'overdue');

  return overdue.map(inv => {
    const days = inv.daysOverdue;
    const score = inv.vendorReliabilityScore;
    const outstanding = inv.amount - inv.amountPaid;

    // Tiered strategy based on days overdue + reliability
    let urgency: 'low' | 'medium' | 'high' | 'critical';
    let strategy: string;
    let actions: string[];
    let tone: string;

    if (days <= 7) {
      urgency = 'low';
      tone = 'friendly';
      strategy = 'Gentle reminder';
      actions = ['Send friendly payment reminder email', 'Confirm invoice was received'];
    } else if (days <= 15 && score >= 80) {
      urgency = 'low';
      tone = 'professional';
      strategy = 'Professional follow-up (high-trust client)';
      actions = ['Personal email from account manager', 'Offer to discuss if there are questions'];
    } else if (days <= 15) {
      urgency = 'medium';
      tone = 'firm';
      strategy = 'Firm follow-up';
      actions = ['Send formal past-due notice', 'Phone call to AP department', 'Request payment timeline'];
    } else if (days <= 30 && score >= 85) {
      urgency = 'medium';
      tone = 'professional';
      strategy = 'Escalate with trust — offer payment plan';
      actions = ['Account manager phone call', 'Offer 2-installment payment plan', 'Set 7-day follow-up reminder'];
    } else if (days <= 30) {
      urgency = 'high';
      tone = 'urgent';
      strategy = 'Escalation — formal demand';
      actions = ['Formal demand letter', 'Suspend new work orders', 'Daily follow-up until resolved'];
    } else {
      urgency = 'critical';
      tone = 'final';
      strategy = days > 60 ? 'Final notice — legal preparation' : 'Aggressive collections';
      actions = days > 60
        ? ['Send final notice (10-day cure period)', 'Engage collections attorney', 'File mechanics lien if applicable']
        : ['CEO-to-CEO escalation call', 'Formal demand with legal CC', 'Pause all current projects', 'Prepare small claims filing'];
    }

    return {
      invoiceId: inv.id,
      invoiceNumber: inv.number,
      client: inv.client,
      contactName: inv.contactName,
      contactEmail: inv.contactEmail,
      outstanding,
      daysOverdue: days,
      reliabilityScore: score,
      urgency,
      tone,
      strategy,
      actions,
      estimatedRecovery: urgency === 'critical' ? outstanding * 0.6 : urgency === 'high' ? outstanding * 0.8 : outstanding,
    };
  }).sort((a, b) => b.outstanding - a.outstanding);
}

// ─── Cashflow Projection ────────────────────────────────

export function projectCashflow(data: CFOData) {
  const now = new Date();
  const windows = [
    { label: '0–7 days', start: 0, end: 7 },
    { label: '8–14 days', start: 8, end: 14 },
    { label: '15–30 days', start: 15, end: 30 },
    { label: '31–60 days', start: 31, end: 60 },
    { label: '61–90 days', start: 61, end: 90 },
  ];

  let runningCash = data.summary.cashOnHand;
  const weeklyBurn = 109630 / 4.3; // ~$25,495/week

  return windows.map(w => {
    const weekCount = (w.end - w.start) / 7;
    const outflows = weeklyBurn * weekCount;

    // Expected inflows: invoices due in this window
    const expectedInflows = data.invoices
      .filter(inv => {
        if (inv.status === 'paid') return false;
        const due = new Date(inv.dueDate);
        const daysFromNow = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysFromNow >= w.start && daysFromNow <= w.end;
      })
      .reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0);

    // Overdue invoices: probability-weighted
    const overdueInflows = data.invoices
      .filter(inv => inv.status === 'overdue' && w.start === 0)
      .reduce((sum, inv) => {
        const prob = inv.vendorReliabilityScore >= 85 ? 0.7 : inv.vendorReliabilityScore >= 65 ? 0.4 : 0.2;
        return sum + (inv.amount - inv.amountPaid) * prob;
      }, 0);

    const totalInflows = expectedInflows + (w.start === 0 ? overdueInflows : 0);
    runningCash = runningCash + totalInflows - outflows;

    return {
      window: w.label,
      inflows: Math.round(totalInflows),
      outflows: Math.round(outflows),
      netCash: Math.round(runningCash),
      risk: runningCash < 0 ? 'critical' : runningCash < 20000 ? 'warning' : 'healthy',
    };
  });
}
