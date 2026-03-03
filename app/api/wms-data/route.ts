import { NextRequest, NextResponse } from 'next/server';
import { getWMSData } from '@/lib/wms-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getWMSData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, zones: data.zones, alerts: data.alerts.filter((a: any) => !a.acknowledged), recommendations: data.recommendations });
      case 'zones': return NextResponse.json({ source: data.source, zones: data.zones });
      case 'orders': return NextResponse.json({ source: data.source, orders: data.orders });
      case 'labor': return NextResponse.json({ source: data.source, labor: data.labor });
      case 'alerts': return NextResponse.json({ source: data.source, alerts: data.alerts });
      default: return NextResponse.json({ error: 'Use: dashboard, zones, orders, labor, alerts' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
