'use client'
import { useState } from 'react'
import { INTEGRATIONS, type Integration } from '@/lib/integrations'

export default function IntegrationsPage() {
  const [filter, setFilter] = useState<'all' | 'crm' | 'accounting'>('all')
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  const filtered = filter === 'all' ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === filter)
  const crms = INTEGRATIONS.filter(i => i.category === 'crm')
  const accounting = INTEGRATIONS.filter(i => i.category === 'accounting')

  const handleConnect = (int: Integration) => {
    if (int.status === 'coming_soon') { show(int.name + ' integration coming soon!'); return }
    setConnecting(int.id)
  }

  const handleSave = (id: string) => {
    setConnected(prev => new Set(Array.from(prev).concat(id)))
    setConnecting(null)
    show('Connected successfully!')
  }

  const statusBadge = (status: string) => {
    if (status === 'available') return 'bg-emerald-50 text-emerald-600'
    if (status === 'beta') return 'bg-blue-50 text-blue-600'
    return 'bg-gray-500/10 text-[#9CA3AF]'
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-500/20 text-emerald-600 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div>
        <h1 className="text-xl font-bold">Integrations</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">{crms.length} CRMs · {accounting.length} Accounting Platforms</p>
      </div>

      <div className="flex gap-2">
        {['all', 'crm', 'accounting'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)}
            className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (filter === f ? 'bg-gray-100 text-white' : 'text-[#9CA3AF] hover:text-[#4B5563]')}>
            {f === 'all' ? 'All' : f === 'crm' ? 'CRMs (' + crms.length + ')' : 'Accounting (' + accounting.length + ')'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(int => (
          <div key={int.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-[#E5E7EB] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{int.icon}</span>
                <div>
                  <div className="text-sm font-semibold">{int.name}</div>
                  <span className={"text-[9px] px-1.5 py-0.5 rounded font-medium " + statusBadge(int.status)}>
                    {int.status === 'available' ? 'AVAILABLE' : int.status === 'beta' ? 'BETA' : 'COMING SOON'}
                  </span>
                </div>
              </div>
              {connected.has(int.id) && <span className="text-emerald-600 text-xs font-medium">Connected ✓</span>}
            </div>
            <p className="text-xs text-[#9CA3AF] mb-3">{int.description}</p>
            <div className="text-[10px] text-[#6B7280] mb-3">{int.category.toUpperCase()} · Plans: {int.plans.join(', ')}</div>

            {connecting === int.id ? (
              <div className="space-y-2">
                {int.configFields?.map(field => (
                  <input key={field} placeholder={field.replace(/_/g, ' ')}
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-xs" />
                ))}
                <div className="flex gap-2">
                  <button onClick={() => handleSave(int.id)} className="px-3 py-1.5 bg-[#1B2A4A] text-white rounded text-xs">Save</button>
                  <button onClick={() => setConnecting(null)} className="px-3 py-1.5 text-[#9CA3AF] text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => handleConnect(int)}
                className={"w-full py-2 rounded-lg text-xs font-medium transition-colors " +
                  (connected.has(int.id) ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' :
                   int.status === 'coming_soon' ? 'bg-white shadow-sm text-[#9CA3AF] border border-[#E5E7EB]' :
                   'bg-white shadow-sm text-white border border-[#E5E7EB] hover:bg-gray-100')}>
                {connected.has(int.id) ? 'Configure' : int.status === 'coming_soon' ? 'Notify Me' : 'Connect'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
