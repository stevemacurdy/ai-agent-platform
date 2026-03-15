export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  DEMO_CUSTOMER, DEMO_INVENTORY, DEMO_ORDERS, DEMO_INVOICES,
  DEMO_PAYMENTS, DEMO_ACTIVITY, getDemoKPIs,
} from '@/lib/3pl-portal-data';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.get('view') || 'customers';
  const code = request.nextUrl.searchParams.get('code');
  const sb = supabase();

  try {
    switch (view) {
      case 'customers': {
        const { data: customers, error } = await sb
          .from('portal_3pl_customers').select('*').order('customer_name');

        if (error || !customers || customers.length === 0) {
          return NextResponse.json({
            source: 'demo',
            customers: [{
              ...DEMO_CUSTOMER,
              inventory_count: DEMO_INVENTORY.length,
              total_units: DEMO_INVENTORY.reduce((s, i) => s + i.quantity_on_hand, 0),
              open_orders: DEMO_ORDERS.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
              current_balance: DEMO_INVOICES[0]?.balance_due || 0,
            }],
            summary: {
              total: 1, active: 1, onboarding: 0, suspended: 0,
              totalPallets: DEMO_INVENTORY.reduce((s, i) => s + (i.pallet_count || 0), 0),
              monthlyRevenue: DEMO_CUSTOMER.monthly_minimum,
            },
          });
        }

        const enriched = await Promise.all(customers.map(async (c: any) => {
          const [inv, ord, invoices] = await Promise.all([
            sb.from('portal_3pl_inventory').select('quantity_on_hand, pallet_count', { count: 'exact' }).eq('customer_id', c.id),
            sb.from('portal_3pl_orders').select('id', { count: 'exact' }).eq('customer_id', c.id).in('status', ['pending', 'processing', 'picking', 'packed']),
            sb.from('portal_3pl_invoices').select('balance_due, status').eq('customer_id', c.id).in('status', ['posted', 'overdue']),
          ]);
          const totalUnits = (inv.data || []).reduce((s: number, i: any) => s + (i.quantity_on_hand || 0), 0);
          const totalPallets = (inv.data || []).reduce((s: number, i: any) => s + (i.pallet_count || 0), 0);
          const balance = (invoices.data || []).reduce((s: number, i: any) => s + (parseFloat(i.balance_due) || 0), 0);
          const hasOverdue = (invoices.data || []).some((i: any) => i.status === 'overdue');
          return { ...c, inventory_count: inv.count || 0, total_units: totalUnits, total_pallets: totalPallets, open_orders: ord.count || 0, current_balance: balance, has_overdue: hasOverdue };
        }));

        const active = enriched.filter(c => c.status === 'active').length;
        const onboarding = enriched.filter(c => c.status === 'onboarding').length;
        const suspended = enriched.filter(c => c.status === 'suspended').length;
        const totalPallets = enriched.reduce((s, c) => s + (c.total_pallets || 0), 0);
        const monthlyRevenue = enriched.filter(c => c.status === 'active').reduce((s, c) => s + (parseFloat(c.monthly_minimum) || 0), 0);

        return NextResponse.json({
          source: 'live',
          customers: enriched,
          summary: { total: enriched.length, active, onboarding, suspended, totalPallets, monthlyRevenue },
        });
      }

      case 'detail': {
        if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });
        const { data: customer } = await sb.from('portal_3pl_customers').select('*').eq('customer_code', code).single();
        if (!customer) {
          if (code === 'MWS-001') {
            return NextResponse.json({ source: 'demo', customer: DEMO_CUSTOMER, inventory: DEMO_INVENTORY, orders: DEMO_ORDERS, invoices: DEMO_INVOICES, payments: DEMO_PAYMENTS });
          }
          return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }
        const [inv, ord, invoices, payments] = await Promise.all([
          sb.from('portal_3pl_inventory').select('*').eq('customer_id', customer.id).order('sku'),
          sb.from('portal_3pl_orders').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(20),
          sb.from('portal_3pl_invoices').select('*').eq('customer_id', customer.id).order('period_start', { ascending: false }).limit(12),
          sb.from('portal_3pl_payments').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(20),
        ]);
        return NextResponse.json({ source: 'live', customer, inventory: inv.data || [], orders: ord.data || [], invoices: invoices.data || [], payments: payments.data || [] });
      }

      default:
        return NextResponse.json({ error: 'Unknown view. Use: customers, detail' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sb = supabase();
  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case 'create-customer': {
        const { customerName, customerCode, contactName, contactEmail, contactPhone, contractStart, contractEnd,
          monthlyMinimum, storageRate, handlingIn, handlingOut, paymentTerms, companyId, notes } = body;
        if (!customerName || !customerCode) return NextResponse.json({ error: 'customerName and customerCode required' }, { status: 400 });
        const { data, error } = await sb.from('portal_3pl_customers').insert({
          company_id: companyId || null, customer_name: customerName, customer_code: customerCode,
          contact_name: contactName || null, contact_email: contactEmail || null, contact_phone: contactPhone || null,
          contract_start: contractStart || null, contract_end: contractEnd || null,
          monthly_minimum: monthlyMinimum || 0, storage_rate_pallet: storageRate || 0,
          handling_rate_in: handlingIn || 0, handling_rate_out: handlingOut || 0,
          payment_terms: paymentTerms || 'Net 30', status: 'onboarding', notes: notes || null,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, customer: data });
      }

      case 'update-customer': {
        const { customerId, updates } = body;
        if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 });
        const { error } = await sb.from('portal_3pl_customers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', customerId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'update-status': {
        const { customerId, status } = body;
        if (!customerId || !status) return NextResponse.json({ error: 'customerId and status required' }, { status: 400 });
        const { error } = await sb.from('portal_3pl_customers').update({ status, updated_at: new Date().toISOString() }).eq('id', customerId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Status updated to ' + status });
      }

      case 'toggle-autopay': {
        const { customerId, enabled } = body;
        const { error } = await sb.from('portal_3pl_customers').update({ auto_pay_enabled: enabled, updated_at: new Date().toISOString() }).eq('id', customerId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, auto_pay_enabled: enabled });
      }

      default:
        return NextResponse.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
