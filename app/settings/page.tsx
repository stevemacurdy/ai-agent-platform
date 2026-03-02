'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function SettingsHub() {
  const { profile, loading, isAdmin } = useAuth()
  const [connections, setConnections] = useState(0)
  const [teamCount, setTeamCount] = useState(0)

  useEffect(() => {
    // Count active integrations
    fetch('/api/integrations/data?action=list')
      .then(r => r.json())
      .then(d => setConnections((d.connections || []).length))
      .catch(() => {})

    // Count team members if admin
    if (isAdmin) {
      fetch('/api/admin/users')
        .then(r => r.json())
        .then(d => setTeamCount(Array.isArray(d) ? d.length : d.users?.length || 0))
        .catch(() => {})
    }
  }, [isAdmin])

  if (loading || !profile) return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const sections = [
    {
      id: 'profile',
      icon: '\uD83D\uDC64',
      title: 'Profile',
      desc: 'Manage your name, email, and preferences.',
      color: 'blue',
      stats: profile?.display_name || profile?.email?.split('@')[0] || 'You',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-[#9CA3AF] uppercase font-bold">Display Name</label>
              <div className="text-sm font-medium text-[#1B2A4A] mt-1 bg-[#F4F5F7] rounded-lg px-3 py-2">{profile?.display_name || '\u2014'}</div>
            </div>
            <div>
              <label className="text-[10px] text-[#9CA3AF] uppercase font-bold">Email</label>
              <div className="text-sm font-medium text-[#1B2A4A] mt-1 bg-[#F4F5F7] rounded-lg px-3 py-2">{profile?.email || '\u2014'}</div>
            </div>
            <div>
              <label className="text-[10px] text-[#9CA3AF] uppercase font-bold">Role</label>
              <div className="text-sm font-medium text-[#1B2A4A] mt-1 bg-[#F4F5F7] rounded-lg px-3 py-2 capitalize">{profile?.role || 'user'}</div>
            </div>
            <div>
              <label className="text-[10px] text-[#9CA3AF] uppercase font-bold">Company</label>
              <div className="text-sm font-medium text-[#1B2A4A] mt-1 bg-[#F4F5F7] rounded-lg px-3 py-2">{profile?.company_id || 'Not set'}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'integrations',
      icon: '\uD83D\uDD17',
      title: 'Integrations',
      desc: 'Connect your accounting, CRM, HR, and other business tools.',
      color: 'emerald',
      stats: connections > 0 ? `${connections} connected` : 'None connected',
      link: '/settings/integrations',
    },
    {
      id: 'billing',
      icon: '\uD83D\uDCB3',
      title: 'Billing & Plan',
      desc: 'View your current plan, manage payment methods, and download invoices.',
      color: 'violet',
      stats: 'Active',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/50">Current Plan</div>
                <div className="text-lg font-bold mt-0.5">Active Subscription</div>
                <div className="text-xs text-white/50 mt-1">Manage your plan on the pricing page.</div>
              </div>
              <Link href="/pricing" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                View Plans {'\u2192'}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F4F5F7] rounded-lg p-3">
              <div className="text-[9px] text-[#9CA3AF] uppercase">Payment Method</div>
              <div className="text-sm font-medium text-[#1B2A4A] mt-1">Managed via Stripe</div>
            </div>
            <div className="bg-[#F4F5F7] rounded-lg p-3">
              <div className="text-[9px] text-[#9CA3AF] uppercase">Billing Portal</div>
              <a href="/api/stripe/portal" className="text-sm font-medium text-[#2A9D8F] mt-1 block hover:underline">Open Stripe Portal {'\u2192'}</a>
            </div>
          </div>
        </div>
      ),
    },
    ...(isAdmin ? [{
      id: 'team',
      icon: '\uD83D\uDC65',
      title: 'Team Management',
      desc: 'Invite members, manage roles, and control access.',
      color: 'amber',
      stats: teamCount > 0 ? `${teamCount} members` : 'Manage team',
      link: '/admin',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#F4F5F7] rounded-xl p-4">
            <div>
              <div className="text-sm font-semibold text-[#1B2A4A]">Team Members</div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">Manage users, roles, and invitations from the Admin Console.</div>
            </div>
            <Link href="/admin" className="px-4 py-2 bg-[#1B2A4A] text-white rounded-xl text-xs font-bold hover:-translate-y-px transition-all">
              Admin Console {'\u2192'}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/admin" className="bg-white border border-[#E5E7EB] rounded-lg p-3 hover:border-[#2A9D8F] transition-all text-center">
              <div className="text-lg mb-1">{'\uD83D\uDC64'}</div>
              <div className="text-[10px] font-medium text-[#1B2A4A]">Users</div>
            </Link>
            <Link href="/admin" className="bg-white border border-[#E5E7EB] rounded-lg p-3 hover:border-[#2A9D8F] transition-all text-center">
              <div className="text-lg mb-1">{'\u2709\uFE0F'}</div>
              <div className="text-[10px] font-medium text-[#1B2A4A]">Invitations</div>
            </Link>
            <Link href="/admin" className="bg-white border border-[#E5E7EB] rounded-lg p-3 hover:border-[#2A9D8F] transition-all text-center">
              <div className="text-lg mb-1">{'\uD83D\uDD12'}</div>
              <div className="text-[10px] font-medium text-[#1B2A4A]">Roles</div>
            </Link>
          </div>
        </div>
      ),
    }] : []),
    {
      id: 'notifications',
      icon: '\uD83D\uDD14',
      title: 'Notifications',
      desc: 'Configure email alerts, in-app notifications, and digests.',
      color: 'rose',
      stats: 'Configured',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Invoice overdue alerts', desc: 'Get notified when invoices pass their due date', on: true },
            { label: 'Deal stage changes', desc: 'Know when deals move through your pipeline', on: true },
            { label: 'Weekly AI digest', desc: 'Summary of recommendations from all agents', on: false },
            { label: 'New team member signup', desc: 'Alert when someone joins via invitation', on: true },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0">
              <div>
                <div className="text-xs font-medium text-[#1B2A4A]">{n.label}</div>
                <div className="text-[10px] text-[#9CA3AF]">{n.desc}</div>
              </div>
              <div className={'w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-all ' + (n.on ? 'bg-[#2A9D8F] justify-end' : 'bg-[#E5E7EB] justify-start')}>
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'security',
      icon: '\uD83D\uDD12',
      title: 'Security',
      desc: 'Password, two-factor authentication, and session management.',
      color: 'gray',
      stats: 'Secure',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F4F5F7] rounded-lg p-3">
              <div className="text-[9px] text-[#9CA3AF] uppercase">Password</div>
              <div className="text-xs font-medium text-[#1B2A4A] mt-1">{'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}</div>
              <button className="text-[10px] text-[#2A9D8F] mt-2 font-medium hover:underline">Change Password</button>
            </div>
            <div className="bg-[#F4F5F7] rounded-lg p-3">
              <div className="text-[9px] text-[#9CA3AF] uppercase">Two-Factor Auth</div>
              <div className="text-xs font-medium text-amber-600 mt-1">Not enabled</div>
              <button className="text-[10px] text-[#2A9D8F] mt-2 font-medium hover:underline">Enable 2FA</button>
            </div>
          </div>
          <div className="bg-[#F4F5F7] rounded-lg p-3">
            <div className="text-[9px] text-[#9CA3AF] uppercase">Active Sessions</div>
            <div className="text-xs font-medium text-[#1B2A4A] mt-1">This device {'\u2022'} Last active now</div>
          </div>
        </div>
      ),
    },
  ]

  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-[800px] mx-auto p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Settings</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Manage your account, integrations, and preferences.</p>
          </div>
          <Link href="/dashboard" className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-xl text-xs font-medium hover:border-[#2A9D8F] transition-all">
            {'\u2190'} Dashboard
          </Link>
        </div>

        {/* Settings Cards */}
        <div className="space-y-3">
          {sections.map(s => {
            const isExpanded = expanded === s.id
            const hasLink = 'link' in s && s.link
            const colorMap: Record<string, string> = {
              blue: 'border-blue-500/20 hover:border-blue-500/40',
              emerald: 'border-emerald-500/20 hover:border-emerald-500/40',
              violet: 'border-violet-500/20 hover:border-violet-500/40',
              amber: 'border-amber-500/20 hover:border-amber-500/40',
              rose: 'border-rose-500/20 hover:border-rose-500/40',
              gray: 'border-[#E5E7EB] hover:border-[#9CA3AF]',
            }

            const card = (
              <div
                key={s.id}
                className={'bg-white border-2 rounded-2xl transition-all cursor-pointer ' + (colorMap[s.color] || colorMap.gray) + (isExpanded ? ' shadow-lg' : '')}
                onClick={() => {
                  if (hasLink) return
                  setExpanded(isExpanded ? null : s.id)
                }}
              >
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-[#1B2A4A]">{s.title}</div>
                      <div className="text-[10px] text-[#9CA3AF] mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-[#6B7280] bg-[#F4F5F7] px-2.5 py-1 rounded-full">{s.stats}</span>
                    {hasLink ? (
                      <span className="text-[#9CA3AF] text-sm">{'\u2192'}</span>
                    ) : (
                      <span className={'text-[#9CA3AF] text-sm transition-transform ' + (isExpanded? 'rotate-180' : '')}>{'\u25BE'}</span>
                    )}
                  </div>
                </div>
                {isExpanded && s.content && (
                  <div className="px-5 pb-5 border-t border-[#F4F5F7] pt-4" onClick={e => e.stopPropagation()}>
                    {s.content}
                  </div>
                )}
              </div>
            )

            if (hasLink) {
              return <Link key={s.id} href={s.link!}>{card}</Link>
            }
            return card
          })}
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[10px] text-[#9CA3AF]">WoulfAI v1.0 {'\u2022'} Need help? Contact support@woulfai.com</p>
        </div>
      </div>
    </div>
  )
}
