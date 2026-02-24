export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// Tax reserve configuration
let config = {
  reserveRate: 0.28, // 28% default federal+state estimate
  quarterlyThreshold: 1000, // Minimum quarterly estimated payment
  autoReserveEnabled: true,
  estimatedTaxBracket: 'c_corp', // c_corp, s_corp, llc, sole_prop
};

// Monthly income tracking → reserve calculations
let monthlyData: any[] = [
  { month: '2025-07', revenue: 78000, expenses: 65000, netIncome: 13000, reserveAmount: 3640, reserveStatus: 'funded' },
  { month: '2025-08', revenue: 82000, expenses: 68000, netIncome: 14000, reserveAmount: 3920, reserveStatus: 'funded' },
  { month: '2025-09', revenue: 75000, expenses: 70000, netIncome: 5000, reserveAmount: 1400, reserveStatus: 'funded' },
  { month: '2025-10', revenue: 91000, expenses: 72000, netIncome: 19000, reserveAmount: 5320, reserveStatus: 'funded' },
  { month: '2025-11', revenue: 88000, expenses: 74000, netIncome: 14000, reserveAmount: 3920, reserveStatus: 'funded' },
  { month: '2025-12', revenue: 95000, expenses: 71000, netIncome: 24000, reserveAmount: 6720, reserveStatus: 'funded' },
  { month: '2026-01', revenue: 85000, expenses: 72000, netIncome: 13000, reserveAmount: 3640, reserveStatus: 'funded' },
  { month: '2026-02', revenue: 87000, expenses: 73500, netIncome: 13500, reserveAmount: 3780, reserveStatus: 'pending' },
];

// Quarterly estimated payment schedule
const quarterlyDueDates = [
  { quarter: 'Q1 2026', dueDate: '2026-04-15', status: 'upcoming' },
  { quarter: 'Q2 2026', dueDate: '2026-06-15', status: 'upcoming' },
  { quarter: 'Q3 2026', dueDate: '2026-09-15', status: 'upcoming' },
  { quarter: 'Q4 2026', dueDate: '2026-01-15', status: 'upcoming' },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const totalReserved = monthlyData.filter(m => m.reserveStatus === 'funded').reduce((s, m) => s + m.reserveAmount, 0);
  const pendingReserve = monthlyData.filter(m => m.reserveStatus === 'pending').reduce((s, m) => s + m.reserveAmount, 0);
  const ytdIncome = monthlyData.filter(m => m.month.startsWith('2026')).reduce((s, m) => s + m.netIncome, 0);
  const ytdReserve = monthlyData.filter(m => m.month.startsWith('2026')).reduce((s, m) => s + m.reserveAmount, 0);

  // Calculate quarterly estimates
  const q1Income = monthlyData.filter(m => ['2026-01', '2026-02', '2026-03'].includes(m.month)).reduce((s, m) => s + m.netIncome, 0);
  const q1EstimatedTax = Math.round(q1Income * config.reserveRate);

  // Days until next quarterly payment
  const nextDue = quarterlyDueDates.find(q => new Date(q.dueDate) > new Date());
  const daysUntilDue = nextDue ? Math.ceil((new Date(nextDue.dueDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null;

  // Alerts
  const alerts = [];
  if (daysUntilDue && daysUntilDue <= 30) alerts.push({ severity: 'warning', message: `Quarterly estimated tax due in ${daysUntilDue} days (${nextDue?.quarter} — ${nextDue?.dueDate})` });
  if (pendingReserve > 0) alerts.push({ severity: 'action', message: `$${pendingReserve.toLocaleString()} in tax reserves pending transfer` });
  if (ytdIncome > 100000) alerts.push({ severity: 'info', message: `YTD income exceeds $100K — verify estimated payments are sufficient` });

  return NextResponse.json({
    config,
    summary: { totalReserved, pendingReserve, ytdIncome, ytdReserve, q1EstimatedTax },
    monthlyData,
    quarterlySchedule: quarterlyDueDates.map(q => ({
      ...q,
      estimatedAmount: Math.round(q1EstimatedTax), // simplified
      daysUntil: Math.ceil((new Date(q.dueDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
    })),
    alerts,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  switch (body.action) {
    case 'update-config': {
      if (body.reserveRate) config.reserveRate = body.reserveRate;
      if (body.autoReserveEnabled !== undefined) config.autoReserveEnabled = body.autoReserveEnabled;
      return NextResponse.json({ config });
    }
    case 'fund-reserve': {
      const idx = monthlyData.findIndex(m => m.month === body.month);
      if (idx !== -1) monthlyData[idx].reserveStatus = 'funded';
      return NextResponse.json({ success: true });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
