'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TABS = [
  { id: 'budget', label: 'Budget vs Actual', icon: '\u{1F4CA}' },
  { id: 'forecasts', label: 'Forecasts', icon: '\u{1F52E}' },
  { id: 'costcenters', label: 'Cost Centers', icon: '\u{1F4CB}' },
  { id: 'runway', label: 'Runway', icon: '\u{2708}\u{FE0F}' },
];

const DEPT_DATA = [
  { dept: 'Engineering', budget: 120000, actual: 134000, pct: 112 },
  { dept: 'Sales', budget: 95000, actual: 88000, pct: 93 },
  { dept: 'Marketing', budget: 65000, actual: 80000, pct: 123 },
  { dept: 'Operations', budget: 48000, actual: 45000, pct: 94 },
  { dept: 'HR', budget: 32000, actual: 29000, pct: 91 },
  { dept: 'Training', budget: 18000, actual: 12000, pct: 67 },
];

const FORECAST_DATA = [
  { month: 'Apr', revenue: 420000, expense: 290000, net: 130000, confidence: 88 },
  { month: 'May', revenue: 438000, expense: 295000, net: 143000, confidence: 84 },
  { month: 'Jun', revenue: 456000, expense: 302000, net: 154000, confidence: 80 },
  { month: 'Jul', revenue: 470000, expense: 308000, net: 162000, confidence: 76 },
  { month: 'Aug', revenue: 480000, expense: 312000, net: 168000, confidence: 72 },
  { month: 'Sep', revenue: 492000, expense: 318000, net: 174000, confidence: 68 },
];

const PIE_DATA = [
  { name: 'SaaS & Software', value: 42000 }, { name: 'Payroll', value: 156000 },
  { name: 'Facilities', value: 38000 }, { name: 'Marketing', value: 34000 },
  { name: 'Travel', value: 12000 }, { name: 'Equipment', value: 28000 },
];
const PIE_COLORS = ['#F5920B', '#1B2A4A', '#2A9D8F', '#EC4899', '#6366F1', '#059669'];

const COST_CENTERS = [
  { name: 'Engineering', owner: 'Jordan R.', budget: 120000, actual: 134000, status: 'Over', largest: 'Cloud infrastructure ($52K)' },
  { name: 'Sales', owner: 'Sarah M.', budget: 95000, actual: 88000, status: 'Under', largest: 'Travel & entertainment ($24K)' },
  { name: 'Marketing', owner: 'Lisa K.', budget: 65000, actual: 80000, status: 'Over', largest: 'Ad spend ($38K)' },
  { name: 'Operations', owner: 'Tom B.', budget: 48000, actual: 45000, status: 'On Track', largest: 'Equipment maintenance ($18K)' },
  { name: 'HR', owner: 'Amy J.', budget: 32000, actual: 29000, status: 'Under', largest: 'Recruiting ($14K)' },
  { name: 'Support', owner: 'David K.', budget: 22000, actual: 20000, status: 'Under', largest: 'Tool subscriptions ($8K)' },
  { name: 'Training', owner: 'Amy J.', budget: 18000, actual: 12000, status: 'Under', largest: 'LMS platform ($4K)' },
  { name: 'Finance', owner: 'Steve M.', budget: 28000, actual: 26000, status: 'On Track', largest: 'Audit & compliance ($12K)' },
];

const RUNWAY_DATA = [
  { month: 'Now', best: 5100000, likely: 5100000, worst: 5100000 },
  { month: 'M3', best: 5480000, likely: 5020000, worst: 4700000 },
  { month: 'M6', best: 5900000, likely: 4800000, worst: 4100000 },
  { month: 'M9', best: 6400000, likely: 4500000, worst: 3200000 },
  { month: 'M12', best: 7100000, likely: 4100000, worst: 2100000 },
  { month: 'M18', best: 8800000, likely: 3200000, worst: 0 },
  { month: 'M24', best: 11200000, likely: 2000000, worst: 0 },
];

const SCENARIOS = [
  { name: 'Best Case', burn: '$248K/mo', growth: '15% MoM', runway: '24+ months', risk: 'Low' },
  { name: 'Likely Case', burn: '$284K/mo', growth: '8% MoM', runway: '18 months', risk: 'Medium' },
  { name: 'Worst Case', burn: '$320K/mo', growth: '2% MoM', runway: '12 months', risk: 'High' },
];

function Badge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  const cls = s.includes('over') || s.includes('high') || s.includes('critical') ? 'bg-rose-50 text-rose-600'
    : s.includes('under') || s.includes('on track') || s.includes('low') || s.includes('completed') ? 'bg-emerald-50 text-emerald-600'
    : 'bg-amber-50 text-amber-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

function KPI({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><span>{icon}</span>{label}</div>
      <div className="text-2xl font-bold text-[#1B2A4A]">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function FinOpsConsole() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('budget');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [scenarioQ, setScenarioQ] = useState('');
  const [showScenario, setShowScenario] = useState(false);

  useEffect(() => {
    fetch('/api/agents/finops').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const sort = (rows: any[]) => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'number' ? av - bv : String(av || '').localeCompare(String(bv || ''));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  };
  const toggleSort = (key: string) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('desc'); } };

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalTitle(action === 'forecast' ? 'AI Spending Forecast' : 'Scenario Analysis'); setModalOpen(true);
    const res = await fetch('/api/agents/finops', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload }) });
    const result = await res.json();
    setAiResult(result.result || result.error || 'Complete'); setAiLoading(false);
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

  const source = data?.source || 'demo';
  const costs = data?.costs || [];
  const Th = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-[#1B2A4A]" onClick={() => toggleSort(k)}>
      {children} {sortKey === k ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
    </th>
  );

  const pctBar = (pct: number) => {
    const color = pct > 100 ? '#DC2626' : pct > 90 ? '#F5920B' : '#059669';
    return <div className="flex items-center gap-2"><div className="w-16 h-2 bg-gray-100 rounded-full"><div className="h-2 rounded-full" style={{ width: `${Math.min(pct, 120)}%`, backgroundColor: color, maxWidth: '100%' }} /></div><span className="text-xs">{pct}%</span></div>;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">{'\u{1F4CA}'} FinOps Agent</h1>
          <p className="text-sm text-gray-500">Financial operations and spend optimization</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${source === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {source === 'live' ? 'Live Data' : 'Demo Data'}
        </span>
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setExpanded(null); setSortKey(''); setSearch(''); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-[#F5920B] text-[#1B2A4A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Budget vs Actual */}
      {tab === 'budget' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Monthly Burn" value="$284K" icon={'\u{1F525}'} sub="+5% vs last month" />
          <KPI label="Revenue" value="$412K" icon={'\u{1F4B0}'} sub="+12% MoM" />
          <KPI label="Gross Margin" value="67%" icon={'\u{1F4C8}'} sub="+2% improvement" />
          <KPI label="Runway" value="18 months" icon={'\u{2708}\u{FE0F}'} sub="At current burn rate" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Budget vs Actual by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={DEPT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="budget" fill="#2A9D8F" name="Budget" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#F5920B" name="Actual" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..." className="px-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#F5920B]/30" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><Th k="dept">Department</Th><Th k="budget">Budget</Th><Th k="actual">Actual</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Variance</th><Th k="pct">% Used</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Trend</th></tr></thead>
            <tbody>
              {sort(DEPT_DATA.filter(d => !search || d.dept.toLowerCase().includes(search.toLowerCase()))).map((d, i) => {
                const variance = d.actual - d.budget;
                return (
                  <>{/* eslint-disable-next-line react/jsx-key */}
                  <tr className={`border-t border-gray-50 cursor-pointer hover:bg-gray-50/50 ${expanded === i ? 'bg-orange-50/30' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                    <td className="px-3 py-3 font-medium text-[#1B2A4A]">{d.dept}</td>
                    <td className="px-3 py-3">${d.budget.toLocaleString()}</td>
                    <td className="px-3 py-3 font-medium">${d.actual.toLocaleString()}</td>
                    <td className="px-3 py-3"><span className={variance > 0 ? 'text-rose-600' : 'text-emerald-600'}>{variance > 0 ? '+' : ''}${variance.toLocaleString()}</span></td>
                    <td className="px-3 py-3">{pctBar(d.pct)}</td>
                    <td className="px-3 py-3">{variance > 0 ? '\u2191' : variance < 0 ? '\u2193' : '\u2192'}</td>
                  </tr>
                  {expanded === i && (
                    <tr key={`exp-${i}`}><td colSpan={6} className="bg-gray-50/50 px-4 py-4 text-xs">
                      <div className="grid grid-cols-3 gap-4">
                        <div><span className="text-gray-400">Top Category</span><br />Cloud & SaaS: ${Math.round(d.actual * 0.38).toLocaleString()}</div>
                        <div><span className="text-gray-400">Monthly Trend</span><br />{variance > 0 ? 'Increasing 3 consecutive months' : 'Stable or decreasing'}</div>
                        <div><span className="text-gray-400">Notes</span><br />{d.pct > 100 ? 'Over budget - review needed' : 'Tracking within allocation'}</div>
                      </div>
                    </td></tr>
                  )}</>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>)}

      {/* Forecasts */}
      {tab === 'forecasts' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Q2 Revenue Forecast" value="$1.34M" icon={'\u{1F4B0}'} />
          <KPI label="Q2 Expense Forecast" value="$890K" icon={'\u{1F4CA}'} />
          <KPI label="Projected Margin" value="68%" icon={'\u{1F4C8}'} />
          <KPI label="Forecast Confidence" value="82%" icon={'\u{1F3AF}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Revenue vs Expense Projection (6 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={FORECAST_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="revenue" fill="#059669" fillOpacity={0.1} stroke="#059669" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expense" fill="#DC2626" fillOpacity={0.1} stroke="#DC2626" strokeWidth={2} name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-end">
          <button onClick={() => handleAi('forecast', { costs: costs.length ? costs : DEPT_DATA.map(d => ({ name: d.dept, budgeted: d.budget, actual: d.actual, variancePercent: d.pct - 100 })) })} className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg hover:bg-[#1B2A4A]/90">Generate AI Forecast</button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Month</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Revenue</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Expense</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Net</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Confidence</th></tr></thead>
            <tbody>{FORECAST_DATA.map(r => (<tr key={r.month} className="border-t border-gray-50"><td className="px-3 py-2">{r.month}</td><td className="px-3 py-2 text-emerald-600 font-medium">${r.revenue.toLocaleString()}</td><td className="px-3 py-2">${r.expense.toLocaleString()}</td><td className="px-3 py-2 font-medium">${r.net.toLocaleString()}</td><td className="px-3 py-2"><Badge status={r.confidence >= 80 ? 'On Track' : r.confidence >= 70 ? 'Medium' : 'Low'} /> {r.confidence}%</td></tr>))}</tbody>
          </table>
        </div>
      </div>)}

      {/* Cost Centers */}
      {tab === 'costcenters' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Total Cost Centers" value="8" icon={'\u{1F3E2}'} />
          <KPI label="Over Budget" value="2" icon={'\u{1F534}'} sub="Engineering, Marketing" />
          <KPI label="Under Budget" value="4" icon={'\u{1F7E2}'} />
          <KPI label="On Track" value="2" icon={'\u{2705}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Spend Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>
                {PIE_DATA.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><Th k="name">Cost Center</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Owner</th><Th k="budget">Budget</Th><Th k="actual">Actual</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Largest Line Item</th></tr></thead>
            <tbody>
              {sort(COST_CENTERS).map((c, i) => (
                <>{/* eslint-disable-next-line react/jsx-key */}
                <tr className={`border-t border-gray-50 cursor-pointer hover:bg-gray-50/50 ${expanded === i ? 'bg-orange-50/30' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                  <td className="px-3 py-3 font-medium text-[#1B2A4A]">{c.name}</td>
                  <td className="px-3 py-3 text-gray-500">{c.owner}</td>
                  <td className="px-3 py-3">${c.budget.toLocaleString()}</td>
                  <td className="px-3 py-3 font-medium">${c.actual.toLocaleString()}</td>
                  <td className="px-3 py-3"><Badge status={c.status} /></td>
                  <td className="px-3 py-3 text-xs text-gray-500">{c.largest}</td>
                </tr>
                {expanded === i && (
                  <tr key={`exp-${i}`}><td colSpan={6} className="bg-gray-50/50 px-4 py-4 text-xs">
                    <div className="grid grid-cols-3 gap-4">
                      <div><span className="text-gray-400">Variance</span><br /><span className={c.actual > c.budget ? 'text-rose-600' : 'text-emerald-600'}>${(c.actual - c.budget).toLocaleString()}</span></div>
                      <div><span className="text-gray-400">% Used</span><br />{Math.round((c.actual / c.budget) * 100)}%</div>
                      <div><span className="text-gray-400">Remaining</span><br />${Math.max(0, c.budget - c.actual).toLocaleString()}</div>
                    </div>
                  </td></tr>
                )}</>
              ))}
            </tbody>
          </table>
        </div>
      </div>)}

      {/* Runway */}
      {tab === 'runway' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Current Runway" value="18 months" icon={'\u{2708}\u{FE0F}'} sub="At likely burn rate" />
          <KPI label="Monthly Burn" value="$284K" icon={'\u{1F525}'} />
          <KPI label="Cash Reserves" value="$5.1M" icon={'\u{1F3E6}'} />
          <KPI label="Break-Even Revenue" value="$380K/mo" icon={'\u{1F3AF}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Cash Reserves Projection (3 Scenarios)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={RUNWAY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="best" fill="#059669" fillOpacity={0.1} stroke="#059669" strokeWidth={2} name="Best Case" />
              <Area type="monotone" dataKey="likely" fill="#F5920B" fillOpacity={0.15} stroke="#F5920B" strokeWidth={2} name="Likely" />
              <Area type="monotone" dataKey="worst" fill="#DC2626" fillOpacity={0.1} stroke="#DC2626" strokeWidth={2} name="Worst Case" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Scenario</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Burn Rate</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Revenue Growth</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Runway</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Risk</th></tr></thead>
            <tbody>{SCENARIOS.map(s => (<tr key={s.name} className="border-t border-gray-50"><td className="px-3 py-2 font-medium text-[#1B2A4A]">{s.name}</td><td className="px-3 py-2">{s.burn}</td><td className="px-3 py-2">{s.growth}</td><td className="px-3 py-2 font-medium">{s.runway}</td><td className="px-3 py-2"><Badge status={s.risk} /></td></tr>))}</tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <button onClick={() => setShowScenario(true)} className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg hover:bg-[#1B2A4A]/90">Run Scenario</button>
        </div>
      </div>)}

      {/* AI Modal */}
      {modalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1B2A4A]">{modalTitle}</h3>
            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          {aiLoading ? (<div className="flex items-center gap-3 py-8"><div className="w-5 h-5 border-2 border-[#F5920B] border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-500">Generating analysis...</span></div>
          ) : (<div><pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{aiResult}</pre>
            <button onClick={() => navigator.clipboard.writeText(aiResult)} className="mt-4 px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200">Copy to Clipboard</button></div>)}
        </div>
      </div>)}

      {/* Scenario Input Modal */}
      {showScenario && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowScenario(false)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">Run What-If Scenario</h3>
          <p className="text-sm text-gray-500 mb-4">Describe a scenario and AI will model the financial impact.</p>
          <textarea value={scenarioQ} onChange={e => setScenarioQ(e.target.value)} placeholder="e.g. What if we cut all SaaS subscriptions by $5K/month?" className="w-full border rounded-lg p-3 text-sm mb-4 h-24 focus:outline-none focus:ring-2 focus:ring-[#F5920B]/30" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowScenario(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
            <button onClick={() => { setShowScenario(false); handleAi('scenario', { question: scenarioQ }); setScenarioQ(''); }} className="px-4 py-2 bg-[#F5920B] text-white text-sm rounded-lg">Run Analysis</button>
          </div>
        </div>
      </div>)}
    </div>
  );
}
