import { NextRequest, NextResponse } from 'next/server';
import { getSalesCoachData } from '@/lib/sales-coach-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;
  if (user) { companyId = getCompanyId(req, user) || undefined; authenticated = true; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getSalesCoachData(companyId as any);
    if (!authenticated && data.source === 'live') { return buildResponse(view, await getSalesCoachData(undefined as any), req); }
    return buildResponse(view, data, req);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
function buildResponse(view: string, data: any, req: NextRequest): NextResponse {
  switch (view) {
    case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, deals: data.deals.filter((d: any) => d.healthScore < 70), pipeline: data.pipeline, recommendations: data.recommendations });
    case 'deals': return NextResponse.json({ source: data.source, deals: data.deals });
    case 'reps': return NextResponse.json({ source: data.source, reps: data.reps });
    case 'pipeline': return NextResponse.json({ source: data.source, pipeline: data.pipeline });
    default: return NextResponse.json({ error: 'Use: dashboard, deals, reps, pipeline' }, { status: 400 });
  }
}
