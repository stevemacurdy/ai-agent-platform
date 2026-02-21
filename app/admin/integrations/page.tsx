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
    if (status === 'available') return 'bg-emerald-500/10 text-emerald-400'
    if (status === 'beta') return 'bg-blue-500/10 text-blue-400'
    return 'bg-gray-500/10 text-gray-500'
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div>
        <h1 className="text-xl font-bold">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">{crms.length} CRMs · {accounting.length} Accounting Platforms</p>
      </div>

      <div className="flex gap-2">
        {['all', 'crm', 'accounting'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)}
            className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {f === 'all' ? 'All' : f === 'crm' ? 'CRMs (' + crms.length + ')' : 'Accounting (' + accounting.length + ')'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(int => (
          <div key={int.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
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
              {connected.has(int.id) && <span className="text-emerald-400 text-xs font-medium">Connected ✓</span>}
            </div>
            <p className="text-xs text-gray-500 mb-3">{int.description}</p>
            <div className="text-[10px] text-gray-600 mb-3">{int.category.toUpperCase()} · Plans: {int.plans.join(', ')}</div>

            {connecting === int.id ? (
              <div className="space-y-2">
                {int.configFields?.map(field => (
                  <input key={field} placeholder={field.replace(/_/g, ' ')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs" />
                ))}
                <div className="flex gap-2">
                  <button onClick={() => handleSave(int.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs">Save</button>
                  <button onClick={() => setConnecting(null)} className="px-3 py-1.5 text-gray-500 text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => handleConnect(int)}
                className={"w-full py-2 rounded-lg text-xs font-medium transition-colors " +
                  (connected.has(int.id) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                   int.status === 'coming_soon' ? 'bg-white/5 text-gray-500 border border-white/5' :
                   'bg-white/5 text-white border border-white/10 hover:bg-white/10')}>
                {connected.has(int.id) ? 'Configure' : int.status === 'coming_soon' ? 'Notify Me' : 'Connect'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
