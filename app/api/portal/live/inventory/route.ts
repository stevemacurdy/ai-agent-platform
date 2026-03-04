export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCustomer, getInventory } from '@/lib/3pl-portal-supabase';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || 'MWS-001';
  const customer = await getCustomer(code);
  const inventory = await getInventory(customer.id);
  return NextResponse.json({ inventory, total: inventory.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, customerCode } = body;
  const customer = await getCustomer(customerCode || 'MWS-001');
  const allInventory = await getInventory(customer.id);

  switch (action) {
    case 'search': {
      let results = [...allInventory];
      if (body.query) {
        const q = body.query.toLowerCase();
        results = results.filter(i =>
          i.sku.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.lot_number && i.lot_number.toLowerCase().includes(q)) ||
          (i.manufacturer && i.manufacturer.toLowerCase().includes(q))
        );
      }
      if (body.product_type) results = results.filter(i => i.product_type === body.product_type);
      if (body.manufacturer) results = results.filter(i => i.manufacturer === body.manufacturer);
      return NextResponse.json({ inventory: results, total: results.length });
    }
    case 'export': {
      const csv = ['SKU,Description,Lot,Manufacturer,Type,Qty On Hand,Qty Available,Unit,Weight,Zone,Bin,Status'];
      allInventory.forEach(i => {
        csv.push(`${i.sku},"${i.description}",${i.lot_number},"${i.manufacturer}",${i.product_type},${i.quantity_on_hand},${i.quantity_available},${i.unit_of_measure},${i.total_weight},${i.warehouse_zone},${i.bin_location},${i.status}`);
      });
      return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="inventory-export.csv"' } });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
