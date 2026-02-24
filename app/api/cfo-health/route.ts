export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

function calcHealth() {
  const cash = 48000;
  const totalAR = 77700;
  const overdueAR = 69500;
  const monthlyRevenue = 85000;
  const currentLiabilities = 107240; // monthly outflows
  const monthlyBurn = 109630;

  const quickRatio = (cash + totalAR) / currentLiabilities;
  const dso = Math.round((totalAR / monthlyRevenue) * 30);
  const burnRate = monthlyBurn;
  const runway = cash / burnRate;
  const overdueRatio = overdueAR / totalAR;

  // Score calculation (0-100)
  let score = 50;
  // Quick Ratio contribution (20pts): 1.5+ = 20, 1.0-1.5 = 10, <1.0 = 0
  score += quickRatio >= 1.5 ? 20 : quickRatio >= 1.0 ? 10 : 0;
  // DSO contribution (20pts): <30 = 20, 30-45 = 15, 45-60 = 10, >60 = 0
  score += dso < 30 ? 20 : dso <= 45 ? 15 : dso <= 60 ? 10 : 0;
  // Runway contribution (10pts): 3+ = 10, 1-3 = 5, <1 = 0
  score += runway >= 3 ? 10 : runway >= 1 ? 5 : 0;
  // Overdue penalty
  if (overdueRatio > 0.5) score -= 15;
  else if (overdueRatio > 0.3) score -= 10;
  // Cap
  score = Math.max(0, Math.min(100, score));

  return {
    healthScore: score,
    metrics: {
      quickRatio: { value: Math.round(quickRatio * 100) / 100, target: 1.5, status: quickRatio >= 1.5 ? 'good' : quickRatio >= 1.0 ? 'warning' : 'critical', unit: '' },
      dso: { value: dso, target: 45, status: dso <= 45 ? 'good' : dso <= 60 ? 'warning' : 'critical', unit: 'days' },
      burnRate: { value: burnRate, target: null, status: 'info', unit: '' },
      runway: { value: Math.round(runway * 10) / 10, target: 3, status: runway >= 3 ? 'good' : runway >= 1 ? 'warning' : 'critical', unit: 'months' },
      cashOnHand: { value: cash, target: null, status: cash > 100000 ? 'good' : cash > 50000 ? 'warning' : 'critical', unit: '' },
      totalAR: { value: totalAR, target: null, status: 'info', unit: '' },
      overdueAR: { value: overdueAR, target: null, status: overdueRatio > 0.5 ? 'critical' : 'warning', unit: '' },
    },
    checklist: [
      { priority: 'critical', action: 'Extend Cash Runway', detail: `Current ${Math.round(runway * 10) / 10} months vs 3+ target. Reduce expenses or secure credit line.` },
      { priority: 'high', action: 'Improve Quick Ratio', detail: `Current ${Math.round(quickRatio * 100) / 100} vs 1.5 target. Collect overdue AR ($${overdueAR.toLocaleString()}).` },
      { priority: 'medium', action: 'Address Overdue Receivables', detail: `${Math.round(overdueRatio * 100)}% of AR is overdue. Run AI collection strategy.` },
    ],
  };
}

const vendorDiscounts = [
  { vendor: 'CAT Financial', terms: '2/10 Net 30', potentialSavings: 76, monthlySpend: 3800, discount: '2% if paid within 10 days' },
  { vendor: 'Grainger', terms: '1/15 Net 45', potentialSavings: 124, monthlySpend: 12400, discount: '1% if paid within 15 days' },
  { vendor: 'National Grid', terms: 'Auto-pay discount', potentialSavings: 38, monthlySpend: 1890, discount: '2% auto-pay discount' },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const view = new URL(request.url).searchParams.get('view');

  if (view === 'health') return NextResponse.json(calcHealth());
  if (view === 'vendor-discounts') return NextResponse.json({ opportunities: vendorDiscounts, totalPotentialSavings: vendorDiscounts.reduce((s, v) => s + v.potentialSavings, 0) });

  return NextResponse.json({ ...calcHealth(), vendorDiscounts: { opportunities: vendorDiscounts, totalPotentialSavings: vendorDiscounts.reduce((s, v) => s + v.potentialSavings, 0) } });
}
