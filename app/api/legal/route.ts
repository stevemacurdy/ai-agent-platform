import { NextRequest, NextResponse } from 'next/server';
import { getLegalData } from '@/lib/legal-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getLegalData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, contracts: data.contracts.filter((c: any) => c.daysUntilExpiry <= 60 || c.status === 'pending-review'), tasks: data.tasks.filter((t: any) => t.status !== 'completed'), recommendations: data.recommendations });
      case 'contracts': return NextResponse.json({ source: data.source, contracts: data.contracts });
      case 'tasks': return NextResponse.json({ source: data.source, tasks: data.tasks });
      default: return NextResponse.json({ error: 'Use: dashboard, contracts, tasks' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
