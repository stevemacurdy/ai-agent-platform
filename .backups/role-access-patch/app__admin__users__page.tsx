'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type UserRole = 'super_admin' | 'admin' | 'employee' | 'beta_tester' | 'org_lead'

interface ManagedUser {
  id: string; email: string; name: string; role: UserRole; agents: string[]
  status: 'active' | 'invited' | 'suspended'; createdAt: string; lastLogin?: string
  companyId?: string; companyName?: string; generatedPassword?: string
}

const ALL_AGENTS = [
  { id: 'cfo', name: 'CFO Agent', icon: '📈' }, { id: 'sales', name: 'Sales Agent', icon: '💼' },
  { id: 'finops', name: 'FinOps Agent', icon: '💰' }, { id: 'payables', name: 'Payables Agent', icon: '🧾' },
  { id: 'collections', name: 'Collections Agent', icon: '📬' }, { id: 'hr', name: 'HR Agent', icon: '👥' },
  { id: 'operations', name: 'Operations Agent', icon: '⚙️' }, { id: 'legal', name: 'Legal Agent', icon: '⚖️' },
  { id: 'marketing', name: 'Marketing Agent', icon: '📣' }, { id: 'wms', name: 'WMS Agent', icon: '🏭' },
  { id: 'compliance', name: 'Compliance Agent', icon: '🛡️' },
]

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; description: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-rose-400', bg: 'bg-rose-500/10', description: 'Full platform access' },
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10', description: 'Manage users, all agents' },
  employee: { label: 'Employee', color: 'text-blue-400', bg: 'bg-blue-500/10', description: 'Live agents, company data' },
  org_lead: { label: 'Organization Lead', color: 'text-amber-400', bg: 'bg-amber-500/10', description: 'Custom AI suite, paid' },
  beta_tester: { label: 'Beta Tester', color: 'text-emerald-400', bg: 'bg-emerald-500/10', description: 'Free trial access' },
}
const ROLES_ORDER: UserRole[] = ['super_admin', 'admin', 'employee', 'org_lead', 'beta_tester']

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')
  const [showAgentPicker, setShowAgentPicker] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [invEmail, setInvEmail] = useState(''); const [invName, setInvName] = useState('')
  const [invRole, setInvRole] = useState<UserRole>('beta_tester'); const [invAgents, setInvAgents] = useState<string[]>([])
  const [invCompany, setInvCompany] = useState(''); const [invCompanyName, setInvCompanyName] = useState('')
  const [showCredentials, setShowCredentials] = useState<{ email: string; password: string; inviteCode: string } | null>(null)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500) }

  useEffect(() => { fetchUsers() }, [])
  const fetchUsers = async () => { try { const r = await fetch('/api/admin/users'); const d = await r.json(); if (d.users) setUsers(d.users) } catch {} setLoading(false) }

  const filtered = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false
    if (search && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    total: users.length, admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    employees: users.filter(u => u.role === 'employee').length,
    orgLeads: users.filter(u => u.role === 'org_lead').length,
    betaTesters: users.filter(u => u.role === 'beta_tester').length,
  }

  const updateRole = async (userId: string, newRole: UserRole) => {
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_role', userId, role: newRole }) })
    fetchUsers(); show('Role updated')
  }
  const updateAgents = async (userId: string, agents: string[]) => {
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_agents', userId, agents }) })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, agents } : u))
  }
  const toggleAgent = (userId: string, agentId: string) => {
    const user = users.find(u => u.id === userId); if (!user) return
    const next = user.agents.includes(agentId) ? user.agents.filter(a => a !== agentId) : [...user.agents, agentId]
    updateAgents(userId, next)
  }
  const suspendUser = async (userId: string) => {
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'suspend', userId }) })
    fetchUsers(); show('User status updated')
  }
  const removeUser = async (userId: string) => {
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'remove', userId }) })
    fetchUsers(); show('User removed')
  }
  const resetPassword = async (userId: string) => {
    const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset_password', userId }) })
    const d = await r.json()
    if (d.newPassword) { const user = users.find(u => u.id === userId); setShowCredentials({ email: user?.email || '', password: d.newPassword, inviteCode: '' }); show('Password reset') }
  }
  const inviteUser = async () => {
    if (!invEmail.trim()) { show('Email is required'); return }
    const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'invite', email: invEmail.trim(), name: invName.trim() || invEmail.split('@')[0], role: invRole, agents: (invRole === 'admin' || invRole === 'super_admin') ? ALL_AGENTS.map(a => a.id) : invAgents, companyId: invCompany.trim() || undefined, companyName: invCompanyName.trim() || undefined }) })
    const d = await r.json()
    if (d.error) { show(d.error); return }
    if (d.credentials) setShowCredentials(d.credentials)
    setInvEmail(''); setInvName(''); setInvRole('beta_tester'); setInvAgents([]); setInvCompany(''); setInvCompanyName(''); setShowInvite(false)
    fetchUsers(); show('User invited')
  }
  const copyCredentials = () => {
    if (!showCredentials) return
    navigator.clipboard.writeText("WoulfAI Login Credentials\n\nEmail: " + showCredentials.email + "\nPassword: " + showCredentials.password + "\nLogin: " + (typeof window !== 'undefined' ? window.location.origin : '') + "/login")
    show('Credentials copied!')
  }

  const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"
  const selectCls = "px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500/30 focus:outline-none"

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-500 text-sm">Loading users...</div>

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div className="flex justify-between items-start">
        <div><h1 className="text-xl font-bold">Users & Roles</h1><p className="text-sm text-gray-500 mt-1">Manage access, roles, and agent permissions</p></div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/portal')} className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-sm hover:bg-white/10">← Portal</button>
          <button onClick={() => setShowInvite(true)} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500">+ Invite User</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Total</div><div className="text-xl font-mono font-bold mt-1">{stats.total}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Admins</div><div className="text-xl font-mono font-bold text-purple-400 mt-1">{stats.admins}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Employees</div><div className="text-xl font-mono font-bold text-blue-400 mt-1">{stats.employees}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Org Leads</div><div className="text-xl font-mono font-bold text-amber-400 mt-1">{stats.orgLeads}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Beta Testers</div><div className="text-xl font-mono font-bold text-emerald-400 mt-1">{stats.betaTesters}</div></div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className={inputCls + " max-w-sm"} />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value as any)} className={selectCls}>
          <option value="all">All Roles</option>
          {ROLES_ORDER.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
        </select>
      </div>

      {/* User Table */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
            <th className="text-left p-4">User</th><th className="text-left p-4">Role</th><th className="text-left p-4">Company</th>
            <th className="text-left p-4">Agents</th><th className="text-left p-4">Status</th><th className="text-right p-4">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(user => {
              const roleCfg = ROLE_CONFIG[user.role]
              return (
                <tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                  <td className="p-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-blue-500/10 rounded-full flex items-center justify-center text-sm">{user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><div><div className="text-sm font-semibold">{user.name}</div><div className="text-xs text-gray-500">{user.email}</div></div></div></td>
                  <td className="p-4">
                    <select value={user.role} onChange={e => updateRole(user.id, e.target.value as UserRole)} disabled={user.id === 'u1'}
                      className={"text-xs font-semibold px-2 py-1.5 rounded-lg border-0 focus:outline-none cursor-pointer " + roleCfg.bg + " " + roleCfg.color + (user.id === 'u1' ? ' opacity-60 cursor-not-allowed' : '')}>
                      {ROLES_ORDER.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-xs text-gray-500">{user.companyName || '—'}</td>
                  <td className="p-4">
                    {(user.role === 'super_admin' || user.role === 'admin') ? <span className="text-[10px] text-gray-500">All agents</span> : (
                      <div className="relative">
                        <button onClick={() => setShowAgentPicker(showAgentPicker === user.id ? null : user.id)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                          <span className="flex gap-0.5">{user.agents.length > 0 ? user.agents.slice(0, 3).map(aId => { const a = ALL_AGENTS.find(x => x.id === aId); return <span key={aId} title={a?.name}>{a?.icon}</span> }) : <span className="text-gray-600">None</span>}{user.agents.length > 3 && <span className="text-[10px] text-gray-500">+{user.agents.length - 3}</span>}</span>
                          <span className="text-[10px] text-blue-400 ml-1">Edit</span>
                        </button>
                        {showAgentPicker === user.id && (
                          <div className="absolute top-8 left-0 z-50 bg-[#0D1117] border border-white/10 rounded-xl p-3 w-64 shadow-2xl">
                            <div className="text-[9px] text-gray-500 uppercase mb-2">Agents for {user.name.split(' ')[0]}</div>
                            <div className="space-y-1 max-h-64 overflow-y-auto">{ALL_AGENTS.map(agent => { const checked = user.agents.includes(agent.id); return (<label key={agent.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer"><input type="checkbox" checked={checked} onChange={() => toggleAgent(user.id, agent.id)} className="rounded border-gray-600 bg-white/5 text-blue-500" /><span>{agent.icon}</span><span className={"text-xs " + (checked ? 'text-white' : 'text-gray-500')}>{agent.name}</span></label>)})}</div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
                              <button onClick={() => updateAgents(user.id, ALL_AGENTS.map(a => a.id))} className="text-[10px] text-blue-400">All</button>
                              <button onClick={() => updateAgents(user.id, [])} className="text-[10px] text-gray-500">Clear</button>
                              <button onClick={() => { setShowAgentPicker(null); show('Updated') }} className="text-[10px] text-emerald-400 font-semibold">Done</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4"><span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : user.status === 'invited' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400')}>{user.status}</span></td>
                  <td className="p-4 text-right">{user.id !== 'u1' && (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => resetPassword(user.id)} className="px-2 py-1 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Reset PW</button>
                      <button onClick={() => suspendUser(user.id)} className={"px-2 py-1 rounded text-[10px] font-medium " + (user.status === 'suspended' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{user.status === 'suspended' ? 'Activate' : 'Suspend'}</button>
                      <button onClick={() => { if (confirm('Remove ' + user.name + '?')) removeUser(user.id) }} className="px-2 py-1 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400">Remove</button>
                    </div>
                  )}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center text-gray-600 py-8 text-sm">No users match</div>}
      </div>

      {/* INVITE MODAL */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-[#0D1117] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h2 className="text-lg font-bold">Invite User</h2><button onClick={() => setShowInvite(false)} className="text-gray-500 hover:text-white text-lg">✕</button></div>
            <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Email *</label><input value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="user@company.com" className={inputCls} autoFocus /></div>
            <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Full Name</label><input value={invName} onChange={e => setInvName(e.target.value)} placeholder="John Smith" className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Company ID</label><input value={invCompany} onChange={e => setInvCompany(e.target.value)} placeholder="acme" className={inputCls} /></div>
              <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Company Name</label><input value={invCompanyName} onChange={e => setInvCompanyName(e.target.value)} placeholder="Acme Corp" className={inputCls} /></div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase block mb-1">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {(['beta_tester', 'org_lead', 'employee', 'admin'] as UserRole[]).map(r => {
                  const cfg = ROLE_CONFIG[r]; return (
                    <button key={r} onClick={() => setInvRole(r)} className={"p-3 rounded-xl border text-left transition-all " + (invRole === r ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5 hover:border-white/10')}>
                      <span className={"text-xs font-semibold " + cfg.color}>{cfg.label}</span>
                      <div className="text-[10px] text-gray-500 mt-0.5">{cfg.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>
            {(invRole === 'employee' || invRole === 'beta_tester' || invRole === 'org_lead') && (
              <div>
                <label className="text-[10px] text-gray-500 uppercase block mb-1">Agent Access</label>
                <div className="grid grid-cols-3 gap-1.5">{ALL_AGENTS.map(agent => { const checked = invAgents.includes(agent.id); return (<label key={agent.id} className={"flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all " + (checked ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/[0.02] border border-white/5')}><input type="checkbox" checked={checked} onChange={() => setInvAgents(prev => checked ? prev.filter(a => a !== agent.id) : [...prev, agent.id])} className="rounded border-gray-600 bg-white/5 text-blue-500" /><span className="text-sm">{agent.icon}</span><span className={"text-[10px] " + (checked ? 'text-white' : 'text-gray-500')}>{agent.name.replace(' Agent', '')}</span></label>)})}</div>
                <div className="flex gap-2 mt-2"><button onClick={() => setInvAgents(ALL_AGENTS.map(a => a.id))} className="text-[10px] text-blue-400">Select All</button><button onClick={() => setInvAgents([])} className="text-[10px] text-gray-500">Clear</button></div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={inviteUser} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500">Generate Credentials</button>
              <button onClick={() => setShowInvite(false)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS MODAL */}
      {showCredentials && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowCredentials(null)}>
          <div className="bg-[#0D1117] border border-emerald-500/20 rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="text-center"><div className="text-3xl mb-2">🔑</div><h2 className="text-lg font-bold">Credentials Generated</h2><p className="text-xs text-gray-500 mt-1">Share these securely with the user</p></div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono space-y-3">
              <div><div className="text-[9px] text-gray-500 uppercase">Email</div><div className="text-sm text-white mt-0.5">{showCredentials.email}</div></div>
              <div><div className="text-[9px] text-gray-500 uppercase">Password</div><div className="text-sm text-emerald-400 font-bold mt-0.5">{showCredentials.password}</div></div>
              <div><div className="text-[9px] text-gray-500 uppercase">Login URL</div><div className="text-sm text-blue-400 mt-0.5">{typeof window !== 'undefined' ? window.location.origin : ''}/login</div></div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3"><p className="text-[10px] text-amber-400">This password is shown once. Copy it now.</p></div>
            <div className="flex gap-3">
              <button onClick={copyCredentials} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500">📋 Copy Credentials</button>
              <button onClick={() => setShowCredentials(null)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
