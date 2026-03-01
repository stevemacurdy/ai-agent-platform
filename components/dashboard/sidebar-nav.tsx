'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAgents } from '@/lib/hooks/useAgents';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface UserInfo { role: string; email: string; approved_agents: string[]; }

export default function SidebarNav() {
  const { agents: AGENTS } = useAgents();
  const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
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

  const visibleAgents = isAdmin
    ? LIVE_AGENTS
    : LIVE_AGENTS.filter(a => (user?.approved_agents || []).includes(a.slug));

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  if (!loading && !user) return null;
  if (loading) return null;
  return (
    <nav className="flex flex-col h-full px-3 py-4">
      <Link href="/" className="flex items-center gap-2 px-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
        <span className="text-sm font-bold text-[#1B2A4A]">WoulfAI</span>
        <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-[#2A9D8F]/10 text-[#2A9D8F] rounded">{visibleAgents.length} Live</span>
      </Link>

      {/* Quick Links - at top */}
      <div className="text-[9px] text-[#9CA3AF] uppercase font-semibold px-3 mb-2">Quick Links</div>
      <div className="space-y-0.5 mb-4">
        <Link href="/portal" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/portal') ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100')}>
          <span>\uD83D\uDCE6</span> Customer Portal
        </Link>
        <Link href="/onboarding" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/onboarding') ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100')}>
          <span>\uD83D\uDE80</span> Onboarding
        </Link>
        <Link href="/billing" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/billing') ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100')}>
          <span>\uD83D\uDCB3</span> Billing
        </Link>

        {isAdmin && (
          <>
            <Link href="/admin" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/admin') ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100')}>
              <span>\u2699\uFE0F</span> Admin Dashboard
            </Link>
            <Link href="/admin/users" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/admin/users') ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100')}>
              <span>\uD83D\uDC65</span> Manage Users
            </Link>
            <Link href="/admin/leads" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/admin/leads') ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100')}>
              <span>\uD83D\uDCEC</span> Leads
            </Link>
            <Link href="/admin/pricing" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/admin/pricing') ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100')}>
              <span>\uD83D\uDCB2</span> Pricing
            </Link>
            <Link href="/admin/chats" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/admin/chats') ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100')}>
              <span>\uD83D\uDCAC</span> Chat Sessions
            </Link>
            <Link href="/demo" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/demo') ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100')}>
              <span>\uD83C\uDFAE</span> Demo Hub
            </Link>
          </>
        )}
      </div>

      {/* AI Employees */}
      <div className="text-[9px] text-[#9CA3AF] uppercase font-semibold px-3 mb-2">AI Employees</div>
      <div className="space-y-0.5 flex-1 overflow-y-auto">
        {visibleAgents.length === 0 && !loading && (
          <div className="px-3 py-4 text-xs text-[#9CA3AF] text-center">No agents assigned yet. Contact your admin for access.</div>
        )}
        {visibleAgents.map(agent => (
          <Link key={agent.slug} href={agent.liveRoute}
            className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive(agent.liveRoute) ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#1B2A4A]')}>
            <span className="text-base">{agent.icon}</span>
            <span className="truncate">{agent.name}</span>
          </Link>
        ))}
      </div>

      {/* User info */}
      {user && (
        <div className="border-t border-[#E5E7EB] mt-3 pt-3 px-3">
          <div className="text-[10px] text-[#6B7280] truncate">{user.email}</div>
          <div className="text-[9px] text-[#9CA3AF] uppercase mt-0.5">{user.role.replace('_', ' ')}</div>
        </div>
      )}
    </nav>
  );
}
