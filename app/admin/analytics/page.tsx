'use client'
import { useState, useEffect } from 'react'
import { useAgents } from '@/lib/hooks/useAgents';

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }

export default function AnalyticsPage() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const [clickData, setClickData] = useState<any[]>([])
  const [leadData, setLeadData] = useState<any>({ totalLeads: 0, byAgent: {} })
  const [loading, setLoading] = useState(true)
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [clicks, leads] = await Promise.all([
        fetch('/api/agents/click', { headers: { 'x-admin-email': getEmail() } }).then(r => r.json()).catch(() => ({ analytics: [] })),
        fetch('/api/leads', { headers: { 'x-admin-email': getEmail() } }).then(r => r.json()).catch(() => ({ totalLeads: 0, byAgent: {} })),
      ])
      setClickData(clicks.analytics || [])
      setLeadData(leads)
      setLoading(false)
    }
    load()
  }, [])

  const getClicks = (slug: string) => clickData.find(c => c.agent_slug === slug) || { total_clicks: 0, clicks_24h: 0, clicks_7d: 0, unique_sessions: 0 }
  const getLeads = (slug: string) => leadData.byAgent?.[slug] || 0

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Agent Analytics</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Click tracking, market interest, and build status for all 11 agents</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Total Agents</div><div className="text-2xl font-mono font-bold mt-1">11</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Live</div><div className="text-2xl font-mono font-bold text-emerald-600 mt-1">{AGENTS.filter(a => a.status === 'live').length}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Total Clicks</div><div className="text-2xl font-mono font-bold text-blue-600 mt-1">{clickData.reduce((s, c) => s + c.total_clicks, 0)}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Leads Captured</div><div className="text-2xl font-mono font-bold text-amber-600 mt-1">{leadData.totalLeads}</div></div>
      </div>

      {/* Agent Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-[#9CA3AF] uppercase border-b border-[#E5E7EB]">
              <th className="text-left p-4">Agent</th>
              <th className="text-center p-4">Status</th>
              <th className="text-center p-4">Progress</th>
              <th className="text-center p-4">Clicks</th>
              <th className="text-center p-4">24h</th>
              <th className="text-center p-4">7d</th>
              <th className="text-center p-4">Leads</th>
            </tr>
          </thead>
          <tbody>
            {AGENTS.map(agent => {
              const c = getClicks(agent.slug)
              const leads = getLeads(agent.slug)
              const isExpanded = expandedAgent === agent.slug
              return (
                <>
                  <tr key={agent.slug}
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.slug)}
                    className="border-b border-white/[0.03] hover:bg-white shadow-sm cursor-pointer transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{agent.icon}</span>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-[10px] text-[#6B7280]">{agent.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={"text-[10px] px-2 py-0.5 rounded font-semibold " + (agent.status === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                        {agent.status === 'live' ? 'LIVE' : 'DEV'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 bg-white shadow-sm rounded-full h-2"><div className={"h-2 rounded-full " + (agent.completionPct >= 80 ? 'bg-emerald-500' : agent.completionPct >= 50 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: agent.completionPct + '%' }} /></div>
                        <span className="text-xs font-mono text-[#6B7280] w-8">{agent.completionPct}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono">{c.total_clicks}</td>
                    <td className="p-4 text-center font-mono text-xs text-[#9CA3AF]">{c.clicks_24h}</td>
                    <td className="p-4 text-center font-mono text-xs text-[#9CA3AF]">{c.clicks_7d}</td>
                    <td className="p-4 text-center font-mono">{leads > 0 ? <span className="text-amber-600">{leads}</span> : <span className="text-[#6B7280]">0</span>}</td>
                  </tr>
                  {isExpanded && (
                    <tr key={agent.slug + '-detail'}>
                      <td colSpan={7} className="p-4 bg-white/[0.01]">
                        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                          <div>
                            <div className="text-xs font-semibold text-emerald-600 mb-2">Completed ({agent.features.filter(f => f.status === 'done').length})</div>
                            {agent.features.filter(f => f.status === 'done').map((f, i) => (
                              <div key={i} className="text-xs text-[#6B7280] py-0.5">✓ {f.name}</div>
                            ))}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-amber-600 mb-2">Backlog / Debt ({agent.features.filter(f => f.status !== 'done').length})</div>
                            {agent.features.filter(f => f.status !== 'done').map((f, i) => (
                              <div key={i} className="text-xs text-[#6B7280] py-0.5">
                                {f.status === 'debt' ? '⚠' : '○'} {f.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
