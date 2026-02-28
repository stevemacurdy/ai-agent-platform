'use client';
import Link from 'next/link';
import { useAgents, CATEGORY_LABELS, CATEGORY_ORDER, type AgentCategory } from '@/lib/hooks/useAgents';

export default function DemoHub() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const agents = LIVE_AGENTS.filter(a => a.category === cat);
    if (agents.length > 0) acc[cat] = agents;
    return acc;
  }, {} as Record<string, typeof LIVE_AGENTS>);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1B2A4A]">Demo Hub</h1>
        <p className="text-[#6B7280] mt-1">Preview all {LIVE_AGENTS.length} live AI Employees with sample data. Each demo mirrors the production employee.</p>
      </div>
      {Object.entries(grouped).map(([cat, agents]) => (
        <div key={cat}>
          <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">{CATEGORY_LABELS[cat as AgentCategory]} ({agents.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Link key={agent.slug} href={'/demo/' + agent.slug} className="group bg-white border border-[#E5E7EB] hover:border-[#2A9D8F]/40 rounded-xl p-5 transition-all hover:shadow-[0_4px_12px_rgba(27,42,74,0.08)]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <div className="font-semibold text-[#1B2A4A] group-hover:text-[#2A9D8F] transition">{agent.name}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">{agent.completionPct}% Complete</div>
                  </div>
                </div>
                <p className="text-xs text-[#9CA3AF] mb-3">{agent.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#E5E7EB] rounded-full h-1"><div className="bg-[#2A9D8F] h-1 rounded-full" style={{ width: agent.completionPct + '%' }} /></div>
                  <span className="text-[10px] text-[#2A9D8F] opacity-0 group-hover:opacity-100 transition">Preview →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
