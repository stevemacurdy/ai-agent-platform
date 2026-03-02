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
  const [dataSource, setDataSource] = useState<string>('loading')
  const [provider, setProvider] = useState<string | null>(null)

  // ====== MODAL STATE ======
  const [modal, setModal] = useState<'invoice' | 'filter' | 'collections' | 'health' | 'cashflow' | null>(null)
  const [selectedInv, setSelectedInv] = useState<any>(null)
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
  const [cashflow, setCashflow] = useState<any>(null)
  const [cashflowLoading, setCashflowLoading] = useState(false)
  const [expandedWindow, setExpandedWindow] = useState<string | null>(null)

  // ====== LOADERS — now using /api/cfo ======
  const loadInvoices = async () => {
    const r = await fetch('/api/cfo?view=invoices')
    const d = await r.json()
    setInvoices(d.invoices || [])
    setSummary(d.summary)
    setDataSource(d.source || 'demo')
    setProvider(d.provider || null)
  }

  const openInvoice = async (id: string) => {
    const inv = invoices.find((i: any) => i.id === id)
    if (inv) {
      setSelectedInv(inv)
      setEditMode(false)
      setEditingLI(null)
      setModal('invoice')
    }
  }

  const openFilter = (label: string, filter: (inv: any) => boolean) => {
    setFilterLabel(label)
    setFilteredInvoices(invoices.filter(filter))
    setModal('filter')
  }

  const runCollections = async () => {
    setCollectionsLoading(true); setModal('collections')
    const r = await fetch('/api/cfo?view=collections')
    setCollections(await r.json())
    setCollectionsLoading(false)
  }

  const runHealth = async () => {
    setHealthLoading(true); setModal('health')
    const r = await fetch('/api/cfo?view=health')
    setHealth(await r.json())
    setHealthLoading(false)
  }

  const runCashflow = async () => {
    setCashflowLoading(true); setModal('cashflow')
    const r = await fetch('/api/cfo?view=cashflow')
    setCashflow(await r.json())
    setCashflowLoading(false)
  }

  useEffect(() => { loadInvoices() }, [])

  // ====== INVOICE ACTIONS ======
  const saveLineItem = async (invoiceId: string, liId: string) => {
    await fetch('/api/cfo-invoices', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'edit-line-item', invoiceId, lineItemId: liId, ...editForm }) })
    showToast('Line item updated')
    setEditingLI(null)
    loadInvoices()
  }

  const recordPayment = async (invoiceId: string, amount: number) => {
    await fetch('/api/cfo-invoices', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'record-payment', invoiceId, amount }) })
    showToast('Payment recorded')
    loadInvoices()
  }

  const ST: Record<string, string> = { paid: 'bg-emerald-50 text-emerald-600', overdue: 'bg-rose-500/10 text-rose-400', partial: 'bg-amber-50 text-amber-600', sent: 'bg-blue-50 text-blue-600', draft: 'bg-gray-50 text-gray-500' }
  const HC: Record<string, string> = { good: 'text-emerald-600', warning: 'text-amber-600', critical: 'text-rose-400', info: 'text-[#4B5563]' }

  // ====== BAR CHART COMPONENT ======
  const BarChart = ({ data }: { data: any[] }) => {
    const maxVal = Math.max(...data.map(d => Math.max(d.inflows || 0, d.outflows || 0, Math.abs(d.netCash || 0))), 1)
    return (
      <div className="flex items-end gap-6 h-48 px-4">
        {data.map((w: any, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 h-36 w-full justify-center">
              <div className="flex flex-col items-center w-8">
                <div className="text-[8px] text-emerald-600 font-mono mb-0.5">{fmt(w.inflows || 0)}</div>
                <div className="w-full bg-emerald-500/40 rounded-t" style={{ height: Math.max(4, ((w.inflows || 0) / maxVal) * 120) + 'px' }} />
              </div>
              <div className="flex flex-col items-center w-8">
                <div className="text-[8px] text-rose-400 font-mono mb-0.5">{fmt(w.outflows || 0)}</div>
                <div className="w-full bg-rose-500/40 rounded-t" style={{ height: Math.max(4, ((w.outflows || 0) / maxVal) * 120) + 'px' }} />
              </div>
              <div className="flex flex-col items-center w-8">
                <div className={'text-[8px] font-mono mb-0.5 ' + ((w.netCash || 0) >= 0 ? 'text-blue-600' : 'text-rose-400')}>{fmt(w.netCash || 0)}</div>
                <div className={'w-full rounded-t ' + ((w.netCash || 0) >= 0 ? 'bg-blue-500/40' : 'bg-rose-500/60')} style={{ height: Math.max(4, (Math.abs(w.netCash || 0) / maxVal) * 120) + 'px' }} />
              </div>
            </div>
            <div className="text-[10px] text-[#6B7280] font-medium mt-1">{w.window}</div>
          </div>
        ))}
      </div>
    )
  }

  // ====== MODAL BACKDROP ======
  const Modal = ({ children, wide }: { children: React.ReactNode; wide?: boolean }) => (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto" onClick={() => setModal(null)}>
      <div className="fixed inset-0 bg-black/70" />
      <div className={'relative bg-[#0B0F18] border border-[#E5E7EB] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ' + (wide ? 'w-[900px]' : 'w-[720px]')} onClick={e => e.stopPropagation()}>
        <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#1B2A4A] text-lg z-10">{'\u2715'}</button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-500/20 text-emerald-600 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">CFO Intelligence Console</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Click any number for source data. Click any button to trigger analysis.</p>
        </div>
        {/* Data source badge */}
        <div className="flex items-center gap-2">
          {dataSource === 'live' ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live — {provider || 'Connected'}
            </span>
          ) : dataSource === 'demo' ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-500/20">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Demo Data
            </span>
          ) : (
            <span className="text-[10px] text-[#9CA3AF]">Loading...</span>
          )}
        </div>
      </div>

      {/* ====== TRACEABLE KPIs ====== */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Outstanding', value: summary.totalOutstanding, color: 'text-white', border: 'border-[#E5E7EB]', filter: () => true },
            { label: 'Overdue', value: summary.totalOverdue, color: 'text-rose-400', border: 'border-rose-500/20', filter: (i: any) => i.status === 'overdue' },
            { label: 'Collected', value: summary.totalPaid, color: 'text-emerald-600', border: 'border-emerald-500/20', filter: (i: any) => i.status === 'paid' },
            { label: 'Partial', value: invoices.filter(i => i.status === 'partial').reduce((s: number, i: any) => s + i.amount - i.amountPaid, 0), color: 'text-amber-600', border: 'border-amber-500/20', filter: (i: any) => i.status === 'partial' },
            { label: 'Invoices', value: summary.invoiceCount, color: 'text-blue-600', border: 'border-blue-500/20', filter: () => true, noFmt: true },
          ].map((k, idx) => (
            <button key={idx} onClick={() => openFilter(k.label, k.filter)}
              className={'bg-white border rounded-xl p-4 text-left hover:bg-white shadow-sm transition-all cursor-pointer group ' + k.border}>
              <div className="text-[10px] text-[#9CA3AF] font-mono uppercase group-hover:text-[#4B5563]">{k.label}</div>
              <div className={`text-xl font-mono font-bold mt-1 ${k.color}`}>{k.noFmt ? k.value : fmt(k.value || 0)}</div>
              <div className="text-[9px] text-gray-700 group-hover:text-[#9CA3AF] mt-1">Click for source invoices {'\u2192'}</div>
            </button>
          ))}
        </div>
      )}

      {/* ====== ACTION BUTTONS ====== */}
      <div className="grid grid-cols-4 gap-3">
        <button onClick={runCashflow} className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-left hover:border-blue-500/40 transition-all">
          <div className="text-lg mb-1">{'\uD83D\uDCC8'}</div>
          <div className="text-sm font-semibold">Cashflow Forecast</div>
          <div className="text-[10px] text-[#9CA3AF] mt-1">30/60/90-day projection with risk levels</div>
        </button>
        <button onClick={runCollections} className="bg-gradient-to-br from-rose-500/5 to-rose-500/10 border border-rose-500/20 rounded-xl p-5 text-left hover:border-rose-500/40 transition-all">
          <div className="text-lg mb-1">{'\uD83D\uDCE8'}</div>
          <div className="text-sm font-semibold">AI Collection Strategy</div>
          <div className="text-[10px] text-[#9CA3AF] mt-1">Prioritized debtor queue + recovery estimates</div>
        </button>
        <button onClick={runHealth} className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-left hover:border-emerald-500/40 transition-all">
          <div className="text-lg mb-1">{'\uD83E\uDE7A'}</div>
          <div className="text-sm font-semibold">Financial Health</div>
          <div className="text-[10px] text-[#9CA3AF] mt-1">Health Score, Quick Ratio, DSO, Burn Rate</div>
        </button>
        <button onClick={() => window.location.href = '/agents/cfo/payables'} className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-left hover:border-amber-500/40 transition-all">
          <div className="text-lg mb-1">{'\uD83D\uDCB3'}</div>
          <div className="text-sm font-semibold">Add Vendor Bill</div>
          <div className="text-[10px] text-[#9CA3AF] mt-1">Upload/camera {'\u2192'} AI extract {'\u2192'} review {'\u2192'} pay</div>
        </button>
      </div>

      {/* ====== INVOICE TABLE ====== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">All Invoices <span className="text-[10px] text-[#6B7280] ml-2">Click any row to drill down</span></h3>
        <table className="w-full text-xs">
          <thead><tr className="text-[9px] text-[#9CA3AF] uppercase border-b border-[#E5E7EB]">
            <th className="text-left py-2">Invoice</th><th className="text-left">Client</th><th className="text-left">Contact</th><th className="text-right">Amount</th><th className="text-right">Paid</th><th className="text-right">Due</th><th className="text-center">Status</th>
          </tr></thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} onClick={() => openInvoice(inv.id)} className="border-b border-white/[0.03] hover:bg-white shadow-sm cursor-pointer transition-colors">
                <td className="py-2.5 text-blue-600 font-mono">{inv.number}</td>
                <td className="py-2.5">{inv.client}</td>
                <td className="py-2.5 text-[#6B7280]">{inv.contactName}</td>
                <td className="py-2.5 text-right font-mono font-bold">{fmt(inv.amount)}</td>
                <td className="py-2.5 text-right font-mono text-[#9CA3AF]">{inv.amountPaid > 0 ? fmt(inv.amountPaid) : '\u2014'}</td>
                <td className="py-2.5 text-right font-mono">{inv.dueDate} {inv.daysOverdue > 0 && <span className="text-rose-400 ml-1">({inv.daysOverdue}d)</span>}</td>
                <td className="py-2.5 text-center"><span className={'text-[10px] px-2 py-0.5 rounded ' + (ST[inv.status] || '')}>{inv.status}</span></td>
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
              <div className="text-2xl font-bold font-mono text-blue-600">{selectedInv.number}</div>
              <div className="text-sm text-[#6B7280] mt-1">{selectedInv.client} {'\u2014'} {selectedInv.contactName}</div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-[#9CA3AF]">Issued: <span className="font-mono">{selectedInv.issueDate}</span></span>
                <span className="text-[#9CA3AF]">Due: <span className="font-mono">{selectedInv.dueDate}</span></span>
              </div>
            </div>
            <div className="text-right">
              <span className={'text-xs px-3 py-1 rounded ' + (ST[selectedInv.status] || '')}>{selectedInv.status}</span>
              <div className="text-3xl font-mono font-bold mt-2">{fmt(selectedInv.amount)}</div>
              {selectedInv.amountPaid > 0 && <div className="text-sm text-[#9CA3AF]">Paid: {fmt(selectedInv.amountPaid)} {'\u2014'} Balance: {fmt(selectedInv.amount - selectedInv.amountPaid)}</div>}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase text-[#9CA3AF]">Line Items</h4>
              <button onClick={() => setEditMode(!editMode)} className={'text-[10px] px-3 py-1 rounded ' + (editMode ? 'bg-amber-50 text-amber-600' : 'bg-white shadow-sm text-[#6B7280] hover:text-[#1B2A4A]')}>{editMode ? 'Exit Edit' : 'Edit Mode'}</button>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="text-[9px] text-[#6B7280] uppercase border-b border-[#E5E7EB]">
                <th className="text-left py-1.5 w-1/2">Description</th><th className="text-right">Qty</th><th className="text-right">Unit Price</th><th className="text-right">Total</th>{editMode && <th className="w-14" />}
              </tr></thead>
              <tbody>
                {selectedInv.lineItems?.map((li: any) => (
                  <tr key={li.id} className="border-b border-white/[0.03]">
                    {editingLI === li.id ? (
                      <>
                        <td className="py-1.5"><input value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-2 py-1 bg-white border border-[#E5E7EB] shadow-sm rounded text-xs" /></td>
                        <td className="py-1.5"><input value={editForm.qty} onChange={e => setEditForm({...editForm, qty: parseFloat(e.target.value) || 0})} type="number" className="w-14 px-2 py-1 bg-white border border-[#E5E7EB] shadow-sm rounded text-xs text-right" /></td>
                        <td className="py-1.5"><input value={editForm.unitPrice} onChange={e => setEditForm({...editForm, unitPrice: parseFloat(e.target.value) || 0})} type="number" className="w-20 px-2 py-1 bg-white border border-[#E5E7EB] shadow-sm rounded text-xs text-right" /></td>
                        <td className="py-1.5 text-right font-mono">{fmt(editForm.qty * editForm.unitPrice)}</td>
                        <td className="py-1.5 text-right"><button onClick={() => saveLineItem(selectedInv.id, li.id)} className="text-emerald-600 text-[10px] mr-1">Save</button><button onClick={() => setEditingLI(null)} className="text-[#9CA3AF] text-[10px]">X</button></td>
                      </>
                    ) : (
                      <>
                        <td className="py-1.5 text-[#4B5563]">{li.description}</td>
                        <td className="py-1.5 text-right font-mono">{li.qty}</td>
                        <td className="py-1.5 text-right font-mono">{fmt(li.unitPrice)}</td>
                        <td className="py-1.5 text-right font-mono font-bold">{fmt(li.total)}</td>
                        {editMode && <td className="py-1.5 text-right"><button onClick={() => { setEditingLI(li.id); setEditForm({ description: li.description, qty: li.qty, unitPrice: li.unitPrice }) }} className="text-blue-600 text-[10px]">Edit</button></td>}
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
        </Modal>
      )}

      {/* ================================================================ */}
      {/* KPI FILTER MODAL */}
      {/* ================================================================ */}
      {modal === 'filter' && (
        <Modal>
          <h3 className="text-lg font-bold mb-1">{filterLabel}</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Source invoices making up this total. Click any row to drill down.</p>
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] text-[#9CA3AF] uppercase border-b border-[#E5E7EB]">
              <th className="text-left py-2">Invoice</th><th className="text-left">Client</th><th className="text-right">Amount</th><th className="text-right">Balance</th><th className="text-center">Status</th>
            </tr></thead>
            <tbody>
              {filteredInvoices.map((inv: any) => (
                <tr key={inv.id} onClick={() => openInvoice(inv.id)} className="border-b border-white/[0.03] hover:bg-white shadow-sm cursor-pointer">
                  <td className="py-2 text-blue-600 font-mono">{inv.number}</td>
                  <td className="py-2">{inv.client}</td>
                  <td className="py-2 text-right font-mono">{fmt(inv.amount)}</td>
                  <td className="py-2 text-right font-mono font-bold">{fmt(inv.amount - inv.amountPaid)}</td>
                  <td className="py-2 text-center"><span className={'text-[10px] px-2 py-0.5 rounded ' + (ST[inv.status] || '')}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-right text-xs font-mono font-bold">Total: {fmt(filteredInvoices.reduce((s: number, i: any) => s + i.amount - i.amountPaid, 0))}</div>
        </Modal>
      )}

      {/* ================================================================ */}
      {/* CASHFLOW FORECAST MODAL */}
      {/* ================================================================ */}
      {modal === 'cashflow' && (
        <Modal wide>
          {cashflowLoading ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-sm text-[#6B7280]">Building 90-day forecast...</div>
              <div className="text-[10px] text-[#6B7280] mt-1">Analyzing receivables, burn rate, and projections</div>
            </div>
          ) : cashflow && (
            <>
              <h3 className="text-lg font-bold mb-1">Cashflow Forecast {'\u2014'} 90 Day</h3>
              <div className="flex gap-3 text-[10px] text-[#9CA3AF] mb-4">
                <span>Source: {cashflow.source === 'live' ? 'Live accounting data' : 'Demo data'}</span>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white shadow-sm rounded-lg p-3"><div className="text-[9px] text-[#9CA3AF]">Starting Cash</div><div className="font-mono font-bold mt-1">{fmt(cashflow.currentCash || 0)}</div></div>
                <div className="bg-white shadow-sm rounded-lg p-3"><div className="text-[9px] text-[#9CA3AF]">Total Projected Inflows</div><div className="font-mono font-bold text-emerald-600 mt-1">{fmt((cashflow.projection || []).reduce((s: number, w: any) => s + (w.inflows || 0), 0))}</div></div>
                <div className="bg-white shadow-sm rounded-lg p-3"><div className="text-[9px] text-[#9CA3AF]">Total Projected Outflows</div><div className="font-mono font-bold text-rose-400 mt-1">{fmt((cashflow.projection || []).reduce((s: number, w: any) => s + (w.outflows || 0), 0))}</div></div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white shadow-sm rounded-xl p-4 mb-5">
                <div className="flex gap-4 justify-center mb-3 text-[9px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-2 bg-emerald-500/40 rounded" /> Inflows</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-2 bg-rose-500/40 rounded" /> Outflows</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-2 bg-blue-500/40 rounded" /> Net Cash</span>
                </div>
                <BarChart data={cashflow.projection || []} />
              </div>

              {/* Window Details */}
              {(cashflow.projection || []).map((w: any) => (
                <div key={w.window} className="mb-2">
                  <button onClick={() => setExpandedWindow(expandedWindow === w.window ? null : w.window)}
                    className="w-full flex items-center justify-between py-3 px-4 bg-white shadow-sm rounded-lg hover:bg-white/[0.04] transition-all text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{w.window}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">In: {fmt(w.inflows || 0)}</span>
                      <span className="text-[10px] text-rose-400 font-mono">Out: {fmt(w.outflows || 0)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={'text-[10px] font-bold uppercase px-2 py-0.5 rounded ' + (w.risk === 'critical' ? 'bg-rose-500/10 text-rose-400' : w.risk === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')}>{w.risk}</span>
                      <span className={'text-sm font-mono font-bold ' + ((w.netCash || 0) >= 0 ? 'text-emerald-600' : 'text-rose-400')}>Net: {fmt(w.netCash || 0)}</span>
                    </div>
                  </button>
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
              <div className="text-sm text-[#6B7280]">AI is analyzing your overdue ledger...</div>
              <div className="text-[10px] text-[#6B7280] mt-1">Factoring vendor reliability into collection tiers</div>
            </div>
          ) : collections && (
            <>
              <h3 className="text-lg font-bold mb-1">AI Collection Strategy</h3>
              <div className="flex gap-3 mb-5 flex-wrap">
                <span className="text-sm font-mono text-rose-400">{fmt(collections.summary?.totalOverdue || 0)} overdue</span>
                <span className="text-[10px] text-[#9CA3AF] self-center">{collections.summary?.overdueCount || 0} invoices</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded">Est. recovery: {fmt(collections.summary?.estimatedRecovery || 0)} ({collections.summary?.recoveryRate || 0}%)</span>
              </div>

              {(collections.strategies || []).map((s: any) => {
                const urgColors: Record<string, string> = { low: 'border-blue-500/20 bg-blue-500/5', medium: 'border-amber-500/20 bg-amber-500/5', high: 'border-orange-500/20 bg-orange-500/5', critical: 'border-rose-500/20 bg-rose-500/5' }
                return (
                  <div key={s.invoiceId} className={'border rounded-xl p-4 mb-3 ' + (urgColors[s.urgency] || '')}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase">{s.urgency}</span>
                        <span className="text-sm font-mono text-blue-600 cursor-pointer hover:underline" onClick={() => { setModal(null); setTimeout(() => openInvoice(s.invoiceId), 100) }}>{s.invoiceNumber}</span>
                        <span className="text-sm">{s.client}</span>
                        <span className="text-[10px] text-[#9CA3AF]">{'\u2014'} reliability: {s.reliabilityScore}/100</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">{fmt(s.outstanding)}</div>
                        <div className="text-[10px] text-[#9CA3AF]">{s.daysOverdue}d overdue</div>
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 text-xs mb-2">
                      <div className="font-medium text-amber-600 mb-1">{s.strategy}</div>
                      <div className="text-[10px] text-[#6B7280]">Tone: {s.tone} {'\u2022'} Contact: {s.contactName} ({s.contactEmail})</div>
                    </div>
                    {/* Action items */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(s.actions || []).map((action: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/10 rounded text-[#4B5563]">{action}</span>
                      ))}
                    </div>
                    <div className="text-[10px] text-emerald-600">Est. recovery: {fmt(s.estimatedRecovery || 0)}</div>
                  </div>
                )
              })}
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
              <div className="text-sm text-[#6B7280]">Calculating financial health metrics...</div>
            </div>
          ) : health && (
            <>
              <div className="text-center mb-6">
                <div className="text-[10px] text-[#9CA3AF] uppercase">Financial Health Score</div>
                <div className={'text-6xl font-bold ' + (health.healthScore >= 70 ? 'text-emerald-600' : health.healthScore >= 50 ? 'text-amber-600' : 'text-rose-400')}>{health.healthScore}</div>
                <div className={'text-lg font-bold mt-1 ' + (health.healthScore >= 70 ? 'text-emerald-600' : health.healthScore >= 50 ? 'text-amber-600' : 'text-rose-400')}>Grade: {health.grade}</div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-5">
                {Object.entries(health.metrics || {}).map(([key, m]: [string, any]) => (
                  <div key={key} className="bg-white shadow-sm rounded-lg p-2 text-center">
                    <div className="text-[8px] text-[#9CA3AF] uppercase">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className={`text-sm font-mono font-bold ${HC[m.status] || ''}`}>{typeof m.value === 'number' && m.value > 999 ? fmt(m.value) : m.value}{m.unit === 'days' ? 'd' : m.unit === 'months' ? 'mo' : m.unit === '%' ? '%' : ''}</div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <h4 className="text-xs font-semibold uppercase text-[#9CA3AF] mb-2">AI Recommendations</h4>
              <div className="space-y-2">
                {(health.recommendations || []).map((rec: string, i: number) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-white/[0.03] last:border-0">
                    <span className="text-[10px] px-2 py-0.5 rounded flex-shrink-0 bg-blue-50 text-blue-600">{i + 1}</span>
                    <div className="text-xs text-[#4B5563]">{rec}</div>
                  </div>
                ))}
              </div>

              {/* Accounts */}
              {health.accounts && health.accounts.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase text-[#9CA3AF] mb-2">Accounts</h4>
                  {health.accounts.map((acc: any) => (
                    <div key={acc.id} className="flex justify-between text-xs py-1.5 border-b border-white/[0.03]">
                      <div><span className="font-medium">{acc.name}</span><span className="text-[#9CA3AF] ml-2">{acc.type}</span></div>
                      <span className={'font-mono ' + (acc.balance >= 0 ? 'text-emerald-600' : 'text-rose-400')}>{fmt(acc.balance)}</span>
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
