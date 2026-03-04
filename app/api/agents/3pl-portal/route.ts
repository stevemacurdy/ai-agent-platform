export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DEMO_CUSTOMER, DEMO_INVOICES, DEMO_INVENTORY, DEMO_ORDERS, DEMO_PAYMENTS, DEMO_ACTIVITY, getDemoKPIs } from '@/lib/3pl-portal-data';

export async function GET() {
  const kpis = getDemoKPIs();
  return NextResponse.json({
    customer: DEMO_CUSTOMER,
    kpis,
    recentActivity: DEMO_ACTIVITY,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'get-customer-profile':
      return NextResponse.json({ customer: DEMO_CUSTOMER });

    case 'update-profile':
      return NextResponse.json({ success: true, message: 'Profile updated successfully.' });

    case 'toggle-autopay': {
      const enabled = body.enabled ?? !DEMO_CUSTOMER.auto_pay_enabled;
      return NextResponse.json({ success: true, auto_pay_enabled: enabled, message: enabled ? 'Auto-pay enabled. You will save 3% on every invoice.' : 'Auto-pay disabled.' });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
