export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DEMO_INVENTORY } from '@/lib/3pl-portal-data';

export async function GET() {
  return NextResponse.json({ inventory: DEMO_INVENTORY, total: DEMO_INVENTORY.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'search': {
      let results = [...DEMO_INVENTORY];
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
      if (body.status) results = results.filter(i => i.status === body.status);
      return NextResponse.json({ inventory: results, total: results.length });
    }

    case 'export': {
      const csv = ['SKU,Description,Lot,Manufacturer,Type,Qty On Hand,Qty Available,Unit,Weight,Zone,Bin,Status'];
      DEMO_INVENTORY.forEach(i => {
        csv.push(`${i.sku},"${i.description}",${i.lot_number},"${i.manufacturer}",${i.product_type},${i.quantity_on_hand},${i.quantity_available},${i.unit_of_measure},${i.total_weight},${i.warehouse_zone},${i.bin_location},${i.status}`);
      });
      return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="inventory-export.csv"' } });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
