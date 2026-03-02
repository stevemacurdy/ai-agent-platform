// ─── Payables Agent Data Layer ────────────────────────────
// Manages accounts payable, bill scheduling, early payment
// discounts, and vendor payment optimization.
// Uses accounting connection for live data.

import { createClient } from '@supabase/supabase-js';
import { accounting } from '@/lib/unified';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

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

export interface Bill {
  id: string;
  vendor: string;
  vendorEmail: string;
  description: string;
  amount: number;
  amountPaid: number;
  status: 'pending' | 'scheduled' | 'paid' | 'overdue' | 'partial';
  issueDate: string;
  dueDate: string;
  daysTilDue: number;
  hasEarlyDiscount: boolean;
  discountPercent: number;
  discountDeadline: string | null;
  discountSavings: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PaymentSchedule {
  week: string;
  startDate: string;
  bills: { billId: string; vendor: string; amount: number; dueDate: string }[];
  totalDue: number;
  cashAfterPayment: number;
  risk: 'healthy' | 'warning' | 'critical';
}

export interface PayablesData {
  source: 'live' | 'demo';
  provider?: string;
  bills: Bill[];
  schedule: PaymentSchedule[];
  summary: {
    totalPayable: number;
    totalDueThisWeek: number;
    totalDueThisMonth: number;
    totalOverdue: number;
    overdueCount: number;
    availableDiscounts: number;
    potentialSavings: number;
    avgPaymentDays: number;
    vendorCount: number;
    cashOnHand: number;
  };
  recommendations: string[];
}

// ─── Helpers ────────────────────────────────────────────

function calcDaysTilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  return Math.floor((due.getTime() - now.getTime()) / 86400000);
}

function calcPriority(daysTilDue: number, amount: number): 'low' | 'medium' | 'high' | 'critical' {
  if (daysTilDue < 0) return 'critical';
  if (daysTilDue <= 3) return 'high';
  if (daysTilDue <= 7 || amount > 20000) return 'medium';
  return 'low';
}

// ─── Live data fetching ─────────────────────────────────

async function fetchLiveBills(connId: string): Promise<Bill[]> {
  try {
    // Unified.to accounting API for bills/payments
    const raw = await accounting.listInvoices(connId, { limit: '200' });
    const payments = Array.isArray(raw) ? raw : raw?.results || raw?.data || [];

    return payments.map((p: any, idx: number) => {
      const dueDate = p.due_date || p.due_at || p.updated_at || '';
      const daysTilDue = calcDaysTilDue(dueDate);
      const amount = p.total_amount || p.amount || 0;
      const paid = p.paid_amount || 0;

      let status: Bill['status'] = 'pending';
      if (paid >= amount) status = 'paid';
      else if (paid > 0) status = 'partial';
      else if (daysTilDue < 0) status = 'overdue';

      return {
        id: p.id || `bill-live-${idx}`,
        vendor: p.vendor?.name || p.contact?.name || p.company_name || 'Unknown Vendor',
        vendorEmail: p.vendor?.email || p.contact?.email || '',
        description: p.description || p.memo || `Payment to ${p.vendor?.name || 'vendor'}`,
        amount,
        amountPaid: paid,
        status,
        issueDate: p.invoice_date || p.created_at || '',
        dueDate,
        daysTilDue,
        hasEarlyDiscount: false,
        discountPercent: 0,
        discountDeadline: null,
        discountSavings: 0,
        category: p.account?.name || 'General',
        priority: calcPriority(daysTilDue, amount),
      };
    });
  } catch (err) {
    console.error('[payables-data] Failed to fetch live bills:', err);
    return [];
  }
}

// ─── Payment schedule builder ───────────────────────────

function buildSchedule(bills: Bill[], cashOnHand: number): PaymentSchedule[] {
  const now = new Date();
  const weeks = [
    { label: 'This Week', start: 0, end: 7 },
    { label: 'Next Week', start: 8, end: 14 },
    { label: 'Week 3', start: 15, end: 21 },
    { label: 'Week 4', start: 22, end: 30 },
  ];

  let runningCash = cashOnHand;

  return weeks.map(w => {
    const startDate = new Date(now.getTime() + w.start * 86400000).toISOString().split('T')[0];
    const weekBills = bills
      .filter(b => b.status !== 'paid' && b.daysTilDue >= w.start && b.daysTilDue <= w.end)
      .map(b => ({ billId: b.id, vendor: b.vendor, amount: b.amount - b.amountPaid, dueDate: b.dueDate }));

    // Also include overdue bills in the first week
    if (w.start === 0) {
      const overdueBills = bills
        .filter(b => b.status === 'overdue')
        .map(b => ({ billId: b.id, vendor: b.vendor, amount: b.amount - b.amountPaid, dueDate: b.dueDate }));
      weekBills.push(...overdueBills);
    }

    const totalDue = weekBills.reduce((s, b) => s + b.amount, 0);
    runningCash -= totalDue;

    return {
      week: w.label,
      startDate,
      bills: weekBills,
      totalDue,
      cashAfterPayment: Math.round(runningCash),
      risk: runningCash < 0 ? 'critical' as const : runningCash < 15000 ? 'warning' as const : 'healthy' as const,
    };
  });
}

// ─── Recommendations ────────────────────────────────────

function generateRecommendations(bills: Bill[], summary: PayablesData['summary']): string[] {
  const recs: string[] = [];

  if (summary.overdueCount > 0) {
    recs.push(`${summary.overdueCount} overdue bills totaling $${summary.totalOverdue.toLocaleString()} — pay immediately to avoid late fees and damaged vendor relationships`);
  }
  if (summary.potentialSavings > 0) {
    recs.push(`$${summary.potentialSavings.toLocaleString()} in early payment discounts available — capture before deadlines expire`);
  }
  if (summary.totalDueThisWeek > summary.cashOnHand * 0.5) {
    recs.push('This week\'s payables exceed 50% of cash on hand — consider delaying non-critical payments');
  }

  const highValueBills = bills.filter(b => b.amount > 20000 && b.status === 'pending');
  if (highValueBills.length > 0) {
    recs.push(`${highValueBills.length} high-value bills pending — confirm delivery/completion before releasing payment`);
  }

  if (recs.length === 0) recs.push('Payables are healthy. All payments on schedule.');
  return recs;
}

// ─── Main data fetcher ──────────────────────────────────

export async function getPayablesData(companyId: string): Promise<PayablesData> {
  const connId = await getAccountingConnection(companyId);

  if (connId) {
    const bills = await fetchLiveBills(connId);
    const cashOnHand = 48000; // Would come from accounts in production
    const schedule = buildSchedule(bills, cashOnHand);

    const sb = supabaseAdmin();
    const { data: conn } = await (sb as any)
      .from('integration_connections')
      .select('provider')
      .eq('connection_id', connId)
      .single();

    const unpaid = bills.filter(b => b.status !== 'paid');
    const overdue = bills.filter(b => b.status === 'overdue');
    const now = new Date();
    const thisWeekEnd = new Date(now.getTime() + 7 * 86400000);
    const thisMonthEnd = new Date(now.getTime() + 30 * 86400000);

    const summary = {
      totalPayable: unpaid.reduce((s, b) => s + (b.amount - b.amountPaid), 0),
      totalDueThisWeek: unpaid.filter(b => new Date(b.dueDate) <= thisWeekEnd).reduce((s, b) => s + (b.amount - b.amountPaid), 0),
      totalDueThisMonth: unpaid.filter(b => new Date(b.dueDate) <= thisMonthEnd).reduce((s, b) => s + (b.amount - b.amountPaid), 0),
      totalOverdue: overdue.reduce((s, b) => s + (b.amount - b.amountPaid), 0),
      overdueCount: overdue.length,
      availableDiscounts: bills.filter(b => b.hasEarlyDiscount).length,
      potentialSavings: bills.reduce((s, b) => s + b.discountSavings, 0),
      avgPaymentDays: 22,
      vendorCount: new Set(bills.map(b => b.vendor)).size,
      cashOnHand,
    };

    return {
      source: 'live',
      provider: conn?.provider || 'accounting',
      bills,
      schedule,
      summary,
      recommendations: generateRecommendations(bills, summary),
    };
  }

  return getDemoPayables();
}

function getDemoPayables(): PayablesData {
  const bills: Bill[] = [
    {
      id: 'bill-1', vendor: 'Unistrut Midwest', vendorEmail: 'ap@unistrut.com',
      description: 'Steel racking components — Bay 4 expansion', amount: 14200, amountPaid: 0,
      status: 'pending', issueDate: '2026-02-15', dueDate: '2026-03-15', daysTilDue: 13,
      hasEarlyDiscount: true, discountPercent: 2, discountDeadline: '2026-03-07', discountSavings: 284,
      category: 'Materials', priority: 'medium',
    },
    {
      id: 'bill-2', vendor: 'Mountain West Staffing', vendorEmail: 'billing@mwstaff.com',
      description: 'Temp labor — February invoice', amount: 32500, amountPaid: 0,
      status: 'pending', issueDate: '2026-03-01', dueDate: '2026-03-05', daysTilDue: 3,
      hasEarlyDiscount: false, discountPercent: 0, discountDeadline: null, discountSavings: 0,
      category: 'Labor', priority: 'high',
    },
    {
      id: 'bill-3', vendor: 'Intermountain Electric', vendorEmail: 'invoices@ime.com',
      description: 'Electrical panel upgrade + conduit run', amount: 8700, amountPaid: 0,
      status: 'overdue', issueDate: '2026-02-01', dueDate: '2026-02-28', daysTilDue: -2,
      hasEarlyDiscount: false, discountPercent: 0, discountDeadline: null, discountSavings: 0,
      category: 'Maintenance', priority: 'critical',
    },
    {
      id: 'bill-4', vendor: 'Daifuku North America', vendorEmail: 'ar@daifuku.com',
      description: 'Conveyor belt replacement parts', amount: 22800, amountPaid: 11400,
      status: 'partial', issueDate: '2026-01-20', dueDate: '2026-03-20', daysTilDue: 18,
      hasEarlyDiscount: true, discountPercent: 3, discountDeadline: '2026-03-10', discountSavings: 342,
      category: 'Equipment', priority: 'medium',
    },
    {
      id: 'bill-5', vendor: 'Wasatch Safety Supply', vendorEmail: 'orders@wasatchsafety.com',
      description: 'PPE restock — Q1 order', amount: 3200, amountPaid: 0,
      status: 'pending', issueDate: '2026-02-25', dueDate: '2026-03-25', daysTilDue: 23,
      hasEarlyDiscount: false, discountPercent: 0, discountDeadline: null, discountSavings: 0,
      category: 'Supplies', priority: 'low',
    },
    {
      id: 'bill-6', vendor: 'Rocky Mountain Insurance', vendorEmail: 'premium@rmins.com',
      description: 'Monthly liability + workers comp premium', amount: 6800, amountPaid: 0,
      status: 'scheduled', issueDate: '2026-03-01', dueDate: '2026-03-10', daysTilDue: 8,
      hasEarlyDiscount: false, discountPercent: 0, discountDeadline: null, discountSavings: 0,
      category: 'Insurance', priority: 'medium',
    },
    {
      id: 'bill-7', vendor: 'Prologis', vendorEmail: 'leasing@prologis.com',
      description: 'March warehouse lease — Grantsville facility', amount: 22000, amountPaid: 0,
      status: 'scheduled', issueDate: '2026-02-28', dueDate: '2026-03-01', daysTilDue: 0,
      hasEarlyDiscount: false, discountPercent: 0, discountDeadline: null, discountSavings: 0,
      category: 'Facilities', priority: 'high',
    },
  ];

  const cashOnHand = 48000;
  const schedule = buildSchedule(bills, cashOnHand);

  const unpaid = bills.filter(b => b.status !== 'paid');
  const overdue = bills.filter(b => b.status === 'overdue');

  const summary = {
    totalPayable: unpaid.reduce((s, b) => s + (b.amount - b.amountPaid), 0),
    totalDueThisWeek: unpaid.filter(b => b.daysTilDue <= 7 && b.daysTilDue >= 0).reduce((s, b) => s + (b.amount - b.amountPaid), 0),
    totalDueThisMonth: unpaid.reduce((s, b) => s + (b.amount - b.amountPaid), 0),
    totalOverdue: overdue.reduce((s, b) => s + (b.amount - b.amountPaid), 0),
    overdueCount: overdue.length,
    availableDiscounts: bills.filter(b => b.hasEarlyDiscount).length,
    potentialSavings: bills.reduce((s, b) => s + b.discountSavings, 0),
    avgPaymentDays: 22,
    vendorCount: new Set(bills.map(b => b.vendor)).size,
    cashOnHand,
  };

  return {
    source: 'demo',
    bills,
    schedule,
    summary,
    recommendations: generateRecommendations(bills, summary),
  };
}
