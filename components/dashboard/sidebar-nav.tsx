'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAgents, CATEGORY_LABELS } from '@/lib/hooks/useAgents';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface UserInfo { role: string; email: string; approved_agents: string[]; }

const DEPT_ORDER = ['finance', 'sales', 'marketing', 'operations', 'warehouse', 'hr', 'support', 'legal', 'compliance', 'research'];
const DEPT_LABELS: Record<string, string> = {
  finance: 'Finance', sales: 'Sales', marketing: 'Marketing', operations: 'Operations',
  warehouse: 'Warehouse', hr: 'People', support: 'Support', legal: 'Legal',
  compliance: 'Compliance', research: 'Strategy',
};

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

  const navLink = (href: string, icon: string, label: string) => (
    <Link key={href} href={href}
      className={'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition ' +
        (isActive(href) ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#1B2A4A]')}>
      <span className="text-base">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );

  const sectionLabel = (text: string) => (
    <div className="text-[9px] text-[#9CA3AF] uppercase font-semibold px-3 mb-1 mt-3 first:mt-0">{text}</div>
  );

  // Group agents by category
  const grouped: Record<string, typeof visibleAgents> = {};
  visibleAgents.forEach(a => {
    const cat = a.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(a);
  });

  return (
    <nav className="flex flex-col h-full px-3 py-4 w-56 border-r border-[#E5E7EB] bg-white">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
        <span className="text-sm font-bold text-[#1B2A4A]">WoulfAI</span>
        <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-[#2A9D8F]/10 text-[#2A9D8F] rounded font-medium">{visibleAgents.length}</span>
      </Link>

      {/* Home */}
      {sectionLabel('Home')}
      <div className="space-y-0.5">
        {navLink('/dashboard', '\uD83C\uDFE0', 'Dashboard')}
        {navLink('/portal', '\uD83D\uDCE6', 'Customer Portal')}
      </div>

      {/* Agent Consoles grouped by department */}
      <div className="flex-1 overflow-y-auto mt-1">
        {visibleAgents.length === 0 && !loading && (
          <div className="px-3 py-4 text-xs text-[#9CA3AF] text-center">No agents assigned yet.</div>
        )}
        {DEPT_ORDER.filter(d => grouped[d]?.length).map(dept => (
          <div key={dept}>
            {sectionLabel(DEPT_LABELS[dept] || CATEGORY_LABELS[dept] || dept)}
            <div className="space-y-0.5">
              {grouped[dept].map(agent => (
                <Link key={agent.slug} href={agent.liveRoute || `/agents/${agent.slug}/console`}
                  className={'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition ' +
                    (isActive(agent.liveRoute || `/agents/${agent.slug}/console`) ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#1B2A4A]')}>
                  <span className="text-base">{agent.icon}</span>
                  <span className="truncate">{agent.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {/* Uncategorized agents */}
        {Object.keys(grouped).filter(d => !DEPT_ORDER.includes(d)).map(dept => {
          if (!grouped[dept]?.length) return null;
          return (
            <div key={dept}>
              {sectionLabel(DEPT_LABELS[dept] || CATEGORY_LABELS[dept] || dept)}
              <div className="space-y-0.5">
                {grouped[dept].map(agent => (
                  <Link key={agent.slug} href={agent.liveRoute || `/agents/${agent.slug}/console`}
                    className={'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition ' +
                      (isActive(agent.liveRoute || `/agents/${agent.slug}/console`) ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#1B2A4A]')}>
                    <span className="text-base">{agent.icon}</span>
                    <span className="truncate">{agent.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Marketplace */}
      {sectionLabel('Discover')}
      <div className="space-y-0.5">
        {navLink('/marketplace', '\uD83D\uDED2', 'Marketplace')}
      </div>

      {/* Settings */}
      {sectionLabel('Settings')}
      <div className="space-y-0.5">
        {navLink('/settings', '\u2699\uFE0F', 'Settings')}
        {navLink('/settings/integrations', '\uD83D\uDD17', 'Integrations')}
        {navLink('/pricing', '\uD83D\uDCB2', 'Plans')}
      </div>

      {/* Admin */}
      {isAdmin && (
        <>
          {sectionLabel('Admin')}
          <div className="space-y-0.5 mb-2">
            {navLink('/admin', '\uD83C\uDFAF', 'Admin Console')}
            {navLink('/admin/users', '\uD83D\uDC65', 'Users')}
            {navLink('/admin/leads', '\uD83D\uDCEC', 'Leads')}
            {navLink('/demo', '\uD83C\uDFAE', 'Demo Hub')}
          </div>
        </>
      )}

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
