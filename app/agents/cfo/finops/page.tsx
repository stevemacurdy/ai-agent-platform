'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const fmt = (n: number) => '$' + n.toLocaleString()

export default function FinOpsSuitePage() {
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState<'ap' | 'debt' | 'labor' | 'forecast' | 'sandbox'>('ap')

  useEffect(() => {
    async function load() {
      const endpoints = ['/api/ap', '/api/debt', '/api/finance-capture']
      const results = await Promise.all(
        endpoints.map(e => fetch(e).then(r => r.json()).catch(() => null))
      )
      setData({ ap: results[0], debt: results[1], capture: results[2] })
    }
    load()
  }, [])

  const AP_CATEGORIES = [
    { name: 'Materials & Supplies', amount: 24500, pct: 23 },
    { name: 'Subcontractor Labor', amount: 18200, pct: 17 },
    { name: 'Equipment Rental', amount: 15800, pct: 15 },
    { name: 'Insurance Premiums', amount: 12400, pct: 12 },
    { name: 'Fuel & Fleet', amount: 9800, pct: 9 },
    { name: 'Office & Admin', amount: 7200, pct: 7 },
    { name: 'Utilities', amount: 5400, pct: 5 },
    { name: 'Professional Services', amount: 4800, pct: 5 },
    { name: 'Other', amount: 7140, pct: 7 },
  ]

  const DEBT_ITEMS = [
    { name: 'Equipment Loan - CAT 320', balance: 285000, rate: 6.5, payment: 4850, remaining: 58 },
    { name: 'Vehicle Fleet Note', balance: 142000, rate: 5.2, payment: 2680, remaining: 53 },
    { name: 'Office Lease', balance: 186000, rate: 4.8, payment: 3100, remaining: 60 },
    { name: 'Line of Credit', balance: 75000, rate: 8.5, payment: 1875, remaining: 40 },
    { name: 'SBA Loan', balance: 41000, rate: 3.75, payment: 890, remaining: 46 },
  ]

  const tabs = [
    { id: 'ap' as const, label: 'AP Engine' },
    { id: 'debt' as const, label: 'Debt Ledger' },
    { id: 'labor' as const, label: 'Labor' },
    { id: 'forecast' as const, label: 'Forecast' },
    { id: 'sandbox' as const, label: 'Sandbox' },
  ]

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold">FinOps Suite</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">AP categories, debt management, labor tracking, forecasting, and sandbox</p>
        </div>
        <Link href="/agents/cfo/finops-pro" className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500">
          ⚡ FinOps Pro →
        </Link>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Monthly AP</div><div className="text-lg font-mono font-bold mt-1">{fmt(105240)}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Total Debt</div><div className="text-lg font-mono font-bold text-amber-600 mt-1">{fmt(729000)}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Payroll</div><div className="text-lg font-mono font-bold mt-1">{fmt(68400)}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Burn Rate</div><div className="text-lg font-mono font-bold text-rose-400 mt-1">{fmt(109630)}/mo</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Runway</div><div className="text-lg font-mono font-bold text-blue-600 mt-1">4.2 mo</div></div>
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (tab === t.id ? 'bg-gray-100 text-white' : 'text-[#9CA3AF] hover:text-[#4B5563]')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* AP Engine */}
      {tab === 'ap' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold">Accounts Payable by Category</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">Cash Basis</button>
              <button className="px-3 py-1.5 bg-white shadow-sm text-[#9CA3AF] rounded text-xs">Accrual</button>
            </div>
          </div>
          {AP_CATEGORIES.map((cat, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-white/[0.03] last:border-0">
              <div className="flex-1 text-sm">{cat.name}</div>
              <div className="w-40 bg-white shadow-sm rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: cat.pct + '%' }} />
              </div>
              <div className="w-16 text-right text-xs text-[#9CA3AF]">{cat.pct}%</div>
              <div className="w-24 text-right font-mono text-sm">{fmt(cat.amount)}</div>
            </div>
          ))}
          <div className="flex justify-between mt-4 pt-3 border-t border-[#E5E7EB]">
            <span className="text-sm font-semibold">Total</span>
            <span className="font-mono font-bold">{fmt(AP_CATEGORIES.reduce((s, c) => s + c.amount, 0))}</span>
          </div>
        </div>
      )}

      {/* Debt Ledger */}
      {tab === 'debt' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-[10px] text-[#9CA3AF] uppercase border-b border-[#E5E7EB]">
              <th className="text-left p-4">Obligation</th><th className="text-right p-4">Balance</th><th className="text-center p-4">Rate</th><th className="text-right p-4">Payment</th><th className="text-center p-4">Months Left</th>
            </tr></thead>
            <tbody>
              {DEBT_ITEMS.map((d, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="p-4 font-medium">{d.name}</td>
                  <td className="p-4 text-right font-mono">{fmt(d.balance)}</td>
                  <td className="p-4 text-center text-[#6B7280]">{d.rate}%</td>
                  <td className="p-4 text-right font-mono text-amber-600">{fmt(d.payment)}</td>
                  <td className="p-4 text-center text-[#9CA3AF]">{d.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-[#E5E7EB] flex justify-between">
            <span className="text-sm font-semibold">Total Debt</span>
            <span className="font-mono font-bold text-amber-600">{fmt(DEBT_ITEMS.reduce((s, d) => s + d.balance, 0))}</span>
          </div>
        </div>
      )}

      {/* Labor */}
      {tab === 'labor' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold">Labor Cost Tracking</h3>
          {[
            { dept: 'Field Operations', headcount: 12, cost: 32400 },
            { dept: 'Project Management', headcount: 4, cost: 16800 },
            { dept: 'Engineering', headcount: 3, cost: 11200 },
            { dept: 'Admin & Support', headcount: 2, cost: 8000 },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-white/[0.03] last:border-0">
              <div className="flex-1"><div className="text-sm">{d.dept}</div><div className="text-[10px] text-[#6B7280]">{d.headcount} employees</div></div>
              <div className="font-mono text-sm">{fmt(d.cost)}/mo</div>
              <div className="text-xs text-[#9CA3AF]">{fmt(Math.round(d.cost / d.headcount))}/ea</div>
            </div>
          ))}
        </div>
      )}

      {/* Forecast */}
      {tab === 'forecast' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold">Cash Flow Forecast</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '30 Days', inflow: 95000, outflow: 109630, net: -14630 },
              { label: '60 Days', inflow: 198000, outflow: 219260, net: -21260 },
              { label: '90 Days', inflow: 312000, outflow: 328890, net: -16890 },
            ].map((f, i) => (
              <div key={i} className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl p-4">
                <div className="text-xs text-[#9CA3AF] mb-2">{f.label}</div>
                <div className="text-xs text-emerald-600">In: {fmt(f.inflow)}</div>
                <div className="text-xs text-rose-400">Out: {fmt(f.outflow)}</div>
                <div className={"text-sm font-mono font-bold mt-2 " + (f.net >= 0 ? 'text-emerald-600' : 'text-rose-400')}>{fmt(f.net)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sandbox */}
      {tab === 'sandbox' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold">Business Idea Sandbox</h3>
          <p className="text-xs text-[#9CA3AF]">Model "what if" scenarios against your real financial data.</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">New Revenue Stream</label>
              <input defaultValue="3PL Services" className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Monthly Revenue</label>
              <input defaultValue="$45,000" className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Setup Cost</label>
              <input defaultValue="$120,000" className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Monthly OpEx</label>
              <input defaultValue="$28,000" className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" /></div>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
            <div className="text-xs text-blue-600 font-medium mb-2">Sandbox Result</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><div className="text-[10px] text-[#9CA3AF]">Monthly Profit</div><div className="font-mono font-bold text-emerald-600">$17,000</div></div>
              <div><div className="text-[10px] text-[#9CA3AF]">Breakeven</div><div className="font-mono font-bold">7.1 months</div></div>
              <div><div className="text-[10px] text-[#9CA3AF]">Year 1 ROI</div><div className="font-mono font-bold text-emerald-600">+70%</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
