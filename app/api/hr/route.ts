import { NextRequest, NextResponse } from 'next/server';
import { getHRData } from '@/lib/hr-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  if (user) { companyId = getCompanyId(req, user) || undefined; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getHRData(companyId as any);
    switch (view) {
      case 'dashboard': return NextResponse.json({ source: data.source, summary: data.summary, hiring: data.hiring, recommendations: data.recommendations });
      case 'employees': return NextResponse.json({ source: data.source, employees: data.employees });
      case 'hiring': return NextResponse.json({ source: data.source, hiring: data.hiring });
      case 'certifications': return NextResponse.json({ source: data.source, certifications: data.employees.flatMap((e: any) => e.certifications.map((c: any) => ({ employee: e.name, ...c }))) });
      default: return NextResponse.json({ error: 'Use: dashboard, employees, hiring, certifications' }, { status: 400 });
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
