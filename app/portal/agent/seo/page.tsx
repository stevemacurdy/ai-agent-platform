'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Types
interface KeywordRanking {
  keyword: string; position: number; prevPosition: number; change: number
  clicks: number; impressions: number; ctr: number; inMapPack: boolean
  mapPosition: number | null; url: string; trend: 'up' | 'down' | 'stable'
}
interface SeoAction {
  id: string; type: string; title: string; description: string; content?: string
  keyword?: string; priority: string; status: string; impact: string; createdAt: string
}
interface CompetitorData {
  name: string; domain: string; avgPosition: number; mapPackPresence: number
  estimatedTraffic: string; threat: string
}
interface SeoData {
  avgPosition: number; totalClicks: number; totalImpressions: number; avgCtr: number
  techScore: number; pageSpeedMobile: number; pageSpeedDesktop: number
  mapPackKeywords: number; totalTracked: number; gbpViews: number; gbpActions: number
  brokenLinks: number; keywords: KeywordRanking[]; actions: SeoAction[]
  competitors: CompetitorData[]; weeklyWinList: string
}

const TABS = ['Overview', 'Keywords', 'Actions', 'Competitors', 'GBP Manager']
const PRIORITY_COLORS: Record<string, string> = { high: 'text-rose-400 bg-rose-500/10', medium: 'text-amber-400 bg-amber-500/10', low: 'text-blue-400 bg-blue-500/10' }
const TYPE_ICONS: Record<string, string> = { blog_post: '📝', gbp_update: '📸', meta_fix: '🏷️', speed_fix: '⚡', backlink: '🔗', schema_markup: '🧩' }

export default function SeoDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<SeoData | null>(null)
  const [tab, setTab] = useState('Overview')
  const [toast, setToast] = useState<string | null>(null)
  const [expandedAction, setExpandedAction] = useState<string | null>(null)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('woulfai_session')
      if (!saved) { router.replace('/login'); return }
      const parsed = JSON.parse(saved)
      setUser(parsed)
      fetchData(parsed.companyId)
    } catch { router.replace('/login') }
  }, [router])

  const fetchData = async (companyId: string) => {
    try {
      const res = await fetch('/api/agents/seo?companyId=' + companyId)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch {}
  }

  const handleAction = async (actionId: string, action: string) => {
    await fetch('/api/agents/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, actionId, companyId: user?.companyId }),
    })
    if (data) {
      setData({ ...data, actions: data.actions.map(a => a.id === actionId ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a) })
    }
    show(action === 'approve' ? '✅ Action approved — queued for deployment' : '❌ Action rejected')
  }

  if (!user || !data) return <div className="min-h-screen bg-[#060910] flex items-center justify-center text-gray-500">Loading SEO Agent...</div>

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal')} className="text-xs text-gray-500 hover:text-white">← Portal</button>
            <span className="text-gray-700">|</span>
            <span className="text-xl">🔍</span>
            <span className="text-sm font-semibold">SEO Agent</span>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] text-emerald-400 font-medium">LIVE</span></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600">{user.companyName}</span>
            <span className="text-xs text-gray-600">{user.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Tenant scope */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">SEO data scoped to <span className="text-white font-semibold">{user.companyName}</span></span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[
            { label: 'Avg Position', value: data.avgPosition.toFixed(1), trend: data.avgPosition < 15 ? '↑' : '', color: 'text-emerald-400' },
            { label: 'Weekly Clicks', value: data.totalClicks.toLocaleString(), trend: '+12%', color: 'text-blue-400' },
            { label: 'Impressions', value: (data.totalImpressions / 1000).toFixed(1) + 'K', trend: '+8%', color: 'text-purple-400' },
            { label: 'Map Pack', value: data.mapPackKeywords + '/' + data.totalTracked, trend: '', color: 'text-amber-400' },
            { label: 'Tech Score', value: data.techScore + '/100', trend: '', color: data.techScore >= 80 ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'GBP Views', value: data.gbpViews.toLocaleString(), trend: '+15%', color: 'text-pink-400' },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">{kpi.label}</div>
              <div className={"text-xl font-mono font-bold mt-1 " + kpi.color}>{kpi.value}</div>
              {kpi.trend && <div className="text-[10px] text-emerald-400 mt-1">{kpi.trend}</div>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0A0E15] border border-white/5 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-4 py-2 rounded-lg text-xs transition-all " + (tab === t ? 'bg-white/10 text-white font-semibold' : 'text-gray-500 hover:text-gray-300')}>
              {t}
            </button>
          ))}
        </div>

        {/* TAB: Overview */}
        {tab === 'Overview' && (
          <div className="space-y-6">
            {/* Weekly Win List */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">🏆 Weekly Win List</h3>
              <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: data.weeklyWinList.replace(/##\s/g, '<strong>').replace(/\*\*/g, '<strong>').replace(/\n/g, '<br/>') }} />
            </div>

            {/* Pending Actions */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">🎯 Pending Actions ({data.actions.filter(a => a.status === 'pending').length})</h3>
              <div className="space-y-3">
                {data.actions.filter(a => a.status === 'pending').slice(0, 3).map(action => (
                  <div key={action.id} className="border border-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{TYPE_ICONS[action.type] || '📋'}</span>
                        <div>
                          <div className="text-sm font-semibold">{action.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{action.impact}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(action.id, 'approve')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500">✓ Approve</button>
                        <button onClick={() => handleAction(action.id, 'reject')} className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-xs hover:bg-white/10">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top movers */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">📈 Biggest Ranking Improvements This Week</h3>
              <div className="space-y-2">
                {data.keywords.filter(k => k.change < 0).sort((a, b) => a.change - b.change).slice(0, 5).map((kw, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                    <div>
                      <span className="text-sm text-white">{kw.keyword}</span>
                      {kw.inMapPack && <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded ml-2">Map Pack #{kw.mapPosition}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">#{kw.position.toFixed(1)}</span>
                      <span className="text-xs text-emerald-400 font-mono font-bold">{kw.change.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Keywords */}
        {tab === 'Keywords' && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
                  <th className="text-left p-4">Keyword</th>
                  <th className="text-center p-4">Position</th>
                  <th className="text-center p-4">Change</th>
                  <th className="text-center p-4">Clicks</th>
                  <th className="text-center p-4">Impressions</th>
                  <th className="text-center p-4">CTR</th>
                  <th className="text-center p-4">Map Pack</th>
                </tr>
              </thead>
              <tbody>
                {data.keywords.sort((a, b) => a.position - b.position).map((kw, i) => (
                  <tr key={i} className={"border-b border-white/[0.03] " + (i % 2 === 0 ? '' : 'bg-white/[0.01]')}>
                    <td className="p-4">
                      <div className="text-sm font-medium">{kw.keyword}</div>
                      <div className="text-[10px] text-gray-600 truncate">{kw.url}</div>
                    </td>
                    <td className="p-4 text-center font-mono font-bold">{kw.position.toFixed(1)}</td>
                    <td className="p-4 text-center">
                      <span className={"font-mono text-xs font-bold " + (kw.change < 0 ? 'text-emerald-400' : kw.change > 0 ? 'text-rose-400' : 'text-gray-500')}>
                        {kw.change < 0 ? '↑' : kw.change > 0 ? '↓' : '—'} {Math.abs(kw.change).toFixed(1)}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-400">{kw.clicks}</td>
                    <td className="p-4 text-center text-gray-500">{kw.impressions.toLocaleString()}</td>
                    <td className="p-4 text-center text-gray-400">{kw.ctr}%</td>
                    <td className="p-4 text-center">
                      {kw.inMapPack ? (
                        <span className="text-amber-400 font-bold">#{kw.mapPosition}</span>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: Actions */}
        {tab === 'Actions' && (
          <div className="space-y-3">
            {data.actions.map(action => (
              <div key={action.id} className={"border rounded-xl p-5 transition-all " + (action.status === 'approved' ? 'border-emerald-500/20 bg-emerald-500/5' : action.status === 'rejected' ? 'border-rose-500/20 bg-rose-500/5 opacity-50' : 'border-white/5 bg-[#0A0E15]')}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{TYPE_ICONS[action.type] || '📋'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{action.title}</span>
                        <span className={"text-[9px] px-2 py-0.5 rounded font-medium " + (PRIORITY_COLORS[action.priority] || '')}>{action.priority}</span>
                        <span className={"text-[9px] px-2 py-0.5 rounded font-medium " + (action.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : action.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400')}>{action.status}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                      <div className="text-xs text-emerald-400/70 mt-1">Impact: {action.impact}</div>

                      {action.content && (
                        <button onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                          className="text-[10px] text-blue-400 mt-2 hover:text-blue-300">
                          {expandedAction === action.id ? '▼ Hide content' : '▶ View drafted content'}
                        </button>
                      )}
                      {expandedAction === action.id && action.content && (
                        <div className="mt-3 p-4 bg-black/30 rounded-lg text-xs text-gray-300 whitespace-pre-line leading-relaxed border border-white/5">
                          {action.content}
                        </div>
                      )}
                    </div>
                  </div>

                  {action.status === 'pending' && (
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button onClick={() => handleAction(action.id, 'approve')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500">
                        ✓ Approve
                      </button>
                      <button onClick={() => handleAction(action.id, 'reject')}
                        className="px-3 py-2 bg-white/5 text-gray-400 rounded-lg text-xs hover:bg-white/10">
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Competitors */}
        {tab === 'Competitors' && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
                  <th className="text-left p-4">Competitor</th>
                  <th className="text-center p-4">Avg Position</th>
                  <th className="text-center p-4">Map Pack %</th>
                  <th className="text-center p-4">Est. Traffic</th>
                  <th className="text-center p-4">Threat Level</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.03] bg-blue-500/5">
                  <td className="p-4"><div className="text-sm font-bold text-blue-400">{user.companyName} (You)</div><div className="text-[10px] text-gray-600">woulfgroup.com</div></td>
                  <td className="p-4 text-center font-mono font-bold text-blue-400">{data.avgPosition.toFixed(1)}</td>
                  <td className="p-4 text-center text-blue-400">{Math.round((data.mapPackKeywords / data.totalTracked) * 100)}%</td>
                  <td className="p-4 text-center text-blue-400">~{data.totalClicks * 4}/mo</td>
                  <td className="p-4 text-center">—</td>
                </tr>
                {data.competitors.map((comp, i) => (
                  <tr key={i} className={"border-b border-white/[0.03] " + (i % 2 === 0 ? '' : 'bg-white/[0.01]')}>
                    <td className="p-4"><div className="text-sm font-medium">{comp.name}</div><div className="text-[10px] text-gray-600">{comp.domain}</div></td>
                    <td className="p-4 text-center font-mono">{comp.avgPosition.toFixed(1)}</td>
                    <td className="p-4 text-center">{comp.mapPackPresence}%</td>
                    <td className="p-4 text-center text-gray-400">{comp.estimatedTraffic}</td>
                    <td className="p-4 text-center">
                      <span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (comp.threat === 'high' ? 'bg-rose-500/10 text-rose-400' : comp.threat === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400')}>{comp.threat}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: GBP Manager */}
        {tab === 'GBP Manager' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                <div className="text-[9px] text-gray-500 uppercase">GBP Views</div>
                <div className="text-xl font-mono font-bold text-pink-400 mt-1">{data.gbpViews.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400 mt-1">+15% vs last week</div>
              </div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                <div className="text-[9px] text-gray-500 uppercase">Actions (Calls + Clicks)</div>
                <div className="text-xl font-mono font-bold text-amber-400 mt-1">{data.gbpActions}</div>
                <div className="text-[10px] text-emerald-400 mt-1">+8% vs last week</div>
              </div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                <div className="text-[9px] text-gray-500 uppercase">Posts This Month</div>
                <div className="text-xl font-mono font-bold text-blue-400 mt-1">4</div>
                <div className="text-[10px] text-gray-500 mt-1">Target: 12/month</div>
              </div>
            </div>

            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">📸 Drafted GBP Updates</h3>
              {data.actions.filter(a => a.type === 'gbp_update').map(action => (
                <div key={action.id} className="border border-white/5 rounded-xl p-4 mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold">{action.title}</div>
                      <div className="text-xs text-gray-400 mt-2 whitespace-pre-line">{action.content}</div>
                      {action.keyword && <div className="text-[10px] text-blue-400 mt-2">Target: {action.keyword}</div>}
                    </div>
                    {action.status === 'pending' && (
                      <button onClick={() => handleAction(action.id, 'approve')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shrink-0 ml-4">
                        Approve & Post
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
