import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// Historical baselines per category (simulated — built from 6+ months of data)
const baselines: Record<string, { mean: number; stdDev: number; monthlyHistory: number[] }> = {
  advertising: { mean: 3800, stdDev: 900, monthlyHistory: [3200, 4500, 3600, 4200, 3100, 4000] },
  wages: { mean: 37000, stdDev: 2500, monthlyHistory: [35000, 38000, 36500, 38500, 37000, 37200] },
  utilities: { mean: 1750, stdDev: 300, monthlyHistory: [1600, 1800, 1900, 1650, 1700, 1850] },
  insurance: { mean: 6200, stdDev: 200, monthlyHistory: [6200, 6200, 6200, 6200, 6200, 6200] },
  travel_meals: { mean: 800, stdDev: 350, monthlyHistory: [450, 1200, 600, 950, 700, 900] },
  supplies: { mean: 2200, stdDev: 1800, monthlyHistory: [800, 1500, 3200, 2000, 4500, 1200] },
  rent_lease_machinery: { mean: 3800, stdDev: 100, monthlyHistory: [3800, 3800, 3800, 3800, 3800, 3800] },
  legal_professional: { mean: 1500, stdDev: 1200, monthlyHistory: [0, 2500, 800, 0, 3000, 2700] },
  repairs_maintenance: { mean: 900, stdDev: 600, monthlyHistory: [400, 1800, 500, 1200, 600, 900] },
  rent_lease_property: { mean: 8500, stdDev: 200, monthlyHistory: [8500, 8500, 8500, 8500, 8500, 8500] },
  office_expense: { mean: 450, stdDev: 200, monthlyHistory: [300, 600, 400, 550, 350, 500] },
};

interface Anomaly {
  id: string;
  category: string;
  categoryLabel: string;
  currentAmount: number;
  expectedRange: { low: number; high: number };
  mean: number;
  deviation: number; // in standard deviations
  severity: 'critical' | 'warning' | 'info';
  direction: 'over' | 'under';
  message: string;
  possibleReasons: string[];
}

function detectAnomalies(currentSpend: Record<string, number>): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const catLabels: Record<string, string> = {
    advertising: 'Advertising', wages: 'Wages', utilities: 'Utilities', insurance: 'Insurance',
    travel_meals: 'Travel & Meals', supplies: 'Supplies', rent_lease_machinery: 'Rent/Lease (Machinery)',
    legal_professional: 'Legal/Professional', repairs_maintenance: 'Repairs & Maintenance',
    rent_lease_property: 'Rent/Lease (Property)', office_expense: 'Office Expense',
  };

  for (const [cat, amount] of Object.entries(currentSpend)) {
    const b = baselines[cat];
    if (!b || b.stdDev === 0) continue;

    const deviation = (amount - b.mean) / b.stdDev;
    const absDeviation = Math.abs(deviation);

    if (absDeviation >= 1.5) {
      const direction = deviation > 0 ? 'over' : 'under';
      const severity = absDeviation >= 3 ? 'critical' : absDeviation >= 2 ? 'warning' : 'info';

      const reasons = [];
      if (direction === 'over') {
        if (cat === 'utilities') reasons.push('Seasonal increase?', 'Rate hike?', 'Equipment left running?');
        else if (cat === 'supplies') reasons.push('Large project purchase?', 'Bulk order?', 'Vendor price increase?');
        else if (cat === 'travel_meals') reasons.push('Client visits?', 'Conference attendance?', 'New territory expansion?');
        else if (cat === 'repairs_maintenance') reasons.push('Emergency repair?', 'Scheduled overhaul?', 'Equipment aging?');
        else reasons.push('Unusual vendor charge?', 'New contract terms?', 'One-time expense?');
      } else {
        reasons.push('Delayed invoice?', 'Vendor change?', 'Service paused?');
      }

      anomalies.push({
        id: `anom-${cat}-${Date.now()}`,
        category: cat,
        categoryLabel: catLabels[cat] || cat,
        currentAmount: amount,
        expectedRange: { low: Math.round(b.mean - 2 * b.stdDev), high: Math.round(b.mean + 2 * b.stdDev) },
        mean: b.mean,
        deviation: Math.round(absDeviation * 10) / 10,
        severity,
        direction,
        message: `${catLabels[cat] || cat} spending is ${Math.round(absDeviation * 10) / 10}σ ${direction === 'over' ? 'above' : 'below'} normal ($${amount.toLocaleString()} vs avg $${b.mean.toLocaleString()})`,
        possibleReasons: reasons,
      });
    }
  }

  return anomalies.sort((a, b) => b.deviation - a.deviation);
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  // Fetch current month spend from AP
  const baseUrl = request.nextUrl.origin;
  const email = request.headers.get('x-admin-email') || '';
  const apRes = await fetch(`${baseUrl}/api/ap?view=summary&basis=accrual`, { headers: { 'x-admin-email': email } });
  const apData = await apRes.json();

  const currentSpend: Record<string, number> = {};
  for (const c of (apData.byCategory || [])) currentSpend[c.category] = c.amount;

  // Inject a test anomaly for demo
  if (!currentSpend['utilities']) currentSpend['utilities'] = 1890;
  if (!currentSpend['supplies']) currentSpend['supplies'] = 12400; // way above normal

  const anomalies = detectAnomalies(currentSpend);

  return NextResponse.json({
    anomalies,
    baselines: Object.entries(baselines).map(([k, v]) => ({
      category: k, mean: v.mean, stdDev: v.stdDev,
      currentSpend: currentSpend[k] || 0,
      history: v.monthlyHistory,
    })),
    totalAnomalies: anomalies.length,
    criticalCount: anomalies.filter(a => a.severity === 'critical').length,
    warningCount: anomalies.filter(a => a.severity === 'warning').length,
  });
}
