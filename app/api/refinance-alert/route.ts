import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// ====== MORTGAGE DATA (from /api/debt) ======
const MORTGAGE = {
  lender: 'First National Bank',
  loanType: 'mortgage',
  originalAmount: 1500000,
  currentBalance: 450000,
  interestRate: 6.875,
  monthlyPayment: 30000,
  originationDate: '2018-06-15',
  maturityDate: '2033-06-15',
  collateral: 'Warehouse building — 45,000 sqft industrial',
  propertyValue: 1500000,
  lastAppraisal: '2023-09-01',
};

// ====== MARKET RATE DATA (simulated — would come from rate API) ======
const MARKET_RATES = {
  commercial_30yr: 5.25,
  commercial_15yr: 4.75,
  sba_504: 5.00,
  credit_union_commercial: 5.10,
  asOfDate: '2026-02-16',
};

// ====== ANALYSIS ENGINE ======
function analyzeRefinance(): any {
  const m = MORTGAGE;
  const ltv = m.currentBalance / m.propertyValue;
  const equityPercent = 1 - ltv;
  const equity = m.propertyValue - m.currentBalance;
  const remainingMonths = Math.max(0, Math.round((new Date(m.maturityDate).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)));
  const totalRemainingCost = m.monthlyPayment * remainingMonths;
  const totalInterestRemaining = totalRemainingCost - m.currentBalance;

  // ====== REFINANCE SCENARIOS ======
  const scenarios = [];

  // Scenario 1: Standard commercial refi at market rate
  const refiRate1 = MARKET_RATES.commercial_30yr;
  const refiMonthly1 = calcMonthlyPayment(m.currentBalance, refiRate1, 20 * 12);
  scenarios.push({
    name: 'Commercial 20-Year Refi',
    lenderType: 'Commercial bank',
    rate: refiRate1,
    term: '20 years',
    newMonthlyPayment: Math.round(refiMonthly1),
    currentMonthlyPayment: m.monthlyPayment,
    monthlySavings: Math.round(m.monthlyPayment - refiMonthly1),
    annualSavings: Math.round((m.monthlyPayment - refiMonthly1) * 12),
    totalSavings: Math.round((m.monthlyPayment - refiMonthly1) * 12 * 10), // 10yr horizon
    breakEvenMonths: Math.ceil(15000 / Math.max(1, m.monthlyPayment - refiMonthly1)), // ~$15K closing costs
    closingCosts: 15000,
    recommendation: refiMonthly1 < m.monthlyPayment * 0.5 ? 'STRONG BUY' : refiMonthly1 < m.monthlyPayment * 0.7 ? 'RECOMMENDED' : 'MARGINAL',
  });

  // Scenario 2: Credit union (typically lower rates)
  const refiRate2 = MARKET_RATES.credit_union_commercial;
  const refiMonthly2 = calcMonthlyPayment(m.currentBalance, refiRate2, 15 * 12);
  scenarios.push({
    name: 'Credit Union 15-Year',
    lenderType: 'Credit union (non-predatory)',
    rate: refiRate2,
    term: '15 years',
    newMonthlyPayment: Math.round(refiMonthly2),
    currentMonthlyPayment: m.monthlyPayment,
    monthlySavings: Math.round(m.monthlyPayment - refiMonthly2),
    annualSavings: Math.round((m.monthlyPayment - refiMonthly2) * 12),
    totalSavings: Math.round((m.monthlyPayment - refiMonthly2) * 12 * 10),
    breakEvenMonths: Math.ceil(8000 / Math.max(1, m.monthlyPayment - refiMonthly2)),
    closingCosts: 8000,
    recommendation: refiMonthly2 < m.monthlyPayment * 0.5 ? 'STRONG BUY' : 'RECOMMENDED',
  });

  // Scenario 3: SBA 504 (for owner-occupied commercial)
  const refiRate3 = MARKET_RATES.sba_504;
  const refiMonthly3 = calcMonthlyPayment(m.currentBalance, refiRate3, 25 * 12);
  scenarios.push({
    name: 'SBA 504 — 25-Year',
    lenderType: 'SBA-backed (government program)',
    rate: refiRate3,
    term: '25 years',
    newMonthlyPayment: Math.round(refiMonthly3),
    currentMonthlyPayment: m.monthlyPayment,
    monthlySavings: Math.round(m.monthlyPayment - refiMonthly3),
    annualSavings: Math.round((m.monthlyPayment - refiMonthly3) * 12),
    totalSavings: Math.round((m.monthlyPayment - refiMonthly3) * 12 * 10),
    breakEvenMonths: Math.ceil(12000 / Math.max(1, m.monthlyPayment - refiMonthly3)),
    closingCosts: 12000,
    recommendation: 'RECOMMENDED — lowest monthly, longest term',
  });

  // ====== ALERT DETERMINATION ======
  const bestScenario = scenarios.reduce((best, s) => s.monthlySavings > best.monthlySavings ? s : best, scenarios[0]);
  const shouldRefi = bestScenario.monthlySavings > 5000; // $5K/mo threshold
  const alertLevel = bestScenario.monthlySavings > 20000 ? 'critical' : bestScenario.monthlySavings > 10000 ? 'high' : bestScenario.monthlySavings > 5000 ? 'medium' : 'low';

  return {
    alert: {
      triggered: shouldRefi,
      level: alertLevel,
      title: 'Time to Refinance',
      message: shouldRefi
        ? `Your $${m.currentBalance.toLocaleString()} mortgage at ${m.interestRate}% is costing $${m.monthlyPayment.toLocaleString()}/mo. Refinancing could save up to $${bestScenario.monthlySavings.toLocaleString()}/mo ($${bestScenario.annualSavings.toLocaleString()}/yr). LTV is only ${Math.round(ltv * 100)}% — strong equity position for favorable terms.`
        : `Mortgage is within acceptable range. Monitor for rate drops below ${(m.interestRate - 2).toFixed(1)}%.`,
      bestOption: bestScenario.name,
    },
    currentMortgage: {
      lender: m.lender,
      balance: m.currentBalance,
      rate: m.interestRate,
      monthlyPayment: m.monthlyPayment,
      remainingMonths,
      totalRemainingCost,
      totalInterestRemaining: Math.round(totalInterestRemaining),
    },
    propertyAnalysis: {
      currentValue: m.propertyValue,
      lastAppraisal: m.lastAppraisal,
      equity,
      equityPercent: Math.round(equityPercent * 100),
      ltv: Math.round(ltv * 100),
      ltvStatus: ltv < 0.5 ? 'Excellent — strong refi position' : ltv < 0.8 ? 'Good — standard terms available' : 'High — may need PMI',
    },
    scenarios,
    marketRates: MARKET_RATES,
    recommendation: {
      action: shouldRefi ? 'REFINANCE NOW' : 'MONITOR',
      summary: shouldRefi
        ? `With ${Math.round(equityPercent * 100)}% equity and rates at ${MARKET_RATES.commercial_30yr}% (vs your ${m.interestRate}%), refinancing the $${m.currentBalance.toLocaleString()} balance would drop payments from $${m.monthlyPayment.toLocaleString()} to ~$${bestScenario.newMonthlyPayment.toLocaleString()}/mo. That's $${bestScenario.annualSavings.toLocaleString()} back in annual cash flow.`
        : 'Current rate is competitive. Set alert for 1% rate drop.',
      nextSteps: shouldRefi ? [
        'Request updated property appraisal (last was ' + m.lastAppraisal + ')',
        'Pull 3 quotes: local credit union, SBA 504 program, and one commercial bank',
        'Prepare lending packet via CFO Console (P&L, Balance Sheet, Tax Returns)',
        'Target close within 60 days to lock current rates',
      ] : ['Monitor rates quarterly', 'Update property value if improvements made'],
    },
    generatedAt: new Date().toISOString(),
  };
}

function calcMonthlyPayment(principal: number, annualRate: number, totalPayments: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / totalPayments;
  return principal * (r * Math.pow(1 + r, totalPayments)) / (Math.pow(1 + r, totalPayments) - 1);
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  if (view === 'alert-only') {
    const analysis = analyzeRefinance();
    return NextResponse.json({ alert: analysis.alert });
  }

  return NextResponse.json(analyzeRefinance());
}
