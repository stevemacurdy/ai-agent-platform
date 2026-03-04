'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = [
  { id: 'active', label: 'Active Collections', icon: '\u{1F4B3}' },
  { id: 'aging', label: 'Aging Buckets', icon: '\u{1F4C5}' },
  { id: 'followups', label: 'Follow-Up Queue', icon: '\u{1F4DE}' },
  { id: 'performance', label: 'Performance', icon: '\u{1F4C8}' },
];

const PERF_DATA = [
  { month: 'Oct', rate: 72, collected: 168000 }, { month: 'Nov', rate: 74, collected: 182000 },
  { month: 'Dec', rate: 71, collected: 164000 }, { month: 'Jan', rate: 76, collected: 198000 },
  { month: 'Feb', rate: 78, collected: 212000 }, { month: 'Mar', rate: 81, collected: 224000 },
];

function Badge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  const cls = s.includes('critical') || s.includes('overdue') || s.includes('high') ? 'bg-rose-50 text-rose-600'
    : s.includes('medium') || s.includes('pending') || s.includes('in progress') ? 'bg-amber-50 text-amber-600'
    : s.includes('low') || s.includes('current') || s.includes('resolved') || s.includes('paid') ? 'bg-emerald-50 text-emerald-600'
    : 'bg-blue-50 text-blue-600';
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

export default function CollectionsConsole() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ id: '', notes: '', outcome: '' });
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    fetch('/api/agents/collections').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
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
    setAiLoading(true); setAiResult(''); setModalTitle(action === 'analyze' ? 'AI Collection Strategy' : 'Collection Letter'); setModalOpen(true);
    const res = await fetch('/api/agents/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload }) });
    const result = await res.json();
    setAiResult(result.result || result.error || 'Complete'); setAiLoading(false);
  };

  const handleLogContact = async () => {
    await fetch('/api/agents/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'log-contact', ...contactForm }) });
    setShowContact(false); setContactForm({ id: '', notes: '', outcome: '' });
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

  const accounts = data?.accounts || [];
  const aging = data?.aging || [];
  const summary = data?.summary || {};
  const source = data?.source || 'demo';
  const filtered = accounts.filter((a: any) => !search || a.client?.toLowerCase().includes(search.toLowerCase()));
  const rows = sort(filtered);
  const overdueAccounts = accounts.filter((a: any) => (a.oldestOverdueDays || 0) > 0);

  const Th = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-[#1B2A4A]" onClick={() => toggleSort(k)}>
      {children} {sortKey === k ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
    </th>
  );

  const riskBar = (score: number) => {
    const color = score >= 61 ? '#DC2626' : score >= 31 ? '#F5920B' : '#059669';
    return <div className="w-20 h-2 bg-gray-100 rounded-full"><div className="h-2 rounded-full" style={{ width: `${score}%`, backgroundColor: color }} /></div>;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">{'\u{1F4B3}'} Collections Agent</h1>
          <p className="text-sm text-gray-500">Accounts receivable recovery and risk management</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${source === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {source === 'live' ? 'Live Data' : 'Demo Data'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Outstanding" value={`$${Math.round(summary.totalAR || 0).toLocaleString()}`} icon={'\u{1F4B0}'} sub={`${summary.totalAccounts || 0} accounts`} />
        <KPI label="Collection Rate" value={`${summary.collectionRate || 0}%`} icon={'\u{1F4C8}'} sub="Current vs overdue" />
        <KPI label="Avg Days Overdue" value={`${summary.avgDSO || 0}`} icon={'\u{23F1}\u{FE0F}'} sub="Days sales outstanding" />
        <KPI label="At Risk Accounts" value={`${summary.accountsAtRisk || 0}`} icon={'\u{26A0}\u{FE0F}'} sub={`$${Math.round(summary.totalOverdue || 0).toLocaleString()} overdue`} />
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setExpanded(null); setSortKey(''); setSearch(''); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-[#F5920B] text-[#1B2A4A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Active Collections */}
      {tab === 'active' && (<div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="px-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#F5920B]/30" />
          <button onClick={() => handleAi('analyze', { accounts })} className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg hover:bg-[#1B2A4A]/90">AI Collection Strategy</button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><Th k="client">Customer</Th><Th k="invoiceCount">Invoices</Th><Th k="totalOwed">Amount</Th><Th k="oldestOverdueDays">Days Overdue</Th><Th k="reliabilityScore">Risk</Th><Th k="riskTier">Status</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Assigned</th></tr></thead>
            <tbody>
              {rows.map((a: any, i: number) => (
                <>{/* eslint-disable-next-line react/jsx-key */}
                <tr className={`border-t border-gray-50 cursor-pointer hover:bg-gray-50/50 ${expanded === i ? 'bg-orange-50/30' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                  <td className="px-3 py-3 font-medium text-[#1B2A4A]">{a.client}</td>
                  <td className="px-3 py-3">{a.invoiceCount}</td>
                  <td className="px-3 py-3 font-medium">${(a.totalOwed || 0).toLocaleString()}</td>
                  <td className="px-3 py-3">{a.oldestOverdueDays}</td>
                  <td className="px-3 py-3">{riskBar(a.reliabilityScore ? 100 - a.reliabilityScore : 50)}</td>
                  <td className="px-3 py-3"><Badge status={a.riskTier} /></td>
                  <td className="px-3 py-3 text-gray-400 text-xs">{a.contactName || '-'}</td>
                </tr>
                {expanded === i && (
                  <tr key={`exp-${a.id}`}><td colSpan={7} className="bg-gray-50/50 px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                      <div><span className="text-gray-400">Contact</span><br />{a.contactName} &middot; {a.contactEmail}</div>
                      <div><span className="text-gray-400">Last Contact</span><br />{a.lastContactDate || 'Never'}</div>
                      <div><span className="text-gray-400">Last Payment</span><br />{a.lastPaymentDate || 'None'}</div>
                      <div><span className="text-gray-400">Suggested</span><br />{a.suggestedAction}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); setContactForm({ id: a.id, notes: '', outcome: '' }); setShowContact(true); }} className="px-3 py-1.5 bg-[#2A9D8F] text-white text-xs rounded-lg">Log Contact</button>
                      <button onClick={e => { e.stopPropagation(); handleAi('generate-letter', { customerName: a.client, amount: a.totalOwed, daysOverdue: a.oldestOverdueDays, previousContacts: a.lastContactDate ? `Last contacted ${a.lastContactDate}` : 'No prior contact' }); }} className="px-3 py-1.5 bg-[#F5920B] text-white text-xs rounded-lg">Draft Letter</button>
                    </div>
                  </td></tr>
                )}</>
              ))}
            </tbody>
          </table>
        </div>
      </div>)}

      {/* Aging Buckets */}
      {tab === 'aging' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Total AR" value={`$${Math.round(summary.totalAR || 0).toLocaleString()}`} icon={'\u{1F4B0}'} />
          <KPI label="Highest Risk" value={accounts.length ? [...accounts].sort((a: any, b: any) => (b.oldestOverdueDays || 0) - (a.oldestOverdueDays || 0))[0]?.client : '-'} icon={'\u{1F534}'} sub={accounts.length ? `$${(accounts[0]?.totalOwed || 0).toLocaleString()}` : ''} />
          <KPI label="Avg Risk Score" value={`${accounts.length ? Math.round(accounts.reduce((s: number, a: any) => s + (100 - (a.reliabilityScore || 50)), 0) / accounts.length) : 0}`} icon={'\u{1F4CA}'} />
          <KPI label="Write-Off Candidates" value={`${accounts.filter((a: any) => (a.oldestOverdueDays || 0) > 120).length}`} icon={'\u{26D4}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Aging Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={aging.length ? aging : [{ label: 'Current', totalAmount: 48000 }, { label: '1-30', totalAmount: 32000 }, { label: '31-60', totalAmount: 18000 }, { label: '61-90', totalAmount: 12000 }, { label: '90+', totalAmount: 7000 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <Bar dataKey="totalAmount" fill="#F5920B" radius={[4, 4, 0, 0]} name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(aging.length ? aging : [{ label: 'Current', count: 8, totalAmount: 48000 }, { label: '1-30', count: 6, totalAmount: 32000 }, { label: '31-60', count: 4, totalAmount: 18000 }, { label: '61-90', count: 3, totalAmount: 12000 }, { label: '90+', count: 2, totalAmount: 7000 }]).map((b: any) => (
            <div key={b.label} className="bg-white rounded-lg border p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">{b.label}</div>
              <div className="text-lg font-bold text-[#1B2A4A]">${Math.round(b.totalAmount).toLocaleString()}</div>
              <div className="text-xs text-gray-400">{b.count} accounts</div>
            </div>
          ))}
        </div>
      </div>)}

      {/* Follow-Up Queue */}
      {tab === 'followups' && (<div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{overdueAccounts.length} accounts need follow-up</p>
          <button onClick={() => { setModalTitle('Batch Reminders'); setAiResult('Batch reminder emails would be sent to all accounts in the follow-up queue. This triggers AI-drafted personalized reminders for each overdue customer.'); setModalOpen(true); }} className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg">Send Batch Reminders</button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Customer</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Amount</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Days Overdue</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Last Contact</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Risk</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Action</th></tr></thead>
            <tbody>
              {overdueAccounts.map((a: any, i: number) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="px-3 py-3 font-medium text-[#1B2A4A]">{a.client}</td>
                  <td className="px-3 py-3">${(a.totalOwed || 0).toLocaleString()}</td>
                  <td className="px-3 py-3">{a.oldestOverdueDays}</td>
                  <td className="px-3 py-3 text-gray-400">{a.lastContactDate || 'Never'}</td>
                  <td className="px-3 py-3"><Badge status={a.riskTier} /></td>
                  <td className="px-3 py-3"><button onClick={() => { setContactForm({ id: a.id, notes: '', outcome: '' }); setShowContact(true); }} className="px-2 py-1 bg-[#2A9D8F] text-white text-xs rounded">Log Contact</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>)}

      {/* Performance */}
      {tab === 'performance' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Collected This Month" value="$224,000" icon={'\u{1F4B0}'} sub="+5.7% vs last month" />
          <KPI label="Recovery Rate" value="81%" icon={'\u{1F4C8}'} sub="Trending up" />
          <KPI label="Avg Days to Resolve" value="28" icon={'\u{23F1}\u{FE0F}'} sub="-3 days improvement" />
          <KPI label="Resolved This Month" value="12" icon={'\u{2705}'} sub="accounts closed" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Collection Rate Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={PERF_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[60, 90]} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} name="Collection %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Month</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Collected</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Rate</th></tr></thead>
            <tbody>{PERF_DATA.map(r => (<tr key={r.month} className="border-t border-gray-50"><td className="px-3 py-2">{r.month}</td><td className="px-3 py-2 font-medium">${r.collected.toLocaleString()}</td><td className="px-3 py-2"><Badge status={r.rate >= 78 ? 'On Track' : r.rate >= 72 ? 'Pending' : 'At Risk'} /></td></tr>))}</tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">AI Insights</h3>
          <div className="space-y-3">
            {[{ title: 'Positive Trend', text: 'Collection rate improved from 72% to 81% over 6 months. Maintain momentum by focusing on 30-60 day bucket before accounts age further.' },
              { title: 'High-Value Recovery', text: 'Top 3 overdue accounts represent 78% of total outstanding. Targeted outreach could recover $68K this month.' },
              { title: 'Process Improvement', text: 'Average resolution time dropped 3 days. Consider automating first reminders at day 7 overdue to continue the trend.' },
            ].map((r, i) => (<div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100"><div className="font-medium text-sm text-[#1B2A4A]">{r.title}</div><div className="text-xs text-gray-500 mt-1">{r.text}</div></div>))}
          </div>
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

      {/* Contact Form Modal */}
      {showContact && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowContact(false)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">Log Contact</h3>
          <textarea value={contactForm.notes} onChange={e => setContactForm(f => ({ ...f, notes: e.target.value }))} placeholder="Contact notes..." className="w-full border rounded-lg p-3 text-sm mb-3 h-24 focus:outline-none focus:ring-2 focus:ring-[#F5920B]/30" />
          <input value={contactForm.outcome} onChange={e => setContactForm(f => ({ ...f, outcome: e.target.value }))} placeholder="Next action..." className="w-full border rounded-lg p-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#F5920B]/30" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowContact(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
            <button onClick={handleLogContact} className="px-4 py-2 bg-[#2A9D8F] text-white text-sm rounded-lg">Save Contact</button>
          </div>
        </div>
      </div>)}
    </div>
  );
}
