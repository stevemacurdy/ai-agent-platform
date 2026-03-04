'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

const WAVES = [
  { wave: 'Wave-847', total: 120, picked: 98, remaining: 22, accuracy: 99.0, picker: 'Maria L.', elapsed: '1h 42m', status: 'In Progress', orders: 'ORD-4401, ORD-4402, ORD-4403 (3 orders)', errors: 'Line 42: wrong SKU scanned, corrected' },
  { wave: 'Wave-848', total: 85, picked: 85, remaining: 0, accuracy: 99.4, picker: 'Carlos M.', elapsed: '1h 15m', status: 'Completed', orders: 'ORD-4398, ORD-4399 (2 orders)', errors: 'None' },
  { wave: 'Wave-849', total: 150, picked: 34, remaining: 116, accuracy: 100, picker: 'James K.', elapsed: '0h 28m', status: 'In Progress', orders: 'ORD-4404, ORD-4405, ORD-4406, ORD-4407 (4 orders)', errors: '2 short picks on Aisle C' },
  { wave: 'Wave-850', total: 95, picked: 0, remaining: 95, accuracy: 0, picker: 'Unassigned', elapsed: '--', status: 'Queued', orders: 'ORD-4408, ORD-4409 (2 orders)', errors: 'N/A' },
  { wave: 'Wave-851', total: 110, picked: 0, remaining: 110, accuracy: 0, picker: 'Unassigned', elapsed: '--', status: 'Queued', orders: 'ORD-4410, ORD-4411, ORD-4412 (3 orders)', errors: 'N/A' },
];

const HOURLY = [
  { hour: '7AM', orders: 32 }, { hour: '8AM', orders: 44 }, { hour: '9AM', orders: 51 },
  { hour: '10AM', orders: 48 }, { hour: '11AM', orders: 52 }, { hour: '12PM', orders: 38 },
  { hour: '1PM', orders: 45 }, { hour: '2PM', orders: 28 }, { hour: '3PM', orders: 47 },
  { hour: '4PM', orders: 50 }, { hour: '5PM', orders: 42 },
];

const PICKERS = [
  { name: 'Carlos M.', waves: 4, items: 340, accuracy: 99.8, picksHr: 68, errors: 0 },
  { name: 'Maria L.', waves: 3, items: 285, accuracy: 99.2, picksHr: 57, errors: 2 },
  { name: 'James K.', waves: 3, items: 210, accuracy: 96.2, picksHr: 42, errors: 4 },
  { name: 'Sarah T.', waves: 2, items: 180, accuracy: 98.9, picksHr: 45, errors: 1 },
  { name: 'Luis R.', waves: 3, items: 260, accuracy: 99.6, picksHr: 52, errors: 1 },
];

const ACCURACY_TREND = [
  { day: 'Feb 1', accuracy: 98.8 }, { day: 'Feb 5', accuracy: 99.0 }, { day: 'Feb 10', accuracy: 98.6 },
  { day: 'Feb 15', accuracy: 99.1 }, { day: 'Feb 20', accuracy: 99.4 }, { day: 'Feb 25', accuracy: 98.9 },
  { day: 'Mar 1', accuracy: 99.2 }, { day: 'Mar 4', accuracy: 99.2 },
];

const ZONES = [
  { zone: 'Zone A', total: 480, occupied: 322, util: 67, skus: 145, rebalance: '2026-02-10' },
  { zone: 'Zone B', total: 520, occupied: 437, util: 84, skus: 198, rebalance: '2026-02-15' },
  { zone: 'Zone C', total: 400, occupied: 376, util: 94, skus: 167, rebalance: '2026-01-20' },
  { zone: 'Zone D', total: 600, occupied: 426, util: 71, skus: 212, rebalance: '2026-02-28' },
];

const RECEIVING = [
  { shipment: 'RCV-881', vendor: 'ReliableSupply', expected: 8, arrived: 8, remaining: 0, dock: 'Door 3', status: 'Complete' },
  { shipment: 'RCV-882', vendor: 'FastParts', expected: 12, arrived: 0, remaining: 12, dock: 'Door 1', status: 'Scheduled' },
  { shipment: 'RCV-883', vendor: 'GlobalComponents', expected: 6, arrived: 4, remaining: 2, dock: 'Door 2', status: 'Receiving' },
  { shipment: 'RCV-884', vendor: 'PrecisionMfg', expected: 4, arrived: 0, remaining: 4, dock: 'Door 4', status: 'Scheduled' },
  { shipment: 'RCV-885', vendor: 'QuickShip Asia', expected: 10, arrived: 0, remaining: 10, dock: '--', status: 'Delayed' },
];

const badge = (v: string) => {
  const m: Record<string, string> = {
    'In Progress': 'bg-amber-50 text-amber-600', Completed: 'bg-emerald-50 text-emerald-600',
    Queued: 'bg-violet-50 text-violet-600', Scheduled: 'bg-blue-50 text-blue-600',
    Receiving: 'bg-amber-50 text-amber-600', Complete: 'bg-emerald-50 text-emerald-600',
    Delayed: 'bg-rose-50 text-rose-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

export default function WmsConsole() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ops');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/agents/wms').then(r => r.json())
      .then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const sort = (key: string) => { setSortKey(key); setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'); setExpandedRow(null); };
  const sorted = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv)); return sortDir === 'asc' ? c : -c; }); };
  const arrow = (k: string) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalAction(action); setModalOpen(true);
    const res = await fetch('/api/agents/wms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, zoneData: ZONES, throughputData: HOURLY, ...payload }) });
    const r = await res.json(); setAiResult(r.result || r.error || 'Complete'); setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['ops', 'pickers', 'space', 'receiving'];
  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${sub.includes('best') || sub.includes('↑') ? 'text-emerald-600' : sub.includes('low') || sub.includes('flag') ? 'text-rose-600' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
  const TH = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => sort(k)}>{children}{arrow(k)}</th>
  );

  if (loading) return <div className="p-8 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-3xl">📦</span><div><h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>WMS Console</h1><p className="text-xs text-gray-400">Operations Department</p></div></div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>
      <div className="flex gap-2 border-b border-gray-200">{tabs.map(t => (
        <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          {t === 'ops' ? 'Operations' : t === 'pickers' ? 'Pick Performance' : t === 'space' ? 'Space Map' : 'Receiving'}
        </button>
      ))}</div>

      {tab === 'ops' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Pick Accuracy" value="99.2%" /><KPI label="Orders/Hour" value="47" /><KPI label="Space Utilization" value="82%" /><KPI label="Receiving Backlog" value="14 pallets" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Hourly Throughput (Orders Picked)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={HOURLY}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="hour" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
              <ReferenceLine y={40} stroke="#DC2626" strokeDasharray="5 5" label={{ value: 'Target: 40', position: 'right', fontSize: 10, fill: '#DC2626' }} />
              <Bar dataKey="orders" fill="#2A9D8F" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search waves..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="wave">Wave</TH><TH k="total">Total</TH><TH k="picked">Picked</TH><TH k="remaining">Remaining</TH><TH k="accuracy">Accuracy</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Picker</th><TH k="status">Status</TH>
          </tr></thead><tbody>
            {sorted(WAVES.filter(w => w.wave.toLowerCase().includes(search.toLowerCase()))).map((w, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: '#1B2A4A' }}>{w.wave}</td>
                <td className="px-4 py-3">{w.total}</td><td className="px-4 py-3 font-medium">{w.picked}</td><td className="px-4 py-3">{w.remaining}</td>
                <td className="px-4 py-3 font-bold" style={{ color: w.accuracy >= 99 ? '#059669' : w.accuracy >= 97 ? '#F5920B' : '#DC2626' }}>{w.accuracy > 0 ? `${w.accuracy}%` : '--'}</td>
                <td className="px-4 py-3">{w.picker}</td><td className="px-4 py-3">{badge(w.status)}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const w = sorted(WAVES.filter(wx => wx.wave.toLowerCase().includes(search.toLowerCase())))[expandedRow]; if (!w) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                <div><span className="text-gray-400">Orders:</span> <span className="font-medium">{w.orders}</span></div>
                <div><span className="text-gray-400">Time:</span> <span className="font-medium">{w.elapsed}</span></div>
                <div><span className="text-gray-400">Errors:</span> <span className="font-medium">{w.errors}</span></div>
              </div>
            </div>
          ); })()}
        </div>
      </>}

      {tab === 'pickers' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Today's Accuracy" value="99.2%" /><KPI label="Best Picker" value="Carlos M." sub="best: 99.8%" /><KPI label="Lowest" value="James K." sub="flagged: 96.2%" /><KPI label="Errors Today" value="4" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Pick Accuracy Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ACCURACY_TREND}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" tick={{ fontSize: 10 }} /><YAxis domain={[97, 100]} /><Tooltip />
              <Area type="monotone" dataKey="accuracy" stroke="#2A9D8F" fill="#2A9D8F" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="name">Picker</TH><TH k="waves">Waves</TH><TH k="items">Items</TH><TH k="accuracy">Accuracy</TH><TH k="picksHr">Picks/Hr</TH><TH k="errors">Errors</TH>
          </tr></thead><tbody>
            {sorted(PICKERS).map((p, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${p.accuracy < 97 ? 'bg-rose-50/30' : ''}`}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{p.name}</td><td className="px-4 py-3">{p.waves}</td><td className="px-4 py-3">{p.items}</td>
                <td className="px-4 py-3 font-bold" style={{ color: p.accuracy >= 99 ? '#059669' : p.accuracy >= 97 ? '#F5920B' : '#DC2626' }}>{p.accuracy}%</td>
                <td className="px-4 py-3">{p.picksHr}</td><td className="px-4 py-3 font-bold" style={{ color: p.errors > 2 ? '#DC2626' : '#059669' }}>{p.errors}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600" onClick={() => handleAi('analyze-throughput')}>Analyze Throughput</button>
      </>}

      {tab === 'space' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Total Utilization" value="82%" /><KPI label="Hottest Zone" value="Zone C" sub="94% full" /><KPI label="Coldest Zone" value="Zone A" sub="67% full" /><KPI label="Rebalance Needed" value="Zone C" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Utilization by Zone</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ZONES}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="zone" /><YAxis domain={[0, 100]} /><Tooltip />
              <Bar dataKey="util" name="Utilization %" fill="#F5920B">
                {ZONES.map((z, i) => <rect key={i} fill={z.util > 90 ? '#DC2626' : z.util > 80 ? '#F5920B' : '#2A9D8F'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="zone">Zone</TH><TH k="total">Total Bins</TH><TH k="occupied">Occupied</TH><TH k="util">Utilization</TH><TH k="skus">SKUs</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Last Rebalance</th>
          </tr></thead><tbody>
            {sorted(ZONES).map((z, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${z.util > 90 ? 'bg-rose-50/30' : ''}`}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{z.zone}</td><td className="px-4 py-3">{z.total}</td><td className="px-4 py-3">{z.occupied}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${z.util}%`, background: z.util > 90 ? '#DC2626' : z.util > 80 ? '#F5920B' : '#059669' }} /></div><span className="text-xs font-medium">{z.util}%</span></div></td>
                <td className="px-4 py-3">{z.skus}</td><td className="px-4 py-3 text-gray-500">{z.rebalance}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600" onClick={() => handleAi('slotting-optimization')}>Optimize Slotting</button>
      </>}

      {tab === 'receiving' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Expected Today" value="8 shipments" /><KPI label="Received" value="5" /><KPI label="Backlog" value="14 pallets" /><KPI label="Avg Putaway Time" value="23 min" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="shipment">Shipment</TH><TH k="vendor">Vendor</TH><TH k="expected">Expected</TH><TH k="arrived">Arrived</TH><TH k="remaining">Remaining</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Dock</th><TH k="status">Status</TH>
          </tr></thead><tbody>
            {sorted(RECEIVING).map((r, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${r.status === 'Delayed' ? 'bg-rose-50/30' : ''}`}>
                <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: '#1B2A4A' }}>{r.shipment}</td><td className="px-4 py-3">{r.vendor}</td>
                <td className="px-4 py-3">{r.expected}</td><td className="px-4 py-3 font-medium">{r.arrived}</td><td className="px-4 py-3">{r.remaining}</td>
                <td className="px-4 py-3 text-gray-500">{r.dock}</td><td className="px-4 py-3">{badge(r.status)}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
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
