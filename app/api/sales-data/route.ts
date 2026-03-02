import { NextRequest, NextResponse } from 'next/server';
import { getSalesData, generateRecommendations } from '@/lib/sales-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  // Resolve auth + company
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;

  if (user) {
    companyId = getCompanyId(req, user) || undefined;
    authenticated = true;
  } else {
    companyId = undefined; // getSalesData will use demo when no companyId
  }

  const view = req.nextUrl.searchParams.get('view') || 'dashboard';

  try {
    const data = await getSalesData(companyId);

    // Safety: never serve live data to unauthenticated requests
    if (!authenticated && data.source === 'live') {
      const demoData = await getSalesData(undefined);
      return buildSalesResponse(view, demoData, req);
    }

    return buildSalesResponse(view, data, req);
  } catch (e: any) {
    console.error('Sales API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildSalesResponse(view: string, data: any, req: NextRequest): NextResponse {
  switch (view) {
    case 'dashboard': {
      const recs = generateRecommendations(data);
      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        summary: data.summary,
        recommendations: recs,
        topDeals: data.deals
          .filter((d: any) => !d.stage?.toLowerCase().includes('closed'))
          .sort((a: any, b: any) => b.amount - a.amount)
          .slice(0, 5),
        recentWins: data.deals
          .filter((d: any) => d.stage?.toLowerCase().includes('won'))
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 3),
      });
    }

    case 'pipeline':
      return NextResponse.json({
        source: data.source, provider: data.provider,
        pipeline: data.pipeline,
        deals: data.deals.filter((d: any) => !d.stage?.toLowerCase().includes('closed')),
      });

    case 'deals': {
      const status = req.nextUrl.searchParams.get('status');
      const stage = req.nextUrl.searchParams.get('stage');
      let filtered = data.deals;
      if (status === 'open') filtered = filtered.filter((d: any) => !d.stage?.toLowerCase().includes('closed'));
      if (status === 'won') filtered = filtered.filter((d: any) => d.stage?.toLowerCase().includes('won'));
      if (status === 'lost') filtered = filtered.filter((d: any) => d.stage?.toLowerCase().includes('lost'));
      if (stage) filtered = filtered.filter((d: any) => d.stage?.toLowerCase().replace(/\s+/g, '_') === stage.toLowerCase());
      return NextResponse.json({ source: data.source, provider: data.provider, deals: filtered, summary: data.summary });
    }

    case 'deal-detail': {
      const dealId = req.nextUrl.searchParams.get('id');
      const deal = data.deals.find((d: any) => d.id === dealId);
      if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      return NextResponse.json({ source: data.source, deal, activities: data.activities.filter((a: any) => a.dealId === dealId) });
    }

    case 'velocity':
      return NextResponse.json({ source: data.source, provider: data.provider, velocity: data.velocity, pipeline: data.pipeline });

    case 'leaderboard':
      return NextResponse.json({ source: data.source, provider: data.provider, leaderboard: data.leaderboard });

    case 'forecast':
      return NextResponse.json({ source: data.source, provider: data.provider, forecast: data.forecast, weightedTotal: data.summary.weightedPipeline, bestCase: data.summary.pipelineValue });

    case 'at-risk':
      return NextResponse.json({ source: data.source, provider: data.provider, atRisk: data.atRisk, totalAtRiskValue: data.atRisk.reduce((s: number, d: any) => s + d.amount, 0) });

    case 'contacts':
      return NextResponse.json({ source: data.source, contacts: data.contacts, totalContacts: data.contacts.length });

    default:
      return NextResponse.json({ error: 'Unknown view' }, { status: 400 });
  }
}
