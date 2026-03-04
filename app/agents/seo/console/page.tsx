'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const RANKINGS = [
  { keyword: 'warehouse management software', pos: 14, prev: 8, vol: 4400, diff: 72, url: '/solutions/wms', serpFeatures: 'Featured Snippet, People Also Ask', competitors: 'SAP, Oracle, Manhattan Associates' },
  { keyword: 'AI warehouse automation', pos: 4, prev: 7, vol: 2400, diff: 45, url: '/solutions/automation', serpFeatures: 'Video Carousel', competitors: 'Locus Robotics, 6 River Systems' },
  { keyword: 'WMS comparison', pos: 11, prev: 15, vol: 1800, diff: 58, url: '/blog/wms-comparison', serpFeatures: 'People Also Ask, Featured Snippet', competitors: 'G2, Capterra, SelectHub' },
  { keyword: '3PL software', pos: 22, prev: 28, vol: 3200, diff: 65, url: '/solutions/3pl', serpFeatures: 'None', competitors: 'ShipBob, Extensiv, Deposco' },
  { keyword: 'inventory management AI', pos: 6, prev: 9, vol: 1600, diff: 41, url: '/blog/ai-inventory', serpFeatures: 'People Also Ask', competitors: 'NetSuite, Fishbowl, Cin7' },
  { keyword: 'supply chain optimization', pos: 31, prev: 35, vol: 2800, diff: 78, url: '/blog/supply-chain', serpFeatures: 'Knowledge Panel', competitors: 'McKinsey, Gartner, Blue Yonder' },
];

const TRAFFIC_TREND = [
  { month: 'Oct', traffic: 28400 }, { month: 'Nov', traffic: 30100 }, { month: 'Dec', traffic: 29800 },
  { month: 'Jan', traffic: 33200 }, { month: 'Feb', traffic: 35600 }, { month: 'Mar', traffic: 38400 },
];

const OPPORTUNITIES = [
  { keyword: 'warehouse robotics ROI', vol: 1400, diff: 32, estTraffic: 420, action: 'Create new post', gap: 'No coverage' },
  { keyword: 'pallet racking systems guide', vol: 2200, diff: 28, estTraffic: 660, action: 'Create pillar page', gap: 'No coverage' },
  { keyword: 'conveyor system maintenance', vol: 900, diff: 22, estTraffic: 270, action: 'Create how-to guide', gap: 'No coverage' },
  { keyword: 'warehouse safety compliance', vol: 1800, diff: 35, estTraffic: 540, action: 'Create checklist post', gap: 'Thin content' },
  { keyword: 'order fulfillment best practices', vol: 3100, diff: 52, estTraffic: 930, action: 'Expand existing post', gap: 'Weak coverage' },
  { keyword: 'cold storage warehouse design', vol: 800, diff: 24, estTraffic: 240, action: 'Create case study', gap: 'No coverage' },
  { keyword: 'warehouse labor optimization', vol: 1200, diff: 38, estTraffic: 360, action: 'Create whitepaper', gap: 'No coverage' },
  { keyword: 'ecommerce fulfillment center', vol: 4200, diff: 68, estTraffic: 1260, action: 'Long-term campaign', gap: 'No coverage' },
];

const AUDIT_ISSUES = [
  { page: '/solutions/wms', issue: 'Missing Meta Description', severity: 'High', status: 'Open' },
  { page: '/blog/old-warehouse-tips', issue: 'Slow Load (4.2s)', severity: 'Critical', status: 'Open' },
  { page: '/case-studies/acme', issue: 'Broken Link (404)', severity: 'High', status: 'Open' },
  { page: '/solutions/automation', issue: 'No Alt Text (3 images)', severity: 'Medium', status: 'Open' },
  { page: '/about', issue: 'Missing H1 Tag', severity: 'Medium', status: 'Open' },
  { page: '/blog/racking-guide', issue: 'Duplicate Title Tag', severity: 'High', status: 'Open' },
  { page: '/pricing', issue: 'Missing Schema Markup', severity: 'Low', status: 'Open' },
];

const CONTENT_GAPS = [
  { topic: 'Warehouse Automation', us: 4, comp1: 12, comp2: 9, comp3: 8, traffic: 18400, diff: 55 },
  { topic: 'Inventory Management', us: 6, comp1: 14, comp2: 11, comp3: 7, traffic: 22100, diff: 48 },
  { topic: 'Order Fulfillment', us: 2, comp1: 8, comp2: 10, comp3: 6, traffic: 15600, diff: 42 },
  { topic: 'Supply Chain', us: 3, comp1: 11, comp2: 8, comp3: 9, traffic: 19800, diff: 62 },
  { topic: 'WMS Features', us: 5, comp1: 7, comp2: 6, comp3: 4, traffic: 12300, diff: 38 },
];

const badge = (v: string) => {
  const m: Record<string, string> = {
    Critical: 'bg-rose-50 text-rose-600', High: 'bg-amber-50 text-amber-600',
    Medium: 'bg-blue-50 text-blue-600', Low: 'bg-gray-100 text-gray-500',
    Open: 'bg-blue-50 text-blue-600', Fixed: 'bg-emerald-50 text-emerald-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

export default function SeoConsole() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('rankings');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/agents/seo').then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const sort = (key: string) => {
    setSortKey(key);
    setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc');
    setExpandedRow(null);
  };
  const sorted = (rows: any[]) => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? c : -c;
    });
  };
  const arrow = (k: string) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalAction(action); setModalOpen(true);
    const res = await fetch('/api/agents/seo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, rankings: RANKINGS, siteData: { pages: 342, issues: AUDIT_ISSUES.length, mobileScore: 82 }, ...payload }),
    });
    const r = await res.json();
    setAiResult(r.result || r.error || 'Complete');
    setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['rankings', 'opportunities', 'audit', 'gaps'];

  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${sub.includes('+') || sub.includes('↑') || sub.includes('improv') ? 'text-emerald-600' : sub.includes('-') || sub.includes('↓') ? 'text-rose-600' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );

  const TH = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-gray-600"
      onClick={() => sort(k)}>{children}{arrow(k)}</th>
  );

  if (loading) return (
    <div className="p-8 space-y-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔎</span>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>SEO Console</h1>
            <p className="text-xs text-gray-400">Sales Department</p>
          </div>
        </div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t === 'rankings' ? 'Rankings' : t === 'opportunities' ? 'Opportunities' : t === 'audit' ? 'Technical Audit' : 'Content Gaps'}
          </button>
        ))}
      </div>

      {tab === 'rankings' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Organic Traffic" value="38,400/mo" sub="↑ 14% vs last month" />
          <KPI label="Keywords in Top 10" value="142" sub="↑ +8" />
          <KPI label="Domain Authority" value="47" sub="↑ +2" />
          <KPI label="Avg Position" value="18.3" sub="improving" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Organic Traffic Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TRAFFIC_TREND}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="traffic" stroke="#2A9D8F" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search keywords..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="keyword">Keyword</TH><TH k="pos">Position</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Change</th>
              <TH k="vol">Volume</TH><TH k="diff">Difficulty</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">URL</th>
            </tr></thead>
            <tbody>
              {sorted(RANKINGS.filter(r => r.keyword.toLowerCase().includes(search.toLowerCase()))).map((r, i) => {
                const change = r.prev - r.pos;
                return (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                    <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{r.keyword}</td>
                    <td className="px-4 py-3 font-bold">#{r.pos}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${change > 0 ? 'bg-emerald-50 text-emerald-600' : change < 0 ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-500'}`}>
                        {change > 0 ? `+${change}` : change}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.vol.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.diff}%`, background: r.diff > 60 ? '#DC2626' : r.diff > 40 ? '#F5920B' : '#059669' }} />
                        </div>
                        <span className="text-xs">{r.diff}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.url}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {expandedRow !== null && (() => {
            const r = sorted(RANKINGS.filter(rx => rx.keyword.toLowerCase().includes(search.toLowerCase())))[expandedRow];
            if (!r) return null;
            return (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                  <div><span className="text-gray-400">SERP Features:</span> <span className="font-medium">{r.serpFeatures}</span></div>
                  <div><span className="text-gray-400">Competitors:</span> <span className="font-medium">{r.competitors}</span></div>
                </div>
                <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600"
                  onClick={() => handleAi('content-brief', { keyword: r.keyword, searchVolume: r.vol, difficulty: r.diff })}>Generate Brief</button>
              </div>
            );
          })()}
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          onClick={() => handleAi('analyze-rankings')}>Analyze All Rankings</button>
      </>}

      {tab === 'opportunities' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Untapped Keywords" value="47" />
          <KPI label="Low Competition" value="12" sub="Difficulty under 35" />
          <KPI label="Quick Wins" value="8" sub="Near page 1" />
          <KPI label="Est. Traffic Gain" value="12K/mo" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="keyword">Keyword</TH><TH k="vol">Volume</TH><TH k="diff">Difficulty</TH>
              <TH k="estTraffic">Est. Traffic</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Gap</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Action</th>
            </tr></thead>
            <tbody>
              {sorted(OPPORTUNITIES).map((o, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{o.keyword}</td>
                  <td className="px-4 py-3">{o.vol.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${o.diff}%`, background: o.diff > 50 ? '#DC2626' : o.diff > 30 ? '#F5920B' : '#059669' }} />
                      </div>
                      <span className="text-xs">{o.diff}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-600">+{o.estTraffic.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{o.gap}</td>
                  <td className="px-4 py-3">
                    <button className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600"
                      onClick={e => { e.stopPropagation(); handleAi('content-brief', { keyword: o.keyword, searchVolume: o.vol, difficulty: o.diff }); }}>
                      Generate Brief
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}

      {tab === 'audit' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Pages Crawled" value="342" />
          <KPI label="Issues Found" value="47" sub="12 critical" />
          <KPI label="Mobile Score" value="82/100" />
          <KPI label="Core Web Vitals" value="Needs Work" sub="LCP 3.1s" />
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
          onClick={() => handleAi('audit')}>Run AI Audit</button>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="page">Page</TH><TH k="issue">Issue</TH><TH k="severity">Severity</TH>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
            </tr></thead>
            <tbody>
              {sorted(AUDIT_ISSUES).map((a, i) => (
                <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${a.severity === 'Critical' ? 'bg-rose-50/30' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: '#1B2A4A' }}>{a.page}</td>
                  <td className="px-4 py-3">{a.issue}</td>
                  <td className="px-4 py-3">{badge(a.severity)}</td>
                  <td className="px-4 py-3">{badge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}

      {tab === 'gaps' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Topics Analyzed" value="24" />
          <KPI label="Coverage Gaps" value="18" />
          <KPI label="Potential Traffic" value="88K/mo" />
          <KPI label="Our Avg Articles" value="4" sub="vs competitor avg 9" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Content Coverage: Us vs Competitors</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={CONTENT_GAPS}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="topic" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="us" fill="#F5920B" name="Us" />
              <Bar dataKey="comp1" fill="#3B82F6" name="Competitor 1" />
              <Bar dataKey="comp2" fill="#8B5CF6" name="Competitor 2" />
              <Bar dataKey="comp3" fill="#DC2626" name="Competitor 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="topic">Topic</TH><TH k="us">Our Articles</TH><TH k="comp1">Comp 1</TH>
              <TH k="traffic">Traffic Value</TH><TH k="diff">Difficulty</TH>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Action</th>
            </tr></thead>
            <tbody>
              {sorted(CONTENT_GAPS).map((g, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{g.topic}</td>
                  <td className="px-4 py-3">{g.us}</td>
                  <td className="px-4 py-3 font-medium text-blue-600">{g.comp1}</td>
                  <td className="px-4 py-3">{g.traffic.toLocaleString()}</td>
                  <td className="px-4 py-3">{g.diff}</td>
                  <td className="px-4 py-3">
                    <button className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600"
                      onClick={() => handleAi('content-brief', { keyword: g.topic, searchVolume: g.traffic, difficulty: g.diff })}>
                      Create Brief
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>
                {modalAction.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </h3>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setModalOpen(false)}>&#x2715;</button>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-3 py-8">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Analyzing...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiResult}</div>
            )}
            {!aiLoading && aiResult && (
              <button className="mt-4 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200"
                onClick={() => navigator.clipboard.writeText(aiResult)}>Copy to Clipboard</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
