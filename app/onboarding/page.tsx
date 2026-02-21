'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';

const LIVE_AGENTS = Object.values(AGENTS).filter(a => a.status === 'live');

export default function OnboardingHub() {
  const [search, setSearch] = useState('');

  const filtered = LIVE_AGENTS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agent Onboarding</h1>
        <p className="text-sm text-gray-400 mt-1">Select an agent to begin setup. Each wizard takes under 10 minutes.</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search agents..."
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(agent => (
          <Link key={agent.slug} href={'/onboarding/' + agent.slug}
            className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{agent.icon}</span>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition">{agent.name}</div>
                <div className="text-[10px] text-gray-500">{agent.category}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400">{agent.description || 'Set up ' + agent.name + ' for your business.'}</p>
            <div className="mt-3 text-[10px] text-blue-400 font-medium">Start Setup {'\u2192'}</div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-gray-500">No agents match your search.</div>
        )}
      </div>
    </div>
  );
}
