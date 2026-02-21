#!/usr/bin/env node
/**
 * WoulfAI SIDEBAR PERSISTENCE + WALKTHROUGH BUG FIX
 *
 * Fixes:
 *   1. Extracts sidebar into shared component
 *   2. Adds agents/* layout wrapper (sidebar stays visible everywhere)
 *   3. All 11 agents in admin dashboard with correct routing
 *   4. Nested CFO hierarchy (Tools under Console)
 *   5. Single Sales Rep agent
 *   6. Bug Bash, CFO Tools, FinOps Suite links fixed
 *   7. No more redirect loops on WMS/Support/Marketing
 *
 * Run from: ai-agent-platform root
 * Usage: node sidebar-fix.js
 */
const fs = require('fs');
const path = require('path');
let installed = 0;

function write(rel, content) {
  const fp = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
  console.log('  + ' + rel + ' (' + content.split('\n').length + ' lines)');
  installed++;
}

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════════╗');
console.log('  ║  SIDEBAR PERSISTENCE + WALKTHROUGH FIX                       ║');
console.log('  ║  Shared Sidebar · 11 Agents · Nested Hierarchy · No Loops    ║');
console.log('  ╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. SHARED SIDEBAR COMPONENT
//    Used by BOTH /admin/* layout AND /agents/* layout
// ============================================================
console.log('  [1] Shared Sidebar Component:');

write('components/AdminSidebar.tsx', `'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavChild { id: string; label: string; href: string; icon: string }
interface NavItem { id: string; label: string; href: string; icon: string; children?: NavChild[] }

const NAV_ITEMS: NavItem[] = [
  { id: 'hub', label: 'Command Center', href: '/admin', icon: '🎯' },
  { id: 'dashboard', label: 'Agent Dashboard', href: '/admin/agents', icon: '🤖' },
  { id: 'users', label: 'Users & Roles', href: '/admin/users', icon: '👥' },
  { id: 'sales', label: 'Sales Reps', href: '/admin/sales-reps', icon: '💼', children: [
    { id: 'sales-crm', label: 'Sales CRM', href: '/admin/sales-crm', icon: '📊' },
    { id: 'sales-intel', label: 'Sales Intel', href: '/agents/sales/intel', icon: '🧠' },
    { id: 'sales-solo', label: 'Solo Rep Agent', href: '/agents/sales/solo', icon: '🎯' },
  ]},
  { id: 'cfo-console', label: 'CFO Console', href: '/agents/cfo/console', icon: '📈', children: [
    { id: 'cfo-tools', label: 'CFO Tools', href: '/agents/cfo/tools', icon: '🔧' },
    { id: 'payables', label: 'Payables', href: '/agents/cfo/payables', icon: '🧾' },
  ]},
  { id: 'finops', label: 'FinOps Suite', href: '/agents/cfo/finops', icon: '💰', children: [
    { id: 'finops-pro', label: 'FinOps Pro', href: '/agents/cfo/finops-pro', icon: '⚡' },
  ]},
  { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: '📊' },
  { id: 'agents-creator', label: 'Agent Creator', href: '/admin/agent-creator', icon: '🧬' },
  { id: 'bug-bash', label: 'Bug Bash', href: '/admin/bug-bash', icon: '🐛' },
]

interface SidebarProps {
  user: { email: string; role: string; full_name?: string } | null
  onSignOut: () => void
}

export default function AdminSidebar({ user, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ sales: true, 'cfo-console': true, finops: false })

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isGroupActive = (item: NavItem) => {
    if (isActive(item.href)) return true
    return item.children?.some(c => isActive(c.href)) || false
  }

  return (
    <aside className={\`\${open ? 'w-64' : 'w-16'} bg-[#0A0E15] border-r border-white/5 flex flex-col transition-all duration-200 flex-shrink-0 h-screen sticky top-0\`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        {open && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-sm font-bold">W</div>
            <div>
              <div className="text-sm font-bold">WoulfAI</div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Admin Console</div>
            </div>
          </Link>
        )}
        <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-white text-lg">
          {open ? '◁' : '▷'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const hasKids = item.children && item.children.length > 0
          const isExp = expanded[item.id]
          const groupActive = isGroupActive(item)

          return (
            <div key={item.id}>
              <div className="flex items-center">
                <Link href={item.href}
                  className={\`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all \${
                    isActive(item.href) || groupActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }\`}>
                  <span className="text-base">{item.icon}</span>
                  {open && <span>{item.label}</span>}
                </Link>
                {hasKids && open && (
                  <button onClick={() => toggle(item.id)} className="px-2 py-2.5 text-gray-500 hover:text-white text-xs">
                    {isExp ? '▾' : '▸'}
                  </button>
                )}
              </div>
              {hasKids && isExp && open && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/5 pl-2">
                  {item.children!.map(child => (
                    <Link key={child.id} href={child.href}
                      className={\`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all \${
                        isActive(child.href) ? 'bg-blue-500/10 text-blue-400' : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }\`}>
                      <span className="text-sm">{child.icon}</span>
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-white/5">
        {open && user && (
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-gray-400 truncate">{user.email}</div>
            <div className="text-[10px] text-gray-600">{user.role}</div>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <span>🏠</span>{open && <span>User Dashboard</span>}
          </Link>
          <button onClick={onSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <span>🚪</span>{open && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
`);

// ============================================================
// 2. ADMIN LAYOUT — Uses shared sidebar
// ============================================================
console.log('');
console.log('  [2] Admin Layout (shared sidebar):');

write('app/admin/layout.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, canAccessAdmin, getLoginRedirect, signOut, type User } from '@/lib/supabase'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function check() {
      const u = await getCurrentUser()
      if (!u) { router.push('/login'); return }
      if (!canAccessAdmin(u)) { router.push(getLoginRedirect(u)); return }
      setUser(u)
      setOk(true)
    }
    check()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  if (!ok) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#06080D] text-white flex">
      <AdminSidebar user={user} onSignOut={handleSignOut} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
`);

// ============================================================
// 3. AGENTS LAYOUT — Same sidebar, persistent across all /agents/* routes
//    THIS IS THE KEY FIX — agents routes now get the sidebar
// ============================================================
console.log('');
console.log('  [3] Agents Layout (sidebar persistence fix):');

write('app/agents/layout.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, canAccessAdmin, getLoginRedirect, signOut, type User } from '@/lib/supabase'
import AdminSidebar from '@/components/AdminSidebar'

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function check() {
      const u = await getCurrentUser()
      if (!u) { router.push('/login'); return }
      // Allow both admins and regular users with agent access
      setUser(u)
      setOk(true)
    }
    check()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  if (!ok) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#06080D] text-white flex">
      <AdminSidebar user={user} onSignOut={handleSignOut} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
`);

// ============================================================
// 4. AGENT DASHBOARD — All 11 agents with correct routing
// ============================================================
console.log('');
console.log('  [4] Agent Dashboard (all 11 agents):');

write('app/admin/agents/page.tsx', `'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AGENTS } from '@/lib/agents'
import { trackClick } from '@/lib/track'
import LeadCaptureModal from '@/components/LeadCaptureModal'

export default function AgentDashboard() {
  const [showLead, setShowLead] = useState<{ slug: string; name: string } | null>(null)
  const live = AGENTS.filter(a => a.status === 'live')
  const dev = AGENTS.filter(a => a.status !== 'live')

  const handleClick = (agent: typeof AGENTS[0]) => {
    trackClick(agent.slug, 'agent-dashboard')
    if (agent.status !== 'live') {
      setShowLead({ slug: agent.slug, name: agent.name })
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {showLead && <LeadCaptureModal agentSlug={showLead.slug} agentName={showLead.name} onClose={() => setShowLead(null)} />}

      <div>
        <h1 className="text-xl font-bold">Agent Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">All 11 AI agents — {live.length} live, {dev.length} in development</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Total Agents</div>
          <div className="text-2xl font-mono font-bold mt-1">{AGENTS.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Live</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{live.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">In Development</div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">{dev.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Avg Completion</div>
          <div className="text-2xl font-mono font-bold text-blue-400 mt-1">{Math.round(AGENTS.reduce((s, a) => s + a.completionPct, 0) / AGENTS.length)}%</div>
        </div>
      </div>

      {/* Live Agents */}
      <div>
        <h2 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Live Agents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {live.map(agent => (
            <Link key={agent.slug} href={agent.liveRoute!}
              onClick={() => trackClick(agent.slug, 'agent-dashboard')}
              className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{agent.icon}</div>
                  <div>
                    <div className="text-sm font-semibold group-hover:text-emerald-400 transition-colors">{agent.name}</div>
                    <div className="text-[10px] text-gray-600">{agent.category}</div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 animate-pulse">LIVE</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{agent.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: agent.completionPct + '%' }} />
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{agent.completionPct}%</span>
              </div>
              <div className="text-[10px] text-gray-600 mt-2">
                {agent.features.filter(f => f.status === 'done').length}/{agent.features.length} features
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dev Agents */}
      <div>
        <h2 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">In Development</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dev.map(agent => (
            <div key={agent.slug}
              onClick={() => handleClick(agent)}
              className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-amber-500/20 hover:bg-amber-500/[0.02] transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl opacity-60">{agent.icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-400 group-hover:text-amber-400 transition-colors">{agent.name}</div>
                    <div className="text-[10px] text-gray-600">{agent.category}</div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-400">DEV</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">{agent.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: agent.completionPct + '%' }} />
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{agent.completionPct}%</span>
              </div>
              <div className="text-[10px] text-amber-400/50 mt-2 font-medium">
                Click to join waitlist →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
`);

// ============================================================
// 5. SOLO SALES REP AGENT
//    Full sales functionality for an individual rep with their own CRM
// ============================================================
console.log('');
console.log('  [5] Solo Sales Rep Agent:');

write('app/agents/sales/solo/page.tsx', `'use client'
import { useState, useEffect } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const fmt = (n: number) => '$' + n.toLocaleString()

// Solo rep operates independently with their own CRM connection
const SOLO_REP = {
  name: getEmail().split('@')[0] || 'Sales Rep',
  email: getEmail(),
  stats: { pipeline: 285000, closed: 148000, winRate: 62, activeDeals: 7, avgDealSize: 40714 },
}

const MY_DEALS = [
  { id: 'd1', company: 'Apex Manufacturing', contact: 'Diana Reeves', value: 75000, stage: 'proposal', probability: 70, nextStep: 'Send revised SOW by Friday', daysInStage: 5 },
  { id: 'd2', company: 'Cascade Logistics', contact: 'Robert Fung', value: 45000, stage: 'negotiation', probability: 85, nextStep: 'Legal review of MSA', daysInStage: 3 },
  { id: 'd3', company: 'Ridgeline Partners', contact: 'Samira Khan', value: 120000, stage: 'discovery', probability: 30, nextStep: 'Schedule site visit', daysInStage: 12 },
  { id: 'd4', company: 'Westfield Supply Co', contact: 'Brett Holloway', value: 22000, stage: 'qualified', probability: 50, nextStep: 'Demo call Thursday 2pm', daysInStage: 8 },
  { id: 'd5', company: 'Northstar Distribution', contact: 'Elena Torres', value: 23000, stage: 'proposal', probability: 65, nextStep: 'Follow up on pricing questions', daysInStage: 4 },
]

const MY_ACTIVITIES = [
  { id: 'a1', type: 'call', desc: 'Follow-up with Diana Reeves @ Apex', date: '2026-02-16', done: false },
  { id: 'a2', type: 'email', desc: 'Send case study to Cascade Logistics', date: '2026-02-16', done: true },
  { id: 'a3', type: 'meeting', desc: 'Demo call with Westfield Supply', date: '2026-02-17', done: false },
  { id: 'a4', type: 'task', desc: 'Update Ridgeline proposal pricing', date: '2026-02-17', done: false },
  { id: 'a5', type: 'call', desc: 'Discovery call with new inbound lead', date: '2026-02-18', done: false },
]

const CRM_OPTIONS = [
  { id: 'hubspot', name: 'HubSpot', icon: '🟠', status: 'Connect' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', status: 'Connect' },
  { id: 'pipedrive', name: 'Pipedrive', icon: '🟢', status: 'Connect' },
  { id: 'zoho', name: 'Zoho CRM', icon: '🔵', status: 'Connect' },
]

const stageColors: Record<string, string> = {
  qualified: 'bg-blue-500/10 text-blue-400',
  discovery: 'bg-purple-500/10 text-purple-400',
  proposal: 'bg-amber-500/10 text-amber-400',
  negotiation: 'bg-emerald-500/10 text-emerald-400',
}

export default function SoloSalesRepPage() {
  const [tab, setTab] = useState<'pipeline' | 'activities' | 'crm'>('pipeline')
  const [activities, setActivities] = useState(MY_ACTIVITIES)
  const [toast, setToast] = useState<string | null>(null)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }
  const toggleActivity = (id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a))
    show('Activity updated')
  }

  const stats = SOLO_REP.stats
  const tabs = [
    { id: 'pipeline' as const, label: 'My Pipeline' },
    { id: 'activities' as const, label: 'Activities' },
    { id: 'crm' as const, label: 'CRM Connection' },
  ]

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div>
        <h1 className="text-xl font-bold">Solo Sales Agent</h1>
        <p className="text-sm text-gray-500 mt-1">Your personal pipeline, activities, and CRM — independent from the team view</p>
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Pipeline</div><div className="text-lg font-mono font-bold mt-1">{fmt(stats.pipeline)}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Closed</div><div className="text-lg font-mono font-bold text-emerald-400 mt-1">{fmt(stats.closed)}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Win Rate</div><div className="text-lg font-mono font-bold text-blue-400 mt-1">{stats.winRate}%</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Active Deals</div><div className="text-lg font-mono font-bold mt-1">{stats.activeDeals}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Avg Deal</div><div className="text-lg font-mono font-bold mt-1">{fmt(stats.avgDealSize)}</div></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Pipeline */}
      {tab === 'pipeline' && (
        <div className="space-y-3">
          {MY_DEALS.map(deal => (
            <div key={deal.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm font-semibold">{deal.company}</div>
                  <div className="text-xs text-gray-500">{deal.contact}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold">{fmt(deal.value)}</div>
                  <span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (stageColors[deal.stage] || 'bg-gray-500/10 text-gray-400')}>{deal.stage}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400"><span className="text-gray-600">Next:</span> {deal.nextStep}</div>
                <div className="flex items-center gap-3 text-[10px] text-gray-600">
                  <span>{deal.probability}% prob</span>
                  <span>{deal.daysInStage}d in stage</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activities */}
      {tab === 'activities' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Upcoming Activities</h3>
          {activities.map(a => (
            <div key={a.id} className="flex items-center gap-3 py-3 border-b border-white/[0.03] last:border-0">
              <button onClick={() => toggleActivity(a.id)}
                className={"w-5 h-5 rounded border-2 flex items-center justify-center text-xs transition-all " +
                  (a.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-600 hover:border-gray-400')}>
                {a.done && '✓'}
              </button>
              <div className="text-sm">
                {a.type === 'call' ? '📞' : a.type === 'email' ? '✉️' : a.type === 'meeting' ? '🤝' : '📋'}
              </div>
              <div className="flex-1">
                <div className={"text-sm " + (a.done ? 'text-gray-600 line-through' : '')}>{a.desc}</div>
                <div className="text-[10px] text-gray-600">{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRM Connection */}
      {tab === 'crm' && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-2">Connect Your Personal CRM</h3>
            <p className="text-xs text-gray-500 mb-4">
              Link your individual CRM account. This is separate from the team CRM — your data stays private to your pipeline.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CRM_OPTIONS.map(crm => (
                <button key={crm.id} onClick={() => show(crm.name + ' connection flow coming soon')}
                  className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-4 hover:border-blue-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{crm.icon}</span>
                    <span className="text-sm font-medium">{crm.name}</span>
                  </div>
                  <span className="text-xs text-blue-400 font-medium">{crm.status}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
            <div className="text-xs text-blue-400 font-medium mb-1">How Solo Agent Works</div>
            <div className="text-xs text-gray-500 leading-relaxed">
              Your Solo Sales Agent operates independently from the team. Connect your personal CRM credentials,
              and the agent will sync your deals, contacts, and activities without sharing data with other reps.
              Behavioral profiling and battle cards from Sales Intel are available to you, but your pipeline data is private.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`);

// ============================================================
// 6. FIX ADMIN COMMAND CENTER — All 11 agents + correct links
// ============================================================
console.log('');
console.log('  [6] Admin Command Center Quick Links Fix:');

// Patch the admin page to fix the quick links section
const adminPagePath = path.join(process.cwd(), 'app/admin/page.tsx');
if (fs.existsSync(adminPagePath)) {
  let content = fs.readFileSync(adminPagePath, 'utf8');

  // Fix the quick links section — replace the bottom link block
  // Look for the Agent Dashboard link and fix it
  if (content.includes("href=\"/dashboard\"") && content.includes("Agent Dashboard")) {
    content = content.replace(
      /<Link href="\/dashboard"([^>]*)>\s*([^]*?)Agent Dashboard([^]*?)<\/Link>/,
      `<Link href="/admin/agents"$1>$2Agent Dashboard$3</Link>`
    );
    console.log('  + Fixed Agent Dashboard link → /admin/agents');
  }

  // Add Bug Bash quick link if missing
  if (!content.includes('/admin/bug-bash') && content.includes('Agent Creator')) {
    content = content.replace(
      /(<Link href="\/admin\/agent-creator"[^]*?<\/Link>)/,
      `$1
        <Link href="/admin/bug-bash" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <span className="text-lg">🐛</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">Bug Bash</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Beta tester tools</span>
        </Link>`
    );
    console.log('  + Added Bug Bash quick link');
  }

  // Add CFO Console quick link if missing
  if (!content.includes('/agents/cfo/console')) {
    content = content.replace(
      /(<Link href="\/admin\/agent-creator"[^]*?<\/Link>)/,
      `<Link href="/agents/cfo/console" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <span className="text-lg">📈</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">CFO Console</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Financial intelligence</span>
        </Link>
        <Link href="/agents/cfo/finops" className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <span className="text-lg">💰</span>
          <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">FinOps Suite</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">AP, debt, forecasting</span>
        </Link>
        $1`
    );
    console.log('  + Added CFO Console + FinOps Suite quick links');
  }

  fs.writeFileSync(adminPagePath, content);
} else {
  console.log('  ! app/admin/page.tsx not found — skipping quick link fix');
}

// ============================================================
// 7. AGENTS INDEX PAGE (prevent blank /agents route)
// ============================================================
console.log('');
console.log('  [7] Agents Index Redirect:');

write('app/agents/page.tsx', `'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentsPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/agents') }, [router])
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
`);

// ============================================================
// DONE
// ============================================================
console.log('');
console.log('  ═══════════════════════════════════════════');
console.log('  Installed: ' + installed + ' files');
console.log('  ═══════════════════════════════════════════');
console.log('');
console.log('  WHAT THIS FIXES:');
console.log('');
console.log('  Sidebar Persistence:');
console.log('    ✓ /admin/*        → sidebar via admin layout');
console.log('    ✓ /agents/cfo/*   → sidebar via agents layout (NEW)');
console.log('    ✓ /agents/sales/* → sidebar via agents layout (NEW)');
console.log('    ✓ Bug Bash, FinOps, CFO Tools — all keep sidebar');
console.log('');
console.log('  Routing:');
console.log('    ✓ Agent Dashboard shows ALL 11 agents');
console.log('    ✓ Live agents → correct routes (no loops)');
console.log('    ✓ Dev agents → lead capture modal (no loops)');
console.log('    ✓ Bug Bash button → /admin/bug-bash');
console.log('    ✓ CFO Tools nested under CFO Console');
console.log('    ✓ FinOps Pro nested under FinOps Suite');
console.log('');
console.log('  New Features:');
console.log('    ✓ Solo Sales Rep agent at /agents/sales/solo');
console.log('    ✓ Analytics link in sidebar');
console.log('');
console.log('  Restart: Ctrl+C → npm run dev');
console.log('');
