'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [contact, setContact] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'done'>('request')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const requestReset = async () => {
    if (!contact) { setError('Please enter your ' + method); return }
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, contact }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setStep('verify')
    setError('')
    setLoading(false)
  }

  const verifyCode = async () => {
    if (code.length < 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', contact, code }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setStep('reset')
    setError('')
    setLoading(false)
  }

  const resetPassword = async () => {
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset', contact, code, newPassword }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error); setLoading(false); return }
    setStep('done')
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"

  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">WoulfAI</Link>
          <h2 className="text-lg font-bold mt-4">{step === 'done' ? 'Password Reset!' : 'Reset Your Password'}</h2>
        </div>

        <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-6">
          {error && <div className="mb-4 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">{error}</div>}

          {step === 'request' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button onClick={() => setMethod('email')}
                  className={"flex-1 py-2 rounded-lg text-xs font-medium " + (method === 'email' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400')}>
                  Email
                </button>
                <button onClick={() => setMethod('phone')}
                  className={"flex-1 py-2 rounded-lg text-xs font-medium " + (method === 'phone' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400')}>
                  Phone
                </button>
              </div>
              <input value={contact} onChange={e => setContact(e.target.value)}
                placeholder={method === 'email' ? 'your@email.com' : '(555) 123-4567'}
                type={method === 'email' ? 'email' : 'tel'} className={inputCls} />
              <button onClick={requestReset} disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 text-center">
                We sent a 6-digit code to <span className="text-blue-400">{contact}</span>
              </p>
              <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" maxLength={6}
                className={inputCls + " text-center text-2xl tracking-[0.5em] font-mono"} />
              <button onClick={verifyCode} disabled={loading || code.length < 6}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button onClick={() => { setStep('request'); setCode('') }} className="w-full text-xs text-gray-500 hover:text-white">
                Didn't receive it? Try again
              </button>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase">New Password</label>
                <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="Min 8 characters" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase">Confirm Password</label>
                <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" className={inputCls} />
              </div>
              <button onClick={resetPassword} disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4 space-y-4">
              <div className="text-4xl">✅</div>
              <p className="text-sm text-gray-400">Your password has been reset successfully.</p>
              <Link href="/login" className="block py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold text-center">
                Sign In
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs text-gray-500 hover:text-blue-400">← Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
