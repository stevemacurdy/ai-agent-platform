'use client';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import Link from 'next/link';
import { useAgents } from '@/lib/hooks/useAgents';
import { useState, useEffect } from 'react';


export default function AdminDashboard() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const LIVE = AGENTS.filter(a => a.status === 'live');
  const CATEGORIES = [...new Set(LIVE.map(a => a.category))];
  const [userCount, setUserCount] = useState(0);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      const t = session?.access_token;
      if (!t) return;
      fetch('/api/admin/users', { headers: { 'Authorization': 'Bearer ' + t } }).then(r => r.json()).then(d => setUserCount(d.users?.length || 0)).catch(() => {});
    })();
  }, []);

  const filtered = selectedCat ? LIVE.filter(a => a.category === selectedCat) : LIVE;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Manage {LIVE.length} live employees, {userCount} users, and platform settings</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[10px] text-[#9CA3AF] uppercase">Live Employees</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">{LIVE.length}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[10px] text-[#9CA3AF] uppercase">Avg Completion</div>
          <div className="text-2xl font-bold mt-1">{Math.round(LIVE.reduce((s, a) => s + a.completionPct, 0) / LIVE.length)}%</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[10px] text-[#9CA3AF] uppercase">Users</div>
          <div className="text-2xl font-bold mt-1">{userCount}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[10px] text-[#9CA3AF] uppercase">Categories</div>
          <div className="text-2xl font-bold mt-1">{CATEGORIES.length}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/users" className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition">Manage Users</Link>
        <Link href="/onboarding" className="px-4 py-2 bg-white shadow-sm text-[#4B5563] rounded-lg text-sm font-medium hover:bg-gray-100 transition">Onboarding Wizard</Link>
        <Link href="/demo" className="px-4 py-2 bg-white shadow-sm text-[#4B5563] rounded-lg text-sm font-medium hover:bg-gray-100 transition">Demo Hub</Link>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSelectedCat(null)} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition " + (!selectedCat ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}>All ({LIVE.length})</button>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCat(cat)} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize " + (selectedCat === cat ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}>{cat} ({LIVE.filter(a => a.category === cat).length})</button>
        ))}
      </div>

      {/* Links to /admin/agents/[slug] NOT to live agent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(agent => (
          <Link key={agent.slug} href={'/admin/agents/' + agent.slug} className="group bg-white border border-[#E5E7EB] hover:border-blue-500/30 rounded-xl p-5 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-600 transition text-sm">{agent.name}</div>
                  <div className="text-[10px] text-[#9CA3AF] capitalize">{agent.category}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">LIVE</span>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-3">{agent.description}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white shadow-sm rounded-full h-1.5">
                <div className={"h-1.5 rounded-full " + (agent.completionPct >= 90 ? 'bg-emerald-500' : agent.completionPct >= 80 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: agent.completionPct + '%' }} />
              </div>
              <span className="text-[10px] text-[#9CA3AF]">{agent.completionPct}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
