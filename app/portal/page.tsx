'use client';
import { useState, useEffect } from 'react';
import { useCompany } from '@/lib/company-context';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CompanyMembers from '@/components/portal/company-members';
import { AGENTS } from '@/lib/agents/agent-registry';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface Company {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  agents: string[];
}

interface UserInfo {
  role: string;
  email: string;
  approved_agents: string[];
}

const COMPANY_THEMES: Record<string, { gradient: string; accent: string; icon: string }> = {
  'woulf-group': { gradient: 'from-blue-600 to-cyan-500', accent: 'blue', icon: '🐺' },
  'desert-peak-lodge': { gradient: 'from-amber-600 to-orange-500', accent: 'amber', icon: '🏔️' },
  'clutch-3pl': { gradient: 'from-purple-600 to-pink-500', accent: 'purple', icon: '⚡' },
  'woulfai': { gradient: 'from-emerald-600 to-teal-500', accent: 'emerald', icon: '🤖' },
};

const LIVE_AGENTS = Object.values(AGENTS).filter(a => a.status === 'live');

export default function PortalPage() {
  const searchParams = useSearchParams();
  const companySlug = searchParams.get('company');
  const [company, setCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCompany: setActiveCompany } = useCompany();
  const [activeTab, setActiveTab] = useState<'agents' | 'team'>('agents');

  useEffect(() => {
    const load = async () => {
      try {
        const sb = getSupabaseBrowser();
        const { data: { session } } = await sb.auth.getSession();

        // Load user info
        if (session?.access_token) {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': 'Bearer ' + session.access_token },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) setUser(data.user);
          }
        }

        // Load companies via API (bypasses RLS)
        const compRes = await fetch('/api/portal/companies?t=' + Date.now());
        const compData = await compRes.json();
        const comps = compData.companies;
        if (comps) {
          setCompanies(comps.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, domain: c.domain, agents: c.agents || [] })));
          if (companySlug) {
            const found = comps.find((c: any) => c.slug === companySlug) as any;
            if (found) { setActiveCompany({ id: found.id, name: found.name, slug: found.slug, agents: found.agents || [] }); setCompany({ id: found.id, name: found.name, slug: found.slug, domain: found.domain, agents: found.agents || [] }); }
          }
        }
      } catch (e) {
        console.error('Portal load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [companySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading portal...</div>
      </div>
    );
  }

  // Company selector if no company chosen
  if (!company) {
    return (
      <div className="min-h-screen bg-[#060910] text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Company Portals</h1>
            <p className="text-gray-400">Select your company to access your AI agents</p>
          </div>

          {/* Company Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map(c => {
              const theme = COMPANY_THEMES[c.slug] || { gradient: 'from-gray-600 to-gray-500', accent: 'gray', icon: '🏢' };
              const agentCount = (c.agents || []).length;
              const matchedAgents = LIVE_AGENTS.filter(a => (c.agents || []).includes(a.slug));

              return (
                <Link key={c.id} href={`/portal?company=${c.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0A0E15] hover:border-white/10 transition-all hover:scale-[1.01]">
                  {/* Gradient banner */}
                  <div className={`h-24 bg-gradient-to-r ${theme.gradient} flex items-center px-6`}>
                    <span className="text-4xl mr-3">{theme.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{c.name}</h2>
                      {c.domain && <div className="text-sm text-white/70">{c.domain}</div>}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg px-3 py-1.5 text-sm">
                        <span className="text-white font-semibold">{agentCount}</span>
                        <span className="text-gray-500 ml-1">agents</span>
                      </div>
                      {c.domain && (
                        <div className="bg-white/5 rounded-lg px-3 py-1.5 text-sm text-gray-400">
                          🌐 {c.domain}
                        </div>
                      )}
                    </div>

                    {/* Agent preview chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {matchedAgents.slice(0, 8).map(a => (
                        <span key={a.slug} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded-md">
                          {a.icon} {a.name}
                        </span>
                      ))}
                      {agentCount > 8 && (
                        <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-1 rounded-md">
                          +{agentCount - 8} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="absolute top-8 right-6 text-white/50 group-hover:text-white/80 transition text-xl">→</div>
                </Link>
              );
            })}
          </div>

          {/* Back to main */}
          <div className="text-center mt-8">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Company portal view
  const theme = COMPANY_THEMES[company.slug] || { gradient: 'from-gray-600 to-gray-500', accent: 'gray', icon: '🏢' };
  const companyAgents = LIVE_AGENTS.filter(a => (company.agents || []).includes(a.slug));

  // Group agents by category
  const categories: Record<string, typeof companyAgents> = {};
  for (const a of companyAgents) {
    const cat = a.category || 'other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(a);
  }

  const CATEGORY_LABELS: Record<string, string> = {
    finance: '💰 Finance',
    sales: '📈 Sales',
    people: '👥 People',
    operations: '⚙️ Operations',
    compliance: '🔒 Compliance & Legal',
    portal: '🌐 Portal',
    other: '📦 Other',
  };

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {/* Company Header */}
      <div className={`bg-gradient-to-r ${theme.gradient}`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{theme.icon}</span>
              <div>
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <p className="text-white/70 text-sm">{companyAgents.length} AI agents deployed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="text-right">
                  <div className="text-sm font-medium text-white/90">{user.email}</div>
                  <div className="text-xs text-white/50 capitalize">{user.role}</div>
                </div>
              )}
              <Link href="/portal" className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition">
                Switch Company
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#0A0E15] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-6">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-sm">●</span>
            <span className="text-sm text-gray-400">{companyAgents.length} Active Agents</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-sm">●</span>
            <span className="text-sm text-gray-400">{Object.keys(categories).length} Categories</span>
          </div>
          {company.domain && (
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-sm">●</span>
              <span className="text-sm text-gray-400">{company.domain}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
          <button onClick={() => setActiveTab('agents')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'agents' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            🤖 Agents
          </button>
          <button onClick={() => setActiveTab('team')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'team' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            👥 Team
          </button>
        </div>
      </div>

      {activeTab === 'team' && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <CompanyMembers companyId={company.id} companyName={company.name} themeGradient={theme.gradient} />
        </div>
      )}

      {activeTab === 'agents' && <>
      {/* Agent Grid by Category */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {Object.entries(categories).map(([cat, agents]) => (
          <div key={cat}>
            <h2 className="text-lg font-semibold mb-4">{CATEGORY_LABELS[cat] || cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {agents.map(agent => (
                <Link key={agent.slug} href={agent.liveRoute}
                  className="group bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all hover:bg-white/[0.02]">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-white group-hover:text-blue-300 transition">{agent.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{agent.description}</p>
                    </div>
                    <span className="text-gray-600 group-hover:text-gray-400 transition">→</span>
                  </div>

                  {/* Features */}
                  {agent.features && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {agent.features.slice(0, 3).map((f: any, i: number) => (
                        <span key={i} className="text-[9px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded">
                          {f.status === 'done' ? '✓' : '○'} {f.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Completion */}
                  {agent.completionPct !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[9px] text-gray-600 mb-1">
                        <span>Ready</span>
                        <span>{agent.completionPct}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${theme.gradient}`}
                          style={{ width: `${agent.completionPct}%` }} />
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {companyAgents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold">No Agents Assigned</h3>
            <p className="text-gray-500 text-sm mt-1">Contact your admin to assign agents to {company.name}</p>
          </div>
        )}
      </div>
      </>}
    </div>
  );
}
