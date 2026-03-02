import { NextRequest, NextResponse } from 'next/server';
import { getWarehouseData } from '@/lib/warehouse-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  // Resolve auth + company
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;

  if (user) {
    companyId = getCompanyId(req, user) || undefined;
    authenticated = true;
  } else {
    companyId = undefined; // getWarehouseData will use demo when no companyId
  }

  const view = req.nextUrl.searchParams.get('view') || 'dashboard';

  try {
    const data = await getWarehouseData(companyId as any);

    // Safety: never serve live data to unauthenticated requests
    if (!authenticated && data.source === 'live') {
      const demoData = await getWarehouseData(undefined as any);
      return buildWarehouseResponse(view, demoData, req);
    }

    return buildWarehouseResponse(view, data, req);
  } catch (e: any) {
    console.error('Warehouse API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildWarehouseResponse(view: string, data: any, req: NextRequest): NextResponse {
  switch (view) {
    case 'dashboard': {
      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        summary: data.summary,
        alerts: data.alerts?.slice(0, 5) || [],
        recentOrders: data.orders
          ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5) || [],
        inventoryHealth: data.inventoryHealth,
      });
    }

    case 'inventory':
      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        inventory: data.inventory,
        summary: data.summary,
      });

    case 'orders': {
      const status = req.nextUrl.searchParams.get('status');
      let filtered = data.orders || [];
      if (status) filtered = filtered.filter((o: any) => o.status?.toLowerCase() === status.toLowerCase());
      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        orders: filtered,
        summary: data.summary,
      });
    }

    case 'order-detail': {
      const orderId = req.nextUrl.searchParams.get('id');
      const order = (data.orders || []).find((o: any) => o.id === orderId);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return NextResponse.json({ source: data.source, order });
    }

    case 'receiving':
      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        receiving: data.receiving || [],
        summary: data.summary,
      });

    case 'shipping':
      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        shipping: data.shipping || [],
        summary: data.summary,
      });

    case 'locations':
      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        locations: data.locations || [],
      });

    case 'alerts':
      return NextResponse.json({
        source: data.source,
        alerts: data.alerts || [],
        totalAlerts: (data.alerts || []).length,
        critical: (data.alerts || []).filter((a: any) => a.severity === 'critical').length,
      });

    default:
      return NextResponse.json({ error: 'Invalid view. Use: dashboard, inventory, orders, order-detail, receiving, shipping, locations, alerts' }, { status: 400 });
  }
}
