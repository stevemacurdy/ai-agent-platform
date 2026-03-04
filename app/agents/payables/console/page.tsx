'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TABS = [
  { id: 'pending', label: 'Pending Invoices', icon: '\u{1F9FE}' },
  { id: 'schedule', label: 'Payment Schedule', icon: '\u{1F4C5}' },
  { id: 'vendors', label: 'Vendor Analytics', icon: '\u{1F4CA}' },
  { id: 'discounts', label: 'Discount Opportunities', icon: '\u{1F4B5}' },
];

const INVOICES = [
  { id: '1', vendor: 'Acme Supply', invoiceNumber: 'INV-4021', amount: 18200, dueDate: '2026-03-08', status: 'Pending', discount: 2, savings: 364, discountDeadline: '2026-03-05', approvedBy: '', method: 'ACH', terms: 'Net 30' },
  { id: '2', vendor: 'DataFlow', invoiceNumber: 'INV-3998', amount: 6400, dueDate: '2026-03-03', status: 'Past Due', discount: 0, savings: 0, discountDeadline: '', approvedBy: '', method: 'Wire', terms: 'Net 15' },
  { id: '3', vendor: 'FastShip', invoiceNumber: 'INV-4055', amount: 24500, dueDate: '2026-03-15', status: 'Pending', discount: 1.5, savings: 368, discountDeadline: '2026-03-10', approvedBy: '', method: 'ACH', terms: 'Net 45' },
  { id: '4', vendor: 'CloudHost', invoiceNumber: 'INV-4002', amount: 3200, dueDate: '2026-03-10', status: 'Pending', discount: 0, savings: 0, discountDeadline: '', approvedBy: '', method: 'Card', terms: 'Net 30' },
  { id: '5', vendor: 'ProStaff', invoiceNumber: 'INV-3945', amount: 9800, dueDate: '2026-03-01', status: 'Past Due', discount: 0, savings: 0, discountDeadline: '', approvedBy: '', method: 'ACH', terms: 'Net 30' },
  { id: '6', vendor: 'LogiParts', invoiceNumber: 'INV-4038', amount: 14700, dueDate: '2026-03-12', status: 'Pending', discount: 2, savings: 294, discountDeadline: '2026-03-08', approvedBy: '', method: 'ACH', terms: 'Net 30' },
  { id: '7', vendor: 'MountainWest Electric', invoiceNumber: 'INV-4060', amount: 8900, dueDate: '2026-03-18', status: 'Approved', discount: 0, savings: 0, discountDeadline: '', approvedBy: 'Steve M.', method: 'Check', terms: 'Net 30' },
  { id: '8', vendor: 'Unistrut Midwest', invoiceNumber: 'INV-4072', amount: 31200, dueDate: '2026-03-20', status: 'Pending', discount: 1, savings: 312, discountDeadline: '2026-03-14', approvedBy: '', method: 'Wire', terms: 'Net 45' },
];

const SCHED_DATA = [
  { week: 'Mar 3-7', amount: 87000 }, { week: 'Mar 10-14', amount: 65000 },
  { week: 'Mar 17-21', amount: 42000 }, { week: 'Mar 24-28', amount: 28000 },
];

const VENDOR_SPEND = [
  { name: 'Unistrut', value: 128000 }, { name: 'FastShip', value: 96000 }, { name: 'Acme Supply', value: 72000 },
  { name: 'ProStaff', value: 58000 }, { name: 'DataFlow', value: 42000 }, { name: 'Other', value: 82000 },
];
const PIE_COLORS = ['#1B2A4A', '#F5920B', '#2A9D8F', '#EC4899', '#6366F1', '#94A3B8'];

const VENDORS = [
  { name: 'Unistrut Midwest', spendYTD: 128000, invoices: 14, avgDays: 22, discountsCaptured: 2400, rating: 4.5 },
  { name: 'FastShip Logistics', spendYTD: 96000, invoices: 24, avgDays: 18, discountsCaptured: 1800, rating: 4.2 },
  { name: 'Acme Supply', spendYTD: 72000, invoices: 10, avgDays: 28, discountsCaptured: 1100, rating: 3.8 },
  { name: 'ProStaff Temp', spendYTD: 58000, invoices: 12, avgDays: 32, discountsCaptured: 0, rating: 3.5 },
  { name: 'DataFlow SaaS', spendYTD: 42000, invoices: 6, avgDays: 14, discountsCaptured: 0, rating: 4.0 },
  { name: 'CloudHost Inc', spendYTD: 38000, invoices: 12, avgDays: 10, discountsCaptured: 600, rating: 4.3 },
];

const DISCOUNT_TREND = [
  { month: 'Oct', rate: 68 }, { month: 'Nov', rate: 70 }, { month: 'Dec', rate: 65 },
  { month: 'Jan', rate: 72 }, { month: 'Feb', rate: 74 }, { month: 'Mar', rate: 78 },
];

const DISCOUNTS = [
  { vendor: 'Acme Supply', invoice: 'INV-4021', pct: 2, deadline: 'Mar 5', savings: 364, status: 'Available' },
  { vendor: 'FastShip', invoice: 'INV-4055', pct: 1.5, deadline: 'Mar 10', savings: 368, status: 'Available' },
  { vendor: 'LogiParts', invoice: 'INV-4038', pct: 2, deadline: 'Mar 8', savings: 294, status: 'Available' },
  { vendor: 'Unistrut', invoice: 'INV-4072', pct: 1, deadline: 'Mar 14', savings: 312, status: 'Available' },
  { vendor: 'Acme Supply', invoice: 'INV-3920', pct: 2, deadline: 'Feb 20', savings: 480, status: 'Captured' },
  { vendor: 'FastShip', invoice: 'INV-3880', pct: 1.5, deadline: 'Feb 8', savings: 312, status: 'Captured' },
  { vendor: 'DataFlow', invoice: 'INV-3901', pct: 1, deadline: 'Feb 15', savings: 120, status: 'Missed' },
];

function Badge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  const cls = s.includes('past due') || s.includes('overdue') || s.includes('missed') || s.includes('disputed') ? 'bg-rose-50 text-rose-600'
    : s.includes('pending') || s.includes('in progress') || s.includes('available') ? 'bg-amber-50 text-amber-600'
    : s.includes('approved') || s.includes('paid') || s.includes('captured') || s.includes('on track') ? 'bg-emerald-50 text-emerald-600'
    : s.includes('scheduled') ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

function KPI({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (<div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><span>{icon}</span>{label}</div>
    <div className="text-2xl font-bold text-[#1B2A4A]">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </div>);
}

export default function PayablesConsole() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => { fetch('/api/agents/payables').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const sort = (rows: any[]) => { if (!sortKey) return rows; return [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; const cmp = typeof av === 'number' ? av - bv : String(av || '').localeCompare(String(bv || '')); return sortDir === 'asc' ? cmp : -cmp; }); };
  const toggleSort = (key: string) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('desc'); } };

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalTitle(action === 'analyze-discounts' ? 'AI Discount Analysis' : 'Duplicate Detection'); setModalOpen(true);
    const res = await fetch('/api/agents/payables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload }) });
    const result = await res.json(); setAiResult(result.result || result.error || 'Complete'); setAiLoading(false);
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

  const bills = data?.bills || [];
  const summary = data?.summary || {};
  const source = data?.source || 'demo';
  const invoices = bills.length ? bills.map((b: any) => ({ id: b.id, vendor: b.vendorName || b.vendor, invoiceNumber: b.invoiceNumber || b.invoice_number, amount: b.amount, dueDate: b.dueDate || b.due_date, status: b.status || 'Pending', discount: b.earlyPayDiscount || b.early_pay_discount || 0, savings: (b.amount || 0) * ((b.earlyPayDiscount || b.early_pay_discount || 0) / 100), discountDeadline: b.discountDeadline || b.discount_deadline || '', terms: b.paymentTerms || 'Net 30' })) : INVOICES;
  const filtered = invoices.filter((i: any) => !search || i.vendor?.toLowerCase().includes(search.toLowerCase()));
  const rows = sort(filtered);

  const Th = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-[#1B2A4A]" onClick={() => toggleSort(k)}>
      {children} {sortKey === k ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
    </th>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">{'\u{1F9FE}'} Payables Agent</h1><p className="text-sm text-gray-500">Accounts payable optimization and vendor management</p></div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${source === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{source === 'live' ? 'Live Data' : 'Demo Data'}</span>
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (<button key={t.id} onClick={() => { setTab(t.id); setExpanded(null); setSortKey(''); setSearch(''); setSelected([]); }}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-[#F5920B] text-[#1B2A4A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t.icon} {t.label}</button>))}
      </div>

      {/* Pending Invoices */}
      {tab === 'pending' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Total Payables" value={`$${Math.round(summary.totalPayable || 423000).toLocaleString()}`} icon={'\u{1F4B0}'} />
          <KPI label="Pending Approval" value={`${invoices.filter((i: any) => i.status === 'Pending').length}`} icon={'\u{1F4CB}'} sub="invoices" />
          <KPI label="Early-Pay Savings" value={`$${Math.round(summary.potentialSavings || 8400).toLocaleString()}`} icon={'\u{1F4B5}'} sub="available" />
          <KPI label="Past Due" value={`${invoices.filter((i: any) => i.status === 'Past Due' || i.status === 'overdue').length}`} icon={'\u{1F534}'} sub="invoices" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." className="px-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#F5920B]/30" />
          {selected.length > 0 && <button onClick={async () => { await fetch('/api/agents/payables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'batch-approve', ids: selected }) }); setSelected([]); }} className="px-4 py-2 bg-[#2A9D8F] text-white text-sm rounded-lg">Batch Approve ({selected.length})</button>}
          <button onClick={() => handleAi('detect-duplicates', { invoices: invoices.map((i: any) => ({ vendor: i.vendor, invoiceNumber: i.invoiceNumber, amount: i.amount, dueDate: i.dueDate })) })} className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg">Detect Duplicates</button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? rows.map((r: any) => r.id) : [])} /></th><Th k="vendor">Vendor</Th><Th k="invoiceNumber">Invoice #</Th><Th k="amount">Amount</Th><Th k="dueDate">Due Date</Th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Discount</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Savings</th><Th k="status">Status</Th></tr></thead>
            <tbody>{rows.map((inv: any, i: number) => (
              <>{/* eslint-disable-next-line react/jsx-key */}
              <tr className={`border-t border-gray-50 cursor-pointer hover:bg-gray-50/50 ${expanded === i ? 'bg-orange-50/30' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(inv.id)} onChange={e => { e.stopPropagation(); setSelected(s => e.target.checked ? [...s, inv.id] : s.filter(x => x !== inv.id)); }} onClick={e => e.stopPropagation()} /></td>
                <td className="px-3 py-3 font-medium text-[#1B2A4A]">{inv.vendor}</td>
                <td className="px-3 py-3 text-gray-500">{inv.invoiceNumber}</td>
                <td className="px-3 py-3 font-medium">${(inv.amount || 0).toLocaleString()}</td>
                <td className="px-3 py-3">{inv.dueDate}</td>
                <td className="px-3 py-3">{inv.discount > 0 ? `${inv.discount}%` : '-'}</td>
                <td className="px-3 py-3 text-emerald-600">{inv.savings > 0 ? `$${Math.round(inv.savings).toLocaleString()}` : '-'}</td>
                <td className="px-3 py-3"><Badge status={inv.status} /></td>
              </tr>
              {expanded === i && (<tr key={`exp-${inv.id}`}><td colSpan={8} className="bg-gray-50/50 px-4 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                  <div><span className="text-gray-400">Terms</span><br />{inv.terms || 'Net 30'}</div>
                  <div><span className="text-gray-400">Payment Method</span><br />{inv.method || 'ACH'}</div>
                  <div><span className="text-gray-400">Discount Deadline</span><br />{inv.discountDeadline || 'N/A'}</div>
                  <div><span className="text-gray-400">Approved By</span><br />{inv.approvedBy || 'Not yet approved'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); fetch('/api/agents/payables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', id: inv.id, approvedBy: 'Current User' }) }); }} className="px-3 py-1.5 bg-[#2A9D8F] text-white text-xs rounded-lg">Approve</button>
                  <button onClick={e => { e.stopPropagation(); setModalTitle('Dispute Invoice'); setAiResult(`Invoice ${inv.invoiceNumber} from ${inv.vendor} for $${inv.amount.toLocaleString()} flagged for dispute. AP team will review within 48 hours.`); setModalOpen(true); }} className="px-3 py-1.5 bg-rose-500 text-white text-xs rounded-lg">Dispute</button>
                </div>
              </td></tr>)}</>
            ))}</tbody>
          </table>
        </div>
      </div>)}

      {/* Payment Schedule */}
      {tab === 'schedule' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Due This Week" value="$87K" icon={'\u{1F4C5}'} /><KPI label="Due Next Week" value="$65K" icon={'\u{1F4C6}'} /><KPI label="Total Scheduled" value="$142K" icon={'\u{2705}'} /><KPI label="Unscheduled" value="$28K" icon={'\u{26A0}\u{FE0F}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Payment Schedule (Next 4 Weeks)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={SCHED_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="week" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}K`} /><Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} /><Bar dataKey="amount" fill="#F5920B" radius={[4,4,0,0]} name="Amount Due" /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Date</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Vendor</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Amount</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Method</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th></tr></thead>
            <tbody>{invoices.sort((a: any, b: any) => (a.dueDate || '').localeCompare(b.dueDate || '')).map((inv: any, i: number) => (
              <tr key={i} className="border-t border-gray-50"><td className="px-3 py-2">{inv.dueDate}</td><td className="px-3 py-2 font-medium text-[#1B2A4A]">{inv.vendor}</td><td className="px-3 py-2">${(inv.amount || 0).toLocaleString()}</td><td className="px-3 py-2 text-gray-500">{inv.method || 'ACH'}</td><td className="px-3 py-2"><Badge status={inv.status} /></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>)}

      {/* Vendor Analytics */}
      {tab === 'vendors' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Active Vendors" value={`${summary.vendorCount || 34}`} icon={'\u{1F3E2}'} /><KPI label="Avg Payment Terms" value="28 days" icon={'\u{1F4C5}'} /><KPI label="Vendor Satisfaction" value="4.1/5" icon={'\u{2B50}'} /><KPI label="Open Disputes" value="2" icon={'\u{26A0}\u{FE0F}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Spend Distribution by Vendor</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={VENDOR_SPEND} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" label={({ name, percent }: any) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>{VENDOR_SPEND.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><Th k="name">Vendor</Th><Th k="spendYTD">Spend YTD</Th><Th k="invoices">Invoices</Th><Th k="avgDays">Avg Days to Pay</Th><Th k="discountsCaptured">Discounts Captured</Th><Th k="rating">Rating</Th></tr></thead>
            <tbody>{sort(VENDORS).map((v, i) => (
              <>{/* eslint-disable-next-line react/jsx-key */}
              <tr className={`border-t border-gray-50 cursor-pointer hover:bg-gray-50/50 ${expanded === i ? 'bg-orange-50/30' : ''}`} onClick={() => setExpanded(expanded === i ? null : i)}>
                <td className="px-3 py-3 font-medium text-[#1B2A4A]">{v.name}</td><td className="px-3 py-3">${v.spendYTD.toLocaleString()}</td><td className="px-3 py-3">{v.invoices}</td><td className="px-3 py-3">{v.avgDays}</td><td className="px-3 py-3 text-emerald-600">${v.discountsCaptured.toLocaleString()}</td><td className="px-3 py-3">{v.rating}/5</td>
              </tr>
              {expanded === i && (<tr key={`exp-${i}`}><td colSpan={6} className="bg-gray-50/50 px-4 py-4 text-xs"><div className="grid grid-cols-3 gap-4"><div><span className="text-gray-400">Contract</span><br />Active through 2026</div><div><span className="text-gray-400">Payment History</span><br />{v.avgDays < 20 ? 'Consistently early' : v.avgDays < 30 ? 'On time' : 'Often late'}</div><div><span className="text-gray-400">YoY Change</span><br />+{Math.round(v.spendYTD * 0.12).toLocaleString()} (12%)</div></div></td></tr>)}</>
            ))}</tbody>
          </table>
        </div>
      </div>)}

      {/* Discount Opportunities */}
      {tab === 'discounts' && (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Available Discounts" value="$8,400" icon={'\u{1F4B5}'} /><KPI label="Captured This Month" value="$3,200" icon={'\u{2705}'} /><KPI label="Missed This Month" value="$1,100" icon={'\u{274C}'} /><KPI label="Capture Rate" value="74%" icon={'\u{1F3AF}'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Discount Capture Rate (6 Months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={DISCOUNT_TREND}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} domain={[50, 90]} /><Tooltip /><Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} name="Capture Rate %" /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-end"><button onClick={() => handleAi('analyze-discounts', { invoices: invoices.filter((i: any) => i.discount > 0).map((i: any) => ({ vendor: i.vendor, amount: i.amount, discount: i.discount, discountDeadline: i.discountDeadline })) })} className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg">AI Discount Analysis</button></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Vendor</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Invoice</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Discount</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Deadline</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Savings</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th></tr></thead>
            <tbody>{DISCOUNTS.map((d, i) => (<tr key={i} className="border-t border-gray-50"><td className="px-3 py-2 font-medium text-[#1B2A4A]">{d.vendor}</td><td className="px-3 py-2 text-gray-500">{d.invoice}</td><td className="px-3 py-2">{d.pct}%</td><td className="px-3 py-2">{d.deadline}</td><td className="px-3 py-2 text-emerald-600 font-medium">${d.savings}</td><td className="px-3 py-2"><Badge status={d.status} /></td></tr>))}</tbody>
          </table>
        </div>
      </div>)}

      {/* AI Modal */}
      {modalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-[#1B2A4A]">{modalTitle}</h3><button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button></div>
          {aiLoading ? (<div className="flex items-center gap-3 py-8"><div className="w-5 h-5 border-2 border-[#F5920B] border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-500">Analyzing...</span></div>
          ) : (<div><pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{aiResult}</pre><button onClick={() => navigator.clipboard.writeText(aiResult)} className="mt-4 px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200">Copy to Clipboard</button></div>)}
        </div>
      </div>)}
    </div>
  );
}
