'use client'

import { useState, useEffect } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const hdrs = () => ({ 'x-admin-email': getEmail(), 'Content-Type': 'application/json' })

export default function CFOConsolePage() {
  const [tab, setTab] = useState<'dashboard' | 'invoices' | 'collections' | 'health' | 'forecast'>('dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  // ====== STATE ======
  const [invoices, setInvoices] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [selectedInv, setSelectedInv] = useState<any>(null)
  const [invAudit, setInvAudit] = useState<any[]>([])
  const [editMode, setEditMode] = useState(false)
  const [editingLI, setEditingLI] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ description: '', qty: 0, unitPrice: 0 })

  const [collections, setCollections] = useState<any>(null)
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null)

  const [health, setHealth] = useState<any>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [vendorDiscounts, setVendorDiscounts] = useState<any>(null)

  const [forecast, setForecast] = useState<any>(null)
  const [forecastPeriod, setForecastPeriod] = useState('90day')
  const [forecastLoading, setForecastLoading] = useState(false)

  // ====== LOADERS ======
  const loadInvoices = async () => {
    const r = await fetch('/api/cfo-invoices', { headers: { 'x-admin-email': getEmail() } })
    const d = await r.json()
    setInvoices(d.invoices || [])
    setSummary(d.summary)
  }

  const loadInvoiceDetail = async (id: string) => {
    const r = await fetch(`/api/cfo-invoices?view=detail&invoiceId=${id}`, { headers: { 'x-admin-email': getEmail() } })
    const d = await r.json()
    setSelectedInv(d.invoice)
    setInvAudit(d.auditLog || [])
  }

  const runCollections = async () => {
    setCollectionsLoading(true)
    const r = await fetch('/api/cfo-collections', { headers: { 'x-admin-email': getEmail() } })
    setCollections(await r.json())
    setCollectionsLoading(false)
  }

  const runHealth = async () => {
    setHealthLoading(true)
    const [hRes, vRes] = await Promise.all([
      fetch('/api/cfo-health?view=health', { headers: { 'x-admin-email': getEmail() } }),
      fetch('/api/cfo-health?view=vendor-discounts', { headers: { 'x-admin-email': getEmail() } }),
    ])
    setHealth(await hRes.json())
    setVendorDiscounts(await vRes.json())
    setHealthLoading(false)
  }

  const runForecast = async (period?: string) => {
    setForecastLoading(true)
    const p = period || forecastPeriod
    const r = await fetch(`/api/cfo-health?view=forecast&period=${p}`, { headers: { 'x-admin-email': getEmail() } })
    setForecast(await r.json())
    setForecastLoading(false)
  }

  useEffect(() => { loadInvoices() }, [])
  useEffect(() => {
    if (tab === 'collections' && !collections) runCollections()
    if (tab === 'health' && !health) runHealth()
    if (tab === 'forecast' && !forecast) runForecast()
  }, [tab])

  // ====== ACTIONS ======
  const saveLineItem = async (invoiceId: string, liId: string) => {
    await fetch('/api/cfo-invoices', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'edit-line-item', invoiceId, lineItemId: liId, ...editForm }) })
    showToast('Line item updated + Odoo synced')
    setEditingLI(null)
    loadInvoiceDetail(invoiceId)
    loadInvoices()
  }

  const recordPayment = async (invoiceId: string, amount: number) => {
    await fetch('/api/cfo-invoices', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'record-payment', invoiceId, amount }) })
    showToast('Payment recorded')
    loadInvoiceDetail(invoiceId)
    loadInvoices()
  }

  const STATUS_COLORS: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-400', overdue: 'bg-rose-500/10 text-rose-400',
    partial: 'bg-amber-500/10 text-amber-400', sent: 'bg-blue-500/10 text-blue-400', draft: 'bg-gray-500/10 text-gray-400',
  }
  const URGENCY_COLORS: Record<string, string> = {
    gentle: 'bg-blue-500/10 text-blue-400 border-blue-500/20', firm: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    escalated: 'bg-orange-500/10 text-orange-400 border-orange-500/20', critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }
  const HEALTH_COLORS: Record<string, string> = { good: 'text-emerald-400', warning: 'text-amber-400', critical: 'text-rose-400', info: 'text-gray-300' }

  const tabs = [
    { key: 'dashboard', label: 'Overview', icon: '\uD83D\uDCCA' },
    { key: 'invoices', label: 'Invoice Drill-Down', icon: '\uD83D\uDCCB' },
    { key: 'collections', label: 'AI Collections', icon: '\uD83D\uDCE8' },
    { key: 'health', label: 'Financial Health', icon: '\uD83E\uDE7A' },
    { key: 'forecast', label: 'Cash Forecast', icon: '\uD83D\uDCC8' },
  ]

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">CFO Intelligence Console</h1><p className="text-sm text-gray-500 mt-1">Interactive receivables, AI collections, financial health scoring</p></div>
        {summary && (
          <div className="flex gap-4 text-right">
            <div><div className="text-[9px] text-gray-500">Total AR</div><div className="font-mono font-bold">${summary.totalAR?.toLocaleString()}</div></div>
            <div><div className="text-[9px] text-gray-500">Overdue</div><div className="font-mono font-bold text-rose-400">${summary.overdueTotal?.toLocaleString()}</div></div>
            <div><div className="text-[9px] text-gray-500">Collected</div><div className="font-mono font-bold text-emerald-400">${summary.paidTotal?.toLocaleString()}</div></div>
          </div>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ' +
              (tab === t.key ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5')}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* DASHBOARD OVERVIEW */}
      {/* ================================================================ */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total AR', value: summary?.totalAR, color: 'text-white' },
              { label: 'Overdue', value: summary?.overdueTotal, color: 'text-rose-400' },
              { label: 'Invoices', value: summary?.invoiceCount, color: 'text-blue-400', fmt: false },
              { label: 'Overdue Count', value: summary?.overdueCount, color: 'text-rose-400', fmt: false },
            ].map((k, i) => (
              <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                <div className="text-[10px] text-gray-500 font-mono uppercase">{k.label}</div>
                <div className={`text-xl font-mono font-bold mt-1 ${k.color}`}>{k.fmt !== false ? '$' + (k.value || 0).toLocaleString() : k.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => { setTab('collections'); if (!collections) runCollections() }}
              className="bg-gradient-to-br from-rose-500/5 to-rose-500/10 border border-rose-500/20 rounded-xl p-5 text-left hover:border-rose-500/40 transition-all">
              <div className="text-lg mb-1">{'\uD83D\uDCE8'}</div>
              <div className="text-sm font-semibold">AI Collection Strategy</div>
              <div className="text-[10px] text-gray-500 mt-1">Scan overdue invoices and generate prioritized action plan</div>
            </button>
            <button onClick={() => { setTab('health'); if (!health) runHealth() }}
              className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-left hover:border-blue-500/40 transition-all">
              <div className="text-lg mb-1">{'\uD83E\uDE7A'}</div>
              <div className="text-sm font-semibold">Run Financial Analysis</div>
              <div className="text-[10px] text-gray-500 mt-1">Quick Ratio, DSO, Burn Rate, Health Score + action checklist</div>
            </button>
            <button onClick={() => { setTab('forecast'); if (!forecast) runForecast() }}
              className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-left hover:border-emerald-500/40 transition-all">
              <div className="text-lg mb-1">{'\uD83D\uDCC8'}</div>
              <div className="text-sm font-semibold">Cashflow Forecast</div>
              <div className="text-[10px] text-gray-500 mt-1">30/60/90-day and 12/24-month projections</div>
            </button>
          </div>

          {/* Recent Invoices */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">All Invoices</h3>
            {invoices.map(inv => (
              <button key={inv.id} onClick={() => { setSelectedInv(null); loadInvoiceDetail(inv.id); setTab('invoices') }}
                className="w-full flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors text-left px-2 rounded">
                <div className="flex items-center gap-3">
                  <span className={'text-[10px] font-mono px-2 py-0.5 rounded ' + (STATUS_COLORS[inv.status] || '')}>{inv.status}</span>
                  <div>
                    <div className="text-sm"><span className="text-blue-400 font-mono">{inv.number}</span> — {inv.client}</div>
                    <div className="text-[10px] text-gray-500">{inv.contactName} — Due: {inv.dueDate} {inv.daysOverdue > 0 ? `(${inv.daysOverdue}d overdue)` : ''}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold">${inv.amount?.toLocaleString()}</div>
                  {inv.amountPaid > 0 && inv.amountPaid < inv.amount && <div className="text-[10px] text-gray-500">Paid: ${inv.amountPaid?.toLocaleString()}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* INVOICE DRILL-DOWN */}
      {/* ================================================================ */}
      {tab === 'invoices' && (
        <div className="space-y-4">
          {!selectedInv ? (
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">Select an Invoice</h3>
              {invoices.map(inv => (
                <button key={inv.id} onClick={() => loadInvoiceDetail(inv.id)}
                  className="w-full flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] text-left px-2 rounded">
                  <span className="text-sm text-blue-400 font-mono">{inv.number}</span>
                  <span className="text-sm">{inv.client}</span>
                  <span className={'text-[10px] px-2 py-0.5 rounded ' + (STATUS_COLORS[inv.status] || '')}>{inv.status}</span>
                  <span className="font-mono font-bold">${inv.amount?.toLocaleString()}</span>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedInv(null)} className="text-xs text-gray-500 hover:text-white">{'\u2190'} All Invoices</button>
                <span className="text-gray-700">|</span>
                <button onClick={() => setEditMode(!editMode)} className={'text-xs px-3 py-1 rounded ' + (editMode ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-400')}>{editMode ? 'Exit Edit Mode' : 'Edit Mode'}</button>
              </div>

              {/* Invoice Header */}
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold font-mono text-blue-400">{selectedInv.number}</div>
                    <div className="text-sm text-gray-400 mt-1">{selectedInv.client} — {selectedInv.contactName}</div>
                  </div>
                  <div className="text-right">
                    <span className={'text-xs px-3 py-1 rounded ' + (STATUS_COLORS[selectedInv.status] || '')}>{selectedInv.status}</span>
                    <div className="text-3xl font-mono font-bold mt-2">${selectedInv.amount?.toLocaleString()}</div>
                    {selectedInv.amountPaid > 0 && <div className="text-sm text-gray-500 mt-1">Paid: ${selectedInv.amountPaid?.toLocaleString()} — Balance: ${(selectedInv.amount - selectedInv.amountPaid).toLocaleString()}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div><span className="text-gray-500">Issue Date:</span> <span className="font-mono">{selectedInv.issueDate}</span></div>
                  <div><span className="text-gray-500">Due Date:</span> <span className="font-mono">{selectedInv.dueDate}</span></div>
                  <div><span className="text-gray-500">Odoo ID:</span> <span className="font-mono text-gray-400">{selectedInv.odooId}</span></div>
                  <div><span className="text-gray-500">Reliability:</span> <span className="font-mono">{selectedInv.vendorReliabilityScore}/100</span></div>
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">Line Items {editMode && <span className="text-amber-400 text-[10px] ml-2">EDIT MODE</span>}</h3>
                <table className="w-full text-xs">
                  <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
                    <th className="text-left py-2 w-1/2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Total</th>
                    {editMode && <th className="text-right py-2 w-16">Action</th>}
                  </tr></thead>
                  <tbody>
                    {selectedInv.lineItems?.map((li: any) => (
                      <tr key={li.id} className="border-b border-white/[0.03]">
                        {editingLI === li.id ? (
                          <>
                            <td className="py-2"><input value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs" /></td>
                            <td className="py-2"><input value={editForm.qty} onChange={e => setEditForm({...editForm, qty: parseFloat(e.target.value) || 0})} type="number" className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-right" /></td>
                            <td className="py-2"><input value={editForm.unitPrice} onChange={e => setEditForm({...editForm, unitPrice: parseFloat(e.target.value) || 0})} type="number" className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-right" /></td>
                            <td className="py-2 text-right font-mono">${(editForm.qty * editForm.unitPrice).toLocaleString()}</td>
                            <td className="py-2 text-right">
                              <button onClick={() => saveLineItem(selectedInv.id, li.id)} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] mr-1">Save</button>
                              <button onClick={() => setEditingLI(null)} className="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-[10px]">X</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 text-gray-300">{li.description}</td>
                            <td className="py-2 text-right font-mono">{li.qty}</td>
                            <td className="py-2 text-right font-mono">${li.unitPrice?.toLocaleString()}</td>
                            <td className="py-2 text-right font-mono font-bold">${li.total?.toLocaleString()}</td>
                            {editMode && <td className="py-2 text-right"><button onClick={() => { setEditingLI(li.id); setEditForm({ description: li.description, qty: li.qty, unitPrice: li.unitPrice }) }} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px]">Edit</button></td>}
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {selectedInv.status !== 'paid' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => recordPayment(selectedInv.id, selectedInv.amount - selectedInv.amountPaid)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium">
                      Record Full Payment (${(selectedInv.amount - selectedInv.amountPaid).toLocaleString()})
                    </button>
                  </div>
                )}
              </div>

              {/* Audit Log */}
              {invAudit.length > 0 && (
                <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3">Audit Log</h3>
                  {invAudit.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-400 font-mono">{a.action}</span>
                        <span className="text-gray-500">{a.userId}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {a.before && <span className="text-gray-600">Before: {JSON.stringify(a.before).slice(0, 50)}</span>}
                        {a.after && <span className="text-gray-400">After: {JSON.stringify(a.after).slice(0, 50)}</span>}
                        <span className="text-[10px] text-gray-600 font-mono">{new Date(a.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* AI COLLECTIONS */}
      {/* ================================================================ */}
      {tab === 'collections' && (
        <div className="space-y-4">
          {collectionsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-sm text-gray-400">AI is analyzing your overdue ledger...</div>
              <div className="text-[10px] text-gray-600 mt-1">Factoring vendor reliability scores into collection strategy</div>
            </div>
          ) : collections && (
            <>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-[#0A0E15] border border-rose-500/20 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 font-mono uppercase">Total Overdue</div>
                  <div className="text-2xl font-mono font-bold text-rose-400 mt-1">${collections.totalOverdue?.toLocaleString()}</div>
                </div>
                {['gentle', 'firm', 'escalated', 'critical'].map(u => (
                  <div key={u} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] text-gray-500 font-mono uppercase capitalize">{u}</div>
                    <div className="text-2xl font-mono font-bold mt-1">{(collections.summary as any)?.[u]}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Prioritized Collection Queue</h3>
                <button onClick={runCollections} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded text-xs">Re-Analyze</button>
              </div>

              {collections.strategies?.map((s: any) => (
                <div key={s.invoice.id} className={'bg-[#0A0E15] border rounded-xl p-5 ' + (URGENCY_COLORS[s.strategy.urgency]?.split(' ').find((c: string) => c.startsWith('border')) || 'border-white/5')}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={'text-[10px] font-mono px-2 py-0.5 rounded border ' + (URGENCY_COLORS[s.strategy.urgency] || '')}>{s.strategy.urgency.toUpperCase()}</span>
                      <span className="text-sm font-mono text-blue-400">{s.invoice.number}</span>
                      <span className="text-sm">{s.invoice.client} — {s.invoice.contactName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">${s.outstanding?.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500">{s.invoice.daysOverdue}d overdue — reliability: {s.invoice.vendorReliabilityScore}/100</div>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] rounded-lg p-3 mb-3">
                    <div className="text-xs font-medium text-amber-400 mb-1">{s.strategy.action}</div>
                    <div className="text-[10px] text-gray-400">{s.strategy.reasoning}</div>
                    <div className="text-[10px] text-gray-500 mt-1">Channel: {s.strategy.channel} — Follow up: {s.strategy.followUp}</div>
                  </div>

                  {s.strategy.discountOffer && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2 mb-2 text-[10px] text-emerald-400">{s.strategy.discountOffer.offer}</div>
                  )}

                  <button onClick={() => setExpandedStrategy(expandedStrategy === s.invoice.id ? null : s.invoice.id)}
                    className="text-[10px] text-blue-400 hover:text-blue-300">{expandedStrategy === s.invoice.id ? 'Hide' : 'View'} Draft Message</button>

                  {expandedStrategy === s.invoice.id && (
                    <div className="mt-2 bg-white/[0.03] border border-white/5 rounded-lg p-4">
                      <pre className="text-[11px] text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{s.strategy.template}</pre>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* FINANCIAL HEALTH */}
      {/* ================================================================ */}
      {tab === 'health' && (
        <div className="space-y-4">
          {healthLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-sm text-gray-400">AI is analyzing your financial health...</div>
              <div className="text-[10px] text-gray-600 mt-1">Calculating Quick Ratio, DSO, Burn Rate</div>
            </div>
          ) : health && (
            <>
              {/* Health Score */}
              <div className="bg-gradient-to-br from-[#0A0E15] to-[#0D1117] border border-white/10 rounded-2xl p-8 text-center">
                <div className="text-[10px] text-gray-500 uppercase mb-2">Financial Health Score</div>
                <div className={'text-6xl font-bold ' + (health.healthScore >= 70 ? 'text-emerald-400' : health.healthScore >= 50 ? 'text-amber-400' : 'text-rose-400')}>{health.healthScore}</div>
                <div className="text-sm text-gray-500 mt-2">{health.healthScore >= 70 ? 'Healthy' : health.healthScore >= 50 ? 'Needs Attention' : 'Critical'}</div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(health.metrics || {}).map(([key, m]: [string, any]) => (
                  <div key={key} className="bg-[#0A0E15] border border-white/5 rounded-xl p-3">
                    <div className="text-[9px] text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className={`text-lg font-mono font-bold mt-1 ${HEALTH_COLORS[m.status] || ''}`}>
                      {typeof m.value === 'number' && m.value > 999 ? '$' + m.value.toLocaleString() : m.value}{m.unit === 'days' ? 'd' : m.unit === 'months' ? 'mo' : ''}
                    </div>
                    {m.target && <div className="text-[9px] text-gray-600">Target: {m.target}{m.unit === 'days' ? 'd' : ''}</div>}
                  </div>
                ))}
              </div>

              {/* Action Checklist */}
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">Action Checklist</h3>
                {health.checklist?.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-white/[0.03] last:border-0">
                    <span className={'text-[10px] px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ' +
                      (item.priority === 'critical' ? 'bg-rose-500/10 text-rose-400' : item.priority === 'high' ? 'bg-amber-500/10 text-amber-400' : item.priority === 'medium' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400')}>{item.priority}</span>
                    <div>
                      <div className="text-sm font-medium">{item.action}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vendor Discounts */}
              {vendorDiscounts?.opportunities?.length > 0 && (
                <div className="bg-[#0A0E15] border border-emerald-500/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Early-Pay Discount Opportunities</h3>
                    <span className="text-xs font-mono text-emerald-400">Save ${vendorDiscounts.totalPotentialSavings}/mo</span>
                  </div>
                  {vendorDiscounts.opportunities.map((o: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                      <div><div className="text-sm">{o.vendor}</div><div className="text-[10px] text-gray-500">{o.terms}</div></div>
                      <span className="text-sm font-mono text-emerald-400">Save ${o.potentialSavings}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* CASH FORECAST */}
      {/* ================================================================ */}
      {tab === 'forecast' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['30day', '60day', '90day', '12month', '24month'].map(p => (
              <button key={p} onClick={() => { setForecastPeriod(p); runForecast(p) }}
                className={'px-3 py-1.5 rounded-lg text-xs font-medium ' + (forecastPeriod === p ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 bg-white/5')}>
                {p.replace('day', ' Day').replace('month', ' Month')}
              </button>
            ))}
          </div>

          {forecastLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-sm text-gray-400">Generating cashflow projection...</div>
            </div>
          ) : forecast && (
            <>
              {forecast.alerts?.map((a: any, i: number) => (
                <div key={i} className={'border rounded-xl p-3 text-sm ' + (a.severity === 'critical' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' : a.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400')}>{a.message}</div>
              ))}

              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
                    <th className="text-left py-2">Month</th><th className="text-right">Revenue</th><th className="text-right">Expenses</th><th className="text-right">Debt</th><th className="text-right">Net</th><th className="text-right">Cash</th><th className="text-right">Runway</th>
                  </tr></thead>
                  <tbody>
                    {forecast.projections?.map((p: any) => (
                      <tr key={p.month} className="border-b border-white/[0.03]">
                        <td className="py-2 text-gray-300">{p.label}</td>
                        <td className="py-2 text-right font-mono text-blue-400">${p.revenue?.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono">${p.expenses?.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-rose-400">${p.debtService?.toLocaleString()}</td>
                        <td className={'py-2 text-right font-mono font-bold ' + (p.netCash >= 0 ? 'text-emerald-400' : 'text-rose-400')}>${p.netCash?.toLocaleString()}</td>
                        <td className={'py-2 text-right font-mono ' + (p.endingCash < 0 ? 'text-rose-400' : '')}>${p.endingCash?.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-gray-500">{p.runwayMonths}mo</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
