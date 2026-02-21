'use client'
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
