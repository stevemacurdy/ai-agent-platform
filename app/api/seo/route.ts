import { NextRequest, NextResponse } from 'next/server';
import { getSEOData } from '@/lib/seo-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;
  if (user) { companyId = getCompanyId(req, user) || undefined; authenticated = true; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getSEOData(companyId as any);
    if (!authenticated && data.source === 'live') { return buildResponse(view, await getSEOData(undefined as any)); }
    return buildResponse(view, data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
function buildResponse(view: string, data: any): NextResponse {
  switch (view) {
    case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, keywords: data.keywords.filter((k: any) => k.position <= 10), contentGaps: data.contentGaps.filter((g: any) => g.opportunity === 'high'), recommendations: data.recommendations });
    case 'keywords': return NextResponse.json({ source: data.source, keywords: data.keywords });
    case 'technical': return NextResponse.json({ source: data.source, technical: data.technical });
    case 'backlinks': return NextResponse.json({ source: data.source, backlinks: data.backlinks });
    case 'content-gaps': return NextResponse.json({ source: data.source, contentGaps: data.contentGaps });
    default: return NextResponse.json({ error: 'Use: dashboard, keywords, technical, backlinks, content-gaps' }, { status: 400 });
  }
}
