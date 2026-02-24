'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase client (singleton)
let _supabase: SupabaseClient | null = null
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

interface Profile {
  id: string
  email: string
  display_name: string
  role: string
  company_id: string | null
  org_id: string | null
  permissions: Record<string, boolean>
  avatar_url: string | null
  phone: string | null
  status: string
  must_reset_password?: boolean
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
  isAdmin: boolean
  isCompanyAdmin: boolean
  hasPermission: (perm: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null, loading: true,
  signIn: async () => ({}), signUp: async () => ({}), signOut: async () => {},
  refreshProfile: async () => {},
  isSuperAdmin: false, isAdmin: false, isCompanyAdmin: false, hasPermission: () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = getSupabase()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
    return data
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user || null)
      if (s?.user) {
        fetchProfile(s.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user || null)
      if (s?.user) {
        fetchProfile(s.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.user) await fetchProfile(data.user.id)
    return {}
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) return { error: error.message }
    return {}
  }

  const signOutFn = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
    setSession(null)
  }

  const isSuperAdmin = profile?.role === 'super_admin'
  const isAdmin = isSuperAdmin || profile?.role === 'admin'
  const isCompanyAdmin = profile?.role === 'company_admin' || isAdmin
  const hasPermission = (perm: string) => isSuperAdmin || profile?.permissions?.[perm] === true

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      signIn, signUp, signOut: signOutFn,
      refreshProfile: async () => { if (user?.id) await fetchProfile(user.id) },
      isSuperAdmin, isAdmin, isCompanyAdmin, hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
