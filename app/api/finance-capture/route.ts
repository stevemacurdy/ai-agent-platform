export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

const CATEGORIES = ['advertising','car_truck','commissions_fees','contract_labor','employee_benefits','insurance','interest_mortgage','legal_professional','office_expense','profit_sharing','rent_lease_vehicles','rent_lease_machinery','rent_lease_property','repairs_maintenance','supplies','taxes_licenses','travel_meals','utilities','wages'];

const pendingReview: any[] = [
  { id: 'pr-1', vendor: 'Grainger Industrial', invoice: 'GR-9981234', amount: 3450.00, category: 'supplies', date: '2026-02-10', due: '2026-03-10', confidence: 94, lineItems: [{ desc: 'Conveyor rollers (24pk)', qty: 2, price: 1200 }, { desc: 'Belt material 100ft', qty: 1, price: 1050 }], status: 'pending_review', capturedAt: '2026-02-12T09:15:00Z' },
  { id: 'pr-2', vendor: 'Fastenal', invoice: 'FAS-662891', amount: 890.50, category: 'supplies', date: '2026-02-08', due: '2026-03-08', confidence: 87, lineItems: [{ desc: 'Grade 8 bolts assorted', qty: 10, price: 45 }, { desc: 'Washers flat 1/2"', qty: 20, price: 12 }, { desc: 'Welding rod E7018', qty: 5, price: 28.10 }], status: 'pending_review', capturedAt: '2026-02-12T10:30:00Z' },
];

const paymentMethods = [
  { id: 'pm-1', label: 'Chase Business Checking ****4821', type: 'bank', prefix: 'ACH' },
  { id: 'pm-2', label: 'First National ****7733', type: 'bank', prefix: 'ACH' },
  { id: 'pm-3', label: 'Amex Business Platinum ****1004', type: 'credit', prefix: 'AMEX' },
  { id: 'pm-4', label: 'Capital One Spark ****5592', type: 'credit', prefix: 'CO' },
];

const paymentHistory: any[] = [];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const view = new URL(request.url).searchParams.get('view');
  if (view === 'pending') return NextResponse.json({ items: pendingReview.filter(p => p.status === 'pending_review'), count: pendingReview.filter(p => p.status === 'pending_review').length });
  if (view === 'methods') return NextResponse.json({ methods: paymentMethods });
  if (view === 'history') return NextResponse.json({ payments: paymentHistory });
  return NextResponse.json({ pendingCount: pendingReview.filter(p => p.status === 'pending_review').length, totalPending: pendingReview.filter(p => p.status === 'pending_review').reduce((s, p) => s + p.amount, 0), paymentMethods: paymentMethods.length, categories: CATEGORIES });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  if (body.action === 'capture') {
    // Simulated OCR extraction
    const extracted = {
      id: 'pr-' + Date.now(), vendor: body.vendor || 'Unknown Vendor', invoice: body.invoice || 'INV-' + Date.now(),
      amount: body.amount || 0, category: CATEGORIES.includes(body.category) ? body.category : 'supplies',
      date: body.date || new Date().toISOString().split('T')[0], due: body.due || '',
      confidence: Math.floor(Math.random() * 15) + 82, lineItems: body.lineItems || [],
      status: 'pending_review', capturedAt: new Date().toISOString(),
    };
    pendingReview.push(extracted);
    return NextResponse.json({ success: true, extracted, ocrEngine: 'rule-based-fallback' });
  }

  if (body.action === 'approve') {
    const item = pendingReview.find(p => p.id === body.id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    item.status = 'approved';
    return NextResponse.json({ success: true, item, apSync: { status: 'pushed', endpoint: '/api/ap' } });
  }

  if (body.action === 'reject') {
    const item = pendingReview.find(p => p.id === body.id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    item.status = 'rejected';
    return NextResponse.json({ success: true, item });
  }

  if (body.action === 'pay') {
    const method = paymentMethods.find(m => m.id === body.methodId);
    if (!method) return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    const confirmation = method.prefix + '-' + Math.floor(10000 + Math.random() * 90000);
    const payment = { id: 'pay-' + Date.now(), vendor: body.vendor, amount: body.amount, method: method.label, confirmation, status: 'completed', paidAt: new Date().toISOString(), odooSync: { status: 'queued', timestamp: new Date().toISOString() } };
    paymentHistory.push(payment);
    return NextResponse.json({ success: true, payment });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
