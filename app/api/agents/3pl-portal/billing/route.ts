export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DEMO_INVOICES, DEMO_PAYMENTS, DEMO_CUSTOMER } from '@/lib/3pl-portal-data';

export async function GET() {
  const currentMonth = DEMO_INVOICES[0];
  const arrears = DEMO_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.balance_due, 0);
  return NextResponse.json({
    invoices: DEMO_INVOICES,
    currentMonth,
    arrears,
    autoPayEnabled: DEMO_CUSTOMER.auto_pay_enabled,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'pay-invoice': {
      const invoice = DEMO_INVOICES.find(i => i.id === body.invoiceId);
      if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      const convFee = DEMO_CUSTOMER.auto_pay_enabled ? 0 : +(invoice.balance_due * (DEMO_CUSTOMER.convenience_fee_rate / 100)).toFixed(2);
      const discount = DEMO_CUSTOMER.auto_pay_enabled ? +(invoice.balance_due * (DEMO_CUSTOMER.auto_pay_discount / 100)).toFixed(2) : 0;
      return NextResponse.json({ success: true, amount: invoice.balance_due, convenience_fee: convFee, discount, total_charged: +(invoice.balance_due + convFee - discount).toFixed(2), message: 'Payment processed successfully.' });
    }

    case 'get-payment-history':
      return NextResponse.json({ payments: DEMO_PAYMENTS });

    case 'setup-autopay':
      return NextResponse.json({ success: true, message: 'Auto-pay has been enabled. You will save 3% on every invoice.' });

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
