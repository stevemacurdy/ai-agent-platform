'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const PROJECTS = [
  { name: 'DC Expansion Phase 2', status: 'behind', progress: 62, due: '2026-03-28', lead: 'Sarah M.', budgetUsed: 78, budget: 420000, desc: 'Expanding distribution center by 50K sq ft including new racking, conveyors, and loading docks.', team: 'Sarah M., Mike R., James T., 4 contractors', milestones: 'Foundation: Done | Framing: Done | Electrical: In Progress | Racking: Pending', blocker: 'Electrical subcontractor 3 days behind schedule' },
  { name: 'Conveyor Upgrade', status: 'active', progress: 85, due: '2026-03-15', lead: 'Mike R.', budgetUsed: 71, budget: 185000, desc: 'Replacing belt conveyors in zones A-C with high-speed sortation system.', team: 'Mike R., 2 technicians', milestones: 'Zone A: Done | Zone B: Done | Zone C: 60%', blocker: '' },
  { name: 'WMS Migration', status: 'at-risk', progress: 45, due: '2026-04-10', lead: 'Lisa K.', budgetUsed: 52, budget: 95000, desc: 'Migrating from legacy WMS to cloud-based platform with real-time inventory sync.', team: 'Lisa K., David C., 1 consultant', milestones: 'Data mapping: Done | API setup: In Progress | Testing: Not Started', blocker: 'API integration issues with legacy system' },
  { name: 'Safety Audit', status: 'active', progress: 90, due: '2026-03-08', lead: 'James T.', budgetUsed: 88, budget: 28000, desc: 'Annual OSHA compliance audit and corrective action plan.', team: 'James T., safety team (3)', milestones: 'Walkthrough: Done | Report: Done | Remediation: 80%', blocker: '' },
  { name: 'Forklift Fleet Renewal', status: 'active', progress: 30, due: '2026-05-01', lead: 'Alex P.', budgetUsed: 25, budget: 340000, desc: 'Replacing 8 propane forklifts with electric models including charging infrastructure.', team: 'Alex P., 1 electrician', milestones: 'Vendor selection: Done | Charging stations: In Progress | Delivery: Pending', blocker: '' },
  { name: 'Racking Install Bay 4', status: 'complete', progress: 100, due: '2026-02-28', lead: 'Sarah M.', budgetUsed: 96, budget: 72000, desc: 'Installed 4-tier selective racking in Bay 4, adding 1,200 pallet positions.', team: 'Sarah M., 3 installers', milestones: 'All Complete', blocker: '' },
];

const TEAM = [
  { name: 'Sarah M.', role: 'Project Lead', projects: 2, hours: 48, util: 96, status: 'Over-Allocated' },
  { name: 'Mike R.', role: 'Field Engineer', projects: 1, hours: 42, util: 84, status: 'On Track' },
  { name: 'Lisa K.', role: 'Systems Analyst', projects: 1, hours: 45, util: 90, status: 'On Track' },
  { name: 'James T.', role: 'Safety Manager', projects: 1, hours: 38, util: 76, status: 'On Track' },
  { name: 'Alex P.', role: 'Procurement', projects: 1, hours: 44, util: 88, status: 'On Track' },
  { name: 'David C.', role: 'Developer', projects: 1, hours: 46, util: 92, status: 'Over-Allocated' },
  { name: 'Ryan W.', role: 'Installer', projects: 0, hours: 20, util: 40, status: 'Under-Allocated' },
  { name: 'Tom B.', role: 'Installer', projects: 0, hours: 18, util: 36, status: 'Under-Allocated' },
];

const RESOURCE_CHART = [
  { team: 'Leads', allocated: 93, available: 7 },
  { team: 'Engineers', allocated: 84, available: 16 },
  { team: 'Analysts', allocated: 90, available: 10 },
  { team: 'Installers', allocated: 38, available: 62 },
  { team: 'Safety', allocated: 76, available: 24 },
];

const EQUIPMENT = [
  { asset: 'Forklift #1 (Electric)', type: 'Forklift', status: 'Operational', lastMaint: '2026-02-15', nextMaint: '2026-04-15', uptime: 98.2 },
  { asset: 'Forklift #2 (Electric)', type: 'Forklift', status: 'Operational', lastMaint: '2026-02-15', nextMaint: '2026-04-15', uptime: 97.8 },
  { asset: 'Forklift #3 (Propane)', type: 'Forklift', status: 'Operational', lastMaint: '2026-01-20', nextMaint: '2026-03-20', uptime: 95.1 },
  { asset: 'Forklift #4 (Propane)', type: 'Forklift', status: 'Warning', lastMaint: '2025-12-01', nextMaint: '2026-03-01', uptime: 88.4 },
  { asset: 'Conveyor Line A', type: 'Conveyor', status: 'Operational', lastMaint: '2026-02-28', nextMaint: '2026-05-28', uptime: 99.1 },
  { asset: 'Shrink Wrapper', type: 'Packaging', status: 'Down', lastMaint: '2026-02-20', nextMaint: 'N/A', uptime: 82.3 },
  { asset: 'Dock Leveler #1', type: 'Dock', status: 'Operational', lastMaint: '2026-01-10', nextMaint: '2026-04-10', uptime: 99.5 },
];

const EFFICIENCY = [
  { month: 'Apr', completed: 3, onTime: 100, budgetVar: -2, satisfaction: 4.2 },
  { month: 'May', completed: 2, onTime: 100, budgetVar: -5, satisfaction: 4.0 },
  { month: 'Jun', completed: 4, onTime: 75, budgetVar: 8, satisfaction: 3.8 },
  { month: 'Jul', completed: 3, onTime: 67, budgetVar: 12, satisfaction: 3.6 },
  { month: 'Aug', completed: 2, onTime: 100, budgetVar: -1, satisfaction: 4.1 },
  { month: 'Sep', completed: 5, onTime: 80, budgetVar: 3, satisfaction: 3.9 },
  { month: 'Oct', completed: 3, onTime: 100, budgetVar: -4, satisfaction: 4.3 },
  { month: 'Nov', completed: 4, onTime: 75, budgetVar: 6, satisfaction: 3.7 },
  { month: 'Dec', completed: 2, onTime: 100, budgetVar: -2, satisfaction: 4.1 },
  { month: 'Jan', completed: 3, onTime: 100, budgetVar: -3, satisfaction: 4.4 },
  { month: 'Feb', completed: 4, onTime: 75, budgetVar: 5, satisfaction: 4.0 },
  { month: 'Mar', completed: 1, onTime: 100, budgetVar: -1, satisfaction: 4.2 },
];

const badge = (v: string) => {
  const m: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-600', complete: 'bg-emerald-50 text-emerald-600',
    'at-risk': 'bg-rose-50 text-rose-600', behind: 'bg-rose-50 text-rose-600',
    planning: 'bg-blue-50 text-blue-600', 'on-hold': 'bg-amber-50 text-amber-600',
    Operational: 'bg-emerald-50 text-emerald-600', Warning: 'bg-amber-50 text-amber-600',
    Down: 'bg-rose-50 text-rose-600', 'On Track': 'bg-emerald-50 text-emerald-600',
    'Over-Allocated': 'bg-rose-50 text-rose-600', 'Under-Allocated': 'bg-amber-50 text-amber-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>;
};

export default function OperationsConsole() {
  useTrackConsoleView('operations')
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('projects');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/agents/operations').then(r => r.json())
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
    const res = await fetch('/api/agents/operations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, projects: PROJECTS, teamData: TEAM, ...payload }),
    });
    const r = await res.json();
    setAiResult(r.result || r.error || 'Complete');
    setAiLoading(false);
  };

  const src = data?.source;
  const tabs = ['projects', 'resources', 'equipment', 'efficiency'];

  const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${sub.includes('+') || sub.includes('↑') ? 'text-emerald-600' : sub.includes('-') || sub.includes('↓') || sub.includes('behind') ? 'text-rose-600' : 'text-gray-400'}`}>{sub}</p>}
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
          <span className="text-3xl">&#x2699;&#xFE0F;</span>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>Operations Console</h1>
            <p className="text-xs text-gray-400">Operations Department</p>
          </div>
        </div>
        {src && <span className={`px-3 py-1 rounded-full text-xs font-medium ${src === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{src === 'live' ? 'Live Data' : 'Demo Data'}</span>}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); setExpandedRow(null); setSortKey(''); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t === 'projects' ? 'Project Board' : t === 'resources' ? 'Resources' : t === 'equipment' ? 'Equipment' : 'Efficiency'}
          </button>
        ))}
      </div>

      {tab === 'projects' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Active Projects" value="8" />
          <KPI label="Resource Utilization" value="76%" />
          <KPI label="On-Time Delivery" value="88%" />
          <KPI label="Equipment Uptime" value="94%" />
        </div>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search projects..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="name">Project</TH><TH k="status">Status</TH><TH k="progress">Progress</TH>
              <TH k="due">Due Date</TH><th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Lead</th>
              <TH k="budgetUsed">Budget Used</TH>
            </tr></thead>
            <tbody>
              {sorted(PROJECTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))).map((p, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{p.name}</td>
                  <td className="px-4 py-3">{badge(p.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${p.progress}%`,
                          background: p.progress === 100 ? '#059669' : p.status === 'behind' || p.status === 'at-risk' ? '#DC2626' : '#F5920B'
                        }} />
                      </div>
                      <span className="text-xs font-medium">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.due}</td>
                  <td className="px-4 py-3">{p.lead}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.budgetUsed}%`, background: p.budgetUsed > 90 ? '#DC2626' : '#2A9D8F' }} />
                      </div>
                      <span className="text-xs">{p.budgetUsed}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expandedRow !== null && (() => {
            const p = sorted(PROJECTS.filter(px => px.name.toLowerCase().includes(search.toLowerCase())))[expandedRow];
            if (!p) return null;
            return (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">{p.desc}</p>
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div><span className="text-gray-400">Team:</span> <span className="font-medium">{p.team}</span></div>
                  <div><span className="text-gray-400">Budget:</span> <span className="font-medium">${(p.budget).toLocaleString()}</span></div>
                  <div><span className="text-gray-400">Milestones:</span> <span className="font-medium">{p.milestones}</span></div>
                  {p.blocker && <div><span className="text-gray-400">Blocker:</span> <span className="font-medium text-rose-600">{p.blocker}</span></div>}
                </div>
              </div>
            );
          })()}
        </div>
      </>}

      {tab === 'resources' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Total Team" value="24" />
          <KPI label="Over-Allocated" value="3" sub="needs attention" />
          <KPI label="Under-Allocated" value="5" />
          <KPI label="Avg Utilization" value="76%" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>Allocated vs Available Hours by Team</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={RESOURCE_CHART} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 100]} /><YAxis dataKey="team" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip /><Legend />
              <Bar dataKey="allocated" fill="#F5920B" name="Allocated %" stackId="a" />
              <Bar dataKey="available" fill="#D1D5DB" name="Available %" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="name">Name</TH><TH k="role">Role</TH><TH k="projects">Projects</TH>
              <TH k="hours">Hours</TH><TH k="util">Utilization</TH><TH k="status">Status</TH>
            </tr></thead>
            <tbody>
              {sorted(TEAM).map((t, i) => (
                <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${t.status === 'Over-Allocated' ? 'bg-rose-50/30' : ''}`}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{t.name}</td>
                  <td className="px-4 py-3 text-gray-600">{t.role}</td>
                  <td className="px-4 py-3">{t.projects}</td>
                  <td className="px-4 py-3">{t.hours}h</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.util}%`, background: t.util > 90 ? '#DC2626' : t.util < 50 ? '#F5920B' : '#059669' }} />
                      </div>
                      <span className="text-xs">{t.util}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{badge(t.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          onClick={() => handleAi('resource-plan')}>Optimize Resources</button>
      </>}

      {tab === 'equipment' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Total Assets" value="34" />
          <KPI label="Operational" value="32" />
          <KPI label="Warning" value="1" sub="maintenance overdue" />
          <KPI label="Down" value="1" sub="shrink wrapper" />
        </div>
        {EQUIPMENT.filter(e => e.status !== 'Operational').length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-rose-700 mb-2">Maintenance Alerts</h3>
            {EQUIPMENT.filter(e => e.status !== 'Operational').map((e, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-rose-600">
                <span className="font-medium">{e.asset}</span> — {e.status === 'Down' ? 'Currently down, service required' : 'Maintenance overdue since ' + e.nextMaint}
              </div>
            ))}
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="asset">Asset</TH><TH k="type">Type</TH><TH k="status">Status</TH>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Last Maint.</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Next Maint.</th>
              <TH k="uptime">Uptime %</TH>
            </tr></thead>
            <tbody>
              {sorted(EQUIPMENT).map((e, i) => (
                <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${e.status === 'Down' ? 'bg-rose-50/30' : e.status === 'Warning' ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{e.asset}</td>
                  <td className="px-4 py-3 text-gray-600">{e.type}</td>
                  <td className="px-4 py-3">{badge(e.status)}</td>
                  <td className="px-4 py-3 text-gray-500">{e.lastMaint}</td>
                  <td className="px-4 py-3 text-gray-500">{e.nextMaint}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: e.uptime > 95 ? '#059669' : e.uptime > 85 ? '#F5920B' : '#DC2626' }}>{e.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}

      {tab === 'efficiency' && <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Avg On-Time" value="88%" />
          <KPI label="Avg Under Budget" value="67%" />
          <KPI label="Improvement Trend" value="+4%" sub="↑ vs last quarter" />
          <KPI label="Bottleneck" value="Resource allocation" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#1B2A4A' }}>On-Time Delivery Rate (12 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={EFFICIENCY}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis domain={[50, 100]} /><Tooltip />
              <Line type="monotone" dataKey="onTime" stroke="#2A9D8F" strokeWidth={2} dot={{ r: 3 }} name="On-Time %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <TH k="month">Month</TH><TH k="completed">Completed</TH><TH k="onTime">On-Time %</TH>
              <TH k="budgetVar">Budget Var %</TH><TH k="satisfaction">Satisfaction</TH>
            </tr></thead>
            <tbody>
              {sorted(EFFICIENCY).map((e, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{e.month}</td>
                  <td className="px-4 py-3">{e.completed}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: e.onTime === 100 ? '#059669' : '#F5920B' }}>{e.onTime}%</td>
                  <td className="px-4 py-3" style={{ color: e.budgetVar <= 0 ? '#059669' : '#DC2626' }}>{e.budgetVar > 0 ? '+' : ''}{e.budgetVar}%</td>
                  <td className="px-4 py-3">{e.satisfaction}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
            onClick={() => handleAi('status-report')}>Generate Status Report</button>
          <button className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600"
            onClick={() => handleAi('risk-assessment')}>Run Risk Assessment</button>
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
