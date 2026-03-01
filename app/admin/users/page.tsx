'use client';
import { useState, useEffect } from 'react';
import { useAgents } from '@/lib/hooks/useAgents';
import { getSupabaseBrowser } from '@/lib/supabase-browser';


const ROLES = [
  { value: 'super_admin', label: 'Super Admin', color: 'bg-rose-500/10 text-rose-400' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-50 text-purple-600' },
  { value: 'employee', label: 'Employee', color: 'bg-blue-50 text-blue-600' },
  { value: 'org_lead', label: 'Org Lead', color: 'bg-amber-50 text-amber-600' },
  { value: 'beta_tester', label: 'Beta Tester', color: 'bg-emerald-50 text-emerald-600' },
];

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  approved_agents: string[];
  must_reset_password?: boolean;
}

export default function AdminUsersPage() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<'password' | 'invite'>('password');
  const [form, setForm] = useState({ email: '', full_name: '', role: 'employee', agent_slugs: [] as string[] });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Editing state
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editAgents, setEditAgents] = useState<string[]>([]);
  const [editRole, setEditRole] = useState('');

  // Reset password state
  const [resetResult, setResetResult] = useState<{ userId: string; password?: string; error?: string } | null>(null);
  const [resettingUser, setResettingUser] = useState<string | null>(null);

  // Status messages
  const [statusMsg, setStatusMsg] = useState<{ userId: string; msg: string; type: 'success' | 'error' } | null>(null);

  const loadUsers = async () => {
    const token = await getAuthToken();
    if (!token) return;
    fetch('/api/admin/users?t=' + Date.now(), { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
  };

  useEffect(() => { loadUsers(); }, []);

  const reload = () => { setTimeout(loadUsers, 500); };

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
        reload();
      }
    } catch (err: any) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const getAuthToken = async (): Promise<string | null> => {
    const sb = getSupabaseBrowser();
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token || null;
  };

  const handleSaveEdits = async (userId: string) => {
    const token = await getAuthToken();
    if (!token) return;

    // Update agents
    await fetch('/api/admin/manage-agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ user_id: userId, agent_slugs: editAgents }),
    });

    // Update role if changed
    const user = users.find(u => u.id === userId);
    if (user && editRole !== user.role) {
      const res = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ userId, role: editRole }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ userId, msg: data.error || 'Failed to update role', type: 'error' });
        return;
      }
    }

    setEditingUser(null);
    setStatusMsg({ userId, msg: 'Updated successfully', type: 'success' });
    reload();
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleResetPassword = async (userId: string) => {
    setResettingUser(userId);
    setResetResult(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        setResetResult({ userId, error: 'Not authenticated' });
        setResettingUser(null);
        return;
      }

      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setResetResult({ userId, password: data.temp_password });
        reload();
      } else {
        setResetResult({ userId, error: data.error });
      }
    } catch (err: any) {
      setResetResult({ userId, error: err.message });
    }
    setResettingUser(null);
  };

  const startEditing = (u: UserRecord) => {
    setEditingUser(u.id);
    setEditAgents(u.approved_agents || []);
    setEditRole(u.role);
    setResetResult(null);
    setStatusMsg(null);
  };

  const getRoleStyle = (role: string) => {
    const r = ROLES.find(x => x.value === role);
    return r ? r.color : 'bg-gray-500/10 text-[#6B7280]';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-[#6B7280] mt-1">{users.length} users — assign roles, agents, and manage access</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition"
        >
          {showCreate ? 'Close' : '+ Add User'}
        </button>
      </div>

      {/* Create User Panel */}
      {showCreate && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setCreateMode('password')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (createMode === 'password' ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}
            >
              Temp Password
            </button>
            <button
              onClick={() => setCreateMode('invite')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (createMode === 'invite' ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}
            >
              Email Invite
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-white focus:border-[#2A9D8F] focus:outline-none" placeholder="employee@company.com" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-white focus:border-[#2A9D8F] focus:outline-none" placeholder="Jane Smith" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6B7280] mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-white focus:border-[#2A9D8F] focus:outline-none"
              style={{ colorScheme: 'dark' }}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="org_lead">Organization Lead</option>
              <option value="beta_tester">Beta Tester</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-[#6B7280]">Assign Agents</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] text-blue-600 hover:underline">Select All</button>
                <button onClick={selectNone} className="text-[10px] text-[#9CA3AF] hover:underline">Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LIVE_AGENTS.map(agent => (
                <button key={agent.slug} onClick={() => toggleAgent(agent.slug)}
                  className={"flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition border " +
                    (form.agent_slugs.includes(agent.slug)
                      ? 'bg-blue-50 border-blue-500/30 text-blue-600'
                      : 'bg-white shadow-sm border-[#E5E7EB] text-[#9CA3AF] hover:border-[#E5E7EB]')}>
                  <span>{agent.icon}</span>
                  <span className="truncate">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleCreate} disabled={loading || !form.email}
            className="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition">
            {loading ? 'Creating...' : createMode === 'password' ? 'Create with Temp Password' : 'Send Invite Email'}
          </button>

          {result && (
            <div className={"px-4 py-3 rounded-lg text-sm " + (result.success ? 'bg-emerald-50 border border-emerald-500/20 text-emerald-600' : 'bg-red-50 border border-red-500/20 text-red-600')}>
              {result.success ? (
                <div>
                  <div className="font-medium">{result.message}</div>
                  {result.temp_password && (
                    <div className="mt-2 bg-black/30 rounded px-3 py-2 font-mono">
                      Temp Password: <span className="text-white font-bold">{result.temp_password}</span>
                      <p className="text-[10px] text-[#9CA3AF] mt-1">Share this with the user.</p>
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
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            {/* User header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-bold text-[#6B7280]">
                  {(u.full_name || u.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{u.full_name || 'No Name'}</span>
                    {u.must_reset_password && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">TEMP PW</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#9CA3AF]">{u.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingUser !== u.id && (
                  <span className={"text-[10px] px-2 py-0.5 rounded font-medium " + getRoleStyle(u.role)}>
                    {u.role?.replace(/_/g, ' ')}
                  </span>
                )}
                {editingUser === u.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdits(u.id)} className="text-xs px-4 py-1.5 bg-[#1B2A4A] text-white rounded-lg hover:bg-blue-500 transition font-medium">Save</button>
                    <button onClick={() => setEditingUser(null)} className="text-xs px-3 py-1.5 text-[#9CA3AF] hover:text-[#4B5563] transition">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => startEditing(u)} className="text-xs px-3 py-1.5 bg-white shadow-sm text-blue-600 rounded-lg hover:bg-gray-100 transition">Edit</button>
                    <button
                      onClick={() => handleResetPassword(u.id)}
                      disabled={resettingUser === u.id}
                      className="text-xs px-3 py-1.5 bg-white shadow-sm text-[#9CA3AF] rounded-lg hover:bg-gray-100 hover:text-amber-600 transition disabled:opacity-50"
                    >
                      {resettingUser === u.id ? '...' : 'Reset PW'}
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Permanently delete " + u.email + "?")) return;
                        const res = await fetch("/api/admin/delete-user", {
                          method: "POST",
                          headers: {"Content-Type":"application/json"},
                          body: JSON.stringify({userId: u.id})
                        });
                        const d = await res.json();
                        if (d.success) reload(); else alert(d.error || "Delete failed");
                      }}
                      className="text-xs px-3 py-1.5 bg-white shadow-sm text-[#9CA3AF] rounded-lg hover:bg-red-50 hover:text-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Edit panel */}
            {editingUser === u.id && (
              <div className="border-t border-[#E5E7EB] pt-4 mt-3 space-y-4">
                {/* Role selector - button group */}
                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider block mb-2">Role</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setEditRole(r.value)}
                        className={"px-3 py-1.5 rounded-lg text-xs font-medium transition border " +
                          (editRole === r.value
                            ? r.color + ' border-current'
                            : 'bg-white shadow-sm border-[#E5E7EB] text-[#9CA3AF] hover:border-[#E5E7EB] hover:text-[#4B5563]')}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent selector */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Agent Access</label>
                    <div className="flex gap-2">
                      <button onClick={() => setEditAgents(LIVE_AGENTS.map(a => a.slug))} className="text-[10px] text-blue-600 hover:underline">Select All</button>
                      <button onClick={() => setEditAgents([])} className="text-[10px] text-[#9CA3AF] hover:underline">Clear</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {LIVE_AGENTS.map(a => (
                      <button key={a.slug}
                        onClick={() => setEditAgents(prev =>
                          prev.includes(a.slug) ? prev.filter(s => s !== a.slug) : [...prev, a.slug]
                        )}
                        className={"flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition border " +
                          (editAgents.includes(a.slug)
                            ? 'bg-blue-50 border-blue-500/30 text-blue-600'
                            : 'bg-white shadow-sm border-[#E5E7EB] text-[#6B7280] hover:border-[#E5E7EB] hover:text-[#6B7280]')}
                        title={a.name}
                      >
                        <span>{a.icon}</span>
                        <span className="truncate">{a.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Non-edit: show agents */}
            {editingUser !== u.id && (
              <div className="flex gap-1 items-center">
                {(u.approved_agents || []).slice(0, 8).map(slug => {
                  const a = LIVE_AGENTS.find(a => a.slug === slug);
                  return a ? <span key={slug} title={a.name} className="text-sm">{a.icon}</span> : null;
                })}
                {(u.approved_agents || []).length > 8 && (
                  <span className="text-[10px] text-[#9CA3AF] ml-1">+{u.approved_agents.length - 8}</span>
                )}
                {(u.approved_agents || []).length === 0 && (u.role === 'super_admin' || u.role === 'admin') && (
                  <span className="text-[10px] text-purple-600 italic">all access</span>
                )}
                {(u.approved_agents || []).length === 0 && u.role !== 'super_admin' && u.role !== 'admin' && (
                  <span className="text-[10px] text-[#6B7280] italic">no employees assigned</span>
                )}
              </div>
            )}

            {/* Status message */}
            {statusMsg && statusMsg.userId === u.id && (
              <div className={"mt-3 text-xs px-3 py-2 rounded-lg " + (statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
                {statusMsg.msg}
              </div>
            )}

            {/* Reset password result */}
            {resetResult && resetResult.userId === u.id && (
              <div className={"mt-3 px-4 py-3 rounded-lg text-xs " +
                (resetResult.password ? 'bg-emerald-50 border border-emerald-500/20' : 'bg-red-50 border border-red-500/20')}>
                {resetResult.password ? (
                  <div>
                    <div className="text-emerald-600 font-medium">New temp password:</div>
                    <div className="font-mono text-white text-sm mt-1 select-all">{resetResult.password}</div>
                    <div className="text-[#9CA3AF] mt-1">Share this with the user.</div>
                  </div>
                ) : (
                  <div className="text-red-600">{resetResult.error}</div>
                )}
              </div>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-8 text-center text-sm text-[#6B7280]">No users found</div>
        )}
      </div>
    </div>
  );
}
