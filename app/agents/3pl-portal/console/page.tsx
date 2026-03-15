'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const fmt = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  onboarding: { bg: 'bg-blue-50', text: 'text-blue-600' },
  suspended: { bg: 'bg-rose-50', text: 'text-rose-600' },
  terminated: { bg: 'bg-gray-100', text: 'text-gray-500' },
}
const badge = (s: string) => {
  const st = STATUS_STYLES[s] || STATUS_STYLES.terminated
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${st.bg} ${st.text}`}>{s}</span>
}

export default function ThreePLPortalConsole() {
  useTrackConsoleView('3pl-portal')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [detail, setDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ customerName: '', customerCode: '', contactName: '', contactEmail: '', contactPhone: '', monthlyMinimum: '', storageRate: '', handlingIn: '', handlingOut: '', paymentTerms: 'Net 30', notes: '' })
  const [adding, setAdding] = useState(false)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  const load = () => {
    setLoading(true)
    fetch('/api/agents/3pl-portal?view=customers')
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openDetail = async (code: string) => {
    setDetailLoading(true)
    try {
      const r = await fetch('/api/agents/3pl-portal?view=detail&code=' + code)
      const d = await r.json()
      setDetail(d)
      setSelected(code)
    } catch { show('Failed to load customer details') }
    setDetailLoading(false)
  }

  const updateStatus = async (customerId: string, status: string) => {
    const res = await fetch('/api/agents/3pl-portal', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-status', customerId, status }),
    })
    const d = await res.json()
    if (d.success) { show('Status updated to ' + status); load(); setSelected(null); setDetail(null) }
    else show('Error: ' + d.error)
  }

  const addCustomer = async () => {
    setAdding(true)
    const res = await fetch('/api/agents/3pl-portal', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-customer', ...addForm,
        monthlyMinimum: parseFloat(addForm.monthlyMinimum) || 0,
        storageRate: parseFloat(addForm.storageRate) || 0,
        handlingIn: parseFloat(addForm.handlingIn) || 0,
        handlingOut: parseFloat(addForm.handlingOut) || 0,
      }),
    })
    const d = await res.json()
    if (d.success) { show('Customer created: ' + d.customer.customer_code); setShowAdd(false); setAddForm({ customerName: '', customerCode: '', contactName: '', contactEmail: '', contactPhone: '', monthlyMinimum: '', storageRate: '', handlingIn: '', handlingOut: '', paymentTerms: 'Net 30', notes: '' }); load() }
    else show('Error: ' + d.error)
    setAdding(false)
  }

  const customers = data?.customers || []
  const summary = data?.summary || {}
  const filtered = customers.filter((c: any) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false
    if (search && !c.customer_name.toLowerCase().includes(search.toLowerCase()) && !c.customer_code.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-[1200px] mx-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDE9A'} 3PL Customer Portal Admin</h1>
            <p className="text-sm text-[#9CA3AF]">Customer management, contracts, and portal access</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${data?.source === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
              {data?.source === 'live' ? 'Live' : 'Demo'}
            </span>
            <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg text-sm font-medium hover:bg-[#2A9D8F]/90">
              + Add Customer
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Customers', value: summary.total || 0, color: '#1B2A4A' },
            { label: 'Active', value: summary.active || 0, color: '#059669' },
            { label: 'Onboarding', value: summary.onboarding || 0, color: '#2563EB' },
            { label: 'Total Pallets', value: (summary.totalPallets || 0).toLocaleString(), color: '#1B2A4A' },
            { label: 'Monthly Revenue', value: fmt(summary.monthlyRevenue || 0), color: '#2A9D8F' },
          ].map((k, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
              <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{k.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
            className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white" />
          <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-lg p-1">
            {['all', 'active', 'onboarding', 'suspended'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === s ? 'bg-[#1B2A4A] text-white' : 'text-[#6B7280] hover:bg-gray-50'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-[10px] font-bold text-[#9CA3AF] uppercase">Code</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#9CA3AF] uppercase">Company</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#9CA3AF] uppercase">Contact</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#9CA3AF] uppercase">Status</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#9CA3AF] uppercase">SKUs</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#9CA3AF] uppercase">Open Orders</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#9CA3AF] uppercase">Balance</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#9CA3AF] uppercase">Contract End</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#9CA3AF] uppercase">Portal</th>
            </tr></thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.customer_code} className="border-t border-[#F4F5F7] hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(c.customer_code)}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[#1B2A4A]">{c.customer_code}</td>
                  <td className="px-4 py-3 text-xs font-medium text-[#1B2A4A]">{c.customer_name}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-[#4B5563]">{c.contact_name}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{c.contact_email}</p>
                  </td>
                  <td className="px-4 py-3">{badge(c.status)}</td>
                  <td className="px-4 py-3 text-xs text-[#1B2A4A] font-medium">{c.inventory_count || 0}</td>
                  <td className="px-4 py-3 text-xs text-[#1B2A4A] font-medium">{c.open_orders || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-bold ${c.has_overdue ? 'text-rose-600' : 'text-[#1B2A4A]'}`}>
                      {fmt(c.current_balance || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{c.contract_end ? new Date(c.contract_end).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <a href={'/portal/' + c.customer_code} target="_blank" onClick={e => e.stopPropagation()} className="text-[#2A9D8F] hover:underline text-xs font-medium">
                      Open
                    </a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setSelected(null); setDetail(null) }}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" /></div>
            ) : detail?.customer ? (
              <div>
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#1B2A4A]">{detail.customer.customer_name}</h2>
                    <p className="text-xs text-[#9CA3AF]">{detail.customer.customer_code} | {detail.customer.contact_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {badge(detail.customer.status)}
                    <button onClick={() => { setSelected(null); setDetail(null) }} className="text-[#9CA3AF] hover:text-[#1B2A4A] text-lg ml-2">{'\u2715'}</button>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {/* Contract & Rates */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#F4F5F7] rounded-lg p-3">
                      <p className="text-[9px] text-[#9CA3AF] uppercase">Monthly Min</p>
                      <p className="text-sm font-bold text-[#1B2A4A]">{fmt(detail.customer.monthly_minimum || 0)}</p>
                    </div>
                    <div className="bg-[#F4F5F7] rounded-lg p-3">
                      <p className="text-[9px] text-[#9CA3AF] uppercase">Storage Rate</p>
                      <p className="text-sm font-bold text-[#1B2A4A]">{fmt(detail.customer.storage_rate_pallet || 0)}/pallet</p>
                    </div>
                    <div className="bg-[#F4F5F7] rounded-lg p-3">
                      <p className="text-[9px] text-[#9CA3AF] uppercase">Handling In</p>
                      <p className="text-sm font-bold text-[#1B2A4A]">{fmt(detail.customer.handling_rate_in || 0)}/pallet</p>
                    </div>
                    <div className="bg-[#F4F5F7] rounded-lg p-3">
                      <p className="text-[9px] text-[#9CA3AF] uppercase">Handling Out</p>
                      <p className="text-sm font-bold text-[#1B2A4A]">{fmt(detail.customer.handling_rate_out || 0)}/pallet</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#F4F5F7] rounded-lg p-3">
                      <p className="text-[9px] text-[#9CA3AF] uppercase">Payment Terms</p>
                      <p className="text-sm font-bold text-[#1B2A4A]">{detail.customer.payment_terms}</p>
                    </div>
                    <div className="bg-[#F4F5F7] rounded-lg p-3">
                      <p className="text-[9px] text-[#9CA3AF] uppercase">Auto-Pay</p>
                      <p className="text-sm font-bold" style={{ color: detail.customer.auto_pay_enabled ? '#059669' : '#DC2626' }}>{detail.customer.auto_pay_enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div className="bg-[#F4F5F7] rounded-lg p-3">
                      <p className="text-[9px] text-[#9CA3AF] uppercase">Contract Start</p>
                      <p className="text-sm font-bold text-[#1B2A4A]">{detail.customer.contract_start ? new Date(detail.customer.contract_start).toLocaleDateString() : '-'}</p>
                    </div>
                    <div className="bg-[#F4F5F7] rounded-lg p-3">
                      <p className="text-[9px] text-[#9CA3AF] uppercase">Contract End</p>
                      <p className="text-sm font-bold text-[#1B2A4A]">{detail.customer.contract_end ? new Date(detail.customer.contract_end).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>
                  {detail.customer.notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-800">{detail.customer.notes}</p>
                    </div>
                  )}

                  {/* Inventory summary */}
                  <div>
                    <h3 className="text-sm font-bold text-[#1B2A4A] mb-2">Inventory ({(detail.inventory || []).length} SKUs)</h3>
                    {(detail.inventory || []).length > 0 ? (
                      <div className="bg-[#F4F5F7] rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-gray-100"><th className="px-3 py-2 text-left font-bold text-[#9CA3AF]">SKU</th><th className="px-3 py-2 text-left font-bold text-[#9CA3AF]">Description</th><th className="px-3 py-2 text-right font-bold text-[#9CA3AF]">Qty</th><th className="px-3 py-2 text-left font-bold text-[#9CA3AF]">Zone</th></tr></thead>
                          <tbody>{(detail.inventory || []).slice(0, 10).map((i: any) => (
                            <tr key={i.id} className="border-t border-gray-200">
                              <td className="px-3 py-1.5 font-mono font-bold text-[#1B2A4A]">{i.sku}</td>
                              <td className="px-3 py-1.5 text-[#6B7280]">{i.description}</td>
                              <td className="px-3 py-1.5 text-right font-bold text-[#1B2A4A]">{(i.quantity_on_hand || 0).toLocaleString()}</td>
                              <td className="px-3 py-1.5 text-[#6B7280]">{i.warehouse_zone}-{i.bin_location}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    ) : <p className="text-xs text-[#9CA3AF]">No inventory data.</p>}
                  </div>

                  {/* Recent orders */}
                  <div>
                    <h3 className="text-sm font-bold text-[#1B2A4A] mb-2">Recent Orders ({(detail.orders || []).length})</h3>
                    {(detail.orders || []).length > 0 ? (
                      <div className="space-y-1">
                        {(detail.orders || []).slice(0, 5).map((o: any) => (
                          <div key={o.id} className="flex items-center justify-between bg-[#F4F5F7] rounded-lg px-3 py-2">
                            <div><span className="text-xs font-mono font-bold text-[#1B2A4A]">{o.order_number}</span><span className="text-xs text-[#9CA3AF] ml-2">{o.ship_to_name}</span></div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : o.status === 'shipped' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{o.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-[#9CA3AF]">No orders.</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-[#E5E7EB]">
                    <a href={'/portal/' + detail.customer.customer_code} target="_blank" className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg text-xs font-medium hover:bg-[#2A9D8F]/90">Open Portal</a>
                    {detail.customer.status === 'active' && (
                      <button onClick={() => updateStatus(detail.customer.id, 'suspended')} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-medium hover:bg-rose-100">Suspend</button>
                    )}
                    {detail.customer.status === 'suspended' && (
                      <button onClick={() => updateStatus(detail.customer.id, 'active')} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100">Reactivate</button>
                    )}
                    {detail.customer.status === 'onboarding' && (
                      <button onClick={() => updateStatus(detail.customer.id, 'active')} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100">Activate</button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-[#9CA3AF]">Customer not found.</div>
            )}
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1B2A4A]">Add New Customer</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#9CA3AF] hover:text-[#1B2A4A] text-lg">{'\u2715'}</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Company Name *</label><input value={addForm.customerName} onChange={e => setAddForm({...addForm, customerName: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1" /></div>
                <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Customer Code *</label><input value={addForm.customerCode} onChange={e => setAddForm({...addForm, customerCode: e.target.value.toUpperCase()})} placeholder="e.g. ABC-001" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1 font-mono" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Contact Name</label><input value={addForm.contactName} onChange={e => setAddForm({...addForm, contactName: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1" /></div>
                <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Email</label><input value={addForm.contactEmail} onChange={e => setAddForm({...addForm, contactEmail: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1" /></div>
                <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Phone</label><input value={addForm.contactPhone} onChange={e => setAddForm({...addForm, contactPhone: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1" /></div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Monthly Min ($)</label><input value={addForm.monthlyMinimum} onChange={e => setAddForm({...addForm, monthlyMinimum: e.target.value})} type="number" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1" /></div>
                <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Storage $/pallet</label><input value={addForm.storageRate} onChange={e => setAddForm({...addForm, storageRate: e.target.value})} type="number" step="0.01" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1" /></div>
                <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">In $/pallet</label><input value={addForm.handlingIn} onChange={e => setAddForm({...addForm, handlingIn: e.target.value})} type="number" step="0.01" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1" /></div>
                <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Out $/pallet</label><input value={addForm.handlingOut} onChange={e => setAddForm({...addForm, handlingOut: e.target.value})} type="number" step="0.01" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1" /></div>
              </div>
              <div><label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Notes</label><textarea value={addForm.notes} onChange={e => setAddForm({...addForm, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm mt-1" /></div>
              <button onClick={addCustomer} disabled={!addForm.customerName || !addForm.customerCode || adding}
                className="w-full py-2.5 bg-[#2A9D8F] text-white rounded-lg text-sm font-medium hover:bg-[#2A9D8F]/90 disabled:opacity-50">
                {adding ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-[#1B2A4A] text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50">{toast}</div>
      )}
    </div>
  )
}
