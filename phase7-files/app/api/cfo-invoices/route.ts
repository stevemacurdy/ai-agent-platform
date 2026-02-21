import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// ====== INVOICES (AR) ======
let invoices: any[] = [
  { id: 'inv-1', number: 'INV/2026/00001', client: 'Logicorp', contactName: 'Marcus Chen', amount: 24500, amountPaid: 0, status: 'overdue', dueDate: '2026-01-15', issueDate: '2025-12-15', daysOverdue: 32,
    lineItems: [
      { id: 'li-1', description: 'Warehouse rack installation — Bay 1-3', qty: 1, unitPrice: 18000, total: 18000 },
      { id: 'li-2', description: 'Conveyor system alignment', qty: 8, unitPrice: 500, total: 4000 },
      { id: 'li-3', description: 'Safety inspection & certification', qty: 1, unitPrice: 2500, total: 2500 },
    ],
    odooId: 'account.move,1042', vendorReliabilityScore: 95 },
  { id: 'inv-2', number: 'INV/2026/00002', client: 'Pinnacle Group', contactName: 'Sarah Kim', amount: 14495, amountPaid: 14495, status: 'paid', dueDate: '2026-02-10', issueDate: '2026-01-10', daysOverdue: 0,
    lineItems: [
      { id: 'li-4', description: 'Digital transformation — Phase 1 consulting', qty: 40, unitPrice: 275, total: 11000 },
      { id: 'li-5', description: 'System architecture design', qty: 1, unitPrice: 3495, total: 3495 },
    ],
    odooId: 'account.move,1043', vendorReliabilityScore: 88 },
  { id: 'inv-3', number: 'INV/2026/00003', client: 'GreenLeaf Supply', contactName: 'Tom Bradley', amount: 8200, amountPaid: 0, status: 'overdue', dueDate: '2026-02-01', issueDate: '2026-01-01', daysOverdue: 15,
    lineItems: [
      { id: 'li-6', description: 'Pallet racking — 4 rows', qty: 4, unitPrice: 1500, total: 6000 },
      { id: 'li-7', description: 'Installation labor', qty: 16, unitPrice: 75, total: 1200 },
      { id: 'li-8', description: 'Materials & hardware', qty: 1, unitPrice: 1000, total: 1000 },
    ],
    odooId: 'account.move,1044', vendorReliabilityScore: 65 },
  { id: 'inv-4', number: 'INV/2026/00004', client: 'TechForge Inc', contactName: 'Diana Ross', amount: 32000, amountPaid: 16000, status: 'partial', dueDate: '2026-02-28', issueDate: '2026-01-28', daysOverdue: 0,
    lineItems: [
      { id: 'li-9', description: 'Automated sortation system — design', qty: 1, unitPrice: 15000, total: 15000 },
      { id: 'li-10', description: 'Sortation system — fabrication', qty: 1, unitPrice: 12000, total: 12000 },
      { id: 'li-11', description: 'Project management', qty: 20, unitPrice: 250, total: 5000 },
    ],
    odooId: 'account.move,1045', vendorReliabilityScore: 78 },
  { id: 'inv-5', number: 'INV/2026/00005', client: 'Clutch Client Co', contactName: 'James Wright', amount: 12400, amountPaid: 0, status: 'sent', dueDate: '2026-03-15', issueDate: '2026-02-15', daysOverdue: 0,
    lineItems: [
      { id: 'li-12', description: 'Rack installation materials', qty: 1, unitPrice: 8400, total: 8400 },
      { id: 'li-13', description: 'Labor — rack install', qty: 40, unitPrice: 100, total: 4000 },
    ],
    odooId: 'account.move,1046', vendorReliabilityScore: 50 },
  { id: 'inv-6', number: 'INV/2026/00006', client: 'Logicorp', contactName: 'Marcus Chen', amount: 45000, amountPaid: 0, status: 'overdue', dueDate: '2026-01-30', issueDate: '2025-12-30', daysOverdue: 17,
    lineItems: [
      { id: 'li-14', description: 'Conveyor system — Phase 2', qty: 1, unitPrice: 35000, total: 35000 },
      { id: 'li-15', description: 'Electrical work', qty: 24, unitPrice: 250, total: 6000 },
      { id: 'li-16', description: 'Integration testing', qty: 16, unitPrice: 250, total: 4000 },
    ],
    odooId: 'account.move,1047', vendorReliabilityScore: 95 },
];

// ====== AUDIT LOG ======
let auditLog: any[] = [
  { id: 'aud-1', invoiceId: 'inv-2', userId: 'admin', action: 'payment_received', timestamp: '2026-02-11T09:00:00Z', before: { status: 'sent', amountPaid: 0 }, after: { status: 'paid', amountPaid: 14495 } },
  { id: 'aud-2', invoiceId: 'inv-4', userId: 'admin', action: 'partial_payment', timestamp: '2026-02-10T14:00:00Z', before: { amountPaid: 0, status: 'sent' }, after: { amountPaid: 16000, status: 'partial' } },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');
  const invoiceId = searchParams.get('invoiceId');

  if (view === 'detail' && invoiceId) {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const logs = auditLog.filter(a => a.invoiceId === invoiceId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return NextResponse.json({ invoice: inv, auditLog: logs });
  }

  if (view === 'overdue') {
    const overdue = invoices.filter(i => i.status === 'overdue').sort((a, b) => b.daysOverdue - a.daysOverdue);
    return NextResponse.json({ invoices: overdue, totalOverdue: overdue.reduce((s, i) => s + (i.amount - i.amountPaid), 0) });
  }

  if (view === 'audit') {
    return NextResponse.json({ log: auditLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) });
  }

  // Summary
  const totalAR = invoices.reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const overdueTotal = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const paidTotal = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amountPaid, 0);

  return NextResponse.json({ invoices, summary: { totalAR, overdueTotal, paidTotal, invoiceCount: invoices.length, overdueCount: invoices.filter(i => i.status === 'overdue').length } });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();
  const userId = request.headers.get('x-admin-email') || 'admin';

  switch (body.action) {
    case 'edit-line-item': {
      const inv = invoices.find(i => i.id === body.invoiceId);
      if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      const li = inv.lineItems.find((l: any) => l.id === body.lineItemId);
      if (!li) return NextResponse.json({ error: 'Line item not found' }, { status: 404 });

      const before = { description: li.description, qty: li.qty, unitPrice: li.unitPrice, total: li.total };

      if (body.description !== undefined) li.description = body.description;
      if (body.qty !== undefined) { li.qty = body.qty; li.total = li.qty * li.unitPrice; }
      if (body.unitPrice !== undefined) { li.unitPrice = body.unitPrice; li.total = li.qty * li.unitPrice; }

      const after = { description: li.description, qty: li.qty, unitPrice: li.unitPrice, total: li.total };

      // Recalc invoice total
      inv.amount = inv.lineItems.reduce((s: number, l: any) => s + l.total, 0);

      // Audit log
      const audit = { id: 'aud-' + Date.now(), invoiceId: body.invoiceId, userId, action: 'line_item_edit', timestamp: new Date().toISOString(), before, after, lineItemId: body.lineItemId };
      auditLog.push(audit);

      // Odoo sync simulation
      const odooSync = { synced: true, odooId: inv.odooId, method: 'account.move.write', timestamp: new Date().toISOString() };

      return NextResponse.json({ invoice: inv, audit, odooSync });
    }

    case 'add-line-item': {
      const inv = invoices.find(i => i.id === body.invoiceId);
      if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

      const newLI = { id: 'li-' + Date.now(), description: body.description || 'New line item', qty: body.qty || 1, unitPrice: body.unitPrice || 0, total: (body.qty || 1) * (body.unitPrice || 0) };
      inv.lineItems.push(newLI);
      inv.amount = inv.lineItems.reduce((s: number, l: any) => s + l.total, 0);

      auditLog.push({ id: 'aud-' + Date.now(), invoiceId: body.invoiceId, userId, action: 'line_item_added', timestamp: new Date().toISOString(), before: null, after: newLI });

      return NextResponse.json({ invoice: inv, lineItem: newLI });
    }

    case 'remove-line-item': {
      const inv = invoices.find(i => i.id === body.invoiceId);
      if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      const liIdx = inv.lineItems.findIndex((l: any) => l.id === body.lineItemId);
      if (liIdx === -1) return NextResponse.json({ error: 'Line item not found' }, { status: 404 });

      const removed = inv.lineItems.splice(liIdx, 1)[0];
      inv.amount = inv.lineItems.reduce((s: number, l: any) => s + l.total, 0);

      auditLog.push({ id: 'aud-' + Date.now(), invoiceId: body.invoiceId, userId, action: 'line_item_removed', timestamp: new Date().toISOString(), before: removed, after: null });

      return NextResponse.json({ invoice: inv });
    }

    case 'record-payment': {
      const inv = invoices.find(i => i.id === body.invoiceId);
      if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

      const before = { amountPaid: inv.amountPaid, status: inv.status };
      inv.amountPaid += body.amount;
      inv.status = inv.amountPaid >= inv.amount ? 'paid' : 'partial';
      inv.daysOverdue = 0;

      auditLog.push({ id: 'aud-' + Date.now(), invoiceId: body.invoiceId, userId, action: 'payment_received', timestamp: new Date().toISOString(), before, after: { amountPaid: inv.amountPaid, status: inv.status } });

      return NextResponse.json({ invoice: inv });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
