const fs = require('fs');
const path = require('path');

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('  + ' + p + ' (' + content.split('\n').length + ' lines)');
}

console.log('WoulfAI Enterprise — Phase 2: Admin IAM UI + CFO Write-Back UI');
console.log('================================================================\n');

// ============================================================================
// 1. ADMIN USERS PAGE — Full IAM Management
// ============================================================================
writeFile('app/admin/users/page.tsx', `'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface UserRecord {
  id: string; email: string; displayName: string; role: string;
  status: string; permissions: Record<string, boolean>; orgId: string | null; createdAt: string;
}
interface OrgRecord {
  id: string; name: string; plan: string; maxSeats: number; usedSeats: number;
}

function getAdminEmail(): string {
  try {
    const s = localStorage.getItem('woulfai_session');
    if (s) return JSON.parse(s)?.user?.email || 'admin';
  } catch {}
  return 'admin';
}

async function api(action: string, data: any = {}) {
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-email': getAdminEmail() },
    body: JSON.stringify({ action, ...data }),
  });
  return res.json();
}

async function fetchAll() {
  const res = await fetch('/api/admin/users', { headers: { 'x-admin-email': getAdminEmail() } });
  return res.json();
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  org_admin: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  employee: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  beta_tester: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  member: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-500/10',
  suspended: 'text-rose-400 bg-rose-500/10',
  invited: 'text-amber-400 bg-amber-500/10',
  deactivated: 'text-gray-500 bg-gray-500/10',
};

const PERM_LABELS: Record<string, string> = {
  sales_agent: 'Sales Agent',
  cfo_agent: 'CFO Agent',
  admin_analytics: 'Analytics',
  agent_creator: 'Agent Creator',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [orgs, setOrgs] = useState<OrgRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editOrg, setEditOrg] = useState<OrgRecord | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Create form state
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('employee')
  const [newOrg, setNewOrg] = useState('')
  const [newPerms, setNewPerms] = useState({ sales_agent: false, cfo_agent: false, admin_analytics: false, agent_creator: false })

  const load = async () => {
    setLoading(true);
    const data = await fetchAll();
    setUsers(data.users || []);
    setOrgs(data.organizations || []);
    setLoading(false);
  };

  useEffect(() => { load() }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleCreate = async () => {
    if (!newEmail || !newName) return;
    const result = await api('create-user', {
      email: newEmail, displayName: newName, role: newRole,
      orgId: newOrg || null, permissions: newPerms,
    });
    if (result.error) { showToast('Error: ' + result.error); return }
    showToast('User created: ' + newName);
    setShowCreate(false); setNewEmail(''); setNewName(''); setNewRole('employee'); setNewOrg(''); setNewPerms({ sales_agent: false, cfo_agent: false, admin_analytics: false, agent_creator: false });
    load();
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    const result = await api('update-user', { userId, updates });
    if (result.error) { showToast('Error: ' + result.error); return }
    showToast('User updated');
    setEditUser(null); load();
  };

  const handleUpdateOrg = async (orgId: string, updates: any) => {
    const result = await api('update-org', { orgId, updates });
    if (result.error) { showToast('Error: ' + result.error); return }
    showToast('Organization updated');
    setEditOrg(null); load();
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Identity & Access Management</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} users across {orgs.length} organizations</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
          + Create User
        </button>
      </div>

      {/* Org Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {orgs.map(org => (
          <div key={org.id} onClick={() => setEditOrg(org)} className="bg-[#0A0E15] border border-white/5 rounded-xl p-3 cursor-pointer hover:border-white/10 transition-all">
            <div className="text-xs font-medium truncate">{org.name}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-500 font-mono">{org.plan}</span>
              <span className="text-[10px] font-mono text-blue-400">{org.usedSeats}/{org.maxSeats} seats</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500/60" style={{ width: Math.min((org.usedSeats / org.maxSeats) * 100, 100) + '%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All', count: users.length },
          { key: 'super_admin', label: 'Admins', count: users.filter(u => u.role === 'super_admin').length },
          { key: 'employee', label: 'Employees', count: users.filter(u => u.role === 'employee').length },
          { key: 'beta_tester', label: 'Beta Testers', count: users.filter(u => u.role === 'beta_tester').length },
          { key: 'member', label: 'Customers', count: users.filter(u => u.role === 'member' || u.role === 'org_admin').length },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' +
              (filter === f.key ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-white bg-white/[0.02] border border-white/5')}>
            {f.label} <span className="opacity-50 ml-1">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Org</th>
                <th className="text-left py-3 px-4">Permissions</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-3 px-4">
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{user.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={'text-[10px] font-mono px-2 py-0.5 rounded-full border ' + (ROLE_COLORS[user.role] || ROLE_COLORS.member)}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{orgs.find(o => o.id === user.orgId)?.name || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(user.permissions || {}).filter(([_, v]) => v).map(([k]) => (
                        <span key={k} className="text-[9px] font-mono bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{PERM_LABELS[k] || k}</span>
                      ))}
                      {Object.values(user.permissions || {}).every(v => !v) && <span className="text-[9px] text-gray-600">None</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={'text-[10px] font-mono px-2 py-0.5 rounded ' + (STATUS_COLORS[user.status] || '')}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setEditUser(user)} className="text-xs text-blue-400 hover:text-blue-300">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CREATE USER MODAL */}
      {/* ============================================================ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Create User</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white">x</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Email</label>
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="user@company.com"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Display Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Smith"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <option value="employee">Employee</option>
                  <option value="beta_tester">Beta Tester</option>
                  <option value="org_admin">Org Admin (Customer)</option>
                  <option value="member">Member (Customer)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Organization</label>
                <select value={newOrg} onChange={e => setNewOrg(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <option value="">No org</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name} ({o.usedSeats}/{o.maxSeats} seats)</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Granular Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PERM_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer hover:border-white/10">
                      <input type="checkbox" checked={(newPerms as any)[key]}
                        onChange={e => setNewPerms(p => ({ ...p, [key]: e.target.checked }))}
                        className="rounded border-white/20" />
                      <span className="text-xs">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={handleCreate} disabled={!newEmail || !newName}
                className="w-full py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-40">
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT USER MODAL */}
      {/* ============================================================ */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditUser(null)}>
          <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Manage: {editUser.displayName}</h3>
              <button onClick={() => setEditUser(null)} className="text-gray-500 hover:text-white">x</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Display Name</label>
                <input defaultValue={editUser.displayName} id="edit-name"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Role</label>
                <select defaultValue={editUser.role} id="edit-role"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <option value="super_admin">Super Admin</option>
                  <option value="employee">Employee</option>
                  <option value="beta_tester">Beta Tester</option>
                  <option value="org_admin">Org Admin</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Status</label>
                <select defaultValue={editUser.status} id="edit-status"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="invited">Invited</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Granular Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PERM_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer hover:border-white/10">
                      <input type="checkbox" defaultChecked={(editUser.permissions as any)?.[key]}
                        id={'edit-perm-' + key} className="rounded border-white/20" />
                      <span className="text-xs">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => {
                  const perms: any = {};
                  Object.keys(PERM_LABELS).forEach(k => {
                    perms[k] = (document.getElementById('edit-perm-' + k) as HTMLInputElement)?.checked || false;
                  });
                  handleUpdateUser(editUser.id, {
                    displayName: (document.getElementById('edit-name') as HTMLInputElement)?.value,
                    role: (document.getElementById('edit-role') as HTMLSelectElement)?.value,
                    status: (document.getElementById('edit-status') as HTMLSelectElement)?.value,
                    permissions: perms,
                  });
                }} className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  Save Changes
                </button>
                <button onClick={() => handleUpdateUser(editUser.id, { status: 'deactivated' })}
                  className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-sm hover:bg-rose-500/20">
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT ORG MODAL */}
      {/* ============================================================ */}
      {editOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditOrg(null)}>
          <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{editOrg.name}</h3>
              <button onClick={() => setEditOrg(null)} className="text-gray-500 hover:text-white">x</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Plan</label>
                <select defaultValue={editOrg.plan} id="org-plan"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="beta">Beta</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Max Seats</label>
                <input type="number" defaultValue={editOrg.maxSeats} id="org-seats" min="1"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current usage</span>
                  <span className="font-mono text-blue-400">{editOrg.usedSeats} / {editOrg.maxSeats}</span>
                </div>
              </div>
              <button onClick={() => {
                handleUpdateOrg(editOrg.id, {
                  plan: (document.getElementById('org-plan') as HTMLSelectElement)?.value,
                  maxSeats: parseInt((document.getElementById('org-seats') as HTMLInputElement)?.value) || editOrg.maxSeats,
                });
              }} className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                Update Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`);

// ============================================================================
// 2. CFO WRITE-BACK PAGE — Edit Invoices + Contacts
// ============================================================================
writeFile('app/agents/cfo/manage/page.tsx', `'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function getAdminEmail(): string {
  try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' }
}

async function cfoRead(action: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch('/api/agents/cfo?' + qs);
  return res.json();
}

async function cfoWrite(action: string, data: any) {
  const res = await fetch('/api/agents/cfo/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-email': getAdminEmail() },
    body: JSON.stringify({ action, ...data }),
  });
  return res.json();
}

export default function CFOManagePage() {
  const [tab, setTab] = useState<'invoices' | 'contacts' | 'create'>('invoices')
  const [invoices, setInvoices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editInvoice, setEditInvoice] = useState<any>(null)
  const [editContact, setEditContact] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Create invoice form
  const [newPartnerId, setNewPartnerId] = useState('')
  const [newLines, setNewLines] = useState([{ name: '', quantity: 1, price_unit: 0 }])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const loadData = async () => {
    setLoading(true);
    const [invData, custData] = await Promise.all([
      cfoRead('invoices', { status: 'all' }),
      cfoRead('customers'),
    ]);
    setInvoices(invData.invoices || []);
    setCustomers(custData.customers || []);
    setLoading(false);
  };

  useEffect(() => { loadData() }, [])

  const handleUpdateInvoice = async () => {
    if (!editInvoice) return;
    const ref = (document.getElementById('inv-ref') as HTMLInputElement)?.value;
    const due = (document.getElementById('inv-due') as HTMLInputElement)?.value;
    const values: any = {};
    if (ref) values.ref = ref;
    if (due) values.invoice_date_due = due;
    const result = await cfoWrite('update-invoice', { invoiceId: editInvoice.id, values });
    if (result.success) { showToast('Invoice updated in Odoo'); setEditInvoice(null); loadData(); }
    else showToast('Error: ' + (result.error || 'Update failed'));
  };

  const handleUpdateContact = async () => {
    if (!editContact) return;
    const values: any = {};
    ['name', 'email', 'phone'].forEach(f => {
      const el = document.getElementById('contact-' + f) as HTMLInputElement;
      if (el?.value) values[f] = el.value;
    });
    const result = await cfoWrite('update-contact', { partnerId: editContact.id, values });
    if (result.success) { showToast('Contact updated in Odoo'); setEditContact(null); loadData(); }
    else showToast('Error: ' + (result.error || 'Update failed'));
  };

  const handleCreateInvoice = async () => {
    if (!newPartnerId || newLines.every(l => !l.name)) return;
    const validLines = newLines.filter(l => l.name && l.price_unit > 0);
    const result = await cfoWrite('create-invoice', { partnerId: parseInt(newPartnerId), lines: validLines });
    if (result.success) {
      showToast('Invoice #' + result.invoiceId + ' created in Odoo');
      setNewPartnerId(''); setNewLines([{ name: '', quantity: 1, price_unit: 0 }]);
      loadData();
    } else showToast('Error: ' + (result.error || 'Create failed'));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#06080D] text-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#06080D] text-white">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/agents/cfo" className="text-gray-500 hover:text-white text-sm">\\u2190 CFO Dashboard</Link>
            <h1 className="text-xl font-bold">CFO Write-Back Console</h1>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Live Odoo</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'invoices' as const, label: 'Edit Invoices' },
            { key: 'contacts' as const, label: 'Edit Contacts' },
            { key: 'create' as const, label: '+ New Invoice' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' +
                (tab === t.key ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* INVOICES TAB */}
        {tab === 'invoices' && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-3 px-4">Invoice</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-right py-3 px-4">Total</th>
                  <th className="text-right py-3 px-4">Balance</th>
                  <th className="text-left py-3 px-4">Due Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.name || i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-mono text-xs">{inv.name}</td>
                    <td className="py-2.5 px-4 text-gray-400">{inv.partner_id?.[1] || '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono">\${(inv.amount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-4 text-right font-mono">\${(inv.amount_residual || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-4 text-xs text-gray-400">{inv.invoice_date_due || '-'}</td>
                    <td className="py-2.5 px-4">
                      <span className={'text-[10px] font-mono px-2 py-0.5 rounded ' +
                        (inv.payment_state === 'paid' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10')}>
                        {inv.payment_state || 'draft'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button onClick={() => setEditInvoice(inv)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTACTS TAB */}
        {tab === 'contacts' && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.id || i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-medium">{c.name}</td>
                    <td className="py-2.5 px-4 text-gray-400 font-mono text-xs">{c.email || '-'}</td>
                    <td className="py-2.5 px-4 text-gray-400 text-xs">{c.phone || '-'}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button onClick={() => setEditContact(c)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CREATE INVOICE TAB */}
        {tab === 'create' && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 max-w-2xl">
            <h3 className="font-semibold mb-4">Create Invoice in Odoo</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Customer</label>
                <select value={newPartnerId} onChange={e => setNewPartnerId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Invoice Lines</label>
                {newLines.map((line, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={line.name} onChange={e => { const l = [...newLines]; l[i].name = e.target.value; setNewLines(l) }}
                      placeholder="Description" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
                    <input type="number" value={line.quantity} onChange={e => { const l = [...newLines]; l[i].quantity = parseInt(e.target.value) || 1; setNewLines(l) }}
                      className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" placeholder="Qty" />
                    <input type="number" value={line.price_unit || ''} onChange={e => { const l = [...newLines]; l[i].price_unit = parseFloat(e.target.value) || 0; setNewLines(l) }}
                      className="w-28 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" placeholder="Price" />
                    {newLines.length > 1 && (
                      <button onClick={() => setNewLines(newLines.filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-300 px-2">x</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setNewLines([...newLines, { name: '', quantity: 1, price_unit: 0 }])}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-1">+ Add line</button>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex justify-between text-sm">
                <span className="text-gray-400">Total</span>
                <span className="font-mono font-bold">\${newLines.reduce((s, l) => s + (l.quantity * l.price_unit), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <button onClick={handleCreateInvoice} disabled={!newPartnerId || newLines.every(l => !l.name)}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-40">
                Create Invoice in Odoo
              </button>
            </div>
          </div>
        )}

        {/* EDIT INVOICE MODAL */}
        {editInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditInvoice(null)}>
            <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold mb-4">Edit {editInvoice.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">Reference / Notes</label>
                  <input id="inv-ref" defaultValue={editInvoice.ref || ''} placeholder="PO number, notes..."
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">Due Date</label>
                  <input id="inv-due" type="date" defaultValue={editInvoice.invoice_date_due || ''}
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
                </div>
                <button onClick={handleUpdateInvoice}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                  Save to Odoo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT CONTACT MODAL */}
        {editContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditContact(null)}>
            <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold mb-4">Edit Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">Name</label>
                  <input id="contact-name" defaultValue={editContact.name || ''}
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">Email</label>
                  <input id="contact-email" defaultValue={editContact.email || ''}
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">Phone</label>
                  <input id="contact-phone" defaultValue={editContact.phone || ''}
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
                </div>
                <button onClick={handleUpdateContact}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                  Save to Odoo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
`);

console.log('');
console.log('=== Phase 2 Complete ===');
console.log('');
console.log('Pages:');
console.log('  /admin/users         — Full IAM with create, edit, permissions, seat mgmt');
console.log('  /agents/cfo/manage   — Write-back: edit invoices, contacts, create invoices');
console.log('');
console.log('Restart dev server and test.');
