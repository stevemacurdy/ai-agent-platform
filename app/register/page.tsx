'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

const USER_TYPES = [
  {
    id: 'business_owner',
    label: 'Business Owner',
    icon: '🏢',
    description: 'I run a business and want AI-powered solutions',
    color: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  {
    id: 'individual',
    label: 'Individual',
    icon: '👤',
    description: 'I want AI tools for personal or freelance use',
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  },
  {
    id: 'beta_tester',
    label: 'Beta Tester',
    icon: '🧪',
    description: 'I have a beta access code',
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const sb = getSupabaseBrowser()

  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    userType: '',
    betaCode: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })

  const up = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const validateStep1 = () => {
    if (!form.fullName || !form.email) {
      setError('Please fill in your name and email')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email')
      return false
    }
    setError('')
    return true
  }

  const validateStep2 = () => {
    if (!form.userType) {
      setError('Please select how you will use WoulfAI')
      return false
    }
    if (form.userType === 'beta_tester' && form.betaCode.toLowerCase().trim() !== 'fixit') {
      setError('Invalid beta verification word')
      return false
    }
    setError('')
    return true
  }

  const validateStep3 = () => {
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!form.agreeTerms) {
      setError('Please accept the terms of service')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return
    setLoading(true)
    setError('')

    try {
      // Map user type to role
      const roleMap: Record<string, string> = {
        business_owner: 'org_lead',
        individual: 'org_lead',
        beta_tester: 'beta_tester',
      }
      const role = roleMap[form.userType] || 'org_lead'

      // Create user in Supabase Auth
      const { data: authData, error: authErr } = await sb.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            company: form.company,
            user_type: form.userType,
          }
        }
      })

      if (authErr) {
        setError(authErr.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Account creation failed. Please try again.')
        setLoading(false)
        return
      }

      // Create profile via API (uses service role to bypass RLS)
      const profileRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          company: form.company,
          userType: form.userType,
          role,
        }),
      })

      if (!profileRes.ok) {
        const d = await profileRes.json()
        setError(d.error || 'Failed to create profile')
        setLoading(false)
        return
      }

      // Sign in immediately
      await sb.auth.signInWithPassword({ email: form.email, password: form.password })

      // Redirect based on user type
      switch (form.userType) {
        case 'business_owner':
          router.push('/onboarding/business')
          break
        case 'individual':
          router.push('/onboarding/individual')
          break
        case 'beta_tester':
          router.push('/portal')
          break
        default:
          router.push('/portal')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"

  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">WoulfAI</Link>
          <h2 className="text-xl font-bold mt-4">Set Up Your Account</h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'How will you use WoulfAI?'}
            {step === 3 && 'Create your password'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all " +
                (step >= s ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500')}>
                {step > s ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : s}
              </div>
              <span className={"text-xs hidden sm:inline " + (step >= s ? 'text-white' : 'text-gray-600')}>
                {s === 1 ? 'Your Info' : s === 2 ? 'User Type' : 'Password'}
              </span>
              {s < 3 && <div className={"w-8 h-0.5 " + (step > s ? 'bg-blue-600' : 'bg-white/5')} />}
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
                <input value={form.fullName} onChange={e => up('fullName', e.target.value)} placeholder="Your full name" className={inputCls} autoFocus />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Email *</label>
                <input value={form.email} onChange={e => up('email', e.target.value)} type="email" placeholder="you@company.com" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Phone</label>
                <input value={form.phone} onChange={e => up('phone', e.target.value)} type="tel" placeholder="(555) 123-4567" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Company</label>
                <input value={form.company} onChange={e => up('company', e.target.value)} placeholder="Your company name (optional)" className={inputCls} />
              </div>
              <button onClick={() => { if (validateStep1()) setStep(2) }}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">
                Continue &rarr;
              </button>
            </div>
          )}

          {/* Step 2: User Type Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {USER_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => { up('userType', type.id); setError('') }}
                    className={"w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left " +
                      (form.userType === type.id
                        ? type.color + ' scale-[1.02]'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10')}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <div className="flex-1">
                      <div className={"text-sm font-semibold " + (form.userType === type.id ? '' : 'text-white')}>
                        {type.label}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{type.description}</div>
                    </div>
                    <div className={"w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all " +
                      (form.userType === type.id ? 'border-current' : 'border-gray-600')}>
                      {form.userType === type.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-current" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Beta verification field */}
              {form.userType === 'beta_tester' && (
                <div className="mt-2 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <label className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-2">Beta Verification Word *</label>
                  <input
                    value={form.betaCode}
                    onChange={e => up('betaCode', e.target.value)}
                    placeholder="Enter your beta verification word"
                    className={inputCls}
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-600 mt-2">Contact your administrator if you need a beta access code.</p>
                </div>
              )}

              <p className="text-[10px] text-gray-600 text-center">
                Employees and admins are pre-provisioned by your administrator.
                <br />
                If you were invited, check your email for an invite link.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="px-6 py-3.5 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors">
                  &larr; Back
                </button>
                <button onClick={() => { if (validateStep2()) setStep(3) }}
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">
                  Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg mb-2">
                <div className="text-[10px] text-gray-500 uppercase">Account Type</div>
                <div className="text-sm text-white font-medium mt-0.5">
                  {USER_TYPES.find(t => t.id === form.userType)?.icon}{' '}
                  {USER_TYPES.find(t => t.id === form.userType)?.label}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <input
                    value={form.password}
                    onChange={e => up('password', e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    className={inputCls + ' pr-12'}
                    autoFocus
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
                {form.password.length > 0 && form.password.length < 8 && (
                  <p className="text-[10px] text-amber-400 mt-1">{8 - form.password.length} more characters needed</p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Confirm Password *</label>
                <input value={form.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} type="password" placeholder="Re-enter password" className={inputCls} />
                {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                  <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
                )}
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agreeTerms} onChange={e => up('agreeTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-white/5 accent-blue-600" />
                <span className="text-xs text-gray-400">
                  I agree to the <Link href="/terms" className="text-blue-400">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400">Privacy Policy</Link>
                </span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="px-6 py-3.5 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors">
                  &larr; Back
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors">
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
