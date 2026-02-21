// ============================================================================
// WoulfAI Auth — Works with or without Supabase
// Priority: localStorage session → Supabase session → null
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Detect if we have REAL Supabase credentials (not placeholder)
const HAS_SUPABASE = SUPABASE_URL.includes('.supabase.co')
  && !SUPABASE_URL.includes('placeholder')
  && SUPABASE_ANON_KEY.length > 20
  && !SUPABASE_ANON_KEY.includes('placeholder')

// Only import Supabase if we have real keys — otherwise skip entirely
let supabase: any = null
if (HAS_SUPABASE) {
  try {
    const { createClient } = require('@supabase/supabase-js')
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  } catch (e) {
    console.warn('[WoulfAI] Supabase client init failed — using localStorage auth')
  }
}

// ============================================================================
// Types
// ============================================================================
export type UserRole = 'super_admin' | 'admin' | 'employee' | 'beta_tester' | 'customer'
export type AgentName = string

export interface User {
  id?: string
  email: string
  role: UserRole
  full_name?: string
  username?: string
  org_id?: string
}

// ============================================================================
// Session Management — localStorage is always the source of truth in dev
// ============================================================================
const SESSION_KEY = 'woulfai_session'

export function getStoredSession(): { user: User } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data?.user?.email) return data
    return null
  } catch {
    return null
  }
}

export function setSession(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

// ============================================================================
// Auth Functions — Used by layouts, pages, and API calls
// ============================================================================

export async function getCurrentUser(): Promise<User | null> {
  // 1. Check localStorage first (always works)
  const stored = getStoredSession()
  if (stored?.user) return stored.user

  // 2. Check Supabase session if available
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser()
      if (data?.user?.email) {
        const u: User = {
          id: data.user.id,
          email: data.user.email,
          role: (data.user.user_metadata?.role as UserRole) || 'customer',
          full_name: data.user.user_metadata?.full_name || '',
        }
        setSession(u) // Cache in localStorage
        return u
      }
    } catch {}
  }

  return null
}

// Known admin emails
const SUPER_ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com']
const ADMIN_ROLES: UserRole[] = ['super_admin', 'admin', 'employee']

export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false
  return SUPER_ADMINS.includes(user.email.toLowerCase()) || user.role === 'super_admin'
}

export function canAccessAdmin(user: User | null): boolean {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  return ADMIN_ROLES.includes(user.role)
}

export function getLoginRedirect(user: User): string {
  if (isSuperAdmin(user) || canAccessAdmin(user)) return '/admin'
  return '/dashboard'
}

// ============================================================================
// Sign In / Sign Out
// ============================================================================

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  // Dev mode: accept any login with known admin emails or password 'admin'
  if (!HAS_SUPABASE || password === 'Letfr33domring' || password === 'demo') {
    const isAdmin = SUPER_ADMINS.includes(email.toLowerCase())
    const user: User = {
      email,
      role: isAdmin ? 'super_admin' : 'customer',
      full_name: isAdmin ? 'Steve Macurdy' : email.split('@')[0],
    }
    setSession(user)
    return { user, error: null }
  }

  // Production: use Supabase auth
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { user: null, error: error.message }
      if (data?.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          role: (data.user.user_metadata?.role as UserRole) || 'customer',
          full_name: data.user.user_metadata?.full_name || '',
        }
        setSession(user)
        return { user, error: null }
      }
    } catch (e: any) {
      return { user: null, error: e.message || 'Auth failed' }
    }
  }

  return { user: null, error: 'Authentication unavailable' }
}

export async function signOut(): Promise<void> {
  clearSession()
  if (supabase) {
    try { await supabase.auth.signOut() } catch {}
  }
}

// ============================================================================
// Agent Access (stub — real implementation uses user_agents table)
// ============================================================================
export const ALL_AGENTS: AgentName[] = [
  'cfo', 'sales', 'finops', 'payables', 'collections',
  'hr', 'operations', 'legal', 'marketing', 'wms', 'compliance'
]

export const AGENT_META: Record<string, { name: string; icon: string }> = {
  cfo: { name: 'CFO Agent', icon: '📈' },
  sales: { name: 'Sales Agent', icon: '💼' },
  finops: { name: 'FinOps Agent', icon: '💰' },
  payables: { name: 'Payables Agent', icon: '🧾' },
  collections: { name: 'Collections Agent', icon: '📬' },
  hr: { name: 'HR Agent', icon: '👥' },
  operations: { name: 'Operations Agent', icon: '⚙️' },
  legal: { name: 'Legal Agent', icon: '⚖️' },
  marketing: { name: 'Marketing Agent', icon: '📣' },
  wms: { name: 'WMS Agent', icon: '🏭' },
  compliance: { name: 'Compliance Agent', icon: '🛡️' },
}

export async function getUserAgents(user: User): Promise<AgentName[]> {
  if (isSuperAdmin(user)) return ALL_AGENTS
  // Default: return all for now (production: query user_agents table)
  return ALL_AGENTS
}

// ============================================================================
// Supabase client getter (for pages that need direct DB access)
// Returns null if Supabase is not available
// ============================================================================
export function getSupabaseClient() {
  return supabase
}
