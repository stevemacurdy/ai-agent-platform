'use client'
import { useState } from 'react'

interface Props {
  agentSlug: string
  agentName: string
  onClose: () => void
}

export default function LeadCaptureModal({ agentSlug, agentName, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!name || !email) return
    setLoading(true)
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, agent_slug: agentSlug, source: 'demo' }),
    }).catch(() => {})
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="text-4xl">🚀</div>
            <h3 className="text-lg font-bold">You're On the List!</h3>
            <p className="text-sm text-gray-400">
              The <span className="text-blue-400 font-semibold">{agentName}</span> is receiving a serious upgrade.
              We've saved your interest and will notify you when it's ready.
            </p>
            <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium mt-4">
              Back to Demo
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1">Get Early Access</h3>
            <p className="text-sm text-gray-400 mb-5">
              Be first to know when the <span className="text-blue-400">{agentName}</span> launches.
            </p>
            <div className="space-y-3 mb-5">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" type="email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={submit} disabled={loading || !name || !email}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-500 transition-colors">
                {loading ? 'Saving...' : 'Notify Me'}
              </button>
              <button onClick={onClose} className="px-4 py-3 text-gray-500 hover:text-white text-sm transition-colors">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
