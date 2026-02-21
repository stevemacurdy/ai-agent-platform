'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TABS = ['Dashboard', 'Directory', 'Attendance', 'Recruitment', 'Onboarding', 'Compliance']
const STAT: Record<string, string> = { active: 'bg-emerald-500/10 text-emerald-400', onboarding: 'bg-blue-500/10 text-blue-400', leave: 'bg-amber-500/10 text-amber-400', terminated: 'bg-rose-500/10 text-rose-400', open: 'bg-blue-500/10 text-blue-400', resolved: 'bg-emerald-500/10 text-emerald-400', pending: 'bg-amber-500/10 text-amber-400', completed: 'bg-emerald-500/10 text-emerald-400', in_progress: 'bg-blue-500/10 text-blue-400' }
const RISK: Record<string, string> = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-rose-400' }
const SEV: Record<string, string> = { critical: 'border-rose-500/20 bg-rose-500/5', warning: 'border-amber-500/20 bg-amber-500/5', info: 'border-blue-500/20 bg-blue-500/5' }
const STAGE_ORDER = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']
const STAGE_COLOR: Record<string, string> = { applied: 'bg-gray-500/10 text-gray-400', screening: 'bg-blue-500/10 text-blue-400', interview: 'bg-purple-500/10 text-purple-400', offer: 'bg-amber-500/10 text-amber-400', hired: 'bg-emerald-500/10 text-emerald-400', rejected: 'bg-rose-500/10 text-rose-400' }

export default function HRDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState('Dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    try {
      const s = localStorage.getItem('woulfai_session')
      if (!s) { router.replace('/login'); return }
      const p = JSON.parse(s); setUser(p)
      fetch('/api/agents/hr?companyId=' + p.companyId).then(r => r.json()).then(d => { if (d.data) setData(d.data) })
    } catch { router.replace('/login') }
  }, [router])

  const act = async (action: string, extra?: any) => {
    const res = await fetch('/api/agents/hr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, companyId: user?.companyId, ...extra }) })
    return res.json()
  }

  if (!user || !data) return <div className="min-h-screen bg-[#060910] flex items-center justify-center text-gray-500">Loading HR Agent...</div>

  const filteredEmps = data.employees.filter((e: any) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()) || e.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal')} className="text-xs text-gray-500 hover:text-white">← Portal</button>
            <span className="text-gray-700">|</span><span className="text-xl">👥</span>
            <span className="text-sm font-semibold">HR Agent</span>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] text-emerald-400 font-medium">LIVE</span></div>
          </div>
          <span className="text-xs text-gray-600">{user.companyName} • {user.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-xs text-gray-400">HR data scoped to <span className="text-white font-semibold">{user.companyName}</span></span></div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {[
            { l: 'Headcount', v: data.headcount, c: 'text-blue-400' },
            { l: 'Onboarding', v: data.onboardingCount, c: 'text-cyan-400' },
            { l: 'Open Roles', v: data.openPositions, c: 'text-purple-400' },
            { l: 'Turnover', v: data.turnoverRate + '%', c: data.turnoverRate < 10 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'Avg Tenure', v: data.avgTenure + 'yr', c: 'text-emerald-400' },
            { l: 'Compliance', v: data.complianceScore + '/100', c: data.complianceScore >= 95 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'PTO Util', v: data.ptoUtilization + '%', c: 'text-pink-400' },
          ].map((k, i) => (
            <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-3">
              <div className="text-[8px] sm:text-[9px] text-gray-500 uppercase">{k.l}</div>
              <div className={"text-lg sm:text-xl font-mono font-bold mt-0.5 " + k.c}>{k.v}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-[#0A0E15] border border-white/5 rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={"px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs whitespace-nowrap transition-all " + (tab === t ? 'bg-white/10 text-white font-semibold' : 'text-gray-500 hover:text-gray-300')}>{t}</button>)}
        </div>

        {/* TAB: Dashboard */}
        {tab === 'Dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">👥 Daily HR Briefing</h3>
              <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: data.dailyBriefing.replace(/##\s/g, '<strong>').replace(/\*\*/g, '<strong>').replace(/\n/g, '<br/>') }} />
            </div>
            {/* Department headcount */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">🏢 Department Overview</h3>
              <div className="space-y-3">{data.departments.map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 w-24 shrink-0">{d.name}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden relative">
                    <div className="bg-blue-500/40 h-full rounded-full" style={{ width: Math.min((d.headcount / data.headcount) * 100 * 2.5, 100) + '%' }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">{d.headcount} staff</span>
                  </div>
                  <span className="text-[10px] text-gray-500 w-20 text-right">{d.openRoles > 0 ? d.openRoles + ' open' : '—'}</span>
                </div>
              ))}</div>
            </div>
            {/* AI Insights */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">🤖 AI Insights ({data.aiInsights.filter((a: any) => a.status === 'pending').length} pending)</h3>
              <div className="space-y-3">{data.aiInsights.filter((a: any) => a.status === 'pending').slice(0, 3).map((a: any) => (
                <div key={a.id} className="border border-white/5 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="flex-1"><div className="text-sm font-semibold">{a.title}</div><div className="text-xs text-gray-500 mt-1">{a.description}</div><div className="text-xs text-emerald-400/70 mt-1">Action: {a.action}</div></div>
                  <button onClick={() => { act('approve_insight', { insightId: a.id }); show('✅ Approved'); setData({ ...data, aiInsights: data.aiInsights.map((x: any) => x.id === a.id ? { ...x, status: 'approved' } : x) }) }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 shrink-0">Approve</button>
                </div>
              ))}</div>
            </div>
          </div>
        )}

        {/* TAB: Directory */}
        {tab === 'Directory' && (
          <div className="space-y-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, title, or department..." className="w-full max-w-sm px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredEmps.map((emp: any) => (
                <div key={emp.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{emp.name.split(' ').map((n: string) => n[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-sm font-semibold truncate">{emp.name}</span><span className={"text-[9px] px-1.5 py-0.5 rounded " + (STAT[emp.status] || '')}>{emp.status}</span></div>
                      <div className="text-xs text-gray-400 mt-0.5">{emp.title}</div>
                      <div className="text-[10px] text-gray-600">{emp.department} • {emp.location}</div>
                      <div className="flex items-center gap-3 mt-2 text-[10px]">
                        <span className={"font-medium " + (RISK[emp.flightRisk] || '')}>Risk: {emp.flightRisk}</span>
                        {emp.reviewScore && <span className="text-gray-500">Review: {emp.reviewScore}/5</span>}
                        {!emp.i9 && <span className="text-rose-400 font-bold">No I-9</span>}
                        {emp.certs.some((c: any) => c.status === 'expired') && <span className="text-rose-400 font-bold">Expired cert</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Attendance */}
        {tab === 'Attendance' && (
          <div className="space-y-6">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">⏰ Today's Clock Status</h3>
              <div className="space-y-2">{data.timeRecords.filter((t: any) => t.date === '2026-02-18').map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                  <div><div className="text-sm font-medium">{t.name}</div><div className="text-[10px] text-gray-500">In: {t.clockIn} {t.clockOut ? '• Out: ' + t.clockOut : ''}</div></div>
                  <div className="flex items-center gap-2"><div className={"w-2 h-2 rounded-full " + (t.status === 'clocked_in' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600')} /><span className="text-[10px] text-gray-400">{t.status === 'clocked_in' ? 'On floor' : t.hours.toFixed(1) + 'h'}</span></div>
                </div>
              ))}</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">🏖️ PTO Balances</h3>
              <div className="space-y-3">{data.ptoBalances.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs w-32 shrink-0">{p.name}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden relative">
                    <div className="bg-blue-500/40 h-full rounded-full" style={{ width: Math.max((p.used / p.total) * 100, 0) + '%' }} />
                    {p.pending > 0 && <div className="bg-amber-500/40 h-full rounded-full absolute top-0" style={{ left: (p.used / p.total) * 100 + '%', width: (p.pending / p.total) * 100 + '%' }} />}
                  </div>
                  <span className={"text-xs font-mono w-16 text-right " + (p.remaining <= 0 ? 'text-rose-400 font-bold' : 'text-gray-400')}>{p.remaining}d left</span>
                  <span className="text-[10px] text-gray-600 w-16 text-right">{p.used}/{p.total}</span>
                </div>
              ))}</div>
            </div>
          </div>
        )}

        {/* TAB: Recruitment */}
        {tab === 'Recruitment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{data.jobPostings.map((j: any) => (
              <div key={j.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-5">
                <div className="flex justify-between items-start mb-2"><span className={"text-[9px] px-2 py-0.5 rounded " + (STAT[j.status] || '')}>{j.status}</span><span className="text-[10px] text-gray-600">{j.daysOpen}d open</span></div>
                <h4 className="text-sm font-bold">{j.title}</h4>
                <div className="text-[10px] text-gray-500 mt-1">{j.department} • {j.location} • {j.type}</div>
                <div className="text-xs text-emerald-400 mt-1">{j.salaryRange}</div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-xs text-gray-400">{j.applicants} applicants</span>
                  <div className="flex gap-1">{j.posted.map((p: string) => <span key={p} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500">{p}</span>)}</div>
                </div>
              </div>
            ))}</div>
            {/* Pipeline */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold mb-4">📊 Applicant Pipeline</h3>
              <div className="overflow-x-auto"><div className="flex gap-3 min-w-[800px]">
                {STAGE_ORDER.filter(s => s !== 'hired' && s !== 'rejected').map(stage => {
                  const stageApps = data.applicants.filter((a: any) => a.stage === stage)
                  return (
                    <div key={stage} className="flex-1 min-w-[180px]">
                      <div className="flex items-center gap-2 mb-3"><span className={"text-[9px] px-2 py-0.5 rounded font-medium capitalize " + (STAGE_COLOR[stage] || '')}>{stage}</span><span className="text-[10px] text-gray-600">{stageApps.length}</span></div>
                      <div className="space-y-2">{stageApps.map((a: any) => (
                        <div key={a.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                          <div className="text-xs font-semibold">{a.name}</div>
                          <div className="text-[10px] text-gray-500">{data.jobPostings.find((j: any) => j.id === a.jobId)?.title || ''}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-600">{a.source}</span>
                            {a.rating > 0 && <span className="text-[10px] text-amber-400">{'★'.repeat(a.rating)}</span>}
                          </div>
                          {a.interviewDate && <div className="text-[10px] text-purple-400 mt-1">📅 {a.interviewDate}</div>}
                          <button onClick={() => { act('advance_applicant', { applicantId: a.id }); show('Applicant advanced') }} className="text-[9px] text-blue-400 mt-2 hover:underline">Advance →</button>
                        </div>
                      ))}</div>
                    </div>
                  )
                })}
              </div></div>
            </div>
          </div>
        )}

        {/* TAB: Onboarding */}
        {tab === 'Onboarding' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">{data.onboarding.length} Active Onboardings</h3>
              <button onClick={async () => { const r = await act('generate_onboarding_link'); if (r.link) { navigator.clipboard.writeText(window.location.origin + r.link); show('📋 Onboarding link copied!') } }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500">+ Generate Onboarding Link</button>
            </div>
            {data.onboarding.map((ob: any) => (
              <div key={ob.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-sm font-bold">{ob.name.split(' ').map((n: string) => n[0]).join('')}</div>
                    <div><div className="text-sm font-bold">{ob.name}</div><div className="text-[10px] text-gray-500">{ob.email} • Starts {ob.startDate} ({ob.daysUntilStart} days)</div></div>
                  </div>
                  <a href={'/onboarding/' + ob.token} target="_blank" className="text-[10px] text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-500/20">View Onboarding →</a>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>Progress</span><span>{ob.progress}%</span></div>
                <div className="bg-white/5 rounded-full h-3 overflow-hidden mb-3"><div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: ob.progress + '%' }} /></div>
                <div className="text-xs text-gray-400">Current step: <span className="text-white font-medium">{ob.currentStep}</span></div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Compliance */}
        {tab === 'Compliance' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Score</div><div className={"text-xl font-mono font-bold mt-1 " + (data.complianceScore >= 95 ? 'text-emerald-400' : 'text-amber-400')}>{data.complianceScore}/100</div></div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Critical</div><div className="text-xl font-mono font-bold mt-1 text-rose-400">{data.complianceAlerts.filter((a: any) => a.severity === 'critical').length}</div></div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Warnings</div><div className="text-xl font-mono font-bold mt-1 text-amber-400">{data.complianceAlerts.filter((a: any) => a.severity === 'warning').length}</div></div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Open Alerts</div><div className="text-xl font-mono font-bold mt-1 text-blue-400">{data.complianceAlerts.filter((a: any) => a.status === 'open').length}</div></div>
            </div>
            {data.complianceAlerts.map((alert: any) => (
              <div key={alert.id} className={"border rounded-xl p-4 sm:p-5 " + (SEV[alert.severity] || 'border-white/5')}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{alert.title}</span>
                      <span className={"text-[9px] px-1.5 py-0.5 rounded font-medium " + (alert.severity === 'critical' ? 'bg-rose-500/10 text-rose-400' : alert.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400')}>{alert.severity}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{alert.description}</div>
                    {alert.dueDate && <div className="text-[10px] text-gray-600 mt-1">Due: {alert.dueDate}</div>}
                  </div>
                  {alert.status === 'open' && (
                    <button onClick={() => { act('resolve_alert', { alertId: alert.id }); show('Alert resolved'); setData({ ...data, complianceAlerts: data.complianceAlerts.map((x: any) => x.id === alert.id ? { ...x, status: 'resolved' } : x) }) }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 shrink-0">Resolve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
