'use client'
import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

interface Invite {
  id: string
  email: string
  full_name: string
  role: string
  status: string
  created_at: string
  expires_at: string
  companies?: { name: string; slug: string } | null
}

interface InviteListProps {
  companyId?: string
  refreshTrigger?: number
}

export default function InviteList({ companyId, refreshTrigger }: InviteListProps) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)

  const loadInvites = async () => {
    setLoading(true)
    try {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token
      const url = '/api/admin/invites' + (companyId ? '?company_id=' + companyId : '')
      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + (token || '') },
      })
      const data = await res.json()
      setInvites(data.invites || [])
    } catch (e) {
      console.error('Load invites error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInvites() }, [companyId, refreshTrigger])

  const handleAction = async (action: string, inviteId: string) => {
    try {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token
      await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (token || ''),
        },
        body: JSON.stringify({ action, invite_id: inviteId }),
      })
      loadInvites()
    } catch (e) {
      console.error('Action error:', e)
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'accepted': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'revoked': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'expired': return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  if (loading) return <div className="text-gray-500 text-sm py-4">Loading invites...</div>
  if (invites.length === 0) return <div className="text-gray-500 text-sm py-4">No invites yet</div>

  return (
    <div className="space-y-2">
      {invites.map(inv => (
        <div key={inv.id} className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-lg">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{inv.email}</div>
            <div className="text-xs text-gray-500">
              {inv.full_name ? inv.full_name + ' \u00B7 ' : ''}{inv.role}
              {inv.companies ? ' \u00B7 ' + inv.companies.name : ''}
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs border ${statusColor(inv.status)}`}>
            {inv.status}
          </span>
          {inv.status === 'pending' && (
            <div className="flex gap-1">
              <button
                onClick={() => handleAction('resend', inv.id)}
                className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                title="Resend invite email"
              >
                Resend
              </button>
              <button
                onClick={() => handleAction('revoke', inv.id)}
                className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-all"
                title="Revoke invite"
              >
                Revoke
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
