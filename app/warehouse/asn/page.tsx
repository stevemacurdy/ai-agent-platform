// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function AsnPage() {
  const [asns, setAsns] = useState<any[]>([]);
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
        .from('asn_documents')
        .select('*, warehouse_orders(order_number)')
        .eq('company_id', wh.company_id)
        .order('created_at', { ascending: false })
        .limit(100);

      setAsns(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">ASN Documents</h1>
          <p className="text-sm text-white/40 mt-1">Advanced Shipping Notices — {asns.length} documents</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">ASN #</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Order</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">File</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase">Size</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Notes</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Uploaded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>
              ))
            ) : asns.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No ASN documents yet. Upload ASNs when processing inbound orders.</td></tr>
            ) : (
              asns.map(a => (
                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{a.asn_number}</td>
                  <td className="px-4 py-3 text-xs text-white/60">{a.warehouse_orders?.order_number || '—'}</td>
                  <td className="px-4 py-3">
                    {a.file_url ? (
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 underline truncate max-w-[200px] block">
                        {a.file_name}
                      </a>
                    ) : (
                      <span className="text-xs text-white/30">{a.file_name || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-white/40">
                    {a.file_size ? `${(a.file_size / 1024).toFixed(0)} KB` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50 truncate max-w-[200px]">{a.notes || '—'}</td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {new Date(a.created_at).toLocaleDateString()}
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
