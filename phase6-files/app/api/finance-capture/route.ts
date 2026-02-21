import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

const AP_CATEGORIES = [
  'advertising','car_truck','commissions_fees','contract_labor','employee_benefits',
  'insurance','interest_mortgage','legal_professional','office_expense','profit_sharing',
  'rent_lease_vehicles','rent_lease_machinery','rent_lease_property','repairs_maintenance',
  'supplies','taxes_licenses','travel_meals','utilities','wages'
];

// ====== PENDING REVIEW QUEUE ======
let pendingReview: any[] = [
  { id: 'pr-1', filename: 'invoice-catfinancial-feb.pdf', captureMethod: 'desktop_upload',
    extracted: { vendorName: 'CAT Financial', invoiceNumber: 'CAT-88742', invoiceDate: '2026-03-01', dueDate: '2026-04-01', totalAmount: 3800, category: 'rent_lease_machinery', lineItems: [{ description: 'Forklift lease — monthly', amount: 3800 }], confidence: 0.94 },
    status: 'pending_review', capturedAt: '2026-02-16T08:00:00Z', capturedBy: 'admin' },
  { id: 'pr-2', filename: 'receipt-homedepot.jpg', captureMethod: 'mobile_camera',
    extracted: { vendorName: 'Home Depot', invoiceNumber: 'HD-991247', invoiceDate: '2026-02-15', dueDate: '2026-02-15', totalAmount: 287.43, category: 'supplies', lineItems: [{ description: '2x4 lumber (48 pcs)', amount: 192.00 }, { description: 'Screws/fasteners', amount: 45.43 }, { description: 'Safety equipment', amount: 50.00 }], confidence: 0.87 },
    status: 'pending_review', capturedAt: '2026-02-16T09:15:00Z', capturedBy: 'marcus@woulfgroup.com' },
];

// ====== PAYMENT METHODS ======
let paymentMethods: any[] = [
  { id: 'pm-1', type: 'bank_account', label: 'Chase Business Checking ****4821', last4: '4821', bankName: 'Chase', routingNumber: '***', isDefault: true },
  { id: 'pm-2', type: 'bank_account', label: 'Chase Business Savings ****7703', last4: '7703', bankName: 'Chase', routingNumber: '***', isDefault: false },
  { id: 'pm-3', type: 'credit_card', label: 'Amex Business Platinum ****1009', last4: '1009', network: 'Amex', isDefault: false },
  { id: 'pm-4', type: 'credit_card', label: 'Chase Ink Business ****3346', last4: '3346', network: 'Visa', isDefault: false },
];

// ====== VENDOR PAYEE DIRECTORY ======
let payees: any[] = [
  { id: 'payee-1', vendorName: 'CAT Financial', paymentType: 'ach', accountNumber: '****8841', routingNumber: '****2200', email: 'payments@catfinancial.com' },
  { id: 'payee-2', vendorName: 'National Grid', paymentType: 'ach', accountNumber: '****5501', routingNumber: '****1100', email: 'billing@nationalgrid.com' },
  { id: 'payee-3', vendorName: 'ADP Payroll', paymentType: 'ach', accountNumber: '****9912', routingNumber: '****3300', email: 'payroll@adp.com' },
  { id: 'payee-4', vendorName: 'Smith & Associates', paymentType: 'check', mailingAddress: '123 Legal Way, Suite 400, SLC, UT 84101', email: 'billing@smithlaw.com' },
];

// ====== PAYMENT LOG ======
let payments: any[] = [
  { id: 'pay-1', expenseId: 'ap-1', vendorName: 'Google Ads', amount: 4200, paymentMethod: 'pm-3', status: 'completed', paidAt: '2026-01-28T14:00:00Z', odooSynced: true, confirmationNumber: 'AMEX-88412' },
  { id: 'pay-2', expenseId: 'ap-5', vendorName: 'ADP Payroll', amount: 38500, paymentMethod: 'pm-1', status: 'completed', paidAt: '2026-02-14T06:00:00Z', odooSynced: true, confirmationNumber: 'ACH-22841' },
  { id: 'pay-3', expenseId: 'ap-8', vendorName: 'State Farm', amount: 6200, paymentMethod: 'pm-1', status: 'completed', paidAt: '2026-01-12T10:00:00Z', odooSynced: true, confirmationNumber: 'ACH-21990' },
];

// AI OCR extraction
async function extractDocument(base64Data: string, filename: string): Promise<any> {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    // Rule-based fallback
    const nameLower = filename.toLowerCase();
    return {
      vendorName: nameLower.includes('cat') ? 'CAT Financial' : nameLower.includes('depot') ? 'Home Depot' : 'Unknown Vendor',
      invoiceNumber: 'INV-' + Date.now().toString().slice(-6),
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: 0,
      category: 'office_expense',
      lineItems: [],
      confidence: 0.45,
    };
  }

  try {
    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(filename);
    const messages: any[] = [{
      role: 'user',
      content: [
        ...(isImage ? [{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } }] : []),
        { type: 'text', text: `Extract invoice data from this ${isImage ? 'image' : 'document'}. Return ONLY JSON:
{"vendorName":"...","invoiceNumber":"...","invoiceDate":"YYYY-MM-DD","dueDate":"YYYY-MM-DD","totalAmount":0.00,"category":"one of: ${AP_CATEGORIES.join(', ')}","lineItems":[{"description":"...","amount":0.00}],"confidence":0.0-1.0}` },
      ],
    }];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o', messages, temperature: 0.1, max_tokens: 800 }),
    });
    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content?.replace(/```json|```/g, '').trim());
  } catch {
    return { vendorName: 'Extraction Failed', invoiceNumber: '', invoiceDate: '', dueDate: '', totalAmount: 0, category: 'office_expense', lineItems: [], confidence: 0 };
  }
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  if (view === 'pending') return NextResponse.json({ items: pendingReview.filter(p => p.status === 'pending_review') });
  if (view === 'payment-methods') return NextResponse.json({ methods: paymentMethods });
  if (view === 'payees') return NextResponse.json({ payees });
  if (view === 'payments') return NextResponse.json({ payments, totalPaid: payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0) });

  return NextResponse.json({
    pendingCount: pendingReview.filter(p => p.status === 'pending_review').length,
    paymentMethods,
    recentPayments: payments.slice(-5),
    payees: payees.length,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  switch (body.action) {
    // ====== CAPTURE: Upload + OCR ======
    case 'capture': {
      const extracted = await extractDocument(body.base64 || '', body.filename || 'invoice.pdf');
      const item = {
        id: 'pr-' + Date.now(),
        filename: body.filename || 'upload',
        captureMethod: body.captureMethod || 'desktop_upload',
        extracted,
        status: 'pending_review',
        capturedAt: new Date().toISOString(),
        capturedBy: request.headers.get('x-admin-email') || 'unknown',
      };
      pendingReview.push(item);
      return NextResponse.json({ item, message: `Extracted with ${Math.round(extracted.confidence * 100)}% confidence` });
    }

    // ====== APPROVE: Move from pending to AP ledger ======
    case 'approve': {
      const idx = pendingReview.findIndex(p => p.id === body.itemId);
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const item = pendingReview[idx];

      // Apply any corrections from the review form
      if (body.corrections) {
        Object.assign(item.extracted, body.corrections);
      }
      item.status = 'approved';

      // Push to AP via internal call
      const baseUrl = request.nextUrl.origin;
      const apRes = await fetch(`${baseUrl}/api/ap`, {
        method: 'POST',
        headers: { 'x-admin-email': request.headers.get('x-admin-email') || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          vendorName: item.extracted.vendorName,
          invoiceNumber: item.extracted.invoiceNumber,
          amount: item.extracted.totalAmount,
          category: item.extracted.category,
          invoiceDate: item.extracted.invoiceDate,
          dueDate: item.extracted.dueDate,
          description: item.extracted.lineItems?.map((l: any) => l.description).join('; ') || '',
          allocationType: body.allocationType || 'overhead',
          projectId: body.projectId || null,
          odooAccount: body.odooAccount || 'woulf',
        }),
      });
      const apData = await apRes.json();
      return NextResponse.json({ approved: item, expense: apData.expense });
    }

    // ====== REJECT: Discard pending item ======
    case 'reject': {
      const idx = pendingReview.findIndex(p => p.id === body.itemId);
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      pendingReview[idx].status = 'rejected';
      return NextResponse.json({ success: true });
    }

    // ====== PAY: Execute payment on an expense ======
    case 'pay': {
      if (!body.expenseId || !body.paymentMethodId || !body.amount || !body.vendorName) {
        return NextResponse.json({ error: 'expenseId, paymentMethodId, amount, vendorName required' }, { status: 400 });
      }
      const method = paymentMethods.find(m => m.id === body.paymentMethodId);
      if (!method) return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });

      const payment = {
        id: 'pay-' + Date.now(),
        expenseId: body.expenseId,
        vendorName: body.vendorName,
        amount: body.amount,
        paymentMethod: body.paymentMethodId,
        status: 'processing',
        paidAt: new Date().toISOString(),
        odooSynced: false,
        confirmationNumber: (method.type === 'credit_card' ? method.network?.toUpperCase() : 'ACH') + '-' + Date.now().toString().slice(-5),
      };
      payments.push(payment);

      // Simulate processing → completed
      setTimeout(() => {
        payment.status = 'completed';
        payment.odooSynced = true;
      }, 2000);

      return NextResponse.json({ payment, message: `Payment of $${body.amount.toLocaleString()} initiated via ${method.label}` });
    }

    // ====== ADD PAYEE ======
    case 'add-payee': {
      const payee = { id: 'payee-' + Date.now(), ...body.data };
      payees.push(payee);
      return NextResponse.json({ payee });
    }

    // ====== ADD PAYMENT METHOD ======
    case 'add-payment-method': {
      const pm = { id: 'pm-' + Date.now(), ...body.data, isDefault: false };
      paymentMethods.push(pm);
      return NextResponse.json({ method: pm });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
