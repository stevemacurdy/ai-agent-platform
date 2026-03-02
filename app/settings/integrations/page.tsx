'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface Connection {
  connection_id: string
  provider: string
  category: string
  status: string
  metadata: any
  created_at: string
}

const CATEGORIES = [
  {
    id: 'accounting',
    name: 'Accounting',
    icon: '\uD83D\uDCB0',
    description: 'Connect your accounting software for real-time financial intelligence',
    agents: ['CFO Agent', 'FinOps Agent', 'Payables Agent'],
    providers: [
      { name: 'QuickBooks', logo: '\uD83D\uDFE2', popular: true },
      { name: 'Xero', logo: '\uD83D\uDD35', popular: true },
      { name: 'Odoo', logo: '\uD83D\uDFE3', popular: false },
      { name: 'Sage', logo: '\uD83D\uDFE2', popular: false },
      { name: 'NetSuite', logo: '\uD83D\uDFE0', popular: false },
    ],
  },
  {
    id: 'crm',
    name: 'CRM',
    icon: '\uD83E\uDD1D',
    description: 'Connect your CRM for pipeline analytics and sales intelligence',
    agents: ['Sales Agent', 'Sales Coach'],
    providers: [
      { name: 'HubSpot', logo: '\uD83D\uDFE0', popular: true },
      { name: 'Salesforce', logo: '\uD83D\uDD35', popular: true },
      { name: 'Pipedrive', logo: '\uD83D\uDFE2', popular: false },
      { name: 'Zoho CRM', logo: '\uD83D\uDFE1', popular: false },
    ],
  },
  {
    id: 'hris',
    name: 'HR & Payroll',
    icon: '\uD83D\uDC65',
    description: 'Connect your HR platform for workforce and compliance insights',
    agents: ['HR Agent'],
    providers: [
      { name: 'BambooHR', logo: '\uD83D\uDFE2', popular: true },
      { name: 'Gusto', logo: '\uD83D\uDFE0', popular: true },
      { name: 'ADP', logo: '\uD83D\uDD34', popular: false },
      { name: 'Rippling', logo: '\uD83D\uDFE3', popular: false },
    ],
  },
  {
    id: 'martech',
    name: 'Marketing',
    icon: '\uD83D\uDCE3',
    description: 'Connect email and marketing tools for campaign intelligence',
    agents: ['Marketing Agent', 'SEO Agent'],
    providers: [
      { name: 'Mailchimp', logo: '\uD83D\uDFE1', popular: true },
      { name: 'Klaviyo', logo: '\uD83D\uDFE2', popular: true },
      { name: 'ActiveCampaign', logo: '\uD83D\uDD35', popular: false },
    ],
  },
  {
    id: 'ticketing',
    name: 'Support',
    icon: '\uD83C\uDFAB',
    description: 'Connect help desk for customer support analytics',
    agents: ['Support Agent'],
    providers: [
      { name: 'Zendesk', logo: '\uD83D\uDFE2', popular: true },
      { name: 'Freshdesk', logo: '\uD83D\uDD35', popular: false },
      { name: 'Intercom', logo: '\uD83D\uDD35', popular: false },
    ],
  },
  {
    id: 'commerce',
    name: 'E-Commerce',
    icon: '\uD83D\uDED2',
    description: 'Connect your store for order and inventory intelligence',
    agents: ['Operations Agent', 'Supply Chain Agent'],
    providers: [
      { name: 'Shopify', logo: '\uD83D\uDFE2', popular: true },
      { name: 'WooCommerce', logo: '\uD83D\uDFE3', popular: false },
      { name: 'BigCommerce', logo: '\uD83D\uDD35', popular: false },
    ],
  },
]

export default function IntegrationsSettingsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const params = useSearchParams()

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000) }

  // Check for callback params
  useEffect(() => {
    if (params.get('connected') === 'true') showToast('Integration connected successfully!')
    if (params.get('error') === 'true') showToast('Connection failed. Please try again.')
  }, [params])

  // Load existing connections
  const loadConnections = async () => {
    try {
      // Get company_id from session
      const session = JSON.parse(localStorage.getItem('woulfai_session') || '{}')
      const companyId = session?.company_id || session?.user?.user_metadata?.company_id
      if (!companyId) { setLoading(false); return }

      const r = await fetch(`/api/integrations/connect?company_id=${companyId}`)
      const data = await r.json()
      setConnections(data.local || [])
    } catch {
      // No connections yet
    }
    setLoading(false)
  }

  useEffect(() => { loadConnections() }, [])

  const getConnection = (category: string): Connection | undefined => {
    return connections.find(c => c.category === category && c.status === 'active')
  }

  const handleConnect = async (categoryId: string) => {
    setConnecting(categoryId)
    try {
      const session = JSON.parse(localStorage.getItem('woulfai_session') || '{}')
      const companyId = session?.company_id || session?.user?.user_metadata?.company_id || 'demo'

      const r = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          categories: [categoryId],
          successRedirect: window.location.origin + '/settings/integrations?connected=true',
        }),
      })
      const data = await r.json()
      if (data.embedUrl) {
        window.location.href = data.embedUrl
      } else {
        showToast('Failed to start connection. Please try again.')
      }
    } catch {
      showToast('Connection error. Please try again.')
    }
    setConnecting(null)
  }

  const handleDisconnect = async (conn: Connection) => {
    if (!confirm(`Disconnect ${conn.provider}? Your AI Employees will lose access to this data.`)) return
    setDisconnecting(conn.connection_id)
    try {
      const session = JSON.parse(localStorage.getItem('woulfai_session') || '{}')
      const companyId = session?.company_id || session?.user?.user_metadata?.company_id

      await fetch('/api/integrations/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: conn.connection_id, companyId }),
      })
      showToast(`${conn.provider} disconnected`)
      loadConnections()
    } catch {
      showToast('Failed to disconnect. Please try again.')
    }
    setDisconnecting(null)
  }

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg"
          style={{
            background: toast.includes('success') || toast.includes('connected') ? '#ecfdf5' : '#fef2f2',
            color: toast.includes('success') || toast.includes('connected') ? '#059669' : '#dc2626',
            border: `1px solid ${toast.includes('success') || toast.includes('connected') ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
          }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Integrations</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Connect your business tools so your AI Employees can access real data. All connections use bank-grade OAuth {'\u2014'} we never see your credentials.
        </p>
      </div>

      {/* Connection summary */}
      <div className="flex items-center gap-4 mb-8 p-4 rounded-xl border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>{connections.length}</span>
          <span className="text-sm text-[#6B7280]">Active Connections</span>
        </div>
        <div className="h-8 w-px bg-[#E5E7EB]" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: '#2A9D8F' }}>{CATEGORIES.length}</span>
          <span className="text-sm text-[#6B7280]">Categories Available</span>
        </div>
        <div className="h-8 w-px bg-[#E5E7EB]" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: '#F5920B' }}>412+</span>
          <span className="text-sm text-[#6B7280]">Integrations via Unified.to</span>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {CATEGORIES.map(cat => {
            const conn = getConnection(cat.id)
            const isConnected = !!conn
            const isConnecting = connecting === cat.id

            return (
              <div
                key={cat.id}
                className="rounded-2xl border-2 overflow-hidden transition-all"
                style={{
                  borderColor: isConnected ? 'rgba(42,157,143,0.3)' : '#E5E7EB',
                  background: isConnected ? 'linear-gradient(135deg, rgba(42,157,143,0.03), rgba(42,157,143,0.08))' : '#FFFFFF',
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{cat.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>{cat.name}</h3>
                          {isConnected && (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] mt-1">{cat.description}</p>

                        {/* Connected provider info */}
                        {isConnected && conn && (
                          <div className="mt-3 flex items-center gap-3 text-xs">
                            <span className="font-medium text-[#1B2A4A]">{conn.provider}</span>
                            <span className="text-[#9CA3AF]">{'\u2022'}</span>
                            <span className="text-[#9CA3AF]">Connected {new Date(conn.created_at).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Which agents use this */}
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="text-[10px] text-[#9CA3AF] mr-1">Powers:</span>
                          {cat.agents.map(agent => (
                            <span key={agent} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(27,42,74,0.06)', color: '#4B5563' }}>
                              {agent}
                            </span>
                          ))}
                        </div>

                        {/* Popular providers */}
                        {!isConnected && (
                          <div className="mt-3 flex items-center gap-1.5">
                            <span className="text-[10px] text-[#9CA3AF] mr-1">Popular:</span>
                            {cat.providers.filter(p => p.popular).map(p => (
                              <span key={p.name} className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(0,0,0,0.04)', color: '#6B7280' }}>
                                {p.logo} {p.name}
                              </span>
                            ))}
                            {cat.providers.length > cat.providers.filter(p => p.popular).length && (
                              <span className="text-[10px] text-[#9CA3AF]">
                                +{cat.providers.length - cat.providers.filter(p => p.popular).length} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connect / Disconnect button */}
                    <div className="flex-shrink-0">
                      {isConnected ? (
                        <button
                          onClick={() => handleDisconnect(conn)}
                          disabled={disconnecting === conn.connection_id}
                          className="px-4 py-2 rounded-xl text-xs font-medium transition-all hover:-translate-y-px disabled:opacity-50"
                          style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)' }}
                        >
                          {disconnecting === conn.connection_id ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(cat.id)}
                          disabled={isConnecting}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-px hover:shadow-lg disabled:opacity-50"
                          style={{ background: '#1B2A4A', boxShadow: '0 2px 8px rgba(27,42,74,0.2)' }}
                        >
                          {isConnecting ? (
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Connecting...
                            </span>
                          ) : (
                            'Connect'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-10 text-center">
        <p className="text-xs text-[#9CA3AF]">
          Powered by <a href="https://unified.to" target="_blank" rel="noopener" className="text-[#2A9D8F] hover:underline">Unified.to</a> {'\u2022'} 412+ integrations across 25 categories {'\u2022'} SOC 2 compliant
        </p>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Need a custom integration? <a href="/contact?interest=integration" className="text-[#F5920B] hover:underline">Contact us</a>
        </p>
      </div>
    </div>
  )
}
