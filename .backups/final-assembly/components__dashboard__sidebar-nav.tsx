'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/lib/providers/tenant-provider';
import { AGENTS, CATEGORY_LABELS, CATEGORY_ORDER, type AgentCategory } from '@/lib/agents/agent-registry';

// Dynamic counts
const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
const LIVE_COUNT = LIVE_AGENTS.length;

export default function SidebarNav() {
  const pathname = usePathname();
  const { currentCompany, companies, switchCompany, isLoading } = useTenant();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const agents = AGENTS.filter(a => a.category === cat && a.status === 'live');
    if (agents.length > 0) acc[cat] = agents;
    return acc;
  }, {} as Record<AgentCategory, typeof AGENTS>);

  const toggleCat = (cat: string) => setCollapsed(p => ({ ...p, [cat]: !p[cat] }));

  return (
    <aside className="w-64 bg-[#0A0E15] border-r border-white/5 text-gray-100 min-h-screen flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          Woulf<span className="text-blue-400">AI</span>
        </Link>
        <div className="text-[10px] text-gray-500 mt-1">{LIVE_COUNT} Live Agents</div>
      </div>

      {/* Business Switcher */}
      <div className="px-3 py-3 border-b border-white/5 relative">
        <button onClick={() => setSwitcherOpen(!switcherOpen)} className="w-full flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-sm">
          <span className="truncate">{isLoading ? 'Loading...' : currentCompany?.name || 'Select Company'}</span>
          <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition ${switcherOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {switcherOpen && companies.length > 0 && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-[#111827] rounded-lg shadow-xl border border-white/10 z-50 max-h-60 overflow-y-auto">
            {companies.map((c) => (
              <button key={c.id} onClick={() => { switchCompany(c.id); setSwitcherOpen(false); }} className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition ${c.id === currentCompany?.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'}`}>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="px-3 py-3 border-b border-white/5 space-y-1">
        {[
          { href: '/portal', icon: '📋', label: 'Customer Portal' },
          { href: '/onboarding', icon: '🚀', label: 'Onboarding' },
        ].map(link => (
          <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${pathname?.startsWith(link.href) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            <span className="text-lg">{link.icon}</span><span>{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Agent Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {Object.entries(grouped).map(([cat, agents]) => (
          <div key={cat}>
            <button onClick={() => toggleCat(cat)} className="w-full flex items-center justify-between px-3 mb-1">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{CATEGORY_LABELS[cat as AgentCategory]} ({agents.length})</h3>
              <svg className={`w-3 h-3 text-gray-600 transition ${collapsed[cat] ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsed[cat] && (
              <ul className="space-y-0.5">
                {agents.map((agent) => {
                  const active = pathname?.startsWith(agent.liveRoute);
                  return (
                    <li key={agent.slug}>
                      <Link href={agent.liveRoute} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <span className="text-base">{agent.icon}</span>
                        <span className="truncate text-xs">{agent.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Links */}
      <div className="px-3 py-3 border-t border-white/5 space-y-1">
        {[
          { href: '/admin', icon: '⚡', label: 'Admin Dashboard' },
          { href: '/demo', icon: '🎮', label: 'Demo Hub' },
        ].map(link => (
          <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${pathname?.startsWith(link.href) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            <span className="text-lg">{link.icon}</span><span>{link.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}