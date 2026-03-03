'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

const fmt = (n: number) => n >= 1000000 ? '$' + (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'K' : '$' + n.toLocaleString()

interface DeptData { data: any; loading: boolean; source?: string }

export default function UserDashboard() {
  const { profile, loading, isAdmin } = useAuth()
  const [cfo, setCfo] = useState<DeptData>({ data: null, loading: true })
  const [sales, setSales] = useState<DeptData>({ data: null, loading: true })
  const [ops, setOps] = useState<DeptData>({ data: null, loading: true })
  const [hr, setHr] = useState<DeptData>({ data: null, loading: true })
  const [marketing, setMarketing] = useState<DeptData>({ data: null, loading: true })

  useEffect(() => {
    const fetchSafe = (url: string) => fetch(url).then(r => r.ok ? r.json() : null).catch(() => null)

    fetchSafe('/api/cfo?view=dashboard').then(d => setCfo({ data: d, loading: false, source: d?.source }))
    fetchSafe('/api/sales-data?view=dashboard').then(d => setSales({ data: d, loading: false, source: d?.source }))
    fetchSafe('/api/agents/operations?view=dashboard').then(d => setOps({ data: d, loading: false, source: d?.source }))
    fetchSafe('/api/agents/hr?view=dashboard').then(d => setHr({ data: d, loading: false, source: d?.source }))
    fetchSafe('/api/agents/marketing?view=dashboard').then(d => setMarketing({ data: d, loading: false, source: d?.source }))
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

  // Aggregate recommendations from all departments
  const allRecs = [
    ...(cfo.data?.recommendations || []).map((r: string) => ({ agent: 'CFO', icon: '\uD83D\uDCB0', rec: r })),
    ...(sales.data?.recommendations || []).map((r: string) => ({ agent: 'Sales', icon: '\uD83E\uDD1D', rec: r })),
    ...(ops.data?.recommendations || []).map((r: string) => ({ agent: 'Operations', icon: '\uD83C\uDFED', rec: r })),
    ...(hr.data?.recommendations || []).map((r: string) => ({ agent: 'HR', icon: '\uD83D\uDC65', rec: r })),
    ...(marketing.data?.recommendations || []).map((r: string) => ({ agent: 'Marketing', icon: '\uD83D\uDCE3', rec: r })),
  ]

  // Active agent count
  const activeDepts = [cfo, sales, ops, hr, marketing].filter(d => d.data && !d.loading).length

  const Spinner = () => <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" /></div>

  const SourceBadge = ({ source }: { source?: string }) => source ? (
    <span className={'flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ' +
      (source === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20' : 'bg-amber-50 text-amber-600 border-amber-500/20')}>
      <span className={'w-1.5 h-1.5 rounded-full ' + (source === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
      {source === 'live' ? 'Live' : 'Demo'}
    </span>
  ) : null

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
              {greeting()}, {profile?.display_name || profile?.email?.split('@')[0]}
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {activeDepts} department{activeDepts !== 1 ? 's' : ''} reporting. Here{'\u2019'}s what your AI Employees found today.
            </p>
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

        {/* ════════════════════════════════════════════════════════════ */}
        {/* ROW 1: Finance + Sales (primary revenue metrics)           */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Finance */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A]">{'\uD83D\uDCB0'} Financial Health</h2>
              <div className="flex items-center gap-2">
                <SourceBadge source={cfo.source} />
                <Link href="/agents/cfo" className="text-[10px] text-[#2A9D8F] font-medium hover:underline">Open {'\u2192'}</Link>
              </div>
            </div>
            {cfo.loading ? <Spinner /> : cfo.data?.summary ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Outstanding</div><div className="text-lg font-mono font-bold text-[#1B2A4A]">{fmt(cfo.data.summary.totalOutstanding || 0)}</div></div>
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Overdue</div><div className="text-lg font-mono font-bold text-rose-400">{fmt(cfo.data.summary.totalOverdue || 0)}</div></div>
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Health</div><div className={'text-lg font-bold ' + ((cfo.data.healthScore || 0) >= 70 ? 'text-emerald-600' : (cfo.data.healthScore || 0) >= 50 ? 'text-amber-600' : 'text-rose-400')}>{cfo.data.healthScore || 0} <span className="text-sm">{cfo.data.healthGrade || ''}</span></div></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F4F5F7] rounded-lg p-2.5"><div className="text-[9px] text-[#9CA3AF]">Collected</div><div className="text-sm font-mono font-bold text-emerald-600">{fmt(cfo.data.summary.totalPaid || 0)}</div></div>
                  <div className="bg-[#F4F5F7] rounded-lg p-2.5"><div className="text-[9px] text-[#9CA3AF]">Cash on Hand</div><div className="text-sm font-mono font-bold text-[#1B2A4A]">{fmt(cfo.data.summary.cashOnHand || 0)}</div></div>
                </div>
              </>
            ) : <p className="text-xs text-[#9CA3AF] py-4">Connect accounting software to see financial data.</p>}
          </div>

          {/* Sales */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A]">{'\uD83E\uDD1D'} Sales Pipeline</h2>
              <div className="flex items-center gap-2">
                <SourceBadge source={sales.source} />
                <Link href="/agents/sales" className="text-[10px] text-[#2A9D8F] font-medium hover:underline">Open {'\u2192'}</Link>
              </div>
            </div>
            {sales.loading ? <Spinner /> : sales.data?.summary ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Pipeline</div><div className="text-lg font-mono font-bold text-[#1B2A4A]">{fmt(sales.data.summary.pipelineValue || 0)}</div></div>
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Weighted</div><div className="text-lg font-mono font-bold text-[#F5920B]">{fmt(sales.data.summary.weightedPipeline || 0)}</div></div>
                  <div><div className="text-[9px] text-[#9CA3AF] uppercase">Win Rate</div><div className={'text-lg font-bold ' + ((sales.data.summary.winRate || 0) >= 50 ? 'text-emerald-600' : 'text-amber-600')}>{sales.data.summary.winRate || 0}%</div></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-50 rounded-lg p-2.5"><div className="text-[9px] text-emerald-700">Won</div><div className="text-sm font-mono font-bold text-emerald-600">{fmt(sales.data.summary.wonValue || 0)} <span className="text-[10px] font-normal text-emerald-500">({sales.data.summary.wonCount} deals)</span></div></div>
                  <div className="bg-[#F4F5F7] rounded-lg p-2.5"><div className="text-[9px] text-[#9CA3AF]">Open Deals</div><div className="text-sm font-mono font-bold text-[#1B2A4A]">{sales.data.summary.openDeals || 0}</div></div>
                </div>
              </>
            ) : <p className="text-xs text-[#9CA3AF] py-4">Connect your CRM to see pipeline data.</p>}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* ROW 2: Operations + HR + Marketing (operational metrics)   */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Operations */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A]">{'\uD83C\uDFED'} Operations</h2>
              <Link href="/agents/operations" className="text-[10px] text-[#2A9D8F] font-medium hover:underline">Open {'\u2192'}</Link>
            </div>
            {ops.loading ? <Spinner /> : ops.data?.kpis ? (
              <div className="space-y-3">
                {Object.entries(ops.data.kpis).slice(0, 4).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[10px] text-[#6B7280] capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-mono font-bold text-[#1B2A4A]">{typeof val === 'number' && val > 100 ? fmt(val) : String(val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-[10px] text-[#6B7280]">Warehouse Utilization</span><span className="text-sm font-bold text-[#1B2A4A]">--</span></div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-[#6B7280]">Orders Today</span><span className="text-sm font-bold text-[#1B2A4A]">--</span></div>
                <p className="text-xs text-[#9CA3AF] pt-2">Connect operations tools to see live data.</p>
              </div>
            )}
          </div>

          {/* HR */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A]">{'\uD83D\uDC65'} People & HR</h2>
              <Link href="/agents/hr" className="text-[10px] text-[#2A9D8F] font-medium hover:underline">Open {'\u2192'}</Link>
            </div>
            {hr.loading ? <Spinner /> : hr.data?.kpis ? (
              <div className="space-y-3">
                {Object.entries(hr.data.kpis).slice(0, 4).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[10px] text-[#6B7280] capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-mono font-bold text-[#1B2A4A]">{String(val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-[10px] text-[#6B7280]">Total Employees</span><span className="text-sm font-bold text-[#1B2A4A]">--</span></div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-[#6B7280]">Open Positions</span><span className="text-sm font-bold text-[#1B2A4A]">--</span></div>
                <p className="text-xs text-[#9CA3AF] pt-2">Connect HRIS to see people data.</p>
              </div>
            )}
          </div>

          {/* Marketing */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A]">{'\uD83D\uDCE3'} Marketing</h2>
              <Link href="/agents/marketing" className="text-[10px] text-[#2A9D8F] font-medium hover:underline">Open {'\u2192'}</Link>
            </div>
            {marketing.loading ? <Spinner /> : marketing.data?.kpis ? (
              <div className="space-y-3">
                {Object.entries(marketing.data.kpis).slice(0, 4).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[10px] text-[#6B7280] capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-mono font-bold text-[#1B2A4A]">{typeof val === 'number' && val > 100 ? fmt(val) : String(val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-[10px] text-[#6B7280]">Website Traffic</span><span className="text-sm font-bold text-[#1B2A4A]">--</span></div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-[#6B7280]">Conversion Rate</span><span className="text-sm font-bold text-[#1B2A4A]">--</span></div>
                <p className="text-xs text-[#9CA3AF] pt-2">Connect marketing tools to see campaign data.</p>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* ROW 3: Top Deals + Recent Wins (unchanged)                 */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">{'\uD83C\uDFAF'} Top Open Deals</h3>
            {(sales.data?.topDeals || []).length === 0 ? <p className="text-xs text-[#9CA3AF] py-4">No open deals to show.</p> : (
              <div className="space-y-2">
                {(sales.data?.topDeals || []).slice(0, 4).map((d: any) => (
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
            {(sales.data?.recentWins || []).length === 0 ? <p className="text-xs text-[#9CA3AF] py-4">No recent wins to show.</p> : (
              <div className="space-y-2">
                {(sales.data?.recentWins || []).slice(0, 4).map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-emerald-500/10 last:border-0">
                    <div><div className="text-xs font-medium text-[#1B2A4A]">{d.name}</div><div className="text-[10px] text-[#9CA3AF]">{d.companyName} {'\u2022'} {d.ownerName}</div></div>
                    <div className="text-right"><div className="text-sm font-mono font-bold text-emerald-600">{fmt(d.amount)}</div><div className="text-[10px] text-[#9CA3AF]">{d.closeDate}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* AI Recommendations (all departments)                       */}
        {/* ════════════════════════════════════════════════════════════ */}
        {allRecs.length > 0 && (
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">{'\uD83E\uDD16'} AI Recommendations</h3>
            <div className="space-y-2">
              {allRecs.slice(0, 6).map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 text-sm">{r.icon}</span>
                  <div><span className="text-[10px] font-bold text-white/40 uppercase">{r.agent}</span><p className="text-xs text-white/70 leading-relaxed">{r.rec}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* Quick Actions (all 5 departments)                          */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div>
          <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">All Departments</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { href: '/agents/cfo', icon: '\uD83D\uDCB0', label: 'Finance', desc: 'CFO, Collections, FinOps, Payables', agents: 4 },
              { href: '/agents/sales', icon: '\uD83E\uDD1D', label: 'Sales & Marketing', desc: 'Sales Intel, Coach, Marketing, SEO', agents: 4 },
              { href: '/agents/operations', icon: '\uD83C\uDFED', label: 'Operations', desc: 'Warehouse, WMS, Supply Chain', agents: 5 },
              { href: '/agents/hr', icon: '\uD83D\uDC65', label: 'People', desc: 'HR, Support, Training', agents: 4 },
              { href: '/agents/org-lead', icon: '\uD83C\uDFAF', label: 'Strategy', desc: 'Research, Legal, Compliance, STR', agents: 4 },
            ].map(a => (
              <Link key={a.href} href={a.href} className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:border-[#2A9D8F] hover:shadow-md transition-all group">
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className="text-xs font-semibold text-[#1B2A4A] group-hover:text-[#2A9D8F]">{a.label}</div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">{a.desc}</div>
                <div className="text-[9px] text-[#2A9D8F] mt-2 font-medium">{a.agents} AI Employees</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/agents/cfo/console', icon: '\uD83D\uDCCA', label: 'CFO Console', desc: 'Invoices, collections, cashflow' },
            { href: '/agents/sales/console', icon: '\uD83D\uDCC8', label: 'Sales Console', desc: 'Pipeline, forecast, leaderboard' },
            { href: '/agents/sales/coach', icon: '\uD83C\uDFC8', label: 'Sales Coach', desc: 'AI-powered deal coaching' },
            { href: '/settings/integrations', icon: '\uD83D\uDD17', label: 'Integrations', desc: 'Connect your tools' },
            { href: '/pricing', icon: '\uD83D\uDCB2', label: 'Plans & Pricing', desc: 'Manage your subscription' },
            { href: '/demo', icon: '\uD83E\uDD16', label: 'Agent Demos', desc: 'Explore all AI Employees' },
            ...(isAdmin ? [
              { href: '/admin', icon: '\uD83D\uDEE0\uFE0F', label: 'Admin Console', desc: 'User & agent management' },
              { href: '/admin/leads', icon: '\uD83D\uDCEC', label: 'Leads', desc: 'Inbound lead management' },
            ] : []),
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
  )
}
