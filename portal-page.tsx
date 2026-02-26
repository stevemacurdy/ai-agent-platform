'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/authenticated-layout';
import { authFetch, type AuthUser } from '@/lib/auth';

/* ═══════════════════════════════════════════════════════════════════
   WoulfAI Portal Dashboard — Built on AuthenticatedLayout
   Auth, topbar, footer all handled by the layout wrapper.
   This page only contains portal-specific content.
   ═══════════════════════════════════════════════════════════════════ */

interface Agent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  icon?: string;
  status?: string;
}

const CAT_COLORS: Record<string, string> = {
  Finance: '#F5920B', Operations: '#2A9D8F', Revenue: '#1B2A4A',
  People: '#6366F1', Legal: '#8B5CF6', default: '#2A9D8F',
};

const ICONS: Record<string, string> = {
  cfo: '💰', wms: '🏭', sales: '🎯', marketing: '📢', operations: '⚙️',
  hr: '👥', support: '🎧', training: '📚', seo: '🔍', compliance: '📋',
  legal: '⚖️', research: '🧪', str: '🏠', 'supply-chain': '🚛', 'org-lead': '🏢',
};

export default function PortalPage() {
  return (
    <AuthenticatedLayout>
      {(user) => <PortalContent user={user} />}
    </AuthenticatedLayout>
  );
}

function PortalContent({ user }: { user: AuthUser }) {
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [agentsLoaded, setAgentsLoaded] = useState(false);
  const welcome = searchParams.get('welcome');

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await authFetch('/api/agents');
        if (res.ok) {
          const data = await res.json();
          setAgents(data.agents || data || []);
        }
      } catch {
        // Agents failed to load — not fatal
      } finally {
        setAgentsLoaded(true);
      }
    }
    loadAgents();
  }, []);

  const filtered = agents.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const activeCount = agents.filter((a) => a.status === 'active' || !a.status).length;

  return (
    <>
      {/* Welcome banner */}
      {welcome && (
        <div
          className="mb-6 px-5 py-4 rounded-2xl flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(42,157,143,0.06) 0%, rgba(245,146,11,0.04) 100%)',
            border: '1px solid rgba(42,157,143,0.12)',
          }}
        >
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-[15px] font-bold" style={{ color: '#1B2A4A' }}>
              Welcome to WoulfAI{user.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </p>
            <p className="text-[13px] text-gray-500">
              Your workspace is ready. Start by exploring your AI Employees below.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
            Your AI Team
          </h1>
          <p className="mt-1 text-[15px] text-gray-500">
            {activeCount} AI Employee{activeCount !== 1 ? 's' : ''} working for you
          </p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="pl-10 pr-4 py-2.5 rounded-xl text-[14px] outline-none transition-all w-[200px] sm:w-[260px] border-[1.5px] border-gray-200 bg-white focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/10"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Employees', value: String(activeCount), icon: '🤖', accent: '#2A9D8F' },
          { label: 'Total Agents', value: String(agents.length), icon: '📊', accent: '#1B2A4A' },
          { label: 'Uptime', value: '99.9%', icon: '⚡', accent: '#2A9D8F' },
          { label: 'Team Status', value: 'Healthy', icon: '✅', accent: '#2A9D8F' },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-white border border-gray-200 transition-all hover:-translate-y-px hover:shadow-lg"
            style={{ boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg">{stat.icon}</span>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: stat.accent }} />
            </div>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
              {stat.value}
            </p>
            <p className="text-[12px] text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Agent grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!agentsLoaded ? (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-400">Loading agents...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-bold" style={{ color: '#1B2A4A' }}>
              {searchQuery ? 'No employees match your search' : 'No AI Employees yet'}
            </p>
            <p className="text-[14px] text-gray-500 mt-1.5">
              {searchQuery ? 'Try a different search term' : 'Contact your admin to enable AI Employees'}
            </p>
          </div>
        ) : (
          filtered.map((agent) => {
            const catColor = CAT_COLORS[agent.category || ''] || CAT_COLORS.default;
            const icon = agent.icon || ICONS[agent.slug] || '🤖';
            return (
              <Link key={agent.id || agent.slug} href={`/portal/agent/${agent.slug || agent.id}`}
                className="group p-6 rounded-2xl bg-white border border-gray-200 transition-all duration-200 hover:-translate-y-[3px] hover:shadow-xl relative overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
                <div className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                  style={{ background: `linear-gradient(90deg, ${catColor}, ${catColor}88)` }} />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${catColor}10` }}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[15px] truncate" style={{ color: '#1B2A4A' }}>{agent.name}</h3>
                      <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                        style={{ background: agent.status === 'inactive' ? '#E5E7EB' : '#2A9D8F' }} />
                    </div>
                    {agent.category && (
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: `${catColor}10`, color: catColor }}>{agent.category}</span>
                    )}
                    {agent.description && (
                      <p className="text-[12px] text-gray-500 mt-2 leading-relaxed line-clamp-2">{agent.description}</p>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Quick links */}
      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {[
          { href: '/warehouse', icon: '🏭', label: 'Warehouse Portal', desc: 'Inventory, pallets, orders' },
          { href: '/agents/cfo/console', icon: '💰', label: 'Finance Console', desc: 'Cash flow, invoices, AP' },
          { href: '/agents/sales/coach', icon: '🎯', label: 'Sales Coach', desc: 'Pipeline & deal intelligence' },
        ].map((link) => (
          <Link key={link.href} href={link.href}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 transition-all hover:-translate-y-px hover:shadow-lg"
            style={{ boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
            <span className="text-2xl">{link.icon}</span>
            <div>
              <p className="font-bold text-[14px]" style={{ color: '#1B2A4A' }}>{link.label}</p>
              <p className="text-[12px] text-gray-500">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
