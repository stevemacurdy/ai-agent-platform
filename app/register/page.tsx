'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PLANS } from '@/lib/pricing'

export default function RegisterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const planId = params.get('plan') || 'starter'
  const plan = PLANS.find(p => p.id === planId) || PLANS[0]

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', state: '', zip: '',
    username: '', password: '', confirmPassword: '',
    company: '', agreeTerms: false,
  })
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const up = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const validateStep1 = () => {
    if (!form.fullName || !form.email || !form.phone) { setError('Please fill in all required fields'); return false }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email'); return false }
    setError(''); return true
  }

  const validateStep2 = () => {
    if (!form.username || form.username.length < 3) { setError('Username must be at least 3 characters'); return false }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return false }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return false }
    if (!form.agreeTerms) { setError('Please accept the terms of service'); return false }
    setError(''); return true
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan: planId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }

      // Set dev-mode session
      localStorage.setItem('woulfai_session', JSON.stringify({
        user: { email: form.email, role: 'customer', full_name: form.fullName, username: form.username }
      }))
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"

  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">WoulfAI</Link>
          <h2 className="text-xl font-bold mt-4">Create Your Account</h2>
          <p className="text-sm text-gray-500 mt-1">
            {plan.name} Plan · ${plan.price}/mo · {plan.agents} Agents · {plan.seats === -1 ? 'Unlimited' : plan.seats} Seats
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold " +
                (step >= s ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500')}>
                {s}
              </div>
              <span className={"text-xs " + (step >= s ? 'text-white' : 'text-gray-600')}>
                {s === 1 ? 'Your Info' : 'Account Setup'}
              </span>
              {s < 2 && <div className={"w-12 h-0.5 " + (step > 1 ? 'bg-blue-600' : 'bg-white/5')} />}
            </div>
          ))}
        </div>

        <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-6">
          {error && <div className="mb-4 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">{error}</div>}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Full Name *</label>
                <input value={form.fullName} onChange={e => up('fullName', e.target.value)} placeholder="Steve Macurdy" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Email *</label>
                <input value={form.email} onChange={e => up('email', e.target.value)} type="email" placeholder="steve@company.com" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Phone *</label>
                <input value={form.phone} onChange={e => up('phone', e.target.value)} type="tel" placeholder="(555) 123-4567" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Company</label>
                <input value={form.company} onChange={e => up('company', e.target.value)} placeholder="Woulf Group" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">Address</label>
                  <input value={form.address} onChange={e => up('address', e.target.value)} placeholder="123 Main St" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">City</label>
                  <input value={form.city} onChange={e => up('city', e.target.value)} placeholder="Salt Lake City" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">State</label>
                  <input value={form.state} onChange={e => up('state', e.target.value)} placeholder="UT" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">Zip</label>
                  <input value={form.zip} onChange={e => up('zip', e.target.value)} placeholder="84101" className={inputCls} />
                </div>
              </div>
              <button onClick={() => { if (validateStep1()) setStep(2) }}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Account Setup */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Username *</label>
                <input value={form.username} onChange={e => up('username', e.target.value)} placeholder="Choose a username" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Password *</label>
                <input value={form.password} onChange={e => up('password', e.target.value)} type="password" placeholder="Min 8 characters" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Confirm Password *</label>
                <input value={form.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} type="password" placeholder="Re-enter password" className={inputCls} />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agreeTerms} onChange={e => up('agreeTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-white/5" />
                <span className="text-xs text-gray-400">I agree to the <span className="text-blue-400">Terms of Service</span> and <span className="text-blue-400">Privacy Policy</span></span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm">← Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <span className="text-xs text-gray-500">Already have an account? </span>
            <Link href="/login" className="text-xs text-blue-400 hover:text-blue-300">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
