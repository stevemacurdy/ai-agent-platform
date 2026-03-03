import { NextRequest, NextResponse } from 'next/server';
import { getComplianceData } from '@/lib/compliance-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getComplianceData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, items: data.items.filter((i: any) => i.status !== 'compliant'), safety: data.safety, recommendations: data.recommendations });
      case 'items': return NextResponse.json({ source: data.source, items: data.items });
      case 'safety': return NextResponse.json({ source: data.source, safety: data.safety });
      default: return NextResponse.json({ error: 'Use: dashboard, items, safety' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
