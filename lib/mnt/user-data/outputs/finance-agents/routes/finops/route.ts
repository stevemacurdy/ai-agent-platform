import { NextRequest, NextResponse } from 'next/server';
import { getFinOpsData } from '@/lib/finops-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;

  if (user) {
    companyId = getCompanyId(req, user) || undefined;
    authenticated = true;
  }

  const view = req.nextUrl.searchParams.get('view') || 'dashboard';

  try {
    const data = await getFinOpsData(companyId as any);

    if (!authenticated && data.source === 'live') {
      const demoData = await getFinOpsData(undefined as any);
      return buildResponse(view, demoData, req);
    }

    return buildResponse(view, data, req);
  } catch (e: any) {
    console.error('FinOps API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildResponse(view: string, data: any, req: NextRequest): NextResponse {
  switch (view) {
    case 'dashboard':
      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        summary: data.summary,
        costs: data.costs,
        recommendations: data.recommendations,
      });

    case 'costs':
      return NextResponse.json({
        source: data.source,
        costs: data.costs,
        summary: data.summary,
      });

    case 'vendors': {
      const category = req.nextUrl.searchParams.get('category');
      let vendors = data.vendors;
      if (category) vendors = vendors.filter((v: any) => v.category.toLowerCase() === category.toLowerCase());
      return NextResponse.json({
        source: data.source,
        vendors,
        totalSpend: vendors.reduce((s: number, v: any) => s + v.totalSpend, 0),
      });
    }

    case 'vendor-detail': {
      const id = req.nextUrl.searchParams.get('id');
      const vendor = data.vendors.find((v: any) => v.id === id);
      if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
      return NextResponse.json({ source: data.source, vendor });
    }

    case 'forecast':
      return NextResponse.json({
        source: data.source,
        forecast: data.forecast,
        summary: data.summary,
      });

    case 'savings':
      return NextResponse.json({
        source: data.source,
        recommendations: data.recommendations,
        topSavingsOpportunity: data.summary.topSavingsOpportunity,
        vendors: data.vendors.filter((v: any) => v.savingsOpportunity > 0)
          .sort((a: any, b: any) => b.savingsOpportunity - a.savingsOpportunity),
      });

    default:
      return NextResponse.json({ error: 'Invalid view. Use: dashboard, costs, vendors, vendor-detail, forecast, savings' }, { status: 400 });
  }
}
