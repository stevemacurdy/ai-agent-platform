
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentUser, type User } from '@/lib/supabase'
import AdminLeaderboard from '@/components/AdminLeaderboard'

// ============================================================================
// MOCK DATA — Replace with real API calls when ready
// ============================================================================

const USERS_DATA = {
  employees: [
    { id: 'e1', name: 'Sarah Chen', email: 'sarah@woulfgroup.com', role: 'employee', status: 'active', dept: 'Engineering' },
    { id: 'e2', name: 'Marcus Williams', email: 'marcus@woulfgroup.com', role: 'employee', status: 'active', dept: 'Sales' },
    { id: 'e3', name: 'Priya Patel', email: 'priya@woulfgroup.com', role: 'employee', status: 'active', dept: 'Marketing' },
  ],
  betaTesters: [
    { id: 'b1', name: 'Jason Rivera', email: 'jason@logicorp.com', role: 'beta_tester', status: 'active', company: 'Logicorp' },
    { id: 'b2', name: 'Emily Zhao', email: 'emily@freshfields.co', role: 'beta_tester', status: 'active', company: 'FreshFields' },
    { id: 'b3', name: 'Tom Baker', email: 'tom@meridian.io', role: 'beta_tester', status: 'invited', company: 'Meridian' },
  ],
  customers: [
    { id: 'c1', name: 'Acme Logistics', plan: 'professional', mrr: 499, seats: 12, agents: 5, health: 'healthy' },
    { id: 'c2', name: 'TechForge Inc', plan: 'enterprise', mrr: 1299, seats: 45, agents: 7, health: 'healthy' },
    { id: 'c3', name: 'GreenLeaf Supply', plan: 'starter', mrr: 149, seats: 3, agents: 2, health: 'at-risk' },
    { id: 'c4', name: 'Pinnacle Group', plan: 'professional', mrr: 499, seats: 8, agents: 4, health: 'healthy' },
  ],
}

const METRICS = {
  totalRevenue: 28940,
  mrr: 4846,
  growthRate: 23.4,
  totalUsers: 68,
  activeAgents: 47,
  avgResponseTime: 1.2,
  costPerQuery: 0.003,
  uptime: 99.97,
  apiCalls24h: 12847,
  resolvedTickets: 342,
}

const INCIDENTS = [
  { id: 1, date: '2026-02-14', severity: 'minor', system: 'Sales Agent API', desc: 'Elevated latency (3.2s avg) due to OpenAI rate limiting. Auto-scaled to backup provider.', duration: '12 min', resolved: true },
  { id: 2, date: '2026-02-12', severity: 'major', system: 'Supabase Auth', desc: 'Auth service timeout during Supabase maintenance window. Users unable to login.', duration: '8 min', resolved: true },
  { id: 3, date: '2026-02-09', severity: 'minor', system: 'WMS Agent', desc: 'Webhook delivery failures to 2 customers. Retries succeeded after DNS propagation.', duration: '23 min', resolved: true },
  { id: 4, date: '2026-02-03', severity: 'info', system: 'Marketing Agent', desc: 'Scheduled maintenance for model upgrade (GPT-4o-mini → o3-mini). Zero downtime.', duration: '0 min', resolved: true },
]

const FEEDBACK = [
  { id: 1, from: 'Acme Logistics', agent: 'WMS Agent', rating: 5, text: 'The billing reconciliation caught $12K in missed charges. Incredible.', date: '2026-02-14' },
  { id: 2, from: 'TechForge Inc', agent: 'Sales Agent', rating: 4, text: 'Lead scoring is solid. Would love CRM auto-sync with HubSpot.', date: '2026-02-13' },
  { id: 3, from: 'Beta: Jason', agent: 'CFO Agent', rating: 5, text: 'Cash flow forecasting saved us from a payroll crunch. This is a must-have.', date: '2026-02-12' },
  { id: 4, from: 'GreenLeaf Supply', agent: 'Support Agent', rating: 3, text: 'Response quality is good but sometimes hallucinates order numbers.', date: '2026-02-11' },
  { id: 5, from: 'Beta: Emily', agent: 'Research Agent', rating: 4, text: 'Competitor analysis is thorough. Formatting could be cleaner.', date: '2026-02-10' },
]

const MARKET_TRENDS = {
  competitors: [
    { name: 'WoulfAI', efficiency: 94, cost: 0.003, speed: 1.2, agents: 7 },
    { name: 'Jasper AI', efficiency: 78, cost: 0.008, speed: 2.1, agents: 3 },
    { name: 'Copy.ai', efficiency: 72, cost: 0.006, speed: 1.8, agents: 4 },
    { name: 'Writer.com', efficiency: 81, cost: 0.012, speed: 1.5, agents: 5 },
    { name: 'Typeface', efficiency: 76, cost: 0.009, speed: 2.4, agents: 3 },
  ],
  gapAnalysis: [
    { product: 'Legal/Compliance Agent', demand: 89, competition: 'low', priority: 'high', insight: 'No major player offers AI-native contract review for SMBs. High willingness-to-pay signal from beta feedback.' },
    { product: 'HR/Recruiting Agent', demand: 76, competition: 'medium', priority: 'medium', insight: 'Market is growing 34% YoY. Our multi-agent architecture gives us an edge over single-purpose tools.' },
    { product: 'Supply Chain Forecasting', demand: 82, competition: 'low', priority: 'high', insight: 'Natural extension of WMS agent. 3 beta testers have explicitly requested this.' },
    { product: 'Real-time Voice Agent', demand: 68, competition: 'high', priority: 'low', insight: 'Technically complex. Wait for costs to drop before entering.' },
  ],
  agentGrowth: [
    { type: 'Customer Support AI', growth: 47, marketSize: '$4.2B' },
    { type: 'Sales AI Assistants', growth: 38, marketSize: '$3.1B' },
    { type: 'Finance/CFO AI', growth: 52, marketSize: '$2.8B' },
    { type: 'Marketing AI', growth: 31, marketSize: '$5.7B' },
    { type: 'Warehouse/Ops AI', growth: 61, marketSize: '$1.9B' },
    { type: 'Research/Intel AI', growth: 44, marketSize: '$2.3B' },
  ],
}

const REVENUE_TIMELINE = [
  { month: 'Sep', mrr: 1200 }, { month: 'Oct', mrr: 1850 },
  { month: 'Nov', mrr: 2400 }, { month: 'Dec', mrr: 3100 },
  { month: 'Jan', mrr: 3940 }, { month: 'Feb', mrr: 4846 },
]

// ============================================================================
// COMPONENTS
// ============================================================================

function StatCard({ label, value, sub, color = 'blue', trend }: {
  label: string; value: string; sub?: string; color?: string; trend?: string
}) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    green: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
    violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/20',
    rose: 'from-rose-500/10 to-rose-500/5 border-rose-500/20',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color] || colors.blue} border rounded-xl p-4`}>
      <div className="text-[11px] text-gray-400 uppercase tracking-wider font-mono mb-2">{label}</div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {trend && <span className={`text-xs font-mono mb-0.5 ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{trend}</span>}
      </div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  )
}

function MiniBar({ value, max = 100, color = '#3B82F6' }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-2 bg-white/5 rounded-full overflow-hidden w-full">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    major: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    minor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }
  return (
    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${styles[severity] || styles.info}`}>
      {severity}
    </span>
  )
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

type Tab = 'overview' | 'users' | 'market' | 'leaderboard'

export default function AdminCommandCenter() {
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [userFilter, setUserFilter] = useState<'all' | 'employees' | 'beta' | 'customers'>('all')

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greeting}, {user?.email?.split('@')[0] || 'Admin'}</h1>
          <p className="text-gray-500 text-sm mt-1">WoulfAI Command Center — {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          {(['overview', 'users', 'market', 'leaderboard'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {t === 'overview' ? '📊 Operations' : t === 'users' ? '👥 Users' : t === 'market' ? '🔭 Market Intel' : '🏆 Bug Bash'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab />}
      {tab === 'users' && <UsersTab filter={userFilter} setFilter={setUserFilter} />}
      {tab === 'market' && <MarketTab />}
      {tab === 'leaderboard' && <AdminLeaderboard />}
    </div>
  )
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Monthly Revenue" value={`$${METRICS.mrr.toLocaleString()}`} trend="+23.4%" color="green" />
        <StatCard label="Total Revenue" value={`$${METRICS.totalRevenue.toLocaleString()}`} sub="since launch" color="blue" />
        <StatCard label="Active Users" value={METRICS.totalUsers.toString()} trend="+12" color="cyan" />
        <StatCard label="Live Agents" value={METRICS.activeAgents.toString()} sub="across 4 orgs" color="violet" />
        <StatCard label="Uptime" value={`${METRICS.uptime}%`} sub="last 30 days" color="green" />
        <StatCard label="API Calls (24h)" value={METRICS.apiCalls24h.toLocaleString()} trend="+8.2%" color="amber" />
      </div>

      {/* Middle Row: Revenue Chart + Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Growth */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Revenue & Growth</h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">MRR Trend</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {REVENUE_TIMELINE.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-mono text-gray-400">${d.mrr >= 1000 ? `${(d.mrr / 1000).toFixed(1)}k` : d.mrr}</div>
                <div className="w-full relative" style={{ height: `${(d.mrr / 5000) * 100}%`, minHeight: '8px' }}>
                  <div
                    className="w-full h-full rounded-t-md transition-all"
                    style={{
                      background: `linear-gradient(to top, rgba(59,130,246,0.3), rgba(59,130,246,${0.4 + (i * 0.1)}))`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-gray-500">{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Operational Efficiency</h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full">Real-time</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Avg Response Time</span>
                <span className="font-mono text-emerald-400">{METRICS.avgResponseTime}s</span>
              </div>
              <MiniBar value={100 - (METRICS.avgResponseTime * 20)} color="#10B981" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Cost per Query</span>
                <span className="font-mono text-emerald-400">${METRICS.costPerQuery}</span>
              </div>
              <MiniBar value={95} color="#06B6D4" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Ticket Resolution Rate</span>
                <span className="font-mono text-blue-400">{METRICS.resolvedTickets}/day</span>
              </div>
              <MiniBar value={87} color="#3B82F6" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">System Uptime</span>
                <span className="font-mono text-emerald-400">{METRICS.uptime}%</span>
              </div>
              <MiniBar value={METRICS.uptime} color="#10B981" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Incidents + Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Incident Log */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Incident Log</h3>
            <span className="text-[10px] font-mono text-gray-500">{INCIDENTS.length} events (30d)</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {INCIDENTS.map(inc => (
              <div key={inc.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={inc.severity} />
                    <span className="text-xs font-medium">{inc.system}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono">{inc.date}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{inc.desc}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-gray-500 font-mono">Duration: {inc.duration}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">✓ Resolved</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Feedback */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Customer Feedback</h3>
            <span className="text-[10px] font-mono text-gray-500">AI-collected</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {FEEDBACK.map(fb => (
              <div key={fb.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{fb.from}</span>
                    <span className="text-[10px] text-gray-600">via {fb.agent}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-xs ${i < fb.rating ? 'text-amber-400' : 'text-gray-700'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed italic">&ldquo;{fb.text}&rdquo;</p>
                <div className="text-[10px] text-gray-600 font-mono mt-1.5">{fb.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/admin/users" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <span className="text-xl mb-2 block">👥</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">Manage Users</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">{USERS_DATA.employees.length + USERS_DATA.betaTesters.length + USERS_DATA.customers.length} total</span>
        </Link>
        <Link href="/admin/sales-reps" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <span className="text-xl mb-2 block">💼</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">Sales Reps</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Team management</span>
        </Link>
        <Link href="/agents/cfo/console" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <span className="text-lg">📈</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">CFO Console</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Financial intelligence</span>
        </Link>
        <Link href="/agents/cfo/finops" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <span className="text-lg">💰</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">FinOps Suite</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">AP, debt, forecasting</span>
        </Link>
        <Link href="/admin/agent-creator" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <span className="text-xl mb-2 block">🧬</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">Agent Creator</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Build custom agents</span>
        </Link>
        <Link href="/admin/bug-bash" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <span className="text-lg">🐛</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">Bug Bash</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Beta tester tools</span>
        </Link>
        <Link href="/admin/agents" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group"><span className="text-xl mb-2 block">🤖</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">Agent Dashboard</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">View as customer</span>
        </Link>
      </div>
    </div>
  )
}

// ============================================================================
// USERS TAB
// ============================================================================

function UsersTab({ filter, setFilter }: { filter: string; setFilter: (f: any) => void }) {
  const [selectedUser, setSelectedUser] = useState<any>(null)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Users', count: 10 },
          { key: 'employees', label: 'Employees', count: USERS_DATA.employees.length },
          { key: 'beta', label: 'Beta Testers', count: USERS_DATA.betaTesters.length },
          { key: 'customers', label: 'Customers', count: USERS_DATA.customers.length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-gray-500 hover:text-white bg-white/[0.02] border border-white/5'
            }`}
          >
            {f.label} <span className="text-[10px] ml-1 opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      {/* User Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Manage User</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Name</label>
                <input className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" defaultValue={selectedUser.name || selectedUser.company} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Email</label>
                <input className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" defaultValue={selectedUser.email || ''} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Role</label>
                <select className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <option value="member">Member</option>
                  <option value="org_admin">Org Admin</option>
                  <option value="beta_tester">Beta Tester</option>
                  <option value="employee">Employee</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Status</label>
                <select className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="invited">Invited</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  Save Changes
                </button>
                <button className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-sm hover:bg-rose-500/20 transition-colors">
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employees */}
      {(filter === 'all' || filter === 'employees') && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Employees
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Email</th>
                  <th className="text-left py-2 px-3">Department</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-right py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {USERS_DATA.employees.map(emp => (
                  <tr key={emp.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-medium">{emp.name}</td>
                    <td className="py-2.5 px-3 text-gray-400 font-mono text-xs">{emp.email}</td>
                    <td className="py-2.5 px-3 text-gray-400">{emp.dept}</td>
                    <td className="py-2.5 px-3"><span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">{emp.status}</span></td>
                    <td className="py-2.5 px-3 text-right">
                      <button onClick={() => setSelectedUser(emp)} className="text-xs text-blue-400 hover:text-blue-300">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Beta Testers */}
      {(filter === 'all' || filter === 'beta') && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span> Beta Testers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Email</th>
                  <th className="text-left py-2 px-3">Company</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-right py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {USERS_DATA.betaTesters.map(bt => (
                  <tr key={bt.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-medium">{bt.name}</td>
                    <td className="py-2.5 px-3 text-gray-400 font-mono text-xs">{bt.email}</td>
                    <td className="py-2.5 px-3 text-gray-400">{bt.company}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        bt.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}>{bt.status}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button onClick={() => setSelectedUser(bt)} className="text-xs text-blue-400 hover:text-blue-300">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customers */}
      {(filter === 'all' || filter === 'customers') && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Customers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-2 px-3">Organization</th>
                  <th className="text-left py-2 px-3">Plan</th>
                  <th className="text-right py-2 px-3">MRR</th>
                  <th className="text-right py-2 px-3">Seats</th>
                  <th className="text-right py-2 px-3">Agents</th>
                  <th className="text-left py-2 px-3">Health</th>
                  <th className="text-right py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {USERS_DATA.customers.map(cust => (
                  <tr key={cust.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-medium">{cust.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        cust.plan === 'enterprise' ? 'text-violet-400 bg-violet-500/10' :
                        cust.plan === 'professional' ? 'text-blue-400 bg-blue-500/10' :
                        'text-gray-400 bg-white/5'
                      }`}>{cust.plan}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">${cust.mrr}</td>
                    <td className="py-2.5 px-3 text-right text-gray-400">{cust.seats}</td>
                    <td className="py-2.5 px-3 text-right text-gray-400">{cust.agents}/7</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        cust.health === 'healthy' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>{cust.health}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button onClick={() => setSelectedUser(cust)} className="text-xs text-blue-400 hover:text-blue-300">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MARKET INTEL TAB
// ============================================================================

function MarketTab() {
  return (
    <div className="space-y-6">
      {/* Competitor Benchmarking */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Competitor Benchmarking</h3>
          <span className="text-[10px] font-mono text-gray-500">AI Efficiency Index</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-2 px-3">Company</th>
                <th className="text-left py-2 px-3">Efficiency</th>
                <th className="text-right py-2 px-3">Cost/Query</th>
                <th className="text-right py-2 px-3">Avg Speed</th>
                <th className="text-right py-2 px-3">Agent Count</th>
              </tr>
            </thead>
            <tbody>
              {MARKET_TRENDS.competitors.map(c => (
                <tr key={c.name} className={`border-b border-white/[0.03] ${c.name === 'WoulfAI' ? 'bg-blue-500/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                  <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                    {c.name === 'WoulfAI' && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono">YOU</span>}
                    {c.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <MiniBar value={c.efficiency} color={c.name === 'WoulfAI' ? '#3B82F6' : '#374151'} />
                      <span className="text-xs font-mono text-gray-400 w-8">{c.efficiency}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs">${c.cost}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs">{c.speed}s</td>
                  <td className="py-2.5 px-3 text-right text-gray-400">{c.agents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Gap Analysis */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Products to Bring to Market</h3>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">Gap Analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MARKET_TRENDS.gapAnalysis.map(gap => (
            <div key={gap.product} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{gap.product}</h4>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  gap.priority === 'high' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                  gap.priority === 'medium' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' :
                  'text-gray-400 bg-white/5 border border-white/10'
                }`}>{gap.priority} priority</span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">Demand:</span>
                  <span className="text-xs font-mono text-blue-400">{gap.demand}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">Competition:</span>
                  <span className={`text-xs font-mono ${gap.competition === 'low' ? 'text-emerald-400' : gap.competition === 'medium' ? 'text-amber-400' : 'text-rose-400'}`}>{gap.competition}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{gap.insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Market Growth */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">AI Agent Market Growth Trends</h3>
          <span className="text-[10px] font-mono text-gray-500">YoY Growth %</span>
        </div>
        <div className="space-y-3">
          {MARKET_TRENDS.agentGrowth.sort((a, b) => b.growth - a.growth).map(ag => (
            <div key={ag.type} className="flex items-center gap-4">
              <div className="w-40 text-xs text-gray-400 truncate">{ag.type}</div>
              <div className="flex-1">
                <MiniBar value={ag.growth} max={70} color={ag.growth > 50 ? '#10B981' : ag.growth > 40 ? '#3B82F6' : '#6366F1'} />
              </div>
              <div className="w-12 text-right text-xs font-mono text-emerald-400">+{ag.growth}%</div>
              <div className="w-16 text-right text-[10px] font-mono text-gray-500">{ag.marketSize}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
