'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const CAMPAIGNS = [
  { name: 'Warehouse Automation Guide', channel: 'Organic', spend: 0, leads: 89, cpl: 0, convRate: 4.8, roi: 1200, status: 'active', startDate: '2026-01-05', clicks: 3240, impressions: 28400 },
  { name: 'LinkedIn Retargeting', channel: 'Paid Social', spend: 4200, leads: 78, cpl: 54, convRate: 2.1, roi: 340, status: 'active', startDate: '2026-02-01', clicks: 1840, impressions: 42000 },
  { name: 'Google Search — WMS', channel: 'Paid Search', spend: 6800, leads: 42, cpl: 162, convRate: 1.4, roi: 180, status: 'active', startDate: '2026-01-15', clicks: 920, impressions: 18600 },
  { name: 'Email Nurture Q1', channel: 'Email', spend: 200, leads: 34, cpl: 6, convRate: 5.2, roi: 890, status: 'active', startDate: '2026-01-01', clicks: 2100, impressions: 8400 },
  { name: 'Trade Show Follow-Up', channel: 'Events', spend: 12000, leads: 28, cpl: 429, convRate: 8.1, roi: 95, status: 'completed', startDate: '2025-11-10', clicks: 0, impressions: 0 },
];

const CHANNEL_DATA = [
  { channel: 'Organic', spend: 0, leads: 89, pct: 35 },
  { channel: 'Paid Search', spend: 6800, leads: 42, pct: 28 },
  { channel: 'Paid Social', spend: 4200, leads: 78, pct: 18 },
  { channel: 'Email', spend: 200, leads: 34, pct: 12 },
  { channel: 'Events', spend: 12000, leads: 28, pct: 7 },
];
const PIE_COLORS = ['#2A9D8F', '#F5920B', '#3B82F6', '#8B5CF6', '#DC2626'];

const MQL_TREND = [
  { week: 'W1', mqls: 48 }, { week: 'W2', mqls: 52 }, { week: 'W3', mqls: 44 },
  { week: 'W4', mqls: 61 }, { week: 'W5', mqls: 55 }, { week: 'W6', mqls: 58 },
  { week: 'W7', mqls: 63 }, { week: 'W8', mqls: 49 }, { week: 'W9', mqls: 67 },
  { week: 'W10', mqls: 72 }, { week: 'W11', mqls: 59 }, { week: 'W12', mqls: 78 },
];

const LEADS = [
  { name: 'Jason Torres', company: 'Summit Logistics', source: 'Organic', date: '2026-03-02', status: 'New' },
  { name: 'Rachel Kim', company: 'FastTrack 3PL', source: 'LinkedIn', date: '2026-03-01', status: 'Contacted' },
  { name: 'David Chen', company: 'Alpine Distribution', source: 'Google Ads', date: '2026-02-28', status: 'Qualified' },
  { name: 'Maria Lopez', company: 'Harbor Freight Co', source: 'Email', date: '2026-02-27', status: 'Converted' },
  { name: 'Brian Walsh', company: 'Metro Warehousing', source: 'Organic', date: '2026-02-26', status: 'New' },
];

const CONTENT = [
  { title: 'Warehouse Automation Guide', type: 'Whitepaper', views: 8420, leads: 89, convRate: 1.06, updated: '2026-02-15' },
  { title: '5 Signs You Need a WMS', type: 'Blog', views: 6200, leads: 34, convRate: 0.55, updated: '2026-02-20' },
  { title: 'ROI of 3PL Partnerships', type: 'Blog', views: 4100, leads: 22, convRate: 0.54, updated: '2026-01-28' },
  { title: 'Supply Chain Webinar', type: 'Webinar', views: 1200, leads: 18, convRate: 1.50, updated: '2026-02-10' },
  { title: 'Conveyor Systems Explained', type: 'Video', views: 3400, leads: 12, convRate: 0.35, updated: '2026-01-15' },
  { title: 'Inventory Best Practices', type: 'Blog', views: 5800, leads: 28, convRate: 0.48, updated: '2026-02-25' },
];

const badge = (v: string) => {
  const m: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-600', completed: 'bg-blue-50 text-blue-600',
    paused: 'bg-amber-50 text-amber-600', draft: 'bg-violet-50 text-violet-600',
    New: 'bg-blue-50 text-blue-600', Contacted: 'bg-amber-50 text-amber-600',
    Qualified: 'bg-violet-50 text-violet-600', Converted: 'bg-emerald-50 text-emerald-600',
    Whitepaper: 'bg-violet-50 text-violet-600', Blog: 'bg-blue-50 text-blue-600',
    Video: 'bg-amber-50 text-amber-600', Webinar: 'bg-emerald-50 text-emerald-600',
    Organic: 'bg-emerald-50 text-emerald-600', 'Paid Search': 'bg-amber-50 text-amber-600',
    'Paid Social': 'bg-blue-50 text-blue-600', Email: 'bg-violet-50 text-violet-600',
    Events: 'bg-rose-50 text-rose-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

export default function MarketingConsole() {
  useTrackConsoleView('marketing')
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('campaigns');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/agents/marketing').then(r => r.json())
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
    const res = await fetch('/api/agents/marketing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, campaigns: CAMPAIGNS, ...payload }),
    });
    const r = await res.json();
    setAiResult(r.result || r.error || 'Complete');
    setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['campaigns', 'channels', 'leads', 'content'];

  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${sub.includes('+') || sub.includes('↑') ? 'text-emerald-600' : sub.includes('-') || sub.includes('↓') ? 'text-rose-600' : 'text-gray-400'}`}>{sub}</p>}
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
          <span className="text-3xl">📣</span>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>Marketing Console</h1>
            <p className="text-xs text-gray-400">Sales Department</p>
          </div>
        </div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t === 'campaigns' ? 'Campaigns' : t === 'channels' ? 'Channel Mix' : t === 'leads' ? 'Lead Gen' : 'Content'}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="MQLs This Month" value="234" sub="↑ 18% vs last month" />
          <KPI label="Cost Per Lead" value="$24" sub="↓ 8% improvement" />
          <KPI label="Website Traffic" value="45,200" sub="↑ 12%" />
          <KPI label="Conversion Rate" value="3.2%" sub="↑ +0.4%" />
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search campaigns..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="name">Campaign</TH><TH k="channel">Channel</TH><TH k="spend">Spend</TH>
              <TH k="leads">Leads</TH><TH k="cpl">CPL</TH><TH k="roi">ROI %</TH><TH k="status">Status</TH>
            </tr></thead>
            <tbody>
              {sorted(CAMPAIGNS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))).map((c, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{c.name}</td>
                  <td className="px-4 py-3">{badge(c.channel)}</td>
                  <td className="px-4 py-3">{c.spend > 0 ? `$${c.spend.toLocaleString()}` : 'Free'}</td>
                  <td className="px-4 py-3 font-medium">{c.leads}</td>
                  <td className="px-4 py-3">{c.cpl > 0 ? `$${c.cpl}` : '$0'}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: c.roi > 500 ? '#059669' : c.roi > 200 ? '#F5920B' : '#DC2626' }}>{c.roi}%</td>
                  <td className="px-4 py-3">{badge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {expandedRow !== null && expandedRow < CAMPAIGNS.length && (() => {
            const c = sorted(CAMPAIGNS.filter(cx => cx.name.toLowerCase().includes(search.toLowerCase())))[expandedRow];
            if (!c) return null;
            return (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="grid grid-cols-4 gap-4 text-xs mb-3">
                  <div><span className="text-gray-400">Clicks:</span> <span className="font-medium">{c.clicks.toLocaleString()}</span></div>
                  <div><span className="text-gray-400">Impressions:</span> <span className="font-medium">{c.impressions.toLocaleString()}</span></div>
                  <div><span className="text-gray-400">Conv Rate:</span> <span className="font-medium">{c.convRate}%</span></div>
                  <div><span className="text-gray-400">Started:</span> <span className="font-medium">{c.startDate}</span></div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600"
                    onClick={() => handleAi('generate-copy', { campaignName: c.name, channel: c.channel })}>Generate Copy</button>
                  <button className="px-3 py-1.5 bg-violet-500 text-white rounded-lg text-xs font-medium hover:bg-violet-600"
                    onClick={() => handleAi('ab-test-plan', { campaignName: c.name })}>Design A/B Test</button>
                </div>
              </div>
            );
          })()}
        </div>
      </>}

      {tab === 'channels' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Best Channel" value="Organic" sub="$0 CPL" />
          <KPI label="Worst Channel" value="Events" sub="$429 CPL" />
          <KPI label="Total Spend" value="$23,200" />
          <KPI label="Total Leads" value="271" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold mb-4" style={{ color: '#1B2A4A' }}>Spend Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={CHANNEL_DATA} dataKey="pct" nameKey="channel" cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                label={({ channel, pct }: any) => `${channel} ${pct}%`}>
                {CHANNEL_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold mb-4" style={{ color: '#1B2A4A' }}>Leads vs Spend by Channel</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={CHANNEL_DATA}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="channel" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="leads" fill="#2A9D8F" name="Leads" /><Bar dataKey="spend" fill="#F5920B" name="Spend ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
          onClick={() => handleAi('analyze-performance', { campaigns: CAMPAIGNS })}>Optimize Budget</button>
      </>}

      {tab === 'leads' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="MQLs This Month" value="234" />
          <KPI label="SQLs" value="89" />
          <KPI label="MQL to SQL Rate" value="38%" sub="↑ 3%" />
          <KPI label="Avg Time to Qualify" value="4.2 days" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-4" style={{ color: '#1B2A4A' }}>MQLs Per Week (12-Week Trend)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MQL_TREND}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="mqls" stroke="#2A9D8F" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Company</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Source</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
            </tr></thead>
            <tbody>
              {LEADS.map((l, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{l.name}</td>
                  <td className="px-4 py-3 text-gray-600">{l.company}</td>
                  <td className="px-4 py-3">{l.source}</td>
                  <td className="px-4 py-3 text-gray-500">{l.date}</td>
                  <td className="px-4 py-3">{badge(l.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}

      {tab === 'content' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Total Content" value="34" />
          <KPI label="Avg Leads/Piece" value="8" />
          <KPI label="Top Performer" value="Automation Guide" sub="89 leads" />
          <KPI label="Published This Month" value="3" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="title">Title</TH><TH k="type">Type</TH><TH k="views">Views</TH>
              <TH k="leads">Leads</TH><TH k="convRate">Conv %</TH>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Updated</th>
            </tr></thead>
            <tbody>
              {sorted(CONTENT).map((c, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{c.title}</td>
                  <td className="px-4 py-3">{badge(c.type)}</td>
                  <td className="px-4 py-3">{c.views.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold">{c.leads}</td>
                  <td className="px-4 py-3">{c.convRate}%</td>
                  <td className="px-4 py-3 text-gray-500">{c.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {expandedRow !== null && expandedRow < CONTENT.length && tab === 'content' && (() => {
            const c = sorted(CONTENT)[expandedRow];
            if (!c) return null;
            return (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-3">Last updated: {c.updated} | {c.views.toLocaleString()} total views | {c.convRate}% conversion</div>
                <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600"
                  onClick={() => handleAi('generate-copy', { campaignName: c.title, channel: 'Blog' })}>Generate Content Brief</button>
              </div>
            );
          })()}
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
