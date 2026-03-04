export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCustomer, getInvoices, getPayments, insertPayment, updateInvoiceStatus } from '@/lib/3pl-portal-supabase';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || 'MWS-001';
  const customer = await getCustomer(code);
  const [invoices, payments] = await Promise.all([getInvoices(customer.id), getPayments(customer.id)]);
  const arrears = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.balance_due, 0);
  return NextResponse.json({ invoices, payments, arrears, autoPayEnabled: customer.auto_pay_enabled });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, customerCode } = body;
  const customer = await getCustomer(customerCode || 'MWS-001');

  switch (action) {
    case 'pay-invoice': {
      const invoices = await getInvoices(customer.id);
      const invoice = invoices.find(i => i.id === body.invoiceId);
      if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      const convFee = customer.auto_pay_enabled ? 0 : +(invoice.balance_due * (customer.convenience_fee_rate / 100)).toFixed(2);
      const discount = customer.auto_pay_enabled ? +(invoice.balance_due * (customer.auto_pay_discount / 100)).toFixed(2) : 0;
      const totalCharged = +(invoice.balance_due + convFee - discount).toFixed(2);

      await insertPayment({
        customer_id: customer.id,
        invoice_id: invoice.id,
        amount: invoice.balance_due,
        convenience_fee: convFee,
        discount_applied: discount,
        net_amount: totalCharged,
        payment_method: body.paymentMethod || 'card',
        status: 'completed',
        days_from_due: Math.ceil((Date.now() - new Date(invoice.due_date).getTime()) / 86400000),
      });
      await updateInvoiceStatus(invoice.id, {
        status: 'paid',
        amount_paid: invoice.total_due,
        paid_date: new Date().toISOString().split('T')[0],
      });

      return NextResponse.json({ success: true, amount: invoice.balance_due, convenience_fee: convFee, discount, total_charged: totalCharged });
    }
    case 'get-payment-history': {
      const payments = await getPayments(customer.id);
      return NextResponse.json({ payments });
    }
    case 'setup-autopay':
      return NextResponse.json({ success: true, message: 'Auto-pay enabled. You save 3% on every invoice.' });
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
