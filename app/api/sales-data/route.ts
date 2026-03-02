import { NextRequest, NextResponse } from 'next/server';
import { getSalesData, generateRecommendations } from '@/lib/sales-data';

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  const companyId = req.nextUrl.searchParams.get('company_id') || undefined;

  try {
    const data = await getSalesData(companyId);

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

      case 'pipeline': {
        return NextResponse.json({
          source: data.source,
          provider: data.provider,
          pipeline: data.pipeline,
          deals: data.deals.filter((d: any) => !d.stage?.toLowerCase().includes('closed')),
        });
      }

      case 'deals': {
        const status = req.nextUrl.searchParams.get('status');
        const stage = req.nextUrl.searchParams.get('stage');
        let filtered = data.deals;
        if (status === 'open') filtered = filtered.filter((d: any) => !d.stage?.toLowerCase().includes('closed'));
        if (status === 'won') filtered = filtered.filter((d: any) => d.stage?.toLowerCase().includes('won'));
        if (status === 'lost') filtered = filtered.filter((d: any) => d.stage?.toLowerCase().includes('lost'));
        if (stage) filtered = filtered.filter((d: any) => d.stage?.toLowerCase().replace(/\s+/g, '_') === stage.toLowerCase());
        return NextResponse.json({
          source: data.source,
          provider: data.provider,
          deals: filtered,
          summary: data.summary,
        });
      }

      case 'deal-detail': {
        const dealId = req.nextUrl.searchParams.get('id');
        const deal = data.deals.find((d: any) => d.id === dealId);
        if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        return NextResponse.json({
          source: data.source,
          deal,
          activities: data.activities.filter((a: any) => a.dealId === dealId),
        });
      }

      case 'velocity': {
        return NextResponse.json({
          source: data.source,
          provider: data.provider,
          velocity: data.velocity,
          pipeline: data.pipeline,
        });
      }

      case 'leaderboard': {
        return NextResponse.json({
          source: data.source,
          provider: data.provider,
          leaderboard: data.leaderboard,
        });
      }

      case 'forecast': {
        return NextResponse.json({
          source: data.source,
          provider: data.provider,
          forecast: data.forecast,
          weightedTotal: data.summary.weightedPipeline,
          bestCase: data.summary.pipelineValue,
        });
      }

      case 'at-risk': {
        return NextResponse.json({
          source: data.source,
          provider: data.provider,
          atRisk: data.atRisk,
          totalAtRiskValue: data.atRisk.reduce((s: number, d: any) => s + d.amount, 0),
        });
      }

      case 'contacts': {
        return NextResponse.json({
          source: data.source,
          contacts: data.contacts,
          totalContacts: data.contacts.length,
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown view. Options: dashboard, pipeline, deals, deal-detail, velocity, leaderboard, forecast, at-risk, contacts' }, { status: 400 });
    }
  } catch (e: any) {
    console.error('Sales API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
