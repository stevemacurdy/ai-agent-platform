'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const sb = getSupabaseBrowser()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [mustReset, setMustReset] = useState(false)
  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (session?.user?.email) {
        setUserEmail(session.user.email)
        setAccessToken(session.access_token)
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.user?.must_reset_password) {
            setMustReset(true)
          }
        }
      }
    }
    checkSession()
  }, [])

  const handleReset = async () => {
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      // Use the server-side API which updates password AND clears the flag atomically
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
        },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update password')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/portal'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    }
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-3.5 bg-white border border-[#E5E7EB] shadow-sm rounded-xl text-sm text-white placeholder-[#9CA3AF] focus:border-[#2A9D8F]/30 focus:outline-none focus:ring-1 focus:ring-[#2A9D8F]/20 transition-all"

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-[#E5E7EB] mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mustReset ? 'Set Your New Password' : 'Reset Password'}
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-2">
            {mustReset
              ? 'Your administrator has set a temporary password. Please choose a new one.'
              : 'Choose a new password for your account.'}
          </p>
          {userEmail && (
            <p className="text-xs text-[#6B7280] mt-1">{userEmail}</p>
          )}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Password Updated</h2>
              <p className="text-sm text-[#9CA3AF]">Redirecting to your portal...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {mustReset && (
                <div className="px-4 py-3 bg-amber-50 border border-amber-500/20 rounded-xl text-sm text-amber-600">
                  You must set a new password before continuing.
                </div>
              )}

              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider block mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className={inputCls + ' pr-12'}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1"
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
                {password.length > 0 && password.length < 8 && (
                  <p className="text-[10px] text-amber-600 mt-1">{8 - password.length} more characters needed</p>
                )}
              </div>

              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider block mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className={inputCls}
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {loading ? 'Updating...' : 'Set New Password'}
              </button>
            </div>
          )}

          {!mustReset && !success && (
            <div className="mt-5 text-center">
              <Link href="/login" className="text-xs text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
                &larr; Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
