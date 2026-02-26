'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Agent { id: string; name: string; slug: string; description?: string; category?: string; icon?: string; status?: string; }
interface User { id: string; email: string; name?: string; role?: string; company_id?: string; }

const CAT_COLORS: Record<string, string> = { Finance: '#F5920B', Operations: '#2A9D8F', Revenue: '#1B2A4A', People: '#6366F1', Legal: '#8B5CF6', default: '#2A9D8F' };
const ICONS: Record<string, string> = { cfo: '💰', wms: '🏭', sales: '🎯', marketing: '📢', operations: '⚙️', hr: '👥', support: '🎧', training: '📚', seo: '🔍', compliance: '📋', legal: '⚖️', research: '🧪', str: '🏠', 'supply-chain': '🚛', 'org-lead': '🏢' };

export default function PortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const welcome = searchParams.get('welcome');

  useEffect(() => {
    async function load() {
      try {
        const [userRes, agentsRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/agents')]);
        if (!userRes.ok) { router.push('/login'); return; }
        const userData = await userRes.json();
        setUser(userData.user || userData);
        if (agentsRes.ok) { const d = await agentsRes.json(); setAgents(d.agents || d || []); }
      } catch { router.push('/login'); } finally { setLoading(false); }
    }
    load();
  }, [router]);

  const filtered = agents.filter((a) => a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.category?.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeCount = agents.filter((a) => a.status === 'active' || !a.status).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F7' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-[3px] mx-auto mb-4" style={{ borderColor: '#E5E7EB', borderTopColor: '#2A9D8F', animation: 'spin 0.8s linear infinite' }} />
        <p className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading your workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#F4F5F7', color: '#1A1A2E', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
        h1, h2, h3, h4 { font-family: 'Outfit', 'DM Sans', sans-serif; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease-out both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.1s; }
        .fade-up-3 { animation-delay: 0.15s; }
      `}</style>

      {/* TOPBAR */}
      <nav className="sticky top-0 z-50 px-6 sm:px-8"
        style={{ background: 'rgba(27,42,74,0.97)', backdropFilter: 'blur(16px) saturate(1.6)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[60px]">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={36} height={36} className="drop-shadow-lg group-hover:scale-105 transition-transform" />
            <span className="text-lg font-extrabold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Woulf<span style={{ color: '#F5920B' }}>AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/billing" className="hidden sm:flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/80 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              Billing
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-all" onClick={() => router.push('/admin')}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: '#2A9D8F' }}>
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-[13px] text-white/70 font-medium max-w-[120px] truncate">{user?.name || user?.email}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {welcome && (
          <div className="mb-6 px-5 py-4 rounded-2xl flex items-center gap-3 fade-up"
            style={{ background: 'linear-gradient(135deg, rgba(42,157,143,0.06) 0%, rgba(245,146,11,0.04) 100%)', border: '1px solid rgba(42,157,143,0.12)' }}>
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-[15px] font-bold" style={{ color: '#1B2A4A' }}>Welcome to WoulfAI{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!</p>
              <p className="text-[13px] text-gray-500">Your workspace is ready. Start by exploring your AI Employees below.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 fade-up">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>Your AI Team</h1>
            <p className="mt-1 text-[15px] text-gray-500">{activeCount} AI Employee{activeCount !== 1 ? 's' : ''} working for you</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search employees..."
                className="pl-10 pr-4 py-2.5 rounded-xl text-[14px] outline-none transition-all w-[200px] sm:w-[260px]"
                style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', color: '#1A1A2E' }}
                onFocus={(e) => { e.target.style.borderColor = '#2A9D8F'; e.target.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
            </div>
            {user?.role === 'admin' && (
              <Link href="/admin" className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-px"
                style={{ background: '#1B2A4A', color: '#fff', boxShadow: '0 2px 8px rgba(27,42,74,0.15)' }}>
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-up fade-up-1">
          {[
            { label: 'Active Employees', value: String(activeCount), icon: '🤖', accent: '#2A9D8F' },
            { label: 'Total Agents', value: String(agents.length), icon: '📊', accent: '#1B2A4A' },
            { label: 'Uptime', value: '99.9%', icon: '⚡', accent: '#2A9D8F' },
            { label: 'Team Status', value: 'Healthy', icon: '✅', accent: '#2A9D8F' },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl bg-white border transition-all hover:-translate-y-px hover:shadow-lg"
              style={{ borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg">{stat.icon}</span>
                <span className="w-2 h-2 rounded-full" style={{ background: stat.accent, animation: 'pulse-dot 2s infinite' }} />
              </div>
              <p className="text-2xl font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{stat.value}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Agent grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-up fade-up-2">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-bold" style={{ color: '#1B2A4A' }}>{searchQuery ? 'No employees match your search' : 'No AI Employees yet'}</p>
              <p className="text-[14px] text-gray-500 mt-1.5">{searchQuery ? 'Try a different search term' : 'Contact your admin to enable AI Employees for your workspace'}</p>
            </div>
          ) : filtered.map((agent) => {
            const catColor = CAT_COLORS[agent.category || ''] || CAT_COLORS.default;
            const icon = agent.icon || ICONS[agent.slug] || '🤖';
            return (
              <Link key={agent.id || agent.slug} href={`/portal/agent/${agent.slug || agent.id}`}
                className="group p-6 rounded-2xl bg-white border transition-all duration-200 hover:-translate-y-[3px] hover:shadow-xl relative overflow-hidden"
                style={{ borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
                <div className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                  style={{ background: `linear-gradient(90deg, ${catColor}, ${catColor}88)` }} />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${catColor}10` }}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[15px] truncate" style={{ color: '#1B2A4A' }}>{agent.name}</h3>
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: agent.status === 'inactive' ? '#E5E7EB' : '#2A9D8F', animation: agent.status !== 'inactive' ? 'pulse-dot 2s infinite' : 'none' }} />
                    </div>
                    {agent.category && (
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: `${catColor}10`, color: catColor }}>{agent.category}</span>
                    )}
                    {agent.description && <p className="text-[12px] text-gray-500 mt-2 leading-relaxed line-clamp-2">{agent.description}</p>}
                  </div>
                </div>
                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4 fade-up fade-up-3">
          {[
            { href: '/warehouse', icon: '🏭', label: 'Warehouse Portal', desc: 'Inventory, pallets, orders' },
            { href: '/agents/cfo/console', icon: '💰', label: 'Finance Console', desc: 'Cash flow, invoices, AP' },
            { href: '/agents/sales/coach', icon: '🎯', label: 'Sales Coach', desc: 'Pipeline & deal intelligence' },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white border transition-all hover:-translate-y-px hover:shadow-lg"
              style={{ borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
              <span className="text-2xl">{link.icon}</span>
              <div>
                <p className="font-bold text-[14px]" style={{ color: '#1B2A4A' }}>{link.label}</p>
                <p className="text-[12px] text-gray-500">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="mt-12 py-6 px-6 sm:px-8 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={20} height={20} className="opacity-50" />
            <span className="text-[11px] text-gray-400">© 2026 WoulfAI by Woulf Group</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/security" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Security</Link>
            <Link href="/terms" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
