#!/usr/bin/env node
/**
 * ADMIN USERS & ROLES — Full Management Console
 *
 * Features:
 *   - Add/invite users (email + role)
 *   - Role tiers: Customer (paid), Beta Tester (free), Employee (agent access), Admin
 *   - Employee agent access: multi-select which agents they can use
 *   - Inline editing of any user's role
 *   - Search/filter users
 *   - Bulk actions
 *
 * Run from: ai-agent-platform root
 * Usage: node admin-users.js
 */
const fs = require('fs');
const path = require('path');

function write(rel, content) {
  const fp = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
  console.log('  + ' + rel + ' (' + content.split('\n').length + ' lines)');
}

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════════╗');
console.log('  ║  ADMIN USERS & ROLES — Full Management Console              ║');
console.log('  ╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. ADMIN USERS PAGE
// ============================================================
write('app/admin/users/page.tsx', `'use client'
import { useState } from 'react'

// ============================================================================
// TYPES
// ============================================================================
type UserRole = 'super_admin' | 'admin' | 'employee' | 'beta_tester' | 'customer'

interface ManagedUser {
  id: string
  email: string
  name: string
  role: UserRole
  agents: string[]
  status: 'active' | 'invited' | 'suspended'
  createdAt: string
  lastLogin?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================
const ALL_AGENTS = [
  { id: 'cfo', name: 'CFO Agent', icon: '📈' },
  { id: 'sales', name: 'Sales Agent', icon: '💼' },
  { id: 'finops', name: 'FinOps Agent', icon: '💰' },
  { id: 'payables', name: 'Payables Agent', icon: '🧾' },
  { id: 'collections', name: 'Collections Agent', icon: '📬' },
  { id: 'hr', name: 'HR Agent', icon: '👥' },
  { id: 'operations', name: 'Operations Agent', icon: '⚙️' },
  { id: 'legal', name: 'Legal Agent', icon: '⚖️' },
  { id: 'marketing', name: 'Marketing Agent', icon: '📣' },
  { id: 'wms', name: 'WMS Agent', icon: '🏭' },
  { id: 'compliance', name: 'Compliance Agent', icon: '🛡️' },
]

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; description: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-rose-400', bg: 'bg-rose-500/10', description: 'Full platform access, billing, user management' },
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10', description: 'Manage users, view analytics, all agents' },
  employee: { label: 'Employee', color: 'text-blue-400', bg: 'bg-blue-500/10', description: 'Access to assigned agents only' },
  beta_tester: { label: 'Beta Tester', color: 'text-emerald-400', bg: 'bg-emerald-500/10', description: 'Free access — testing period, no payment required' },
  customer: { label: 'Customer', color: 'text-amber-400', bg: 'bg-amber-500/10', description: 'Paid subscription required for access' },
}

const ROLES_ORDER: UserRole[] = ['super_admin', 'admin', 'employee', 'beta_tester', 'customer']

// ============================================================================
// SEED USERS
// ============================================================================
const SEED_USERS: ManagedUser[] = [
  { id: 'u1', email: 'steve@woulfgroup.com', name: 'Steve Macurdy', role: 'super_admin', agents: ALL_AGENTS.map(a => a.id), status: 'active', createdAt: '2026-01-01', lastLogin: '2026-02-17' },
  { id: 'u2', email: 'marcus@woulfgroup.com', name: 'Marcus Williams', role: 'employee', agents: ['sales', 'cfo'], status: 'active', createdAt: '2026-01-15', lastLogin: '2026-02-16' },
  { id: 'u3', email: 'diana@woulfgroup.com', name: 'Diana Reeves', role: 'employee', agents: ['sales', 'operations', 'wms'], status: 'active', createdAt: '2026-01-15', lastLogin: '2026-02-15' },
  { id: 'u4', email: 'jason@woulfgroup.com', name: 'Jason Park', role: 'employee', agents: ['sales'], status: 'active', createdAt: '2026-02-01', lastLogin: '2026-02-14' },
  { id: 'u5', email: 'elena@woulfgroup.com', name: 'Elena Torres', role: 'employee', agents: ['sales', 'marketing'], status: 'invited', createdAt: '2026-02-10' },
  { id: 'u6', email: 'demo@client1.com', name: 'Sarah Chen', role: 'beta_tester', agents: ['cfo', 'sales', 'finops'], status: 'active', createdAt: '2026-02-05', lastLogin: '2026-02-17' },
  { id: 'u7', email: 'pilot@logistics.co', name: 'Tom Bradley', role: 'beta_tester', agents: ['wms', 'operations'], status: 'active', createdAt: '2026-02-08', lastLogin: '2026-02-16' },
  { id: 'u8', email: 'paid@enterprise.com', name: 'Rachel Kim', role: 'customer', agents: ['cfo', 'finops', 'payables', 'collections'], status: 'active', createdAt: '2026-02-01', lastLogin: '2026-02-17' },
]

// ============================================================================
// COMPONENT
// ============================================================================
export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(SEED_USERS)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [showAgentPicker, setShowAgentPicker] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Invite form
  const [invEmail, setInvEmail] = useState('')
  const [invName, setInvName] = useState('')
  const [invRole, setInvRole] = useState<UserRole>('beta_tester')
  const [invAgents, setInvAgents] = useState<string[]>([])

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500) }

  // Filter
  const filtered = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false
    if (search && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    employees: users.filter(u => u.role === 'employee').length,
    betaTesters: users.filter(u => u.role === 'beta_tester').length,
    customers: users.filter(u => u.role === 'customer').length,
  }

  // Actions
  const updateRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      const agents = (newRole === 'super_admin' || newRole === 'admin')
        ? ALL_AGENTS.map(a => a.id)
        : u.agents
      return { ...u, role: newRole, agents }
    }))
    show('Role updated')
  }

  const updateAgents = (userId: string, agents: string[]) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, agents } : u))
  }

  const toggleAgent = (userId: string, agentId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return
    const has = user.agents.includes(agentId)
    const next = has ? user.agents.filter(a => a !== agentId) : [...user.agents, agentId]
    updateAgents(userId, next)
  }

  const suspendUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u))
    show('User status updated')
  }

  const removeUser = (userId: string) => {
    if (userId === 'u1') { show('Cannot remove super admin'); return }
    setUsers(prev => prev.filter(u => u.id !== userId))
    show('User removed')
  }

  const inviteUser = () => {
    if (!invEmail.trim()) { show('Email is required'); return }
    if (users.find(u => u.email.toLowerCase() === invEmail.toLowerCase())) { show('User already exists'); return }
    const newUser: ManagedUser = {
      id: 'u-' + Date.now(),
      email: invEmail.trim(),
      name: invName.trim() || invEmail.split('@')[0],
      role: invRole,
      agents: (invRole === 'admin' || invRole === 'super_admin') ? ALL_AGENTS.map(a => a.id) : invAgents,
      status: 'invited',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setUsers(prev => [...prev, newUser])
    setInvEmail(''); setInvName(''); setInvRole('beta_tester'); setInvAgents([]); setShowInvite(false)
    show('Invitation sent to ' + newUser.email)
  }

  const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"
  const selectCls = "px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500/30 focus:outline-none"

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold">Users & Roles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage access, roles, and agent permissions for all users</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500">
          + Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Total Users</div>
          <div className="text-xl font-mono font-bold mt-1">{stats.total}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Admins</div>
          <div className="text-xl font-mono font-bold text-purple-400 mt-1">{stats.admins}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Employees</div>
          <div className="text-xl font-mono font-bold text-blue-400 mt-1">{stats.employees}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Beta Testers</div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">{stats.betaTesters}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Customers (Paid)</div>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1">{stats.customers}</div>
        </div>
      </div>

      {/* Role Legend */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          {ROLES_ORDER.map(r => {
            const cfg = ROLE_CONFIG[r]
            return (
              <div key={r} className="flex items-center gap-2">
                <span className={"text-[10px] px-2 py-0.5 rounded font-semibold " + cfg.bg + " " + cfg.color}>{cfg.label}</span>
                <span className="text-[10px] text-gray-600">{cfg.description}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className={inputCls + " max-w-sm"} />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value as any)} className={selectCls}>
          <option value="all">All Roles</option>
          {ROLES_ORDER.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
        </select>
      </div>

      {/* User Table */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Agent Access</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Last Login</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const roleCfg = ROLE_CONFIG[user.role]
              const isExpanded = editingId === user.id
              const isSuperAdmin = user.role === 'super_admin'

              return (
                <tr key={user.id} className={"border-b border-white/[0.03] " + (isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]')}>
                  {/* User info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-500/10 rounded-full flex items-center justify-center text-sm">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role dropdown */}
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={e => updateRole(user.id, e.target.value as UserRole)}
                      disabled={user.id === 'u1'}
                      className={"text-xs font-semibold px-2 py-1.5 rounded-lg border-0 focus:outline-none cursor-pointer " + roleCfg.bg + " " + roleCfg.color + (user.id === 'u1' ? ' opacity-60 cursor-not-allowed' : '')}
                    >
                      {ROLES_ORDER.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                    </select>
                  </td>

                  {/* Agent access */}
                  <td className="p-4">
                    {(user.role === 'super_admin' || user.role === 'admin') ? (
                      <span className="text-[10px] text-gray-500">All agents (admin)</span>
                    ) : (
                      <div className="relative">
                        <button onClick={() => setShowAgentPicker(showAgentPicker === user.id ? null : user.id)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                          <span className="flex gap-0.5">
                            {user.agents.length > 0 ? user.agents.slice(0, 3).map(aId => {
                              const agent = ALL_AGENTS.find(a => a.id === aId)
                              return <span key={aId} title={agent?.name}>{agent?.icon}</span>
                            }) : <span className="text-gray-600">None</span>}
                            {user.agents.length > 3 && <span className="text-[10px] text-gray-500">+{user.agents.length - 3}</span>}
                          </span>
                          <span className="text-[10px] text-blue-400 ml-1">Edit</span>
                        </button>

                        {/* Agent picker dropdown */}
                        {showAgentPicker === user.id && (
                          <div className="absolute top-8 left-0 z-50 bg-[#0D1117] border border-white/10 rounded-xl p-3 w-64 shadow-2xl">
                            <div className="text-[9px] text-gray-500 uppercase mb-2">Select Agents for {user.name.split(' ')[0]}</div>
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                              {ALL_AGENTS.map(agent => {
                                const checked = user.agents.includes(agent.id)
                                return (
                                  <label key={agent.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer">
                                    <input type="checkbox" checked={checked} onChange={() => toggleAgent(user.id, agent.id)}
                                      className="rounded border-gray-600 bg-white/5 text-blue-500 focus:ring-blue-500/20" />
                                    <span>{agent.icon}</span>
                                    <span className={"text-xs " + (checked ? 'text-white' : 'text-gray-500')}>{agent.name}</span>
                                  </label>
                                )
                              })}
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
                              <button onClick={() => updateAgents(user.id, ALL_AGENTS.map(a => a.id))}
                                className="text-[10px] text-blue-400 hover:text-blue-300">Select All</button>
                              <button onClick={() => updateAgents(user.id, [])}
                                className="text-[10px] text-gray-500 hover:text-gray-400">Clear All</button>
                              <button onClick={() => { setShowAgentPicker(null); show('Agent access updated') }}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold">Done ✓</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (
                      user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      user.status === 'invited' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-rose-500/10 text-rose-400'
                    )}>{user.status}</span>
                  </td>

                  {/* Last login */}
                  <td className="p-4 text-xs text-gray-500">{user.lastLogin || '—'}</td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    {user.id !== 'u1' && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => suspendUser(user.id)}
                          className={"px-2 py-1 rounded text-[10px] font-medium " + (user.status === 'suspended' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20')}>
                          {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        <button onClick={() => { if (confirm('Remove ' + user.name + '?')) removeUser(user.id) }}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20">
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-8 text-sm">No users match your search</div>
        )}
      </div>

      {/* INVITE MODAL */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-[#0D1117] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Invite User</h2>
              <button onClick={() => setShowInvite(false)} className="text-gray-500 hover:text-white text-lg">✕</button>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase block mb-1">Email *</label>
              <input value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="user@company.com"
                className={inputCls} autoFocus />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase block mb-1">Full Name</label>
              <input value={invName} onChange={e => setInvName(e.target.value)} placeholder="John Smith"
                className={inputCls} />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase block mb-1">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {(['beta_tester', 'customer', 'employee', 'admin'] as UserRole[]).map(r => {
                  const cfg = ROLE_CONFIG[r]
                  return (
                    <button key={r} onClick={() => setInvRole(r)}
                      className={"p-3 rounded-xl border text-left transition-all " + (invRole === r ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5 hover:border-white/10')}>
                      <span className={"text-xs font-semibold " + cfg.color}>{cfg.label}</span>
                      <div className="text-[10px] text-gray-500 mt-0.5">{cfg.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Agent selection for employee role */}
            {(invRole === 'employee' || invRole === 'beta_tester' || invRole === 'customer') && (
              <div>
                <label className="text-[10px] text-gray-500 uppercase block mb-1">Agent Access</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ALL_AGENTS.map(agent => {
                    const checked = invAgents.includes(agent.id)
                    return (
                      <label key={agent.id} className={"flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all " + (checked ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/[0.02] border border-white/5 hover:bg-white/5')}>
                        <input type="checkbox" checked={checked}
                          onChange={() => setInvAgents(prev => checked ? prev.filter(a => a !== agent.id) : [...prev, agent.id])}
                          className="rounded border-gray-600 bg-white/5 text-blue-500" />
                        <span className="text-sm">{agent.icon}</span>
                        <span className={"text-[10px] " + (checked ? 'text-white' : 'text-gray-500')}>{agent.name.replace(' Agent', '')}</span>
                      </label>
                    )
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setInvAgents(ALL_AGENTS.map(a => a.id))} className="text-[10px] text-blue-400 hover:text-blue-300">Select All</button>
                  <button onClick={() => setInvAgents([])} className="text-[10px] text-gray-500 hover:text-gray-400">Clear</button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={inviteUser}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500">
                Send Invitation
              </button>
              <button onClick={() => setShowInvite(false)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`);

// ============================================================
// 2. API — User Management
// ============================================================
write('app/api/admin/users/route.ts', `import { NextRequest, NextResponse } from 'next/server';

const users: any[] = [
  { id: 'u1', email: 'steve@woulfgroup.com', name: 'Steve Macurdy', role: 'super_admin', agents: ['cfo','sales','finops','payables','collections','hr','operations','legal','marketing','wms','compliance'], status: 'active', createdAt: '2026-01-01' },
];

export async function GET() {
  return NextResponse.json({ users, total: users.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'invite') {
      const { email, name, role, agents } = body;
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
      if (users.find(u => u.email === email)) return NextResponse.json({ error: 'User exists' }, { status: 409 });
      const user = {
        id: 'u-' + Date.now(), email, name: name || email.split('@')[0],
        role: role || 'beta_tester', agents: agents || [],
        status: 'invited', createdAt: new Date().toISOString().slice(0, 10),
      };
      users.push(user);
      return NextResponse.json({ success: true, user });
    }

    if (action === 'update_role') {
      const { userId, role, agents } = body;
      const user = users.find(u => u.id === userId);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      if (role) user.role = role;
      if (agents) user.agents = agents;
      return NextResponse.json({ success: true, user });
    }

    if (action === 'suspend') {
      const { userId } = body;
      const user = users.find(u => u.id === userId);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      user.status = user.status === 'suspended' ? 'active' : 'suspended';
      return NextResponse.json({ success: true, user });
    }

    if (action === 'remove') {
      const { userId } = body;
      const idx = users.findIndex(u => u.id === userId);
      if (idx === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      users.splice(idx, 1);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`);

console.log('');
console.log('  ═══════════════════════════════════════════');
console.log('  Installed: 2 files');
console.log('  ═══════════════════════════════════════════');
console.log('');
console.log('  ADMIN USERS & ROLES:');
console.log('');
console.log('    📋 User table with inline role dropdown');
console.log('    🎯 Role tiers:');
console.log('       Super Admin — Full access, billing, management');
console.log('       Admin       — Manage users, analytics, all agents');
console.log('       Employee    — Assigned agents only (dropdown picker)');
console.log('       Beta Tester — Free access, no payment required');
console.log('       Customer    — Paid subscription required');
console.log('');
console.log('    ✏️  Change any user role via dropdown in table');
console.log('    🤖 Agent picker: checkbox grid per employee');
console.log('    ➕ Invite modal: email, name, role, agent selection');
console.log('    🔍 Search + filter by role');
console.log('    ⏸️  Suspend / Remove users');
console.log('');
console.log('  Route: /admin/users');
console.log('  Restart: Ctrl+C → npm run dev');
console.log('');
