// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-600/50 text-gray-300',
  submitted: 'bg-blue-600/50 text-blue-300',
  approved: 'bg-green-600/50 text-green-300',
  received: 'bg-emerald-600/50 text-emerald-300',
  cancelled: 'bg-red-600/50 text-red-300',
};

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      const { data } = await sb
        .from('purchase_orders')
        .select('*')
        .eq('company_id', wh.company_id)
        .order('created_at', { ascending: false })
        .limit(100);

      setPos(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
          <p className="text-sm text-white/40 mt-1">{pos.length} purchase orders</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">PO #</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Vendor</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Ship Via</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase">Total</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>
              ))
            ) : pos.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No purchase orders yet</td></tr>
            ) : (
              pos.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{p.po_number}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status] || STATUS_BADGE.draft}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">{p.vendor_name}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{p.ship_via || '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    ${(p.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
