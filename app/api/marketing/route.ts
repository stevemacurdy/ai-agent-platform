import { NextRequest, NextResponse } from 'next/server';
import { getMarketingData } from '@/lib/marketing-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;
  if (user) { companyId = getCompanyId(req, user) || undefined; authenticated = true; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getMarketingData(companyId as any);
    if (!authenticated && data.source === 'live') { return buildResponse(view, await getMarketingData(undefined as any)); }
    return buildResponse(view, data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
function buildResponse(view: string, data: any): NextResponse {
  switch (view) {
    case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, campaigns: data.campaigns.filter((c: any) => c.status === 'active'), channels: data.channels, recommendations: data.recommendations });
    case 'campaigns': return NextResponse.json({ source: data.source, campaigns: data.campaigns });
    case 'content': return NextResponse.json({ source: data.source, content: data.content });
    case 'channels': return NextResponse.json({ source: data.source, channels: data.channels });
    default: return NextResponse.json({ error: 'Use: dashboard, campaigns, content, channels' }, { status: 400 });
  }
}
