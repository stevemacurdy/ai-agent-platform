'use client';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useState, useEffect } from 'react';
import { useAgents } from '@/lib/hooks/useAgents';
import Link from 'next/link';


interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  domain: string | null;
  agents: string[];
  user_count: number;
  created_at: string;
}

export default function AdminCompaniesPage() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'compare'>('list');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAgents, setEditAgents] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const getAuthToken = async (): Promise<string | null> => {
    const sb = getSupabaseBrowser();
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token || null;
  };

  // Create form
  const [form, setForm] = useState({ name: '', slug: '', domain: '' });

  const loadCompanies = async () => {
    try {
      const token = await getAuthToken();
      if (!token) { setLoading(false); return; }
      const res = await fetch('/api/admin/companies?t=' + Date.now(), { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadCompanies(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    try {
      const cToken = await getAuthToken();
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (cToken || '') },
        body: JSON.stringify({ name: form.name.trim(), slug, domain: form.domain.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Company created!', type: 'success' });
        setShowCreate(false);
        setForm({ name: '', slug: '', domain: '' });
        loadCompanies();
      } else {
        setMsg({ text: data.error || 'Failed to create', type: 'error' });
      }
    } catch {
      setMsg({ text: 'Network error', type: 'error' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const startEditAgents = (c: Company) => {
    setEditingId(c.id);
    setEditAgents(c.agents || []);
  };

  const saveAgents = async () => {
    if (!editingId) return;
    try {
      const pToken = await getAuthToken();
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (pToken || '') },
        body: JSON.stringify({ company_id: editingId, agents: editAgents }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Agents updated!', type: 'success' });
        setEditingId(null);
        loadCompanies();
      }
    } catch {}
    setTimeout(() => setMsg(null), 3000);
  };

  const toggleAgent = (slug: string) => {
    setEditAgents(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🏢</div>
          <div>
            <h1 className="text-2xl font-bold">Company Portals</h1>
            <p className="text-sm text-[#6B7280]">Manage companies, assign agents, and view performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('list')}
            className={'px-3 py-1.5 rounded-lg text-xs font-medium transition ' + (view === 'list' ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}>
            List View
          </button>
          <button onClick={() => setView('compare')}
            className={'px-3 py-1.5 rounded-lg text-xs font-medium transition ' + (view === 'compare' ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}>
            Compare
          </button>
          <button onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 transition">
            + Add Company
          </button>
        </div>
      </div>

      {/* Status message */}
      {msg && (
        <div className={'px-4 py-2 rounded-lg text-sm ' + (msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-500/10 text-rose-400')}>
          {msg.text}
        </div>
      )}

      {/* Create Company Form */}
      {showCreate && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Create New Company</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[10px] text-[#9CA3AF] uppercase mb-1">Company Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm focus:border-[#2A9D8F] focus:outline-none"
                placeholder="Acme Logistics" />
            </div>
            <div>
              <label className="block text-[10px] text-[#9CA3AF] uppercase mb-1">Slug (auto-generated)</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm focus:border-[#2A9D8F] focus:outline-none"
                placeholder="acme-logistics" />
            </div>
            <div>
              <label className="block text-[10px] text-[#9CA3AF] uppercase mb-1">Custom Domain (optional)</label>
              <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm focus:border-[#2A9D8F] focus:outline-none"
                placeholder="portal.acme.com" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-xs font-medium hover:bg-blue-500 transition">
              Create Company
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white shadow-sm text-[#6B7280] rounded-lg text-xs hover:bg-gray-100 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Total Companies</div>
          <div className="text-2xl font-bold mt-1">{companies.length}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Total Users</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{companies.reduce((s, c) => s + c.user_count, 0)}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Agents Deployed</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">{new Set(companies.flatMap(c => c.agents)).size}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Available Agents</div>
          <div className="text-2xl font-bold mt-1 text-purple-600">{LIVE_AGENTS.length}</div>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-[#9CA3AF]">Loading companies...</div>
          ) : companies.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-lg font-semibold mb-2">No Companies Yet</h3>
              <p className="text-sm text-[#6B7280] mb-4">Create your first company portal to get started.</p>
              <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-blue-500 transition">
                + Create Company
              </button>
            </div>
          ) : (
            companies.map(c => (
              <div key={c.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{c.name}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                        <span>/{c.slug}</span>
                        {c.domain && <span className="text-blue-600">{c.domain}</span>}
                        <span>{c.user_count} users</span>
                        <span>{c.agents?.length || 0} agents</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={'/portal?company=' + c.slug}
                      className="px-3 py-1.5 bg-blue-600/10 text-blue-600 rounded-lg text-xs hover:bg-blue-600/20 transition">
                      Open Portal
                    </Link>
                    <button onClick={() => startEditAgents(c)}
                      className="px-3 py-1.5 bg-white shadow-sm text-[#6B7280] rounded-lg text-xs hover:bg-gray-100 transition">
                      {editingId === c.id ? 'Cancel' : 'Manage Employees'}
                    </button>
                  </div>
                </div>

                {/* Agent chips */}
                {editingId !== c.id && (
                  <div className="flex flex-wrap gap-1.5">
                    {(c.agents || []).length === 0 ? (
                      <span className="text-xs text-[#6B7280]">No employees assigned</span>
                    ) : (
                      (c.agents || []).map(slug => {
                        const agent = AGENTS.find(a => a.slug === slug);
                        return agent ? (
                          <span key={slug} className="inline-flex items-center gap-1 px-2 py-1 bg-white shadow-sm rounded-md text-[10px] text-[#6B7280]">
                            <span>{agent.icon}</span> {agent.name}
                          </span>
                        ) : null;
                      })
                    )}
                  </div>
                )}

                {/* Edit agents panel */}
                {editingId === c.id && (
                  <div className="border-t border-[#E5E7EB] pt-4 mt-2">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-[#6B7280]">Select agents for {c.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditAgents(LIVE_AGENTS.map(a => a.slug))} className="text-[10px] text-blue-600 hover:underline">Select All</button>
                        <button onClick={() => setEditAgents([])} className="text-[10px] text-[#9CA3AF] hover:underline">Clear</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-4">
                      {LIVE_AGENTS.map(agent => (
                        <button key={agent.slug} onClick={() => toggleAgent(agent.slug)}
                          className={'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs transition border ' +
                            (editAgents.includes(agent.slug)
                              ? 'bg-blue-600/10 border-blue-500/30 text-blue-600'
                              : 'bg-white shadow-sm border-[#E5E7EB] text-[#9CA3AF] hover:border-[#E5E7EB]')}>
                          <span>{agent.icon}</span>
                          <span className="truncate">{agent.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveAgents} className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-xs font-medium hover:bg-blue-500 transition">
                        Save ({editAgents.length} agents)
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-2 text-xs text-[#9CA3AF] hover:text-[#4B5563] transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Compare View */}
      {view === 'compare' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          {companies.length < 2 ? (
            <div className="p-12 text-center text-[#9CA3AF] text-sm">Add at least 2 companies to compare side by side.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left px-4 py-3 text-[10px] text-[#9CA3AF] uppercase">Metric</th>
                  {companies.map(c => (
                    <th key={c.id} className="text-center px-4 py-3">
                      <div className="font-semibold text-white">{c.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.03]">
                  <td className="px-4 py-3 text-[#6B7280]">Users</td>
                  {companies.map(c => (
                    <td key={c.id} className="px-4 py-3 text-center font-mono">{c.user_count}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="px-4 py-3 text-[#6B7280]">Agents</td>
                  {companies.map(c => (
                    <td key={c.id} className="px-4 py-3 text-center font-mono">{c.agents?.length || 0}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="px-4 py-3 text-[#6B7280]">Custom Domain</td>
                  {companies.map(c => (
                    <td key={c.id} className="px-4 py-3 text-center">
                      {c.domain ? <span className="text-emerald-600 text-xs">{c.domain}</span> : <span className="text-[#6B7280]">—</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="px-4 py-3 text-[#6B7280]">Created</td>
                  {companies.map(c => (
                    <td key={c.id} className="px-4 py-3 text-center text-xs text-[#9CA3AF]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-[#6B7280]">Portal</td>
                  {companies.map(c => (
                    <td key={c.id} className="px-4 py-3 text-center">
                      <Link href={'/portal?company=' + c.slug} className="text-xs text-blue-600 hover:underline">Open →</Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
