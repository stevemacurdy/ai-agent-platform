'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SessionUser {
  id: string; email: string; name: string; role: string; selectedRole?: string;
  agents: string[]; companyId: string; companyName: string
}

const ALL_AGENTS = [
  { id: 'cfo', name: 'CFO Agent', icon: '📈', description: 'Financial intelligence, forecasting, and P&L analysis', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', accent: 'text-emerald-400' },
  { id: 'sales', name: 'Sales Agent', icon: '💼', description: 'Pipeline management, CRM, and deal intelligence', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', accent: 'text-blue-400' },
  { id: 'finops', name: 'FinOps Agent', icon: '💰', description: 'Cost optimization and cloud spend management', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', accent: 'text-amber-400' },
  { id: 'payables', name: 'Payables Agent', icon: '🧾', description: 'Invoice processing and AP automation', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/20', accent: 'text-orange-400' },
  { id: 'collections', name: 'Collections Agent', icon: '📬', description: 'AR tracking and payment follow-ups', color: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/20', accent: 'text-rose-400' },
  { id: 'hr', name: 'HR Agent', icon: '👥', description: 'People operations and workforce management', color: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20', accent: 'text-violet-400' },
  { id: 'operations', name: 'Operations Agent', icon: '⚙️', description: 'Project tracking and operational workflows', color: 'from-slate-500/20 to-slate-600/10', border: 'border-slate-500/20', accent: 'text-slate-400' },
  { id: 'legal', name: 'Legal Agent', icon: '⚖️', description: 'Contract review and compliance monitoring', color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/20', accent: 'text-cyan-400' },
  { id: 'marketing', name: 'Marketing Agent', icon: '📣', description: 'Campaign management and market intelligence', color: 'from-pink-500/20 to-pink-600/10', border: 'border-pink-500/20', accent: 'text-pink-400' },
  { id: 'wms', name: 'WMS Agent', icon: '🏭', description: 'Warehouse management and inventory control', color: 'from-teal-500/20 to-teal-600/10', border: 'border-teal-500/20', accent: 'text-teal-400' },
  { id: 'compliance', name: 'Compliance Agent', icon: '🛡️', description: 'Regulatory compliance and risk assessment', color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/20', accent: 'text-indigo-400' },
]

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  employee: { label: 'Employee', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  org_lead: { label: 'Organization Lead', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  beta_tester: { label: 'Beta Tester', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
}

export default function PortalDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [time, setTime] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('woulfai_session')
      if (saved) setUser(JSON.parse(saved))
      else router.replace('/login')
    } catch { router.replace('/login') }

    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const iv = setInterval(tick, 60000)
    return () => clearInterval(iv)
  }, [router])

  if (!user) return null

  const activeRole = user.selectedRole || user.role
  const isAdmin = activeRole === 'super_admin' || activeRole === 'admin'
  const myAgents = isAdmin ? ALL_AGENTS : ALL_AGENTS.filter(a => user.agents.includes(a.id))
  const roleCfg = ROLE_CONFIG[activeRole] || ROLE_CONFIG.beta_tester
  const firstName = user.name.split(' ')[0]
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  const logout = () => { localStorage.removeItem('woulfai_session'); router.push('/login') }
  const switchRole = () => { localStorage.removeItem('woulfai_session'); router.push('/login') }

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10 flex items-center justify-center">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">W</span>
            </div>
            <span className="text-sm font-semibold text-gray-300">WoulfAI</span>
            <span className={"text-[10px] px-2 py-0.5 rounded font-semibold ml-2 " + roleCfg.bg + " " + roleCfg.color}>{roleCfg.label}</span>
            {user.companyName && <span className="text-[10px] text-gray-600 ml-1">| {user.companyName}</span>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">{time}</span>
            {isAdmin && (
              <button onClick={() => router.push('/admin/users')}
                className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                Admin Console
              </button>
            )}
            <button onClick={switchRole}
              className="text-[10px] text-gray-600 hover:text-blue-400 px-2 py-1 rounded hover:bg-blue-500/5 transition-all">
              Switch Role
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-xs font-medium">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="text-right">
                <div className="text-xs font-medium">{user.name}</div>
                <div className="text-[10px] text-gray-600">{user.email}</div>
              </div>
            </div>
            <button onClick={logout}
              className="text-xs text-gray-600 hover:text-rose-400 px-2 py-1 rounded hover:bg-rose-500/5 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Role banners */}
        {activeRole === 'beta_tester' && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-emerald-400">🧪 Beta Access — Live Agents Enabled</div>
              <div className="text-xs text-gray-500 mt-1">Full access to live agents during the beta period. Data scoped to {user.companyName}.</div>
            </div>
            <span className="text-[10px] text-emerald-400/60 bg-emerald-500/10 px-3 py-1 rounded-full">Beta Program</span>
          </div>
        )}

        {activeRole === 'org_lead' && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-amber-400">👑 {user.companyName} Intelligence Suite</div>
              <div className="text-xs text-gray-500 mt-1">Organization Lead — {myAgents.length} live agent{myAgents.length !== 1 ? 's' : ''} configured for your organization.</div>
            </div>
            <button className="text-[10px] text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all">
              Manage Billing
            </button>
          </div>
        )}

        {activeRole === 'employee' && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-blue-400">🏢 {user.companyName} — Live Agents</div>
              <div className="text-xs text-gray-500 mt-1">Live access to {myAgents.length} agent{myAgents.length !== 1 ? 's' : ''}. All data scoped to your company.</div>
            </div>
            <span className="text-[10px] text-blue-400/60 bg-blue-500/10 px-3 py-1 rounded-full">{user.companyName}</span>
          </div>
        )}

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {firstName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Full access to all live agents and admin console.'
              : activeRole === 'org_lead' ? `Your ${user.companyName} intelligence suite is ready.`
              : `${myAgents.length} live agent${myAgents.length !== 1 ? 's' : ''} ready for ${user.companyName}.`}
          </p>
        </div>

        {/* Agent Grid */}
        {myAgents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAgents.map(agent => (
              <button key={agent.id} onClick={() => router.push('/portal/agent/' + agent.id)}
                className={"group bg-gradient-to-br " + agent.color + " border " + agent.border + " rounded-2xl p-6 text-left hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-black/20"}>
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{agent.icon}</span>
                  <span className={"text-[10px] font-medium px-2 py-0.5 rounded bg-black/20 " + agent.accent}>LIVE</span>
                </div>
                <h3 className="text-base font-semibold mt-4 group-hover:text-white transition-colors">{agent.name}</h3>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{agent.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 group-hover:text-gray-400">Launch Agent →</span>
                  <span className="text-[9px] text-gray-700">{user.companyName}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-400">No Agents Assigned</h3>
            <p className="text-sm text-gray-600 mt-2">Contact your administrator to get access to live AI agents.</p>
          </div>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <div className="border-t border-white/5 pt-8">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Admin Quick Actions</h2>
            <div className="flex gap-3">
              <button onClick={() => router.push('/admin/users')} className="px-4 py-3 bg-[#0A0E15] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">👥 Manage Users</button>
              <button onClick={() => router.push('/admin')} className="px-4 py-3 bg-[#0A0E15] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">📊 Analytics</button>
              <button onClick={() => router.push('/admin/pricing')} className="px-4 py-3 bg-[#0A0E15] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">💰 Pricing</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
