'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAgents } from '@/lib/hooks/useAgents';
import { trackClick } from '@/lib/track'
import LeadCaptureModal from '@/components/LeadCaptureModal'

export default function AgentDashboard() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const [showLead, setShowLead] = useState<{ slug: string; name: string } | null>(null)
  const live = AGENTS.filter(a => a.status === 'live')
  const dev = AGENTS.filter(a => a.status !== 'live')

  const handleClick = (agent: typeof AGENTS[0]) => {
    trackClick(agent.slug, 'agent-dashboard')
    if (agent.status !== 'live') {
      setShowLead({ slug: agent.slug, name: agent.name })
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {showLead && <LeadCaptureModal agentSlug={showLead.slug} agentName={showLead.name} onClose={() => setShowLead(null)} />}

      <div>
        <h1 className="text-xl font-bold">Agent Dashboard</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">All 11 AI Employees — {live.length} live, {dev.length} in development</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Total Agents</div>
          <div className="text-2xl font-mono font-bold mt-1">{AGENTS.length}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Live</div>
          <div className="text-2xl font-mono font-bold text-emerald-600 mt-1">{live.length}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">In Development</div>
          <div className="text-2xl font-mono font-bold text-amber-600 mt-1">{dev.length}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Avg Completion</div>
          <div className="text-2xl font-mono font-bold text-blue-600 mt-1">{Math.round(AGENTS.reduce((s, a) => s + a.completionPct, 0) / AGENTS.length)}%</div>
        </div>
      </div>

      {/* Live Employees */}
      <div>
        <h2 className="text-sm font-semibold text-emerald-600 mb-3 uppercase tracking-wider">Live Employees</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {live.map(agent => (
            <Link key={agent.slug} href={agent.liveRoute!}
              onClick={() => trackClick(agent.slug, 'agent-dashboard')}
              className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{agent.icon}</div>
                  <div>
                    <div className="text-sm font-semibold group-hover:text-emerald-600 transition-colors">{agent.name}</div>
                    <div className="text-[10px] text-[#6B7280]">{agent.category}</div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-600 animate-pulse">LIVE</span>
              </div>
              <p className="text-xs text-[#9CA3AF] mb-3">{agent.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white shadow-sm rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: agent.completionPct + '%' }} />
                </div>
                <span className="text-[10px] text-[#9CA3AF] font-mono">{agent.completionPct}%</span>
              </div>
              <div className="text-[10px] text-[#6B7280] mt-2">
                {agent.features.filter(f => f.status === 'done').length}/{agent.features.length} features
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dev Agents */}
      <div>
        <h2 className="text-sm font-semibold text-amber-600 mb-3 uppercase tracking-wider">In Development</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dev.map(agent => (
            <div key={agent.slug}
              onClick={() => handleClick(agent)}
              className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-amber-500/20 hover:bg-amber-500/[0.02] transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl opacity-60">{agent.icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-[#6B7280] group-hover:text-amber-600 transition-colors">{agent.name}</div>
                    <div className="text-[10px] text-[#6B7280]">{agent.category}</div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-semibold bg-amber-50 text-amber-600">DEV</span>
              </div>
              <p className="text-xs text-[#6B7280] mb-3">{agent.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white shadow-sm rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: agent.completionPct + '%' }} />
                </div>
                <span className="text-[10px] text-[#9CA3AF] font-mono">{agent.completionPct}%</span>
              </div>
              <div className="text-[10px] text-amber-600/50 mt-2 font-medium">
                Click to join waitlist →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
