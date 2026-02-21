'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const HAS_SUPABASE = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'))

function getSupabase() {
  if (!HAS_SUPABASE) return null
  const { createClient } = require('@supabase/supabase-js')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

interface Profile {
  id: string
  email: string
  display_name: string
  role: string
  org_id: string | null
  permissions: Record<string, boolean>
  avatar_url: string | null
  phone: string | null
  status: string
  organizations?: any
}

interface AuthContextType {
  user: any
  session: any
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isSuperAdmin: boolean
  isOrgAdmin: boolean
  hasPermission: (perm: string) => boolean
  devMode: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null, loading: true,
  signIn: async () => ({}), signUp: async () => ({}), signOut: async () => {},
  refreshProfile: async () => {},
  isSuperAdmin: false, isOrgAdmin: false, hasPermission: () => false, devMode: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const devMode = !HAS_SUPABASE

  useEffect(() => {
    if (devMode) {
      // Dev mode: check localStorage
      try {
        const stored = localStorage.getItem('woulfai_session')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.loggedIn || parsed.user) {
            setProfile({
              id: 'dev-user',
              email: parsed.user?.email || 'admin',
              display_name: 'Steve Macurdy',
              role: 'super_admin',
              org_id: null,
              permissions: { sales_agent: true, cfo_agent: true, admin_analytics: true, agent_creator: true, wms_agent: true },
              avatar_url: null,
              phone: null,
              status: 'active',
            })
          }
        }
      } catch {}
      setLoading(false)
      return
    }

    // Real Supabase auth
    const supabase = getSupabase()
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session: s } }: any) => {
      setSession(s)
      setUser(s?.user || null)
      if (s?.user) {
        supabase.from('profiles').select('*, organizations(*)').eq('id', s.user.id).single()
          .then(({ data }: any) => { if (data) setProfile(data) })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, s: any) => {
      setSession(s)
      setUser(s?.user || null)
      if (s?.user) {
        supabase.from('profiles').select('*, organizations(*)').eq('id', s.user.id).single()
          .then(({ data }: any) => { if (data) setProfile(data) })
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (devMode) {
      if ((email === 'admin' && password === 'admin123') || email === 'steve@woulfgroup.com') {
        const devSession = { user: { email }, loggedIn: true }
        localStorage.setItem('woulfai_session', JSON.stringify(devSession))
        setProfile({
          id: 'dev-user', email, display_name: 'Steve Macurdy', role: 'super_admin',
          org_id: null, permissions: { sales_agent: true, cfo_agent: true, admin_analytics: true, agent_creator: true, wms_agent: true },
          avatar_url: null, phone: null, status: 'active',
        })
        return {}
      }
      return { error: 'Invalid credentials' }
    }

    const supabase = getSupabase()
    if (!supabase) return { error: 'Auth not configured' }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      const { data: p } = await supabase.from('profiles').select('*, organizations(*)').eq('id', data.user.id).single()
      if (p) setProfile(p)
    }
    return {}
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (devMode) return { error: 'Sign up not available in dev mode' }
    const supabase = getSupabase()
    if (!supabase) return { error: 'Auth not configured' }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    if (error) return { error: error.message }
    return {}
  }

  const signOutFn = async () => {
    if (devMode) {
      localStorage.removeItem('woulfai_session')
      setProfile(null)
      return
    }
    const supabase = getSupabase()
    if (supabase) await supabase.auth.signOut()
    setProfile(null)
  }

  const isSuperAdmin = profile?.role === 'super_admin'
  const isOrgAdmin = profile?.role === 'org_admin' || isSuperAdmin
  const hasPermission = (perm: string) => isSuperAdmin || profile?.permissions?.[perm] === true

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      signIn, signUp, signOut: signOutFn, refreshProfile: async () => {},
      isSuperAdmin, isOrgAdmin, hasPermission, devMode,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
