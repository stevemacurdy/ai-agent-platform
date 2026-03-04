'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const POSITIONS = [
  { title: 'Warehouse Associate', dept: 'Operations', applicants: 34, interviews: 8, offers: 1, daysOpen: 34, manager: 'Mike R.', status: 'open', salary: '$38K-$45K', reqs: 'Forklift certification, 1+ yr warehouse experience, able to lift 50lbs' },
  { title: 'Software Engineer', dept: 'Engineering', applicants: 67, interviews: 12, offers: 2, daysOpen: 21, manager: 'Lisa K.', status: 'interviewing', salary: '$95K-$120K', reqs: 'React/TypeScript, 3+ yrs, API design, CI/CD experience' },
  { title: 'Sales Rep', dept: 'Sales', applicants: 28, interviews: 5, offers: 0, daysOpen: 14, manager: 'Sarah M.', status: 'open', salary: '$55K-$70K + commission', reqs: 'B2B sales experience, CRM proficiency, self-starter' },
  { title: 'HR Coordinator', dept: 'HR', applicants: 19, interviews: 3, offers: 1, daysOpen: 42, manager: 'James T.', status: 'offer', salary: '$48K-$58K', reqs: 'HR generalist 2+ yrs, ATS experience, benefits admin' },
  { title: 'Data Analyst', dept: 'Finance', applicants: 45, interviews: 7, offers: 0, daysOpen: 7, manager: 'Alex P.', status: 'open', salary: '$65K-$80K', reqs: 'SQL, Python, Tableau, 2+ yrs analytics experience' },
  { title: 'Forklift Operator', dept: 'Operations', applicants: 22, interviews: 4, offers: 0, daysOpen: 28, manager: 'Mike R.', status: 'open', salary: '$35K-$42K', reqs: 'Valid forklift license, safety-conscious, shift flexibility' },
];

const HEADCOUNT_TREND = [
  { month: 'Apr', count: 112 }, { month: 'May', count: 114 }, { month: 'Jun', count: 116 },
  { month: 'Jul', count: 118 }, { month: 'Aug', count: 117 }, { month: 'Sep', count: 120 },
  { month: 'Oct', count: 121 }, { month: 'Nov', count: 123 }, { month: 'Dec', count: 122 },
  { month: 'Jan', count: 124 }, { month: 'Feb', count: 126 }, { month: 'Mar', count: 127 },
];

const PIPELINE = [
  { stage: 'Applied', count: 215, convRate: '100%', avgDays: 0 },
  { stage: 'Screened', count: 142, convRate: '66%', avgDays: 3 },
  { stage: 'Interviewed', count: 39, convRate: '27%', avgDays: 7 },
  { stage: 'Offered', count: 9, convRate: '23%', avgDays: 4 },
  { stage: 'Hired', count: 4, convRate: '44%', avgDays: 5 },
];

const RETENTION = [
  { dept: 'Operations', headcount: 42, turnover: 7, tenure: 2.8, atRisk: 1, exitReason: 'Compensation' },
  { dept: 'Engineering', headcount: 18, turnover: 22, tenure: 1.6, atRisk: 3, exitReason: 'Career growth' },
  { dept: 'Sales', headcount: 24, turnover: 12, tenure: 2.1, atRisk: 1, exitReason: 'Quota pressure' },
  { dept: 'Finance', headcount: 14, turnover: 4, tenure: 3.2, atRisk: 0, exitReason: 'N/A' },
  { dept: 'HR', headcount: 8, turnover: 0, tenure: 3.8, atRisk: 0, exitReason: 'N/A' },
  { dept: 'Support', headcount: 21, turnover: 10, tenure: 1.9, atRisk: 0, exitReason: 'Burnout' },
];

const SATISFACTION = [
  { dept: 'Operations', enps: 28, satisfaction: 7.0, concern: 'Overtime hours', survey: '2026-02-15' },
  { dept: 'Engineering', enps: 12, satisfaction: 6.1, concern: 'Below-market pay', survey: '2026-02-15' },
  { dept: 'Sales', enps: 35, satisfaction: 7.4, concern: 'Quota changes', survey: '2026-02-15' },
  { dept: 'Finance', enps: 42, satisfaction: 8.0, concern: 'None significant', survey: '2026-02-15' },
  { dept: 'HR', enps: 48, satisfaction: 8.2, concern: 'Understaffed', survey: '2026-02-15' },
  { dept: 'Support', enps: 22, satisfaction: 6.8, concern: 'Ticket volume', survey: '2026-02-15' },
];

const DEPT_COLORS = ['#F5920B', '#3B82F6', '#2A9D8F', '#8B5CF6', '#DC2626', '#059669'];

const badge = (v: string) => {
  const m: Record<string, string> = {
    open: 'bg-blue-50 text-blue-600', interviewing: 'bg-amber-50 text-amber-600',
    offer: 'bg-violet-50 text-violet-600', filled: 'bg-emerald-50 text-emerald-600',
    closed: 'bg-gray-100 text-gray-500', draft: 'bg-gray-100 text-gray-500',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

export default function HrConsole() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('workforce');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/agents/hr').then(r => r.json())
      .then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const sort = (key: string) => { setSortKey(key); setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'); setExpandedRow(null); };
  const sorted = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv)); return sortDir === 'asc' ? c : -c; }); };
  const arrow = (k: string) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalAction(action); setModalOpen(true);
    const res = await fetch('/api/agents/hr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, workforce: RETENTION, ...payload }) });
    const r = await res.json(); setAiResult(r.result || r.error || 'Complete'); setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['workforce', 'pipeline', 'retention', 'satisfaction'];
  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${sub.includes('↑') || sub.includes('+') ? 'text-emerald-600' : sub.includes('↓') || sub.includes('risk') || sub.includes('22%') ? 'text-rose-600' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
  const TH = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => sort(k)}>{children}{arrow(k)}</th>
  );

  if (loading) return <div className="p-8 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-3xl">👥</span><div><h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>HR Console</h1><p className="text-xs text-gray-400">People Department</p></div></div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>
      <div className="flex gap-2 border-b border-gray-200">{tabs.map(t => (
        <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          {t === 'workforce' ? 'Workforce' : t === 'pipeline' ? 'Hiring Pipeline' : t === 'retention' ? 'Retention' : 'Satisfaction'}
        </button>
      ))}</div>

      {tab === 'workforce' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Headcount" value="127" /><KPI label="Open Positions" value="8" /><KPI label="Retention Rate" value="91%" sub="↑ 2%" /><KPI label="Avg Tenure" value="2.4 years" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Headcount Trend (12 Months)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={HEADCOUNT_TREND}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis domain={[105, 135]} /><Tooltip /><Line type="monotone" dataKey="count" stroke="#2A9D8F" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
          </ResponsiveContainer>
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search positions..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="title">Position</TH><TH k="dept">Dept</TH><TH k="applicants">Applicants</TH><TH k="interviews">Interviews</TH><TH k="offers">Offers</TH><TH k="daysOpen">Days Open</TH><TH k="status">Status</TH>
          </tr></thead><tbody>
            {sorted(POSITIONS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))).map((p, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{p.title}</td><td className="px-4 py-3">{p.dept}</td>
                <td className="px-4 py-3">{p.applicants}</td><td className="px-4 py-3">{p.interviews}</td><td className="px-4 py-3">{p.offers}</td>
                <td className="px-4 py-3 font-bold" style={{ color: p.daysOpen > 30 ? '#DC2626' : p.daysOpen > 14 ? '#F5920B' : '#059669' }}>{p.daysOpen}d</td>
                <td className="px-4 py-3">{badge(p.status)}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const p = sorted(POSITIONS.filter(px => px.title.toLowerCase().includes(search.toLowerCase())))[expandedRow]; if (!p) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div><span className="text-gray-400">Manager:</span> <span className="font-medium">{p.manager}</span></div>
                <div><span className="text-gray-400">Salary:</span> <span className="font-medium">{p.salary}</span></div>
                <div className="col-span-2"><span className="text-gray-400">Requirements:</span> <span className="font-medium">{p.reqs}</span></div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600" onClick={() => handleAi('generate-jd', { positionTitle: p.title, department: p.dept, salaryRange: p.salary })}>Generate JD</button>
                <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600" onClick={() => handleAi('salary-benchmark', { positionTitle: p.title })}>Salary Benchmark</button>
              </div>
            </div>
          ); })()}
        </div>
      </>}

      {tab === 'pipeline' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Avg Time to Hire" value="28 days" /><KPI label="App to Hire Rate" value="4.2%" /><KPI label="Interview to Offer" value="34%" /><KPI label="Offer Acceptance" value="88%" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-4" style={{ color: '#1B2A4A' }}>Hiring Funnel</h3>
          {PIPELINE.map((s, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1"><span className="font-medium" style={{ color: '#1B2A4A' }}>{s.stage}</span><span className="text-gray-400">{s.count} ({s.convRate})</span></div>
              <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full flex items-center pl-2" style={{ width: `${(s.count / 215) * 100}%`, background: DEPT_COLORS[i] || '#F5920B' }}><span className="text-white text-xs font-bold">{s.count}</span></div></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Stage</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Count</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Conv Rate</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Avg Days</th>
          </tr></thead><tbody>
            {PIPELINE.map((s, i) => (
              <tr key={i} className="border-t border-gray-100"><td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{s.stage}</td><td className="px-4 py-3">{s.count}</td><td className="px-4 py-3">{s.convRate}</td><td className="px-4 py-3">{s.avgDays}d</td></tr>
            ))}
          </tbody></table>
        </div>
      </>}

      {tab === 'retention' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Annual Turnover" value="9%" /><KPI label="Highest Dept" value="Engineering" sub="22% turnover" /><KPI label="Avg Tenure" value="2.4 yr" /><KPI label="At-Risk Employees" value="5" sub="needs attention" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Turnover Rate by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RETENTION}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="dept" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
              <Bar dataKey="turnover" name="Turnover %" fill="#DC2626">
                {RETENTION.map((_, i) => <rect key={i} fill={RETENTION[i].turnover > 15 ? '#DC2626' : RETENTION[i].turnover > 8 ? '#F5920B' : '#059669'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="dept">Department</TH><TH k="headcount">Headcount</TH><TH k="turnover">Turnover %</TH><TH k="tenure">Avg Tenure</TH><TH k="atRisk">At Risk</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Top Exit Reason</th>
          </tr></thead><tbody>
            {sorted(RETENTION).map((r, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${r.turnover > 15 ? 'bg-rose-50/30' : ''}`}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{r.dept}</td><td className="px-4 py-3">{r.headcount}</td>
                <td className="px-4 py-3 font-bold" style={{ color: r.turnover > 15 ? '#DC2626' : r.turnover > 8 ? '#F5920B' : '#059669' }}>{r.turnover}%</td>
                <td className="px-4 py-3">{r.tenure} yr</td>
                <td className="px-4 py-3 font-bold" style={{ color: r.atRisk > 0 ? '#DC2626' : '#059669' }}>{r.atRisk}</td>
                <td className="px-4 py-3 text-gray-500">{r.exitReason}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600" onClick={() => handleAi('retention-analysis')}>Run Retention Analysis</button>
      </>}

      {tab === 'satisfaction' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="eNPS Score" value="32" /><KPI label="Avg Satisfaction" value="7.2/10" /><KPI label="Lowest Dept" value="Engineering" sub="6.1/10" /><KPI label="Survey Response" value="78%" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Satisfaction Score by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SATISFACTION}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="dept" tick={{ fontSize: 11 }} /><YAxis domain={[0, 10]} /><Tooltip />
              <Bar dataKey="satisfaction" name="Score" fill="#2A9D8F" /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="dept">Department</TH><TH k="enps">eNPS</TH><TH k="satisfaction">Score</TH>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Top Concern</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Action</th>
          </tr></thead><tbody>
            {sorted(SATISFACTION).map((s, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{s.dept}</td>
                <td className="px-4 py-3 font-bold" style={{ color: s.enps > 30 ? '#059669' : s.enps > 10 ? '#F5920B' : '#DC2626' }}>{s.enps}</td>
                <td className="px-4 py-3 font-bold" style={{ color: s.satisfaction >= 7 ? '#059669' : s.satisfaction >= 6 ? '#F5920B' : '#DC2626' }}>{s.satisfaction}/10</td>
                <td className="px-4 py-3 text-gray-500">{s.concern}</td>
                <td className="px-4 py-3"><button className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600" onClick={() => handleAi('salary-benchmark', { positionTitle: `${s.dept} roles`, location: 'Utah' })}>Benchmark</button></td>
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
