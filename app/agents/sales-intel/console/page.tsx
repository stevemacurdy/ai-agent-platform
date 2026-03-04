'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = [
  { id: 'prospects', label: 'Hot Prospects', icon: '\u{1F525}' },
  { id: 'signals', label: 'Intent Signals', icon: '\u{1F4E1}' },
  { id: 'competitors', label: 'Competitor Watch', icon: '\u{1F441}\u{FE0F}' },
  { id: 'scoring', label: 'Lead Scoring', icon: '\u{1F3AF}' },
];

const PROSPECTS = [
  { company: 'TechFlow Inc', score: 92, signals: 8, industry: 'Technology', lastActivity: '2026-03-02', action: 'Visited pricing 3x', status: 'Hot', size: '~500 employees', contact: 'VP Operations', signalList: 'Pricing page 3x, ROI calculator, case study download, competitor eval' },
  { company: 'DataSync Corp', score: 88, signals: 7, industry: 'Technology', lastActivity: '2026-03-01', action: 'Competitor evaluation', status: 'Hot', size: '~200 employees', contact: 'CTO', signalList: 'Demo request, competitor comparison page, API docs, blog visits' },
  { company: 'BuildRight', score: 85, signals: 6, industry: 'Construction', lastActivity: '2026-02-28', action: 'Requested demo', status: 'Hot', size: '~350 employees', contact: 'Dir of Logistics', signalList: 'Demo request, pricing page, 2 case studies, webinar registration' },
  { company: 'MediCare Plus', score: 78, signals: 5, industry: 'Healthcare', lastActivity: '2026-02-27', action: 'Downloaded whitepaper', status: 'Warm', size: '~800 employees', contact: 'VP Supply Chain', signalList: 'Whitepaper download, solutions page, blog x3' },
  { company: 'RetailEdge', score: 61, signals: 3, industry: 'Retail', lastActivity: '2026-02-25', action: 'Blog visits', status: 'Warm', size: '~150 employees', contact: 'Operations Manager', signalList: 'Blog visits x5, newsletter signup, about page' },
  { company: 'GreenField Ag', score: 45, signals: 2, industry: 'Agriculture', lastActivity: '2026-02-20', action: 'Newsletter signup', status: 'New', size: '~100 employees', contact: 'Owner', signalList: 'Newsletter signup, homepage visit' },
];

const SIGNAL_TREND = [
  { week: 'W1', signals: 18 }, { week: 'W2', signals: 22 }, { week: 'W3', signals: 19 },
  { week: 'W4', signals: 28 }, { week: 'W5', signals: 32 }, { week: 'W6', signals: 35 },
  { week: 'W7', signals: 29 }, { week: 'W8', signals: 38 }, { week: 'W9', signals: 42 },
  { week: 'W10', signals: 36 }, { week: 'W11', signals: 44 }, { week: 'W12', signals: 48 },
];

const SIGNALS = [
  { date: '2026-03-02', company: 'TechFlow Inc', type: 'Pricing Visit', source: 'Website', strength: 'High' },
  { date: '2026-03-02', company: 'TechFlow Inc', type: 'ROI Calculator', source: 'Website', strength: 'High' },
  { date: '2026-03-01', company: 'DataSync Corp', type: 'Demo Request', source: 'Form', strength: 'High' },
  { date: '2026-03-01', company: 'BuildRight', type: 'Demo Request', source: 'Form', strength: 'High' },
  { date: '2026-02-28', company: 'DataSync Corp', type: 'Competitor Research', source: 'Website', strength: 'Medium' },
  { date: '2026-02-27', company: 'MediCare Plus', type: 'Content Download', source: 'Website', strength: 'Medium' },
  { date: '2026-02-25', company: 'RetailEdge', type: 'Blog Visit', source: 'Website', strength: 'Low' },
  { date: '2026-02-24', company: 'TechFlow Inc', type: 'Case Study', source: 'Website', strength: 'Medium' },
];

const COMPETITORS = [
  { name: 'Bastian Solutions', threat: 'High', segment: 'Full-service integration', move: 'Launched AI-powered WMS module', updated: '2026-02-28', details: 'Expanding into mid-market. New partnership with Toyota Material Handling. Won 3 deals in our territory Q1.' },
  { name: 'Conveyco Technologies', threat: 'High', segment: 'Conveyor systems', move: 'Acquired regional integrator', updated: '2026-02-25', details: 'Acquired Rocky Mountain Automation for $12M. Now has local presence in Utah market. Aggressive pricing on conveyor projects.' },
  { name: 'Dematic', threat: 'Medium', segment: 'Enterprise automation', move: 'Price reduction on AS/RS', updated: '2026-02-20', details: 'Dropped AS/RS pricing 15% for mid-market accounts. Targeting our sweet spot. Lost BuildRight deal to them last quarter.' },
  { name: 'Numina Group', threat: 'Medium', segment: 'Pick/pack optimization', move: 'New voice picking solution', updated: '2026-02-18', details: 'Released RFgen voice picking integration. Competitive on price for pick/pack projects.' },
  { name: 'RivalCo Systems', threat: 'Low', segment: 'Regional integrator', move: 'Key engineer departed', updated: '2026-02-15', details: 'Lost senior project manager. Delays on current projects reported by shared clients.' },
];

const SCORE_BUCKETS = [
  { range: '0-20', count: 12, conversion: 2, avgDays: 0 },
  { range: '21-40', count: 28, conversion: 5, avgDays: 0 },
  { range: '41-60', count: 45, conversion: 12, avgDays: 68 },
  { range: '61-80', count: 38, conversion: 24, avgDays: 42 },
  { range: '81-100', count: 24, conversion: 45, avgDays: 28 },
];

function Badge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  const cls = s.includes('hot') || s.includes('high') ? 'bg-rose-50 text-rose-600'
    : s.includes('warm') || s.includes('medium') || s.includes('nurturing') ? 'bg-amber-50 text-amber-600'
    : s.includes('converted') || s.includes('on track') ? 'bg-emerald-50 text-emerald-600'
    : s.includes('low') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

function KPI({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (<div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><span>{icon}</span>{label}</div>
    <div className="text-2xl font-bold text-[#1B2A4A]">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </div>);
}

export default function SalesIntelConsole() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('prospects');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { fetch('/api/agents/sales-intel').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const sort = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const cmp = typeof av === 'number' ? av - bv : String(av || '').localeCompare(String(bv || '')); return sortDir === 'asc' ? cmp : -cmp; }); };
  const toggleSort = (key: string) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('desc'); } };

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalTitle(action === 'enrich' ? 'Company Intelligence' : action === 'build-outreach' ? 'AI Outreach List' : 'Lead Score'); setModalOpen(true);
    const res = await fetch('/api/agents/sales-intel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload }) });
    const result = await res.json(); setAiResult(result.result || result.error || 'Complete'); setAiLoading(false);
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

  const source = data?.source || 'demo';
  const summary = data?.summary || {};
  const leads = data?.leads || [];
  const prospects = leads.length ? leads.map((l: any) => ({ company: l.company || l.prospect_company, score: l.score || l.lead_score || 50, signals: l.signalCount || l.signals || 0, industry: l.industry, lastActivity: l.lastActivity || l.last_activity, action: l.topSignal || l.action || '', status: l.status || 'New', size: l.companySize || '', contact: l.decisionMaker || '', signalList: l.signalDetails || '' })) : PROSPECTS;
  const filtered = prospects.filter((p: any) => !search || p.company?.toLowerCase().includes(search.toLowerCase()));
  const rows = sort(filtered);

  const Th = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-[#1B2A4A]" onClick={() => toggleSort(k)}>{children} {sortKey === k ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}</th>
  );

  const scoreBar = (score: number) => {
    const color = score >= 61 ? '#059669' : score >= 31 ? '#F5920B' : '#DC2626';
    return <div className="flex items-center gap-2"><div className="w-16 h-2 bg-gray-100 rounded-full"><div className="h-2 rounded-full" style={{ width: `${score}%`, backgroundColor: color }} /></div><span className="text-xs font-medium">{score}</span></div>;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">{'\u{1F50D}'} Sales Intel Agent</h1><p className="text-sm text-gray-500">Prospect intelligence and competitive monitoring</p></div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${source === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{source === 'live' ? 'Live Data' : 'Demo Data'}</span>
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (<button key={t.id} onClick={() => { setTab(t.id); setExpanded(null); setSortKey(''); setSearch(''); }}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-[#F5920B] text-[#1B2A4A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t.icon} {t.label}</button>))}
      </div>

      {/* Hot Prospects */}
      {tab === 'prospects' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Active Prospects" value={`${summary.totalLeads || 147}`} icon={'\u{1F465}'} /><KPI label="Ready-to-Buy Signals" value={`${summary.hotLeads || 12}`} icon={'\u{1F525}'} /><KPI label="Avg Lead Score" value={`${summary.avgLeadScore || 64}`} icon={'\u{1F3AF}'} /><KPI label="New This Week" value="28" icon={'\u{2728}'} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="px-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#F5920B]/30" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><Th k="company">Company</Th><Th k="score">Score</Th><Th k="signals">Signals</Th><Th k="industry">Industry</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Last Activity</th><Th k="status">Status</Th></tr></thead>
            <tbody>{rows.map((p: any, i: number) => (
              <>{/* eslint-disable-next-line react/jsx-key */}
              <tr className={`border-t border-gray-50 cursor-pointer hover:bg-gray-50/50 ${expanded === i ? 'bg-orange-50/30' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                <td className="px-3 py-3 font-medium text-[#1B2A4A]">{p.company}</td><td className="px-3 py-3">{scoreBar(p.score)}</td><td className="px-3 py-3">{p.signals}</td><td className="px-3 py-3 text-gray-500">{p.industry}</td><td className="px-3 py-3 text-xs text-gray-400">{p.action}</td><td className="px-3 py-3"><Badge status={p.status} /></td>
              </tr>
              {expanded === i && (<tr key={`exp-${i}`}><td colSpan={6} className="bg-gray-50/50 px-4 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                  <div><span className="text-gray-400">Size</span><br />{p.size || 'Unknown'}</div>
                  <div><span className="text-gray-400">Key Contact</span><br />{p.contact || 'Unknown'}</div>
                  <div><span className="text-gray-400">Last Activity</span><br />{p.lastActivity}</div>
                  <div><span className="text-gray-400">Signals</span><br />{p.signalList || p.action}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); handleAi('enrich', { companyName: p.company, industry: p.industry }); }} className="px-3 py-1.5 bg-[#1B2A4A] text-white text-xs rounded-lg">Enrich</button>
                  <button onClick={e => { e.stopPropagation(); handleAi('score-lead', { companyName: p.company, industry: p.industry, signals: p.signalList }); }} className="px-3 py-1.5 bg-[#F5920B] text-white text-xs rounded-lg">Score Lead</button>
                </div>
              </td></tr>)}</>
            ))}</tbody>
          </table>
        </div>
      </div>)}

      {/* Intent Signals */}
      {tab === 'signals' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Signals This Month" value={`${summary.activeSignals || 124}`} icon={'\u{1F4E1}'} /><KPI label="Pricing Page Visits" value="18" icon={'\u{1F4B0}'} /><KPI label="Demo Requests" value="7" icon={'\u{1F3AC}'} /><KPI label="Content Downloads" value="32" icon={'\u{1F4E5}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">New Signals Per Week (12 Weeks)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={SIGNAL_TREND}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="week" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="signals" stroke="#F5920B" strokeWidth={2} dot={{ r: 3 }} name="Signals" /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Date</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Company</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Signal Type</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Source</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Strength</th></tr></thead>
            <tbody>{SIGNALS.map((s, i) => (<tr key={i} className="border-t border-gray-50"><td className="px-3 py-2">{s.date}</td><td className="px-3 py-2 font-medium text-[#1B2A4A]">{s.company}</td><td className="px-3 py-2"><Badge status={s.type} /></td><td className="px-3 py-2 text-gray-500">{s.source}</td><td className="px-3 py-2"><Badge status={s.strength} /></td></tr>))}</tbody>
          </table>
        </div>
      </div>)}

      {/* Competitor Watch */}
      {tab === 'competitors' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Competitors Tracked" value="18" icon={'\u{1F441}\u{FE0F}'} /><KPI label="High Threats" value="3" icon={'\u{1F534}'} /><KPI label="Recent Moves" value="7" icon={'\u{1F4E2}'} /><KPI label="Market Share Change" value="-0.2%" icon={'\u{1F4C9}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><Th k="name">Competitor</Th><Th k="threat">Threat Level</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Segment</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Recent Move</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Updated</th></tr></thead>
            <tbody>{sort(COMPETITORS).map((c, i) => (
              <>{/* eslint-disable-next-line react/jsx-key */}
              <tr className={`border-t border-gray-50 cursor-pointer hover:bg-gray-50/50 ${expanded === i ? 'bg-orange-50/30' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                <td className="px-3 py-3 font-medium text-[#1B2A4A]">{c.name}</td><td className="px-3 py-3"><Badge status={c.threat} /></td><td className="px-3 py-3 text-gray-500">{c.segment}</td><td className="px-3 py-3 text-xs">{c.move}</td><td className="px-3 py-3 text-xs text-gray-400">{c.updated}</td>
              </tr>
              {expanded === i && (<tr key={`exp-${i}`}><td colSpan={5} className="bg-gray-50/50 px-4 py-4 text-xs text-gray-600">{c.details}</td></tr>)}</>
            ))}</tbody>
          </table>
        </div>
      </div>)}

      {/* Lead Scoring */}
      {tab === 'scoring' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Win Rate" value={`${summary.conversionRate || 32}%`} icon={'\u{1F3AF}'} /><KPI label="Top Loss Reason" value="Price" icon={'\u{1F4B8}'} /><KPI label="Avg Deal Cycle" value="42 days" icon={'\u{23F1}\u{FE0F}'} /><KPI label="Competitive Losses" value="8" icon={'\u{1F4C9}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={SCORE_BUCKETS}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="range" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="count" fill="#1B2A4A" radius={[4,4,0,0]} name="Leads" /><Bar dataKey="conversion" fill="#059669" radius={[4,4,0,0]} name="Conversion %" /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-end"><button onClick={() => handleAi('build-outreach', { count: 5, prospects: prospects.map((p: any) => ({ company: p.company, score: p.score, industry: p.industry, signals: p.signalList || p.action })) })} className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg">Build Outreach List</button></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Score Range</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Count</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Conversion %</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Avg Days to Convert</th></tr></thead>
            <tbody>{SCORE_BUCKETS.map(b => (<tr key={b.range} className="border-t border-gray-50"><td className="px-3 py-2 font-medium">{b.range}</td><td className="px-3 py-2">{b.count}</td><td className="px-3 py-2">{b.conversion}%</td><td className="px-3 py-2">{b.avgDays || '-'}</td></tr>))}</tbody>
          </table>
        </div>
      </div>)}

      {/* AI Modal */}
      {modalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-[#1B2A4A]">{modalTitle}</h3><button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button></div>
          {aiLoading ? (<div className="flex items-center gap-3 py-8"><div className="w-5 h-5 border-2 border-[#F5920B] border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-500">Generating intelligence...</span></div>
          ) : (<div><pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{aiResult}</pre><button onClick={() => navigator.clipboard.writeText(aiResult)} className="mt-4 px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200">Copy to Clipboard</button></div>)}
        </div>
      </div>)}
    </div>
  );
}
