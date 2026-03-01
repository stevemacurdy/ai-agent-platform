'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const requestReset = async () => {
    if (!email) { setError('Please enter your email'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return }
      setSent(true)
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-[#6B7280] mt-2">
            {sent ? 'Check your email for a reset link' : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {!sent ? (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && requestReset()}
              className="w-full px-4 py-3 bg-[#0D1117] border border-[#E5E7EB] rounded-lg text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              onClick={requestReset}
              disabled={loading}
              className="w-full py-3 bg-[#1B2A4A] text-white rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-4xl">📧</div>
            <p className="text-[#4B5563]">
              If an account exists for <strong className="text-white">{email}</strong>, you will receive a password reset link shortly.
            </p>
            <p className="text-[#9CA3AF] text-sm">Check your spam folder if you do not see it.</p>
          </div>
        )}

        <div className="text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-600 text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
