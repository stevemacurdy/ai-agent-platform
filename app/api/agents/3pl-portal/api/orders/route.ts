export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DEMO_CUSTOMER, DEMO_INVENTORY, generateOrderNumber, generatePONumber, generateBOLNumber } from '@/lib/3pl-portal-data';
import { generateBOL } from '@/lib/bol-generator';

export async function POST(request: NextRequest) {
  // External API endpoint for customer software integration
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required. Pass X-API-Key header.' }, { status: 401 });
  }

  // In production, validate API key against portal_3pl_customers.api_key
  const body = await request.json();
  const orderNumber = generateOrderNumber();
  const poNumber = body.customerPO || generatePONumber();
  const bolNumber = generateBOLNumber();
  const date = new Date().toISOString().split('T')[0];

  const lineItems = (body.items || []).map((item: any) => {
    const inv = DEMO_INVENTORY.find(i => i.sku === item.sku);
    return {
      inventory_id: inv?.id || '',
      sku: item.sku,
      description: inv?.description || item.sku,
      unit_type: item.unitType || 'case',
      quantity: item.quantity || 0,
      weight_per_unit: inv?.weight_per_unit || 0,
      total_weight: (inv?.weight_per_unit || 0) * (item.quantity || 0),
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

  return NextResponse.json({
    success: true,
    orderNumber,
    poNumber,
    bolNumber,
    bolData,
    status: 'pending',
    message: `Order ${orderNumber} created successfully via API.`,
  });
}
