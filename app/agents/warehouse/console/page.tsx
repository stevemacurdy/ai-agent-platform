'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const fmt = (n: number) => '$' + n.toLocaleString()
const pct = (n: number) => n + '%'
const statusColors: Record<string,string> = { pending:'bg-gray-100 text-gray-600', picking:'bg-blue-50 text-blue-600', packing:'bg-violet-50 text-violet-600', shipped:'bg-amber-50 text-amber-600', delivered:'bg-emerald-50 text-emerald-600', cancelled:'bg-rose-50 text-rose-600' }
const prioColors: Record<string,string> = { rush:'bg-rose-50 text-rose-600 border-rose-200', express:'bg-amber-50 text-amber-600 border-amber-200', standard:'bg-gray-50 text-gray-600 border-gray-200' }

export default function WarehouseConsole() {
  useTrackConsoleView('warehouse')
  const { profile, loading: authLoading } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<string | null>(null)
  const [modalData, setModalData] = useState<any>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetch('/api/warehouse-data?view=dashboard')
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openModal = async (view: string) => {
    setModal(view); setModalLoading(true)
    try { const r = await fetch('/api/warehouse-data?view=' + view); const d = await r.json(); setModalData(d) }
    catch {} finally { setModalLoading(false) }
  }

  const handleAi = async (action: string) => {
    setAiLoading(true); setAiResult(''); setModal('ai-' + action); setModalLoading(false)
    const token = localStorage.getItem('woulfai_token') || ''
    try {
      const res = await fetch('/api/agents/warehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ action, data: data?.summary || {} }),
      })
      const result = await res.json()
      setAiResult(result.result || result.error || JSON.stringify(result, null, 2))
    } catch (e: any) { setAiResult('Error: ' + e.message) }
    setAiLoading(false)
  }

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#F5920B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const s = data?.summary || {}

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
              🏭 Warehouse Operations Console
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Real-time inventory, orders, and zone management</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ' + (data?.source === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20' : 'bg-amber-50 text-amber-600 border-amber-500/20')}>
              <span className={'w-1.5 h-1.5 rounded-full ' + (data?.source === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
              {data?.source === 'live' ? 'Live — ' + data.provider : 'Demo Data'}
            </span>
            <Link href="/dashboard" className="px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] rounded-xl text-xs font-medium hover:border-[#2A9D8F] transition-all">← Dashboard</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total SKUs', value: s.totalSKUs || 0, sub: (s.totalItems || 0).toLocaleString() + ' units', color: '#1B2A4A' },
            { label: 'Inventory Value', value: fmt(s.inventoryValue || 0), sub: (s.lowStockAlerts || 0) + ' low stock alerts', color: s.lowStockAlerts > 0 ? '#EF4444' : '#2A9D8F' },
            { label: 'Open Orders', value: s.openOrders || 0, sub: fmt(s.openOrderValue || 0) + ' total', color: '#F5920B' },
            { label: 'Avg Utilization', value: pct(s.avgUtilization || 0), sub: (s.rushOrders || 0) + ' rush orders', color: (s.avgUtilization || 0) > 80 ? '#F5920B' : '#2A9D8F' },
          ].map((k, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="text-[9px] text-[#9CA3AF] uppercase font-bold">{k.label}</div>
              <div className="text-2xl font-mono font-extrabold mt-1" style={{ color: k.color }}>{k.value}</div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key:'inventory', icon:'📦', label:'Inventory', desc:'SKUs, stock levels, categories' },
            { key:'orders', icon:'📋', label:'Orders', desc:'All orders by status' },
            { key:'zones', icon:'🏢', label:'Zones', desc:'Utilization & capacity' },
            { key:'fulfillment', icon:'⚡', label:'Fulfillment', desc:'Priority queue' },
          ].map(a => (
            <button key={a.key} onClick={() => openModal(a.key)} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-left hover:border-[#F5920B] hover:shadow-md transition-all group">
              <span className="text-xl">{a.icon}</span>
              <div className="text-xs font-bold text-[#1B2A4A] mt-2 group-hover:text-[#F5920B]">{a.label}</div>
              <div className="text-[10px] text-[#9CA3AF]">{a.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { action: 'optimize-routes', icon: '🛤️', label: 'Optimize Pick Routes', desc: 'AI-optimized picking paths' },
            { action: 'zone-rebalance', icon: '📊', label: 'Zone Rebalance', desc: 'AI zone utilization recommendations' },
            { action: 'shift-report', icon: '📝', label: 'Shift Report', desc: 'AI end-of-shift summary' },
          ].map(a => (
            <button key={a.action} onClick={() => handleAi(a.action)} disabled={aiLoading}
              className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all group disabled:opacity-50">
              <span className="text-xl">{a.icon}</span>
              <div className="text-xs font-bold text-white mt-2">{a.label}</div>
              <div className="text-[10px] text-white/60">{a.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">📋 Active Orders</h3>
            <div className="space-y-2">
              {(data?.topOrders || []).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0">
                  <div>
                    <div className="text-xs font-medium text-[#1B2A4A]">{o.orderNumber}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{o.customer} • {o.items} items</div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className={'text-[9px] font-bold px-2 py-0.5 rounded-full border ' + (prioColors[o.priority] || '')}>{o.priority}</span>
                    <span className={'text-[10px] font-medium px-2 py-0.5 rounded-full ' + (statusColors[o.status] || '')}>{o.status}</span>
                    <div className="text-sm font-mono font-bold text-[#1B2A4A] ml-2">{fmt(o.totalValue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-rose-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-rose-600 mb-3">⚠️ Low Stock Alerts</h3>
            {(data?.lowStock || []).length === 0 ? (
              <p className="text-xs text-emerald-600 py-4">All items above reorder point.</p>
            ) : (
              <div className="space-y-2">
                {(data?.lowStock || []).map((i: any) => (
                  <div key={i.id} className="flex items-center justify-between py-2 border-b border-rose-500/10 last:border-0">
                    <div>
                      <div className="text-xs font-medium text-[#1B2A4A]">{i.sku}</div>
                      <div className="text-[10px] text-[#9CA3AF]">{i.name} • {i.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-rose-500">{i.qty} <span className="text-[10px] text-[#9CA3AF]">/ {i.reorderPoint}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {(data?.recommendations || []).length > 0 && (
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">🤖 AI Recommendations</h3>
            <div className="space-y-2">
              {data.recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 text-sm">🏭</span>
                  <p className="text-xs text-white/70 leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1B2A4A] capitalize">{modal}</h2>
              <button onClick={() => setModal(null)} className="text-[#9CA3AF] hover:text-[#1B2A4A] text-xl">✕</button>
            </div>
            {modalLoading ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-[#F5920B] border-t-transparent rounded-full animate-spin" /></div>
            ) : modal === 'inventory' ? (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(modalData?.analysis?.byCategory || []).slice(0,6).map((c: any) => (
                    <div key={c.category} className="bg-[#F4F5F7] rounded-lg p-3">
                      <div className="text-[9px] text-[#9CA3AF] uppercase">{c.category}</div>
                      <div className="text-sm font-bold text-[#1B2A4A]">{c.totalQty.toLocaleString()} units</div>
                      <div className="text-[10px] text-[#9CA3AF]">{fmt(Math.round(c.totalValue))}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {(modalData?.items || []).map((i: any) => (
                    <div key={i.id} className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0">
                      <div><span className="text-xs font-mono font-bold text-[#1B2A4A]">{i.sku}</span><span className="text-xs text-[#9CA3AF] ml-2">{i.name}</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-[#9CA3AF]">{i.location}</span>
                        <span className={'text-sm font-mono font-bold ' + (i.qty <= i.reorderPoint ? 'text-rose-500' : 'text-[#1B2A4A]')}>{i.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : modal === 'orders' ? (
              <div className="space-y-2">
                {(modalData?.orders || []).map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0">
                    <div><div className="text-xs font-bold text-[#1B2A4A]">{o.orderNumber}</div><div className="text-[10px] text-[#9CA3AF]">{o.customer} • {o.items} items</div></div>
                    <div className="flex items-center gap-2">
                      <span className={'text-[9px] font-bold px-2 py-0.5 rounded-full border ' + (prioColors[o.priority] || '')}>{o.priority}</span>
                      <span className={'text-[10px] font-medium px-2 py-0.5 rounded-full ' + (statusColors[o.status] || '')}>{o.status}</span>
                      <span className="text-sm font-mono font-bold text-[#1B2A4A]">{fmt(o.totalValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : modal === 'zones' ? (
              <div className="space-y-3">
                {(modalData?.zones || []).map((z: any) => (
                  <div key={z.id} className="bg-[#F4F5F7] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div><div className="text-sm font-bold text-[#1B2A4A]">{z.name}</div><div className="text-[10px] text-[#9CA3AF]">{z.type} • {z.temperature} • {z.items} items</div></div>
                      <span className={'text-lg font-bold ' + (z.utilization >= 85 ? 'text-rose-500' : z.utilization >= 60 ? 'text-amber-500' : 'text-emerald-600')}>{z.utilization}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div className={'h-full rounded-full ' + (z.utilization >= 85 ? 'bg-rose-500' : z.utilization >= 60 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: z.utilization + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : modal === 'fulfillment' ? (
              <div>
                {['rush','express','standard'].map(p => {
                  const orders = modalData?.byPriority?.[p] || []
                  if (orders.length === 0) return null
                  return (
                    <div key={p} className="mb-4">
                      <div className={'text-[10px] font-bold uppercase px-2 py-1 rounded-full inline-block mb-2 border ' + (prioColors[p] || '')}>{p} ({orders.length})</div>
                      {orders.map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0">
                          <div><div className="text-xs font-bold text-[#1B2A4A]">{o.orderNumber}</div><div className="text-[10px] text-[#9CA3AF]">{o.customer}</div></div>
                          <div className="flex items-center gap-2">
                            <span className={'text-[10px] font-medium px-2 py-0.5 rounded-full ' + (statusColors[o.status] || '')}>{o.status}</span>
                            <span className="text-sm font-mono font-bold text-[#1B2A4A]">{fmt(o.totalValue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ) : modal?.startsWith('ai-') ? (
              <div>
                {aiLoading ? (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <div className="w-5 h-5 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-[#6B7280]">AI analyzing...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[#4B5563] text-sm leading-relaxed">
                    {aiResult}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
