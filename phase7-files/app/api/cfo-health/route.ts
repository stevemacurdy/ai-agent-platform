import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');
  const baseUrl = request.nextUrl.origin;
  const email = request.headers.get('x-admin-email') || '';

  // ====== FINANCIAL HEALTH SCORE ======
  if (view === 'health') {
    // Pull live data
    const [invRes, apRes, debtRes] = await Promise.all([
      fetch(`${baseUrl}/api/cfo-invoices`, { headers: { 'x-admin-email': email } }),
      fetch(`${baseUrl}/api/ap?view=summary&basis=accrual`, { headers: { 'x-admin-email': email } }),
      fetch(`${baseUrl}/api/debt?view=loans`, { headers: { 'x-admin-email': email } }),
    ]);
    const invData = await invRes.json();
    const apData = await apRes.json();
    const debtData = await debtRes.json();

    const cash = 48000;
    const ar = invData.summary?.totalAR || 77700;
    const currentLiabilities = (apData.totalAP || 70000) + (debtData.totalMonthlyPayments || 37630);
    const inventory = 12500;
    const monthlyRevenue = 85000;
    const monthlyExpenses = 72000;

    // Quick Ratio (Cash + AR) / Current Liabilities
    const quickRatio = currentLiabilities > 0 ? Math.round(((cash + ar) / currentLiabilities) * 100) / 100 : 0;

    // DSO = (AR / Revenue) * 30
    const dso = monthlyRevenue > 0 ? Math.round((ar / monthlyRevenue) * 30) : 0;

    // Burn Rate = Monthly Expenses + Debt Service
    const burnRate = monthlyExpenses + (debtData.totalMonthlyPayments || 37630);

    // Runway
    const runway = burnRate > 0 ? Math.round((cash / burnRate) * 10) / 10 : 0;

    // Health Score (0-100)
    let score = 50;
    // Quick ratio contribution (20 pts)
    if (quickRatio >= 2) score += 20;
    else if (quickRatio >= 1.5) score += 15;
    else if (quickRatio >= 1) score += 10;
    else if (quickRatio >= 0.5) score += 5;

    // DSO contribution (20 pts)
    if (dso <= 30) score += 20;
    else if (dso <= 45) score += 15;
    else if (dso <= 60) score += 10;
    else if (dso <= 90) score += 5;

    // Runway contribution (10 pts)
    if (runway >= 3) score += 10;
    else if (runway >= 2) score += 7;
    else if (runway >= 1) score += 3;

    // Overdue AR penalty
    const overdueRatio = (invData.summary?.overdueTotal || 0) / Math.max(1, ar);
    score -= Math.round(overdueRatio * 15);
    score = Math.max(0, Math.min(100, score));

    // Actionable checklist
    const checklist = [];
    if (quickRatio < 1.5) checklist.push({ priority: 'high', action: 'Improve Quick Ratio', detail: `Current: ${quickRatio}. Target: 1.5+. Collect overdue AR ($${invData.summary?.overdueTotal?.toLocaleString()}) or reduce short-term liabilities.` });
    if (dso > 45) checklist.push({ priority: 'high', action: 'Reduce Days Sales Outstanding', detail: `Current DSO: ${dso} days. Target: 30-45. Tighten payment terms and accelerate collections.` });
    if (runway < 2) checklist.push({ priority: 'critical', action: 'Extend Cash Runway', detail: `Current: ${runway} months. Target: 3+. Reduce expenses or secure credit line.` });
    if (overdueRatio > 0.3) checklist.push({ priority: 'medium', action: 'Address Overdue Receivables', detail: `${Math.round(overdueRatio * 100)}% of AR is overdue. Run AI collection strategy to recover.` });
    if (checklist.length < 3) checklist.push({ priority: 'low', action: 'Negotiate Early-Pay Discounts', detail: 'Review vendor terms for 2/10 net 30 opportunities to reduce AP costs.' });

    return NextResponse.json({
      healthScore: score,
      metrics: {
        quickRatio: { value: quickRatio, target: 1.5, status: quickRatio >= 1.5 ? 'good' : quickRatio >= 1 ? 'warning' : 'critical' },
        dso: { value: dso, target: 45, unit: 'days', status: dso <= 45 ? 'good' : dso <= 60 ? 'warning' : 'critical' },
        burnRate: { value: burnRate, unit: '$/month', status: 'info' },
        runway: { value: runway, unit: 'months', status: runway >= 3 ? 'good' : runway >= 1.5 ? 'warning' : 'critical' },
        cashOnHand: { value: cash, status: cash > burnRate ? 'good' : 'warning' },
        totalAR: { value: ar, status: 'info' },
        overdueAR: { value: invData.summary?.overdueTotal || 0, status: overdueRatio > 0.3 ? 'critical' : 'info' },
      },
      checklist,
    });
  }

  // ====== VENDOR DISCOUNT ANALYSIS ======
  if (view === 'vendor-discounts') {
    const vendorRes = await fetch(`${baseUrl}/api/vendor-scoring?view=discounts`, { headers: { 'x-admin-email': email } });
    const vendorData = await vendorRes.json();

    // Enrich with AP data
    const apRes = await fetch(`${baseUrl}/api/ap`, { headers: { 'x-admin-email': email } });
    const apData = await apRes.json();
    const openExpenses = (apData.expenses || []).filter((e: any) => ['pending', 'approved'].includes(e.status));

    const opportunities = (vendorData.vendors || []).map((v: any) => {
      const vendorExpenses = openExpenses.filter((e: any) => e.vendorName.toLowerCase().includes(v.vendorName.toLowerCase().split(' ')[0]));
      return {
        vendor: v.vendorName,
        terms: v.earlyPayDiscount?.terms,
        potentialSavings: v.earlyPayDiscount?.potentialSavings || 0,
        openInvoices: vendorExpenses.length,
        openAmount: vendorExpenses.reduce((s: number, e: any) => s + e.amount, 0),
        recommendation: `Pay ${v.vendorName} early to save $${v.earlyPayDiscount?.potentialSavings || 0}. ${v.earlyPayDiscount?.terms || ''}`,
      };
    });

    return NextResponse.json({
      opportunities,
      totalPotentialSavings: opportunities.reduce((s: number, o: any) => s + o.potentialSavings, 0),
    });
  }

  // ====== CASHFLOW FORECAST ======
  if (view === 'forecast') {
    const period = searchParams.get('period') || '90day';
    const fRes = await fetch(`${baseUrl}/api/forecasting?view=forecast&period=${period}`, { headers: { 'x-admin-email': email } });
    return NextResponse.json(await fRes.json());
  }

  return NextResponse.json({ views: ['health', 'vendor-discounts', 'forecast'] });
}
