'use client';
import { useState, useEffect } from 'react';
import { useAgents } from '@/lib/hooks/useAgents';
import { getSupabaseBrowser } from '@/lib/supabase-browser';


interface AgentPrice {
  agent_slug: string;
  monthly_price: number;
  description: string | null;
}

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  agent_slugs: string[];
  monthly_price: number;
  is_active: boolean;
}

export default function AdminPricingPage() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
  const [prices, setPrices] = useState<AgentPrice[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'agents' | 'bundles'>('bundles');

  // Agent pricing edit state
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  // Bundle edit state
  const [editingBundle, setEditingBundle] = useState<string | null>(null);
  const [bundleForm, setBundleForm] = useState({ name: '', description: '', agent_slugs: [] as string[], monthly_price: '', is_active: true });
  const [showNewBundle, setShowNewBundle] = useState(false);

  const getAuthToken = async (): Promise<string | null> => {
    const sb = getSupabaseBrowser();
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token || null;
  };

  const loadData = async () => {
    const token = await getAuthToken();
    const headers: any = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const [pricesRes, bundlesRes] = await Promise.all([
      fetch('/api/admin/pricing', { headers }),
      fetch('/api/admin/bundles', { headers }),
    ]);

    if (pricesRes.ok) {
      const d = await pricesRes.json();
      setPrices(d.prices || []);
    }
    if (bundlesRes.ok) {
      const d = await bundlesRes.json();
      setBundles(d.bundles || []);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const getPrice = (slug: string) => {
    const p = prices.find(p => p.agent_slug === slug);
    return p ? p.monthly_price : 0;
  };

  const startEditAgent = (slug: string) => {
    const p = prices.find(p => p.agent_slug === slug);
    setEditingAgent(slug);
    setEditPrice(p ? String(p.monthly_price) : '0');
    setEditDesc(p?.description || '');
    setSaveMsg('');
  };

  const saveAgentPrice = async () => {
    if (!editingAgent) return;
    const token = await getAuthToken();
    if (!token) return;

    const res = await fetch('/api/admin/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ agent_slug: editingAgent, monthly_price: editPrice, description: editDesc }),
    });
    const data = await res.json();
    if (data.success) {
      setSaveMsg('Saved');
      setEditingAgent(null);
      loadData();
    } else {
      setSaveMsg('Error: ' + data.error);
    }
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const startEditBundle = (b: Bundle) => {
    setEditingBundle(b.id);
    setBundleForm({
      name: b.name,
      description: b.description || '',
      agent_slugs: b.agent_slugs || [],
      monthly_price: String(b.monthly_price),
      is_active: b.is_active,
    });
  };

  const startNewBundle = () => {
    setShowNewBundle(true);
    setEditingBundle(null);
    setBundleForm({ name: '', description: '', agent_slugs: [], monthly_price: '', is_active: true });
  };

  const saveBundle = async (existingId?: string) => {
    const token = await getAuthToken();
    if (!token) return;

    const body: any = {
      name: bundleForm.name,
      description: bundleForm.description,
      agent_slugs: bundleForm.agent_slugs,
      monthly_price: bundleForm.monthly_price,
      is_active: bundleForm.is_active,
    };
    if (existingId) body.id = existingId;

    const res = await fetch('/api/admin/bundles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setEditingBundle(null);
      setShowNewBundle(false);
      loadData();
    }
  };

  const deactivateBundle = async (id: string) => {
    const token = await getAuthToken();
    if (!token) return;
    await fetch('/api/admin/bundles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  const toggleBundleAgent = (slug: string) => {
    setBundleForm(f => ({
      ...f,
      agent_slugs: f.agent_slugs.includes(slug)
        ? f.agent_slugs.filter(s => s !== slug)
        : [...f.agent_slugs, slug],
    }));
  };

  const bundleTotal = (slugs: string[]) => {
    return slugs.reduce((sum, slug) => sum + getPrice(slug), 0);
  };

  if (loading) return <div className="p-6 text-[#9CA3AF] text-sm">Loading pricing data...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pricing Manager</h1>
          <p className="text-sm text-[#6B7280] mt-1">Set individual agent prices and manage bundles</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('bundles')}
          className={"px-4 py-2 rounded-lg text-sm font-medium transition " +
            (tab === 'bundles' ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}
        >
          Bundles ({bundles.length})
        </button>
        <button
          onClick={() => setTab('agents')}
          className={"px-4 py-2 rounded-lg text-sm font-medium transition " +
            (tab === 'agents' ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}
        >
          Agent Pricing ({LIVE_AGENTS.length})
        </button>
      </div>

      {saveMsg && (
        <div className={"text-xs px-3 py-2 rounded-lg " + (saveMsg.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600')}>
          {saveMsg}
        </div>
      )}

      {/* Bundles Tab */}
      {tab === 'bundles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={startNewBundle} className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition">
              + New Bundle
            </button>
          </div>

          {/* New bundle form */}
          {showNewBundle && (
            <div className="bg-white border border-blue-500/20 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-blue-600">New Bundle</h3>
              {renderBundleForm(null)}
            </div>
          )}

          {bundles.map(b => (
            <div key={b.id} className={"bg-white border rounded-xl p-5 " + (b.is_active ? 'border-[#E5E7EB]' : 'border-[#E5E7EB] opacity-50')}>
              {editingBundle === b.id ? (
                <div className="space-y-4">
                  {renderBundleForm(b.id)}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">{b.name}</h3>
                      {!b.is_active && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-500/10 text-[#9CA3AF] font-medium">INACTIVE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-bold text-white">${b.monthly_price}</span>
                      <span className="text-xs text-[#9CA3AF]">/mo</span>
                    </div>
                  </div>
                  {b.description && <p className="text-sm text-[#6B7280] mb-3">{b.description}</p>}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(b.agent_slugs || []).map(slug => {
                      const a = LIVE_AGENTS.find(a => a.slug === slug);
                      return a ? (
                        <span key={slug} className="text-[11px] px-2 py-1 bg-white shadow-sm rounded-lg text-[#6B7280] flex items-center gap-1">
                          <span>{a.icon}</span> {a.name}
                          <span className="text-[#6B7280] ml-1">${getPrice(slug)}</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-[#6B7280]">
                      {(b.agent_slugs || []).length} agents • à la carte total: ${bundleTotal(b.agent_slugs || [])}
                      {bundleTotal(b.agent_slugs || []) > b.monthly_price && (
                        <span className="text-emerald-600 ml-2">
                          Save ${bundleTotal(b.agent_slugs || []) - b.monthly_price}/mo
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditBundle(b)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      {b.is_active && (
                        <button onClick={() => deactivateBundle(b.id)} className="text-xs text-[#9CA3AF] hover:text-red-600 transition">Deactivate</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Agent Pricing Tab */}
      {tab === 'agents' && (
        <div className="space-y-2">
          {LIVE_AGENTS.map(agent => (
            <div key={agent.slug} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
              {editingAgent === agent.slug ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{agent.icon}</span>
                    <span className="text-sm font-semibold">{agent.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Monthly Price ($)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-white focus:border-[#2A9D8F] focus:outline-none"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Description</label>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-white focus:border-[#2A9D8F] focus:outline-none"
                        placeholder="Short description..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveAgentPrice} className="text-xs px-4 py-1.5 bg-[#1B2A4A] text-white rounded-lg hover:bg-blue-500 transition font-medium">Save</button>
                    <button onClick={() => setEditingAgent(null)} className="text-xs text-[#9CA3AF] hover:text-[#4B5563] transition">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{agent.icon}</span>
                    <div>
                      <span className="text-sm font-semibold">{agent.name}</span>
                      {prices.find(p => p.agent_slug === agent.slug)?.description && (
                        <span className="text-[10px] text-[#9CA3AF] ml-2">{prices.find(p => p.agent_slug === agent.slug)?.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold">
                      {getPrice(agent.slug) > 0 ? (
                        <span className="text-white">${getPrice(agent.slug)}<span className="text-[#9CA3AF] text-[10px]">/mo</span></span>
                      ) : (
                        <span className="text-[#6B7280]">Not set</span>
                      )}
                    </span>
                    <button onClick={() => startEditAgent(agent.slug)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function renderBundleForm(existingId: string | null) {
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Bundle Name</label>
            <input
              type="text"
              value={bundleForm.name}
              onChange={e => setBundleForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-white focus:border-[#2A9D8F] focus:outline-none"
              placeholder="e.g. Starter Pack"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Monthly Price ($)</label>
            <input
              type="number"
              value={bundleForm.monthly_price}
              onChange={e => setBundleForm(f => ({ ...f, monthly_price: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-white focus:border-[#2A9D8F] focus:outline-none"
              min="0"
              step="1"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Description</label>
          <input
            type="text"
            value={bundleForm.description}
            onChange={e => setBundleForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-white focus:border-[#2A9D8F] focus:outline-none"
            placeholder="Brief description of the bundle..."
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] text-[#9CA3AF] uppercase">Included Agents</label>
            <div className="flex gap-2">
              <button onClick={() => setBundleForm(f => ({ ...f, agent_slugs: LIVE_AGENTS.map(a => a.slug) }))} className="text-[10px] text-blue-600 hover:underline">All</button>
              <button onClick={() => setBundleForm(f => ({ ...f, agent_slugs: [] }))} className="text-[10px] text-[#9CA3AF] hover:underline">Clear</button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {LIVE_AGENTS.map(a => (
              <button key={a.slug}
                onClick={() => toggleBundleAgent(a.slug)}
                className={"flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition border " +
                  (bundleForm.agent_slugs.includes(a.slug)
                    ? 'bg-blue-50 border-blue-500/30 text-blue-600'
                    : 'bg-white shadow-sm border-[#E5E7EB] text-[#6B7280] hover:border-[#E5E7EB]')}
              >
                <span>{a.icon}</span>
                <span className="truncate">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-[#6B7280] cursor-pointer">
            <input
              type="checkbox"
              checked={bundleForm.is_active}
              onChange={e => setBundleForm(f => ({ ...f, is_active: e.target.checked }))}
              className="rounded"
            />
            Active
          </label>
          <span className="text-[10px] text-[#6B7280]">
            {bundleForm.agent_slugs.length} agents selected
            {bundleForm.agent_slugs.length > 0 && ` • à la carte total: $${bundleTotal(bundleForm.agent_slugs)}`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => saveBundle(existingId || undefined)}
            disabled={!bundleForm.name || !bundleForm.monthly_price}
            className="text-xs px-4 py-1.5 bg-[#1B2A4A] text-white rounded-lg hover:bg-blue-500 transition font-medium disabled:opacity-50"
          >
            {existingId ? 'Save Changes' : 'Create Bundle'}
          </button>
          <button
            onClick={() => { setEditingBundle(null); setShowNewBundle(false); }}
            className="text-xs text-[#9CA3AF] hover:text-[#4B5563] transition"
          >
            Cancel
          </button>
        </div>
      </>
    );
  }
}
