export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import {
  getCFOData,
  calculateHealthScore,
  generateCollectionStrategies,
  projectCashflow,
} from '@/lib/cfo-data';
import { verifyToken, getCompanyId as getCompanyIdFromAuth } from '@/lib/api-auth';

async function resolveCompanyId(req: NextRequest): Promise<{ companyId: string; authenticated: boolean }> {
  // Try auth first
  const user = await verifyToken(req);
  if (user) {
    const companyId = getCompanyIdFromAuth(req, user) || 'demo';
    return { companyId, authenticated: true };
  }

  // Unauthenticated: always demo (never expose live data)
  return { companyId: 'demo', authenticated: false };
}

// GET /api/cfo?view=dashboard|invoices|health|collections|cashflow
export async function GET(req: NextRequest) {
  try {
    const view = req.nextUrl.searchParams.get('view') || 'dashboard';
    const { companyId, authenticated } = await resolveCompanyId(req);

    // getCFOData already handles demo vs live based on companyId + integration_connections
    const data = await getCFOData(companyId);

    // Safety: if not authenticated but somehow got live data, force demo
    if (!authenticated && data.source === 'live') {
      const demoData = await getCFOData('demo');
      return buildResponse(view, demoData, req);
    }

    return buildResponse(view, data, req);
  } catch (err: any) {
    console.error('[cfo] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildResponse(view: string, data: any, req: NextRequest): NextResponse {
  switch (view) {
    case 'dashboard': {
      const health = calculateHealthScore(data);
      const cashflow = projectCashflow(data);
      const recentInvoices = [...data.invoices]
        .sort((a: any, b: any) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
        .slice(0, 5);

      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        summary: data.summary,
        healthScore: health.healthScore,
        healthGrade: health.grade,
        recommendations: health.recommendations,
        recentInvoices,
        cashflowProjection: cashflow,
      });
    }

    case 'invoices': {
      const status = req.nextUrl.searchParams.get('status') || 'all';
      let filtered = data.invoices;
      if (status !== 'all') {
        filtered = data.invoices.filter((i: any) => i.status === status);
      }
      return NextResponse.json({ source: data.source, invoices: filtered, summary: data.summary });
    }

    case 'invoice-detail': {
      const invoiceId = req.nextUrl.searchParams.get('id');
      const invoice = data.invoices.find((i: any) => i.id === invoiceId);
      if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      return NextResponse.json({ source: data.source, invoice });
    }

    case 'health': {
      const health = calculateHealthScore(data);
      return NextResponse.json({ source: data.source, ...health, accounts: data.accounts });
    }

    case 'collections': {
      const strategies = generateCollectionStrategies(data.invoices);
      const totalOverdue = strategies.reduce((sum: number, s: any) => sum + s.outstanding, 0);
      const estimatedRecovery = strategies.reduce((sum: number, s: any) => sum + s.estimatedRecovery, 0);

      return NextResponse.json({
        source: data.source,
        strategies,
        summary: {
          totalOverdue,
          overdueCount: strategies.length,
          estimatedRecovery,
          recoveryRate: totalOverdue > 0 ? Math.round((estimatedRecovery / totalOverdue) * 100) : 0,
        },
      });
    }

    case 'cashflow': {
      const projection = projectCashflow(data);
      return NextResponse.json({
        source: data.source,
        currentCash: data.summary.cashOnHand,
        projection,
        accounts: data.accounts,
      });
    }

    case 'profitloss': {
      return NextResponse.json({
        source: data.source,
        profitLoss: data.profitLoss,
        invoiceSummary: !data.profitLoss ? {
          totalInvoiced: data.summary.totalRevenue,
          totalCollected: data.summary.totalPaid,
          totalOutstanding: data.summary.totalOutstanding,
        } : undefined,
      });
    }

    default:
      return NextResponse.json({ error: 'Invalid view. Use: dashboard, invoices, health, collections, cashflow, profitloss' }, { status: 400 });
  }
}
