export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCustomer, getOrders, getInventory, insertOrder } from '@/lib/3pl-portal-supabase';
import { generateOrderNumber, generatePONumber, generateBOLNumber } from '@/lib/3pl-portal-data';
import { generateBOL } from '@/lib/bol-generator';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || 'MWS-001';
  const customer = await getCustomer(code);
  const orders = await getOrders(customer.id);
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, customerCode } = body;
  const customer = await getCustomer(customerCode || 'MWS-001');
  const inventory = await getInventory(customer.id);

  switch (action) {
    case 'place-order': {
      const orderNumber = generateOrderNumber();
      const poNumber = body.customerPO || generatePONumber();
      const bolNumber = generateBOLNumber();
      const date = new Date().toISOString().split('T')[0];

      const lineItems = (body.lineItems || []).map((li: any) => {
        const inv = inventory.find(i => i.id === li.inventoryId);
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
        bolNumber, date,
        consigneeName: body.shipTo?.name || '',
        consigneeAddress: body.shipTo || {},
        carrierName: body.carrier || '',
        lineItems,
        customerName: customer.customer_name,
        customerAddress: customer.billing_address as any,
        specialInstructions: body.specialInstructions,
      });

      const totalWeight = lineItems.reduce((s: number, li: any) => s + li.total_weight, 0);
      const order = {
        customer_id: customer.id,
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
        total_pallets: Math.max(1, Math.ceil(totalWeight / 2000)),
        total_cases: lineItems.reduce((s: number, li: any) => s + li.quantity, 0),
        bol_number: bolNumber,
        bol_data: bolData,
        special_instructions: body.specialInstructions || '',
        placed_by: customer.contact_name || '',
      };

      const result = await insertOrder(order);
      return NextResponse.json({
        success: true,
        order: result.data || order,
        bolData,
        message: `Order ${orderNumber} placed.`,
      });
    }
    case 'cancel-order':
      return NextResponse.json({ success: true, message: 'Order cancelled.' });
    case 'get-order-detail': {
      const orders = await getOrders(customer.id);
      const order = orders.find(o => o.id === body.orderId || o.order_number === body.orderNumber);
      return order ? NextResponse.json({ order }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
