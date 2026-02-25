'use client'
import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

interface Integration {
  id: string
  company_id: string
  provider: string
  label: string
  status: string
  last_synced_at: string | null
  error_message: string | null
  created_at: string
  companies?: { name: string; slug: string } | null
}

interface Company { id: string; name: string; slug: string }

const PROVIDERS = [
  { key: 'hubspot', name: 'HubSpot', icon: '🟠', fields: [
    { key: 'api_key', label: 'Private App Access Token', type: 'password', placeholder: 'pat-na1-...' },
  ]},
  { key: 'odoo', name: 'Odoo', icon: '🟣', fields: [
    { key: 'base_url', label: 'Odoo URL', type: 'text', placeholder: 'https://mycompany.odoo.com' },
    { key: 'database', label: 'Database Name', type: 'text', placeholder: 'mycompany' },
    { key: 'username', label: 'Username / Email', type: 'text', placeholder: 'admin@company.com' },
    { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'API key or password' },
  ]},
]

export default function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [configFields, setConfigFields] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const getToken = async () => {
    const sb = getSupabaseBrowser()
    const { data: { session } } = await sb.auth.getSession()
    return session?.access_token || ''
  }

  const loadData = async () => {
    setLoading(true)
    const token = await getToken()

    const [intRes, compRes] = await Promise.all([
      fetch('/api/admin/integrations-manage', { headers: { 'Authorization': 'Bearer ' + token } }),
      getSupabaseBrowser().from('companies').select('id, name, slug').order('name'),
    ])

    const intData = await intRes.json()
    setIntegrations(intData.integrations || [])
    setCompanies(compRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async () => {
    if (!selectedCompany || !selectedProvider) return
    setSaving(true)
    setMessage(null)

    try {
      const token = await getToken()
      const provider = PROVIDERS.find(p => p.key === selectedProvider)
      const config: Record<string, string> = {}
      provider?.fields.forEach(f => {
        if (configFields[f.key]) config[f.key] = configFields[f.key]
      })

      // For HubSpot, also set access_token from api_key for compatibility
      if (selectedProvider === 'hubspot' && config.api_key) {
        config.access_token = config.api_key
      }

      const res = await fetch('/api/admin/integrations-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          action: 'upsert',
          company_id: selectedCompany,
          provider: selectedProvider,
          config,
          label: provider?.name || selectedProvider,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: data.updated ? 'Integration updated' : 'Integration connected' })
        setShowAdd(false)
        setConfigFields({})
        loadData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async (integrationId: string) => {
    setTesting(integrationId)
    setMessage(null)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/integrations-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ action: 'test', integration_id: integrationId }),
      })
      const data = await res.json()
      setMessage({
        type: data.success ? 'success' : 'error',
        text: data.success ? 'Connection test passed' : (data.message || 'Test failed'),
      })
      loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setTesting(null)
    }
  }

  const handleDelete = async (integrationId: string) => {
    if (!confirm('Remove this integration?')) return
    const token = await getToken()
    await fetch('/api/admin/integrations-manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ action: 'delete', integration_id: integrationId }),
    })
    loadData()
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'inactive': return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      case 'pending_auth': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const providerIcon = (provider: string) => {
    const p = PROVIDERS.find(pr => pr.key === provider)
    return p?.icon || '🔌'
  }

  if (loading) return <div className="text-gray-500 text-sm py-8 text-center">Loading integrations...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Integrations</h2>
          <p className="text-sm text-gray-400">Connect external services per company</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-all"
        >
          {showAdd ? 'Cancel' : '+ Connect'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-2 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Company</label>
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none"
              >
                <option value="">Select company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Provider</label>
              <select
                value={selectedProvider}
                onChange={e => { setSelectedProvider(e.target.value); setConfigFields({}) }}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none"
              >
                <option value="">Select provider</option>
                {PROVIDERS.map(p => <option key={p.key} value={p.key}>{p.icon} {p.name}</option>)}
              </select>
            </div>
          </div>

          {selectedProvider && (
            <>
              {PROVIDERS.find(p => p.key === selectedProvider)?.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={configFields[field.key] || ''}
                    onChange={e => setConfigFields(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
              ))}

              <button
                onClick={handleSave}
                disabled={saving || !selectedCompany}
                className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all"
              >
                {saving ? 'Saving...' : 'Save & Connect'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Integration list */}
      {integrations.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-3xl mb-2">🔌</div>
          <p className="text-sm">No integrations connected yet</p>
        </div>
      )}

      <div className="space-y-2">
        {integrations.map(int => (
          <div key={int.id} className="flex items-center gap-4 px-4 py-3 bg-white/5 border border-white/5 rounded-lg">
            <div className="text-2xl">{providerIcon(int.provider)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium">
                {int.label || int.provider}
                {int.companies && <span className="text-gray-500 font-normal"> &middot; {int.companies.name}</span>}
              </div>
              <div className="text-xs text-gray-500">
                {int.last_synced_at ? 'Last synced: ' + new Date(int.last_synced_at).toLocaleString() : 'Never synced'}
                {int.error_message && <span className="text-red-400"> &middot; {int.error_message}</span>}
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs border ${statusBadge(int.status)}`}>
              {int.status}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleTest(int.id)}
                disabled={testing === int.id}
                className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded transition-all"
              >
                {testing === int.id ? 'Testing...' : 'Test'}
              </button>
              <button
                onClick={() => handleDelete(int.id)}
                className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
