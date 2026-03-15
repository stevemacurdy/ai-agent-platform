'use client'
import { useState, useEffect } from 'react'
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const fmt = (n: number) => '$' + n.toLocaleString()
const pct = (n: number) => n + '%'

export default function SalesConsole() {
  useTrackConsoleView('sales')
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  // Core state
  const [summary, setSummary] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [topDeals, setTopDeals] = useState<any[]>([])
  const [recentWins, setRecentWins] = useState<any[]>([])
  const [dataSource, setDataSource] = useState('loading')
  const [provider, setProvider] = useState<string | null>(null)

  // Modal state
  const [modal, setModal] = useState<'pipeline' | 'forecast' | 'leaderboard' | 'at-risk' | 'velocity' | 'deals' | null>(null)
  const [modalData, setModalData] = useState<any>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Load dashboard
  useEffect(() => {
    fetch('/api/sales-data?view=dashboard')
      .then(r => r.json())
      .then(d => {
        setSummary(d.summary)
        setRecommendations(d.recommendations || [])
        setTopDeals(d.topDeals || [])
        setRecentWins(d.recentWins || [])
        setDataSource(d.source || 'demo')
        setProvider(d.provider || null)
      })
      .catch(() => showToast('Failed to load dashboard'))
  }, [])

  const openModal = async (view: string) => {
    setModalLoading(true)
    setModal(view as any)
    const r = await fetch('/api/sales-data?view=' + view)
    setModalData(await r.json())
    setModalLoading(false)
  }

  const ST: Record<string, string> = {
    prospecting: 'bg-gray-50 text-gray-600',
    qualification: 'bg-blue-50 text-blue-600',
    proposal: 'bg-violet-50 text-violet-600',
    negotiation: 'bg-amber-50 text-amber-600',
    'closed won': 'bg-emerald-50 text-emerald-600',
    'closed_won': 'bg-emerald-50 text-emerald-600',
    'closed lost': 'bg-rose-50 text-rose-400',
    'closed_lost': 'bg-rose-50 text-rose-400',
  }

  const Modal = ({ children, wide }: { children: React.ReactNode; wide?: boolean }) => (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto" onClick={() => setModal(null)}>
      <div className="fixed inset-0 bg-black/70" />
      <div className={'relative bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ' + (wide ? 'w-[900px]' : 'w-[720px]')} onClick={e => e.stopPropagation()}>
        <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#1B2A4A] text-lg z-10">{'✕'}</button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  const Loader = ({ msg }: { msg: string }) => (
    <div className="flex flex-col items-center py-16">
      <div className="w-8 h-8 border-2 border-[#F5920B] border-t-transparent rounded-full animate-spin mb-3" />
      <div className="text-sm text-[#6B7280]">{msg}</div>
    </div>
  )

  // Pipeline bar
  const PipelineBar = ({ stages, stageOrder }: { stages: any; stageOrder: string[] }) => {
    const total = Object.values(stages).reduce((s: number, st: any) => s + st.value, 0) || 1
    const colors: Record<string, string> = { prospecting: '#9CA3AF', qualification: '#3B82F6', proposal: '#8B5CF6', negotiation: '#F59E0B', closed_won: '#10B981', closed_lost: '#EF4444' }
    return (
      <div className="w-full h-8 rounded-lg overflow-hidden flex">
        {stageOrder.map(s => (
          <div key={s} className="relative group" style={{ width: pct(Math.max(2, (stages[s]?.value || 0) / total * 100)), background: colors[s] || '#9CA3AF' }}>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#1B2A4A] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
              {s.replace(/_/g, ' ')}: {stages[s]?.count} deals ({fmt(stages[s]?.value || 0)})
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-500/20 text-emerald-600 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Sales Intelligence Console</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Pipeline analytics, forecasting, and deal intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
          {dataSource === 'live' ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live {'—'} {provider || 'CRM'}
            </span>
          ) : dataSource === 'demo' ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-500/20">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Demo Data
            </span>
          ) : (
            <span className="text-[10px] text-[#9CA3AF]">Loading...</span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Pipeline Value', value: fmt(summary.pipelineValue || 0), color: 'text-[#1B2A4A]', border: 'border-[#E5E7EB]' },
            { label: 'Weighted', value: fmt(summary.weightedPipeline || 0), color: 'text-[#F5920B]', border: 'border-[#F5920B]/20' },
            { label: 'Won', value: fmt(summary.wonValue || 0), color: 'text-emerald-600', border: 'border-emerald-500/20' },
            { label: 'Win Rate', value: pct(summary.winRate || 0), color: 'text-blue-600', border: 'border-blue-500/20' },
            { label: 'Open Deals', value: String(summary.openDeals || 0), color: 'text-violet-600', border: 'border-violet-500/20' },
          ].map((k, i) => (
            <div key={i} className={'bg-white border rounded-xl p-4 text-left shadow-sm ' + k.border}>
              <div className="text-[10px] text-[#9CA3AF] font-mono uppercase">{k.label}</div>
              <div className={'text-xl font-mono font-bold mt-1 ' + k.color}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { view: 'pipeline', icon: '📉', label: 'Pipeline View', desc: 'Stage breakdown with deal values', color: 'violet' },
          { view: 'forecast', icon: '🔮', label: 'Revenue Forecast', desc: 'Weekly/monthly/quarterly projections', color: 'blue' },
          { view: 'leaderboard', icon: '🏆', label: 'Rep Leaderboard', desc: 'Rankings by revenue and win rate', color: 'amber' },
          { view: 'at-risk', icon: '⚠️', label: 'At-Risk Deals', desc: 'Stale, overdue, and flagged deals', color: 'rose' },
          { view: 'velocity', icon: '⚡', label: 'Sales Velocity', desc: 'Cycle time, deal size, throughput', color: 'emerald' },
        ].map(b => (
          <button key={b.view} onClick={() => openModal(b.view)}
            className={`bg-gradient-to-br from-${b.color}-500/5 to-${b.color}-500/10 border border-${b.color}-500/20 rounded-xl p-4 text-left hover:border-${b.color}-500/40 transition-all`}>
            <div className="text-lg mb-1">{b.icon}</div>
            <div className="text-xs font-semibold text-[#1B2A4A]">{b.label}</div>
            <div className="text-[10px] text-[#9CA3AF] mt-1">{b.desc}</div>
          </button>
        ))}
      </div>

      {/* Top Deals + Recent Wins side by side */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Top Open Deals */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 text-[#1B2A4A]">Top Open Deals</h3>
          {topDeals.length === 0 ? (
            <p className="text-xs text-[#9CA3AF]">No open deals</p>
          ) : (
            <div className="space-y-2">
              {topDeals.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0">
                  <div>
                    <div className="text-xs font-medium text-[#1B2A4A]">{d.name}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{d.companyName} {'•'} {d.ownerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-[#1B2A4A]">{fmt(d.amount)}</div>
                    <span className={'text-[10px] px-1.5 py-0.5 rounded ' + (ST[d.stage?.toLowerCase()] || 'bg-gray-50 text-gray-600')}>{d.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Wins */}
        <div className="bg-white border border-emerald-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 text-emerald-700">Recent Wins {'🎉'}</h3>
          {recentWins.length === 0 ? (
            <p className="text-xs text-[#9CA3AF]">No recent wins</p>
          ) : (
            <div className="space-y-2">
              {recentWins.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-emerald-500/10 last:border-0">
                  <div>
                    <div className="text-xs font-medium text-[#1B2A4A]">{d.name}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{d.companyName} {'•'} {d.ownerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-emerald-600">{fmt(d.amount)}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{d.closeDate}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">{'🤖'} AI Recommendations</h3>
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F5920B]/20 text-[#F5920B] text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <p className="text-xs text-white/70 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PIPELINE MODAL */}
      {/* ============================================================ */}
      {modal === 'pipeline' && (
        <Modal wide>
          {modalLoading ? <Loader msg="Analyzing pipeline stages..." /> : modalData && (
            <>
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-1">Pipeline Breakdown</h3>
              <div className="flex gap-4 text-[10px] text-[#9CA3AF] mb-4">
                <span>{modalData.pipeline?.totalOpen} open deals</span>
                <span>{'•'}</span>
                <span>{fmt(modalData.pipeline?.totalOpenValue || 0)} total value</span>
                <span>{'•'}</span>
                <span>{fmt(modalData.pipeline?.totalWeighted || 0)} weighted</span>
                <span>{'•'}</span>
                <span>{pct(modalData.pipeline?.winRate || 0)} win rate</span>
              </div>

              <PipelineBar stages={modalData.pipeline?.stages || {}} stageOrder={modalData.pipeline?.stageOrder || []} />
              <div className="flex gap-2 mt-2 mb-5">
                {(modalData.pipeline?.stageOrder || []).map((s: string) => {
                  const colors: Record<string, string> = { prospecting: '#9CA3AF', qualification: '#3B82F6', proposal: '#8B5CF6', negotiation: '#F59E0B', closed_won: '#10B981', closed_lost: '#EF4444' }
                  return (
                    <span key={s} className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                      <span className="w-2 h-2 rounded-sm" style={{ background: colors[s] || '#9CA3AF' }} />
                      {s.replace(/_/g, ' ')}
                    </span>
                  )
                })}
              </div>

              {/* Stage cards */}
              <div className="space-y-3">
                {(modalData.pipeline?.stageOrder || []).map((s: string) => {
                  const stage = modalData.pipeline?.stages[s]
                  if (!stage) return null
                  return (
                    <div key={s} className="border border-[#E5E7EB] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-[#1B2A4A] capitalize">{s.replace(/_/g, ' ')}</h4>
                        <div className="flex gap-3 text-xs">
                          <span className="text-[#6B7280]">{stage.count} deals</span>
                          <span className="font-mono font-bold text-[#1B2A4A]">{fmt(stage.value)}</span>
                          <span className="font-mono text-[#F5920B]">W: {fmt(stage.weighted)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {stage.deals.slice(0, 5).map((d: any) => (
                          <div key={d.id} className="flex items-center justify-between text-[11px] py-1 border-b border-[#F4F5F7] last:border-0">
                            <div>
                              <span className="font-medium text-[#1B2A4A]">{d.name}</span>
                              <span className="text-[#9CA3AF] ml-2">{d.ownerName}</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="font-mono text-[#1B2A4A]">{fmt(d.amount)}</span>
                              <span className="text-[#9CA3AF]">{pct(Math.round((d.probability || 0) * 100))}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ============================================================ */}
      {/* FORECAST MODAL */}
      {/* ============================================================ */}
      {modal === 'forecast' && (
        <Modal wide>
          {modalLoading ? <Loader msg="Building revenue forecast..." /> : modalData && (
            <>
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-1">Revenue Forecast</h3>
              <div className="flex gap-4 text-[10px] text-[#9CA3AF] mb-5">
                <span>Best Case: {fmt(modalData.bestCase || 0)}</span>
                <span>{'•'}</span>
                <span>Weighted: {fmt(modalData.weightedTotal || 0)}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {(modalData.forecast || []).map((w: any) => (
                  <div key={w.window} className="border border-[#E5E7EB] rounded-xl p-4">
                    <div className="text-[10px] text-[#9CA3AF] uppercase font-bold">{w.window}</div>
                    <div className="text-lg font-mono font-bold text-[#1B2A4A] mt-1">{fmt(w.weighted)}</div>
                    <div className="text-[10px] text-[#9CA3AF] mt-1">
                      Best: {fmt(w.bestCase)} {'•'} Commit: {fmt(w.commit)}
                    </div>
                    <div className="text-[10px] text-[#6B7280] mt-0.5">{w.dealCount} deals</div>
                  </div>
                ))}
              </div>

              {/* Deals per window */}
              {(modalData.forecast || []).map((w: any) => (
                w.deals.length > 0 && (
                  <div key={w.window} className="mb-4">
                    <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase mb-2">{w.window}</h4>
                    {w.deals.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between text-[11px] py-1.5 border-b border-[#F4F5F7] last:border-0">
                        <div>
                          <span className="font-medium text-[#1B2A4A]">{d.name}</span>
                          <span className="text-[#9CA3AF] ml-2">{d.companyName}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="font-mono text-[#1B2A4A]">{fmt(d.amount)}</span>
                          <span className={'text-[10px] px-1.5 py-0.5 rounded ' + (ST[d.stage?.toLowerCase()] || 'bg-gray-50 text-gray-600')}>{d.stage}</span>
                          <span className="text-[#9CA3AF]">{pct(Math.round((d.probability || 0) * 100))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ))}
            </>
          )}
        </Modal>
      )}

      {/* ============================================================ */}
      {/* LEADERBOARD MODAL */}
      {/* ============================================================ */}
      {modal === 'leaderboard' && (
        <Modal>
          {modalLoading ? <Loader msg="Ranking reps..." /> : modalData && (
            <>
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">Rep Leaderboard</h3>
              <div className="space-y-3">
                {(modalData.leaderboard || []).map((rep: any, i: number) => (
                  <div key={rep.name} className="border border-[#E5E7EB] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: i === 0 ? '#F5920B' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : '#E5E7EB', color: i < 3 ? '#fff' : '#6B7280' }}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-[#1B2A4A]">{rep.name}</span>
                      </div>
                      <span className="text-lg font-mono font-bold text-emerald-600">{fmt(rep.wonValue)}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <div className="text-[9px] text-[#9CA3AF]">Won</div>
                        <div className="text-xs font-mono font-bold text-emerald-600">{rep.won}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-[#9CA3AF]">Open</div>
                        <div className="text-xs font-mono font-bold text-blue-600">{rep.open} ({fmt(rep.openValue)})</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-[#9CA3AF]">Lost</div>
                        <div className="text-xs font-mono font-bold text-rose-400">{rep.lost}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-[#9CA3AF]">Win Rate</div>
                        <div className={'text-xs font-mono font-bold ' + (rep.winRate >= 50 ? 'text-emerald-600' : rep.winRate >= 30 ? 'text-amber-600' : 'text-rose-400')}>{pct(rep.winRate)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ============================================================ */}
      {/* AT-RISK MODAL */}
      {/* ============================================================ */}
      {modal === 'at-risk' && (
        <Modal wide>
          {modalLoading ? <Loader msg="Scanning for at-risk deals..." /> : modalData && (
            <>
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-1">At-Risk Deals</h3>
              <div className="flex gap-3 text-[10px] text-[#9CA3AF] mb-5">
                <span>{(modalData.atRisk || []).length} deals flagged</span>
                <span>{'•'}</span>
                <span>{fmt(modalData.totalAtRiskValue || 0)} at risk</span>
              </div>

              {(modalData.atRisk || []).length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-3xl mb-2">{'✅'}</div>
                  <p className="text-sm text-[#6B7280]">No at-risk deals detected. Pipeline looks healthy.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(modalData.atRisk || []).map((d: any) => {
                    const urgency = d.riskScore >= 50 ? 'critical' : d.riskScore >= 30 ? 'high' : 'medium'
                    const urgColors: Record<string, string> = { critical: 'border-rose-500/30 bg-rose-500/5', high: 'border-amber-500/20 bg-amber-500/5', medium: 'border-blue-500/20 bg-blue-500/5' }
                    return (
                      <div key={d.id} className={'border rounded-xl p-4 ' + urgColors[urgency]}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-semibold text-[#1B2A4A]">{d.name}</span>
                            <span className="text-[10px] text-[#9CA3AF] ml-2">{d.companyName} {'•'} {d.ownerName}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-[#1B2A4A]">{fmt(d.amount)}</div>
                            <span className={'text-[10px] font-bold uppercase px-2 py-0.5 rounded ' + (urgency === 'critical' ? 'bg-rose-500/10 text-rose-400' : urgency === 'high' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>
                              Risk: {d.riskScore}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(d.risks || []).map((r: string, i: number) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#F4F5F7] text-[#6B7280]">{r}</span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </Modal>
      )}

      {/* ============================================================ */}
      {/* VELOCITY MODAL */}
      {/* ============================================================ */}
      {modal === 'velocity' && (
        <Modal>
          {modalLoading ? <Loader msg="Calculating sales velocity..." /> : modalData && (
            <>
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">Sales Velocity</h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="border border-[#E5E7EB] rounded-xl p-4 text-center">
                  <div className="text-[10px] text-[#9CA3AF] uppercase">Avg Cycle Time</div>
                  <div className="text-3xl font-mono font-bold text-[#1B2A4A] mt-1">{modalData.velocity?.avgCycleTime || 0}<span className="text-sm font-normal text-[#9CA3AF]"> days</span></div>
                </div>
                <div className="border border-[#E5E7EB] rounded-xl p-4 text-center">
                  <div className="text-[10px] text-[#9CA3AF] uppercase">Avg Deal Size</div>
                  <div className="text-3xl font-mono font-bold text-[#1B2A4A] mt-1">{fmt(modalData.velocity?.avgDealSize || 0)}</div>
                </div>
                <div className="border border-[#F5920B]/20 rounded-xl p-4 text-center bg-[#F5920B]/5">
                  <div className="text-[10px] text-[#F5920B] uppercase font-bold">Daily Velocity</div>
                  <div className="text-3xl font-mono font-bold text-[#F5920B] mt-1">{fmt(modalData.velocity?.velocity || 0)}<span className="text-sm font-normal text-[#9CA3AF]">/day</span></div>
                </div>
                <div className="border border-[#E5E7EB] rounded-xl p-4 text-center">
                  <div className="text-[10px] text-[#9CA3AF] uppercase">Win Rate</div>
                  <div className={'text-3xl font-mono font-bold mt-1 ' + ((modalData.pipeline?.winRate || 0) >= 50 ? 'text-emerald-600' : 'text-amber-600')}>{pct(modalData.pipeline?.winRate || 0)}</div>
                </div>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Sales velocity measures revenue generated per day. Formula: (Open Deals {'×'} Avg Deal Size {'×'} Win Rate) {'÷'} Avg Cycle Time.
                Improve velocity by increasing deal count, raising deal sizes, improving win rate, or shortening your sales cycle.
              </p>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
