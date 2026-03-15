'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const COMPETITORS = [
  { name: 'WareTech Pro', share: 18, revenue: '$756M', growth: 15, threat: 'High', move: 'Launched AI picking module', strengths: 'Market leader, deep enterprise relationships, 500+ deployments', weaknesses: 'Slow to innovate, legacy codebase, expensive onboarding' },
  { name: 'AutoStore', share: 15, revenue: '$630M', growth: 18, threat: 'High', move: 'EU expansion — 3 new markets', strengths: 'Robotic ASRS leader, strong brand, capital-efficient', weaknesses: 'Narrow product focus, no WMS layer, high CAPEX' },
  { name: 'LogiSoft', share: 12, revenue: '$504M', growth: 8, threat: 'Medium', move: 'Acquired SmartBin for $45M', strengths: 'Strong mid-market, good integrations, fast deploy', weaknesses: 'Losing enterprise deals, limited AI roadmap, key talent departures' },
  { name: 'FulfillAI', share: 8, revenue: '$336M', growth: 22, threat: 'High', move: 'Series C $120M, 3x valuation', strengths: 'AI-native, fastest growth, strong dev community, modern stack', weaknesses: 'Unproven at scale, narrow vertical focus, high burn rate' },
  { name: 'ShipRight', share: 6, revenue: '$252M', growth: 5, threat: 'Low', move: 'SMB focus — launched starter tier', strengths: 'Low cost, easy setup, large SMB base', weaknesses: 'No enterprise capability, limited customization, thin margins' },
  { name: 'FlexWMS', share: 4, revenue: '$168M', growth: 3, threat: 'Low', move: 'No significant updates', strengths: 'Loyal niche base, stable product', weaknesses: 'Stagnant growth, no innovation, aging platform, founder-dependent' },
];

const MARKET_SHARE = [
  { name: 'WareTech', value: 18 }, { name: 'AutoStore', value: 15 }, { name: 'LogiSoft', value: 12 },
  { name: 'FulfillAI', value: 8 }, { name: 'ShipRight', value: 6 }, { name: 'FlexWMS', value: 4 }, { name: 'Others', value: 37 },
];
const PIE_COLORS = ['#1B2A4A', '#F5920B', '#2A9D8F', '#DC2626', '#059669', '#6366F1', '#9CA3AF'];

const FEATURE_COMPARE = [
  { feature: 'AI Picking', us: 9, waretech: 7, autostore: 3, fulfillai: 8 },
  { feature: 'Integrations', us: 8, waretech: 9, autostore: 4, fulfillai: 6 },
  { feature: 'Ease of Use', us: 8, waretech: 5, autostore: 6, fulfillai: 9 },
  { feature: 'Scalability', us: 7, waretech: 9, autostore: 8, fulfillai: 5 },
  { feature: 'Price/Value', us: 9, waretech: 4, autostore: 3, fulfillai: 7 },
  { feature: 'Support', us: 9, waretech: 6, autostore: 7, fulfillai: 5 },
];

const GROWTH_TREND = [
  { year: '2021', market: 2.8 }, { year: '2022', market: 3.1 }, { year: '2023', market: 3.5 },
  { year: '2024', market: 3.8 }, { year: '2025', market: 4.0 }, { year: '2026', market: 4.2 },
  { year: '2027P', market: 4.7 }, { year: '2028P', market: 5.3 },
];

const TRENDS = [
  { title: 'AI-Powered Picking', impact: 'High', description: 'ML-driven pick path optimization reducing labor 30%. WareTech and FulfillAI leading.', action: 'Accelerate AI picking roadmap, target Q2 beta' },
  { title: 'Micro-Fulfillment Centers', impact: 'High', description: 'Urban MFCs growing 40% YoY. AutoStore dominant. Demand for compact WMS.', action: 'Build MFC-specific configuration template' },
  { title: 'Autonomous Mobile Robots', impact: 'Medium', description: 'AMR market $8B by 2028. Integration-first approach wins over proprietary.', action: 'Partner with 2 AMR vendors for certified integrations' },
  { title: 'Sustainability Tracking', impact: 'Medium', description: 'ESG reporting now required for enterprise RFPs. Carbon footprint per order.', action: 'Add sustainability dashboard module' },
  { title: 'Voice-Directed Warehousing', impact: 'Low', description: 'Mature but evolving with NLU. Being replaced by wearables in some sectors.', action: 'Maintain voice support, invest in wearable integrations' },
];

const REPORTS = [
  { title: 'Q1 2026 Market Analysis', type: 'Quarterly', date: '2026-03-01', author: 'Research AI', views: 24 },
  { title: 'FulfillAI Competitive Brief', type: 'Competitor', date: '2026-02-20', author: 'Steve M.', views: 18 },
  { title: 'WMS Market Sizing 2026', type: 'TAM', date: '2026-02-05', author: 'Research AI', views: 31 },
  { title: 'AI Picking Trend Report', type: 'Trend', date: '2026-01-15', author: 'Research AI', views: 42 },
  { title: 'Competitor Feature Matrix', type: 'Comparison', date: '2026-01-08', author: 'Steve M.', views: 29 },
];

const badge = (v: string) => {
  const m: Record<string, string> = {
    High: 'bg-rose-50 text-rose-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-emerald-50 text-emerald-600', Critical: 'bg-rose-50 text-rose-600',
    Quarterly: 'bg-blue-50 text-blue-600', Competitor: 'bg-violet-50 text-violet-600', TAM: 'bg-emerald-50 text-emerald-600', Trend: 'bg-amber-50 text-amber-600', Comparison: 'bg-gray-100 text-gray-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

export default function ResearchConsole() {
  useTrackConsoleView('research')
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/agents/research').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const sort = (key: string) => { setSortKey(key); setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'); setExpandedRow(null); };
  const sorted = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv)); return sortDir === 'asc' ? c : -c; }); };
  const arrow = (k: string) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalAction(action); setModalOpen(true);
    const res = await fetch('/api/agents/research', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, competitors: COMPETITORS, ...payload }) });
    const r = await res.json(); setAiResult(r.result || r.error || 'Complete'); setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['overview', 'intel', 'trends', 'reports'];
  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className="text-xs mt-1 font-medium text-gray-400">{sub}</p>}
    </div>
  );
  const TH = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => sort(k)}>{children}{arrow(k)}</th>
  );

  if (loading) return <div className="p-8 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-3xl">&#x1F52C;</span><div><h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>Research Console</h1><p className="text-xs text-gray-400">Strategy Department</p></div></div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>
      <div className="flex gap-2 border-b border-gray-200">{tabs.map(t => (
        <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          {t === 'overview' ? 'Market Overview' : t === 'intel' ? 'Competitor Intel' : t === 'trends' ? 'Trends' : 'Reports'}
        </button>
      ))}</div>

      {tab === 'overview' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="TAM" value="$4.2B" sub="12% YoY growth" /><KPI label="Tracked" value="18" /><KPI label="Market Growth" value="12%" /><KPI label="Reports" value="34" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>Market Share Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={MARKET_SHARE} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }: any) => `${name} ${value}%`}>
              {MARKET_SHARE.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search competitors..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="name">Competitor</TH><TH k="share">Share %</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Revenue</th><TH k="growth">Growth %</TH><TH k="threat">Threat</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Recent Move</th>
          </tr></thead><tbody>
            {sorted(COMPETITORS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))).map((c, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 cursor-pointer ${c.threat === 'High' ? 'bg-rose-50/30' : ''}`} onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{c.name}</td>
                <td className="px-4 py-3 font-bold">{c.share}%</td><td className="px-4 py-3">{c.revenue}</td>
                <td className="px-4 py-3 font-bold" style={{ color: c.growth >= 15 ? '#DC2626' : c.growth >= 8 ? '#F5920B' : '#059669' }}>{c.growth}%</td>
                <td className="px-4 py-3">{badge(c.threat)}</td><td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{c.move}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const c = sorted(COMPETITORS.filter(cx => cx.name.toLowerCase().includes(search.toLowerCase())))[expandedRow]; if (!c) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div><span className="text-gray-400">Strengths:</span> <span className="text-gray-700">{c.strengths}</span></div>
                <div><span className="text-gray-400">Weaknesses:</span> <span className="text-gray-700">{c.weaknesses}</span></div>
              </div>
              <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600" onClick={() => handleAi('analyze-competitor', { competitorName: c.name, recentMoves: c.move, strengths: c.strengths, weaknesses: c.weaknesses })}>SWOT Analysis</button>
            </div>
          ); })()}
        </div>
      </>}

      {tab === 'intel' && <>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>Feature Comparison (1-10 Scale)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={FEATURE_COMPARE}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="feature" tick={{ fontSize: 10 }} /><YAxis domain={[0, 10]} /><Tooltip /><Legend />
              <Bar dataKey="us" name="Woulf" fill="#F5920B" /><Bar dataKey="waretech" name="WareTech" fill="#1B2A4A" /><Bar dataKey="autostore" name="AutoStore" fill="#2A9D8F" /><Bar dataKey="fulfillai" name="FulfillAI" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPETITORS.filter(c => c.threat === 'High').map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-bold" style={{ color: '#1B2A4A' }}>{c.name}</h4>{badge(c.threat)}</div>
              <div className="text-xs text-gray-500 mb-1">Share: {c.share}% | Revenue: {c.revenue} | Growth: {c.growth}%</div>
              <div className="text-xs text-gray-600 mb-1"><span className="text-gray-400">Latest:</span> {c.move}</div>
              <div className="text-xs text-gray-600 mb-2"><span className="text-gray-400">Weak:</span> {c.weaknesses}</div>
              <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600" onClick={() => handleAi('analyze-competitor', { competitorName: c.name, recentMoves: c.move, strengths: c.strengths, weaknesses: c.weaknesses })}>Generate SWOT</button>
            </div>
          ))}
        </div>
      </>}

      {tab === 'trends' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Emerging Trends" value="5" /><KPI label="Opportunities" value="8" /><KPI label="Threats" value="3" /><KPI label="Market Shifts" value="2" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>WMS Market Size ($B)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={GROWTH_TREND}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis domain={[2, 6]} /><Tooltip />
              <Line type="monotone" dataKey="market" stroke="#2A9D8F" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {TRENDS.map((t, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1"><h4 className="text-sm font-bold" style={{ color: '#1B2A4A' }}>{t.title}</h4>{badge(t.impact)}</div>
              <p className="text-xs text-gray-600 mb-1">{t.description}</p>
              <p className="text-xs"><span className="text-gray-400">Action:</span> <span className="font-medium text-orange-600">{t.action}</span></p>
            </div>
          ))}
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600" onClick={() => handleAi('trend-alert')}>Identify Trends</button>
      </>}

      {tab === 'reports' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="This Month" value="3" /><KPI label="Total Library" value="34" /><KPI label="Most Viewed" value="AI Picking" /><KPI label="Pending" value="1" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="title">Report</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Type</th><TH k="date">Date</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Author</th><TH k="views">Views</TH>
          </tr></thead><tbody>
            {sorted(REPORTS).map((r, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{r.title}</td>
                <td className="px-4 py-3">{badge(r.type)}</td><td className="px-4 py-3 text-gray-500">{r.date}</td>
                <td className="px-4 py-3 text-gray-500">{r.author}</td><td className="px-4 py-3 font-bold">{r.views}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600" onClick={() => handleAi('market-report')}>Generate Market Report</button>
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
