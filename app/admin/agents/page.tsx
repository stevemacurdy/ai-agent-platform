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
        <p className="text-sm text-gray-500 mt-1">All 11 AI agents — {live.length} live, {dev.length} in development</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Total Agents</div>
          <div className="text-2xl font-mono font-bold mt-1">{AGENTS.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Live</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{live.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">In Development</div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">{dev.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Avg Completion</div>
          <div className="text-2xl font-mono font-bold text-blue-400 mt-1">{Math.round(AGENTS.reduce((s, a) => s + a.completionPct, 0) / AGENTS.length)}%</div>
        </div>
      </div>

      {/* Live Agents */}
      <div>
        <h2 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Live Agents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {live.map(agent => (
            <Link key={agent.slug} href={agent.liveRoute!}
              onClick={() => trackClick(agent.slug, 'agent-dashboard')}
              className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{agent.icon}</div>
                  <div>
                    <div className="text-sm font-semibold group-hover:text-emerald-400 transition-colors">{agent.name}</div>
                    <div className="text-[10px] text-gray-600">{agent.category}</div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 animate-pulse">LIVE</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{agent.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: agent.completionPct + '%' }} />
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{agent.completionPct}%</span>
              </div>
              <div className="text-[10px] text-gray-600 mt-2">
                {agent.features.filter(f => f.status === 'done').length}/{agent.features.length} features
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dev Agents */}
      <div>
        <h2 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">In Development</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dev.map(agent => (
            <div key={agent.slug}
              onClick={() => handleClick(agent)}
              className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-amber-500/20 hover:bg-amber-500/[0.02] transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl opacity-60">{agent.icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-400 group-hover:text-amber-400 transition-colors">{agent.name}</div>
                    <div className="text-[10px] text-gray-600">{agent.category}</div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-400">DEV</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">{agent.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: agent.completionPct + '%' }} />
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{agent.completionPct}%</span>
              </div>
              <div className="text-[10px] text-amber-400/50 mt-2 font-medium">
                Click to join waitlist →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
