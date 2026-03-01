'use client'
import { useState } from 'react'
import Link from 'next/link'

const fmt = (n: number) => '$' + n.toLocaleString()

const REPS = [
  { id: 'r1', name: 'Marcus Williams', email: 'marcus@woulfgroup.com', pipeline: 485000, closed: 280000, deals: 12, winRate: 67, status: 'active', avatar: '👤' },
  { id: 'r2', name: 'Diana Reeves', email: 'diana@woulfgroup.com', pipeline: 310000, closed: 195000, deals: 8, winRate: 72, status: 'active', avatar: '👤' },
  { id: 'r3', name: 'Jason Park', email: 'jason@woulfgroup.com', pipeline: 220000, closed: 140000, deals: 6, winRate: 58, status: 'active', avatar: '👤' },
  { id: 'r4', name: 'Elena Torres', email: 'elena@woulfgroup.com', pipeline: 175000, closed: 95000, deals: 5, winRate: 55, status: 'onboarding', avatar: '👤' },
]

const TEAM_STATS = {
  totalPipeline: REPS.reduce((s, r) => s + r.pipeline, 0),
  totalClosed: REPS.reduce((s, r) => s + r.closed, 0),
  avgWinRate: Math.round(REPS.reduce((s, r) => s + r.winRate, 0) / REPS.length),
  totalDeals: REPS.reduce((s, r) => s + r.deals, 0),
}

export default function SalesRepsPage() {
  const [search, setSearch] = useState('')
  const filtered = REPS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold">Sales Reps</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Team performance, pipeline, and CRM management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/agents/sales/intel" className="px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-xs font-medium hover:bg-gray-100">🧠 Sales Intel</Link>
          <Link href="/admin/sales-crm" className="px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-xs font-medium hover:bg-gray-100">📊 Sales CRM</Link>
          <Link href="/agents/sales/solo" className="px-3 py-2 bg-[#1B2A4A] text-white rounded-lg text-xs font-medium hover:bg-blue-500">🎯 My Pipeline</Link>
        </div>
      </div>

      {/* Team KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Team Pipeline</div><div className="text-xl font-mono font-bold mt-1">{fmt(TEAM_STATS.totalPipeline)}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Total Closed</div><div className="text-xl font-mono font-bold text-emerald-600 mt-1">{fmt(TEAM_STATS.totalClosed)}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Avg Win Rate</div><div className="text-xl font-mono font-bold text-blue-600 mt-1">{TEAM_STATS.avgWinRate}%</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Active Deals</div><div className="text-xl font-mono font-bold mt-1">{TEAM_STATS.totalDeals}</div></div>
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reps..."
        className="w-full max-w-sm px-4 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-xl text-sm placeholder-[#9CA3AF] focus:border-[#2A9D8F]/30 focus:outline-none" />

      {/* Rep Cards */}
      <div className="space-y-3">
        {filtered.map(rep => (
          <div key={rep.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-[#E5E7EB] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-lg">{rep.avatar}</div>
                <div>
                  <div className="text-sm font-semibold">{rep.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{rep.email}</div>
                </div>
                <span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (rep.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                  {rep.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div><div className="text-xs text-[#9CA3AF]">Pipeline</div><div className="font-mono text-sm font-bold">{fmt(rep.pipeline)}</div></div>
                <div><div className="text-xs text-[#9CA3AF]">Closed</div><div className="font-mono text-sm font-bold text-emerald-600">{fmt(rep.closed)}</div></div>
                <div><div className="text-xs text-[#9CA3AF]">Win Rate</div><div className="font-mono text-sm font-bold text-blue-600">{rep.winRate}%</div></div>
                <div><div className="text-xs text-[#9CA3AF]">Deals</div><div className="font-mono text-sm font-bold">{rep.deals}</div></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
