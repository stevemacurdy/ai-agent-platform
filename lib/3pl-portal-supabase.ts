// ============================================================================
// 3PL Portal — Supabase Data Layer (server-side, falls back to demo data)
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type {
  Portal3PLCustomer, InventoryItem, Order, Invoice, Payment, ReceivingRecord, ActivityEvent,
} from './3pl-portal-data';
import {
  DEMO_CUSTOMER, DEMO_INVENTORY, DEMO_ORDERS, DEMO_INVOICES,
  DEMO_PAYMENTS, DEMO_RECEIVING, DEMO_ACTIVITY, getDemoKPIs,
} from './3pl-portal-data';

// --- Supabase Admin (service role, bypasses RLS) ----------------------------

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// --- Customer ----------------------------------------------------------------

export async function getCustomer(customerCode: string): Promise<Portal3PLCustomer> {
  const sb = getAdmin();
  if (sb) {
    const { data } = await sb
      .from('portal_3pl_customers')
      .select('*')
      .eq('customer_code', customerCode)
      .single();
    if (data) return data as Portal3PLCustomer;
  }
  return DEMO_CUSTOMER;
}

// --- Inventory ---------------------------------------------------------------

export async function getInventory(customerId: string): Promise<InventoryItem[]> {
  const sb = getAdmin();
  if (sb) {
    const { data } = await sb
      .from('portal_3pl_inventory')
      .select('*')
      .eq('customer_id', customerId)
      .order('sku', { ascending: true });
    if (data && data.length > 0) return data as InventoryItem[];
  }
  return DEMO_INVENTORY;
}

// --- Orders ------------------------------------------------------------------

export async function getOrders(customerId: string): Promise<Order[]> {
  const sb = getAdmin();
  if (sb) {
    const { data } = await sb
      .from('portal_3pl_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (data && data.length > 0) return data as Order[];
  }
  return DEMO_ORDERS;
}

// --- Invoices ----------------------------------------------------------------

export async function getInvoices(customerId: string): Promise<Invoice[]> {
  const sb = getAdmin();
  if (sb) {
    const { data } = await sb
      .from('portal_3pl_invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('period_start', { ascending: false });
    if (data && data.length > 0) return data as Invoice[];
  }
  return DEMO_INVOICES;
}

// --- Payments ----------------------------------------------------------------

export async function getPayments(customerId: string): Promise<Payment[]> {
  const sb = getAdmin();
  if (sb) {
    const { data } = await sb
      .from('portal_3pl_payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (data && data.length > 0) return data as Payment[];
  }
  return DEMO_PAYMENTS;
}

// --- Receiving ---------------------------------------------------------------

export async function getReceiving(customerId: string): Promise<ReceivingRecord[]> {
  // Future: query receiving_log table. For now, demo fallback.
  return DEMO_RECEIVING;
}

// --- Activity ----------------------------------------------------------------

export async function getActivity(customerId: string): Promise<ActivityEvent[]> {
  // Future: query activity/events table. For now, demo fallback.
  return DEMO_ACTIVITY;
}

// --- Dashboard Aggregation ---------------------------------------------------

export async function getDashboardData(customerCode: string) {
  const customer = await getCustomer(customerCode);
  const customerId = customer.id;
  const [inventory, orders, invoices, payments, activity] = await Promise.all([
    getInventory(customerId),
    getOrders(customerId),
    getInvoices(customerId),
    getPayments(customerId),
    getActivity(customerId),
  ]);

  const openOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const currentInvoice = invoices.find(i => i.status === 'posted' || i.status === 'overdue');
  const totalUnits = inventory.reduce((s, i) => s + i.quantity_on_hand, 0);
  const totalSKUs = inventory.length;

  const recentPayments = payments.slice(0, 6);
  const lateCount = recentPayments.filter(p => p.timeliness !== 'on-time').length;
  const paymentHealth = lateCount === 0 ? 'good' : lateCount <= 2 ? 'fair' : 'poor';
  const paymentStatus = paymentHealth === 'good' ? 'On Time' : paymentHealth === 'fair' ? '15 Days Late' : '30+ Days Late';

  return {
    customer,
    inventory,
    orders,
    invoices,
    payments,
    activity,
    kpis: {
      currentBalance: currentInvoice?.balance_due ?? 0,
      balanceStatus: (currentInvoice?.status === 'overdue' ? 'overdue' : 'current') as string,
      dueIn: currentInvoice ? Math.max(0, Math.ceil((new Date(currentInvoice.due_date).getTime() - Date.now()) / 86400000)) : 0,
      totalUnits,
      totalSKUs,
      openOrderCount: openOrders.length,
      paymentHealth,
      paymentStatus,
    },
  };
}

// --- Write Operations --------------------------------------------------------

export async function insertOrder(order: Record<string, any>) {
  const sb = getAdmin();
  if (!sb) return { success: false, error: 'Supabase not configured', data: null };
  const { data, error } = await sb.from('portal_3pl_orders').insert(order).select().single();
  if (error) return { success: false, error: error.message, data: null };
  return { success: true, error: null, data };
}

export async function insertPayment(payment: Record<string, any>) {
  const sb = getAdmin();
  if (!sb) return { success: false, error: 'Supabase not configured' };
  const { error } = await sb.from('portal_3pl_payments').insert(payment);
  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

export async function updateInvoiceStatus(invoiceId: string, updates: Record<string, any>) {
  const sb = getAdmin();
  if (!sb) return { success: false };
  await sb.from('portal_3pl_invoices').update(updates).eq('id', invoiceId);
  return { success: true };
}
