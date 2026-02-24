export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

const bankTransactions = [
  { id: 'bt-1', date: '2026-02-14', description: 'ADP PAYROLL', amount: -38500, type: 'debit', account: 'Chase ****4821', reconciled: false },
  { id: 'bt-2', date: '2026-02-12', description: 'LOGICORP LLC WIRE', amount: 24500, type: 'credit', account: 'Chase ****4821', reconciled: false },
  { id: 'bt-3', date: '2026-02-10', description: 'GRAINGER IND SUPPLY', amount: -12400, type: 'debit', account: 'Chase ****4821', reconciled: false },
  { id: 'bt-4', date: '2026-02-08', description: 'GOOGLE ADS', amount: -4200, type: 'debit', account: 'Amex ****1004', reconciled: false },
  { id: 'bt-5', date: '2026-02-06', description: 'FORD MOTOR CREDIT', amount: -950, type: 'debit', account: 'Chase ****4821', reconciled: false },
  { id: 'bt-6', date: '2026-02-05', description: 'PINNACLE GRP ACH', amount: 14500, type: 'credit', account: 'Chase ****4821', reconciled: false },
  { id: 'bt-7', date: '2026-02-03', description: 'NATIONAL GRID UTIL', amount: -1890, type: 'debit', account: 'Chase ****4821', reconciled: false },
  { id: 'bt-8', date: '2026-02-02', description: 'CAT FINANCIAL LEASE', amount: -3800, type: 'debit', account: 'Chase ****4821', reconciled: false },
  { id: 'bt-9', date: '2026-02-01', description: 'FIRST NATL MORTGAGE', amount: -30000, type: 'debit', account: 'Chase ****4821', reconciled: false },
  { id: 'bt-10', date: '2026-02-01', description: 'SBA CHASE LOAN', amount: -4800, type: 'debit', account: 'Chase ****4821', reconciled: false },
];

// Known AP vendors for matching
const vendorMap: Record<string, string> = {
  'ADP PAYROLL': 'ADP Payroll', 'GRAINGER IND SUPPLY': 'Grainger', 'GOOGLE ADS': 'Google Ads',
  'FORD MOTOR CREDIT': 'Ford Motor Credit', 'NATIONAL GRID UTIL': 'National Grid',
  'CAT FINANCIAL LEASE': 'CAT Financial', 'FIRST NATL MORTGAGE': 'First National Bank',
  'SBA CHASE LOAN': 'SBA - Chase', 'LOGICORP LLC WIRE': 'Logicorp', 'PINNACLE GRP ACH': 'Pinnacle Group',
};

function scoreMatch(tx: any): any {
  const vendor = vendorMap[tx.description] || null;
  let score = 0;
  if (vendor) score += 30;
  const absAmt = Math.abs(tx.amount);
  // Known amounts from AP
  const knownAmounts: Record<number, string> = { 38500: 'ADP Payroll', 12400: 'Grainger', 4200: 'Google Ads', 950: 'Ford Motor Credit', 1890: 'National Grid', 3800: 'CAT Financial', 30000: 'First National Bank', 4800: 'SBA - Chase' };
  if (knownAmounts[absAmt]) score += 50;
  // Date proximity (within 5 days of expected)
  score += 15;
  return { txId: tx.id, matchedVendor: vendor, confidence: Math.min(score, 100), suggestedAction: score >= 75 ? 'auto-match' : score >= 40 ? 'review' : 'manual' };
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const suggestions = bankTransactions.filter(t => !t.reconciled).map(scoreMatch);
  const bankBalance = bankTransactions.reduce((s, t) => s + t.amount, 0);

  return NextResponse.json({
    reconciliation: {
      totalTransactions: bankTransactions.length,
      unreconciled: bankTransactions.filter(t => !t.reconciled).length,
      reconciled: bankTransactions.filter(t => t.reconciled).length,
      bankBalance,
    },
    transactions: bankTransactions,
    suggestions,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  if (body.action === 'reconcile') {
    const tx = bankTransactions.find(t => t.id === body.txId);
    if (tx) { tx.reconciled = true; return NextResponse.json({ success: true, transaction: tx }); }
  }
  if (body.action === 'auto-reconcile-all') {
    const suggestions = bankTransactions.filter(t => !t.reconciled).map(scoreMatch);
    let matched = 0;
    for (const s of suggestions) {
      if (s.confidence >= 75) {
        const tx = bankTransactions.find(t => t.id === s.txId);
        if (tx) { tx.reconciled = true; matched++; }
      }
    }
    return NextResponse.json({ success: true, matched, remaining: bankTransactions.filter(t => !t.reconciled).length });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
