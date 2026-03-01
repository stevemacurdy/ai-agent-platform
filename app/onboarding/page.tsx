'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAgents } from '@/lib/hooks/useAgents';


export default function OnboardingHub() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const LIVE_AGENTS = Object.values(AGENTS).filter(a => a.status === 'live');
  const [search, setSearch] = useState('');

  const filtered = LIVE_AGENTS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Employee Onboarding</h1>
        <p className="text-sm text-[#6B7280] mt-1">Select an AI Employee to begin setup. Each wizard takes under 10 minutes.</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search employees..."
        className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-[#1B2A4A] placeholder-[#9CA3AF]"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(agent => (
          <Link key={agent.slug} href={'/onboarding/' + agent.slug}
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-blue-300 transition group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{agent.icon}</span>
              <div>
                <div className="text-sm font-semibold text-[#1B2A4A] group-hover:text-blue-600 transition">{agent.name}</div>
                <div className="text-[10px] text-[#9CA3AF]">{agent.category}</div>
              </div>
            </div>
            <p className="text-xs text-[#6B7280]">{agent.description || 'Set up ' + agent.name + ' for your business.'}</p>
            <div className="mt-3 text-[10px] text-blue-600 font-medium">Start Setup {'\u2192'}</div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-[#9CA3AF]">No agents match your search.</div>
        )}
      </div>
    </div>
  );
}
