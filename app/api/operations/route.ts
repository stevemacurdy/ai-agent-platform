import { NextRequest, NextResponse } from 'next/server';
import { getOperationsData } from '@/lib/operations-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getOperationsData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, projects: data.projects, recommendations: data.recommendations });
      case 'projects': return NextResponse.json({ source: data.source, projects: data.projects });
      case 'crew': return NextResponse.json({ source: data.source, crew: data.crew });
      case 'capacity': return NextResponse.json({ source: data.source, capacity: data.capacity });
      default: return NextResponse.json({ error: 'Use: dashboard, projects, crew, capacity' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
