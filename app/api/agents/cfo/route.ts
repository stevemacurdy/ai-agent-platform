export const dynamic = 'force-dynamic';
// ============================================================================
// CFO AGENT API - Real Odoo Data
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';
import { analyzeCashFlow, generateCollectionStrategy } from '@/lib/openai';
import { trackUsage } from '@/lib/usage-tracker';

export async function GET(request: NextRequest) {
  trackUsage(request, 'cfo');
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'dashboard';

  try {
    const odoo = getOdooClient();

    switch (action) {
      case 'dashboard': {
        const dashboard = await odoo.getDashboard();
        return NextResponse.json(dashboard);
      }

      case 'invoices': {
        const status = searchParams.get('status') as 'all' | 'unpaid' | 'overdue' || 'unpaid';
        const invoices = await odoo.getInvoices(status);
        return NextResponse.json({ invoices });
      }

      case 'bills': {
        const status = searchParams.get('status') as 'all' | 'unpaid' | 'overdue' || 'unpaid';
        const bills = await odoo.getBills(status);
        return NextResponse.json({ bills });
      }

      case 'aging': {
        const aging = await odoo.getAgingReport();
        return NextResponse.json(aging);
      }

      case 'customers': {
        const customers = await odoo.getCustomers();
        return NextResponse.json({ customers });
      }

      case 'vendors': {
        const vendors = await odoo.getVendors();
        return NextResponse.json({ vendors });
      }

      case 'payments': {
        const payments = await odoo.getRecentPayments();
        return NextResponse.json({ payments });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('CFO API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  trackUsage(request, 'cfo', 'chat');
  const body = await request.json();
  const { action } = body;

  try {
    const odoo = getOdooClient();

    switch (action) {
      case 'analyze': {
        const dashboard = await odoo.getDashboard();
        const analysis = await analyzeCashFlow({
          ar: dashboard.accountsReceivable.total,
          ap: dashboard.accountsPayable.total,
          overdueAR: dashboard.accountsReceivable.overdue,
          overdueAP: dashboard.accountsPayable.overdue,
        });
        return NextResponse.json({ analysis });
      }

      case 'collection-strategy': {
        const invoices = await odoo.getInvoices('overdue');
        const strategy = await generateCollectionStrategy(invoices);
        return NextResponse.json({ strategy, overdueCount: invoices.length });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('CFO API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
