'use client'
import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

interface Company { id: string; name: string; slug: string }

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedCompanyId?: string
}

export default function InviteModal({ isOpen, onClose, onSuccess, preselectedCompanyId }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('employee')
  const [companyId, setCompanyId] = useState(preselectedCompanyId || '')
  const [companies, setCompanies] = useState<Company[]>([])
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      getSupabaseBrowser().from('companies').select('id, name, slug').order('name').then(({ data }) => {
        if (data) setCompanies(data)
      })
      setEmail('')
      setFullName('')
      setRole('employee')
      setCompanyId(preselectedCompanyId || '')
      setResult(null)
    }
  }, [isOpen, preselectedCompanyId])

  if (!isOpen) return null

  const handleSend = async () => {
    if (!email.trim()) return
    setSending(true)
    setResult(null)

    try {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token

      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (token || ''),
        },
        body: JSON.stringify({
          action: 'create',
          email: email.trim(),
          full_name: fullName.trim(),
          role,
          company_id: companyId || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, message: 'Invite sent to ' + email })
        setTimeout(() => { onSuccess(); onClose() }, 1500)
      } else {
        setResult({ ok: false, message: data.error || 'Failed to send invite' })
      }
    } catch (err: any) {
      setResult({ ok: false, message: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0D1117] border border-white/10 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-4">Invite Team Member</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="employee">Employee</option>
              <option value="company_admin">Company Admin</option>
              <option value="beta_tester">Beta Tester</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Company</label>
            <select
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">No company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {result && (
            <div className={`px-3 py-2 rounded-lg text-sm ${result.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {result.message}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !email.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            {sending ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  )
}
