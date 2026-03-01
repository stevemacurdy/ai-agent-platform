'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

const STEPS = ['Welcome', 'Profile', 'Complete']

export default function EmployeeOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [result, setResult] = useState<any>(null)

  const [form, setForm] = useState({
    display_name: '',
    phone: '',
    job_title: '',
    department: '',
  })

  useEffect(() => {
    async function checkAuth() {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/onboarding/employee')
        return
      }
      setUserEmail(session.user.email || '')

      // Check if already onboarded
      const res = await fetch('/api/onboarding/employee', {
        headers: { 'Authorization': 'Bearer ' + session.access_token },
      })
      const data = await res.json()
      if (!data.needsOnboarding) {
        router.push('/portal')
        return
      }

      // Pre-fill from existing profile
      if (data.profile?.display_name) {
        setForm(prev => ({ ...prev, display_name: data.profile.display_name }))
      }
      if (data.profile?.phone) {
        setForm(prev => ({ ...prev, phone: data.profile.phone }))
      }

      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleSubmit = async () => {
    if (!form.display_name.trim()) {
      setError('Please enter your name')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      const res = await fetch('/api/onboarding/employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (session?.access_token || ''),
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Onboarding failed')
        setSubmitting(false)
        return
      }

      setResult(data)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-[#1B2A4A] text-white' :
                'bg-gray-100 text-[#9CA3AF]'
              }`}>
                {i < step ? '\u2713' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-white' : 'text-[#9CA3AF]'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-100" />}
            </div>
          ))}
        </div>

        <div className="bg-[#0D1117] border border-[#E5E7EB] rounded-xl p-8">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">W</div>
              <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Welcome to WoulfAI</h1>
              <p className="text-[#6B7280] mb-2">You&apos;re joining the team! Let&apos;s get you set up.</p>
              <p className="text-sm text-[#9CA3AF] mb-8">{userEmail}</p>

              <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-white mb-2">Here&apos;s what happens next:</h3>
                <ul className="space-y-2 text-sm text-[#6B7280]">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">{'\u2022'}</span>
                    <span>Complete your profile with your name and contact info</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">{'\u2022'}</span>
                    <span>Get assigned to your company workspace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">{'\u2022'}</span>
                    <span>Access your AI Employees (WMS, Operations, HR, Support, Training)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full py-3 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Step 1: Profile */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">Your Profile</h2>
              <p className="text-sm text-[#6B7280] mb-6">Tell us a bit about yourself.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-[#1B2A4A] placeholder-[#9CA3AF] focus:border-[#2A9D8F]/50 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="(801) 555-0123"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-[#1B2A4A] placeholder-[#9CA3AF] focus:border-[#2A9D8F]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Job Title</label>
                  <input
                    type="text"
                    value={form.job_title}
                    onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))}
                    placeholder="Warehouse Manager"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-[#1B2A4A] placeholder-[#9CA3AF] focus:border-[#2A9D8F]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-[#1B2A4A] focus:border-[#2A9D8F]/50 focus:outline-none"
                  >
                    <option value="">Select department</option>
                    <option value="operations">Operations</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="sales">Sales</option>
                    <option value="engineering">Engineering</option>
                    <option value="admin">Administration</option>
                    <option value="management">Management</option>
                  </select>
                </div>

                {error && (
                  <div className="px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-600 border border-red-500/20">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] text-sm hover:bg-white shadow-sm transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Setting up your account...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Complete */}
          {step === 2 && (
            <div className="text-center">
              <div className="text-5xl mb-4">{'\u2705'}</div>
              <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">You&apos;re All Set!</h2>
              <p className="text-[#6B7280] mb-6">
                Your account is ready. You now have access to {result?.agentCount || 5} AI Employees.
              </p>

              <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-white mb-3">Your AI Agents</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'WMS Agent', desc: 'Warehouse management' },
                    { name: 'Operations', desc: 'Daily operations' },
                    { name: 'HR Agent', desc: 'HR & policies' },
                    { name: 'Support', desc: 'Customer support' },
                    { name: 'Training', desc: 'Learning & training' },
                  ].map(a => (
                    <div key={a.name} className="px-3 py-2 bg-white shadow-sm rounded-lg text-left">
                      <div className="text-xs font-medium text-white">{a.name}</div>
                      <div className="text-xs text-[#9CA3AF]">{a.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => router.push('/portal')}
                className="w-full py-3 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all"
              >
                Go to Portal
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
