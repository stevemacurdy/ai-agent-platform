import { NextRequest, NextResponse } from 'next/server';
import { getSupplyChainData } from '@/lib/supply-chain-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getSupplyChainData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, inventory: data.inventory.filter((i: any) => i.status !== 'healthy'), purchaseOrders: data.purchaseOrders, recommendations: data.recommendations });
      case 'inventory': return NextResponse.json({ source: data.source, inventory: data.inventory });
      case 'suppliers': return NextResponse.json({ source: data.source, suppliers: data.suppliers });
      case 'forecast': return NextResponse.json({ source: data.source, forecast: data.forecast });
      case 'orders': return NextResponse.json({ source: data.source, purchaseOrders: data.purchaseOrders });
      default: return NextResponse.json({ error: 'Use: dashboard, inventory, suppliers, forecast, orders' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
