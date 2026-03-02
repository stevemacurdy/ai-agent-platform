// ============================================================================
// /api/cfo/route.ts — PATCHED: Auth required for live data
// ============================================================================
// SECURITY FIX: Added verifyToken check. Demo data remains public.
// When integrations go live, this prevents unauthorized access to
// real financial data (QuickBooks, Xero, etc.)
// ============================================================================

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCompanyId } from '@/lib/api-auth';
import {
  getCFOData,
  calculateHealthScore,
  generateCollectionStrategies,
  projectCashflow,
} from '@/lib/cfo-data';

export async function GET(req: NextRequest) {
  try {
    const view = req.nextUrl.searchParams.get('view') || 'dashboard';
    const user = await verifyToken(req);

    // Determine company context
    let companyId: string;
    if (user) {
      companyId = getCompanyId(req, user) || 'demo';
    } else {
      // No auth → demo only. Never expose real data.
      companyId = 'demo';
    }

    const data = await getCFOData(companyId);

    // If live data was requested but user isn't authenticated, block it
    if (data.source !== 'demo' && !user) {
      return NextResponse.json(
        { error: 'Authentication required for live financial data' },
        { status: 401 }
      );
    }

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
          invoiceSummary: !data.profitLoss ? {
            totalInvoiced: data.summary.totalRevenue,
            totalCollected: data.summary.totalPaid,
            totalOutstanding: data.summary.totalOutstanding,
          } : undefined,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid view. Use: dashboard, invoices, health, collections, cashflow, profitloss' },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error('[cfo] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
