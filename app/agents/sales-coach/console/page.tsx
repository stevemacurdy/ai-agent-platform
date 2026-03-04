'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TABS = [
  { id: 'team', label: 'Team Performance', icon: '\u{1F3C6}' },
  { id: 'scorecards', label: 'Rep Scorecards', icon: '\u{1F4CB}' },
  { id: 'plans', label: 'Coaching Plans', icon: '\u{1F4DD}' },
  { id: 'winloss', label: 'Win/Loss Analysis', icon: '\u{1F4CA}' },
];

const REPS = [
  { name: 'Sarah M.', quota: 700000, actual: 580000, attainment: 83, winRate: 45, deals: 12, avgDeal: 48000, trend: 'up', strengths: 'Discovery, Relationship building, Product demos', weaknesses: 'Negotiation, Multi-threading', skills: { discovery: 9, presentation: 8, negotiation: 6, closing: 8 }, notes: 'Strong closer. Needs help on complex multi-stakeholder deals.' },
  { name: 'Mike R.', quota: 600000, actual: 420000, attainment: 70, winRate: 28, deals: 8, avgDeal: 52000, trend: 'flat', strengths: 'Technical knowledge, Solution design', weaknesses: 'Discovery questions, Urgency creation', skills: { discovery: 5, presentation: 8, negotiation: 7, closing: 5 }, notes: 'Strong technical seller. Needs coaching on discovery and creating urgency.' },
  { name: 'Lisa K.', quota: 650000, actual: 510000, attainment: 78, winRate: 35, deals: 10, avgDeal: 51000, trend: 'up', strengths: 'Objection handling, Follow-up discipline', weaknesses: 'Executive presence, Value articulation', skills: { discovery: 7, presentation: 6, negotiation: 7, closing: 7 }, notes: 'Consistent performer. Coaching on C-suite selling would unlock next level.' },
  { name: 'James T.', quota: 550000, actual: 310000, attainment: 56, winRate: 22, deals: 6, avgDeal: 52000, trend: 'down', strengths: 'Product knowledge, Persistence', weaknesses: 'Discovery, Objection handling, Time management', skills: { discovery: 4, presentation: 5, negotiation: 4, closing: 5 }, notes: 'Struggling rep. Needs intensive coaching on fundamentals — discovery and qualification.' },
  { name: 'Alex P.', quota: 500000, actual: 360000, attainment: 72, winRate: 30, deals: 9, avgDeal: 40000, trend: 'up', strengths: 'Activity volume, Prospecting', weaknesses: 'Deal size expansion, Negotiation', skills: { discovery: 7, presentation: 6, negotiation: 4, closing: 6 }, notes: 'High activity but small deals. Coach on selling bigger solutions and negotiation.' },
];

const PLANS = [
  { rep: 'James T.', focus: 'Discovery Fundamentals', goal: 'Improve discovery conversion to 25%', progress: 35, nextSession: '2026-03-05', status: 'Behind', items: 'SPIN questions practice, ride-along with Sarah, weekly call review' },
  { rep: 'Mike R.', focus: 'Urgency Creation', goal: 'Reduce avg cycle from 52 to 40 days', progress: 50, nextSession: '2026-03-06', status: 'On Track', items: 'Champion coaching, compelling event mapping, deal acceleration workshop' },
  { rep: 'Alex P.', focus: 'Deal Expansion', goal: 'Increase avg deal size to $55K', progress: 40, nextSession: '2026-03-07', status: 'Behind', items: 'Multi-product selling, cross-sell mapping, value calculator training' },
  { rep: 'Lisa K.', focus: 'Executive Selling', goal: 'Win 2 C-suite led deals this quarter', progress: 65, nextSession: '2026-03-04', status: 'On Track', items: 'Executive briefing practice, business case development, CFO talking points' },
  { rep: 'Sarah M.', focus: 'Multi-threading', goal: 'Average 3+ contacts per deal', progress: 80, nextSession: '2026-03-08', status: 'On Track', items: 'Stakeholder mapping template, org chart analysis, multi-thread outreach cadence' },
];

const WINLOSS_DATA = [
  { name: 'Won', value: 32, color: '#059669' }, { name: 'Lost', value: 48, color: '#DC2626' }, { name: 'Stalled', value: 20, color: '#F5920B' },
];

const RECENT_DEALS = [
  { deal: 'TechFlow WMS Upgrade', rep: 'Sarah M.', outcome: 'Won', value: 82000, reason: 'Strong ROI case', competitor: 'Bastian' },
  { deal: 'BuildRight DC Expansion', rep: 'Lisa K.', outcome: 'Lost', value: 145000, reason: 'Price', competitor: 'Dematic' },
  { deal: 'MediCare Conveyor', rep: 'Mike R.', outcome: 'Stalled', value: 68000, reason: 'Budget freeze', competitor: 'None' },
  { deal: 'RetailEdge Pick Module', rep: 'James T.', outcome: 'Lost', value: 54000, reason: 'No champion', competitor: 'Conveyco' },
  { deal: 'DataSync Fulfillment', rep: 'Alex P.', outcome: 'Won', value: 42000, reason: 'Speed to deploy', competitor: 'Numina' },
  { deal: 'GreenField Cold Storage', rep: 'Sarah M.', outcome: 'Won', value: 96000, reason: 'Reference customer', competitor: 'Bastian' },
  { deal: 'Summit Logistics Racking', rep: 'James T.', outcome: 'Lost', value: 38000, reason: 'Price', competitor: 'RivalCo' },
];

function Badge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  const cls = s.includes('behind') || s.includes('at risk') || s.includes('lost') || s.includes('down') ? 'bg-rose-50 text-rose-600'
    : s.includes('on track') || s.includes('won') || s.includes('up') || s.includes('completed') ? 'bg-emerald-50 text-emerald-600'
    : s.includes('stalled') || s.includes('flat') || s.includes('in progress') ? 'bg-amber-50 text-amber-600'
    : 'bg-blue-50 text-blue-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

function KPI({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (<div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><span>{icon}</span>{label}</div>
    <div className="text-2xl font-bold text-[#1B2A4A]">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </div>);
}

export default function SalesCoachConsole() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('team');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedRep, setSelectedRep] = useState<number>(0);

  useEffect(() => { fetch('/api/agents/sales-coach').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const sort = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const cmp = typeof av === 'number' ? av - bv : String(av || '').localeCompare(String(bv || '')); return sortDir === 'asc' ? cmp : -cmp; }); };
  const toggleSort = (key: string) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('desc'); } };

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult('');
    setModalTitle(action === 'generate-coaching-plan' ? 'AI Coaching Plan' : action === 'generate-roleplay' ? 'Roleplay Scenario' : 'Win/Loss Analysis');
    setModalOpen(true);
    const res = await fetch('/api/agents/sales-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload }) });
    const result = await res.json(); setAiResult(result.result || result.error || 'Complete'); setAiLoading(false);
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

  const source = data?.source || 'demo';
  const summary = data?.summary || {};

  const pctBar = (pct: number) => {
    const color = pct >= 80 ? '#059669' : pct >= 60 ? '#F5920B' : '#DC2626';
    return <div className="flex items-center gap-2"><div className="w-16 h-2 bg-gray-100 rounded-full"><div className="h-2 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} /></div><span className="text-xs">{pct}%</span></div>;
  };

  const Th = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-[#1B2A4A]" onClick={() => toggleSort(k)}>{children} {sortKey === k ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}</th>
  );

  const rep = REPS[selectedRep];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">{'\u{1F3C6}'} Sales Coach Agent</h1><p className="text-sm text-gray-500">Rep performance analysis and coaching intelligence</p></div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${source === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{source === 'live' ? 'Live Data' : 'Demo Data'}</span>
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (<button key={t.id} onClick={() => { setTab(t.id); setExpanded(null); setSortKey(''); setSearch(''); }}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-[#F5920B] text-[#1B2A4A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t.icon} {t.label}</button>))}
      </div>

      {/* Team Performance */}
      {tab === 'team' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Team Quota Attainment" value={`${summary.teamQuotaAttainment || 78}%`} icon={'\u{1F4CA}'} /><KPI label="Avg Win Rate" value={`${summary.avgWinRate || 32}%`} icon={'\u{1F3AF}'} /><KPI label="Coaching Sessions" value="8" icon={'\u{1F4DD}'} sub="this month" /><KPI label="Top Rep" value="Sarah M." icon={'\u{1F31F}'} sub="83% attainment" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Quota Attainment by Rep</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={REPS}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}K`} /><Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} /><Legend /><Bar dataKey="quota" fill="#2A9D8F" name="Quota" radius={[4,4,0,0]} /><Bar dataKey="actual" fill="#F5920B" name="Actual" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-3"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reps..." className="px-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#F5920B]/30" /></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><Th k="name">Rep</Th><Th k="quota">Quota</Th><Th k="actual">Actual</Th><Th k="attainment">Attainment</Th><Th k="winRate">Win Rate</Th><Th k="deals">Deals</Th><Th k="avgDeal">Avg Deal</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Trend</th></tr></thead>
            <tbody>{sort(REPS.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))).map((r, i) => (
              <>{/* eslint-disable-next-line react/jsx-key */}
              <tr className={`border-t border-gray-50 cursor-pointer hover:bg-gray-50/50 ${expanded === i ? 'bg-orange-50/30' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                <td className="px-3 py-3 font-medium text-[#1B2A4A]">{r.name}</td><td className="px-3 py-3">${(r.quota/1000).toFixed(0)}K</td><td className="px-3 py-3 font-medium">${(r.actual/1000).toFixed(0)}K</td><td className="px-3 py-3">{pctBar(r.attainment)}</td><td className="px-3 py-3">{r.winRate}%</td><td className="px-3 py-3">{r.deals}</td><td className="px-3 py-3">${(r.avgDeal/1000).toFixed(0)}K</td><td className="px-3 py-3"><Badge status={r.trend} /></td>
              </tr>
              {expanded === i && (<tr key={`exp-${i}`}><td colSpan={8} className="bg-gray-50/50 px-4 py-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mb-3">
                  <div><span className="text-gray-400">Strengths</span><br />{r.strengths}</div>
                  <div><span className="text-gray-400">Weaknesses</span><br />{r.weaknesses}</div>
                  <div><span className="text-gray-400">Notes</span><br />{r.notes}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); handleAi('generate-coaching-plan', { repName: r.name, quota: r.quota, actual: r.actual, winRate: r.winRate, strengths: r.strengths, weaknesses: r.weaknesses }); }} className="px-3 py-1.5 bg-[#1B2A4A] text-white text-xs rounded-lg">Generate Plan</button>
                  <button onClick={e => { e.stopPropagation(); handleAi('generate-roleplay', { repName: r.name, weakness: r.weaknesses.split(',')[0]?.trim() }); }} className="px-3 py-1.5 bg-[#F5920B] text-white text-xs rounded-lg">Create Roleplay</button>
                </div>
              </td></tr>)}</>
            ))}</tbody>
          </table>
        </div>
      </div>)}

      {/* Rep Scorecards */}
      {tab === 'scorecards' && (<div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {REPS.map((r, i) => (<button key={r.name} onClick={() => setSelectedRep(i)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRep === i ? 'bg-[#1B2A4A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{r.name}</button>))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(rep.skills).map(([skill, score]) => (
            <div key={skill} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-xs text-gray-400 uppercase mb-2">{skill}</div>
              <div className={`text-3xl font-bold ${(score as number) >= 7 ? 'text-emerald-600' : (score as number) >= 5 ? 'text-amber-600' : 'text-rose-600'}`}>{score as number}/10</div>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-2"><div className="h-2 rounded-full" style={{ width: `${(score as number) * 10}%`, backgroundColor: (score as number) >= 7 ? '#059669' : (score as number) >= 5 ? '#F5920B' : '#DC2626' }} /></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-2">Performance Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Quota Attainment</span><span className="font-medium">{rep.attainment}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Win Rate</span><span className="font-medium">{rep.winRate}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Deals Closed</span><span className="font-medium">{rep.deals}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Avg Deal Size</span><span className="font-medium">${rep.avgDeal.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-2">Coaching Notes</h3>
            <p className="text-sm text-gray-600 mb-3">{rep.notes}</p>
            <div className="text-xs"><span className="text-gray-400">Strengths:</span> {rep.strengths}<br /><span className="text-gray-400">Focus Areas:</span> {rep.weaknesses}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAi('generate-coaching-plan', { repName: rep.name, quota: rep.quota, actual: rep.actual, winRate: rep.winRate, strengths: rep.strengths, weaknesses: rep.weaknesses })} className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg">Generate Coaching Plan</button>
          <button onClick={() => { const weakest = Object.entries(rep.skills).sort(([,a],[,b]) => (a as number) - (b as number))[0]; handleAi('generate-roleplay', { repName: rep.name, weakness: weakest[0] }); }} className="px-4 py-2 bg-[#F5920B] text-white text-sm rounded-lg">Create Roleplay</button>
        </div>
      </div>)}

      {/* Coaching Plans */}
      {tab === 'plans' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Active Plans" value="5" icon={'\u{1F4DD}'} /><KPI label="On Track" value="3" icon={'\u{2705}'} /><KPI label="Needs Attention" value="2" icon={'\u{26A0}\u{FE0F}'} /><KPI label="Completed Q1" value="4" icon={'\u{1F3C6}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><Th k="rep">Rep</Th><Th k="focus">Focus Area</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Goal</th><Th k="progress">Progress</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Next Session</th><Th k="status">Status</Th></tr></thead>
            <tbody>{sort(PLANS).map((p, i) => (
              <>{/* eslint-disable-next-line react/jsx-key */}
              <tr className={`border-t border-gray-50 cursor-pointer hover:bg-gray-50/50 ${expanded === i ? 'bg-orange-50/30' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                <td className="px-3 py-3 font-medium text-[#1B2A4A]">{p.rep}</td><td className="px-3 py-3">{p.focus}</td><td className="px-3 py-3 text-xs text-gray-500">{p.goal}</td><td className="px-3 py-3">{pctBar(p.progress)}</td><td className="px-3 py-3">{p.nextSession}</td><td className="px-3 py-3"><Badge status={p.status} /></td>
              </tr>
              {expanded === i && (<tr key={`exp-${i}`}><td colSpan={6} className="bg-gray-50/50 px-4 py-4 text-xs"><span className="text-gray-400">Action Items:</span><br />{p.items}</td></tr>)}</>
            ))}</tbody>
          </table>
        </div>
      </div>)}

      {/* Win/Loss Analysis */}
      {tab === 'winloss' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Win Rate" value={`${summary.avgWinRate || 32}%`} icon={'\u{1F3AF}'} /><KPI label="Top Loss Reason" value="Price" icon={'\u{1F4B8}'} sub="40% of losses" /><KPI label="Avg Deal Cycle" value="42 days" icon={'\u{23F1}\u{FE0F}'} /><KPI label="Competitive Losses" value="8" icon={'\u{1F4C9}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Win / Loss / Stalled Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart><Pie data={WINLOSS_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }: any) => `${name} ${value}%`}>{WINLOSS_DATA.map((d, idx) => <Cell key={idx} fill={d.color} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-end"><button onClick={() => handleAi('analyze-win-loss', { reps: REPS.map(r => ({ name: r.name, attainment: r.attainment, winRate: r.winRate, deals: r.deals })) })} className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg">Analyze Patterns</button></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Deal</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Rep</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Outcome</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Value</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Reason</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Competitor</th></tr></thead>
            <tbody>{RECENT_DEALS.map((d, i) => (<tr key={i} className="border-t border-gray-50"><td className="px-3 py-2 font-medium text-[#1B2A4A]">{d.deal}</td><td className="px-3 py-2">{d.rep}</td><td className="px-3 py-2"><Badge status={d.outcome} /></td><td className="px-3 py-2">${d.value.toLocaleString()}</td><td className="px-3 py-2 text-xs text-gray-500">{d.reason}</td><td className="px-3 py-2 text-xs">{d.competitor}</td></tr>))}</tbody>
          </table>
        </div>
      </div>)}

      {/* AI Modal */}
      {modalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-[#1B2A4A]">{modalTitle}</h3><button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button></div>
          {aiLoading ? (<div className="flex items-center gap-3 py-8"><div className="w-5 h-5 border-2 border-[#F5920B] border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-500">Generating...</span></div>
          ) : (<div><pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{aiResult}</pre><button onClick={() => navigator.clipboard.writeText(aiResult)} className="mt-4 px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200">Copy to Clipboard</button></div>)}
        </div>
      </div>)}
    </div>
  );
}
