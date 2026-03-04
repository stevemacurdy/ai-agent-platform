export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DEMO_ORDERS, DEMO_CUSTOMER, DEMO_INVENTORY, generateOrderNumber, generatePONumber, generateBOLNumber } from '@/lib/3pl-portal-data';
import { generateBOL } from '@/lib/bol-generator';

export async function GET() {
  return NextResponse.json({ orders: DEMO_ORDERS });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'place-order': {
      const orderNumber = generateOrderNumber();
      const poNumber = body.customerPO || generatePONumber();
      const bolNumber = generateBOLNumber();
      const date = new Date().toISOString().split('T')[0];

      const lineItems = (body.lineItems || []).map((li: any) => {
        const inv = DEMO_INVENTORY.find(i => i.id === li.inventoryId);
        return {
          inventory_id: li.inventoryId,
          sku: li.sku || inv?.sku || '',
          description: inv?.description || '',
          unit_type: li.unitType || 'each',
          quantity: li.quantity || 0,
          weight_per_unit: inv?.weight_per_unit || 0,
          total_weight: (inv?.weight_per_unit || 0) * (li.quantity || 0),
          product_type: inv?.product_type || 'cube',
        };
      });

      const bolData = generateBOL({
        bolNumber,
        date,
        consigneeName: body.shipTo?.name || '',
        consigneeAddress: body.shipTo || {},
        carrierName: body.carrier || '',
        lineItems,
        customerName: DEMO_CUSTOMER.customer_name,
        customerAddress: DEMO_CUSTOMER.billing_address,
        specialInstructions: body.specialInstructions,
      });

      const totalWeight = lineItems.reduce((s: number, li: any) => s + li.total_weight, 0);
      const totalPallets = Math.max(1, Math.ceil(totalWeight / 2000));

      const order = {
        id: `ord-new-${Date.now()}`,
        customer_id: DEMO_CUSTOMER.id,
        order_number: orderNumber,
        po_number: poNumber,
        ship_to_name: body.shipTo?.name || '',
        ship_to_address: body.shipTo || {},
        ship_method: body.shipMethod || 'ground',
        carrier: body.carrier || '',
        requested_ship_date: body.requestedDate || date,
        status: 'pending',
        line_items: lineItems,
        total_weight: totalWeight,
        total_pallets: totalPallets,
        total_cases: lineItems.reduce((s: number, li: any) => s + li.quantity, 0),
        bol_number: bolNumber,
        bol_data: bolData,
        special_instructions: body.specialInstructions || '',
        placed_by: DEMO_CUSTOMER.contact_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, order, bolData, message: `Order ${orderNumber} placed successfully.` });
    }

    case 'cancel-order':
      return NextResponse.json({ success: true, message: 'Order cancelled.' });

    case 'get-order-detail': {
      const order = DEMO_ORDERS.find(o => o.id === body.orderId || o.order_number === body.orderNumber);
      return order ? NextResponse.json({ order }) : NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    case 'attach-document':
      return NextResponse.json({ success: true, message: 'Document attached to order.' });

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
