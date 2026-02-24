export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

const invoices: any[] = [
  { id: 'inv-1', number: 'INV/2026/00001', client: 'Logicorp', contactName: 'Marcus Chen', contactEmail: 'mchen@logicorp.com', amount: 24500, amountPaid: 0, status: 'overdue', issueDate: '2026-01-10', dueDate: '2026-01-15', daysOverdue: 32, odooId: 'account.move/1042', vendorReliabilityScore: 95, lineItems: [
    { id: 'li-1a', description: 'Conveyor installation — Bay 3', qty: 1, unitPrice: 18000, total: 18000 },
    { id: 'li-1b', description: 'Electrical hookup + commissioning', qty: 1, unitPrice: 4500, total: 4500 },
    { id: 'li-1c', description: 'Safety certification', qty: 1, unitPrice: 2000, total: 2000 },
  ]},
  { id: 'inv-2', number: 'INV/2026/00002', client: 'Pinnacle Group', contactName: 'Sarah Kim', contactEmail: 'skim@pinnacle.com', amount: 14500, amountPaid: 14500, status: 'paid', issueDate: '2026-01-05', dueDate: '2026-02-05', daysOverdue: 0, odooId: 'account.move/1043', vendorReliabilityScore: 88, lineItems: [
    { id: 'li-2a', description: 'Automation consulting — Phase 1', qty: 40, unitPrice: 250, total: 10000 },
    { id: 'li-2b', description: 'Travel & accommodation', qty: 1, unitPrice: 4500, total: 4500 },
  ]},
  { id: 'inv-3', number: 'INV/2026/00003', client: 'GreenLeaf Supply', contactName: 'Tom Bradley', contactEmail: 'tbradley@greenleaf.com', amount: 8200, amountPaid: 0, status: 'overdue', issueDate: '2026-01-20', dueDate: '2026-02-01', daysOverdue: 15, odooId: 'account.move/1044', vendorReliabilityScore: 65, lineItems: [
    { id: 'li-3a', description: 'Racking system — 200 pallet positions', qty: 200, unitPrice: 35, total: 7000 },
    { id: 'li-3b', description: 'Installation labor', qty: 8, unitPrice: 150, total: 1200 },
  ]},
  { id: 'inv-4', number: 'INV/2026/00004', client: 'TechForge Inc', contactName: 'Daniel Park', contactEmail: 'dpark@techforge.io', amount: 32000, amountPaid: 16000, status: 'partial', issueDate: '2026-01-25', dueDate: '2026-02-25', daysOverdue: 0, odooId: 'account.move/1045', vendorReliabilityScore: 72, lineItems: [
    { id: 'li-4a', description: 'Sortation system design', qty: 1, unitPrice: 12000, total: 12000 },
    { id: 'li-4b', description: 'Equipment procurement', qty: 1, unitPrice: 15000, total: 15000 },
    { id: 'li-4c', description: 'Project management', qty: 20, unitPrice: 250, total: 5000 },
  ]},
  { id: 'inv-5', number: 'INV/2026/00005', client: 'Clutch Client Co', contactName: 'Amy Torres', contactEmail: 'atorres@clutchclient.com', amount: 12400, amountPaid: 0, status: 'sent', issueDate: '2026-02-10', dueDate: '2026-03-10', daysOverdue: 0, odooId: 'account.move/1046', vendorReliabilityScore: 80, lineItems: [
    { id: 'li-5a', description: 'Warehouse layout optimization', qty: 1, unitPrice: 8000, total: 8000 },
    { id: 'li-5b', description: 'CAD drawings (3 revisions)', qty: 3, unitPrice: 1200, total: 3600 },
    { id: 'li-5c', description: 'Site visit', qty: 1, unitPrice: 800, total: 800 },
  ]},
  { id: 'inv-6', number: 'INV/2026/00006', client: 'Logicorp', contactName: 'Marcus Chen', contactEmail: 'mchen@logicorp.com', amount: 45000, amountPaid: 0, status: 'overdue', issueDate: '2026-01-20', dueDate: '2026-01-30', daysOverdue: 17, odooId: 'account.move/1047', vendorReliabilityScore: 95, lineItems: [
    { id: 'li-6a', description: 'Phase 2 — mezzanine construction', qty: 1, unitPrice: 35000, total: 35000 },
    { id: 'li-6b', description: 'Steel fabrication', qty: 1, unitPrice: 8000, total: 8000 },
    { id: 'li-6c', description: 'Engineering stamps', qty: 1, unitPrice: 2000, total: 2000 },
  ]},
];

const auditLog: any[] = [];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');
  const invoiceId = searchParams.get('invoiceId');

  if (view === 'detail' && invoiceId) {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ invoice: inv, auditLog: auditLog.filter(a => a.invoiceId === invoiceId) });
  }

  const totalAR = invoices.reduce((s, i) => s + i.amount - i.amountPaid, 0);
  const overdueTotal = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount - i.amountPaid, 0);
  const paidTotal = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amountPaid, 0);

  return NextResponse.json({
    invoices: invoices.map(i => ({ ...i, lineItems: undefined })),
    summary: { totalAR, overdueTotal, paidTotal, invoiceCount: invoices.length, overdueCount: invoices.filter(i => i.status === 'overdue').length },
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();
  const email = request.headers.get('x-admin-email') || 'admin';

  if (body.action === 'edit-line-item') {
    const inv = invoices.find(i => i.id === body.invoiceId);
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    const li = inv.lineItems.find((l: any) => l.id === body.lineItemId);
    if (!li) return NextResponse.json({ error: 'Line item not found' }, { status: 404 });
    const before = { description: li.description, qty: li.qty, unitPrice: li.unitPrice, total: li.total };
    if (body.description) li.description = body.description;
    if (body.qty !== undefined) li.qty = body.qty;
    if (body.unitPrice !== undefined) li.unitPrice = body.unitPrice;
    li.total = li.qty * li.unitPrice;
    inv.amount = inv.lineItems.reduce((s: number, l: any) => s + l.total, 0);
    const after = { description: li.description, qty: li.qty, unitPrice: li.unitPrice, total: li.total };
    auditLog.push({ id: 'audit-' + Date.now(), invoiceId: body.invoiceId, lineItemId: body.lineItemId, userId: email, action: 'line_item_edit', before, after, timestamp: new Date().toISOString(), odooSync: { status: 'simulated', method: 'account.move.write', timestamp: new Date().toISOString() } });
    return NextResponse.json({ success: true, invoice: inv, audit: auditLog[auditLog.length - 1] });
  }

  if (body.action === 'record-payment') {
    const inv = invoices.find(i => i.id === body.invoiceId);
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    inv.amountPaid += body.amount || (inv.amount - inv.amountPaid);
    if (inv.amountPaid >= inv.amount) { inv.status = 'paid'; inv.daysOverdue = 0; }
    else inv.status = 'partial';
    auditLog.push({ id: 'audit-' + Date.now(), invoiceId: body.invoiceId, userId: email, action: 'payment_received', before: { amountPaid: inv.amountPaid - body.amount }, after: { amountPaid: inv.amountPaid, status: inv.status }, timestamp: new Date().toISOString() });
    return NextResponse.json({ success: true, invoice: inv });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
