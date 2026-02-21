'use client';
import Link from 'next/link';
import { AGENTS, CATEGORY_LABELS, CATEGORY_ORDER, type AgentCategory } from '@/lib/agents/agent-registry';

const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');

export default function DemoHub() {
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const agents = LIVE_AGENTS.filter(a => a.category === cat);
    if (agents.length > 0) acc[cat] = agents;
    return acc;
  }, {} as Record<AgentCategory, typeof LIVE_AGENTS>);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Demo Hub</h1>
        <p className="text-gray-400 mt-1">Preview all {LIVE_AGENTS.length} live agents with sample data. Each demo mirrors the production agent.</p>
      </div>
      {Object.entries(grouped).map(([cat, agents]) => (
        <div key={cat}>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{CATEGORY_LABELS[cat as AgentCategory]} ({agents.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Link key={agent.slug} href={'/demo/' + agent.slug} className="group bg-[#0A0E15] border border-white/5 hover:border-blue-500/30 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <div className="font-semibold text-white group-hover:text-blue-400 transition">{agent.name}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">{agent.completionPct}% Complete</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">{agent.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 rounded-full h-1"><div className="bg-blue-500 h-1 rounded-full" style={{ width: agent.completionPct + '%' }} /></div>
                  <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition">Preview \u2192</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
