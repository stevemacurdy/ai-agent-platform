// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const STATUS_BADGE = {
  pending: 'bg-gray-600/50 text-gray-300',
  received: 'bg-blue-600/50 text-blue-300',
  staged: 'bg-purple-600/50 text-purple-300',
  picked: 'bg-amber-600/50 text-amber-300',
  shipped: 'bg-green-600/50 text-green-300',
};

function generateQRUrl(data) {
  const text = encodeURIComponent(JSON.stringify(data));
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${text}`;
}

export default function PalletsPage() {
  const [pallets, setPallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [editWeightId, setEditWeightId] = useState(null);
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;
      const { data: memberships } = await sb
        .from('company_members').select('company_id, companies(portal_type)').eq('user_id', session.user.id);
      const wh = memberships?.find(m => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both') || memberships?.[0];
      if (!wh) return;
      setCompanyId(wh.company_id);

      let query = sb.from('warehouse_pallets').select('*').eq('company_id', wh.company_id).order('created_at', { ascending: false }).limit(200);
      const { data } = await query;
      setPallets(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = pallets.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (directionFilter !== 'all' && p.direction !== directionFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return (p.pallet_number?.toLowerCase().includes(s) || p.product_name?.toLowerCase().includes(s) ||
        p.lot_number?.toLowerCase().includes(s) || p.manufacturer?.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s));
    }
    return true;
  });

  const saveWeight = async (palletId) => {
    const weight = parseFloat(weightInput);
    if (!weight || weight <= 0) return;
    const sb = getSupabaseBrowser();
    await sb.from('warehouse_pallets').update({ pallet_weight: weight, pallet_weight_confirmed: true, updated_at: new Date().toISOString() }).eq('id', palletId);
    setPallets(prev => prev.map(p => p.id === palletId ? { ...p, pallet_weight: weight, pallet_weight_confirmed: true } : p));
    setEditWeightId(null);
    setWeightInput('');
  };

  const printQR = (pallet) => {
    const qrUrl = generateQRUrl(pallet.qr_code_data || { pallet: pallet.pallet_number, product: pallet.product_name });
    const exp = pallet.expiration_date ? new Date(pallet.expiration_date) : null;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Pallet ${pallet.pallet_number}</title>
      <style>body{font-family:Arial;margin:20px;} .label{border:2px solid #000;padding:20px;width:400px;} .qr{text-align:center;margin:10px 0;} h2{margin:0 0 10px;font-size:18px;} .field{margin:4px 0;font-size:14px;} .field b{display:inline-block;width:120px;} .small{font-size:11px;color:#666;}</style></head>
      <body>
        <div class="label">
          <h2>${pallet.pallet_number}</h2>
          <div class="qr"><img src="${qrUrl}" width="180" height="180" /></div>
          <div class="field"><b>Product:</b> ${pallet.product_name}</div>
          <div class="field"><b>Form:</b> ${pallet.product_form}</div>
          ${exp ? `<div class="field"><b>Expires:</b> ${exp.toLocaleDateString('en-US')} (${exp.getFullYear()}/${String(exp.getMonth()+1).padStart(2,'0')}/${String(exp.getDate()).padStart(2,'0')})</div>` : ''}
          ${pallet.manufacturer ? `<div class="field"><b>Manufacturer:</b> ${pallet.manufacturer}</div>` : ''}
          ${pallet.lot_number ? `<div class="field"><b>Lot #:</b> ${pallet.lot_number}</div>` : ''}
          <div class="field"><b>Received:</b> ${pallet.received_date || ''}</div>
          ${pallet.case_qty ? `<div class="field"><b>Cases:</b> ${pallet.case_qty} @ ${pallet.case_weight || '?'} lbs</div>` : ''}
          ${pallet.pallet_weight ? `<div class="field"><b>Pallet Wt:</b> ${pallet.pallet_weight} lbs</div>` : ''}
          <div class="small">Scan QR for full ASN & packing list data</div>
        </div>
        <script>window.print();</script>
      </body></html>
    `);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pallet Tracking</h1>
          <p className="text-sm text-white/40 mt-1">
            {filtered.length} pallets · {pallets.filter(p => !p.pallet_weight_confirmed).length} need weighing
          </p>
        </div>
        <Link href="/warehouse/receiving"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors">
          + Receive Shipment
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pallet, product, lot, manufacturer..."
          className="flex-1 min-w-[200px] max-w-md bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500" />
        <div className="flex gap-1">
          {['all', 'inbound', 'outbound'].map(d => (
            <button key={d} onClick={() => setDirectionFilter(d)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${directionFilter === d ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', 'pending', 'received', 'staged', 'shipped'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
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
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Pallet #</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Form</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Lot #</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Expires</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">MFG</th>
                <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase">Cases</th>
                <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase">Weight</th>
                <th className="text-center px-4 py-3 text-xs text-white/40 font-medium uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs text-white/40 font-medium uppercase">QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={10} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-white/30">
                  {search || statusFilter !== 'all' ? 'No matching pallets' : 'No pallets yet. Receive a shipment to get started.'}
                </td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">{p.pallet_number}</td>
                    <td className="px-4 py-3 text-white font-medium">{p.product_name}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{p.product_form}</td>
                    <td className="px-4 py-3 text-xs text-white/50">{p.lot_number || '\u2014'}</td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {p.expiration_date ? new Date(p.expiration_date).toLocaleDateString() : '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50 truncate max-w-[120px]">{p.manufacturer || '\u2014'}</td>
                    <td className="px-4 py-3 text-right font-mono text-white/60">{p.case_qty || '\u2014'}</td>
                    <td className="px-4 py-3 text-right">
                      {editWeightId === p.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <input type="number" min={0} step={0.1} value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveWeight(p.id)}
                            className="w-20 bg-white/10 border border-blue-500 rounded px-2 py-1 text-xs text-white text-right focus:outline-none"
                            autoFocus placeholder="lbs" />
                          <button onClick={() => saveWeight(p.id)} className="text-emerald-400 text-xs">✓</button>
                          <button onClick={() => setEditWeightId(null)} className="text-white/30 text-xs">✕</button>
                        </div>
                      ) : p.pallet_weight ? (
                        <span className="font-mono text-white">{p.pallet_weight} lbs</span>
                      ) : (
                        <button onClick={() => { setEditWeightId(p.id); setWeightInput(''); }}
                          className="text-xs text-amber-400 hover:text-amber-300 underline">
                          + Add weight
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status] || STATUS_BADGE.pending}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => printQR(p)} title="Print QR label"
                        className="text-white/40 hover:text-white transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
                          <rect x="18" y="14" width="3" height="3" /><rect x="14" y="18" width="3" height="3" />
                          <rect x="18" y="18" width="3" height="3" />
                        </svg>
                      </button>
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
