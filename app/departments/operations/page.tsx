'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking';
import LMSDashboard from '@/components/lms/LMSDashboard';

const SECTIONS = [
  { id: 'warehouse', label: 'Warehouse', icon: '\uD83C\uDFED', phase: 1 },
  { id: 'wms', label: 'WMS', icon: '\uD83D\uDCE6', phase: 1 },
  { id: '3pl', label: '3PL Portal', icon: '\uD83D\uDE9A', phase: 1 },
  { id: 'training', label: 'Training', icon: '\uD83C\uDF93', phase: 0 },
  { id: 'supply-chain', label: 'Supply Chain', icon: '\uD83D\uDD17', phase: 2 },
  { id: 'operations', label: 'Operations', icon: '\u2699\uFE0F', phase: 2 },
  { id: 'research', label: 'Research', icon: '\uD83D\uDD0D', phase: 2 },
  { id: 'legal', label: 'Legal', icon: '\u2696\uFE0F', phase: 3 },
  { id: 'compliance', label: 'Compliance', icon: '\uD83D\uDCCB', phase: 3 },
  { id: 'support', label: 'Support', icon: '\uD83C\uDFA7', phase: 3 },
];

const fmt = (n: number) => '$' + n.toLocaleString();
const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600', picking: 'bg-blue-50 text-blue-600', packing: 'bg-violet-50 text-violet-600',
  shipped: 'bg-amber-50 text-amber-600', delivered: 'bg-emerald-50 text-emerald-600', cancelled: 'bg-rose-50 text-rose-600',
  active: 'bg-emerald-50 text-emerald-600', onboarding: 'bg-blue-50 text-blue-600', suspended: 'bg-rose-50 text-rose-600',
  'In Progress': 'bg-amber-50 text-amber-600', Completed: 'bg-emerald-50 text-emerald-600', Queued: 'bg-blue-50 text-blue-600',
};
const badge = (s: string) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;

export default function OperationsDepartment() {
  useTrackConsoleView('operations-dept');
  const [section, setSection] = useState('warehouse');
  const [whData, setWhData] = useState<any>(null);
  const [wmsData, setWmsData] = useState<any>(null);
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [aiTitle, setAiTitle] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('woulfai_token') || '' : '';
  const hdrs: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  useEffect(() => {
    Promise.all([
      fetch('/api/warehouse-data?view=dashboard').then(r => r.json()).catch(() => null),
      fetch('/api/agents/wms', { headers: hdrs }).then(r => r.json()).catch(() => null),
      fetch('/api/agents/3pl-portal?view=customers').then(r => r.json()).catch(() => null),
    ]).then(([wh, wms, portal]) => {
      setWhData(wh);
      setWmsData(wms);
      setPortalData(portal);
      setLoading(false);
    });
  }, []);

  const handleAi = async (endpoint: string, action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setAiTitle(action.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())); setAiModal(true);
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: hdrs, body: JSON.stringify({ action, ...payload }) });
      const result = await res.json();
      setAiResult(result.result || result.error || result.message || JSON.stringify(result, null, 2));
    } catch (e: any) { setAiResult('Error: ' + e.message); }
    setAiLoading(false);
  };

  const availableSections = SECTIONS.filter(s => s.phase <= 1);
  const futureSections = SECTIONS.filter(s => s.phase > 1);

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex">
      {/* Section Sidebar */}
      <aside className="w-56 bg-white border-r border-[#E5E7EB] flex flex-col">
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B2A4A] to-[#2A9D8F] flex items-center justify-center text-white text-sm font-bold">O</div>
            <div>
              <p className="text-sm font-bold text-[#1B2A4A]">Operations</p>
              <p className="text-[10px] text-[#9CA3AF]">Department Console</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {availableSections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                section === s.id ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#1B2A4A]'
              }`}>
              <span className="text-base">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
          {futureSections.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1">
                <p className="text-[9px] font-bold uppercase text-[#9CA3AF] tracking-wider">Coming Soon</p>
              </div>
              {futureSections.map(s => (
                <div key={s.id} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#D1D5DB] cursor-not-allowed">
                  <span className="text-base opacity-40">{s.icon}</span>
                  <span>{s.label}</span>
                  <span className="ml-auto text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">P{s.phase}</span>
                </div>
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* ═══ WAREHOUSE SECTION ═══ */}
        {section === 'warehouse' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83C\uDFED'} Warehouse Operations</h1>
                <p className="text-sm text-[#9CA3AF]">Floor management, inventory, orders, zone performance</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${whData?.source === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                {whData?.source === 'live' ? 'Live' : 'Demo'}
              </span>
            </div>

            {loading ? <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div> : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total SKUs', value: whData?.summary?.totalSKUs || 0, sub: `${(whData?.summary?.totalItems || 0).toLocaleString()} units` },
                    { label: 'Inventory Value', value: fmt(whData?.summary?.inventoryValue || 0), sub: `${whData?.summary?.lowStockAlerts || 0} alerts`, color: (whData?.summary?.lowStockAlerts || 0) > 0 ? '#DC2626' : '#2A9D8F' },
                    { label: 'Open Orders', value: whData?.summary?.openOrders || 0, sub: fmt(whData?.summary?.openOrderValue || 0) },
                    { label: 'Avg Utilization', value: `${whData?.summary?.avgUtilization || 0}%`, sub: `${whData?.summary?.rushOrders || 0} rush` },
                  ].map((k, i) => (
                    <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{k.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: k.color || '#1B2A4A' }}>{k.value}</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">{k.sub}</p>
                    </div>
                  ))}
                </div>

                {/* AI Actions */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { action: 'optimize-routes', label: 'Optimize Pick Routes', desc: 'AI-optimized picking paths', icon: '\uD83D\uDEE4\uFE0F' },
                    { action: 'zone-rebalance', label: 'Zone Rebalance', desc: 'AI zone recommendations', icon: '\uD83D\uDCCA' },
                    { action: 'shift-report', label: 'Shift Report', desc: 'AI end-of-shift summary', icon: '\uD83D\uDCDD' },
                  ].map(a => (
                    <button key={a.action} onClick={() => handleAi('/api/agents/warehouse', a.action, { data: whData?.summary })} disabled={aiLoading}
                      className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                      <span className="text-lg">{a.icon}</span>
                      <p className="text-xs font-bold text-white mt-2">{a.label}</p>
                      <p className="text-[10px] text-white/60">{a.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Orders + Alerts */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                    <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Active Orders</h3>
                    <div className="space-y-2">
                      {(whData?.topOrders || []).slice(0, 5).map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0">
                          <div>
                            <p className="text-xs font-medium text-[#1B2A4A]">{o.orderNumber}</p>
                            <p className="text-[10px] text-[#9CA3AF]">{o.customer} | {o.items} items</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {badge(o.status)}
                            <span className="text-sm font-mono font-bold text-[#1B2A4A]">{fmt(o.totalValue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-rose-200 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-rose-600 mb-3">Low Stock Alerts</h3>
                    {(whData?.lowStock || []).length === 0 ? (
                      <p className="text-xs text-emerald-600 py-4">All items above reorder point.</p>
                    ) : (
                      <div className="space-y-2">
                        {(whData?.lowStock || []).slice(0, 5).map((i: any) => (
                          <div key={i.id} className="flex items-center justify-between py-2 border-b border-rose-100 last:border-0">
                            <div><p className="text-xs font-medium text-[#1B2A4A]">{i.sku}</p><p className="text-[10px] text-[#9CA3AF]">{i.name}</p></div>
                            <span className="text-sm font-mono font-bold text-rose-500">{i.qty} / {i.reorderPoint}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ WMS SECTION ═══ */}
        {section === 'wms' && (
          <div className="p-6 space-y-5">
            <div>
              <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDCE6'} Warehouse Management System</h1>
              <p className="text-sm text-[#9CA3AF]">Wave planning, slotting, pick accuracy, throughput</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Pick Accuracy', value: '99.2%', color: '#059669' },
                { label: 'Orders/Hour', value: '47', color: '#1B2A4A' },
                { label: 'Space Utilization', value: '82%', color: '#F5920B' },
                { label: 'Receiving Backlog', value: '14 pallets', color: '#DC2626' },
              ].map((k, i) => (
                <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                  <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{k.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { action: 'create-wave', label: 'Create Wave', desc: 'Generate new pick wave', icon: '\uD83C\uDF0A', endpoint: '/api/agents/wms' },
                { action: 'cycle-count', label: 'Cycle Count', desc: 'AI cycle count plan', icon: '\uD83D\uDD04', endpoint: '/api/agents/wms' },
                { action: 'slotting-optimization', label: 'Optimize Slotting', desc: 'AI slot recommendations', icon: '\uD83D\uDDC4\uFE0F', endpoint: '/api/agents/wms' },
                { action: 'analyze-throughput', label: 'Analyze Throughput', desc: 'AI throughput analysis', icon: '\uD83D\uDCCA', endpoint: '/api/agents/wms' },
              ].map(a => (
                <button key={a.action} onClick={() => handleAi(a.endpoint, a.action)} disabled={aiLoading}
                  className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                  <span className="text-lg">{a.icon}</span>
                  <p className="text-xs font-bold text-white mt-2">{a.label}</p>
                  <p className="text-[10px] text-white/60">{a.desc}</p>
                </button>
              ))}
            </div>

            <p className="text-xs text-[#9CA3AF]">Full WMS console with waves, pickers, space, and receiving tabs available at the dedicated WMS page.</p>
          </div>
        )}

        {/* ═══ 3PL PORTAL SECTION ═══ */}
        {section === '3pl' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDE9A'} 3PL Customer Portal</h1>
                <p className="text-sm text-[#9CA3AF]">Customer management, contracts, billing, portal access</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${portalData?.source === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                  {portalData?.source === 'live' ? 'Live' : 'Demo'}
                </span>
                <a href="/agents/3pl-portal/console" className="px-3 py-1.5 bg-[#2A9D8F] text-white rounded-lg text-xs font-medium hover:bg-[#2A9D8F]/90">
                  Full Console {'\u2192'}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Customers', value: portalData?.summary?.total || 0, color: '#1B2A4A' },
                { label: 'Active', value: portalData?.summary?.active || 0, color: '#059669' },
                { label: 'Onboarding', value: portalData?.summary?.onboarding || 0, color: '#2563EB' },
                { label: 'Total Pallets', value: (portalData?.summary?.totalPallets || 0).toLocaleString(), color: '#1B2A4A' },
                { label: 'Monthly Revenue', value: '$' + (portalData?.summary?.monthlyRevenue || 0).toLocaleString(), color: '#2A9D8F' },
              ].map((k, i) => (
                <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                  <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{k.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-bold text-[#1B2A4A]">Customers</h3>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2 text-xs font-bold text-[#9CA3AF] uppercase">Code</th>
                  <th className="px-4 py-2 text-xs font-bold text-[#9CA3AF] uppercase">Company</th>
                  <th className="px-4 py-2 text-xs font-bold text-[#9CA3AF] uppercase">Contact</th>
                  <th className="px-4 py-2 text-xs font-bold text-[#9CA3AF] uppercase">Status</th>
                  <th className="px-4 py-2 text-xs font-bold text-[#9CA3AF] uppercase">SKUs</th>
                  <th className="px-4 py-2 text-xs font-bold text-[#9CA3AF] uppercase">Balance</th>
                  <th className="px-4 py-2 text-xs font-bold text-[#9CA3AF] uppercase">Portal</th>
                </tr></thead>
                <tbody>
                  {(portalData?.customers || []).map((c: any) => (
                    <tr key={c.customer_code} className="border-t border-[#F4F5F7] hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[#1B2A4A]">{c.customer_code}</td>
                      <td className="px-4 py-3 text-xs text-[#1B2A4A]">{c.customer_name}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{c.contact_name}</td>
                      <td className="px-4 py-3">{badge(c.status)}</td>
                      <td className="px-4 py-3 text-xs font-medium text-[#1B2A4A]">{c.inventory_count || 0}</td>
                      <td className="px-4 py-3 text-xs font-mono font-bold" style={{ color: c.has_overdue ? '#DC2626' : '#1B2A4A' }}>
                        ${(c.current_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <a href={'/portal/' + c.customer_code} target="_blank" className="text-[#2A9D8F] hover:underline text-xs">Open</a>
                      </td>
                    </tr>
                  ))}
                  {(portalData?.customers || []).length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-[#9CA3AF]">No customers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TRAINING SECTION ═══ */}
        {section === 'training' && (
          <LMSDashboard department="operations" title="Operations Training" />
        )}

        {/* ═══ AI RESULT MODAL ═══ */}
        {aiModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAiModal(false)}>
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1B2A4A]">{aiTitle}</h3>
                <button onClick={() => setAiModal(false)} className="text-[#6B7280] hover:text-[#1B2A4A] text-lg">{'\u2715'}</button>
              </div>
              <div className="p-6">
                {aiLoading ? (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <div className="w-5 h-5 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-[#6B7280]">AI analyzing...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm text-[#4B5563] leading-relaxed">{aiResult}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
