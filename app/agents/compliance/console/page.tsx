'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const REQS = [
  { req: 'Workplace Safety', framework: 'OSHA', status: 'Compliant', lastAudit: 'Jan 15', nextDue: 'Jul 15', owner: 'Mike R.', findings: 0, details: 'Full compliance achieved. Annual inspection passed with zero findings.' },
  { req: 'Data Protection', framework: 'GDPR', status: 'Partial', lastAudit: 'Nov 20', nextDue: 'May 20', owner: 'Lisa K.', findings: 3, details: 'Data retention policy outdated, consent forms missing for 2 data flows, cross-border transfer assessment incomplete.' },
  { req: 'Security Controls', framework: 'SOC2', status: 'Compliant', lastAudit: 'Dec 5', nextDue: 'Jun 5', owner: 'James T.', findings: 1, details: 'Minor: access review cadence changed from quarterly to semi-annual needs formal documentation.' },
  { req: 'Quality Management', framework: 'ISO 9001', status: 'Non-Compliant', lastAudit: 'Oct 10', nextDue: 'Apr 10', owner: 'Sarah M.', findings: 4, details: 'Document control gaps, calibration records incomplete, management review overdue, corrective action process not followed.' },
  { req: 'Employee Safety Training', framework: 'OSHA', status: 'Partial', lastAudit: 'Jan 15', nextDue: 'Jul 15', owner: 'Mike R.', findings: 1, details: '6 employees have lapsed forklift certifications. Training scheduled but not completed.' },
  { req: 'Access Controls', framework: 'SOC2', status: 'Compliant', lastAudit: 'Dec 5', nextDue: 'Jun 5', owner: 'James T.', findings: 0, details: 'MFA enforced, quarterly access reviews current, privileged access properly scoped.' },
];

const COMP_BY_FRAMEWORK = [
  { framework: 'OSHA', rate: 88 }, { framework: 'SOC2', rate: 96 }, { framework: 'GDPR', rate: 72 }, { framework: 'ISO 9001', rate: 64 }, { framework: 'Internal', rate: 91 },
];

const DONUT_DATA = [{ name: 'Compliant', value: 87 }, { name: 'Non-Compliant', value: 13 }];
const DONUT_COLORS = ['#059669', '#DC2626'];

const AUDITS = [
  { regulation: 'ISO 9001', date: '2026-04-10', type: 'External', auditor: 'BSI Group', status: 'Scheduled', findings: '--' },
  { regulation: 'SOC2 Type II', date: '2026-06-05', type: 'External', auditor: 'Deloitte', status: 'Scheduled', findings: '--' },
  { regulation: 'OSHA Annual', date: '2026-07-15', type: 'Internal', auditor: 'Mike R.', status: 'Scheduled', findings: '--' },
  { regulation: 'GDPR Review', date: '2026-03-15', type: 'Internal', auditor: 'Lisa K.', status: 'In Progress', findings: '2 so far' },
  { regulation: 'Fire Safety', date: '2026-02-20', type: 'Internal', auditor: 'Mike R.', status: 'Complete', findings: '0' },
  { regulation: 'IT Security', date: '2026-01-30', type: 'Internal', auditor: 'James T.', status: 'Complete', findings: '1' },
];

const POLICIES = [
  { name: 'Information Security Policy', category: 'IT', version: '3.2', reviewed: '2026-01-15', nextReview: '2027-01-15', status: 'Current' },
  { name: 'Data Retention Policy', category: 'GDPR', version: '1.4', reviewed: '2024-08-10', nextReview: '2025-08-10', status: 'Outdated' },
  { name: 'Workplace Safety Manual', category: 'OSHA', version: '5.0', reviewed: '2026-02-01', nextReview: '2027-02-01', status: 'Current' },
  { name: 'Quality Management Plan', category: 'ISO', version: '2.1', reviewed: '2025-06-20', nextReview: '2026-06-20', status: 'Needs Review' },
  { name: 'Incident Response Plan', category: 'SOC2', version: '2.8', reviewed: '2025-12-01', nextReview: '2026-12-01', status: 'Current' },
  { name: 'Employee Privacy Policy', category: 'GDPR', version: '1.2', reviewed: '2024-11-15', nextReview: '2025-11-15', status: 'Outdated' },
  { name: 'Vendor Management Policy', category: 'Internal', version: '1.6', reviewed: '2025-09-10', nextReview: '2026-09-10', status: 'Needs Review' },
];

const FINDINGS_LIST = [
  { finding: 'Document control gaps in quality records', regulation: 'ISO 9001', severity: 'Critical', owner: 'Sarah M.', deadline: '2026-03-15', status: 'Open', remediation: 'Implement digital document management, retrain staff on version control' },
  { finding: 'Calibration records incomplete for 3 instruments', regulation: 'ISO 9001', severity: 'High', owner: 'Sarah M.', deadline: '2026-03-20', status: 'In Progress', remediation: 'Schedule calibrations, update tracking spreadsheet' },
  { finding: 'Management review overdue by 45 days', regulation: 'ISO 9001', severity: 'High', owner: 'Sarah M.', deadline: '2026-03-10', status: 'Overdue', remediation: 'Schedule emergency management review meeting' },
  { finding: 'Data retention periods not enforced', regulation: 'GDPR', severity: 'High', owner: 'Lisa K.', deadline: '2026-04-01', status: 'Open', remediation: 'Implement automated data purging, update retention schedule' },
  { finding: 'Consent forms missing for 2 data flows', regulation: 'GDPR', severity: 'Medium', owner: 'Lisa K.', deadline: '2026-04-15', status: 'Open', remediation: 'Draft consent forms, update privacy notices' },
  { finding: 'Cross-border transfer assessment incomplete', regulation: 'GDPR', severity: 'Medium', owner: 'Lisa K.', deadline: '2026-04-30', status: 'Open', remediation: 'Complete DPIA, implement SCCs where needed' },
  { finding: 'Access review documentation format change', regulation: 'SOC2', severity: 'Low', owner: 'James T.', deadline: '2026-05-01', status: 'In Progress', remediation: 'Formalize new review cadence in policy doc' },
  { finding: 'Forklift certs lapsed for 6 employees', regulation: 'OSHA', severity: 'Medium', owner: 'Mike R.', deadline: '2026-03-15', status: 'In Progress', remediation: 'Training sessions scheduled for Mar 8-12' },
  { finding: 'Corrective action process not followed', regulation: 'ISO 9001', severity: 'Medium', owner: 'Sarah M.', deadline: '2026-03-25', status: 'Overdue', remediation: 'Retrain on CAPA process, assign CAPA champion' },
];

const badge = (v: string) => {
  const m: Record<string, string> = {
    Compliant: 'bg-emerald-50 text-emerald-600', 'Non-Compliant': 'bg-rose-50 text-rose-600', Partial: 'bg-amber-50 text-amber-600',
    'Under Review': 'bg-blue-50 text-blue-600', Exempt: 'bg-gray-100 text-gray-500',
    Current: 'bg-emerald-50 text-emerald-600', 'Needs Review': 'bg-amber-50 text-amber-600', Outdated: 'bg-rose-50 text-rose-600',
    Scheduled: 'bg-blue-50 text-blue-600', 'In Progress': 'bg-amber-50 text-amber-600', Complete: 'bg-emerald-50 text-emerald-600',
    Open: 'bg-blue-50 text-blue-600', Overdue: 'bg-rose-50 text-rose-600',
    Critical: 'bg-rose-50 text-rose-600', High: 'bg-rose-50 text-rose-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-blue-50 text-blue-600',
    OSHA: 'bg-emerald-50 text-emerald-600', SOC2: 'bg-blue-50 text-blue-600', GDPR: 'bg-violet-50 text-violet-600', 'ISO 9001': 'bg-amber-50 text-amber-600', Internal: 'bg-gray-100 text-gray-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

export default function ComplianceConsole() {
  useTrackConsoleView('compliance')
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/agents/compliance').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const sort = (key: string) => { setSortKey(key); setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'); setExpandedRow(null); };
  const sorted = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv)); return sortDir === 'asc' ? c : -c; }); };
  const arrow = (k: string) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalAction(action); setModalOpen(true);
    const res = await fetch('/api/agents/compliance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, policies: POLICIES, ...payload }) });
    const r = await res.json(); setAiResult(r.result || r.error || 'Complete'); setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['dashboard', 'audits', 'policies', 'findings'];
  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${sub.includes('overdue') || sub.includes('critical') ? 'text-rose-600' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
  const TH = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => sort(k)}>{children}{arrow(k)}</th>
  );

  if (loading) return <div className="p-8 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-3xl">&#x1F6E1;</span><div><h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>Compliance Console</h1><p className="text-xs text-gray-400">Legal Department</p></div></div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>
      <div className="flex gap-2 border-b border-gray-200">{tabs.map(t => (
        <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          {t === 'dashboard' ? 'Dashboard' : t === 'audits' ? 'Audit Tracker' : t === 'policies' ? 'Policy Library' : 'Findings'}
        </button>
      ))}</div>

      {tab === 'dashboard' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Overall Compliance" value="87%" /><KPI label="Open Findings" value="9" /><KPI label="Upcoming Audits" value="3" /><KPI label="Policies Due Review" value="5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>Compliance Score</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart><Pie data={DONUT_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} label={({ name, value }: any) => `${name}: ${value}%`}>
                {DONUT_DATA.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>By Framework</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={COMP_BY_FRAMEWORK}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="framework" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} /><Tooltip />
                <Bar dataKey="rate" name="Rate %" fill="#2A9D8F" /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search requirements..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="req">Requirement</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Framework</th><TH k="status">Status</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Last Audit</th><TH k="nextDue">Next Due</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Owner</th><TH k="findings">Findings</TH>
          </tr></thead><tbody>
            {sorted(REQS.filter(r => r.req.toLowerCase().includes(search.toLowerCase()))).map((r, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 cursor-pointer ${r.status === 'Non-Compliant' ? 'bg-rose-50/30' : ''}`} onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{r.req}</td><td className="px-4 py-3">{badge(r.framework)}</td>
                <td className="px-4 py-3">{badge(r.status)}</td><td className="px-4 py-3 text-gray-500">{r.lastAudit}</td><td className="px-4 py-3">{r.nextDue}</td>
                <td className="px-4 py-3 text-gray-500">{r.owner}</td>
                <td className="px-4 py-3 font-bold" style={{ color: r.findings > 2 ? '#DC2626' : r.findings > 0 ? '#F5920B' : '#059669' }}>{r.findings}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const r = sorted(REQS.filter(rx => rx.req.toLowerCase().includes(search.toLowerCase())))[expandedRow]; if (!r) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-3">{r.details}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600" onClick={() => handleAi('generate-checklist', { regulation: r.framework, scope: r.req })}>Generate Checklist</button>
                {r.findings > 0 && <button className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-medium hover:bg-rose-600" onClick={() => handleAi('remediation-plan', { finding: r.details, regulation: r.framework, severity: r.findings > 2 ? 'Critical' : 'Medium' })}>Remediation Plan</button>}
              </div>
            </div>
          ); })()}
        </div>
      </>}

      {tab === 'audits' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Scheduled" value="3" /><KPI label="In Progress" value="1" /><KPI label="Completed Q1" value="2" /><KPI label="Clean Audits" value="1" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="regulation">Regulation</TH><TH k="date">Date</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Type</th><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Auditor</th><TH k="status">Status</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Findings</th>
          </tr></thead><tbody>
            {sorted(AUDITS).map((a, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{a.regulation}</td><td className="px-4 py-3">{a.date}</td>
                <td className="px-4 py-3">{badge(a.type === 'External' ? 'Critical' : 'Medium')}<span className="ml-1 text-xs">{a.type}</span></td>
                <td className="px-4 py-3 text-gray-500">{a.auditor}</td><td className="px-4 py-3">{badge(a.status)}</td><td className="px-4 py-3">{a.findings}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </>}

      {tab === 'policies' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Total Policies" value="28" /><KPI label="Current" value="19" /><KPI label="Needs Review" value="5" /><KPI label="Outdated" value="4" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <TH k="name">Policy</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Category</th><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Ver</th><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Reviewed</th><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Next Review</th><TH k="status">Status</TH>
          </tr></thead><tbody>
            {sorted(POLICIES).map((p, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${p.status === 'Outdated' ? 'bg-rose-50/30' : ''}`}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{p.name}</td><td className="px-4 py-3">{p.category}</td><td className="px-4 py-3 text-gray-500">v{p.version}</td>
                <td className="px-4 py-3 text-gray-500">{p.reviewed}</td><td className="px-4 py-3">{p.nextReview}</td><td className="px-4 py-3">{badge(p.status)}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600" onClick={() => handleAi('policy-review')}>Review Policy Gaps</button>
      </>}

      {tab === 'findings' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Open Findings" value="9" /><KPI label="Critical" value="1" sub="critical finding" /><KPI label="High" value="3" /><KPI label="Overdue" value="2" sub="overdue items" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Finding</th><TH k="regulation">Reg</TH><TH k="severity">Severity</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Owner</th><TH k="deadline">Deadline</TH><TH k="status">Status</TH>
          </tr></thead><tbody>
            {sorted(FINDINGS_LIST).map((f, i) => (
              <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 cursor-pointer ${f.status === 'Overdue' ? 'bg-rose-50/30' : ''}`} onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <td className="px-4 py-3 text-xs text-gray-700 max-w-xs truncate">{f.finding}</td>
                <td className="px-4 py-3">{f.regulation}</td><td className="px-4 py-3">{badge(f.severity)}</td>
                <td className="px-4 py-3 text-gray-500">{f.owner}</td><td className="px-4 py-3">{f.deadline}</td><td className="px-4 py-3">{badge(f.status)}</td>
              </tr>
            ))}
          </tbody></table>
          {expandedRow !== null && (() => { const f = sorted(FINDINGS_LIST)[expandedRow]; if (!f) return null; return (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2"><span className="text-gray-400">Remediation:</span> {f.remediation}</p>
              <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600" onClick={() => handleAi('remediation-plan', { finding: f.finding, regulation: f.regulation, severity: f.severity })}>Generate Detailed Plan</button>
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
