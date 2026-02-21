'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getFinance } from '@/lib/tenant-data';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '📊' },
  { id: 'invoices', name: 'Invoices', icon: '📋' },
  { id: 'cashflow', name: 'Cash Flow', icon: '💰' },
  { id: 'collections', name: 'Collections', icon: '📞' },
];

function fmt(n: number) { return n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n/1000).toFixed(0) + 'K' : '$' + n; }

export default function CFOAgent() {
  const { currentCompany, isLoading } = useTenant();
  const [tab, setTab] = useState('overview');
  const data = getFinance(currentCompany?.name);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{'💰'}</div>
          <div>
            <h1 className="text-2xl font-bold">CFO Agent</h1>
            <p className="text-sm text-gray-400">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500">+ New Invoice</button>
          <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">Export</button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'Revenue', value: fmt(data.totalRevenue), color: '' },
          { label: 'Monthly Burn', value: fmt(data.monthlyBurn), color: '' },
          { label: 'Cash on Hand', value: fmt(data.cashOnHand), color: 'text-emerald-400' },
          { label: 'AR Outstanding', value: fmt(data.arOutstanding), color: 'text-amber-400' },
          { label: 'AP Outstanding', value: fmt(data.apOutstanding), color: 'text-red-400' },
          { label: 'Health Score', value: data.healthScore + '/100', color: data.healthScore >= 85 ? 'text-emerald-400' : 'text-amber-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[9px] text-gray-500 uppercase">{k.label}</div>
            <div className={'text-xl font-mono font-bold mt-1 ' + k.color}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-white/5 pb-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ' + (tab === t.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Cash Flow Trend</h3>
            <div className="space-y-2">
              {data.cashflow.map(cf => (
                <div key={cf.month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-8">{cf.month}</span>
                  <div className="flex-1 flex gap-1">
                    <div className="bg-emerald-500/30 h-4 rounded" style={{width: (cf.inflow / 4000).toFixed(0) + '%'}}></div>
                    <div className="bg-red-500/30 h-4 rounded" style={{width: (cf.outflow / 4000).toFixed(0) + '%'}}></div>
                  </div>
                  <span className="text-[10px] text-gray-500 w-20 text-right">{'$' + (cf.inflow/1000).toFixed(0) + 'K / $' + (cf.outflow/1000).toFixed(0) + 'K'}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/50"></span> Inflow</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500/50"></span> Outflow</span>
            </div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Recent Invoices</h3>
            <div className="space-y-2">
              {data.invoices.slice(0, 4).map(inv => (
                <div key={inv.id} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div>
                    <div className="text-sm text-white">{inv.vendor}</div>
                    <div className="text-[10px] text-gray-500">{inv.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{'$' + inv.amount.toLocaleString()}</div>
                    <span className={'text-[9px] px-1.5 py-0.5 rounded ' + (inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : inv.status === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400')}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'invoices' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full"><thead><tr className="border-b border-white/5">
            <th className="text-left px-4 py-3 text-xs text-gray-500">Invoice</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Vendor</th>
            <th className="text-right px-4 py-3 text-xs text-gray-500">Amount</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Status</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Due</th>
          </tr></thead><tbody>
            {data.invoices.map(inv => (
              <tr key={inv.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-mono text-blue-400">{inv.id}</td>
                <td className="px-4 py-3 text-sm text-white">{inv.vendor}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{'$' + inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded ' + (inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : inv.status === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400')}>{inv.status}</span></td>
                <td className="px-4 py-3 text-xs text-gray-500">{inv.due}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {tab === 'cashflow' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Monthly Cash Flow</h3>
          {data.cashflow.map(cf => {
            const net = cf.inflow - cf.outflow;
            return (
              <div key={cf.month} className="flex items-center gap-4 py-3 border-b border-white/[0.03] last:border-0">
                <span className="text-sm text-gray-400 w-10">{cf.month}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400">In: {'$' + (cf.inflow/1000).toFixed(0) + 'K'}</span>
                    <span className="text-red-400">Out: {'$' + (cf.outflow/1000).toFixed(0) + 'K'}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{width: Math.min((cf.inflow / (cf.inflow + cf.outflow)) * 100, 100) + '%'}}></div>
                  </div>
                </div>
                <span className={'text-sm font-mono w-16 text-right ' + (net >= 0 ? 'text-emerald-400' : 'text-red-400')}>{(net >= 0 ? '+' : '') + '$' + (net/1000).toFixed(0) + 'K'}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'collections' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Overdue Invoices</h3>
          {data.invoices.filter(i => i.status === 'Overdue').length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No overdue invoices. Looking good!</p>
          ) : (
            <div className="space-y-3">
              {data.invoices.filter(i => i.status === 'Overdue').map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div>
                    <div className="text-sm text-white font-medium">{inv.vendor}</div>
                    <div className="text-[10px] text-gray-500">{inv.id} | Due: {inv.due}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-bold text-red-400">{'$' + inv.amount.toLocaleString()}</span>
                    <button className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-500">Send Reminder</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
