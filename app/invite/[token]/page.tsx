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
  const [form, setForm] = useState({
    fullName: '', username: '', password: '', confirmPassword: '', phone: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/invites?token=' + token, { headers: { 'x-admin-email': 'admin' } })
        if (!res.ok) { setError('Invalid or expired invite link'); setLoading(false); return }
        const data = await res.json()
        if (data.invite.status !== 'pending') { setError('This invite has already been used or revoked'); setLoading(false); return }
        if (new Date(data.invite.expiresAt) < new Date()) { setError('This invite has expired'); setLoading(false); return }
        setInvite(data.invite)
        setForm(prev => ({ ...prev, fullName: data.invite.recipientName || '' }))
      } catch { setError('Failed to load invite') }
      setLoading(false)
    }
    load()
  }, [token])

  const up = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }))

  const handleSubmit = async () => {
    if (!form.fullName || !form.username || form.password.length < 8) { setFormError('Please fill all fields (password min 8 chars)'); return }
    if (form.password !== form.confirmPassword) { setFormError('Passwords do not match'); return }
    setSubmitting(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.fullName,
        email: invite.recipientEmail,
        phone: form.phone || invite.recipientPhone,
        username: form.username,
        password: form.password,
        plan: 'invited',
        role: invite.role,
        inviteToken: token,
      }),
    })

    if (!res.ok) { const d = await res.json(); setFormError(d.error || 'Failed'); setSubmitting(false); return }

    localStorage.setItem('woulfai_session', JSON.stringify({
      user: { email: invite.recipientEmail, role: invite.role, full_name: form.fullName }
    }))
    router.push(invite.role === 'beta_tester' ? '/dashboard' : '/admin')
  }

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"

  if (loading) return <div className="min-h-screen bg-[#06080D] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  if (error) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-lg font-bold text-white">{error}</h2>
        <p className="text-sm text-gray-500">Contact your administrator for a new invite.</p>
        <Link href="/login" className="text-blue-400 text-sm">← Go to Sign In</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">WoulfAI</Link>
          <h2 className="text-lg font-bold mt-4">Welcome Aboard!</h2>
          <p className="text-sm text-gray-500 mt-1">
            You've been invited as {invite.role === 'beta_tester' ? 'a Beta Tester' : 'an Employee'}
          </p>
          <div className="mt-2 text-xs text-gray-600">
            Invited by {invite.createdBy} · Expires {new Date(invite.expiresAt).toLocaleDateString()}
          </div>
        </div>

        <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-6 space-y-4">
          {formError && <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">{formError}</div>}

          <div className="px-3 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg">
            <div className="text-[10px] text-blue-400 font-medium">Email (from invite)</div>
            <div className="text-sm text-white">{invite.recipientEmail}</div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase">Full Name *</label>
            <input value={form.fullName} onChange={e => up('fullName', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Phone</label>
            <input value={form.phone} onChange={e => up('phone', e.target.value)} type="tel" placeholder="(555) 123-4567" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Username *</label>
            <input value={form.username} onChange={e => up('username', e.target.value)} placeholder="Choose a username" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Password *</label>
            <input value={form.password} onChange={e => up('password', e.target.value)} type="password" placeholder="Min 8 characters" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Confirm Password *</label>
            <input value={form.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} type="password" className={inputCls} />
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {submitting ? 'Activating...' : 'Activate My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
