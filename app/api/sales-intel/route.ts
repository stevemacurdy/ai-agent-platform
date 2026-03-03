import { NextRequest, NextResponse } from 'next/server';
import { getSalesIntelData } from '@/lib/sales-intel-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;
  if (user) { companyId = getCompanyId(req, user) || undefined; authenticated = true; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getSalesIntelData(companyId as any);
    if (!authenticated && data.source === 'live') { return buildResponse(view, await getSalesIntelData(undefined as any)); }
    return buildResponse(view, data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
function buildResponse(view: string, data: any): NextResponse {
  switch (view) {
    case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, leads: data.leads.filter((l: any) => l.score >= 70), signals: data.signals.filter((s: any) => s.relevance === 'high'), recommendations: data.recommendations });
    case 'leads': return NextResponse.json({ source: data.source, leads: data.leads });
    case 'competitors': return NextResponse.json({ source: data.source, competitors: data.competitors });
    case 'signals': return NextResponse.json({ source: data.source, signals: data.signals });
    default: return NextResponse.json({ error: 'Use: dashboard, leads, competitors, signals' }, { status: 400 });
  }
}
