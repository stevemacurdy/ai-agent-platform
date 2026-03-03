import { NextRequest, NextResponse } from 'next/server';
import { getSTRData } from '@/lib/str-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getSTRData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, properties: data.properties, maintenance: data.maintenance.filter((m: any) => m.status !== 'completed'), recommendations: data.recommendations });
      case 'properties': return NextResponse.json({ source: data.source, properties: data.properties });
      case 'revenue': return NextResponse.json({ source: data.source, revenue: data.revenue });
      case 'reviews': return NextResponse.json({ source: data.source, reviews: data.reviews });
      case 'maintenance': return NextResponse.json({ source: data.source, maintenance: data.maintenance });
      default: return NextResponse.json({ error: 'Use: dashboard, properties, revenue, reviews, maintenance' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
