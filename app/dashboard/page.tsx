'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

const fmt = (n: number) => '$' + n.toLocaleString()

export default function UserDashboard() {
  const { profile, loading, isAdmin } = useAuth()
  const [cfo, setCfo] = useState<any>(null)
  const [sales, setSales] = useState<any>(null)
  const [cfoLoading, setCfoLoading] = useState(true)
  const [salesLoading, setSalesLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cfo?view=dashboard')
      .then(r => r.json())
      .then(d => { setCfo(d); setCfoLoading(false) })
      .catch(() => setCfoLoading(false))

    fetch('/api/sales-data?view=dashboard')
      .then(r => r.json())
      .then(d => { setSales(d); setSalesLoading(false) })
      .catch(() => setSalesLoading(false))
  }, [])

  if (loading || !profile) return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const allRecs = [
    ...(cfo?.recommendations || []).map((r: string) => ({ agent: 'CFO', icon: '\uD83D\uDCB0', rec: r })),
    ...(sales?.recommendations || []).map((r: string) => ({ agent: 'Sales', icon: '\uD83E\uDD1D', rec: r })),
  ]

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
              {greeting()}, {profile?.display_name || profile?.email?.split('@')[0]}
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Here{'\u2019'}s what your AI Employees found today.</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="px-4 py-2 bg-[#1B2A4A] text-white rounded-xl text-xs font-bold hover:-translate-y-px transition-all">
                Admin Console {'\u2192'}
              </Link>
            )}
            <Link href="/settings/integrations" className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-xl text-xs font-medium hover:border-[#2A9D8F] transition-all">
              Integrations
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          {cfo && (
            <span className={'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ' + (cfo.source === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20' : 'bg-amber-50 text-amber-600 border-amber-500/20')}>
              <span className={'w-1.5 h-1.5 rounded-full ' + (cfo.source === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
              CFO: {cfo.source === 'live' ? 'Live' : 'Demo'}
            </span>
          )}
          {sales && (
            <span className={'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ' + (sales.source === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20' : 'bg-amber-50 text-amber-600 border-amber-500/20')}>
              <span className={'w-1.5 h-1.5 rounded-full ' + (sales.source === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
              Sales: {sales.source === 'live' ? 'Live' : 'Demo'}
            </span>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A]">{'\uD83D\uDCB0'} Financial Health</h2>
              <Link href="/agents/cfo/console" className="text-[10px] text-[#2A9D8F] font-medium hover:underline">Open Console {'\u2192'}</Link>
            </div>
            {cfoLoading ? (
              <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" /></div>
            ) : cfo?.summary ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Outstanding</div><div className="text-lg font-mono font-bold text-[#1B2A4A]">{fmt(cfo.summary.totalOutstanding || 0)}</div></div>
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Overdue</div><div className="text-lg font-mono font-bold text-rose-400">{fmt(cfo.summary.totalOverdue || 0)}</div></div>
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Health</div><div className={'text-lg font-bold ' + ((cfo.healthScore || 0) >= 70 ? 'text-emerald-600' : (cfo.healthScore || 0) >= 50 ? 'text-amber-600' : 'text-rose-400')}>{cfo.healthScore || 0} <span className="text-sm">{cfo.healthGrade || ''}</span></div></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F4F5F7] rounded-lg p-2.5"><div className="text-[9px] text-[#9CA3AF]">Collected</div><div className="text-sm font-mono font-bold text-emerald-600">{fmt(cfo.summary.totalPaid || 0)}</div></div>
                  <div className="bg-[#F4F5F7] rounded-lg p-2.5"><div className="text-[9px] text-[#9CA3AF]">Cash on Hand</div><div className="text-sm font-mono font-bold text-[#1B2A4A]">{fmt(cfo.summary.cashOnHand || 0)}</div></div>
                </div>
              </>
            ) : <p className="text-xs text-[#9CA3AF] py-4">Connect accounting software to see financial data.</p>}
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A]">{'\uD83E\uDD1D'} Sales Pipeline</h2>
              <Link href="/agents/sales/console" className="text-[10px] text-[#2A9D8F] font-medium hover:underline">Open Console {'\u2192'}</Link>
            </div>
            {salesLoading ? (
              <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-[#F5920B] border-t-transparent rounded-full animate-spin" /></div>
            ) : sales?.summary ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Pipeline</div><div className="text-lg font-mono font-bold text-[#1B2A4A]">{fmt(sales.summary.pipelineValue || 0)}</div></div>
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Weighted</div><div className="text-lg font-mono font-bold text-[#F5920B]">{fmt(sales.summary.weightedPipeline || 0)}</div></div>
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Win Rate</div><div className={'text-lg font-bold ' + ((sales.summary.winRate || 0) >= 50 ? 'text-emerald-600' : 'text-amber-600')}>{sales.summary.winRate || 0}%</div></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-50 rounded-lg p-2.5"><div className="text-[9px] text-emerald-700">Won</div><div className="text-sm font-mono font-bold text-emerald-600">{fmt(sales.summary.wonValue || 0)} <span className="text-[10px] font-normal text-emerald-500">({sales.summary.wonCount} deals)</span></div></div>
                  <div className="bg-[#F4F5F7] rounded-lg p-2.5"><div className="text-[9px] text-[#9CA3AF]">Open Deals</div><div className="text-sm font-mono font-bold text-[#1B2A4A]">{sales.summary.openDeals || 0}</div></div>
                </div>
              </>
            ) : <p className="text-xs text-[#9CA3AF] py-4">Connect your CRM to see pipeline data.</p>}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">{'\uD83C\uDFAF'} Top Open Deals</h3>
            {(sales?.topDeals || []).length === 0 ? <p className="text-xs text-[#9CA3AF] py-4">No open deals to show.</p> : (
              <div className="space-y-2">
                {(sales?.topDeals || []).slice(0, 4).map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0">
                    <div><div className="text-xs font-medium text-[#1B2A4A]">{d.name}</div><div className="text-[10px] text-[#9CA3AF]">{d.companyName} {'\u2022'} {d.ownerName}</div></div>
                    <div className="text-right"><div className="text-sm font-mono font-bold text-[#1B2A4A]">{fmt(d.amount)}</div><div className="text-[10px] text-[#9CA3AF]">{d.stage}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white border border-emerald-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-emerald-700 mb-3">{'\uD83C\uDF89'} Recent Wins</h3>
            {(sales?.recentWins || []).length === 0 ? <p className="text-xs text-[#9CA3AF] py-4">No recent wins to show.</p> : (
              <div className="space-y-2">
                {(sales?.recentWins || []).slice(0, 4).map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-emerald-500/10 last:border-0">
                    <div><div className="text-xs font-medium text-[#1B2A4A]">{d.name}</div><div className="text-[10px] text-[#9CA3AF]">{d.companyName} {'\u2022'} {d.ownerName}</div></div>
                    <div className="text-right"><div className="text-sm font-mono font-bold text-emerald-600">{fmt(d.amount)}</div><div className="text-[10px] text-[#9CA3AF]">{d.closeDate}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {allRecs.length > 0 && (
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">{'\uD83E\uDD16'} AI Recommendations</h3>
            <div className="space-y-2">
              {allRecs.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 text-sm">{r.icon}</span>
                  <div><span className="text-[10px] font-bold text-white/40 uppercase">{r.agent}</span><p className="text-xs text-white/70 leading-relaxed">{r.rec}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/agents/cfo/console', icon: '\uD83D\uDCB0', label: 'CFO Console', desc: 'Invoices, collections, cashflow' },
              { href: '/agents/sales/console', icon: '\uD83E\uDD1D', label: 'Sales Console', desc: 'Pipeline, forecast, leaderboard' },
              { href: '/settings/integrations', icon: '\uD83D\uDD17', label: 'Integrations', desc: 'Connect your tools' },
              { href: '/demo', icon: '\uD83E\uDD16', label: 'Agent Demos', desc: 'Explore all AI Employees' },
              { href: '/pricing', icon: '\uD83D\uDCB2', label: 'Plans & Pricing', desc: 'Upgrade your plan' },
              { href: '/agents/sales/coach', icon: '\uD83C\uDFC8', label: 'Sales Coach', desc: 'AI-powered deal coaching' },
              ...(isAdmin ? [{ href: '/admin', icon: '\uD83C\uDFAF', label: 'Admin Console', desc: 'User & agent management' }] : []),
            ].map(a => (
              <Link key={a.href} href={a.href} className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:border-[#2A9D8F] hover:shadow-md transition-all group">
                <div className="text-xl mb-2">{a.icon}</div>
                <div className="text-xs font-semibold text-[#1B2A4A] group-hover:text-[#2A9D8F]">{a.label}</div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
