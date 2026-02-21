import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// ====== SIMULATED BANK FEED (via Plaid/Odoo) ======
let bankTransactions: any[] = [
  { id: 'bt-1', date: '2026-02-14', description: 'ADP PAYROLL ACH', amount: -38500, type: 'debit', account: 'Chase ****4821', reconciled: true, matchedExpenseId: 'ap-5', matchType: 'exact' },
  { id: 'bt-2', date: '2026-02-12', description: 'STATE FARM INS PREM', amount: -6200, type: 'debit', account: 'Chase ****4821', reconciled: true, matchedExpenseId: 'ap-8', matchType: 'exact' },
  { id: 'bt-3', date: '2026-02-15', description: 'CATERPILLAR FINANCIAL', amount: -3800, type: 'debit', account: 'Chase ****4821', reconciled: false, matchedExpenseId: null, matchType: null },
  { id: 'bt-4', date: '2026-02-15', description: 'HOME DEPOT #4412', amount: -287.43, type: 'debit', account: 'Chase ****3346', reconciled: false, matchedExpenseId: null, matchType: null },
  { id: 'bt-5', date: '2026-02-13', description: 'DELTA AIR 0068847221', amount: -485, type: 'debit', account: 'Amex ****1009', reconciled: true, matchedExpenseId: 'ap-6', matchType: 'exact' },
  { id: 'bt-6', date: '2026-02-10', description: 'NATIONAL GRID ELEC', amount: -1890, type: 'debit', account: 'Chase ****4821', reconciled: false, matchedExpenseId: null, matchType: null },
  { id: 'bt-7', date: '2026-02-16', description: 'CHECK #1847 - SMITH ASSOC', amount: -2500, type: 'debit', account: 'Chase ****4821', reconciled: false, matchedExpenseId: null, matchType: null },
  // Incoming
  { id: 'bt-8', date: '2026-02-14', description: 'LOGICORP INC WIRE', amount: 24500, type: 'credit', account: 'Chase ****4821', reconciled: false, matchedExpenseId: null, matchType: null },
  { id: 'bt-9', date: '2026-02-11', description: 'PINNACLE GROUP ACH', amount: 14495, type: 'credit', account: 'Chase ****4821', reconciled: false, matchedExpenseId: null, matchType: null },
  { id: 'bt-10', date: '2026-02-10', description: 'UNKNOWN VENDOR REFUND', amount: 150, type: 'credit', account: 'Chase ****4821', reconciled: false, matchedExpenseId: null, matchType: null },
];

// Match scoring logic
function scoreMatch(transaction: any, expense: any): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const txDesc = (transaction.description || '').toLowerCase();
  const vendor = (expense.vendorName || '').toLowerCase();

  // Amount match (most important)
  if (Math.abs(Math.abs(transaction.amount) - expense.amount) < 0.01) {
    score += 50;
    reasons.push('Exact amount match');
  } else if (Math.abs(Math.abs(transaction.amount) - expense.amount) / expense.amount < 0.02) {
    score += 25;
    reasons.push('Amount within 2%');
  }

  // Vendor name match
  const vendorWords = vendor.split(/\s+/).filter((w: string) => w.length > 2);
  for (const word of vendorWords) {
    if (txDesc.includes(word)) {
      score += 30;
      reasons.push(`Vendor match: "${word}"`);
      break;
    }
  }

  // Date proximity
  if (transaction.date && expense.invoiceDate) {
    const daysDiff = Math.abs(new Date(transaction.date).getTime() - new Date(expense.invoiceDate).getTime()) / (24 * 60 * 60 * 1000);
    if (daysDiff <= 3) { score += 15; reasons.push('Date within 3 days'); }
    else if (daysDiff <= 7) { score += 8; reasons.push('Date within 7 days'); }
  }

  return { score, reasons };
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  // Fetch AP expenses for matching
  const baseUrl = request.nextUrl.origin;
  const email = request.headers.get('x-admin-email') || '';
  const apRes = await fetch(`${baseUrl}/api/ap`, { headers: { 'x-admin-email': email } });
  const apData = await apRes.json();
  const expenses = apData.expenses || [];

  if (view === 'bank-feed') {
    return NextResponse.json({
      transactions: bankTransactions,
      totalDebits: bankTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
      totalCredits: bankTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0),
    });
  }

  if (view === 'suggestions') {
    // Generate match suggestions for unreconciled transactions
    const unreconciled = bankTransactions.filter(t => !t.reconciled && t.amount < 0);
    const openExpenses = expenses.filter((e: any) => ['pending', 'approved'].includes(e.status));

    const suggestions = unreconciled.map(tx => {
      const matches = openExpenses.map((exp: any) => ({
        expense: exp,
        ...scoreMatch(tx, exp),
      })).filter((m: any) => m.score >= 40).sort((a: any, b: any) => b.score - a.score);

      return {
        transaction: tx,
        bestMatch: matches[0] || null,
        alternateMatches: matches.slice(1, 3),
        hasMatch: matches.length > 0,
      };
    });

    return NextResponse.json({ suggestions, unmatchedCount: suggestions.filter(s => !s.hasMatch).length });
  }

  // Summary / dashboard
  const reconciledCount = bankTransactions.filter(t => t.reconciled).length;
  const unreconciledCount = bankTransactions.filter(t => !t.reconciled).length;
  const reconciledAmount = bankTransactions.filter(t => t.reconciled && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const unreconciledAmount = bankTransactions.filter(t => !t.reconciled && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  // Cash position
  const totalBankBalance = 48000; // Starting cash
  const pendingOutflows = expenses.filter((e: any) => e.status === 'pending' || e.status === 'approved').reduce((s: number, e: any) => s + e.amount, 0);

  return NextResponse.json({
    reconciliation: { reconciledCount, unreconciledCount, reconciledAmount, unreconciledAmount, totalTransactions: bankTransactions.length },
    cashPosition: { bankBalance: totalBankBalance, pendingOutflows, netPosition: totalBankBalance - pendingOutflows, lastUpdated: new Date().toISOString() },
    recentTransactions: bankTransactions.slice(0, 5),
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  switch (body.action) {
    // ====== RECONCILE: Match a transaction to an expense ======
    case 'reconcile': {
      const txIdx = bankTransactions.findIndex(t => t.id === body.transactionId);
      if (txIdx === -1) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      bankTransactions[txIdx].reconciled = true;
      bankTransactions[txIdx].matchedExpenseId = body.expenseId;
      bankTransactions[txIdx].matchType = body.matchType || 'manual';
      return NextResponse.json({ transaction: bankTransactions[txIdx] });
    }

    // ====== AUTO-RECONCILE: Run matching engine on all unreconciled ======
    case 'auto-reconcile': {
      const baseUrl = request.nextUrl.origin;
      const email = request.headers.get('x-admin-email') || '';
      const apRes = await fetch(`${baseUrl}/api/ap`, { headers: { 'x-admin-email': email } });
      const apData = await apRes.json();
      const expenses = apData.expenses || [];

      let matched = 0;
      for (const tx of bankTransactions.filter(t => !t.reconciled && t.amount < 0)) {
        for (const exp of expenses) {
          const { score } = scoreMatch(tx, exp);
          if (score >= 75) { // High-confidence auto-match
            tx.reconciled = true;
            tx.matchedExpenseId = exp.id;
            tx.matchType = 'auto';
            matched++;
            break;
          }
        }
      }
      return NextResponse.json({ matched, message: `Auto-reconciled ${matched} transactions` });
    }

    // ====== DISMISS: Mark transaction as no-match needed ======
    case 'dismiss': {
      const txIdx = bankTransactions.findIndex(t => t.id === body.transactionId);
      if (txIdx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      bankTransactions[txIdx].reconciled = true;
      bankTransactions[txIdx].matchType = 'dismissed';
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
