'use client'

import { useState, useEffect, useRef } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const hdrs = () => ({ 'x-admin-email': getEmail(), 'Content-Type': 'application/json' })

export default function PayablesPage() {
  const [tab, setTab] = useState<'intake' | 'review' | 'pay' | 'reconcile'>('intake')
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  // ====== STATE ======
  const [pending, setPending] = useState<any[]>([])
  const [methods, setMethods] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [reconcileData, setReconcileData] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [scanning, setScanning] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  // AP expenses for payment
  const [expenses, setExpenses] = useState<any[]>([])

  const loadAll = async () => {
    const [pendRes, methRes, payRes, recRes, sugRes, apRes] = await Promise.all([
      fetch('/api/finance-capture?view=pending', { headers: { 'x-admin-email': getEmail() } }),
      fetch('/api/finance-capture?view=payment-methods', { headers: { 'x-admin-email': getEmail() } }),
      fetch('/api/finance-capture?view=payments', { headers: { 'x-admin-email': getEmail() } }),
      fetch('/api/finance-reconcile', { headers: { 'x-admin-email': getEmail() } }),
      fetch('/api/finance-reconcile?view=suggestions', { headers: { 'x-admin-email': getEmail() } }),
      fetch('/api/ap', { headers: { 'x-admin-email': getEmail() } }),
    ])
    setPending((await pendRes.json()).items || [])
    setMethods((await methRes.json()).methods || [])
    const payData = await payRes.json(); setPayments(payData.payments || [])
    setReconcileData(await recRes.json())
    setSuggestions((await sugRes.json()).suggestions || [])
    setExpenses((await apRes.json()).expenses || [])
  }

  useEffect(() => { loadAll() }, [])

  // ====== FILE UPLOAD ======
  const handleFile = async (file: File) => {
    setScanning(true)
    const base64 = await new Promise<string>((res) => {
      const reader = new FileReader()
      reader.onload = () => res((reader.result as string).split(',')[1])
      reader.readAsDataURL(file)
    })
    const r = await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'capture', base64, filename: file.name, captureMethod: 'desktop_upload' }) })
    const data = await r.json()
    showToast(data.message || 'Document captured')
    setScanning(false)
    setTab('review')
    loadAll()
  }

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }

  // ====== APPROVE/REJECT REVIEW ======
  const approveItem = async (id: string) => {
    await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'approve', itemId: id }) })
    showToast('Approved and added to AP'); loadAll()
  }
  const rejectItem = async (id: string) => {
    await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'reject', itemId: id }) })
    showToast('Rejected'); loadAll()
  }

  // ====== PAY ======
  const payExpense = async (exp: any) => {
    if (!selectedMethod) return
    await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'pay', expenseId: exp.id, vendorName: exp.vendorName, amount: exp.amount, paymentMethodId: selectedMethod }) })
    showToast(`Payment initiated: $${exp.amount.toLocaleString()}`)
    setPayingId(null)
    loadAll()
  }

  // ====== RECONCILE ======
  const reconcile = async (txId: string, expId: string) => {
    await fetch('/api/finance-reconcile', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'reconcile', transactionId: txId, expenseId: expId }) })
    showToast('Reconciled'); loadAll()
  }
  const autoReconcile = async () => {
    const r = await fetch('/api/finance-reconcile', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'auto-reconcile' }) })
    const d = await r.json()
    showToast(d.message || 'Done'); loadAll()
  }

  const tabs = [
    { key: 'intake', label: 'Smart Intake', icon: '\uD83D\uDCF7', badge: null },
    { key: 'review', label: 'Pending Review', icon: '\uD83D\uDD0D', badge: pending.length || null },
    { key: 'pay', label: 'Pay Invoices', icon: '\uD83D\uDCB3', badge: expenses.filter((e: any) => ['pending', 'approved'].includes(e.status)).length || null },
    { key: 'reconcile', label: 'Reconciliation', icon: '\uD83C\uDFE6', badge: suggestions.filter(s => s.hasMatch).length || null },
  ]

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div>
        <h1 className="text-xl font-bold">Active Payables Engine</h1>
        <p className="text-sm text-gray-500 mt-1">Capture, review, pay, and reconcile — all in one flow</p>
      </div>

      {/* Cash Position Banner */}
      {reconcileData?.cashPosition && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <div className="text-[10px] text-gray-400 font-mono uppercase">Bank Balance</div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">${reconcileData.cashPosition.bankBalance?.toLocaleString()}</div>
          </div>
          <div className="bg-[#0A0E15] border border-amber-500/20 rounded-xl p-4">
            <div className="text-[10px] text-gray-400 font-mono uppercase">Pending Outflows</div>
            <div className="text-2xl font-mono font-bold text-amber-400 mt-1">${reconcileData.cashPosition.pendingOutflows?.toLocaleString()}</div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[10px] text-gray-400 font-mono uppercase">Net Position</div>
            <div className={'text-2xl font-mono font-bold mt-1 ' + (reconcileData.cashPosition.netPosition >= 0 ? 'text-white' : 'text-rose-400')}>${reconcileData.cashPosition.netPosition?.toLocaleString()}</div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[10px] text-gray-400 font-mono uppercase">Reconciled</div>
            <div className="text-2xl font-mono font-bold mt-1">{reconcileData?.reconciliation?.reconciledCount}/{reconcileData?.reconciliation?.totalTransactions}</div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all relative ' +
              (tab === t.key ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5')}>
            {t.icon} {t.label}
            {t.badge && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* SMART INTAKE */}
      {/* ================================================================ */}
      {tab === 'intake' && (
        <div className="space-y-4">
          <div onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ' +
              (dragOver ? 'border-blue-500 bg-blue-500/5' : scanning ? 'border-amber-500 bg-amber-500/5' : 'border-white/10 hover:border-white/20')}>
            {scanning ? (
              <div><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><div className="text-amber-400 font-medium">AI scanning document...</div><div className="text-xs text-gray-500 mt-1">Extracting vendor, amount, date, and category</div></div>
            ) : (
              <div>
                <div className="text-4xl mb-3">{'\uD83D\uDCC4'}</div>
                <div className="text-lg font-medium">Drop invoice here or click to upload</div>
                <div className="text-sm text-gray-500 mt-2">PDF, JPG, PNG — desktop drag-drop or mobile camera</div>
                <div className="flex gap-3 justify-center mt-4">
                  <span className="text-[10px] px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">Desktop: Drag &amp; Drop</span>
                  <span className="text-[10px] px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full">Mobile: Camera Capture</span>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} capture="environment" />
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">How It Works</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Upload', desc: 'Drop a PDF or snap a photo of the invoice' },
                { step: '2', title: 'AI Extracts', desc: 'Vendor, amount, date, and category auto-populated' },
                { step: '3', title: 'Review', desc: 'Verify extracted data before adding to ledger' },
                { step: '4', title: 'Pay & Reconcile', desc: 'One-click payment and auto bank matching' },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold flex items-center justify-center mx-auto">{s.step}</div>
                  <div className="text-xs font-medium mt-2">{s.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* PENDING REVIEW */}
      {/* ================================================================ */}
      {tab === 'review' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-10 text-center">
              <div className="text-2xl mb-2">{'\u2705'}</div>
              <div className="text-sm text-gray-400">No pending reviews. Upload a document to get started.</div>
            </div>
          ) : pending.map(item => (
            <div key={item.id} className="bg-[#0A0E15] border border-amber-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded font-mono">PENDING REVIEW</span>
                  <span className="text-xs text-gray-500">{item.filename}</span>
                  <span className="text-[10px] text-gray-600">{item.captureMethod === 'mobile_camera' ? '\uD83D\uDCF1 Camera' : '\uD83D\uDCBB Desktop'}</span>
                </div>
                <div className="text-[10px] text-gray-500">Confidence: <span className={'font-bold ' + (item.extracted.confidence > 0.9 ? 'text-emerald-400' : item.extracted.confidence > 0.7 ? 'text-amber-400' : 'text-rose-400')}>{Math.round(item.extracted.confidence * 100)}%</span></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div><div className="text-[9px] text-gray-500 uppercase">Vendor</div><div className="text-sm font-medium mt-0.5">{item.extracted.vendorName}</div></div>
                <div><div className="text-[9px] text-gray-500 uppercase">Invoice #</div><div className="text-sm font-mono mt-0.5">{item.extracted.invoiceNumber}</div></div>
                <div><div className="text-[9px] text-gray-500 uppercase">Date</div><div className="text-sm font-mono mt-0.5">{item.extracted.invoiceDate}</div></div>
                <div><div className="text-[9px] text-gray-500 uppercase">Due</div><div className="text-sm font-mono mt-0.5">{item.extracted.dueDate}</div></div>
                <div><div className="text-[9px] text-gray-500 uppercase">Amount</div><div className="text-lg font-mono font-bold text-white mt-0.5">${item.extracted.totalAmount?.toLocaleString()}</div></div>
              </div>

              {item.extracted.lineItems?.length > 0 && (
                <div className="bg-white/[0.02] rounded-lg p-3 mb-3">
                  <div className="text-[9px] text-gray-500 uppercase mb-1">Line Items</div>
                  {item.extracted.lineItems.map((li: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs py-0.5">
                      <span className="text-gray-400">{li.description}</span>
                      <span className="font-mono">${li.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded">{item.extracted.category?.replace(/_/g, ' ')}</span>
                <div className="flex-1" />
                <button onClick={() => rejectItem(item.id)} className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-lg text-xs hover:bg-rose-500/20">Reject</button>
                <button onClick={() => approveItem(item.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600">Approve &amp; Add to Ledger</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/* PAY INVOICES */}
      {/* ================================================================ */}
      {tab === 'pay' && (
        <div className="space-y-4">
          {/* Payment Methods */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[10px] text-gray-500 uppercase mb-2">Funding Sources</div>
            <div className="flex gap-2 flex-wrap">
              {methods.map(m => (
                <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                  className={'px-3 py-2 rounded-lg text-xs border transition-all ' +
                    (selectedMethod === m.id ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-white/5 text-gray-400 hover:border-white/10')}>
                  {m.type === 'credit_card' ? '\uD83D\uDCB3' : '\uD83C\uDFE6'} {m.label}
                  {m.isDefault && <span className="ml-1 text-[9px] text-emerald-400">(default)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Open Invoices */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Open Invoices</h3>
            {expenses.filter((e: any) => ['pending', 'approved'].includes(e.status)).length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">All invoices paid</div>
            ) : expenses.filter((e: any) => ['pending', 'approved'].includes(e.status)).map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0">
                <div>
                  <div className="text-sm font-medium">{exp.vendorName}</div>
                  <div className="text-[10px] text-gray-500">{exp.description} — Due: {exp.dueDate || 'N/A'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={'text-[10px] px-1.5 py-0.5 rounded ' + (exp.status === 'approved' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400')}>{exp.status}</span>
                  <span className="text-lg font-mono font-bold">${exp.amount?.toLocaleString()}</span>
                  {payingId === exp.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => payExpense(exp)} disabled={!selectedMethod}
                        className="px-3 py-1.5 bg-emerald-500 text-white rounded text-xs disabled:opacity-40">Confirm Pay</button>
                      <button onClick={() => setPayingId(null)} className="px-2 py-1.5 bg-white/5 text-gray-400 rounded text-xs">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => { setPayingId(exp.id); if (!selectedMethod && methods[0]) setSelectedMethod(methods[0].id) }}
                      className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600">Pay Now</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">Payment History</h3>
              {payments.slice().reverse().map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={'w-2 h-2 rounded-full ' + (p.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse')} />
                    <div>
                      <div className="text-xs">{p.vendorName}</div>
                      <div className="text-[10px] text-gray-500">{p.confirmationNumber} {p.odooSynced ? '— Odoo synced' : ''}</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold">${p.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* RECONCILIATION */}
      {/* ================================================================ */}
      {tab === 'reconcile' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Bank Feed Matching</h3>
            <button onClick={autoReconcile} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600">Auto-Reconcile All</button>
          </div>

          {suggestions.filter(s => s.hasMatch).length === 0 && suggestions.filter(s => !s.hasMatch).length === 0 ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 text-center">
              <div className="text-2xl mb-2">{'\u2705'}</div>
              <div className="text-sm text-emerald-400 font-medium">All transactions reconciled</div>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.filter(s => s.hasMatch).map(s => (
                <div key={s.transaction.id} className="bg-[#0A0E15] border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono">SUGGESTED MATCH</span>
                    <span className="text-[10px] font-mono text-gray-500">{s.transaction.date} — {s.transaction.account}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/[0.02] rounded-lg p-3">
                      <div className="text-[9px] text-gray-500 uppercase mb-1">Bank Transaction</div>
                      <div className="text-sm font-medium">{s.transaction.description}</div>
                      <div className="text-lg font-mono font-bold text-rose-400">${Math.abs(s.transaction.amount).toLocaleString()}</div>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-3">
                      <div className="text-[9px] text-gray-500 uppercase mb-1">Matched Invoice</div>
                      <div className="text-sm font-medium">{s.bestMatch.expense.vendorName}</div>
                      <div className="text-lg font-mono font-bold">${s.bestMatch.expense.amount?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {s.bestMatch.reasons.map((r: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-400">{r}</span>
                      ))}
                    </div>
                    <button onClick={() => reconcile(s.transaction.id, s.bestMatch.expense.id)}
                      className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium">Confirm Match</button>
                  </div>
                </div>
              ))}

              {/* Unmatched */}
              {suggestions.filter(s => !s.hasMatch).map(s => (
                <div key={s.transaction.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-500/10 text-gray-400 rounded font-mono mr-2">NO MATCH</span>
                      <span className="text-sm">{s.transaction.description}</span>
                    </div>
                    <span className="font-mono font-bold text-rose-400">${Math.abs(s.transaction.amount).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
