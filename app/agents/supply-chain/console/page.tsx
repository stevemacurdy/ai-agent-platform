'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const VENDORS = [
  { name: 'FastParts', onTime: 78, quality: 3.2, leadTime: 18, openPOs: 6, risk: 'high', trend: 'down', category: 'Electronics', email: 'orders@fastparts.com', contract: 'Expires Jun 2026', history: 'Was 92% on-time 6 months ago, steady decline' },
  { name: 'ReliableSupply', onTime: 96, quality: 4.8, leadTime: 8, openPOs: 3, risk: 'low', trend: 'up', category: 'Hardware', email: 'sales@reliablesupply.com', contract: 'Expires Dec 2026', history: 'Consistent top performer, 3-year relationship' },
  { name: 'GlobalComponents', onTime: 88, quality: 3.9, leadTime: 14, openPOs: 5, risk: 'medium', trend: 'flat', category: 'Components', email: 'supply@globalcomp.com', contract: 'Expires Sep 2026', history: 'Stable but occasional quality dips in Q1' },
  { name: 'PrecisionMfg', onTime: 94, quality: 4.5, leadTime: 10, openPOs: 2, risk: 'low', trend: 'up', category: 'Fabrication', email: 'info@precisionmfg.com', contract: 'Expires Mar 2027', history: 'Recently improved after management change' },
  { name: 'QuickShip Asia', onTime: 72, quality: 3.0, leadTime: 22, openPOs: 8, risk: 'high', trend: 'down', category: 'Circuit Boards', email: 'export@quickshipasia.com', contract: 'Expires Apr 2026', history: 'Single source for PCBs, lead times increasing quarterly' },
  { name: 'EuroSource', onTime: 91, quality: 4.2, leadTime: 12, openPOs: 4, risk: 'medium', trend: 'flat', category: 'Sensors', email: 'procurement@eurosource.eu', contract: 'Expires Nov 2026', history: 'Reliable but shipping delays during EU holidays' },
];

const SHIPMENTS = [
  { id: 'SHP-4421', vendor: 'FastParts', origin: 'Shenzhen', dest: 'Salt Lake City', status: 'Delayed', eta: '2026-03-08', daysLate: 3 },
  { id: 'SHP-4422', vendor: 'ReliableSupply', origin: 'Dallas', dest: 'Grantsville', status: 'Delivered', eta: '2026-03-02', daysLate: 0 },
  { id: 'SHP-4423', vendor: 'GlobalComponents', origin: 'Taipei', dest: 'Salt Lake City', status: 'In Transit', eta: '2026-03-10', daysLate: 0 },
  { id: 'SHP-4424', vendor: 'QuickShip Asia', origin: 'Guangzhou', dest: 'Salt Lake City', status: 'Customs', eta: '2026-03-06', daysLate: 1 },
  { id: 'SHP-4425', vendor: 'PrecisionMfg', origin: 'Phoenix', dest: 'Grantsville', status: 'In Transit', eta: '2026-03-05', daysLate: 0 },
  { id: 'SHP-4426', vendor: 'EuroSource', origin: 'Munich', dest: 'Salt Lake City', status: 'Delayed', eta: '2026-03-09', daysLate: 2 },
  { id: 'SHP-4427', vendor: 'FastParts', origin: 'Shenzhen', dest: 'Salt Lake City', status: 'Delayed', eta: '2026-03-12', daysLate: 4 },
  { id: 'SHP-4428', vendor: 'ReliableSupply', origin: 'Dallas', dest: 'Grantsville', status: 'Delivered', eta: '2026-03-01', daysLate: 0 },
];

const LEAD_TIME_TREND = [
  { month: 'Oct', FastParts: 14, ReliableSupply: 9, QuickShipAsia: 18, PrecisionMfg: 11, EuroSource: 11 },
  { month: 'Nov', FastParts: 15, ReliableSupply: 8, QuickShipAsia: 19, PrecisionMfg: 11, EuroSource: 12 },
  { month: 'Dec', FastParts: 16, ReliableSupply: 8, QuickShipAsia: 20, PrecisionMfg: 10, EuroSource: 13 },
  { month: 'Jan', FastParts: 17, ReliableSupply: 8, QuickShipAsia: 21, PrecisionMfg: 10, EuroSource: 12 },
  { month: 'Feb', FastParts: 18, ReliableSupply: 8, QuickShipAsia: 22, PrecisionMfg: 10, EuroSource: 12 },
  { month: 'Mar', FastParts: 18, ReliableSupply: 8, QuickShipAsia: 22, PrecisionMfg: 10, EuroSource: 12 },
];

const RISK_EVENTS = [
  { date: '2026-03-02', vendor: 'FastParts', event: 'Shipment delayed 3 days — port congestion', severity: 'High', impact: '$12K in idle labor', mitigation: 'Open' },
  { date: '2026-02-28', vendor: 'QuickShip Asia', event: 'Quality defect batch — 8% rejection rate', severity: 'Critical', impact: '$24K replacement cost', mitigation: 'In Progress' },
  { date: '2026-02-25', vendor: 'EuroSource', event: 'Lead time increased 2 days — carrier change', severity: 'Medium', impact: 'Minor schedule adjustment', mitigation: 'Resolved' },
  { date: '2026-02-20', vendor: 'GlobalComponents', event: 'Invoice discrepancy — $4.2K overcharge', severity: 'Low', impact: '$4.2K credit pending', mitigation: 'Open' },
];

const PIE_COLORS = ['#059669', '#F5920B', '#DC2626', '#7C3AED'];

const badge = (v: string) => {
  const m: Record<string, string> = {
    low: 'bg-emerald-50 text-emerald-600', medium: 'bg-amber-50 text-amber-600',
    high: 'bg-rose-50 text-rose-600', critical: 'bg-rose-50 text-rose-600',
    'In Transit': 'bg-blue-50 text-blue-600', Delivered: 'bg-emerald-50 text-emerald-600',
    Delayed: 'bg-rose-50 text-rose-600', Customs: 'bg-violet-50 text-violet-600',
    Open: 'bg-blue-50 text-blue-600', 'In Progress': 'bg-amber-50 text-amber-600',
    Resolved: 'bg-emerald-50 text-emerald-600', High: 'bg-rose-50 text-rose-600',
    Critical: 'bg-rose-50 text-rose-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-blue-50 text-blue-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

export default function SupplyChainConsole() {
  useTrackConsoleView('supply-chain')
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('vendors');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/agents/supply-chain').then(r => r.json())
      .then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const sort = (key: string) => { setSortKey(key); setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'); setExpandedRow(null); };
  const sorted = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv)); return sortDir === 'asc' ? c : -c; }); };
  const arrow = (k: string) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalAction(action); setModalOpen(true);
    const res = await fetch('/api/agents/supply-chain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, vendors: VENDORS, ...payload }) });
    const r = await res.json(); setAiResult(r.result || r.error || 'Complete'); setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['vendors', 'shipments', 'leadtimes', 'risk'];
  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${sub.includes('↑') || sub.includes('improv') ? 'text-emerald-600' : sub.includes('↓') || sub.includes('down') ? 'text-rose-600' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
  const TH = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => sort(k)}>{children}{arrow(k)}</th>
  );

  if (loading) return <div className="p-8 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-3xl">🔗</span><div><h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>Supply Chain Console</h1><p className="text-xs text-gray-400">Operations Department</p></div></div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>
      <div className="flex gap-2 border-b border-gray-200">{tabs.map(t => (
        <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          {t === 'vendors' ? 'Vendor Scorecard' : t === 'shipments' ? 'Shipment Tracker' : t === 'leadtimes' ? 'Lead Times' : 'Risk Monitor'}
        </button>
      ))}</div>

      {tab === 'vendors' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="On-Time Rate" value="91%" sub="↓ 2% vs last month" /><KPI label="Active Vendors" value="34" /><KPI label="Avg Lead Time" value="12 days" /><KPI label="At-Risk Shipments" value="4" />
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="name">Vendor</TH><TH k="onTime">On-Time %</TH><TH k="quality">Quality</TH><TH k="leadTime">Lead Time</TH><TH k="openPOs">Open POs</TH><TH k="risk">Risk</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Trend</th>
          </tr></thead><tbody>
            {sorted(VENDORS.filter(v => v.name.toLowerCase().includes(search.toLowerCase()))).map((v, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{v.name}</td>
                <td className="px-4 py-3 font-bold" style={{ color: v.onTime >= 90 ? '#059669' : v.onTime >= 80 ? '#F5920B' : '#DC2626' }}>{v.onTime}%</td>
                <td className="px-4 py-3">{v.quality}/5</td><td className="px-4 py-3">{v.leadTime}d</td><td className="px-4 py-3">{v.openPOs}</td>
                <td className="px-4 py-3">{badge(v.risk)}</td>
                <td className="px-4 py-3 text-lg">{v.trend === 'up' ? '↑' : v.trend === 'down' ? '↓' : '→'}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const v = sorted(VENDORS.filter(vx => vx.name.toLowerCase().includes(search.toLowerCase())))[expandedRow]; if (!v) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                <div><span className="text-gray-400">Category:</span> <span className="font-medium">{v.category}</span></div>
                <div><span className="text-gray-400">Contact:</span> <span className="font-medium">{v.email}</span></div>
                <div><span className="text-gray-400">Contract:</span> <span className="font-medium">{v.contract}</span></div>
              </div>
              <p className="text-xs text-gray-500 mb-3">{v.history}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600" onClick={() => handleAi('find-alternatives', { vendorName: v.name, category: v.category, reason: `${v.onTime}% on-time rate, ${v.risk} risk` })}>Find Alternative</button>
                <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600" onClick={() => handleAi('generate-rfq', { vendorName: v.name })}>Generate RFQ</button>
              </div>
            </div>
          ); })()}
        </div>
      </>}

      {tab === 'shipments' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Active Shipments" value="18" /><KPI label="On Time" value="14" /><KPI label="Delayed" value="3" sub="needs attention" /><KPI label="In Customs" value="1" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="id">Shipment</TH><TH k="vendor">Vendor</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Origin</th><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Dest</th><TH k="status">Status</TH><TH k="eta">ETA</TH><TH k="daysLate">Days Late</TH>
          </tr></thead><tbody>
            {sorted(SHIPMENTS).map((s, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${s.status === 'Delayed' ? 'bg-rose-50/30' : ''}`}>
                <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: '#1B2A4A' }}>{s.id}</td><td className="px-4 py-3">{s.vendor}</td>
                <td className="px-4 py-3 text-gray-500">{s.origin}</td><td className="px-4 py-3 text-gray-500">{s.dest}</td>
                <td className="px-4 py-3">{badge(s.status)}</td><td className="px-4 py-3">{s.eta}</td>
                <td className="px-4 py-3 font-bold" style={{ color: s.daysLate > 0 ? '#DC2626' : '#059669' }}>{s.daysLate > 0 ? `+${s.daysLate}` : 'On Time'}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </>}

      {tab === 'leadtimes' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Avg Lead Time" value="12 days" /><KPI label="Fastest" value="ReliableSupply" sub="8 days" /><KPI label="Slowest" value="QuickShip Asia" sub="22 days" /><KPI label="Improving" value="3 vendors" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Avg Lead Time by Vendor</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VENDORS.map(v => ({ name: v.name, days: v.leadTime }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} /><Tooltip />
              <Bar dataKey="days" fill="#F5920B" name="Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>6-Month Lead Time Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={LEAD_TIME_TREND}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="FastParts" stroke="#DC2626" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="ReliableSupply" stroke="#059669" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="QuickShipAsia" stroke="#F5920B" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="PrecisionMfg" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="EuroSource" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>}

      {tab === 'risk' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ level: 'Low', count: VENDORS.filter(v => v.risk === 'low').length, color: '#059669', exposure: '$48K' },
            { level: 'Medium', count: VENDORS.filter(v => v.risk === 'medium').length, color: '#F5920B', exposure: '$82K' },
            { level: 'High', count: VENDORS.filter(v => v.risk === 'high').length, color: '#DC2626', exposure: '$156K' },
            { level: 'Critical', count: VENDORS.filter(v => v.risk === 'critical').length, color: '#7C3AED', exposure: '$0' },
          ].map((r, i) => (
            <div key={i} className="bg-white rounded-xl border-2 p-4" style={{ borderColor: r.color + '40' }}>
              <p className="text-xs font-bold uppercase" style={{ color: r.color }}>{r.level} Risk</p>
              <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A' }}>{r.count} vendors</p>
              <p className="text-xs text-gray-400 mt-1">PO Exposure: {r.exposure}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Vendor Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={[
              { name: 'Low', value: 2 }, { name: 'Medium', value: 2 }, { name: 'High', value: 2 }, { name: 'Critical', value: 0 },
            ].filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }: any) => `${name}: ${value}`}>
              {[0,1,2].map(i => <Cell key={i} fill={PIE_COLORS[i]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200"><h3 className="text-sm font-bold" style={{ color: '#1B2A4A' }}>Recent Risk Events</h3></div>
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
            <TH k="vendor">Vendor</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Event</th>
            <TH k="severity">Severity</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Impact</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
          </tr></thead><tbody>
            {RISK_EVENTS.map((e, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${e.severity === 'Critical' ? 'bg-rose-50/30' : ''}`}>
                <td className="px-4 py-3 text-gray-500">{e.date}</td><td className="px-4 py-3 font-medium">{e.vendor}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{e.event}</td><td className="px-4 py-3">{badge(e.severity)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{e.impact}</td><td className="px-4 py-3">{badge(e.mitigation)}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600" onClick={() => handleAi('risk-report')}>Run Risk Report</button>
      </>}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>{modalAction.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h3>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setModalOpen(false)}>&#x2715;</button>
            </div>
            {aiLoading ? <div className="flex items-center gap-3 py-8"><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-500">Analyzing...</span></div>
            : <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiResult}</div>}
            {!aiLoading && aiResult && <button className="mt-4 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200" onClick={() => navigator.clipboard.writeText(aiResult)}>Copy to Clipboard</button>}
          </div>
        </div>
      )}
    </div>
  );
}
