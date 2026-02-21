// ============================================================================
// PERSONAL SALES PORTAL - /s/[slug]
// ============================================================================

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Settings, BarChart3, Users, Target, Phone, Mail,
  Sparkles, Send, CheckCircle, AlertTriangle, Loader2,
  Plus, Building2, ArrowRight
} from 'lucide-react'

interface SalesProfile {
  displayName: string;
  portalSlug: string;
  role: string;
  email: string;
}

interface CRMConnection {
  provider: string;
  status: string;
  accountLabel: string | null;
}

export default function SalesPortalPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<SalesProfile | null>(null)
  const [connections, setConnections] = useState<CRMConnection[]>([])
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadPortal()
  }, [slug])

  const loadPortal = async () => {
    setLoading(true)
    try {
      // Load profile and connections
      const [profileRes, connectionsRes] = await Promise.all([
        fetch('/api/sales/profile'),
        fetch('/api/sales/connections'),
      ])

      if (!profileRes.ok) {
        router.push('/login?next=/s/' + slug)
        return
      }

      const profileData = await profileRes.json()
      
      // Verify slug matches user's portal
      if (profileData.portalSlug !== slug) {
        router.push('/s/' + profileData.portalSlug)
        return
      }

      setProfile(profileData)
      
      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json()
        setConnections(connectionsData.connections || [])
      }
    } catch (error) {
      console.error('Failed to load portal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadForm.name.trim()) return

    const connectedCRM = connections.find(c => c.status === 'connected')
    if (!connectedCRM) {
      setResult({ success: false, message: 'Please connect a CRM first' })
      return
    }

    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: connectedCRM.provider,
          lead: leadForm,
        }),
      })

      const data = await res.json()
      if (data.ok) {
        setResult({ success: true, message: `Lead created in ${connectedCRM.provider}!` })
        setLeadForm({ name: '', email: '', phone: '', company: '', notes: '' })
      } else {
        setResult({ success: false, message: data.error || 'Failed to create lead' })
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to create lead' })
    } finally {
      setSubmitting(false)
    }
  }

  const connectedCRM = connections.find(c => c.status === 'connected')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{profile?.displayName}'s Portal</h1>
                <p className="text-sm text-gray-400">woulfai.com/s/{slug}</p>
              </div>
            </div>
            <Link
              href="/sales/settings"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* CRM Status Banner */}
        {!connectedCRM ? (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span>Connect your CRM to push leads automatically</span>
            </div>
            <Link
              href="/sales/settings"
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400"
            >
              Connect CRM
            </Link>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Connected to <strong>{connectedCRM.accountLabel || connectedCRM.provider}</strong></span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Lead Capture */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Quick Lead Capture
            </h2>
            
            <form onSubmit={handleSubmitLead} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={leadForm.name}
                  onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={leadForm.phone}
                    onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Company</label>
                <input
                  type="text"
                  value={leadForm.company}
                  onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={leadForm.notes}
                  onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Met at trade show, interested in..."
                />
              </div>

              {result && (
                <div className={`p-3 rounded-lg ${result.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {result.message}
                </div>
              )}
              
              <button
                type="submit"
                disabled={submitting || !connectedCRM}
                className="w-full py-3 bg-blue-500 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Push to CRM
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Sales Assistant
              </h2>
              <p className="text-gray-400 mb-4">
                Get AI-powered help with call prep, follow-ups, and lead scoring.
              </p>
              <Link
                href="/agents/sales"
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">Open Sales Agent</div>
                    <div className="text-sm text-gray-400">AI-powered sales coaching</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Quick Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400">—</div>
                  <div className="text-sm text-gray-400">Leads This Week</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-400">—</div>
                  <div className="text-sm text-gray-400">Pipeline Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
