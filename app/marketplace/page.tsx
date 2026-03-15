'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const NAVY = '#1B2A4A';
const ORANGE = '#F5920B';
const TEAL = '#2A9D8F';
const GREEN = '#059669';
const RED = '#DC2626';
const BORDER = '#E5E7EB';

interface AgentCard {
  slug: string; name: string; description: string; icon: string;
  department: string; consolePath: string; demoPath: string;
  access: { hasAccess: boolean; label: string; color: string; action: string };
}

interface MarketplaceData {
  agents: AgentCard[];
  departments: Record<string, AgentCard[]>;
  user: { id: string; role: string; accessibleCount: number; totalAgents: number } | null;
}

const DEPT_ORDER = ['Finance', 'Sales', 'Marketing', 'Operations', 'Warehouse', 'HR', 'People', 'Support', 'Legal', 'Compliance', 'Strategy', 'Other'];
const DEPT_ICONS: Record<string, string> = {
  Finance: '💰', Sales: '📈', Marketing: '📣', Operations: '⚙️',
  Warehouse: '🏭', HR: '👥', People: '👥', Support: '🎧',
  Legal: '⚖️', Compliance: '🛡️', Strategy: '🧭', Other: '🤖',
};

const ACCESS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  green: { bg: '#ECFDF5', text: GREEN, border: GREEN + '40' },
  blue: { bg: '#EFF6FF', text: '#2563EB', border: '#2563EB40' },
  teal: { bg: '#F0FDFA', text: TEAL, border: TEAL + '40' },
  purple: { bg: '#F5F3FF', text: '#7C3AED', border: '#7C3AED40' },
  orange: { bg: '#FFF7ED', text: ORANGE, border: ORANGE + '40' },
  gray: { bg: '#F9FAFB', text: '#6B7280', border: '#6B728040' },
};

export default function MarketplacePage() {
  const [data, setData] = useState<MarketplaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterAccess, setFilterAccess] = useState<string>('all');
  const [pricingModal, setPricingModal] = useState<AgentCard | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const sb = getSupabaseBrowser();
        const { data: { session } } = await sb.auth.getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = 'Bearer ' + session.access_token;
        }
        const res = await fetch('/api/marketplace', { headers });
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F7' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: TEAL, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const agents = data?.agents || [];
  const departments = data?.departments || {};
  const user = data?.user;

  // Filters
  const filtered = agents.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDept !== 'all' && a.department !== filterDept) return false;
    if (filterAccess === 'active' && !a.access.hasAccess) return false;
    if (filterAccess === 'locked' && a.access.hasAccess) return false;
    return true;
  });

  // Group filtered agents
  const grouped: Record<string, AgentCard[]> = {};
  filtered.forEach(a => {
    const dept = a.department || 'Other';
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(a);
  });

  const sortedDepts = DEPT_ORDER.filter(d => grouped[d]?.length);
  // Add any departments not in DEPT_ORDER
  Object.keys(grouped).filter(d => !DEPT_ORDER.includes(d)).forEach(d => sortedDepts.push(d));

  const accessibleCount = agents.filter(a => a.access.hasAccess).length;

  function handleCardClick(agent: AgentCard) {
    if (agent.access.hasAccess) {
      window.location.href = agent.consolePath;
    } else if (agent.access.action === 'subscribe') {
      setPricingModal(agent);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F4F5F7' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}>
              AI Employee Marketplace
            </h1>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
              {user ? (
                <>{accessibleCount} of {agents.length} agents active. {user.role === 'admin' || user.role === 'super_admin' ? 'Admin access to all.' : 'Browse and subscribe to more.'}</>
              ) : (
                <>22 AI Employees ready to work. Sign in to access consoles.</>
              )}
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ background: user.role === 'admin' || user.role === 'super_admin' ? '#F5F3FF' : '#ECFDF5',
                  color: user.role === 'admin' || user.role === 'super_admin' ? '#7C3AED' : GREEN }}>
                {user.role.replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                {accessibleCount}/{agents.length} Active
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..."
            className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2" style={{ borderColor: BORDER }} />
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER, color: NAVY }}>
            <option value="all">All Departments</option>
            {Object.keys(departments).sort().map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterAccess} onChange={e => setFilterAccess(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER, color: NAVY }}>
            <option value="all">All Access</option>
            <option value="active">Active Only</option>
            <option value="locked">Locked Only</option>
          </select>
        </div>

        {/* Agent Grid by Department */}
        {sortedDepts.map(dept => (
          <div key={dept}>
            <div className="flex items-center gap-2 mb-3 mt-6">
              <span className="text-lg">{DEPT_ICONS[dept] || '🤖'}</span>
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                {dept} ({grouped[dept].length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {grouped[dept].map(agent => {
                const ac = ACCESS_COLORS[agent.access.color] || ACCESS_COLORS.gray;
                return (
                  <div key={agent.slug}
                    onClick={() => handleCardClick(agent)}
                    className="rounded-xl border bg-white p-5 transition-all hover:shadow-lg cursor-pointer group"
                    style={{ borderColor: agent.access.hasAccess ? ac.border : BORDER }}>
                    {/* Icon + Name */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{agent.icon}</span>
                        <div>
                          <p className="text-sm font-bold group-hover:text-[#2A9D8F] transition" style={{ color: NAVY }}>{agent.name}</p>
                          <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{agent.department}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs leading-relaxed mb-4" style={{ color: '#6B7280' }}>{agent.description}</p>

                    {/* Access Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ background: ac.bg, color: ac.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ac.text }} />
                        {agent.access.label}
                      </span>
                      {agent.access.hasAccess ? (
                        <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition" style={{ color: TEAL }}>
                          Open Console &rarr;
                        </span>
                      ) : (
                        <Link href={agent.demoPath} onClick={e => e.stopPropagation()}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg border transition hover:bg-gray-50"
                          style={{ borderColor: BORDER, color: '#6B7280' }}>
                          View Demo
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#9CA3AF' }}>No agents match your filters.</p>
          </div>
        )}

        {/* Pricing Modal */}
        {pricingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPricingModal(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{pricingModal.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}>{pricingModal.name}</h3>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{pricingModal.department}</p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>{pricingModal.description}</p>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { tier: 'Starter', price: '$497', features: 'Console access, demo data, email support' },
                  { tier: 'Professional', price: '$1,997', features: 'Live integrations, AI actions, priority support' },
                  { tier: 'Enterprise', price: '$4,997', features: 'Custom integrations, dedicated support, SLA' },
                ].map(plan => (
                  <div key={plan.tier} className="rounded-lg border p-4 flex items-center justify-between hover:border-[#F5920B] transition cursor-pointer"
                    style={{ borderColor: BORDER }}
                    onClick={() => window.location.href = '/pricing?agent=' + pricingModal.slug + '&plan=' + plan.tier.toLowerCase()}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: NAVY }}>{plan.tier}</p>
                      <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{plan.features}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: NAVY }}>{plan.price}</p>
                      <p className="text-[10px]" style={{ color: '#9CA3AF' }}>/month</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t flex items-center justify-between" style={{ borderColor: BORDER }}>
                <Link href={pricingModal.demoPath} className="text-xs font-bold" style={{ color: TEAL }}>
                  View Demo First
                </Link>
                <button onClick={() => setPricingModal(null)} className="text-xs font-bold px-4 py-2 rounded-lg" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
