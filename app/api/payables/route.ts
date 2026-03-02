import { NextRequest, NextResponse } from 'next/server';
import { getPayablesData } from '@/lib/payables-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;
  if (user) { companyId = getCompanyId(req, user) || undefined; authenticated = true; }
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  try {
    const data = await getPayablesData(companyId as any);
    if (!authenticated && data.source === 'live') {
      const demoData = await getPayablesData(undefined as any);
      return buildResponse(view, demoData, req);
    }
    return buildResponse(view, data, req);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildResponse(view: string, data: any, req: NextRequest): NextResponse {
  switch (view) {
    case 'dashboard': return NextResponse.json({ source: data.source, provider: data.provider, summary: data.summary, bills: data.bills.filter((b: any) => b.status !== 'paid').slice(0, 5), schedule: data.schedule, recommendations: data.recommendations });
    case 'bills': return NextResponse.json({ source: data.source, bills: data.bills, summary: data.summary });
    case 'schedule': return NextResponse.json({ source: data.source, schedule: data.schedule, cashOnHand: data.summary.cashOnHand });
    case 'discounts': return NextResponse.json({ source: data.source, discounts: data.bills.filter((b: any) => b.hasEarlyDiscount), potentialSavings: data.summary.potentialSavings });
    case 'overdue': return NextResponse.json({ source: data.source, overdue: data.bills.filter((b: any) => b.status === 'overdue'), totalOverdue: data.summary.totalOverdue });
    default: return NextResponse.json({ error: 'Invalid view. Use: dashboard, bills, schedule, discounts, overdue' }, { status: 400 });
  }
}
