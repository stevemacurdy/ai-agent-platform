export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomer, getInventory, getOrders, getInvoices, getPayments,
  getReceiving, getActivity, getDashboardData,
} from '@/lib/3pl-portal-supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { customerCode: string } }
) {
  const { customerCode } = params;

  if (!customerCode) {
    return NextResponse.json({ error: 'Customer code required' }, { status: 400 });
  }

  try {
    const dashData = await getDashboardData(customerCode);
    const receiving = await getReceiving(dashData.customer.id);

    // Compute payment chart data from invoices
    const paymentChartData = dashData.invoices.slice(0, 12).reverse().map((inv: any) => {
      const pmt = dashData.payments.find((p: any) => p.invoice_id === inv.id);
      return {
        month: new Date(inv.period_end || inv.period_start).toLocaleDateString('en-US', { month: 'short' }),
        amount: inv.total_due,
        status: pmt?.timeliness || (inv.status === 'paid' ? 'on-time' : inv.status === 'overdue' ? 'unpaid' : 'unpaid'),
      };
    });

    // Compute inventory chart data (current snapshot by type)
    const invByType: Record<string, number> = {};
    for (const item of dashData.inventory) {
      invByType[item.product_type] = (invByType[item.product_type] || 0) + item.quantity_on_hand;
    }
    const inventoryChartData = [{
      month: new Date().toLocaleDateString('en-US', { month: 'short' }),
      ...invByType,
    }];

    return NextResponse.json({
      customer: dashData.customer,
      inventory: dashData.inventory,
      orders: dashData.orders,
      invoices: dashData.invoices,
      payments: dashData.payments,
      receiving,
      activity: dashData.activity,
      kpis: dashData.kpis,
      paymentChartData,
      inventoryChartData,
    });
  } catch (err: any) {
    console.error('Portal data API error:', err);
    return NextResponse.json(
      { error: 'Failed to load portal data', details: err.message },
      { status: 500 }
    );
  }
}
