'use client'

import { useState, useEffect } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const hdrs = () => ({ 'x-admin-email': getEmail(), 'Content-Type': 'application/json' })

export default function FinOpsProPage() {
  const [tab, setTab] = useState<'tax' | 'duplicates' | 'anomalies' | 'vendors' | 'lending'>('tax')
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  // ====== TAX RESERVE ======
  const [taxData, setTaxData] = useState<any>(null)
  const loadTax = async () => { const r = await fetch('/api/tax-reserve', { headers: { 'x-admin-email': getEmail() } }); setTaxData(await r.json().catch(() => null)) }

  // ====== DUPLICATES ======
  const [dupData, setDupData] = useState<any>(null)
  const loadDups = async () => { const r = await fetch('/api/duplicate-detection', { headers: { 'x-admin-email': getEmail() } }); setDupData(await r.json().catch(() => null)) }
  const dismissDup = async (id: string) => {
    await fetch('/api/duplicate-detection', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'dismiss', pairId: id }) })
    showToast('Dismissed'); loadDups()
  }

  // ====== ANOMALIES ======
  const [anomData, setAnomData] = useState<any>(null)
  const loadAnom = async () => { const r = await fetch('/api/anomaly', { headers: { 'x-admin-email': getEmail() } }); setAnomData(await r.json().catch(() => null)) }

  // ====== VENDORS ======
  const [vendorData, setVendorData] = useState<any>(null)
  const loadVendors = async () => { const r = await fetch('/api/vendor-scoring', { headers: { 'x-admin-email': getEmail() } }); setVendorData(await r.json().catch(() => null)) }

  // ====== LENDING ======
  const [lendingData, setLendingData] = useState<any>(null)
  const [lendingLoading, setLendingLoading] = useState(false)
  const loadLending = async () => { const r = await fetch('/api/lending-packet?view=preview', { headers: { 'x-admin-email': getEmail() } }); setLendingData(await r.json().catch(() => null)) }
  const generatePacket = async () => {
    setLendingLoading(true)
    await fetch('/api/lending-packet', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'generate', loanPurpose: 'Building refinance', requestedAmount: 1500000 }) })
    showToast('Lending packet generated'); setLendingLoading(false)
  }

  useEffect(() => { loadTax() }, [])
  useEffect(() => {
    if (tab === 'duplicates') loadDups()
    if (tab === 'anomalies') loadAnom()
    if (tab === 'vendors') loadVendors()
    if (tab === 'lending') loadLending()
  }, [tab])

  const tabs = [
    { key: 'tax', label: 'Tax Reserve', icon: '\uD83C\uDFE6' },
    { key: 'duplicates', label: 'Duplicate Scan', icon: '\uD83D\uDD0D' },
    { key: 'anomalies', label: 'Anomalies', icon: '\u26A0\uFE0F' },
    { key: 'vendors', label: 'Vendor Scoring', icon: '\u2B50' },
    { key: 'lending', label: 'Lending Packet', icon: '\uD83D\uDCC4' },
  ]

  const TIER_COLORS: Record<string, string> = { preferred: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', standard: 'bg-blue-500/10 text-blue-400 border-blue-500/20', watch: 'bg-rose-500/10 text-rose-400 border-rose-500/20', new: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div>
        <h1 className="text-xl font-bold">FinOps Pro</h1>
        <p className="text-sm text-gray-500 mt-1">Tax automation, fraud prevention, anomaly detection, and lending readiness</p>
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
      {/* TAX RESERVE */}
      {/* ================================================================ */}
      {tab === 'tax' && taxData && (
        <div className="space-y-4">
          {taxData.alerts?.map((a: any, i: number) => (
            <div key={i} className={'border rounded-xl p-3 text-sm ' + (a.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : a.severity === 'action' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-gray-500/5 border-gray-500/20 text-gray-400')}>
              {a.severity === 'warning' ? '\u26A0\uFE0F' : '\u2139\uFE0F'} {a.message}
            </div>
          ))}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Total Reserved</div>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">${taxData.summary?.totalReserved?.toLocaleString()}</div>
            </div>
            <div className="bg-[#0A0E15] border border-amber-500/20 rounded-xl p-4">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Pending Transfer</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">${taxData.summary?.pendingReserve?.toLocaleString()}</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[10px] text-gray-400 font-mono uppercase">YTD Net Income</div>
              <div className="text-2xl font-mono font-bold mt-1">${taxData.summary?.ytdIncome?.toLocaleString()}</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Reserve Rate</div>
              <div className="text-2xl font-mono font-bold mt-1">{(taxData.config?.reserveRate * 100)}%</div>
            </div>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Quarterly Estimated Tax Schedule</h3>
            <div className="space-y-2">
              {taxData.quarterlySchedule?.map((q: any) => (
                <div key={q.quarter} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div>
                    <div className="text-sm font-medium">{q.quarter}</div>
                    <div className="text-[10px] text-gray-500">Due: {q.dueDate}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={'text-[10px] font-mono px-2 py-0.5 rounded ' + (q.daysUntil <= 30 ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400')}>
                      {q.daysUntil > 0 ? q.daysUntil + ' days' : 'Past due'}
                    </span>
                    <span className="font-mono font-bold">${q.estimatedAmount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Monthly Reserve Tracking</h3>
            <div className="space-y-1">
              {taxData.monthlyData?.slice(-6).map((m: any) => (
                <div key={m.month} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-gray-400 font-mono w-20">{m.month}</span>
                  <span className="text-xs text-gray-400">Net: ${m.netIncome?.toLocaleString()}</span>
                  <span className="text-xs font-mono">Reserve: ${m.reserveAmount?.toLocaleString()}</span>
                  <span className={'text-[10px] px-1.5 py-0.5 rounded ' + (m.reserveStatus === 'funded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{m.reserveStatus}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* DUPLICATE DETECTION */}
      {/* ================================================================ */}
      {tab === 'duplicates' && dupData && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Invoices Scanned</div>
              <div className="text-2xl font-mono font-bold mt-1">{dupData.scannedCount}</div>
            </div>
            <div className="bg-[#0A0E15] border border-rose-500/20 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Duplicates Flagged</div>
              <div className="text-2xl font-mono font-bold text-rose-400 mt-1">{dupData.totalFlagged}</div>
            </div>
            <div className="bg-[#0A0E15] border border-amber-500/20 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Potential Savings</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">${dupData.potentialSavings?.toLocaleString()}</div>
            </div>
          </div>

          {dupData.duplicates?.length === 0 ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 text-center">
              <div className="text-2xl mb-2">{'\u2705'}</div>
              <div className="text-sm text-emerald-400 font-medium">No duplicates detected</div>
              <div className="text-xs text-gray-500 mt-1">All {dupData.scannedCount} invoices appear unique</div>
            </div>
          ) : (
            <div className="space-y-3">
              {dupData.duplicates?.map((d: any) => (
                <div key={d.id} className={'bg-[#0A0E15] border rounded-xl p-5 ' + (d.matchType === 'exact' ? 'border-rose-500/20' : d.matchType === 'probable' ? 'border-amber-500/20' : 'border-white/10')}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={'text-[10px] font-mono px-2 py-0.5 rounded font-bold ' +
                        (d.matchType === 'exact' ? 'bg-rose-500/10 text-rose-400' : d.matchType === 'probable' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400')}>
                        {d.matchScore}% match — {d.matchType}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => dismissDup(d.id)} className="px-3 py-1 bg-white/5 text-gray-400 rounded text-xs hover:bg-white/10">Dismiss</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] rounded-lg p-3">
                      <div className="text-xs font-medium">{d.expense1?.vendorName}</div>
                      <div className="text-lg font-mono font-bold">${d.expense1?.amount?.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500">{d.expense1?.invoiceDate} — {d.expense1?.invoiceNumber}</div>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-3">
                      <div className="text-xs font-medium">{d.expense2?.vendorName}</div>
                      <div className="text-lg font-mono font-bold">${d.expense2?.amount?.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500">{d.expense2?.invoiceDate} — {d.expense2?.invoiceNumber}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {d.matchReasons?.map((r: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-400">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* ANOMALY DETECTION */}
      {/* ================================================================ */}
      {tab === 'anomalies' && anomData && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0A0E15] border border-rose-500/20 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Critical</div>
              <div className="text-2xl font-mono font-bold text-rose-400 mt-1">{anomData.criticalCount}</div>
            </div>
            <div className="bg-[#0A0E15] border border-amber-500/20 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Warnings</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">{anomData.warningCount}</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Categories Monitored</div>
              <div className="text-2xl font-mono font-bold mt-1">{anomData.baselines?.length}</div>
            </div>
          </div>

          {anomData.anomalies?.map((a: any) => (
            <div key={a.id} className={'bg-[#0A0E15] border rounded-xl p-5 ' + (a.severity === 'critical' ? 'border-rose-500/20' : a.severity === 'warning' ? 'border-amber-500/20' : 'border-blue-500/20')}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={'text-sm font-semibold ' + (a.severity === 'critical' ? 'text-rose-400' : a.severity === 'warning' ? 'text-amber-400' : 'text-blue-400')}>
                    {a.severity === 'critical' ? '\uD83D\uDED1' : a.severity === 'warning' ? '\u26A0\uFE0F' : '\u2139\uFE0F'} {a.categoryLabel}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">{a.deviation}\u03C3 {a.direction}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold">${a.currentAmount?.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500">Expected: ${a.expectedRange?.low?.toLocaleString()} – ${a.expectedRange?.high?.toLocaleString()}</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{a.message}</p>
              <div className="flex flex-wrap gap-1">
                {a.possibleReasons?.map((r: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-500">{r}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Baseline Overview */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Spending Baselines</h3>
            <div className="space-y-2">
              {anomData.baselines?.slice(0, 8).map((b: any) => {
                const pctOfMean = b.currentSpend > 0 ? Math.round(b.currentSpend / b.mean * 100) : 0;
                return (
                  <div key={b.category} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-gray-400 w-40">{b.category.replace(/_/g, ' ')}</span>
                    <div className="flex-1 mx-4">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                        <div className="absolute h-full w-px bg-gray-600" style={{ left: '50%' }} />
                        <div className={'h-full rounded-full ' + (pctOfMean > 150 ? 'bg-rose-500' : pctOfMean > 120 ? 'bg-amber-500' : 'bg-emerald-500')}
                          style={{ width: Math.min(100, pctOfMean / 2) + '%' }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500 font-mono">avg ${b.mean?.toLocaleString()}</span>
                      <span className="text-xs font-mono font-bold w-16 text-right">${b.currentSpend?.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* VENDOR SCORING */}
      {/* ================================================================ */}
      {tab === 'vendors' && vendorData && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Total Vendors</div>
              <div className="text-2xl font-mono font-bold mt-1">{vendorData.summary?.totalVendors}</div>
            </div>
            <div className="bg-[#0A0E15] border border-emerald-500/20 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Preferred</div>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{vendorData.summary?.preferredCount}</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Avg Reliability</div>
              <div className="text-2xl font-mono font-bold mt-1">{vendorData.summary?.avgReliability}</div>
            </div>
            <div className="bg-[#0A0E15] border border-amber-500/20 rounded-xl p-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase">Discount Savings</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">${vendorData.summary?.discountSavings}</div>
            </div>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Vendor Scorecard</h3>
            <div className="space-y-2">
              {vendorData.vendors?.map((v: any) => (
                <div key={v.vendorName} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold">{v.reliabilityScore}</div>
                    <div>
                      <div className="text-sm font-medium">{v.vendorName}</div>
                      <div className="text-[10px] text-gray-500">{v.invoiceCount} invoices — avg {v.avgPaymentDays} days to pay — {v.onTimeRate}% on-time</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {v.earlyPayDiscount?.eligible && (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded">Save ${v.earlyPayDiscount.potentialSavings}</span>
                    )}
                    <span className={'text-[10px] font-mono px-2 py-0.5 rounded border ' + (TIER_COLORS[v.tier] || '')}>{v.tier}</span>
                    <span className="text-sm font-mono font-bold w-24 text-right">${v.totalSpend?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* LENDING PACKET */}
      {/* ================================================================ */}
      {tab === 'lending' && lendingData && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Lending Packet Generator</h3>
                <p className="text-sm text-gray-400 mt-1">One-click compilation of all financials for bank submissions</p>
                <div className="flex gap-2 mt-3">
                  {lendingData.sections?.map((s: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-1 bg-white/5 rounded text-gray-400">{s}</span>
                  ))}
                </div>
              </div>
              <button onClick={generatePacket} disabled={lendingLoading}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 text-sm">
                {lendingLoading ? 'Generating...' : 'Generate Packet'}
              </button>
            </div>
          </div>

          {/* Executive Summary Preview */}
          {lendingData.executiveSummary && (
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">Executive Summary Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(lendingData.executiveSummary).filter(([k]) => !['creditScores', 'loanPurpose'].includes(k)).map(([k, v]) => (
                  <div key={k} className="bg-white/[0.02] rounded-lg p-2">
                    <div className="text-[9px] text-gray-500 uppercase">{k.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-xs font-medium mt-0.5">{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* P&L Preview */}
          {lendingData.pnl && (
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">YTD P&amp;L Summary</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center"><div className="text-[9px] text-gray-500">Revenue</div><div className="font-mono font-bold text-emerald-400">${lendingData.pnl.revenue?.totalRevenue?.toLocaleString()}</div></div>
                <div className="text-center"><div className="text-[9px] text-gray-500">Gross Profit</div><div className="font-mono font-bold">${lendingData.pnl.grossProfit?.toLocaleString()}</div><div className="text-[9px] text-gray-500">{lendingData.pnl.grossMargin}% margin</div></div>
                <div className="text-center"><div className="text-[9px] text-gray-500">Operating Income</div><div className="font-mono font-bold">${lendingData.pnl.operatingIncome?.toLocaleString()}</div></div>
                <div className="text-center"><div className="text-[9px] text-gray-500">Net Income</div><div className={'font-mono font-bold ' + (lendingData.pnl.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400')}>${lendingData.pnl.netIncome?.toLocaleString()}</div><div className="text-[9px] text-gray-500">{lendingData.pnl.netMargin}% margin</div></div>
              </div>
            </div>
          )}

          {/* Balance Sheet Preview */}
          {lendingData.balanceSheet && (
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">Balance Sheet Summary</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center"><div className="text-[9px] text-gray-500">Total Assets</div><div className="font-mono font-bold text-blue-400">${lendingData.balanceSheet.assets?.totalAssets?.toLocaleString()}</div></div>
                <div className="text-center"><div className="text-[9px] text-gray-500">Total Liabilities</div><div className="font-mono font-bold text-rose-400">${lendingData.balanceSheet.liabilities?.totalLiabilities?.toLocaleString()}</div></div>
                <div className="text-center"><div className="text-[9px] text-gray-500">Total Equity</div><div className={'font-mono font-bold ' + ((lendingData.balanceSheet.equity?.totalEquity || 0) >= 0 ? 'text-emerald-400' : 'text-amber-400')}>${lendingData.balanceSheet.equity?.totalEquity?.toLocaleString()}</div></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
