#!/usr/bin/env node
/**
 * USER PORTAL GATING — Real Auth + Per-User Agent Access
 *
 * Connects admin user management to real authentication:
 *   1. Real invite flow — admin generates credentials, gives to user
 *   2. Per-user agent gating — login only shows assigned agents
 *   3. Personalized dashboard — role-aware with banners
 *   4. Auth context — session persists across pages
 *   5. Password generation — unique per invite
 *
 * Files created:
 *   - lib/auth-store.ts           — Shared user store + password gen
 *   - lib/auth-context.tsx        — React context for current session
 *   - app/login/page.tsx          — Real login with per-user auth
 *   - app/portal/page.tsx         — Gated dashboard (only assigned agents)
 *   - app/portal/layout.tsx       — Portal layout with session guard
 *   - app/admin/users/page.tsx    — Updated with credential generation
 *   - app/api/auth/login/route.ts — Login API endpoint
 *   - app/api/auth/me/route.ts    — Session check endpoint
 *
 * Run from: ai-agent-platform root
 * Usage: node user-portal-gating.js
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
console.log('  ║  USER PORTAL GATING — Real Auth + Per-User Agent Access         ║');
console.log('  ╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. SHARED AUTH STORE — Single source of truth for users
// ============================================================
write('lib/auth-store.ts', `// ============================================================================
// AUTH STORE — Shared user store with password management
// ============================================================================
// This is an in-memory store. In production, replace with Supabase/Postgres.
// All modules (login API, admin page, portal) share this single store.

export type UserRole = 'super_admin' | 'admin' | 'employee' | 'beta_tester' | 'customer'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  agents: string[]
  status: 'active' | 'invited' | 'suspended'
  password: string
  createdAt: string
  lastLogin?: string
  inviteCode?: string
}

export const ALL_AGENTS = [
  { id: 'cfo', name: 'CFO Agent', icon: '📈', description: 'Financial intelligence, forecasting, and P&L analysis', route: '/agents/cfo' },
  { id: 'sales', name: 'Sales Agent', icon: '💼', description: 'Pipeline management, CRM, and deal intelligence', route: '/agents/sales' },
  { id: 'finops', name: 'FinOps Agent', icon: '💰', description: 'Cost optimization and cloud spend management', route: '/agents/finops' },
  { id: 'payables', name: 'Payables Agent', icon: '🧾', description: 'Invoice processing and AP automation', route: '/agents/payables' },
  { id: 'collections', name: 'Collections Agent', icon: '📬', description: 'AR tracking and payment follow-ups', route: '/agents/collections' },
  { id: 'hr', name: 'HR Agent', icon: '👥', description: 'People operations and workforce management', route: '/agents/hr' },
  { id: 'operations', name: 'Operations Agent', icon: '⚙️', description: 'Project tracking and operational workflows', route: '/agents/operations' },
  { id: 'legal', name: 'Legal Agent', icon: '⚖️', description: 'Contract review and compliance monitoring', route: '/agents/legal' },
  { id: 'marketing', name: 'Marketing Agent', icon: '📣', description: 'Campaign management and market intelligence', route: '/agents/marketing' },
  { id: 'wms', name: 'WMS Agent', icon: '🏭', description: 'Warehouse management and inventory control', route: '/agents/wms' },
  { id: 'compliance', name: 'Compliance Agent', icon: '🛡️', description: 'Regulatory compliance and risk assessment', route: '/agents/compliance' },
]

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; description: string; tier: number }> = {
  super_admin: { label: 'Super Admin', color: 'text-rose-400', bg: 'bg-rose-500/10', description: 'Full platform access, billing, user management', tier: 5 },
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10', description: 'Manage users, view analytics, all agents', tier: 4 },
  employee: { label: 'Employee', color: 'text-blue-400', bg: 'bg-blue-500/10', description: 'Access to assigned agents only', tier: 3 },
  beta_tester: { label: 'Beta Tester', color: 'text-emerald-400', bg: 'bg-emerald-500/10', description: 'Free trial — testing period', tier: 2 },
  customer: { label: 'Customer', color: 'text-amber-400', bg: 'bg-amber-500/10', description: 'Paid subscription', tier: 1 },
}

// Password generator — 3 words + 2 digits
const WORDS = ['alpha','bravo','delta','echo','foxtrot','golf','hotel','india','kilo','lima','metro','nova','oscar','papa','quebec','romeo','sierra','tango','ultra','victor','whisky','xray','zulu','apex','bolt','core','dash','edge','flux','grid','haze','iron','jade','knot','loop','mist','node','onyx','peak','quad','reef','snap','tide','vibe','wave','zero','blaze','crisp','drift','forge','gleam','hatch','inlet','jetty','lunar','maple','nexus','orbit','prism','quartz','ridge','slate','torch','unity','vault','wren']
function generatePassword(): string {
  const w1 = WORDS[Math.floor(Math.random() * WORDS.length)]
  const w2 = WORDS[Math.floor(Math.random() * WORDS.length)]
  const digits = String(Math.floor(Math.random() * 90) + 10)
  return w1 + '-' + w2 + '-' + digits
}

// Generate invite code
function generateInviteCode(): string {
  return 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

// ============================================================================
// USER STORE (in-memory — replace with DB in production)
// ============================================================================
const ALL_AGENT_IDS = ALL_AGENTS.map(a => a.id)

export const userStore: AuthUser[] = [
  {
    id: 'u1', email: 'steve@woulfgroup.com', name: 'Steve Macurdy',
    role: 'super_admin', agents: ALL_AGENT_IDS, status: 'active',
    password: 'admin', createdAt: '2026-01-01', lastLogin: '2026-02-17'
  },
  {
    id: 'u2', email: 'marcus@woulfgroup.com', name: 'Marcus Williams',
    role: 'employee', agents: ['sales', 'cfo'], status: 'active',
    password: 'bravo-delta-42', createdAt: '2026-01-15', lastLogin: '2026-02-16'
  },
  {
    id: 'u3', email: 'diana@woulfgroup.com', name: 'Diana Reeves',
    role: 'employee', agents: ['sales', 'operations', 'wms'], status: 'active',
    password: 'echo-foxtrot-77', createdAt: '2026-01-15', lastLogin: '2026-02-15'
  },
  {
    id: 'u4', email: 'jason@woulfgroup.com', name: 'Jason Park',
    role: 'employee', agents: ['sales'], status: 'active',
    password: 'golf-hotel-33', createdAt: '2026-02-01', lastLogin: '2026-02-14'
  },
  {
    id: 'u5', email: 'demo@client1.com', name: 'Sarah Chen',
    role: 'beta_tester', agents: ['cfo', 'sales', 'finops'], status: 'active',
    password: 'nova-peak-55', createdAt: '2026-02-05', lastLogin: '2026-02-17'
  },
  {
    id: 'u6', email: 'pilot@logistics.co', name: 'Tom Bradley',
    role: 'beta_tester', agents: ['wms', 'operations'], status: 'active',
    password: 'apex-bolt-88', createdAt: '2026-02-08', lastLogin: '2026-02-16'
  },
  {
    id: 'u7', email: 'paid@enterprise.com', name: 'Rachel Kim',
    role: 'customer', agents: ['cfo', 'finops', 'payables', 'collections'], status: 'active',
    password: 'ridge-slate-19', createdAt: '2026-02-01', lastLogin: '2026-02-17'
  },
]

// ============================================================================
// STORE OPERATIONS
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
  user.lastLogin = new Date().toISOString().slice(0, 10)
  return user
}

export function createUser(data: {
  email: string; name: string; role: UserRole; agents: string[]
}): { user: AuthUser; password: string; inviteCode: string } {
  const password = generatePassword()
  const inviteCode = generateInviteCode()
  const user: AuthUser = {
    id: 'u-' + Date.now(),
    email: data.email,
    name: data.name || data.email.split('@')[0],
    role: data.role,
    agents: (data.role === 'admin' || data.role === 'super_admin') ? ALL_AGENT_IDS : data.agents,
    status: 'invited',
    password,
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

// Safe user (strip password for client)
export function safeUser(user: AuthUser) {
  const { password, ...safe } = user
  return safe
}
`);

// ============================================================
// 2. AUTH CONTEXT — React context for current session
// ============================================================
write('lib/auth-context.tsx', `'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  agents: string[]
  status: string
}

interface AuthContextType {
  user: SessionUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAdmin: boolean
  hasAgent: (agentId: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isAdmin: false,
  hasAgent: () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('woulfai_session')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUser(parsed)
      }
    } catch {}
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success && data.user) {
        setUser(data.user)
        localStorage.setItem('woulfai_session', JSON.stringify(data.user))
        return { success: true }
      }
      return { success: false, error: data.error || 'Login failed' }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('woulfai_session')
  }

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin'
  const hasAgent = (agentId: string) => {
    if (!user) return false
    if (isAdmin) return true
    return user.agents.includes(agentId)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, hasAgent }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
`);

// ============================================================
// 3. LOGIN API — Real authentication endpoint
// ============================================================
write('app/api/auth/login/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, safeUser } from '@/lib/auth-store'

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

    return NextResponse.json({ success: true, user: safeUser(user) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
`);

// ============================================================
// 4. SESSION CHECK API
// ============================================================
write('app/api/auth/me/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { findUserById, safeUser } from '@/lib/auth-store'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    const user = findUserById(userId)
    if (!user || user.status === 'suspended') {
      return NextResponse.json({ success: false, error: 'Session invalid' }, { status: 401 })
    }
    return NextResponse.json({ success: true, user: safeUser(user) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
`);

// ============================================================
// 5. ADMIN USERS API — Updated to use shared store
// ============================================================
write('app/api/admin/users/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { userStore, createUser, updateUser, removeUser, safeUser, type UserRole } from '@/lib/auth-store'

export async function GET() {
  return NextResponse.json({
    users: userStore.map(u => ({
      ...safeUser(u),
      // Include password only for admin viewing of invited users
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
      const { email, name, role, agents } = body
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      const existing = userStore.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (existing) return NextResponse.json({ error: 'User exists' }, { status: 409 })

      const result = createUser({
        email,
        name: name || email.split('@')[0],
        role: role || 'beta_tester',
        agents: agents || [],
      })

      return NextResponse.json({
        success: true,
        user: safeUser(result.user),
        credentials: {
          email: result.user.email,
          password: result.password,
          inviteCode: result.inviteCode,
          loginUrl: '/login',
        }
      })
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
      const digits = String(Math.floor(Math.random() * 90) + 10)
      user.password = w1 + '-' + w2 + '-' + digits
      return NextResponse.json({ success: true, newPassword: user.password })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
`);

// ============================================================
// 6. LOGIN PAGE — Real auth with email + password
// ============================================================
write('app/login/page.tsx', `'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        localStorage.setItem('woulfai_session', JSON.stringify(data.user))

        // Route based on role
        if (data.user.role === 'super_admin' || data.user.role === 'admin') {
          router.push('/portal')
        } else {
          router.push('/portal')
        }
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err: any) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"

  return (
    <div className="min-h-screen bg-[#060910] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/10 mb-4">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">W</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to WoulfAI</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to access your AI agents</p>
        </div>

        {/* Login card */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={inputCls}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={inputCls}
                required
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl text-sm font-semibold transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick login helpers — admin only, remove in production */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="text-[9px] text-gray-600 uppercase tracking-wider text-center mb-3">Quick Login (Dev Only)</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Steve (Admin)', email: 'steve@woulfgroup.com', pw: 'admin' },
                { label: 'Marcus (Employee)', email: 'marcus@woulfgroup.com', pw: 'bravo-delta-42' },
                { label: 'Sarah (Beta)', email: 'demo@client1.com', pw: 'nova-peak-55' },
                { label: 'Rachel (Customer)', email: 'paid@enterprise.com', pw: 'ridge-slate-19' },
              ].map(q => (
                <button
                  key={q.email}
                  onClick={() => { setEmail(q.email); setPassword(q.pw) }}
                  className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all text-left"
                >
                  <div className="font-medium">{q.label}</div>
                  <div className="text-gray-700 truncate">{q.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-6">
          Don&apos;t have an account? Contact your administrator for an invitation.
        </p>
      </div>
    </div>
  )
}
`);

// ============================================================
// 7. PORTAL LAYOUT — Session guard wrapper
// ============================================================
write('app/portal/layout.tsx', `'use client'
import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface SessionUser {
  id: string; email: string; name: string; role: string; agents: string[]
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('woulfai_session')
      if (!saved) {
        router.replace('/login')
        return
      }
      const parsed = JSON.parse(saved)
      if (!parsed?.id || !parsed?.email) {
        localStorage.removeItem('woulfai_session')
        router.replace('/login')
        return
      }
      setUser(parsed)
    } catch {
      router.replace('/login')
    }
    setChecking(false)
  }, [router])

  if (checking || !user) {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
`);

// ============================================================
// 8. PORTAL DASHBOARD — Per-user agent access
// ============================================================
write('app/portal/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================
interface SessionUser {
  id: string; email: string; name: string; role: string; agents: string[]; status?: string
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
  beta_tester: { label: 'Beta Tester', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  customer: { label: 'Customer', color: 'text-amber-400', bg: 'bg-amber-500/10' },
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function PortalDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [time, setTime] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('woulfai_session')
      if (saved) setUser(JSON.parse(saved))
    } catch {}

    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const iv = setInterval(tick, 60000)
    return () => clearInterval(iv)
  }, [])

  if (!user) return null

  const isAdmin = user.role === 'super_admin' || user.role === 'admin'
  const myAgents = isAdmin
    ? ALL_AGENTS
    : ALL_AGENTS.filter(a => user.agents.includes(a.id))

  const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.customer
  const firstName = user.name.split(' ')[0]
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  const logout = () => {
    localStorage.removeItem('woulfai_session')
    router.push('/login')
  }

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
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">{time}</span>
            {isAdmin && (
              <button onClick={() => router.push('/admin/users')}
                className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                Admin Console
              </button>
            )}
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
        {/* Role-specific banners */}
        {user.role === 'beta_tester' && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-emerald-400">🧪 Free Beta Access</div>
              <div className="text-xs text-gray-500 mt-1">You have complimentary access during the testing period. No payment required.</div>
            </div>
            <span className="text-[10px] text-emerald-400/60 bg-emerald-500/10 px-3 py-1 rounded-full">Beta Program</span>
          </div>
        )}

        {user.role === 'customer' && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-amber-400">💳 Active Subscription</div>
              <div className="text-xs text-gray-500 mt-1">Your account is active with access to {myAgents.length} agent{myAgents.length !== 1 ? 's' : ''}.</div>
            </div>
            <button className="text-[10px] text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all">
              Manage Billing
            </button>
          </div>
        )}

        {user.role === 'employee' && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-blue-400">🏢 Employee Access</div>
              <div className="text-xs text-gray-500 mt-1">You have access to {myAgents.length} agent{myAgents.length !== 1 ? 's' : ''} assigned by your administrator.</div>
            </div>
            <span className="text-[10px] text-blue-400/60 bg-blue-500/10 px-3 py-1 rounded-full">Woulf Group</span>
          </div>
        )}

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {firstName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin
              ? 'You have full access to all agents and the admin console.'
              : \`You have access to \${myAgents.length} AI agent\${myAgents.length !== 1 ? 's' : ''}.\`}
          </p>
        </div>

        {/* Agent Grid */}
        {myAgents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => {
                  // Navigate to agent — currently uses hash routing for demo
                  // In production, these would be real routes
                  window.location.href = '/portal/agent/' + agent.id
                }}
                className={"group bg-gradient-to-br " + agent.color + " border " + agent.border + " rounded-2xl p-6 text-left hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-black/20"}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{agent.icon}</span>
                  <span className={"text-[10px] font-medium px-2 py-0.5 rounded bg-black/20 " + agent.accent}>Active</span>
                </div>
                <h3 className="text-base font-semibold mt-4 group-hover:text-white transition-colors">{agent.name}</h3>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{agent.description}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  <span>Launch Agent</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-400">No Agents Assigned</h3>
            <p className="text-sm text-gray-600 mt-2">Contact your administrator to get access to AI agents.</p>
          </div>
        )}

        {/* Quick Actions for Admins */}
        {isAdmin && (
          <div className="border-t border-white/5 pt-8">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Admin Quick Actions</h2>
            <div className="flex gap-3">
              <button onClick={() => router.push('/admin/users')}
                className="px-4 py-3 bg-[#0A0E15] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                👥 Manage Users
              </button>
              <button onClick={() => router.push('/admin')}
                className="px-4 py-3 bg-[#0A0E15] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                📊 Analytics Dashboard
              </button>
              <button onClick={() => router.push('/admin/pricing')}
                className="px-4 py-3 bg-[#0A0E15] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                💰 Manage Pricing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
`);

// ============================================================
// 9. AGENT PAGE — Placeholder for launched agents
// ============================================================
write('app/portal/agent/[id]/page.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const AGENTS: Record<string, { name: string; icon: string; color: string }> = {
  cfo: { name: 'CFO Agent', icon: '📈', color: 'emerald' },
  sales: { name: 'Sales Agent', icon: '💼', color: 'blue' },
  finops: { name: 'FinOps Agent', icon: '💰', color: 'amber' },
  payables: { name: 'Payables Agent', icon: '🧾', color: 'orange' },
  collections: { name: 'Collections Agent', icon: '📬', color: 'rose' },
  hr: { name: 'HR Agent', icon: '👥', color: 'violet' },
  operations: { name: 'Operations Agent', icon: '⚙️', color: 'slate' },
  legal: { name: 'Legal Agent', icon: '⚖️', color: 'cyan' },
  marketing: { name: 'Marketing Agent', icon: '📣', color: 'pink' },
  wms: { name: 'WMS Agent', icon: '🏭', color: 'teal' },
  compliance: { name: 'Compliance Agent', icon: '🛡️', color: 'indigo' },
}

export default function AgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params?.id as string
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('woulfai_session')
      if (!saved) { router.replace('/login'); return }
      const parsed = JSON.parse(saved)
      setUser(parsed)

      // Check agent access
      const isAdmin = parsed.role === 'super_admin' || parsed.role === 'admin'
      if (!isAdmin && !parsed.agents.includes(agentId)) {
        router.replace('/portal')
      }
    } catch { router.replace('/login') }
  }, [agentId, router])

  const agent = AGENTS[agentId]
  if (!agent || !user) return null

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal')}
              className="text-xs text-gray-500 hover:text-white transition-all">
              ← Back to Portal
            </button>
            <span className="text-gray-700">|</span>
            <span className="text-xl">{agent.icon}</span>
            <span className="text-sm font-semibold">{agent.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">{user.name}</span>
            <button onClick={() => { localStorage.removeItem('woulfai_session'); router.push('/login') }}
              className="text-xs text-gray-600 hover:text-rose-400 transition-all">Sign Out</button>
          </div>
        </div>
      </div>

      {/* Agent workspace */}
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="text-6xl mb-6">{agent.icon}</div>
        <h1 className="text-3xl font-bold mb-3">{agent.name}</h1>
        <p className="text-gray-500 mb-8">This agent workspace is ready for integration.</p>

        <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-8 max-w-lg mx-auto text-left">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-4">Agent Status</div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="text-emerald-400 font-medium">● Online</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Access Level</span>
              <span className="text-white font-medium">{user.role === 'super_admin' ? 'Full Access' : 'Standard'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">User</span>
              <span className="text-white font-medium">{user.email}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-xs text-gray-600">
              This is where the live {agent.name.toLowerCase()} interface will load.
              Connect to your data sources to activate real-time functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
`);

// ============================================================
// 10. UPDATED ADMIN USERS PAGE — With credential display
// ============================================================
write('app/admin/users/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  generatedPassword?: string
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
// COMPONENT
// ============================================================================
export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')
  const [showAgentPicker, setShowAgentPicker] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Invite form
  const [showInvite, setShowInvite] = useState(false)
  const [invEmail, setInvEmail] = useState('')
  const [invName, setInvName] = useState('')
  const [invRole, setInvRole] = useState<UserRole>('beta_tester')
  const [invAgents, setInvAgents] = useState<string[]>([])

  // Credential display after invite
  const [showCredentials, setShowCredentials] = useState<{ email: string; password: string; inviteCode: string } | null>(null)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500) }

  // Load users from API
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch {}
    setLoading(false)
  }

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
  const updateRole = async (userId: string, newRole: UserRole) => {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_role', userId, role: newRole }),
    })
    fetchUsers()
    show('Role updated')
  }

  const updateAgents = async (userId: string, agents: string[]) => {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_agents', userId, agents }),
    })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, agents } : u))
  }

  const toggleAgent = (userId: string, agentId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return
    const has = user.agents.includes(agentId)
    const next = has ? user.agents.filter(a => a !== agentId) : [...user.agents, agentId]
    updateAgents(userId, next)
  }

  const suspendUser = async (userId: string) => {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'suspend', userId }),
    })
    fetchUsers()
    show('User status updated')
  }

  const removeUser = async (userId: string) => {
    if (userId === 'u1') { show('Cannot remove super admin'); return }
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', userId }),
    })
    fetchUsers()
    show('User removed')
  }

  const resetPassword = async (userId: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_password', userId }),
    })
    const data = await res.json()
    if (data.newPassword) {
      const user = users.find(u => u.id === userId)
      setShowCredentials({ email: user?.email || '', password: data.newPassword, inviteCode: '' })
      show('Password reset')
    }
  }

  const inviteUser = async () => {
    if (!invEmail.trim()) { show('Email is required'); return }

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'invite',
        email: invEmail.trim(),
        name: invName.trim() || invEmail.split('@')[0],
        role: invRole,
        agents: (invRole === 'admin' || invRole === 'super_admin') ? ALL_AGENTS.map(a => a.id) : invAgents,
      }),
    })
    const data = await res.json()

    if (data.error) { show(data.error); return }

    if (data.credentials) {
      setShowCredentials(data.credentials)
    }

    setInvEmail(''); setInvName(''); setInvRole('beta_tester'); setInvAgents([]); setShowInvite(false)
    fetchUsers()
    show('User invited — credentials generated')
  }

  const copyCredentials = () => {
    if (!showCredentials) return
    const text = \`WoulfAI Login Credentials\\n\\nEmail: \${showCredentials.email}\\nPassword: \${showCredentials.password}\\nLogin URL: \${window.location.origin}/login\\n\\nPlease change your password after first login.\`
    navigator.clipboard.writeText(text)
    show('Credentials copied to clipboard!')
  }

  const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"
  const selectCls = "px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500/30 focus:outline-none"

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-500 text-sm">Loading users...</div>

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold">Users & Roles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage access, roles, and agent permissions for all users</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/portal')}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-sm hover:bg-white/10">
            ← Portal
          </button>
          <button onClick={() => setShowInvite(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500">
            + Invite User
          </button>
        </div>
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
              return (
                <tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
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

                  <td className="p-4">
                    <span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (
                      user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      user.status === 'invited' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-rose-500/10 text-rose-400'
                    )}>{user.status}</span>
                  </td>

                  <td className="p-4 text-xs text-gray-500">{user.lastLogin || '—'}</td>

                  <td className="p-4 text-right">
                    {user.id !== 'u1' && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => resetPassword(user.id)}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                          Reset PW
                        </button>
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
                Generate Credentials & Invite
              </button>
              <button onClick={() => setShowInvite(false)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS MODAL — Shows after invite or password reset */}
      {showCredentials && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowCredentials(null)}>
          <div className="bg-[#0D1117] border border-emerald-500/20 rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-3xl mb-2">🔑</div>
              <h2 className="text-lg font-bold">Login Credentials Generated</h2>
              <p className="text-xs text-gray-500 mt-1">Share these securely with the user</p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono space-y-3">
              <div>
                <div className="text-[9px] text-gray-500 uppercase">Email</div>
                <div className="text-sm text-white mt-0.5">{showCredentials.email}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 uppercase">Password</div>
                <div className="text-sm text-emerald-400 font-bold mt-0.5">{showCredentials.password}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 uppercase">Login URL</div>
                <div className="text-sm text-blue-400 mt-0.5">{typeof window !== 'undefined' ? window.location.origin : ''}/login</div>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
              <p className="text-[10px] text-amber-400">⚠️ This password will only be shown once. Copy it now and share it securely with the user.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={copyCredentials}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500">
                📋 Copy All Credentials
              </button>
              <button onClick={() => setShowCredentials(null)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`);

console.log('');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('  Installed: 10 files');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('  HOW IT WORKS:');
console.log('');
console.log('  1. ADMIN INVITES A USER:');
console.log('     Go to /admin/users → "Invite User"');
console.log('     Enter email, pick role, select agents');
console.log('     System generates a unique password (e.g. nova-peak-55)');
console.log('     Copy credentials and send to user');
console.log('');
console.log('  2. USER LOGS IN:');
console.log('     Go to /login → enter email + password');
console.log('     Redirected to /portal — their personal dashboard');
console.log('     Only sees the agents YOU assigned them');
console.log('');
console.log('  3. ROLE BANNERS:');
console.log('     Beta Tester → "🧪 Free Beta Access" banner');
console.log('     Customer    → "💳 Active Subscription" banner');
console.log('     Employee    → "🏢 Employee Access" banner');
console.log('     Admin       → Full access + Admin Console link');
console.log('');
console.log('  TEST LOGINS:');
console.log('  ┌─────────────────────────────┬──────────────────┬───────────┐');
console.log('  │ Email                        │ Password         │ Role      │');
console.log('  ├─────────────────────────────┼──────────────────┼───────────┤');
console.log('  │ steve@woulfgroup.com         │ admin            │ Super Admin│');
console.log('  │ marcus@woulfgroup.com        │ bravo-delta-42   │ Employee  │');
console.log('  │ demo@client1.com             │ nova-peak-55     │ Beta Tester│');
console.log('  │ paid@enterprise.com          │ ridge-slate-19   │ Customer  │');
console.log('  └─────────────────────────────┴──────────────────┴───────────┘');
console.log('');
console.log('  ROUTES:');
console.log('    /login          — Login page');
console.log('    /portal         — User dashboard (gated by role)');
console.log('    /portal/agent/X — Agent workspace (access checked)');
console.log('    /admin/users    — Admin user management');
console.log('');
console.log('  INSTALL:');
console.log('    cd ai-agent-platform');
console.log('    node user-portal-gating.js');
console.log('    npm run dev');
console.log('');
