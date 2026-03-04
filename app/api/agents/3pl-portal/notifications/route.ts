export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  // In production, these would send emails via Resend and create in-app notifications
  switch (action) {
    case 'order-placed':
      console.log('[3PL Notification] Order placed:', body.orderNumber);
      return NextResponse.json({ success: true, message: 'Admin and operations team notified.' });

    case 'order-shipped':
      console.log('[3PL Notification] Order shipped:', body.orderNumber);
      return NextResponse.json({ success: true, message: 'Customer notified of shipment.' });

    case 'inventory-received':
      console.log('[3PL Notification] Inventory received:', body.palletCount, 'pallets');
      return NextResponse.json({ success: true, message: 'Customer notified of receiving.' });

    case 'invoice-posted':
      console.log('[3PL Notification] Invoice posted:', body.invoiceNumber);
      return NextResponse.json({ success: true, message: 'Customer notified of new invoice.' });

    case 'payment-received':
      console.log('[3PL Notification] Payment received:', body.amount);
      return NextResponse.json({ success: true, message: 'Payment confirmation sent.' });

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
