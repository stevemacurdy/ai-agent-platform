export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/3pl-portal-supabase';
import {
  DEMO_CUSTOMER, DEMO_INVENTORY, DEMO_ORDERS, DEMO_INVOICES,
  DEMO_PAYMENTS, DEMO_RECEIVING, DEMO_ACTIVITY,
  getDemoKPIs, getPaymentChartData, getInventoryChartData,
} from '@/lib/3pl-portal-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerCode = searchParams.get('code') || 'MWS-001';
  const isDemo = customerCode === 'MWS-001';

  try {
    if (isDemo) {
      // Demo mode — return hardcoded data immediately
      return NextResponse.json({
        isDemo: true,
        customer: DEMO_CUSTOMER,
        inventory: DEMO_INVENTORY,
        orders: DEMO_ORDERS,
        invoices: DEMO_INVOICES,
        payments: DEMO_PAYMENTS,
        receiving: DEMO_RECEIVING,
        activity: DEMO_ACTIVITY,
        kpis: getDemoKPIs(),
        paymentChartData: getPaymentChartData(),
        inventoryChartData: getInventoryChartData(),
      });
    }

    // Live mode — fetch from Supabase with demo fallback
    const data = await getDashboardData(customerCode);
    const paymentChartData = data.invoices.slice().reverse().map(inv => ({
      month: new Date(inv.period_start).toLocaleDateString('en-US', { month: 'short' }),
      amount: inv.total_due,
      daysLate: inv.days_late,
      status: inv.status === 'posted' ? 'unpaid' : inv.days_late <= 14 ? 'on-time' : inv.days_late <= 29 ? 'late-15' : 'late-30',
      paidDate: inv.paid_date || null,
    }));

    const byType: Record<string, number> = {};
    data.inventory.forEach(i => { byType[i.product_type] = (byType[i.product_type] || 0) + i.quantity_on_hand; });
    const inventoryChartData: Record<string, any>[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(2026, 2 - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const factor = 1 - (i * 0.03) + (Math.sin(i * 0.8) * 0.05);
      inventoryChartData.push({
        month: label,
        powder: Math.round((byType['powder'] || 0) * factor),
        cube: Math.round((byType['cube'] || 0) * factor),
        whole: Math.round((byType['whole'] || 0) * factor),
        liquid: Math.round((byType['liquid'] || 0) * factor),
        hazmat: Math.round((byType['hazmat'] || 0) * factor),
        perishable: Math.round((byType['perishable'] || 0) * factor),
      });
    }

    // Get receiving data
    const { getReceiving } = await import('@/lib/3pl-portal-supabase');
    const receiving = await getReceiving(data.customer.id);

    return NextResponse.json({
      isDemo: false,
      customer: data.customer,
      inventory: data.inventory,
      orders: data.orders,
      invoices: data.invoices,
      payments: data.payments,
      receiving,
      activity: data.activity,
      kpis: data.kpis,
      paymentChartData,
      inventoryChartData,
    });
  } catch (err) {
    console.error('Portal data fetch error:', err);
    // Fall back to demo on error
    return NextResponse.json({
      isDemo: true,
      customer: DEMO_CUSTOMER,
      inventory: DEMO_INVENTORY,
      orders: DEMO_ORDERS,
      invoices: DEMO_INVOICES,
      payments: DEMO_PAYMENTS,
      receiving: DEMO_RECEIVING,
      activity: DEMO_ACTIVITY,
      kpis: getDemoKPIs(),
      paymentChartData: getPaymentChartData(),
      inventoryChartData: getInventoryChartData(),
    });
  }
}
