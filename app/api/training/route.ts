import { NextRequest, NextResponse } from 'next/server';
import { getTrainingData } from '@/lib/training-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getTrainingData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, skillGaps: data.skillGaps.filter((g: any) => g.priority === 'high'), onboarding: data.onboarding, recommendations: data.recommendations });
      case 'programs': return NextResponse.json({ source: data.source, programs: data.programs });
      case 'skill-gaps': return NextResponse.json({ source: data.source, skillGaps: data.skillGaps });
      case 'onboarding': return NextResponse.json({ source: data.source, onboarding: data.onboarding });
      default: return NextResponse.json({ error: 'Use: dashboard, programs, skill-gaps, onboarding' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
