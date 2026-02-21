'use client'
import { useState, useEffect } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const hdrs = () => ({ 'x-admin-email': getEmail(), 'Content-Type': 'application/json' })
const fmt = (n: number) => '$' + n.toLocaleString()

export default function PayablesEngine() {
  const [tab, setTab] = useState<'intake' | 'review' | 'pay' | 'reconcile'>('intake')
  const [toast, setToast] = useState<string | null>(null)
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  // Review state
  const [pending, setPending] = useState<any[]>([])
  const [loadingReview, setLoadingReview] = useState(false)

  // Pay state
  const [methods, setMethods] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  // Reconcile state
  const [recon, setRecon] = useState<any>(null)
  const [reconLoading, setReconLoading] = useState(false)

  // Intake state
  const [captureForm, setCaptureForm] = useState({ vendor: '', invoice: '', amount: '', category: 'supplies', date: '' })

  const loadPending = async () => {
    setLoadingReview(true)
    const r = await fetch('/api/finance-capture?view=pending', { headers: { 'x-admin-email': getEmail() } })
    const d = await r.json()
    setPending(d.items || [])
    setLoadingReview(false)
  }

  const loadMethods = async () => {
    const r = await fetch('/api/finance-capture?view=methods', { headers: { 'x-admin-email': getEmail() } })
    const d = await r.json()
    setMethods(d.methods || [])
  }

  const loadPayments = async () => {
    const r = await fetch('/api/finance-capture?view=history', { headers: { 'x-admin-email': getEmail() } })
    const d = await r.json()
    setPayments(d.payments || [])
  }

  const loadRecon = async () => {
    setReconLoading(true)
    const r = await fetch('/api/finance-reconcile', { headers: { 'x-admin-email': getEmail() } })
    setRecon(await r.json())
    setReconLoading(false)
  }

  useEffect(() => {
    loadPending(); loadMethods(); loadPayments(); loadRecon()
  }, [])

  const capture = async () => {
    await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'capture', ...captureForm, amount: parseFloat(captureForm.amount) || 0 }) })
    show('Captured + OCR extracted')
    setCaptureForm({ vendor: '', invoice: '', amount: '', category: 'supplies', date: '' })
    loadPending()
  }

  const approve = async (id: string) => {
    await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'approve', id }) })
    show('Approved → pushed to AP ledger')
    loadPending()
  }

  const reject = async (id: string) => {
    await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'reject', id }) })
    show('Rejected')
    loadPending()
  }

  const pay = async (vendor: string, amount: number, methodId: string) => {
    const r = await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'pay', vendor, amount, methodId }) })
    const d = await r.json()
    show('Paid — confirmation: ' + d.payment?.confirmation)
    loadPayments()
  }

  const autoReconcile = async () => {
    const r = await fetch('/api/finance-reconcile', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'auto-reconcile-all' }) })
    const d = await r.json()
    show(d.matched + ' transactions auto-reconciled')
    loadRecon()
  }

  const tabs = [
    { id: 'intake' as const, label: 'Smart Intake' },
    { id: 'review' as const, label: 'Pending Review' },
    { id: 'pay' as const, label: 'Pay Invoices' },
    { id: 'reconcile' as const, label: 'Reconciliation' },
  ]

  const inputCls = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div><h1 className="text-xl font-bold">Payables Engine</h1><p className="text-sm text-gray-500 mt-1">Capture → Review → Pay → Reconcile</p></div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {t.label}{t.id === 'review' && pending.length > 0 && <span className="ml-2 bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded">{pending.length}</span>}
          </button>
        ))}
      </div>

      {/* SMART INTAKE */}
      {tab === 'intake' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Capture New Invoice</h3>
          <p className="text-xs text-gray-500 mb-4">In production: drag-drop PDF/image for AI OCR. For now, manual entry with simulated extraction.</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Vendor</label><input value={captureForm.vendor} onChange={e => setCaptureForm({...captureForm, vendor: e.target.value})} className={inputCls} placeholder="e.g. Grainger" /></div>
            <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Invoice #</label><input value={captureForm.invoice} onChange={e => setCaptureForm({...captureForm, invoice: e.target.value})} className={inputCls} placeholder="e.g. GR-12345" /></div>
            <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Amount</label><input value={captureForm.amount} onChange={e => setCaptureForm({...captureForm, amount: e.target.value})} className={inputCls} type="number" placeholder="0.00" /></div>
            <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Category</label>
              <select value={captureForm.category} onChange={e => setCaptureForm({...captureForm, category: e.target.value})} className={inputCls}>
                {['advertising','car_truck','commissions_fees','contract_labor','employee_benefits','insurance','interest_mortgage','legal_professional','office_expense','supplies','taxes_licenses','travel_meals','utilities','wages'].map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Date</label><input value={captureForm.date} onChange={e => setCaptureForm({...captureForm, date: e.target.value})} className={inputCls} type="date" /></div>
          </div>
          <button onClick={capture} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Capture + Extract</button>
        </div>
      )}

      {/* PENDING REVIEW */}
      {tab === 'review' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Pending Review ({pending.length})</h3>
          {loadingReview ? <div className="text-gray-500 text-sm">Loading...</div> :
            pending.length === 0 ? <div className="text-gray-600 text-sm py-8 text-center">No items pending review</div> :
            pending.map(item => (
              <div key={item.id} className="border border-white/5 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium">{item.vendor}</div>
                    <div className="text-xs text-gray-500">Invoice: {item.invoice} — {item.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold">{fmt(item.amount)}</div>
                    <div className="text-[10px] text-gray-500">Confidence: <span className={item.confidence >= 90 ? 'text-emerald-400' : 'text-amber-400'}>{item.confidence}%</span></div>
                  </div>
                </div>
                {item.lineItems?.length > 0 && (
                  <div className="bg-white/[0.02] rounded-lg p-2 mb-3">
                    {item.lineItems.map((li: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs py-0.5"><span className="text-gray-400">{li.desc}</span><span className="font-mono">{li.qty} × {fmt(li.price)}</span></div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => approve(item.id)} className="px-3 py-1.5 bg-emerald-500 text-white rounded text-xs">Approve → AP</button>
                  <button onClick={() => reject(item.id)} className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-xs">Reject</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* PAY INVOICES */}
      {tab === 'pay' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Payment Methods</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {methods.map(m => (
              <div key={m.id} className="border border-white/10 rounded-lg p-3">
                <div className="text-sm font-medium">{m.label}</div>
                <div className="text-[10px] text-gray-500">{m.type === 'bank' ? 'Bank Account' : 'Credit Card'}</div>
              </div>
            ))}
          </div>
          <h3 className="text-sm font-semibold mb-3">Payment History</h3>
          {payments.length === 0 ? <div className="text-gray-600 text-sm py-4 text-center">No payments recorded yet</div> :
            payments.map(p => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-white/[0.03] text-xs">
                <div><span className="font-medium">{p.vendor}</span><span className="text-gray-500 ml-2">{p.confirmation}</span></div>
                <div className="text-right"><span className="font-mono">{fmt(p.amount)}</span><span className="text-emerald-400 ml-2 text-[10px]">{p.status}</span></div>
              </div>
            ))
          }
        </div>
      )}

      {/* RECONCILIATION */}
      {tab === 'reconcile' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
          {reconLoading ? <div className="text-gray-500 text-sm">Loading bank transactions...</div> : recon && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold">Bank Reconciliation</h3>
                <button onClick={autoReconcile} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium">Auto-Reconcile All</button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Bank Balance</div><div className="font-mono font-bold mt-1">{fmt(recon.reconciliation?.bankBalance || 0)}</div></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Unreconciled</div><div className="font-mono font-bold text-amber-400 mt-1">{recon.reconciliation?.unreconciled}</div></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Reconciled</div><div className="font-mono font-bold text-emerald-400 mt-1">{recon.reconciliation?.reconciled}</div></div>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
                  <th className="text-left py-2">Date</th><th className="text-left">Description</th><th className="text-right">Amount</th><th className="text-center">Status</th>
                </tr></thead>
                <tbody>
                  {recon.transactions?.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-white/[0.03]">
                      <td className="py-2 font-mono">{tx.date}</td>
                      <td className="py-2">{tx.description}</td>
                      <td className={'py-2 text-right font-mono ' + (tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{fmt(Math.abs(tx.amount))}</td>
                      <td className="py-2 text-center"><span className={'text-[10px] px-2 py-0.5 rounded ' + (tx.reconciled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{tx.reconciled ? 'matched' : 'pending'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  )
}
