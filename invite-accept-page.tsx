'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    fullName: '', password: '', confirmPassword: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/invites?token=' + token)
        if (!res.ok) { setError('Invalid or expired invite link'); setLoading(false); return }
        const data = await res.json()
        const inv = data.invite
        if (inv.status === 'accepted') { setError('This invite has already been accepted'); setLoading(false); return }
        if (inv.status === 'revoked') { setError('This invite has been revoked'); setLoading(false); return }
        if (new Date(inv.expires_at) < new Date()) { setError('This invite has expired'); setLoading(false); return }
        setInvite(inv)
        setForm(prev => ({ ...prev, fullName: inv.full_name || '' }))
      } catch { setError('Failed to load invite') }
      setLoading(false)
    }
    load()
  }, [token])

  const handleSubmit = async () => {
    setFormError('')
    if (!form.fullName || form.password.length < 8) { setFormError('Name required, password min 8 characters'); return }
    if (form.password !== form.confirmPassword) { setFormError('Passwords do not match'); return }
    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invite.email,
          password: form.password,
          displayName: form.fullName,
          inviteToken: token,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Registration failed')
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login?invited=true'), 2000)
    } catch (err: any) {
      setFormError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center p-4">
      <div className="bg-[#0D1117] border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">{'\u26A0\uFE0F'}</div>
        <h1 className="text-xl font-bold text-white mb-2">Invite Issue</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500">
          Go to Login
        </Link>
      </div>
    </div>
  )

  if (success) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center p-4">
      <div className="bg-[#0D1117] border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">{'\u2705'}</div>
        <h1 className="text-xl font-bold text-white mb-2">Welcome!</h1>
        <p className="text-gray-400">Account created. Redirecting to login...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center p-4">
      <div className="bg-[#0D1117] border border-white/10 rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-3">W</div>
          <h1 className="text-xl font-bold text-white">Join WoulfAI</h1>
          <p className="text-sm text-gray-400 mt-1">You&apos;ve been invited as <span className="text-blue-400">{invite.role}</span></p>
          {invite.companies && (
            <p className="text-xs text-gray-500 mt-1">Company: {invite.companies.name}</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input type="email" value={invite.email} disabled
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Full Name *</label>
            <input type="text" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Password * (min 8 characters)</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Confirm Password *</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none" />
          </div>

          {formError && (
            <div className="px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">{formError}</div>
          )}

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-all">
            {submitting ? 'Creating Account...' : 'Accept Invite & Create Account'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
