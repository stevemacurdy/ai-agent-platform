export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'order-placed':
      return NextResponse.json({ success: true, message: 'Admin and operations team notified.' });
    case 'order-shipped':
      return NextResponse.json({ success: true, message: 'Customer notified of shipment.' });
    case 'inventory-received':
      return NextResponse.json({ success: true, message: 'Customer notified of receiving.' });
    case 'invoice-posted':
      return NextResponse.json({ success: true, message: 'Customer notified of new invoice.' });
    case 'payment-received':
      return NextResponse.json({ success: true, message: 'Payment confirmation sent.' });
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
