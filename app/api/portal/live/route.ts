export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData, getCustomer } from '@/lib/3pl-portal-supabase';
import { getPaymentChartData, getInventoryChartData } from '@/lib/3pl-portal-data';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || 'MWS-001';
  const data = await getDashboardData(code);
  return NextResponse.json({
    ...data,
    paymentChartData: getPaymentChartData(),
    inventoryChartData: getInventoryChartData(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, customerCode } = body;
  switch (action) {
    case 'get-customer-profile': {
      const customer = await getCustomer(customerCode || 'MWS-001');
      return NextResponse.json({ customer });
    }
    case 'update-profile':
      return NextResponse.json({ success: true, message: 'Profile updated.' });
    case 'toggle-autopay':
      return NextResponse.json({ success: true, message: body.enabled ? 'Auto-pay enabled.' : 'Auto-pay disabled.' });
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
