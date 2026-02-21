import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// ====== SIMULATED ODOO DATA (account.move records) ======
const odooReceivables = [
  { id: 1042, number: 'INV/2026/00001', partner: 'Logicorp', dueDate: '2026-01-15', amount: 24500, state: 'posted', type: 'out_invoice' },
  { id: 1044, number: 'INV/2026/00003', partner: 'GreenLeaf Supply', dueDate: '2026-02-01', amount: 8200, state: 'posted', type: 'out_invoice' },
  { id: 1045, number: 'INV/2026/00004', partner: 'TechForge Inc', dueDate: '2026-02-28', amount: 16000, state: 'posted', type: 'out_invoice' }, // remaining balance
  { id: 1046, number: 'INV/2026/00005', partner: 'Clutch Client Co', dueDate: '2026-03-15', amount: 12400, state: 'posted', type: 'out_invoice' },
  { id: 1047, number: 'INV/2026/00006', partner: 'Logicorp', dueDate: '2026-01-30', amount: 45000, state: 'posted', type: 'out_invoice' },
  { id: 1050, number: 'INV/2026/00007', partner: 'Pinnacle Group', dueDate: '2026-03-20', amount: 22000, state: 'posted', type: 'out_invoice' },
  { id: 1051, number: 'INV/2026/00008', partner: 'Logicorp', dueDate: '2026-04-01', amount: 18500, state: 'posted', type: 'out_invoice' },
];

// ====== SIMULATED HUBSPOT DEALS (weighted by probability) ======
const hubspotDeals = [
  { id: 'deal-1', name: 'Logicorp Phase 3 Expansion', value: 95000, expectedCloseDate: '2026-03-15', probability: 0.75, stage: 'Proposal Sent' },
  { id: 'deal-2', name: 'Pinnacle Automation Upgrade', value: 42000, expectedCloseDate: '2026-04-01', probability: 0.60, stage: 'Negotiation' },
  { id: 'deal-3', name: 'GreenLeaf Full Overhaul', value: 120000, expectedCloseDate: '2026-05-15', probability: 0.30, stage: 'Discovery' },
  { id: 'deal-4', name: 'TechForge Sortation Ph2', value: 28000, expectedCloseDate: '2026-03-01', probability: 0.85, stage: 'Contract Sent' },
  { id: 'deal-5', name: 'NewCo Warehouse Build', value: 300000, expectedCloseDate: '2026-06-01', probability: 0.15, stage: 'Qualified Lead' },
];

// ====== SIMULATED ODOO VENDOR BILLS (outflows) ======
const odooPayables = [
  { id: 2001, vendor: 'CAT Financial', dueDate: '2026-03-01', amount: 3800, recurring: true },
  { id: 2002, vendor: 'National Grid', dueDate: '2026-03-05', amount: 1890, recurring: true },
  { id: 2003, vendor: 'ADP Payroll', dueDate: '2026-03-14', amount: 38500, recurring: true },
  { id: 2004, vendor: 'State Farm', dueDate: '2026-04-01', amount: 6200, recurring: false },
  { id: 2005, vendor: 'First National Bank', dueDate: '2026-03-15', amount: 30000, recurring: true },
  { id: 2006, vendor: 'SBA - Chase', dueDate: '2026-03-01', amount: 4800, recurring: true },
  { id: 2007, vendor: 'Ford Motor Credit', dueDate: '2026-03-20', amount: 950, recurring: true },
  { id: 2008, vendor: 'Regional Credit Union', dueDate: '2026-03-01', amount: 1200, recurring: true },
  { id: 2009, vendor: 'Smith & Associates', dueDate: '2026-03-20', amount: 2500, recurring: false },
  { id: 2010, vendor: 'Google Ads', dueDate: '2026-03-15', amount: 4200, recurring: true },
];

function generateCashflow(): any {
  const now = new Date();
  const windows = [
    { label: 'Days 1-30', start: 0, end: 30 },
    { label: 'Days 31-60', start: 30, end: 60 },
    { label: 'Days 61-90', start: 60, end: 90 },
  ];

  const cashOnHand = 48000;
  const barData = [];
  let runningCash = cashOnHand;

  for (const w of windows) {
    const windowStart = new Date(now.getTime() + w.start * 86400000);
    const windowEnd = new Date(now.getTime() + w.end * 86400000);

    // INFLOWS: Odoo receivables due in this window
    const arInflows = odooReceivables.filter(r => {
      const d = new Date(r.dueDate);
      return d >= windowStart && d < windowEnd;
    });
    const arTotal = arInflows.reduce((s, r) => s + r.amount, 0);

    // INFLOWS: HubSpot deals expected to close in this window (weighted by probability)
    const dealInflows = hubspotDeals.filter(d => {
      const close = new Date(d.expectedCloseDate);
      return close >= windowStart && close < windowEnd;
    });
    const dealTotal = dealInflows.reduce((s, d) => s + Math.round(d.value * d.probability), 0);

    // OUTFLOWS: Vendor bills due in this window
    const billOutflows = odooPayables.filter(b => {
      const d = new Date(b.dueDate);
      // For recurring bills, they appear in every window
      if (b.recurring && w.start >= 30) {
        return true; // monthly recurring
      }
      return d >= windowStart && d < windowEnd;
    });
    const billTotal = billOutflows.reduce((s, b) => s + b.amount, 0);

    const totalInflow = arTotal + dealTotal;
    const totalOutflow = billTotal;
    const netCash = totalInflow - totalOutflow;
    runningCash += netCash;

    barData.push({
      window: w.label,
      daysRange: `${w.start + 1}-${w.end}`,
      inflows: {
        arReceivables: { total: arTotal, items: arInflows.map(r => ({ number: r.number, partner: r.partner, amount: r.amount, dueDate: r.dueDate })) },
        hubspotDeals: { total: dealTotal, items: dealInflows.map(d => ({ name: d.name, rawValue: d.value, probability: d.probability, weightedValue: Math.round(d.value * d.probability), stage: d.stage, closeDate: d.expectedCloseDate })) },
        total: totalInflow,
      },
      outflows: {
        vendorBills: { total: billTotal, items: billOutflows.map(b => ({ vendor: b.vendor, amount: b.amount, dueDate: b.dueDate, recurring: b.recurring })) },
        total: totalOutflow,
      },
      netCash,
      endingCash: runningCash,
    });
  }

  return {
    cashOnHand,
    windows: barData,
    totals: {
      totalInflow: barData.reduce((s, w) => s + w.inflows.total, 0),
      totalOutflow: barData.reduce((s, w) => s + w.outflows.total, 0),
      netChange: barData.reduce((s, w) => s + w.netCash, 0),
      endingCash90: runningCash,
    },
    sources: {
      odooReceivables: odooReceivables.length,
      hubspotDeals: hubspotDeals.length,
      vendorBills: odooPayables.length,
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  if (view === 'sources') {
    return NextResponse.json({
      receivables: odooReceivables,
      deals: hubspotDeals,
      payables: odooPayables,
    });
  }

  return NextResponse.json(generateCashflow());
}
