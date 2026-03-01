// ============================================================================
// SALES SETTINGS - CRM Connection Management
// ============================================================================

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Plug, CheckCircle, XCircle, Loader2,
  AlertTriangle, ExternalLink, Trash2, RefreshCw, Eye, EyeOff
} from 'lucide-react'

interface CRMConnection {
  provider: string;
  status: string;
  accountLabel: string | null;
}

interface ProviderConfig {
  provider: string;
  displayName: string;
  description: string;
  icon: string;
  supportsOAuth: boolean;
  supportsManualAuth: boolean;
  manualAuthFields?: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
  }>;
}

const PROVIDERS: ProviderConfig[] = [
  {
    provider: 'hubspot',
    displayName: 'HubSpot',
    description: 'HubSpot CRM & Marketing',
    icon: 'H',
    supportsOAuth: true,
    supportsManualAuth: true,
    manualAuthFields: [
      { name: 'access_token', label: 'Private App Token', type: 'password', required: true, placeholder: 'pat-na1-...' },
    ],
  },
  {
    provider: 'netsuite',
    displayName: 'NetSuite',
    description: 'Oracle NetSuite ERP & CRM',
    icon: 'N',
    supportsOAuth: false, // Simplified for now
    supportsManualAuth: true,
    manualAuthFields: [
      { name: 'account_id', label: 'Account ID', type: 'text', required: true, placeholder: '1234567' },
      { name: 'consumer_key', label: 'Consumer Key', type: 'text', required: true },
      { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true },
      { name: 'token_id', label: 'Token ID', type: 'text', required: true },
      { name: 'token_secret', label: 'Token Secret', type: 'password', required: true },
    ],
  },
  {
    provider: 'salesforce',
    displayName: 'Salesforce',
    description: 'Salesforce CRM (Coming Soon)',
    icon: 'S',
    supportsOAuth: false,
    supportsManualAuth: false,
  },
  {
    provider: 'pipedrive',
    displayName: 'Pipedrive',
    description: 'Pipedrive Sales CRM (Coming Soon)',
    icon: 'P',
    supportsOAuth: false,
    supportsManualAuth: false,
  },
];

export default function SalesSettingsPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [connections, setConnections] = useState<CRMConnection[]>([])
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [connecting, setConnecting] = useState<string | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadConnections()

    // Check for URL params
    const connected = searchParams.get('connected')
    const errorParam = searchParams.get('error')
    if (connected) {
      setSuccess(`Successfully connected to ${connected}!`)
    }
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const loadConnections = async () => {
    try {
      const res = await fetch('/api/sales/connections')
      if (res.ok) {
        const data = await res.json()
        setConnections(data.connections || [])
      }
    } catch (err) {
      console.error('Failed to load connections:', err)
    } finally {
      setLoading(false)
    }
  }

  const getConnection = (provider: string) => {
    return connections.find(c => c.provider === provider)
  }

  const handleOAuthConnect = async (provider: string) => {
    setConnecting(provider)
    setError(null)
    try {
      const res = await fetch('/api/crm/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to start OAuth flow')
      }
    } catch (err) {
      setError('Failed to connect')
    } finally {
      setConnecting(null)
    }
  }

  const handleManualConnect = async (provider: string) => {
    setConnecting(provider)
    setError(null)
    try {
      const res = await fetch('/api/crm/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, manual: true, credentials }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(`Connected to ${data.accountLabel || provider}!`)
        setExpandedProvider(null)
        setCredentials({})
        loadConnections()
      } else {
        setError(data.error || 'Failed to connect')
      }
    } catch (err) {
      setError('Failed to connect')
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (provider: string) => {
    if (!confirm('Are you sure you want to disconnect this CRM?')) return

    try {
      const res = await fetch('/api/crm/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      if (res.ok) {
        setSuccess('Disconnected successfully')
        loadConnections()
      }
    } catch (err) {
      setError('Failed to disconnect')
    }
  }

  const handleTestConnection = async (provider: string) => {
    setTesting(provider)
    try {
      const res = await fetch('/api/crm/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      const data = await res.json()
      if (data.ok) {
        setSuccess('Connection test successful!')
      } else {
        setError(data.error || 'Connection test failed')
      }
    } catch (err) {
      setError('Connection test failed')
    } finally {
      setTesting(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-white">
      <header className="border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">CRM Settings</h1>
              <p className="text-sm text-[#6B7280]">Connect your CRM to push leads automatically</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-300">×</button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-600 hover:text-emerald-300">×</button>
          </div>
        )}

        {/* Provider List */}
        <div className="space-y-4">
          {PROVIDERS.map((provider) => {
            const connection = getConnection(provider.provider)
            const isConnected = connection?.status === 'connected'
            const isExpanded = expandedProvider === provider.provider
            const canConnect = provider.supportsOAuth || provider.supportsManualAuth

            return (
              <div
                key={provider.provider}
                className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                      isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-[#6B7280]'
                    }`}>
                      {provider.icon}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {provider.displayName}
                        {isConnected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="text-sm text-[#6B7280]">
                        {isConnected ? connection?.accountLabel || 'Connected' : provider.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleTestConnection(provider.provider)}
                          disabled={testing === provider.provider}
                          className="p-2 hover:bg-gray-100 rounded-lg text-[#6B7280] hover:text-[#1B2A4A]"
                          title="Test Connection"
                        >
                          {testing === provider.provider ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDisconnect(provider.provider)}
                          className="p-2 hover:bg-red-100 rounded-lg text-[#6B7280] hover:text-red-600"
                          title="Disconnect"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : canConnect ? (
                      <button
                        onClick={() => setExpandedProvider(isExpanded ? null : provider.provider)}
                        className="px-4 py-2 bg-blue-500 rounded-lg font-medium hover:bg-blue-600"
                      >
                        Connect
                      </button>
                    ) : (
                      <span className="text-sm text-[#9CA3AF]">Coming Soon</span>
                    )}
                  </div>
                </div>

                {/* Expanded Connection Form */}
                {isExpanded && !isConnected && (
                  <div className="border-t border-[#E5E7EB] p-4 bg-white shadow-sm">
                    {provider.supportsManualAuth && provider.manualAuthFields && (
                      <div className="space-y-4">
                        <p className="text-sm text-[#6B7280]">
                          Enter your {provider.displayName} credentials:
                        </p>
                        
                        {provider.manualAuthFields.map((field) => (
                          <div key={field.name}>
                            <label className="block text-sm text-[#6B7280] mb-1">
                              {field.label} {field.required && '*'}
                            </label>
                            <div className="relative">
                              <input
                                type={field.type === 'password' && !showSecrets[field.name] ? 'password' : 'text'}
                                value={credentials[field.name] || ''}
                                onChange={e => setCredentials({ ...credentials, [field.name]: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg focus:border-[#2A9D8F] focus:outline-none pr-10"
                                placeholder={field.placeholder}
                                required={field.required}
                              />
                              {field.type === 'password' && (
                                <button
                                  type="button"
                                  onClick={() => setShowSecrets({ ...showSecrets, [field.name]: !showSecrets[field.name] })}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#1B2A4A]"
                                >
                                  {showSecrets[field.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => handleManualConnect(provider.provider)}
                          disabled={connecting === provider.provider}
                          className="w-full py-2 bg-blue-500 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {connecting === provider.provider ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plug className="w-4 h-4" />
                          )}
                          Connect {provider.displayName}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-white border border-[#E5E7EB] shadow-sm rounded-xl">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-[#6B7280] text-sm mb-4">
            Each CRM has different authentication methods. Here's where to find your credentials:
          </p>
          <ul className="space-y-2 text-sm text-[#6B7280]">
            <li>
              <strong className="text-white">HubSpot:</strong> Settings → Integrations → Private Apps → Create a private app
            </li>
            <li>
              <strong className="text-white">NetSuite:</strong> Setup → Integration → Manage Integrations → Token-based Authentication
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
