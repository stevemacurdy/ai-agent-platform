'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AGENTS } from '@/lib/agents/agent-registry';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface UserInfo { role: string; email: string; approved_agents: string[]; }

const LIVE_AGENTS = Object.values(AGENTS).filter(a => a.status === 'live');

export default function SidebarNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sb = getSupabaseBrowser();
        const { data: { session } } = await sb.auth.getSession();
        if (!session?.access_token) { setLoading(false); return; }

        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + session.access_token },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  // Admins see all agents, employees see only approved
  const visibleAgents = isAdmin
    ? LIVE_AGENTS
    : LIVE_AGENTS.filter(a => (user?.approved_agents || []).includes(a.slug));

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="flex flex-col h-full px-3 py-4">
      <Link href="/" className="flex items-center gap-2 px-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
        <span className="text-sm font-bold text-white">WoulfAI</span>
        <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">{visibleAgents.length} Live</span>
      </Link>

      <div className="text-[9px] text-gray-600 uppercase font-semibold px-3 mb-2">AI Agents</div>
      <div className="space-y-0.5 flex-1 overflow-y-auto">
        {visibleAgents.length === 0 && !loading && (
          <div className="px-3 py-4 text-xs text-gray-600 text-center">No agents assigned yet. Contact your admin for access.</div>
        )}
        {visibleAgents.map(agent => (
          <Link key={agent.slug} href={agent.liveRoute}
            className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive(agent.liveRoute) ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white')}>
            <span className="text-base">{agent.icon}</span>
            <span className="truncate">{agent.name}</span>
          </Link>
        ))}
      </div>

      <div className="border-t border-white/5 mt-3 pt-3 space-y-0.5">
        <div className="text-[9px] text-gray-600 uppercase font-semibold px-3 mb-2">Quick Links</div>

        {/* Everyone gets these */}
        <Link href="/portal" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/portal') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
          <span>{'\uD83D\uDCE6'}</span> Customer Portal
        </Link>
        <Link href="/onboarding" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/onboarding') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
          <span>{'\uD83D\uDE80'}</span> Onboarding
        </Link>
        <Link href="/billing" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/billing') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
          <span>{'\uD83D\uDCB3'}</span> Billing
        </Link>

        {/* Admin only */}
        {isAdmin && (
          <>
            <Link href="/admin" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/admin') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
              <span>{'\u2699\uFE0F'}</span> Admin Dashboard
            </Link>
            <Link href="/admin/users" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/admin/users') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
              <span>{'\uD83D\uDC65'}</span> Manage Users
            </Link>
            <Link href="/demo" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/demo') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
              <span>{'\uD83C\uDFAE'}</span> Demo Hub
            </Link>
          </>
        )}
      </div>

      {/* User info */}
      {user && (
        <div className="border-t border-white/5 mt-3 pt-3 px-3">
          <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
          <div className="text-[9px] text-gray-600 uppercase mt-0.5">{user.role.replace('_', ' ')}</div>
        </div>
      )}
    </nav>
  );
}
