import { NextRequest, NextResponse } from 'next/server';
import { getFinOpsData } from '@/lib/finops-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;
  if (user) { companyId = getCompanyId(req, user) || undefined; authenticated = true; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getFinOpsData(companyId as any);
    if (!authenticated && data.source === 'live') {
      const demoData = await getFinOpsData(undefined as any);
      return buildResponse(view, demoData, req);
    }
    return buildResponse(view, data, req);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildResponse(view: string, data: any, req: NextRequest): NextResponse {
  switch (view) {
    case 'dashboard': return NextResponse.json({ source: data.source, provider: data.provider, summary: data.summary, costs: data.costs, recommendations: data.recommendations });
    case 'costs': return NextResponse.json({ source: data.source, costs: data.costs, summary: data.summary });
    case 'vendors': return NextResponse.json({ source: data.source, vendors: data.vendors });
    case 'forecast': return NextResponse.json({ source: data.source, forecast: data.forecast, summary: data.summary });
    case 'savings': return NextResponse.json({ source: data.source, recommendations: data.recommendations, vendors: data.vendors.filter((v: any) => v.savingsOpportunity > 0) });
    default: return NextResponse.json({ error: 'Invalid view. Use: dashboard, costs, vendors, forecast, savings' }, { status: 400 });
  }
}
