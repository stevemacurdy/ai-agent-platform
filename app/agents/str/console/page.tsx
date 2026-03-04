'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PROPERTIES = [
  { name: 'Mountain View Cabin', location: 'Park City', occ: 45, rate: 185, revenue: 2497, rating: 4.6, status: 'Active', reviews: 'Great views, cozy fireplace. Some noted dated kitchen.', rateHistory: '$165-$210 seasonal', calendar: '12 bookings next 30d' },
  { name: 'Downtown Loft', location: 'SLC', occ: 88, rate: 129, revenue: 3406, rating: 4.8, status: 'Active', reviews: 'Perfect location, modern design. Walking distance to everything.', rateHistory: '$115-$145 seasonal', calendar: '26 bookings next 30d' },
  { name: 'Lakefront Suite', location: 'Bear Lake', occ: 62, rate: 210, revenue: 3906, rating: 3.2, status: 'Active', reviews: '4 reviews cite cleanliness issues. Dock access loved.', rateHistory: '$180-$260 seasonal', calendar: '18 bookings next 30d' },
  { name: 'Ski Chalet', location: 'Brighton', occ: 91, rate: 275, revenue: 7507, rating: 4.9, status: 'Active', reviews: 'Ski-in/ski-out perfection. Best hot tub views in Utah.', rateHistory: '$225-$350 seasonal', calendar: '28 bookings next 30d' },
  { name: 'Desert Retreat', location: 'Moab', occ: 55, rate: 165, revenue: 2722, rating: 4.4, status: 'Active', reviews: 'Stunning red rock views. Remote but worth it.', rateHistory: '$140-$195 seasonal', calendar: '15 bookings next 30d' },
  { name: 'Family Townhouse', location: 'Draper', occ: 78, rate: 145, revenue: 3393, rating: 4.5, status: 'Maintenance', reviews: 'Great for families. Garage a plus. HVAC repair in progress.', rateHistory: '$125-$165 seasonal', calendar: 'Blocked for repairs' },
];

const OCC_TREND = [
  { month: 'Apr', cabin: 38, loft: 82, lake: 48, chalet: 35, desert: 62, town: 75 },
  { month: 'May', cabin: 42, loft: 85, lake: 55, chalet: 28, desert: 70, town: 78 },
  { month: 'Jun', cabin: 55, loft: 90, lake: 72, chalet: 22, desert: 78, town: 80 },
  { month: 'Jul', cabin: 68, loft: 88, lake: 85, chalet: 18, desert: 82, town: 82 },
  { month: 'Aug', cabin: 65, loft: 87, lake: 80, chalet: 20, desert: 75, town: 80 },
  { month: 'Sep', cabin: 52, loft: 84, lake: 65, chalet: 25, desert: 68, town: 76 },
  { month: 'Oct', cabin: 48, loft: 82, lake: 52, chalet: 40, desert: 55, town: 72 },
  { month: 'Nov', cabin: 42, loft: 80, lake: 35, chalet: 72, desert: 42, town: 70 },
  { month: 'Dec', cabin: 75, loft: 92, lake: 30, chalet: 95, desert: 38, town: 85 },
  { month: 'Jan', cabin: 70, loft: 90, lake: 25, chalet: 93, desert: 35, town: 82 },
  { month: 'Feb', cabin: 60, loft: 89, lake: 40, chalet: 92, desert: 45, town: 78 },
  { month: 'Mar', cabin: 45, loft: 88, lake: 62, chalet: 91, desert: 55, town: 78 },
];

const REVENUE_MONTHLY = [
  { month: 'Apr', total: 28400 }, { month: 'May', total: 31200 }, { month: 'Jun', total: 36800 },
  { month: 'Jul', total: 41200 }, { month: 'Aug', total: 39500 }, { month: 'Sep', total: 35100 },
  { month: 'Oct', total: 32400 }, { month: 'Nov', total: 30800 }, { month: 'Dec', total: 42600 },
  { month: 'Jan', total: 40200 }, { month: 'Feb', total: 37800 }, { month: 'Mar', total: 34200 },
];

const REVENUE_BY_PROP = [
  { name: 'Ski Chalet', gross: 90084, expenses: 45042, noi: 45042, margin: 50, yoy: 12 },
  { name: 'Lakefront Suite', gross: 46872, expenses: 30472, noi: 16400, margin: 35, yoy: -4 },
  { name: 'Downtown Loft', gross: 40872, expenses: 20436, noi: 20436, margin: 50, yoy: 8 },
  { name: 'Family Townhouse', gross: 40716, expenses: 26465, noi: 14251, margin: 35, yoy: 3 },
  { name: 'Desert Retreat', gross: 32664, expenses: 19598, noi: 13066, margin: 40, yoy: -2 },
  { name: 'Mountain View Cabin', gross: 29964, expenses: 19477, noi: 10487, margin: 35, yoy: -8 },
];

const MARKET_COMP = [
  { property: 'Mountain View Cabin', yourRate: 185, mktRate: 195, yourOcc: 45, mktOcc: 68, yourRating: 4.6, mktRating: 4.3 },
  { property: 'Downtown Loft', yourRate: 129, mktRate: 142, yourOcc: 88, mktOcc: 79, yourRating: 4.8, mktRating: 4.2 },
  { property: 'Lakefront Suite', yourRate: 210, mktRate: 198, yourOcc: 62, mktOcc: 71, yourRating: 3.2, mktRating: 4.1 },
  { property: 'Ski Chalet', yourRate: 275, mktRate: 260, yourOcc: 91, mktOcc: 82, yourRating: 4.9, mktRating: 4.4 },
  { property: 'Desert Retreat', yourRate: 165, mktRate: 175, yourOcc: 55, mktOcc: 64, yourRating: 4.4, mktRating: 4.2 },
  { property: 'Family Townhouse', yourRate: 145, mktRate: 138, yourOcc: 78, mktOcc: 74, yourRating: 4.5, mktRating: 4.0 },
];

const badge = (v: string) => {
  const m: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-600', Maintenance: 'bg-amber-50 text-amber-600', Listed: 'bg-blue-50 text-blue-600', Unlisted: 'bg-gray-100 text-gray-500', Seasonal: 'bg-violet-50 text-violet-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

const stars = (n: number) => {
  const color = n >= 4.5 ? '#059669' : n >= 3.5 ? '#F5920B' : '#DC2626';
  return <span className="font-bold" style={{ color }}>{n} &#9733;</span>;
};

export default function STRConsole() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('portfolio');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/agents/str').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const sort = (key: string) => { setSortKey(key); setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'); setExpandedRow(null); };
  const sorted = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv)); return sortDir === 'asc' ? c : -c; }); };
  const arrow = (k: string) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalAction(action); setModalOpen(true);
    const res = await fetch('/api/agents/str', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, propertyData: PROPERTIES, ...payload }) });
    const r = await res.json(); setAiResult(r.result || r.error || 'Complete'); setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['portfolio', 'occupancy', 'revenue', 'market'];
  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${sub.includes('down') || sub.includes('below') ? 'text-rose-600' : sub.includes('up') ? 'text-emerald-600' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
  const TH = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => sort(k)}>{children}{arrow(k)}</th>
  );

  if (loading) return <div className="p-8 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-3xl">&#x1F3E0;</span><div><h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>STR Analyst Console</h1><p className="text-xs text-gray-400">Strategy Department</p></div></div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>
      <div className="flex gap-2 border-b border-gray-200">{tabs.map(t => (
        <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          {t === 'portfolio' ? 'Portfolio' : t === 'occupancy' ? 'Occupancy' : t === 'revenue' ? 'Revenue' : 'Market Comp'}
        </button>
      ))}</div>

      {tab === 'portfolio' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Portfolio Value" value="$2.8M" /><KPI label="Avg Occupancy" value="72%" sub="down 4%" /><KPI label="Monthly Revenue" value="$34,200" /><KPI label="RevPAR" value="$142" />
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="name">Property</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Location</th><TH k="occ">Occ %</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Rate</th><TH k="revenue">Revenue</TH><TH k="rating">Rating</TH><TH k="status">Status</TH>
          </tr></thead><tbody>
            {sorted(PROPERTIES.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))).map((p, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 cursor-pointer ${p.occ < 50 ? 'bg-rose-50/30' : ''}`} onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{p.name}</td><td className="px-4 py-3 text-gray-500">{p.location}</td>
                <td className="px-4 py-3 font-bold" style={{ color: p.occ >= 80 ? '#059669' : p.occ >= 60 ? '#F5920B' : '#DC2626' }}>{p.occ}%</td>
                <td className="px-4 py-3">${p.rate}</td>
                <td className="px-4 py-3 font-medium">${p.revenue.toLocaleString()}</td>
                <td className="px-4 py-3">{stars(p.rating)}</td>
                <td className="px-4 py-3">{badge(p.status)}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const p = sorted(PROPERTIES.filter(px => px.name.toLowerCase().includes(search.toLowerCase()) || px.location.toLowerCase().includes(search.toLowerCase())))[expandedRow]; if (!p) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div><span className="text-gray-400">Calendar:</span> <span className="font-medium">{p.calendar}</span></div>
                <div><span className="text-gray-400">Rate History:</span> <span className="font-medium">{p.rateHistory}</span></div>
                <div className="col-span-2"><span className="text-gray-400">Reviews:</span> <span className="font-medium">{p.reviews}</span></div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600" onClick={() => handleAi('pricing-optimization', { propertyData: [p] })}>Optimize Pricing</button>
                <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600" onClick={() => handleAi('review-analysis', { propertyName: p.name, reviews: p.reviews })}>Review Analysis</button>
              </div>
            </div>
          ); })()}
        </div>
      </>}

      {tab === 'occupancy' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Peak Month" value="Dec 89%" /><KPI label="Lowest Month" value="Apr 54%" /><KPI label="Trend" value="down 4%" sub="down vs LY" /><KPI label="Seasonal Adj" value="3 props" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>Occupancy Trend by Property</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={OCC_TREND}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} /><Tooltip /><Legend />
              <Line type="monotone" dataKey="chalet" name="Ski Chalet" stroke="#1B2A4A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="loft" name="Downtown Loft" stroke="#F5920B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="town" name="Townhouse" stroke="#2A9D8F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="lake" name="Lakefront" stroke="#6366F1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="desert" name="Desert" stroke="#059669" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cabin" name="Cabin" stroke="#DC2626" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Property</th>
            {OCC_TREND.map(m => <th key={m.month} className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400">{m.month}</th>)}
          </tr></thead><tbody>
            {[{ name: 'Ski Chalet', key: 'chalet' }, { name: 'Downtown Loft', key: 'loft' }, { name: 'Family Townhouse', key: 'town' }, { name: 'Lakefront Suite', key: 'lake' }, { name: 'Desert Retreat', key: 'desert' }, { name: 'Mountain View Cabin', key: 'cabin' }].map((p, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium text-xs" style={{ color: '#1B2A4A' }}>{p.name}</td>
                {OCC_TREND.map(m => { const v = (m as any)[p.key]; return <td key={m.month} className="px-2 py-2 text-center"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${v >= 80 ? 'bg-emerald-100 text-emerald-700' : v >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{v}%</span></td>; })}
              </tr>
            ))}
          </tbody></table>
        </div>
      </>}

      {tab === 'revenue' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Annual Revenue" value="$410K" /><KPI label="Total Expenses" value="$248K" /><KPI label="NOI" value="$162K" /><KPI label="NOI Margin" value="39%" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>Portfolio Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={REVENUE_MONTHLY}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis /><Tooltip formatter={(v: any) => '$' + Number(v).toLocaleString()} />
              <Area type="monotone" dataKey="total" stroke="#F5920B" fill="#F5920B" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="name">Property</TH><TH k="gross">Gross</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Expenses</th><TH k="noi">NOI</TH><TH k="margin">Margin</TH><TH k="yoy">YoY</TH>
          </tr></thead><tbody>
            {sorted(REVENUE_BY_PROP).map((r, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{r.name}</td>
                <td className="px-4 py-3">${r.gross.toLocaleString()}</td><td className="px-4 py-3 text-gray-500">${r.expenses.toLocaleString()}</td>
                <td className="px-4 py-3 font-bold" style={{ color: '#059669' }}>${r.noi.toLocaleString()}</td>
                <td className="px-4 py-3">{r.margin}%</td>
                <td className="px-4 py-3 font-bold" style={{ color: r.yoy >= 0 ? '#059669' : '#DC2626' }}>{r.yoy > 0 ? '+' : ''}{r.yoy}%</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </>}

      {tab === 'market' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Above Market Rate" value="2" /><KPI label="Below Market Rate" value="3" sub="below market" /><KPI label="Above Mkt Occ" value="2" /><KPI label="Position" value="Average" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>Your Rate vs Market Average</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MARKET_COMP}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="property" tick={{ fontSize: 9 }} /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="yourRate" name="Your Rate" fill="#F5920B" /><Bar dataKey="mktRate" name="Market Avg" fill="#9CA3AF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Property</th><th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Your Rate</th><th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Mkt Rate</th><th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Your Occ</th><th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Mkt Occ</th><th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Your &#9733;</th><th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Mkt &#9733;</th>
          </tr></thead><tbody>
            {MARKET_COMP.map((c, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{c.property}</td>
                <td className="px-3 py-3 text-center font-bold" style={{ color: c.yourRate >= c.mktRate ? '#F5920B' : '#059669' }}>${c.yourRate}</td>
                <td className="px-3 py-3 text-center text-gray-500">${c.mktRate}</td>
                <td className="px-3 py-3 text-center font-bold" style={{ color: c.yourOcc >= c.mktOcc ? '#059669' : '#DC2626' }}>{c.yourOcc}%</td>
                <td className="px-3 py-3 text-center text-gray-500">{c.mktOcc}%</td>
                <td className="px-3 py-3 text-center font-bold" style={{ color: c.yourRating >= c.mktRating ? '#059669' : '#DC2626' }}>{c.yourRating}</td>
                <td className="px-3 py-3 text-center text-gray-500">{c.mktRating}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const c = MARKET_COMP[expandedRow]; if (!c) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600" onClick={() => handleAi('market-comparison', { propertyName: c.property, location: PROPERTIES.find(p => p.name.includes(c.property.split(' ')[0]))?.location || 'Utah' })}>Run Market Comparison</button>
            </div>
          ); })()}
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
