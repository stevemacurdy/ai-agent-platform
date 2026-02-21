'use client';
import { useState, useEffect } from 'react';
import { AGENTS } from '@/lib/agents/agent-registry';
import Link from 'next/link';

const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  approved_agents: string[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<'password' | 'invite'>('password');
  const [form, setForm] = useState({ email: '', full_name: '', role: 'employee', agent_slugs: [] as string[] });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editAgents, setEditAgents] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
  }, [result]);

  const toggleAgent = (slug: string) => {
    setForm(f => ({
      ...f,
      agent_slugs: f.agent_slugs.includes(slug)
        ? f.agent_slugs.filter(s => s !== slug)
        : [...f.agent_slugs, slug],
    }));
  };

  const selectAll = () => setForm(f => ({ ...f, agent_slugs: LIVE_AGENTS.map(a => a.slug) }));
  const selectNone = () => setForm(f => ({ ...f, agent_slugs: [] }));

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);
    const endpoint = createMode === 'password' ? '/api/admin/create-user' : '/api/admin/invite-user';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setForm({ email: '', full_name: '', role: 'employee', agent_slugs: [] });
      }
    } catch (err: any) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const handleUpdateAgents = async (userId: string) => {
    await fetch('/api/admin/manage-agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, agent_slugs: editAgents }),
    });
    setEditingUser(null);
    setResult({ success: true, message: 'Agent access updated' });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-400 mt-1">Create users, assign agents, manage access</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition"
        >
          {showCreate ? 'Close' : '+ Add User'}
        </button>
      </div>

      {/* Create User Panel */}
      {showCreate && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 space-y-5">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setCreateMode('password')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (createMode === 'password' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
            >
              Temp Password
            </button>
            <button
              onClick={() => setCreateMode('invite')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (createMode === 'invite' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
            >
              Email Invite
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                placeholder="employee@company.com"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                placeholder="Jane Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="org_lead">Organization Lead</option>
              <option value="beta_tester">Beta Tester</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-400">Assign Agents</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] text-blue-400 hover:underline">Select All</button>
                <button onClick={selectNone} className="text-[10px] text-gray-500 hover:underline">Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LIVE_AGENTS.map(agent => (
                <button
                  key={agent.slug}
                  onClick={() => toggleAgent(agent.slug)}
                  className={"flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition border " +
                    (form.agent_slugs.includes(agent.slug)
                      ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10')}
                >
                  <span>{agent.icon}</span>
                  <span className="truncate">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !form.email}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
          >
            {loading ? 'Creating...' : createMode === 'password' ? 'Create with Temp Password' : 'Send Invite Email'}
          </button>

          {result && (
            <div className={"px-4 py-3 rounded-lg text-sm " + (result.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400')}>
              {result.success ? (
                <div>
                  <div className="font-medium">{result.message}</div>
                  {result.temp_password && (
                    <div className="mt-2 bg-black/30 rounded px-3 py-2 font-mono">
                      Temp Password: <span className="text-white font-bold">{result.temp_password}</span>
                      <p className="text-[10px] text-gray-500 mt-1">Share this with the employee. They will be prompted to change it on first login.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>{result.error}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User List */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">User</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Agents</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="text-sm text-white">{u.full_name || 'No Name'}</div>
                  <div className="text-[10px] text-gray-500">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={"text-[10px] px-2 py-0.5 rounded font-medium " +
                    (u.role === 'super_admin' || u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400')
                  }>{u.role?.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3">
                  {editingUser === u.id ? (
                    <div className="flex flex-wrap gap-1">
                      {LIVE_AGENTS.map(a => (
                        <button
                          key={a.slug}
                          onClick={() => setEditAgents(prev =>
                            prev.includes(a.slug) ? prev.filter(s => s !== a.slug) : [...prev, a.slug]
                          )}
                          className={"text-[10px] px-1.5 py-0.5 rounded " +
                            (editAgents.includes(a.slug) ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 text-gray-600')}
                        >{a.icon}</button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      {(u.approved_agents || []).slice(0, 5).map(slug => {
                        const a = LIVE_AGENTS.find(a => a.slug === slug);
                        return a ? <span key={slug} title={a.name} className="text-sm">{a.icon}</span> : null;
                      })}
                      {(u.approved_agents || []).length > 5 && (
                        <span className="text-[10px] text-gray-500">+{u.approved_agents.length - 5}</span>
                      )}
                      {(u.role === 'super_admin' || u.role === 'admin') && (
                        <span className="text-[10px] text-purple-400 italic">all access</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingUser === u.id ? (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleUpdateAgents(u.id)} className="text-xs text-blue-400 hover:underline">Save</button>
                      <button onClick={() => setEditingUser(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingUser(u.id); setEditAgents(u.approved_agents || []); }}
                      className="text-xs text-gray-500 hover:text-blue-400 transition"
                    >Edit Access</button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-600">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
