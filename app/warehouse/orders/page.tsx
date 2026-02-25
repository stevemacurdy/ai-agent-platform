// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-600/50 text-gray-300',
  submitted: 'bg-blue-600/50 text-blue-300',
  confirmed: 'bg-indigo-600/50 text-indigo-300',
  picking: 'bg-yellow-600/50 text-yellow-300',
  packed: 'bg-orange-600/50 text-orange-300',
  shipped: 'bg-green-600/50 text-green-300',
  delivered: 'bg-emerald-600/50 text-emerald-300',
  cancelled: 'bg-red-600/50 text-red-300',
};

const STATUS_FILTERS = ['all', 'draft', 'submitted', 'confirmed', 'picking', 'packed', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;

      const { data: memberships } = await sb
        .from('company_members')
        .select('company_id, companies(portal_type)')
        .eq('user_id', session.user.id);

      const wh = memberships?.find(
        (m: any) => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both'
      ) || memberships?.[0];

      if (!wh) return;

      let query = sb
        .from('warehouse_orders')
        .select('*, warehouse_customers(customer_name)')
        .eq('company_id', wh.company_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (search.trim()) {
        query = query.or(`order_number.ilike.%${search}%,ship_to_name.ilike.%${search}%,po_number.ilike.%${search}%`);
      }

      const { data } = await query;
      setOrders(data || []);
      setLoading(false);
    };
    load();
  }, [statusFilter, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-white/40 mt-1">{orders.length} orders</p>
        </div>
        <Link
          href="/warehouse/orders/new"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors"
        >
          + New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search order #, ship to, PO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Order #</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Ship To</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">PO #</th>
                <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase">Items</th>
                <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase">Weight</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Ship Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-white/30">
                    {search || statusFilter !== 'all' ? 'No matching orders found' : 'No orders yet'}
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/warehouse/orders/${o.id}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">{o.order_number}</td>
                    <td className="px-4 py-3 text-xs text-white/50">{o.order_type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_BADGE[o.status] || STATUS_BADGE.draft}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {(o as any).warehouse_customers?.customer_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/70 truncate max-w-[200px]">{o.ship_to_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-white/50">{o.po_number || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-white/70">{o.total_items || 0}</td>
                    <td className="px-4 py-3 text-right font-mono text-white/50">
                      {o.total_weight ? `${o.total_weight.toLocaleString()} lbs` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {o.requested_ship_date ? new Date(o.requested_ship_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
