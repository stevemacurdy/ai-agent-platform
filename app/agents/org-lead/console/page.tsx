'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const OKRS = [
  { objective: 'Reduce fulfillment time 20%', progress: 35, dept: 'Operations', owner: 'Mike R.', status: 'Behind', due: 'Mar 31', krs: [
    { kr: 'Cut pick-to-ship from 4.2h to 3.4h', progress: 40 }, { kr: 'Implement zone-based picking', progress: 25 }, { kr: 'Reduce packing errors to <1%', progress: 45 }
  ], blockers: 'New conveyor install delayed 2 weeks. Waiting on vendor parts.' },
  { objective: 'Grow revenue 15% QoQ', progress: 78, dept: 'Sales', owner: 'Steve M.', status: 'On Track', due: 'Mar 31', krs: [
    { kr: 'Close 3 enterprise deals ($100K+)', progress: 66 }, { kr: 'Expand 5 existing accounts', progress: 80 }, { kr: 'Launch partner channel program', progress: 90 }
  ], blockers: 'None' },
  { objective: 'Launch 5 WMS integrations', progress: 60, dept: 'Engineering', owner: 'James T.', status: 'On Track', due: 'Apr 15', krs: [
    { kr: 'Ship SAP connector', progress: 100 }, { kr: 'Ship Oracle WMS Cloud', progress: 80 }, { kr: 'Ship Manhattan Active', progress: 40 }, { kr: 'Ship Blue Yonder', progress: 20 }, { kr: 'Ship Infor CloudSuite', progress: 10 }
  ], blockers: 'Manhattan API documentation incomplete. Escalated to their team.' },
  { objective: 'Improve CSAT to 4.5', progress: 72, dept: 'Support', owner: 'Sarah M.', status: 'On Track', due: 'Mar 31', krs: [
    { kr: 'Reduce avg response time to <2h', progress: 85 }, { kr: 'Launch self-service KB', progress: 70 }, { kr: 'Implement proactive health checks', progress: 55 }
  ], blockers: 'KB authoring tool selection delayed.' },
  { objective: 'Reduce turnover to 10%', progress: 45, dept: 'HR', owner: 'Lisa K.', status: 'At Risk', due: 'Jun 30', krs: [
    { kr: 'Complete compensation benchmark', progress: 80 }, { kr: 'Launch career path framework', progress: 30 }, { kr: 'Implement stay interviews', progress: 25 }
  ], blockers: 'Engineering turnover at 22%, 3 exits last month. Comp adjustments pending budget approval.' },
];

const OKR_BY_DEPT = [
  { dept: 'Sales', progress: 78 }, { dept: 'Support', progress: 72 }, { dept: 'Engineering', progress: 60 },
  { dept: 'HR', progress: 45 }, { dept: 'Operations', progress: 35 },
];

const HEALTH_BY_DEPT = [
  { dept: 'Sales', score: 8.4, trend: 'up', concern: 'Territory overlap', lastPulse: '2026-02-28' },
  { dept: 'Support', score: 7.4, trend: 'up', concern: 'Workload spikes', lastPulse: '2026-02-28' },
  { dept: 'Finance', score: 7.8, trend: 'flat', concern: 'Tooling gaps', lastPulse: '2026-02-28' },
  { dept: 'Operations', score: 7.0, trend: 'down', concern: 'Staffing levels', lastPulse: '2026-02-28' },
  { dept: 'HR', score: 7.1, trend: 'flat', concern: 'Budget constraints', lastPulse: '2026-02-28' },
  { dept: 'Engineering', score: 6.2, trend: 'down', concern: 'Below-market comp', lastPulse: '2026-02-28' },
];

const INITIATIVES = [
  { name: 'WoulfAI Platform Launch', sponsor: 'Steve M.', status: 'Active', progress: 85, deps: 'Stripe, Supabase', updated: '2026-03-04' },
  { name: 'DC Expansion Phase 2', sponsor: 'Mike R.', status: 'Active', progress: 62, deps: 'ProBuild SOW', updated: '2026-03-01' },
  { name: 'Partner Channel Program', sponsor: 'Steve M.', status: 'Active', progress: 90, deps: 'Legal review', updated: '2026-03-03' },
  { name: 'ERP Integration Suite', sponsor: 'James T.', status: 'Active', progress: 55, deps: 'Vendor APIs', updated: '2026-02-28' },
  { name: 'Customer Health Scoring', sponsor: 'Sarah M.', status: 'Blocked', progress: 30, deps: 'Data pipeline', updated: '2026-02-20' },
  { name: 'Compensation Restructure', sponsor: 'Lisa K.', status: 'Blocked', progress: 40, deps: 'Budget approval', updated: '2026-02-15' },
  { name: 'SAP Connector', sponsor: 'James T.', status: 'Complete', progress: 100, deps: '--', updated: '2026-02-10' },
  { name: 'Support KB Launch', sponsor: 'Sarah M.', status: 'Active', progress: 70, deps: 'Content team', updated: '2026-03-02' },
];

const DECISIONS = [
  { decision: 'Adopted 4-tier pricing model', date: '2026-03-01', by: 'Steve M.', context: 'Simplify from 6 tiers to 4 for faster sales cycles', alternatives: '3-tier, usage-only', outcome: 'Implemented' },
  { decision: 'Hired 2 senior engineers', date: '2026-02-25', by: 'James T.', context: 'Address Engineering turnover and integration backlog', alternatives: 'Contractors, outsource', outcome: 'Onboarding' },
  { decision: 'Delayed DC Phase 2 by 2 weeks', date: '2026-02-20', by: 'Mike R.', context: 'Conveyor vendor parts delayed; avoid idle labor costs', alternatives: 'Parallel workaround, penalty clause', outcome: 'New date Apr 15' },
  { decision: 'Paused LinkedIn Ads', date: '2026-02-18', by: 'Steve M.', context: 'CPA too high ($180); reallocate to outbound', alternatives: 'Reduce spend, retarget', outcome: 'Shifted to SDR' },
  { decision: 'Approved FastParts renegotiation', date: '2026-02-15', by: 'Steve M.', context: 'Contract expiring Mar 21, performance declining', alternatives: 'Let expire, find alternative', outcome: 'Pending' },
  { decision: 'Selected Resend for transactional email', date: '2026-02-10', by: 'James T.', context: 'Need reliable email for platform notifications', alternatives: 'SendGrid, Postmark', outcome: 'Implemented' },
  { decision: 'Initiated stay interviews', date: '2026-02-08', by: 'Lisa K.', context: 'Engineering attrition spiking — need early warning', alternatives: 'Survey only, exit interviews only', outcome: 'In Progress' },
  { decision: 'Committed to SOC2 Type II', date: '2026-02-05', by: 'Steve M.', context: 'Enterprise prospects require compliance certification', alternatives: 'ISO 27001, defer', outcome: 'Audit scheduled Jun' },
];

const badge = (v: string) => {
  const m: Record<string, string> = {
    'On Track': 'bg-emerald-50 text-emerald-600', 'At Risk': 'bg-rose-50 text-rose-600', Behind: 'bg-amber-50 text-amber-600',
    Active: 'bg-emerald-50 text-emerald-600', Blocked: 'bg-rose-50 text-rose-600', Complete: 'bg-blue-50 text-blue-600',
    Implemented: 'bg-emerald-50 text-emerald-600', Pending: 'bg-amber-50 text-amber-600', 'In Progress': 'bg-amber-50 text-amber-600', Onboarding: 'bg-blue-50 text-blue-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

export default function OrgLeadConsole() {
  useTrackConsoleView('org-lead')
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('okrs');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/agents/org-lead').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const sort = (key: string) => { setSortKey(key); setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'); setExpandedRow(null); };
  const sorted = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv)); return sortDir === 'asc' ? c : -c; }); };
  const arrow = (k: string) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalAction(action); setModalOpen(true);
    const res = await fetch('/api/agents/org-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, okrs: OKRS, ...payload }) });
    const r = await res.json(); setAiResult(r.result || r.error || 'Complete'); setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['okrs', 'health', 'initiatives', 'decisions'];
  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${sub.includes('risk') || sub.includes('blocked') ? 'text-rose-600' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
  const TH = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => sort(k)}>{children}{arrow(k)}</th>
  );

  if (loading) return <div className="p-8 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-3xl">&#x1F9ED;</span><div><h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>Org Lead Console</h1><p className="text-xs text-gray-400">Strategy Department</p></div></div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>
      <div className="flex gap-2 border-b border-gray-200">{tabs.map(t => (
        <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          {t === 'okrs' ? 'OKR Dashboard' : t === 'health' ? 'Team Health' : t === 'initiatives' ? 'Initiatives' : 'Decision Log'}
        </button>
      ))}</div>

      {tab === 'okrs' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="OKR Completion" value="64%" /><KPI label="Team Health" value="7.2/10" /><KPI label="Active Initiatives" value="12" /><KPI label="Decision Velocity" value="4.2d" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>OKR Progress by Department</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={OKR_BY_DEPT} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 100]} /><YAxis type="category" dataKey="dept" width={80} tick={{ fontSize: 11 }} /><Tooltip />
              <Bar dataKey="progress" name="Progress %" fill="#F5920B" /></BarChart>
          </ResponsiveContainer>
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search objectives..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="objective">Objective</TH><TH k="progress">Progress</TH><TH k="dept">Dept</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Owner</th><TH k="status">Status</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Due</th>
          </tr></thead><tbody>
            {sorted(OKRS.filter(o => o.objective.toLowerCase().includes(search.toLowerCase()))).map((o, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 cursor-pointer ${o.status === 'Behind' || o.status === 'At Risk' ? 'bg-rose-50/30' : ''}`} onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{o.objective}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${o.progress}%`, background: o.progress >= 70 ? '#059669' : o.progress >= 50 ? '#F5920B' : '#DC2626' }} /></div><span className="text-xs font-bold">{o.progress}%</span></div></td>
                <td className="px-4 py-3 text-gray-500">{o.dept}</td><td className="px-4 py-3 text-gray-500">{o.owner}</td>
                <td className="px-4 py-3">{badge(o.status)}</td><td className="px-4 py-3 text-gray-500">{o.due}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const o = sorted(OKRS.filter(ox => ox.objective.toLowerCase().includes(search.toLowerCase())))[expandedRow]; if (!o) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="space-y-2 mb-3">{o.krs.map((kr: any, ki: number) => (
                <div key={ki} className="flex items-center gap-3"><div className="w-full max-w-xs"><div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${kr.progress}%`, background: kr.progress >= 70 ? '#059669' : kr.progress >= 40 ? '#F5920B' : '#DC2626' }} /></div></div><span className="text-xs font-bold w-10 text-right">{kr.progress}%</span><span className="text-xs text-gray-600 flex-1">{kr.kr}</span></div>
              ))}</div>
              {o.blockers !== 'None' && <p className="text-xs text-rose-600 mb-2">Blockers: {o.blockers}</p>}
            </div>
          ); })()}
        </div>
      </>}

      {tab === 'health' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Overall" value="7.2/10" /><KPI label="Highest" value="Sales 8.4" /><KPI label="Lowest" value="Eng 6.2" sub="at risk" /><KPI label="Response Rate" value="82%" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>Health Score by Department</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={HEALTH_BY_DEPT}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="dept" tick={{ fontSize: 11 }} /><YAxis domain={[0, 10]} /><Tooltip />
              <Bar dataKey="score" name="Health" fill="#2A9D8F" /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="dept">Department</TH><TH k="score">Score</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Trend</th><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Top Concern</th><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Last Pulse</th>
          </tr></thead><tbody>
            {sorted(HEALTH_BY_DEPT).map((h, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${h.score < 6.5 ? 'bg-rose-50/30' : ''}`}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{h.dept}</td>
                <td className="px-4 py-3 font-bold" style={{ color: h.score >= 7.5 ? '#059669' : h.score >= 6.5 ? '#F5920B' : '#DC2626' }}>{h.score}</td>
                <td className="px-4 py-3">{h.trend === 'up' ? <span className="text-emerald-600 font-bold">↑</span> : h.trend === 'down' ? <span className="text-rose-600 font-bold">↓</span> : <span className="text-gray-400">→</span>}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{h.concern}</td><td className="px-4 py-3 text-gray-500">{h.lastPulse}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600" onClick={() => handleAi('team-health-survey', { department: 'Engineering', healthScore: '6.2' })}>Generate Health Survey</button>
      </>}

      {tab === 'initiatives' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Active" value="12" /><KPI label="Blocked" value="2" sub="blocked items" /><KPI label="Completed Q1" value="4" /><KPI label="No Update 2+ Wk" value="3" />
        </div>
        {['Active', 'Blocked', 'Complete'].map(status => {
          const items = INITIATIVES.filter(i => i.status === status);
          if (!items.length) return null;
          return (<div key={status} className="space-y-2">
            <h3 className="text-sm font-bold" style={{ color: '#1B2A4A' }}>{status} ({items.length})</h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm"><tbody>
                {items.map((ini, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 first:border-t-0">
                    <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{ini.name}</td>
                    <td className="px-4 py-3 text-gray-500">{ini.sponsor}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-14 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${ini.progress}%`, background: ini.progress >= 70 ? '#059669' : ini.progress >= 40 ? '#F5920B' : '#DC2626' }} /></div><span className="text-xs font-bold">{ini.progress}%</span></div></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{ini.deps}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{ini.updated}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          </div>);
        })}
      </>}

      {tab === 'decisions' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="This Month" value="8" /><KPI label="Avg Decision Time" value="4.2d" /><KPI label="Pending" value="3" /><KPI label="Reversed" value="0" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Decision</th><TH k="date">Date</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">By</th><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Context</th><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Outcome</th>
          </tr></thead><tbody>
            {sorted(DECISIONS).map((d, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{d.decision}</td>
                <td className="px-4 py-3 text-gray-500">{d.date}</td><td className="px-4 py-3 text-gray-500">{d.by}</td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{d.context}</td>
                <td className="px-4 py-3">{badge(d.outcome)}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const d = sorted(DECISIONS)[expandedRow]; if (!d) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-1"><span className="text-gray-400">Context:</span> {d.context}</div>
              <div className="text-xs text-gray-600"><span className="text-gray-400">Alternatives:</span> {d.alternatives}</div>
            </div>
          ); })()}
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600" onClick={() => handleAi('board-report')}>Generate Board Report</button>
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
