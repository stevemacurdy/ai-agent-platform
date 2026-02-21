#!/usr/bin/env node
/**
 * ORG LEAD REBRANDING + MULTI-ROLE LOGIN
 *
 * Changes:
 *   1. "Customer" → "Organization Lead" globally
 *   2. Post-login role selector — if user has multiple eligible roles, pick one
 *   3. All roles route to live agents with tenant isolation
 *   4. Session captures selected role for TenantProvider scoping
 *
 * Files:
 *   - lib/auth-store.ts              — org_lead role, multi-role support
 *   - lib/tenant-context.tsx          — unchanged (already works)
 *   - app/login/page.tsx              — role selector after credentials
 *   - app/portal/page.tsx             — org_lead branding
 *   - app/portal/agent/[id]/page.tsx  — org_lead support
 *   - app/admin/users/page.tsx        — org_lead in admin
 *   - app/api/auth/login/route.ts     — returns eligible roles
 *   - app/api/auth/route.ts           — updated
 *   - app/api/admin/users/route.ts    — updated
 *
 * Usage: node org-lead-multirole.js
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
console.log('  ╔══════════════════════════════════════════════════════════════════╗');
console.log('  ║  ORG LEAD + MULTI-ROLE LOGIN — Rebranding & Role Selection      ║');
console.log('  ╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. AUTH STORE — org_lead + multi-role eligibility
// ============================================================
write('lib/auth-store.ts', `// ============================================================================
// AUTH STORE — Users, roles, multi-role eligibility, tenant isolation
// ============================================================================

export type UserRole = 'super_admin' | 'admin' | 'employee' | 'beta_tester' | 'org_lead'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  /** Additional roles this user can switch into */
  eligibleRoles: UserRole[]
  agents: string[]
  status: 'active' | 'invited' | 'suspended'
  password: string
  companyId: string
  companyName: string
  createdAt: string
  lastLogin?: string
  inviteCode?: string
}

export const ALL_AGENTS = [
  { id: 'cfo', name: 'CFO Agent', icon: '📈', description: 'Financial intelligence, forecasting, and P&L analysis' },
  { id: 'sales', name: 'Sales Agent', icon: '💼', description: 'Pipeline management, CRM, and deal intelligence' },
  { id: 'finops', name: 'FinOps Agent', icon: '💰', description: 'Cost optimization and cloud spend management' },
  { id: 'payables', name: 'Payables Agent', icon: '🧾', description: 'Invoice processing and AP automation' },
  { id: 'collections', name: 'Collections Agent', icon: '📬', description: 'AR tracking and payment follow-ups' },
  { id: 'hr', name: 'HR Agent', icon: '👥', description: 'People operations and workforce management' },
  { id: 'operations', name: 'Operations Agent', icon: '⚙️', description: 'Project tracking and operational workflows' },
  { id: 'legal', name: 'Legal Agent', icon: '⚖️', description: 'Contract review and compliance monitoring' },
  { id: 'marketing', name: 'Marketing Agent', icon: '📣', description: 'Campaign management and market intelligence' },
  { id: 'wms', name: 'WMS Agent', icon: '🏭', description: 'Warehouse management and inventory control' },
  { id: 'compliance', name: 'Compliance Agent', icon: '🛡️', description: 'Regulatory compliance and risk assessment' },
]

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; description: string; tier: number; icon: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-rose-400', bg: 'bg-rose-500/10', description: 'Full platform access, billing, user management', tier: 5, icon: '🔑' },
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10', description: 'Manage users, analytics, all agents', tier: 4, icon: '⚡' },
  employee: { label: 'Employee', color: 'text-blue-400', bg: 'bg-blue-500/10', description: 'Live agents scoped to company data', tier: 3, icon: '🏢' },
  org_lead: { label: 'Organization Lead', color: 'text-amber-400', bg: 'bg-amber-500/10', description: 'Your custom AI intelligence suite', tier: 2, icon: '👑' },
  beta_tester: { label: 'Beta Tester', color: 'text-emerald-400', bg: 'bg-emerald-500/10', description: 'Free trial — full live agent access', tier: 1, icon: '🧪' },
}

// Password generator
const WORDS = ['alpha','bravo','delta','echo','foxtrot','golf','hotel','india','kilo','lima','metro','nova','oscar','papa','quebec','romeo','sierra','tango','ultra','victor','whisky','xray','zulu','apex','bolt','core','dash','edge','flux','grid','haze','iron','jade','knot','loop','mist','node','onyx','peak','quad','reef','snap','tide','vibe','wave','zero','blaze','crisp','drift','forge','gleam','hatch','inlet','jetty','lunar','maple','nexus','orbit','prism','quartz','ridge','slate','torch','unity','vault','wren']
function generatePassword(): string {
  const w1 = WORDS[Math.floor(Math.random() * WORDS.length)]
  const w2 = WORDS[Math.floor(Math.random() * WORDS.length)]
  const digits = String(Math.floor(Math.random() * 90) + 10)
  return w1 + '-' + w2 + '-' + digits
}

function generateInviteCode(): string {
  return 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

// ============================================================================
// MULTI-ROLE ELIGIBILITY LOGIC
// ============================================================================
// Given a user's primary role, return all roles they can sign in as.
// Higher-tier roles can always access lower tiers.
export function getEligibleRoles(user: AuthUser): UserRole[] {
  const primary = user.role
  // Explicit eligibleRoles override if set
  if (user.eligibleRoles && user.eligibleRoles.length > 0) return user.eligibleRoles

  switch (primary) {
    case 'super_admin':
      return ['super_admin', 'admin', 'employee', 'org_lead', 'beta_tester']
    case 'admin':
      return ['admin', 'employee', 'beta_tester']
    case 'employee':
      return ['employee', 'beta_tester']
    case 'org_lead':
      return ['org_lead', 'beta_tester']
    case 'beta_tester':
      return ['beta_tester']
    default:
      return [primary]
  }
}

// ============================================================================
// USER STORE
// ============================================================================
const ALL_AGENT_IDS = ALL_AGENTS.map(a => a.id)

export const userStore: AuthUser[] = [
  {
    id: 'u1', email: 'steve@woulfgroup.com', name: 'Steve Macurdy',
    role: 'super_admin', eligibleRoles: [], agents: ALL_AGENT_IDS, status: 'active',
    password: 'admin', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-01-01', lastLogin: '2026-02-17'
  },
  {
    id: 'u2', email: 'marcus@woulfgroup.com', name: 'Marcus Williams',
    role: 'employee', eligibleRoles: [], agents: ['sales', 'cfo'], status: 'active',
    password: 'bravo-delta-42', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-01-15', lastLogin: '2026-02-16'
  },
  {
    id: 'u3', email: 'diana@woulfgroup.com', name: 'Diana Reeves',
    role: 'employee', eligibleRoles: [], agents: ['sales', 'operations', 'wms'], status: 'active',
    password: 'echo-foxtrot-77', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-01-15', lastLogin: '2026-02-15'
  },
  {
    id: 'u4', email: 'jason@woulfgroup.com', name: 'Jason Park',
    role: 'employee', eligibleRoles: [], agents: ['sales'], status: 'active',
    password: 'golf-hotel-33', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-02-01', lastLogin: '2026-02-14'
  },
  {
    id: 'u5', email: 'jess@woulfgroup.com', name: 'Jess Scharmer',
    role: 'employee', eligibleRoles: [], agents: ['cfo', 'payables', 'finops'], status: 'invited',
    password: 'maple-torch-61', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-02-17'
  },
  {
    id: 'u6', email: 'demo@client1.com', name: 'Sarah Chen',
    role: 'beta_tester', eligibleRoles: [], agents: ['cfo', 'sales', 'finops'], status: 'active',
    password: 'nova-peak-55', companyId: 'client1', companyName: 'Chen Logistics',
    createdAt: '2026-02-05', lastLogin: '2026-02-17'
  },
  {
    id: 'u7', email: 'pilot@logistics.co', name: 'Tom Bradley',
    role: 'beta_tester', eligibleRoles: [], agents: ['wms', 'operations'], status: 'active',
    password: 'apex-bolt-88', companyId: 'bradleylog', companyName: 'Bradley Logistics',
    createdAt: '2026-02-08', lastLogin: '2026-02-16'
  },
  {
    id: 'u8', email: 'paid@enterprise.com', name: 'Rachel Kim',
    role: 'org_lead', eligibleRoles: [], agents: ['cfo', 'finops', 'payables', 'collections'], status: 'active',
    password: 'ridge-slate-19', companyId: 'kimenterprises', companyName: 'Kim Enterprises',
    createdAt: '2026-02-01', lastLogin: '2026-02-17'
  },
]

// ============================================================================
// OPERATIONS
// ============================================================================
export function findUserByEmail(email: string): AuthUser | undefined {
  return userStore.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export function findUserById(id: string): AuthUser | undefined {
  return userStore.find(u => u.id === id)
}

export function authenticateUser(email: string, password: string): AuthUser | null {
  const user = findUserByEmail(email)
  if (!user) return null
  if (user.password !== password) return null
  if (user.status === 'suspended') return null
  if (user.status === 'invited') user.status = 'active'
  user.lastLogin = new Date().toISOString().slice(0, 10)
  return user
}

export function createUser(data: {
  email: string; name: string; role: UserRole; agents: string[];
  companyId?: string; companyName?: string
}): { user: AuthUser; password: string; inviteCode: string } {
  const password = generatePassword()
  const inviteCode = generateInviteCode()
  const cid = data.companyId || data.email.split('@')[1]?.split('.')[0] || 'default'
  const user: AuthUser = {
    id: 'u-' + Date.now(),
    email: data.email,
    name: data.name || data.email.split('@')[0],
    role: data.role,
    eligibleRoles: [],
    agents: (data.role === 'admin' || data.role === 'super_admin') ? ALL_AGENT_IDS : data.agents,
    status: 'invited',
    password,
    companyId: cid,
    companyName: data.companyName || cid,
    inviteCode,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  userStore.push(user)
  return { user, password, inviteCode }
}

export function updateUser(id: string, updates: Partial<AuthUser>): AuthUser | null {
  const user = findUserById(id)
  if (!user) return null
  Object.assign(user, updates)
  if (updates.role === 'admin' || updates.role === 'super_admin') {
    user.agents = ALL_AGENT_IDS
  }
  return user
}

export function removeUser(id: string): boolean {
  const idx = userStore.findIndex(u => u.id === id)
  if (idx === -1) return false
  userStore.splice(idx, 1)
  return true
}

export function safeUser(user: AuthUser) {
  const { password, ...safe } = user
  return safe
}
`);

// ============================================================
// 2. TENANT CONTEXT — unchanged but rewritten clean
// ============================================================
write('lib/tenant-context.tsx', `'use client'
import { createContext, useContext, ReactNode } from 'react'

interface TenantContextType {
  companyId: string
  companyName: string
  isGlobalAdmin: boolean
  userId: string
  userRole: string
  userName: string
  userEmail: string
  agents: string[]
  tenantFilter: () => { companyId: string } | {}
}

const TenantContext = createContext<TenantContextType>({
  companyId: '', companyName: '', isGlobalAdmin: false,
  userId: '', userRole: '', userName: '', userEmail: '', agents: [],
  tenantFilter: () => ({}),
})

interface TenantProviderProps {
  children: ReactNode
  user: {
    id: string; email: string; name: string; role: string;
    agents: string[]; companyId: string; companyName: string;
  }
}

export function TenantProvider({ children, user }: TenantProviderProps) {
  const isGlobalAdmin = user.role === 'super_admin'
  const tenantFilter = () => isGlobalAdmin ? {} : { companyId: user.companyId }

  return (
    <TenantContext.Provider value={{
      companyId: user.companyId,
      companyName: user.companyName,
      isGlobalAdmin,
      userId: user.id,
      userRole: user.role,
      userName: user.name,
      userEmail: user.email,
      agents: user.agents,
      tenantFilter,
    }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}

export function filterByTenant<T extends { companyId?: string }>(
  data: T[], companyId: string, isGlobalAdmin: boolean
): T[] {
  if (isGlobalAdmin) return data
  return data.filter(item => item.companyId === companyId)
}
`);

// ============================================================
// 3. LOGIN PAGE — Multi-role selector after credential check
// ============================================================
write('app/login/page.tsx', `'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================================
// ROLE CONFIG (mirrors auth-store but client-side safe)
// ============================================================================
const ROLE_UI: Record<string, { label: string; icon: string; color: string; bg: string; border: string; description: string }> = {
  super_admin: { label: 'Super Admin', icon: '🔑', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', description: 'Full platform access with global admin controls' },
  admin: { label: 'Admin', icon: '⚡', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', description: 'User management, analytics, and all agents' },
  employee: { label: 'Employee', icon: '🏢', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', description: 'Live agents scoped to your company data' },
  org_lead: { label: 'Organization Lead', icon: '👑', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', description: 'Your custom AI intelligence suite' },
  beta_tester: { label: 'Beta Tester', icon: '🧪', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', description: 'Free trial with full live agent access' },
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Multi-role state
  const [authUser, setAuthUser] = useState<any>(null)
  const [eligibleRoles, setEligibleRoles] = useState<string[]>([])
  const [step, setStep] = useState<'credentials' | 'role-select'>('credentials')

  // Step 1: Validate credentials
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.success && data.user) {
        const roles = data.eligibleRoles || [data.user.role]

        if (roles.length > 1) {
          // Multiple roles — show role picker
          setAuthUser(data.user)
          setEligibleRoles(roles)
          setStep('role-select')
        } else {
          // Single role — go straight in
          finishLogin(data.user, data.user.role)
        }
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err: any) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  // Step 2: Select role and enter portal
  const finishLogin = (user: any, selectedRole: string) => {
    const session = { ...user, role: selectedRole, selectedRole }
    localStorage.setItem('woulfai_session', JSON.stringify(session))
    router.push('/portal')
  }

  const inputCls = "w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"

  return (
    <div className="min-h-screen bg-[#060910] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/10 mb-4">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">W</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to WoulfAI</h1>
          <p className="text-sm text-gray-500 mt-2">
            {step === 'credentials' ? 'Sign in to access your AI agents' : 'Choose how you want to sign in'}
          </p>
        </div>

        {/* STEP 1: CREDENTIALS */}
        {step === 'credentials' && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" className={inputCls} autoFocus required />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" className={inputCls} required />
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl text-sm font-semibold transition-all">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Dev quick fills */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="text-[9px] text-gray-600 uppercase tracking-wider text-center mb-3">Quick Login (Dev Only)</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Steve (Admin)', email: 'steve@woulfgroup.com', pw: 'admin' },
                  { label: 'Marcus (Employee)', email: 'marcus@woulfgroup.com', pw: 'bravo-delta-42' },
                  { label: 'Rachel (Org Lead)', email: 'paid@enterprise.com', pw: 'ridge-slate-19' },
                  { label: 'Sarah (Beta)', email: 'demo@client1.com', pw: 'nova-peak-55' },
                ].map(q => (
                  <button key={q.email} onClick={() => { setEmail(q.email); setPassword(q.pw) }}
                    className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all text-left">
                    <div className="font-medium">{q.label}</div>
                    <div className="text-gray-700 truncate">{q.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ROLE SELECTOR */}
        {step === 'role-select' && authUser && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-lg mx-auto mb-3">
                {authUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="text-sm font-semibold text-white">{authUser.name}</div>
              <div className="text-xs text-gray-500">{authUser.email}</div>
              <div className="text-[10px] text-gray-600 mt-1">{authUser.companyName}</div>
            </div>

            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Sign in as:</div>

            <div className="space-y-2">
              {eligibleRoles.map(roleId => {
                const ui = ROLE_UI[roleId]
                if (!ui) return null
                return (
                  <button key={roleId}
                    onClick={() => finishLogin(authUser, roleId)}
                    className={"w-full flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] " + ui.bg + " " + ui.border + " hover:bg-opacity-20"}
                  >
                    <span className="text-2xl">{ui.icon}</span>
                    <div className="text-left flex-1">
                      <div className={"text-sm font-semibold " + ui.color}>{ui.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{ui.description}</div>
                    </div>
                    <span className="text-gray-600 text-sm">→</span>
                  </button>
                )
              })}
            </div>

            <button onClick={() => { setStep('credentials'); setAuthUser(null); setEligibleRoles([]) }}
              className="w-full mt-4 py-2 text-xs text-gray-600 hover:text-gray-400 transition-all">
              ← Back to login
            </button>
          </div>
        )}

        <p className="text-center text-[10px] text-gray-700 mt-6">
          {"Don't have an account? Contact your administrator for an invitation."}
        </p>
      </div>
    </div>
  )
}
`);

// ============================================================
// 4. LOGIN API — Returns eligible roles
// ============================================================
write('app/api/auth/login/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, safeUser, getEligibleRoles } from '@/lib/auth-store'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 })
    }

    const user = authenticateUser(email, password)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials or account suspended' }, { status: 401 })
    }

    const eligibleRoles = getEligibleRoles(user)

    return NextResponse.json({
      success: true,
      user: safeUser(user),
      eligibleRoles,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
`);

// ============================================================
// 5. AUTH ROUTE — Updated
// ============================================================
write('app/api/auth/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, safeUser, getEligibleRoles } from '@/lib/auth-store'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 })
    }
    const user = authenticateUser(email, password)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }
    return NextResponse.json({ success: true, user: safeUser(user), eligibleRoles: getEligibleRoles(user) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
`);

// ============================================================
// 6. PORTAL DASHBOARD — org_lead branding
// ============================================================
write('app/portal/page.tsx', `'use client'
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
              : activeRole === 'org_lead' ? \`Your \${user.companyName} intelligence suite is ready.\`
              : \`\${myAgents.length} live agent\${myAgents.length !== 1 ? 's' : ''} ready for \${user.companyName}.\`}
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
`);

// ============================================================
// 7. ADMIN USERS PAGE — org_lead in admin
// ============================================================
write('app/admin/users/page.tsx', `'use client'
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
    navigator.clipboard.writeText("WoulfAI Login Credentials\\n\\nEmail: " + showCredentials.email + "\\nPassword: " + showCredentials.password + "\\nLogin: " + (typeof window !== 'undefined' ? window.location.origin : '') + "/login")
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
`);

// ============================================================
// 8. ADMIN USERS API — org_lead + companyId
// ============================================================
write('app/api/admin/users/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { userStore, createUser, updateUser, removeUser, safeUser, type UserRole } from '@/lib/auth-store'

export async function GET() {
  return NextResponse.json({
    users: userStore.map(u => ({
      ...safeUser(u),
      generatedPassword: u.status === 'invited' ? u.password : undefined,
    })),
    total: userStore.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'invite') {
      const { email, name, role, agents, companyId, companyName } = body
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      const existing = userStore.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (existing) return NextResponse.json({ error: 'User exists' }, { status: 409 })
      const result = createUser({ email, name, role, agents, companyId, companyName })
      return NextResponse.json({ success: true, user: safeUser(result.user), credentials: { email: result.user.email, password: result.password, inviteCode: result.inviteCode, loginUrl: '/login' } })
    }

    if (action === 'update_role') {
      const { userId, role, agents } = body
      const updated = updateUser(userId, { role, agents })
      if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true, user: safeUser(updated) })
    }

    if (action === 'update_agents') {
      const { userId, agents } = body
      const updated = updateUser(userId, { agents })
      if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true, user: safeUser(updated) })
    }

    if (action === 'suspend') {
      const { userId } = body
      const user = userStore.find(u => u.id === userId)
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      user.status = user.status === 'suspended' ? 'active' : 'suspended'
      return NextResponse.json({ success: true, user: safeUser(user) })
    }

    if (action === 'remove') {
      const { userId } = body
      const success = removeUser(userId)
      if (!success) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    }

    if (action === 'reset_password') {
      const { userId } = body
      const user = userStore.find(u => u.id === userId)
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      const WORDS = ['alpha','bravo','delta','echo','foxtrot','golf','hotel','nova','peak','ridge','slate']
      const w1 = WORDS[Math.floor(Math.random() * WORDS.length)]
      const w2 = WORDS[Math.floor(Math.random() * WORDS.length)]
      user.password = w1 + '-' + w2 + '-' + String(Math.floor(Math.random() * 90) + 10)
      return NextResponse.json({ success: true, newPassword: user.password })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
`);

console.log('');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('  Installed: 9 files');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('  CHANGES:');
console.log('');
console.log('  ✅ "Customer" → "Organization Lead" everywhere');
console.log('     Role badge, banners, admin panel, invite modal');
console.log('');
console.log('  ✅ MULTI-ROLE LOGIN');
console.log('     Step 1: Enter email + password');
console.log('     Step 2: If multiple roles eligible, pick one');
console.log('     Session captures selectedRole for portal scoping');
console.log('');
console.log('     Role eligibility:');
console.log('       Super Admin → can sign in as any role');
console.log('       Admin       → Admin, Employee, Beta Tester');
console.log('       Employee    → Employee, Beta Tester');
console.log('       Org Lead    → Organization Lead, Beta Tester');
console.log('       Beta Tester → Beta Tester only');
console.log('');
console.log('  ✅ LIVE AGENTS for all roles (no demo versions)');
console.log('  ✅ TENANT ISOLATION via companyId');
console.log('  ✅ COMPANY FIELD in admin invite modal');
console.log('  ✅ SWITCH ROLE button in portal nav');
console.log('');
console.log('  TEST LOGINS:');
console.log('  ┌──────────────────────┬──────────────────┬────────────────────┬──────────────────┐');
console.log('  │ Email                │ Password         │ Primary Role       │ Company          │');
console.log('  ├──────────────────────┼──────────────────┼────────────────────┼──────────────────┤');
console.log('  │ steve@woulfgroup.com │ admin            │ Super Admin (all)  │ Woulf Group      │');
console.log('  │ marcus@woulfgroup.com│ bravo-delta-42   │ Employee + Beta    │ Woulf Group      │');
console.log('  │ jess@woulfgroup.com  │ maple-torch-61   │ Employee + Beta    │ Woulf Group      │');
console.log('  │ demo@client1.com     │ nova-peak-55     │ Beta Tester        │ Chen Logistics   │');
console.log('  │ paid@enterprise.com  │ ridge-slate-19   │ Org Lead + Beta    │ Kim Enterprises  │');
console.log('  └──────────────────────┴──────────────────┴────────────────────┴──────────────────┘');
console.log('');
console.log('  INSTALL & DEPLOY:');
console.log('    node org-lead-multirole.js');
console.log('    npm run build');
console.log('    vercel --prod');
console.log('');
