'use client'
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
