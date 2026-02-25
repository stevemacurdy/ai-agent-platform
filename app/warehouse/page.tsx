// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface DashboardStats {
  totalSkus: number;
  totalOnHand: number;
  totalAllocated: number;
  activeOrders: number;
  pendingBols: number;
  totalCustomers: number;
}

export default function WarehouseDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSkus: 0, totalOnHand: 0, totalAllocated: 0,
    activeOrders: 0, pendingBols: 0, totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;

      // Get company
      const { data: memberships } = await sb
        .from('company_members')
        .select('company_id, companies(portal_type)')
        .eq('user_id', session.user.id);

      const wh = memberships?.find(
        (m: any) => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both'
      ) || memberships?.[0];

      if (!wh) return;
      const cId = wh.company_id;
      setCompanyId(cId);

      // Fetch stats in parallel
      const [invRes, ordRes, bolRes, custRes] = await Promise.all([
        sb.from('warehouse_inventory').select('id, qty_on_hand, qty_allocated', { count: 'exact' }).eq('company_id', cId),
        sb.from('warehouse_orders').select('id, order_number, status, ship_to_name, requested_ship_date, total_items, created_at')
          .eq('company_id', cId).order('created_at', { ascending: false }).limit(5),
        sb.from('bills_of_lading').select('id', { count: 'exact' }).eq('company_id', cId).in('status', ['draft', 'finalized']),
        sb.from('warehouse_customers').select('id', { count: 'exact' }).eq('company_id', cId).eq('is_active', true),
      ]);

      const inv = invRes.data || [];
      setStats({
        totalSkus: invRes.count || 0,
        totalOnHand: inv.reduce((s: number, i: any) => s + (i.qty_on_hand || 0), 0),
        totalAllocated: inv.reduce((s: number, i: any) => s + (i.qty_allocated || 0), 0),
        activeOrders: ordRes.data?.filter((o: any) => !['delivered', 'cancelled'].includes(o.status)).length || 0,
        pendingBols: bolRes.count || 0,
        totalCustomers: custRes.count || 0,
      });

      setRecentOrders(ordRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Active SKUs', value: stats.totalSkus, icon: '📦', color: 'from-blue-600 to-blue-400' },
    { label: 'Units On Hand', value: stats.totalOnHand.toLocaleString(), icon: '🏭', color: 'from-emerald-600 to-emerald-400' },
    { label: 'Units Allocated', value: stats.totalAllocated.toLocaleString(), icon: '📌', color: 'from-amber-600 to-amber-400' },
    { label: 'Active Orders', value: stats.activeOrders, icon: '🚚', color: 'from-purple-600 to-purple-400' },
    { label: 'Pending BOLs', value: stats.pendingBols, icon: '📄', color: 'from-cyan-600 to-cyan-400' },
    { label: 'Customers', value: stats.totalCustomers, icon: '👥', color: 'from-pink-600 to-pink-400' },
  ];

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Warehouse Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Inventory, orders, and logistics at a glance</p>
        </div>
        <Link
          href="/warehouse/orders/new"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors"
        >
          + New Order
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {statCards.map(card => (
              <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-lg`}>
                    {card.icon}
                  </div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Recent Orders</h2>
              <Link href="/warehouse/orders" className="text-xs text-blue-400 hover:text-blue-300">
                View All →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-sm">
                No orders yet. Create your first order to get started.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentOrders.map(order => (
                  <Link
                    key={order.id}
                    href={`/warehouse/orders/${order.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{order.order_number}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-600/50 text-gray-300'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5 truncate">{order.ship_to_name || 'No destination'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60">{order.total_items || 0} items</p>
                      <p className="text-[10px] text-white/30">
                        {order.requested_ship_date ? new Date(order.requested_ship_date).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { href: '/warehouse/inventory', label: 'View Inventory', icon: '📦' },
              { href: '/warehouse/orders/new', label: 'Create Order', icon: '➕' },
              { href: '/warehouse/bol', label: 'Generate BOL', icon: '📄' },
              { href: '/warehouse/customers', label: 'Manage Customers', icon: '👥' },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] hover:border-white/20 transition-colors"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm text-white/70">{action.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
