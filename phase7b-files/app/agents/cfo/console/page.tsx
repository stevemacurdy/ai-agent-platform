'use client'

import { useState, useEffect } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const hdrs = () => ({ 'x-admin-email': getEmail(), 'Content-Type': 'application/json' })
const fmt = (n: number) => '$' + n.toLocaleString()

export default function CFOConsoleV2() {
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  // ====== CORE STATE ======
  const [invoices, setInvoices] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)

  // ====== MODAL STATE ======
  const [modal, setModal] = useState<'invoice' | 'filter' | 'collections' | 'health' | 'cashflow' | null>(null)
  const [selectedInv, setSelectedInv] = useState<any>(null)
  const [invAudit, setInvAudit] = useState<any[]>([])
  const [editMode, setEditMode] = useState(false)
  const [editingLI, setEditingLI] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ description: '', qty: 0, unitPrice: 0 })

  // ====== FILTER STATE ======
  const [filterLabel, setFilterLabel] = useState('')
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([])

  // ====== ANALYSIS STATE ======
  const [collections, setCollections] = useState<any>(null)
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null)
  const [health, setHealth] = useState<any>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [vendorDiscounts, setVendorDiscounts] = useState<any>(null)
  const [cashflow, setCashflow] = useState<any>(null)
  const [cashflowLoading, setCashflowLoading] = useState(false)
  const [expandedWindow, setExpandedWindow] = useState<string | null>(null)

  // ====== LOADERS ======
  const loadInvoices = async () => {
    const r = await fetch('/api/cfo-invoices', { headers: { 'x-admin-email': getEmail() } })
    const d = await r.json()
    setInvoices(d.invoices || [])
    setSummary(d.summary)
  }

  const openInvoice = async (id: string) => {
    const r = await fetch(`/api/cfo-invoices?view=detail&invoiceId=${id}`, { headers: { 'x-admin-email': getEmail() } })
    const d = await r.json()
    setSelectedInv(d.invoice)
    setInvAudit(d.auditLog || [])
    setEditMode(false)
    setEditingLI(null)
    setModal('invoice')
  }

  const openFilter = (label: string, filter: (inv: any) => boolean) => {
    setFilterLabel(label)
    setFilteredInvoices(invoices.filter(filter))
    setModal('filter')
  }

  const runCollections = async () => {
    setCollectionsLoading(true); setModal('collections')
    const r = await fetch('/api/cfo-collections', { headers: { 'x-admin-email': getEmail() } })
    setCollections(await r.json())
    setCollectionsLoading(false)
  }

  const runHealth = async () => {
    setHealthLoading(true); setModal('health')
    const [hRes, vRes] = await Promise.all([
      fetch('/api/cfo-health?view=health', { headers: { 'x-admin-email': getEmail() } }),
      fetch('/api/cfo-health?view=vendor-discounts', { headers: { 'x-admin-email': getEmail() } }),
    ])
    setHealth(await hRes.json())
    setVendorDiscounts(await vRes.json())
    setHealthLoading(false)
  }

  const runCashflow = async () => {
    setCashflowLoading(true); setModal('cashflow')
    const r = await fetch('/api/cfo-cashflow', { headers: { 'x-admin-email': getEmail() } })
    setCashflow(await r.json())
    setCashflowLoading(false)
  }

  useEffect(() => { loadInvoices() }, [])

  // ====== INVOICE ACTIONS ======
  const saveLineItem = async (invoiceId: string, liId: string) => {
    await fetch('/api/cfo-invoices', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'edit-line-item', invoiceId, lineItemId: liId, ...editForm }) })
    showToast('Line item updated + Odoo synced')
    setEditingLI(null)
    openInvoice(invoiceId)
    loadInvoices()
  }

  const recordPayment = async (invoiceId: string, amount: number) => {
    await fetch('/api/cfo-invoices', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'record-payment', invoiceId, amount }) })
    showToast('Payment recorded')
    openInvoice(invoiceId)
    loadInvoices()
  }

  const ST = { paid: 'bg-emerald-500/10 text-emerald-400', overdue: 'bg-rose-500/10 text-rose-400', partial: 'bg-amber-500/10 text-amber-400', sent: 'bg-blue-500/10 text-blue-400' }
  const URG = { gentle: 'border-blue-500/20 bg-blue-500/5', firm: 'border-amber-500/20 bg-amber-500/5', escalated: 'border-orange-500/20 bg-orange-500/5', critical: 'border-rose-500/20 bg-rose-500/5' }
  const HC = { good: 'text-emerald-400', warning: 'text-amber-400', critical: 'text-rose-400', info: 'text-gray-300' }

  // ====== BAR CHART COMPONENT ======
  const BarChart = ({ data }: { data: any[] }) => {
    const maxVal = Math.max(...data.map(d => Math.max(d.inflows.total, d.outflows.total, Math.abs(d.netCash))), 1)
    return (
      <div className="flex items-end gap-6 h-48 px-4">
        {data.map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 h-36 w-full justify-center">
              <div className="flex flex-col items-center w-8">
                <div className="text-[8px] text-emerald-400 font-mono mb-0.5">{fmt(w.inflows.total)}</div>
                <div className="w-full bg-emerald-500/40 rounded-t" style={{ height: Math.max(4, (w.inflows.total / maxVal) * 120) + 'px' }} />
              </div>
              <div className="flex flex-col items-center w-8">
                <div className="text-[8px] text-rose-400 font-mono mb-0.5">{fmt(w.outflows.total)}</div>
                <div className="w-full bg-rose-500/40 rounded-t" style={{ height: Math.max(4, (w.outflows.total / maxVal) * 120) + 'px' }} />
              </div>
              <div className="flex flex-col items-center w-8">
                <div className={'text-[8px] font-mono mb-0.5 ' + (w.netCash >= 0 ? 'text-blue-400' : 'text-rose-400')}>{fmt(w.netCash)}</div>
                <div className={'w-full rounded-t ' + (w.netCash >= 0 ? 'bg-blue-500/40' : 'bg-rose-500/60')} style={{ height: Math.max(4, (Math.abs(w.netCash) / maxVal) * 120) + 'px' }} />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 font-medium mt-1">{w.window}</div>
            <div className="text-[9px] text-gray-600">Cash: {fmt(w.endingCash)}</div>
          </div>
        ))}
      </div>
    )
  }

  // ====== MODAL BACKDROP ======
  const Modal = ({ children, wide }: { children: React.ReactNode; wide?: boolean }) => (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto" onClick={() => setModal(null)}>
      <div className="fixed inset-0 bg-black/70" />
      <div className={'relative bg-[#0B0F18] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ' + (wide ? 'w-[900px]' : 'w-[720px]')} onClick={e => e.stopPropagation()}>
        <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg z-10">{'\u2715'}</button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">CFO Intelligence Console</h1><p className="text-sm text-gray-500 mt-1">Click any number for source data. Click any button to trigger analysis.</p></div>
      </div>

      {/* ====== TRACEABLE KPIs ====== */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total AR', value: summary.totalAR, color: 'text-white', border: 'border-white/5', filter: () => true },
            { label: 'Overdue', value: summary.overdueTotal, color: 'text-rose-400', border: 'border-rose-500/20', filter: (i: any) => i.status === 'overdue' },
            { label: 'Collected', value: summary.paidTotal, color: 'text-emerald-400', border: 'border-emerald-500/20', filter: (i: any) => i.status === 'paid' },
            { label: 'Partial', value: invoices.filter(i => i.status === 'partial').reduce((s, i) => s + i.amount - i.amountPaid, 0), color: 'text-amber-400', border: 'border-amber-500/20', filter: (i: any) => i.status === 'partial' },
            { label: 'Invoices', value: summary.invoiceCount, color: 'text-blue-400', border: 'border-blue-500/20', filter: () => true, noFmt: true },
          ].map((k, idx) => (
            <button key={idx} onClick={() => openFilter(k.label, k.filter)}
              className={'bg-[#0A0E15] border rounded-xl p-4 text-left hover:bg-white/[0.02] transition-all cursor-pointer group ' + k.border}>
              <div className="text-[10px] text-gray-500 font-mono uppercase group-hover:text-gray-300">{k.label}</div>
              <div className={`text-xl font-mono font-bold mt-1 ${k.color}`}>{k.noFmt ? k.value : fmt(k.value || 0)}</div>
              <div className="text-[9px] text-gray-700 group-hover:text-gray-500 mt-1">Click for source invoices {'\u2192'}</div>
            </button>
          ))}
        </div>
      )}

      {/* ====== ACTION BUTTONS ====== */}
      <div className="grid grid-cols-4 gap-3">
        <button onClick={runCashflow} className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-left hover:border-blue-500/40 transition-all">
          <div className="text-lg mb-1">{'\uD83D\uDCC8'}</div>
          <div className="text-sm font-semibold">Cashflow Forecast</div>
          <div className="text-[10px] text-gray-500 mt-1">30/60/90-day with Odoo + HubSpot data</div>
        </button>
        <button onClick={runCollections} className="bg-gradient-to-br from-rose-500/5 to-rose-500/10 border border-rose-500/20 rounded-xl p-5 text-left hover:border-rose-500/40 transition-all">
          <div className="text-lg mb-1">{'\uD83D\uDCE8'}</div>
          <div className="text-sm font-semibold">AI Collection Strategy</div>
          <div className="text-[10px] text-gray-500 mt-1">Prioritized debtor queue + draft messages</div>
        </button>
        <button onClick={runHealth} className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-left hover:border-emerald-500/40 transition-all">
          <div className="text-lg mb-1">{'\uD83E\uDE7A'}</div>
          <div className="text-sm font-semibold">Run Analysis</div>
          <div className="text-[10px] text-gray-500 mt-1">Health Score, Quick Ratio, DSO, Burn Rate</div>
        </button>
        <button onClick={() => window.location.href = '/agents/cfo/payables'} className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-left hover:border-amber-500/40 transition-all">
          <div className="text-lg mb-1">{'\uD83D\uDCB3'}</div>
          <div className="text-sm font-semibold">Add Vendor Bill</div>
          <div className="text-[10px] text-gray-500 mt-1">Upload/camera {'\u2192'} AI extract {'\u2192'} review {'\u2192'} pay</div>
        </button>
      </div>

      {/* ====== INVOICE TABLE ====== */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">All Invoices <span className="text-[10px] text-gray-600 ml-2">Click any row to drill down</span></h3>
        <table className="w-full text-xs">
          <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
            <th className="text-left py-2">Invoice</th><th className="text-left">Client</th><th className="text-left">Contact</th><th className="text-right">Amount</th><th className="text-right">Paid</th><th className="text-right">Due</th><th className="text-center">Status</th>
          </tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} onClick={() => openInvoice(inv.id)} className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors">
                <td className="py-2.5 text-blue-400 font-mono">{inv.number}</td>
                <td className="py-2.5">{inv.client}</td>
                <td className="py-2.5 text-gray-400">{inv.contactName}</td>
                <td className="py-2.5 text-right font-mono font-bold">{fmt(inv.amount)}</td>
                <td className="py-2.5 text-right font-mono text-gray-500">{inv.amountPaid > 0 ? fmt(inv.amountPaid) : '—'}</td>
                <td className="py-2.5 text-right font-mono">{inv.dueDate} {inv.daysOverdue > 0 && <span className="text-rose-400 ml-1">({inv.daysOverdue}d)</span>}</td>
                <td className="py-2.5 text-center"><span className={'text-[10px] px-2 py-0.5 rounded ' + ((ST as any)[inv.status] || '')}>{inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================ */}
      {/* INVOICE DETAIL MODAL */}
      {/* ================================================================ */}
      {modal === 'invoice' && selectedInv && (
        <Modal>
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-2xl font-bold font-mono text-blue-400">{selectedInv.number}</div>
              <div className="text-sm text-gray-400 mt-1">{selectedInv.client} — {selectedInv.contactName}</div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-gray-500">Issued: <span className="font-mono">{selectedInv.issueDate}</span></span>
                <span className="text-gray-500">Due: <span className="font-mono">{selectedInv.dueDate}</span></span>
                <span className="text-gray-500">Odoo: <span className="font-mono text-gray-600">{selectedInv.odooId}</span></span>
              </div>
            </div>
            <div className="text-right">
              <span className={'text-xs px-3 py-1 rounded ' + ((ST as any)[selectedInv.status] || '')}>{selectedInv.status}</span>
              <div className="text-3xl font-mono font-bold mt-2">{fmt(selectedInv.amount)}</div>
              {selectedInv.amountPaid > 0 && <div className="text-sm text-gray-500">Paid: {fmt(selectedInv.amountPaid)} — Balance: {fmt(selectedInv.amount - selectedInv.amountPaid)}</div>}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase text-gray-500">Line Items</h4>
              <button onClick={() => setEditMode(!editMode)} className={'text-[10px] px-3 py-1 rounded ' + (editMode ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-400 hover:text-white')}>{editMode ? 'Exit Edit' : 'Edit Mode'}</button>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="text-[9px] text-gray-600 uppercase border-b border-white/5">
                <th className="text-left py-1.5 w-1/2">Description</th><th className="text-right">Qty</th><th className="text-right">Unit Price</th><th className="text-right">Total</th>{editMode && <th className="w-14" />}
              </tr></thead>
              <tbody>
                {selectedInv.lineItems?.map((li: any) => (
                  <tr key={li.id} className="border-b border-white/[0.03]">
                    {editingLI === li.id ? (
                      <>
                        <td className="py-1.5"><input value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs" /></td>
                        <td className="py-1.5"><input value={editForm.qty} onChange={e => setEditForm({...editForm, qty: parseFloat(e.target.value) || 0})} type="number" className="w-14 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-right" /></td>
                        <td className="py-1.5"><input value={editForm.unitPrice} onChange={e => setEditForm({...editForm, unitPrice: parseFloat(e.target.value) || 0})} type="number" className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-right" /></td>
                        <td className="py-1.5 text-right font-mono">{fmt(editForm.qty * editForm.unitPrice)}</td>
                        <td className="py-1.5 text-right"><button onClick={() => saveLineItem(selectedInv.id, li.id)} className="text-emerald-400 text-[10px] mr-1">Save</button><button onClick={() => setEditingLI(null)} className="text-gray-500 text-[10px]">X</button></td>
                      </>
                    ) : (
                      <>
                        <td className="py-1.5 text-gray-300">{li.description}</td>
                        <td className="py-1.5 text-right font-mono">{li.qty}</td>
                        <td className="py-1.5 text-right font-mono">{fmt(li.unitPrice)}</td>
                        <td className="py-1.5 text-right font-mono font-bold">{fmt(li.total)}</td>
                        {editMode && <td className="py-1.5 text-right"><button onClick={() => { setEditingLI(li.id); setEditForm({ description: li.description, qty: li.qty, unitPrice: li.unitPrice }) }} className="text-blue-400 text-[10px]">Edit</button></td>}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedInv.status !== 'paid' && (
              <button onClick={() => recordPayment(selectedInv.id, selectedInv.amount - selectedInv.amountPaid)}
                className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium">Record Payment ({fmt(selectedInv.amount - selectedInv.amountPaid)})</button>
            )}
          </div>

          {/* Audit Log */}
          {invAudit.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Audit Trail</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {invAudit.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between text-[10px] py-1 border-b border-white/[0.02]">
                    <div className="flex gap-2"><span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-mono">{a.action}</span><span className="text-gray-500">{a.userId}</span></div>
                    <div className="flex gap-2 text-gray-600">
                      {a.before && <span>Old: {typeof a.before === 'object' ? Object.entries(a.before).map(([k,v]) => `${k}:${v}`).join(', ') : String(a.before)}</span>}
                      {a.after && <span className="text-gray-400">New: {typeof a.after === 'object' ? Object.entries(a.after).map(([k,v]) => `${k}:${v}`).join(', ') : String(a.after)}</span>}
                      <span className="font-mono">{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ================================================================ */}
      {/* KPI FILTER MODAL */}
      {/* ================================================================ */}
      {modal === 'filter' && (
        <Modal>
          <h3 className="text-lg font-bold mb-1">{filterLabel}</h3>
          <p className="text-xs text-gray-500 mb-4">Source invoices making up this total. Click any row to drill down.</p>
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
              <th className="text-left py-2">Invoice</th><th className="text-left">Client</th><th className="text-right">Amount</th><th className="text-right">Balance</th><th className="text-center">Status</th>
            </tr></thead>
            <tbody>
              {filteredInvoices.map(inv => (
                <tr key={inv.id} onClick={() => openInvoice(inv.id)} className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer">
                  <td className="py-2 text-blue-400 font-mono">{inv.number}</td>
                  <td className="py-2">{inv.client}</td>
                  <td className="py-2 text-right font-mono">{fmt(inv.amount)}</td>
                  <td className="py-2 text-right font-mono font-bold">{fmt(inv.amount - inv.amountPaid)}</td>
                  <td className="py-2 text-center"><span className={'text-[10px] px-2 py-0.5 rounded ' + ((ST as any)[inv.status] || '')}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-right text-xs font-mono font-bold">Total: {fmt(filteredInvoices.reduce((s, i) => s + i.amount - i.amountPaid, 0))}</div>
        </Modal>
      )}

      {/* ================================================================ */}
      {/* CASHFLOW FORECAST MODAL */}
      {/* ================================================================ */}
      {modal === 'cashflow' && (
        <Modal wide>
          {cashflowLoading ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-sm text-gray-400">Building 90-day forecast...</div>
              <div className="text-[10px] text-gray-600 mt-1">Pulling Odoo receivables + HubSpot deals + vendor bills</div>
            </div>
          ) : cashflow && (
            <>
              <h3 className="text-lg font-bold mb-1">Cashflow Forecast — 90 Day</h3>
              <div className="flex gap-3 text-[10px] text-gray-500 mb-4">
                <span>Sources: {cashflow.sources?.odooReceivables} Odoo receivables, {cashflow.sources?.hubspotDeals} HubSpot deals, {cashflow.sources?.vendorBills} vendor bills</span>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Starting Cash</div><div className="font-mono font-bold mt-1">{fmt(cashflow.cashOnHand)}</div></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Total Inflows</div><div className="font-mono font-bold text-emerald-400 mt-1">{fmt(cashflow.totals?.totalInflow)}</div></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Total Outflows</div><div className="font-mono font-bold text-rose-400 mt-1">{fmt(cashflow.totals?.totalOutflow)}</div></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">90-Day Cash</div><div className={'font-mono font-bold mt-1 ' + (cashflow.totals?.endingCash90 >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{fmt(cashflow.totals?.endingCash90)}</div></div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white/[0.02] rounded-xl p-4 mb-5">
                <div className="flex gap-4 justify-center mb-3 text-[9px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-2 bg-emerald-500/40 rounded" /> Inflows</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-2 bg-rose-500/40 rounded" /> Outflows</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-2 bg-blue-500/40 rounded" /> Net</span>
                </div>
                <BarChart data={cashflow.windows || []} />
              </div>

              {/* Drillable Windows */}
              {cashflow.windows?.map((w: any) => (
                <div key={w.window} className="mb-3">
                  <button onClick={() => setExpandedWindow(expandedWindow === w.window ? null : w.window)}
                    className="w-full flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-all text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{w.window}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">In: {fmt(w.inflows.total)}</span>
                      <span className="text-[10px] text-rose-400 font-mono">Out: {fmt(w.outflows.total)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={'text-sm font-mono font-bold ' + (w.netCash >= 0 ? 'text-emerald-400' : 'text-rose-400')}>Net: {fmt(w.netCash)}</span>
                      <span className="text-gray-600">{expandedWindow === w.window ? '\u25B2' : '\u25BC'}</span>
                    </div>
                  </button>
                  {expandedWindow === w.window && (
                    <div className="grid grid-cols-2 gap-3 mt-2 px-2">
                      <div>
                        <div className="text-[9px] text-emerald-400 uppercase mb-1">Inflows</div>
                        {w.inflows.arReceivables.items.map((r: any, i: number) => (
                          <div key={i} className="flex justify-between text-[10px] py-0.5 text-gray-300">
                            <span className="font-mono text-blue-400">{r.number}</span><span>{r.partner}</span><span className="font-mono">{fmt(r.amount)}</span>
                          </div>
                        ))}
                        {w.inflows.hubspotDeals.items.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-[10px] py-0.5 text-gray-400">
                            <span className="text-violet-400">{d.stage}</span><span className="truncate max-w-[120px]">{d.name}</span><span className="font-mono">{fmt(d.weightedValue)} <span className="text-gray-600">({Math.round(d.probability * 100)}%)</span></span>
                          </div>
                        ))}
                        {w.inflows.arReceivables.items.length === 0 && w.inflows.hubspotDeals.items.length === 0 && <div className="text-[10px] text-gray-600">None</div>}
                      </div>
                      <div>
                        <div className="text-[9px] text-rose-400 uppercase mb-1">Outflows</div>
                        {w.outflows.vendorBills.items.map((b: any, i: number) => (
                          <div key={i} className="flex justify-between text-[10px] py-0.5 text-gray-300">
                            <span>{b.vendor}</span><span className="font-mono">{fmt(b.amount)}{b.recurring && <span className="text-gray-600 ml-1">(mo)</span>}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </Modal>
      )}

      {/* ================================================================ */}
      {/* COLLECTIONS MODAL */}
      {/* ================================================================ */}
      {modal === 'collections' && (
        <Modal wide>
          {collectionsLoading ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-sm text-gray-400">AI is analyzing your overdue ledger...</div>
              <div className="text-[10px] text-gray-600 mt-1">Factoring vendor reliability into collection tiers</div>
            </div>
          ) : collections && (
            <>
              <h3 className="text-lg font-bold mb-1">AI Collection Strategy</h3>
              <div className="flex gap-3 mb-5">
                <span className="text-sm font-mono text-rose-400">{fmt(collections.totalOverdue)} overdue</span>
                <span className="text-[10px] text-gray-500 self-center">{collections.debtorCount} debtors</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">Soft: {collections.summary?.gentle}</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded">Firm: {collections.summary?.firm}</span>
                <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded">Escalated: {collections.summary?.escalated}</span>
                <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded">Critical: {collections.summary?.critical}</span>
              </div>

              {collections.strategies?.map((s: any) => (
                <div key={s.invoice.id} className={'border rounded-xl p-4 mb-3 ' + ((URG as any)[s.strategy.urgency] || '')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase">{s.strategy.urgency}</span>
                      <span className="text-sm font-mono text-blue-400 cursor-pointer hover:underline" onClick={() => { setModal(null); setTimeout(() => openInvoice(s.invoice.id), 100) }}>{s.invoice.number}</span>
                      <span className="text-sm">{s.invoice.client}</span>
                      <span className="text-[10px] text-gray-500">— reliability: {s.invoice.vendorReliabilityScore}/100</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">{fmt(s.outstanding)}</div>
                      <div className="text-[10px] text-gray-500">{s.invoice.daysOverdue}d overdue</div>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 text-xs mb-2">
                    <div className="font-medium text-amber-400 mb-1">{s.strategy.action}</div>
                    <div className="text-[10px] text-gray-400">{s.strategy.reasoning}</div>
                    <div className="text-[10px] text-gray-500 mt-1">Channel: {s.strategy.channel} — Follow-up: {s.strategy.followUp}</div>
                  </div>
                  {s.strategy.discountOffer && <div className="text-[10px] text-emerald-400 mb-2">{s.strategy.discountOffer.offer}</div>}
                  <button onClick={() => setExpandedStrategy(expandedStrategy === s.invoice.id ? null : s.invoice.id)} className="text-[10px] text-blue-400">{expandedStrategy === s.invoice.id ? 'Hide' : 'View'} Draft Message</button>
                  {expandedStrategy === s.invoice.id && <pre className="mt-2 bg-black/30 rounded-lg p-3 text-[11px] text-gray-300 whitespace-pre-wrap font-sans">{s.strategy.template}</pre>}
                </div>
              ))}
            </>
          )}
        </Modal>
      )}

      {/* ================================================================ */}
      {/* FINANCIAL HEALTH MODAL */}
      {/* ================================================================ */}
      {modal === 'health' && (
        <Modal wide>
          {healthLoading ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-sm text-gray-400">Calculating financial health metrics...</div>
            </div>
          ) : health && (
            <>
              <div className="text-center mb-6">
                <div className="text-[10px] text-gray-500 uppercase">Financial Health Score</div>
                <div className={'text-6xl font-bold ' + (health.healthScore >= 70 ? 'text-emerald-400' : health.healthScore >= 50 ? 'text-amber-400' : 'text-rose-400')}>{health.healthScore}</div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-5">
                {Object.entries(health.metrics || {}).map(([key, m]: [string, any]) => (
                  <div key={key} className="bg-white/[0.02] rounded-lg p-2 text-center">
                    <div className="text-[8px] text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className={`text-sm font-mono font-bold ${(HC as any)[m.status] || ''}`}>{typeof m.value === 'number' && m.value > 999 ? fmt(m.value) : m.value}{m.unit === 'days' ? 'd' : m.unit === 'months' ? 'mo' : ''}</div>
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Action Checklist</h4>
              {health.checklist?.map((item: any, i: number) => (
                <div key={i} className="flex gap-3 py-2 border-b border-white/[0.03] last:border-0">
                  <span className={'text-[10px] px-2 py-0.5 rounded flex-shrink-0 ' + (item.priority === 'critical' ? 'bg-rose-500/10 text-rose-400' : item.priority === 'high' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400')}>{item.priority}</span>
                  <div><div className="text-xs font-medium">{item.action}</div><div className="text-[10px] text-gray-500">{item.detail}</div></div>
                </div>
              ))}

              {vendorDiscounts?.opportunities?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Vendor Discount Opportunities — Save {fmt(vendorDiscounts.totalPotentialSavings)}/mo</h4>
                  {vendorDiscounts.opportunities.map((o: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs py-1.5 border-b border-white/[0.03]">
                      <div><span className="font-medium">{o.vendor}</span><span className="text-gray-500 ml-2">{o.terms}</span></div>
                      <span className="text-emerald-400 font-mono">Save {fmt(o.potentialSavings)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
