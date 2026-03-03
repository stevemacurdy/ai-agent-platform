import { NextRequest, NextResponse } from 'next/server';
import { getSupportData } from '@/lib/support-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getSupportData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, tickets: data.tickets.filter((t: any) => t.status !== 'resolved' && t.status !== 'closed'), sla: data.sla, recommendations: data.recommendations });
      case 'tickets': return NextResponse.json({ source: data.source, tickets: data.tickets });
      case 'sla': return NextResponse.json({ source: data.source, sla: data.sla });
      default: return NextResponse.json({ error: 'Use: dashboard, tickets, sla' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
