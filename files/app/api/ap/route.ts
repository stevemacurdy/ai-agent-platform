import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

const CATEGORIES = [
  'advertising','car_truck','commissions_fees','contract_labor','employee_benefits',
  'insurance','interest_mortgage','legal_professional','office_expense','profit_sharing',
  'rent_lease_vehicles','rent_lease_machinery','rent_lease_property','repairs_maintenance',
  'supplies','taxes_licenses','travel_meals','utilities','wages'
];

const expenses: any[] = [
  { id: 'ap-001', vendor: 'CAT Financial', invoice: 'CAT-2026-0142', description: 'Equipment lease — 320F excavator', amount: 3800, category: 'rent_lease_machinery', allocation: 'project', project: 'Logicorp Warehouse', date: '2026-01-15', due: '2026-02-15', status: 'approved', odooAccount: 'woulf', paidDate: null },
  { id: 'ap-002', vendor: 'National Grid', invoice: 'NG-Feb2026', description: 'Electricity — main warehouse', amount: 1890, category: 'utilities', allocation: 'overhead', project: null, date: '2026-02-01', due: '2026-02-28', status: 'approved', odooAccount: 'woulf', paidDate: null },
  { id: 'ap-003', vendor: 'ADP Payroll', invoice: 'ADP-030126', description: 'Bi-weekly payroll processing', amount: 38500, category: 'wages', allocation: 'overhead', project: null, date: '2026-02-14', due: '2026-02-14', status: 'paid', odooAccount: 'woulf', paidDate: '2026-02-14' },
  { id: 'ap-004', vendor: 'State Farm', invoice: 'SF-Q1-2026', description: 'Quarterly commercial insurance', amount: 6200, category: 'insurance', allocation: 'overhead', project: null, date: '2026-01-01', due: '2026-03-01', status: 'pending', odooAccount: 'woulf', paidDate: null },
  { id: 'ap-005', vendor: 'Smith & Associates', invoice: 'SA-2026-018', description: 'Legal review — Pinnacle contract', amount: 2500, category: 'legal_professional', allocation: 'project', project: 'Pinnacle Automation', date: '2026-02-10', due: '2026-03-10', status: 'pending', odooAccount: 'clutch', paidDate: null },
  { id: 'ap-006', vendor: 'Ford Motor Credit', invoice: 'FMC-Feb26', description: 'F-250 truck lease', amount: 950, category: 'car_truck', allocation: 'overhead', project: null, date: '2026-02-01', due: '2026-02-20', status: 'paid', odooAccount: 'woulf', paidDate: '2026-02-18' },
  { id: 'ap-007', vendor: 'Google Ads', invoice: 'GADS-2026-02', description: 'Digital advertising — lead gen', amount: 4200, category: 'advertising', allocation: 'overhead', project: null, date: '2026-02-01', due: '2026-02-28', status: 'approved', odooAccount: 'woulf', paidDate: null },
  { id: 'ap-008', vendor: 'Grainger', invoice: 'GR-8821456', description: 'Conveyor belts + rollers', amount: 12400, category: 'supplies', allocation: 'project', project: 'GreenLeaf Supply', date: '2026-02-05', due: '2026-03-05', status: 'approved', odooAccount: 'woulf', paidDate: null },
  { id: 'ap-009', vendor: 'First National Bank', invoice: 'FNB-Mort-Feb26', description: 'Monthly mortgage — building', amount: 30000, category: 'interest_mortgage', allocation: 'overhead', project: null, date: '2026-02-01', due: '2026-03-01', status: 'pending', odooAccount: 'woulf', paidDate: null },
  { id: 'ap-010', vendor: 'SBA - Chase', invoice: 'SBA-2026-02', description: 'SBA loan payment', amount: 4800, category: 'interest_mortgage', allocation: 'overhead', project: null, date: '2026-02-01', due: '2026-03-01', status: 'pending', odooAccount: 'woulf', paidDate: null },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');
  const basis = searchParams.get('basis') || 'accrual';

  if (view === 'categories') return NextResponse.json({ categories: CATEGORIES });

  // Category summary
  const catSummary: Record<string, number> = {};
  for (const e of expenses) {
    const include = basis === 'cash' ? !!e.paidDate : true;
    if (include) catSummary[e.category] = (catSummary[e.category] || 0) + e.amount;
  }

  // Project P&L
  const projects: Record<string, number> = {};
  for (const e of expenses.filter(e => e.allocation === 'project' && e.project)) {
    projects[e.project!] = (projects[e.project!] || 0) + e.amount;
  }

  const total = expenses.reduce((s, e) => {
    if (basis === 'cash' && !e.paidDate) return s;
    return s + e.amount;
  }, 0);

  return NextResponse.json({
    expenses,
    total,
    basis,
    categorySummary: catSummary,
    projectCosts: projects,
    overheadTotal: expenses.filter(e => e.allocation === 'overhead').reduce((s, e) => s + e.amount, 0),
    woulfTotal: expenses.filter(e => e.odooAccount === 'woulf').reduce((s, e) => s + e.amount, 0),
    clutchTotal: expenses.filter(e => e.odooAccount === 'clutch').reduce((s, e) => s + e.amount, 0),
    pendingCount: expenses.filter(e => e.status === 'pending').length,
    categories: CATEGORIES,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();
  if (body.action === 'add') {
    if (!CATEGORIES.includes(body.category)) return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    const newExp = { id: 'ap-' + Date.now(), ...body, status: 'pending', paidDate: null };
    expenses.push(newExp);
    return NextResponse.json({ success: true, expense: newExp, odooSync: { status: 'queued', account: body.odooAccount || 'woulf' } });
  }
  if (body.action === 'approve') {
    const exp = expenses.find(e => e.id === body.id);
    if (exp) { exp.status = 'approved'; return NextResponse.json({ success: true, expense: exp }); }
  }
  if (body.action === 'pay') {
    const exp = expenses.find(e => e.id === body.id);
    if (exp) { exp.status = 'paid'; exp.paidDate = new Date().toISOString().split('T')[0]; return NextResponse.json({ success: true, expense: exp }); }
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
