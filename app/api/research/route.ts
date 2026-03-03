import { NextRequest, NextResponse } from 'next/server';
import { getResearchData } from '@/lib/research-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getResearchData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, trends: data.trends.filter((t: any) => t.impact === 'high'), benchmarks: data.benchmarks, recommendations: data.recommendations });
      case 'trends': return NextResponse.json({ source: data.source, trends: data.trends });
      case 'tech': return NextResponse.json({ source: data.source, techScout: data.techScout });
      case 'benchmarks': return NextResponse.json({ source: data.source, benchmarks: data.benchmarks });
      default: return NextResponse.json({ error: 'Use: dashboard, trends, tech, benchmarks' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
