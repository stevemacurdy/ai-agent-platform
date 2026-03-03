'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AgentToggle {
  slug: string;
  name: string;
  icon: string;
  dept: string;
  deptColor: string;
  buildBatch: number;
  enabled: boolean;
}

export default function AdminDemoAgentsPage() {
  const [agents, setAgents] = useState<AgentToggle[]>([]);
  const [total, setTotal] = useState(0);
  const [enabledCount, setEnabledCount] = useState(0);

  useEffect(() => {
    fetch('/api/admin/demo-toggles')
      .then(r => r.json())
      .then(d => {
        setAgents(d.agents || []);
        setTotal(d.total || 0);
        setEnabledCount(d.enabled || 0);
      })
      .catch(() => {});
  }, []);

  const handleToggle = async (slug: string, enabled: boolean) => {
    const res = await fetch('/api/admin/demo-toggles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, enabled }),
    });
    if (res.ok) {
      setAgents(prev => prev.map(a => a.slug === slug ? { ...a, enabled } : a));
      setEnabledCount(prev => enabled ? prev + 1 : prev - 1);
    }
  };

  const batches = [1, 2, 3];

  return (
    <div className="min-h-screen p-8" style={{ background: '#F4F5F7', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
          Agent Demo Manager
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
          {enabledCount} of {total} agents enabled
        </p>

        {batches.map(batch => {
          const batchAgents = agents.filter(a => a.buildBatch === batch);
          if (!batchAgents.length) return null;
          return (
            <div key={batch} className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
                Build {batch}
              </h2>
              <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: '#E5E7EB' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>Agent</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>Dept</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>Slug</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>Status</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: '#9CA3AF' }}>Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchAgents.map(agent => (
                      <tr key={agent.slug} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>
                          <span className="mr-2">{agent.icon}</span>{agent.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: agent.deptColor }}>
                            {agent.dept}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={'/demo/' + agent.slug} className="text-xs font-mono hover:underline" style={{ color: '#F5920B' }}>
                            /demo/{agent.slug}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5">
                            <span className={"w-2 h-2 rounded-full " + (agent.enabled ? "bg-green-500" : "bg-gray-300")} />
                            <span className="text-xs" style={{ color: agent.enabled ? '#059669' : '#9CA3AF' }}>
                              {agent.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggle(agent.slug, !agent.enabled)}
                            className={"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + (agent.enabled ? "bg-green-500" : "bg-gray-300")}
                          >
                            <span className={"inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow " + (agent.enabled ? "translate-x-6" : "translate-x-1")} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {agents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#9CA3AF' }}>No agents registered yet. Run Build 1 to add agents.</p>
          </div>
        )}
      </div>
    </div>
  );
}
