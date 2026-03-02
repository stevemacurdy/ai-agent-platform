export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import {
  getCFOData,
  calculateHealthScore,
  generateCollectionStrategies,
  projectCashflow,
} from '@/lib/cfo-data';

// For now, use a default company ID for demo. In production,
// this comes from the authenticated user's session.
async function getCompanyId(req: NextRequest): Promise<string> {
  // Check header first (from authenticated frontend)
  const companyId = req.headers.get('x-company-id');
  if (companyId) return companyId;

  // Fallback: check query param
  const paramId = req.nextUrl.searchParams.get('company_id');
  if (paramId) return paramId;

  // Demo mode
  return 'demo';
}

// GET /api/cfo?view=dashboard|invoices|health|collections|cashflow
export async function GET(req: NextRequest) {
  try {
    const view = req.nextUrl.searchParams.get('view') || 'dashboard';
    const companyId = await getCompanyId(req);
    const data = await getCFOData(companyId);

    switch (view) {
      case 'dashboard': {
        const health = calculateHealthScore(data);
        const cashflow = projectCashflow(data);
        const recentInvoices = [...data.invoices]
          .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
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
          filtered = data.invoices.filter(i => i.status === status);
        }
        return NextResponse.json({
          source: data.source,
          invoices: filtered,
          summary: data.summary,
        });
      }

      case 'invoice-detail': {
        const invoiceId = req.nextUrl.searchParams.get('id');
        const invoice = data.invoices.find(i => i.id === invoiceId);
        if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        return NextResponse.json({ source: data.source, invoice });
      }

      case 'health': {
        const health = calculateHealthScore(data);
        return NextResponse.json({
          source: data.source,
          ...health,
          accounts: data.accounts,
        });
      }

      case 'collections': {
        const strategies = generateCollectionStrategies(data.invoices);
        const totalOverdue = strategies.reduce((sum, s) => sum + s.outstanding, 0);
        const estimatedRecovery = strategies.reduce((sum, s) => sum + s.estimatedRecovery, 0);

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
          // If no live P&L, generate summary from invoices
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
  } catch (err: any) {
    console.error('[cfo] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
