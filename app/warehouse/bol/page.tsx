// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-600/50 text-[#4B5563]',
  finalized: 'bg-blue-600/50 text-blue-600',
  signed: 'bg-green-600/50 text-green-300',
  void: 'bg-red-600/50 text-red-300',
};

export default function BolPage() {
  const [bols, setBols] = useState<any[]>([]);
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
        .from('bills_of_lading')
        .select('*')
        .eq('company_id', wh.company_id)
        .order('created_at', { ascending: false })
        .limit(100);

      setBols(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bills of Lading</h1>
          <p className="text-sm text-[#6B7280] mt-1">{bols.length} BOLs</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase">BOL #</th>
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase">Consignee</th>
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase">Carrier</th>
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase">Ship Date</th>
                <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium uppercase">Pieces</th>
                <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium uppercase">Weight</th>
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase">PRO #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="h-4 bg-white shadow-sm rounded animate-pulse" /></td></tr>
                ))
              ) : bols.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#9CA3AF]">
                    No bills of lading yet. BOLs are auto-generated when orders are submitted.
                  </td>
                </tr>
              ) : (
                bols.map(b => (
                  <tr key={b.id} className="hover:bg-white shadow-sm transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">{b.bol_number}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_BADGE[b.status] || STATUS_BADGE.draft}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4B5563] text-xs truncate max-w-[200px]">{b.consignee_name || '—'}</td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">{b.carrier_name || '—'}</td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">
                      {b.ship_date ? new Date(b.ship_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#4B5563]">{b.total_pieces || 0}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#6B7280]">
                      {b.total_weight ? `${b.total_weight.toLocaleString()} lbs` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{b.pro_number || '—'}</td>
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
