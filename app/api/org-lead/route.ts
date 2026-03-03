import { NextRequest, NextResponse } from 'next/server';
import { getOrgLeadData } from '@/lib/org-lead-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getOrgLeadData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, priorities: data.priorities, departments: data.departments, recommendations: data.recommendations });
      case 'okrs': return NextResponse.json({ source: data.source, okrs: data.okrs });
      case 'departments': return NextResponse.json({ source: data.source, departments: data.departments });
      case 'priorities': return NextResponse.json({ source: data.source, priorities: data.priorities });
      default: return NextResponse.json({ error: 'Use: dashboard, okrs, departments, priorities' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
