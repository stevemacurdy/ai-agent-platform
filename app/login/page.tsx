'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const sb = getSupabaseBrowser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authErr } = await sb.auth.signInWithPassword({ email, password })
      if (authErr) {
        setError(authErr.message)
        setLoading(false)
        return
      }

      // Check if must_reset_password
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + data.session?.access_token }
      })
      if (res.ok) {
        const meData = await res.json()
        if (meData.user?.must_reset_password) {
          router.push('/reset-password')
          return
        }
        const role = meData.user?.role
        if (role === 'super_admin' || role === 'admin') {
          router.push('/admin')
          return
        }
      }

      router.push('/portal')
    } catch (err: any) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
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
          <p className="text-sm text-gray-500 mt-2">Sign in to access your AI agents</p>
        </div>

        <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" className={inputCls} autoFocus required />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={inputCls + ' pr-12'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl text-sm font-semibold transition-all">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between">
            <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Forgot password?
            </Link>
            <Link href="/register" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Set up an account &rarr;
            </Link>
          </div>
</div>

        <p className="text-center text-[10px] text-gray-700 mt-6">
          {"Don't have an account? "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">Set up an account</Link>
        </p>
      </div>
    </div>
  )
}
