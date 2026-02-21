#!/usr/bin/env node
/**
 * WoulfAI WALKTHROUGH FIX — All Issues from Live Review
 * 
 * Fixes:
 *   1. Sidebar: Remove dup Payables, nest Sales items, fix CFO Console duplication
 *   2. Payables: Rename button, add file upload + mobile camera
 *   3. Sales Reps: Fix API, fix page, fix dashboard redirect, fix agent linking
 *   4. Blank Pages: Landing scroll sections + marketing route redirects
 * 
 * Run from: ai-agent-platform root
 * Usage: node walkthrough-fix.js
 */
const fs = require('fs');
const path = require('path');
let installed = 0;

function write(rel, content) {
  const fp = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
  console.log('  + ' + rel + ' (' + content.split('\n').length + ' lines)');
  installed++;
}

console.log('');
console.log('  ╔══════════════════════════════════════════════════════╗');
console.log('  ║  WoulfAI WALKTHROUGH FIX                             ║');
console.log('  ║  Sidebar + Payables + Sales Reps + Blank Pages       ║');
console.log('  ╚══════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// FIX 1: ADMIN SIDEBAR LAYOUT
// - Remove duplicate Payables (lives inside CFO Console)
// - Nest Sales Intel + Sales CRM under Sales Reps
// - Single CFO Console entry with proper icon
// ============================================================
console.log('  [1] Sidebar Layout:');

write('app/admin/layout.tsx', `'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, canAccessAdmin, getLoginRedirect, signOut, type User } from '@/lib/supabase'

interface NavItem {
  id: string; label: string; href: string; icon: string;
  children?: { id: string; label: string; href: string; icon: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hub', label: 'Command Center', href: '/admin', icon: '🎯' },
  { id: 'users', label: 'Users & Roles', href: '/admin/users', icon: '👥' },
  { id: 'sales', label: 'Sales Reps', href: '/admin/sales-reps', icon: '💼', children: [
    { id: 'sales-crm', label: 'Sales CRM', href: '/admin/sales-crm', icon: '📊' },
    { id: 'sales-intel', label: 'Sales Intel', href: '/agents/sales/intel', icon: '🧠' },
  ]},
  { id: 'cfo-console', label: 'CFO Console', href: '/agents/cfo/console', icon: '📈' },
  { id: 'cfo-tools', label: 'CFO Tools', href: '/agents/cfo/tools', icon: '🔧' },
  { id: 'finops', label: 'FinOps Suite', href: '/agents/cfo/finops', icon: '💰' },
  { id: 'finops-pro', label: 'FinOps Pro', href: '/agents/cfo/finops-pro', icon: '⚡' },
  { id: 'agents', label: 'Agent Creator', href: '/admin/agent-creator', icon: '🧬' },
  { id: 'bug-bash', label: 'Bug Bash', href: '/admin/bug-bash', icon: '🐛' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ok, setOk] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ sales: true })

  useEffect(() => {
    async function check() {
      const u = await getCurrentUser()
      if (!u) { router.push('/login'); return }
      if (!canAccessAdmin(u)) { router.push(getLoginRedirect(u)); return }
      setUser(u)
      setOk(true)
    }
    check()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!ok) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isActive = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href))

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedGroups[item.id]
    const childActive = hasChildren && item.children!.some(c => isActive(c.href))
    const selfActive = isActive(item.href)

    return (
      <div key={item.id}>
        <div className="flex items-center">
          <Link
            href={item.href}
            className={\`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all \${
              selfActive || childActive
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <span className="text-base">{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
          {hasChildren && sidebarOpen && (
            <button
              onClick={() => toggleGroup(item.id)}
              className="px-2 py-2.5 text-gray-500 hover:text-white text-xs"
            >
              {isExpanded ? '▾' : '▸'}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && sidebarOpen && (
          <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/5 pl-2">
            {item.children!.map(child => (
              <Link
                key={child.id}
                href={child.href}
                className={\`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all \${
                  isActive(child.href)
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }\`}
              >
                <span className="text-sm">{child.icon}</span>
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#06080D] text-white flex">
      <aside className={\`\${sidebarOpen ? 'w-64' : 'w-16'} bg-[#0A0E15] border-r border-white/5 flex flex-col transition-all duration-200 flex-shrink-0\`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          {sidebarOpen && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-sm font-bold">W</div>
              <div>
                <div className="text-sm font-bold">WoulfAI</div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Admin Console</div>
              </div>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white text-lg">
            {sidebarOpen ? '◁' : '▷'}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(renderNavItem)}
        </nav>

        <div className="p-3 border-t border-white/5">
          {sidebarOpen && user && (
            <div className="px-3 py-2 mb-2">
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
              <div className="text-[10px] text-gray-600">{user.role}</div>
            </div>
          )}
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <span>🚪</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
`);

// ============================================================
// FIX 2: PAYABLES — Rename button + file upload + mobile camera
// ============================================================
console.log('');
console.log('  [2] Payables Engine (button rename + file upload):');

write('app/agents/cfo/payables/page.tsx', `'use client'
import { useState, useEffect, useRef } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const hdrs = () => ({ 'x-admin-email': getEmail(), 'Content-Type': 'application/json' })
const fmt = (n: number) => '$' + n.toLocaleString()

export default function PayablesEngine() {
  const [tab, setTab] = useState<'intake' | 'review' | 'pay' | 'reconcile'>('intake')
  const [toast, setToast] = useState<string | null>(null)
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  const [pending, setPending] = useState<any[]>([])
  const [loadingReview, setLoadingReview] = useState(false)
  const [methods, setMethods] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [recon, setRecon] = useState<any>(null)
  const [reconLoading, setReconLoading] = useState(false)
  const [captureForm, setCaptureForm] = useState({ vendor: '', invoice: '', amount: '', category: 'supplies', date: '' })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const loadPending = async () => {
    setLoadingReview(true)
    try { const r = await fetch('/api/finance-capture?view=pending', { headers: { 'x-admin-email': getEmail() } }); const d = await r.json(); setPending(d.items || []) } catch {}
    setLoadingReview(false)
  }
  const loadMethods = async () => { try { const r = await fetch('/api/finance-capture?view=methods', { headers: { 'x-admin-email': getEmail() } }); const d = await r.json(); setMethods(d.methods || []) } catch {} }
  const loadPayments = async () => { try { const r = await fetch('/api/finance-capture?view=history', { headers: { 'x-admin-email': getEmail() } }); const d = await r.json(); setPayments(d.payments || []) } catch {} }
  const loadRecon = async () => { setReconLoading(true); try { const r = await fetch('/api/finance-reconcile', { headers: { 'x-admin-email': getEmail() } }); setRecon(await r.json()) } catch {}; setReconLoading(false) }

  useEffect(() => { loadPending(); loadMethods(); loadPayments(); loadRecon() }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // Extract vendor name from filename as hint
      const name = file.name.replace(/\\.[^.]+$/, '').replace(/[-_]/g, ' ')
      setCaptureForm(prev => ({ ...prev, vendor: prev.vendor || name }))
      show('File loaded: ' + file.name)
    }
  }

  const loadInvoice = async () => {
    await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'capture', ...captureForm, amount: parseFloat(captureForm.amount) || 0, fileName: uploadedFile?.name || null }) })
    show('Invoice loaded' + (uploadedFile ? ' from ' + uploadedFile.name : ''))
    setCaptureForm({ vendor: '', invoice: '', amount: '', category: 'supplies', date: '' })
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    loadPending()
  }

  const approve = async (id: string) => { await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'approve', id }) }); show('Approved → pushed to AP ledger'); loadPending() }
  const reject = async (id: string) => { await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'reject', id }) }); show('Rejected'); loadPending() }
  const pay = async (vendor: string, amount: number, methodId: string) => { const r = await fetch('/api/finance-capture', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'pay', vendor, amount, methodId }) }); const d = await r.json(); show('Paid — confirmation: ' + d.payment?.confirmation); loadPayments() }
  const autoReconcile = async () => { const r = await fetch('/api/finance-reconcile', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'auto-reconcile-all' }) }); const d = await r.json(); show(d.matched + ' transactions auto-reconciled'); loadRecon() }

  const tabs = [
    { id: 'intake' as const, label: 'Add Vendor Bill' },
    { id: 'review' as const, label: 'Pending Review' },
    { id: 'pay' as const, label: 'Pay Invoices' },
    { id: 'reconcile' as const, label: 'Reconciliation' },
  ]

  const inputCls = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}
      <div><h1 className="text-xl font-bold">Payables Engine</h1><p className="text-sm text-gray-500 mt-1">Capture → Review → Pay → Reconcile</p></div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {t.label}{t.id === 'review' && pending.length > 0 && <span className="ml-2 bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded">{pending.length}</span>}
          </button>
        ))}
      </div>

      {/* ADD VENDOR BILL (was Smart Intake) */}
      {tab === 'intake' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Add Vendor Bill</h3>

          {/* File Upload Area */}
          <div className="mb-5">
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-blue-500/30 transition-colors">
              {uploadedFile ? (
                <div className="space-y-2">
                  <div className="text-3xl">📄</div>
                  <div className="text-sm font-medium">{uploadedFile.name}</div>
                  <div className="text-[10px] text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                  <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="text-xs text-rose-400 hover:text-rose-300">Remove</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-3xl">📎</div>
                  <div className="text-sm text-gray-400">Drop a PDF invoice here, or</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {/* File browser button */}
                    <button onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
                      Browse Files
                    </button>
                    {/* Camera button (mobile only, but always rendered for desktop testing) */}
                    <button onClick={() => cameraInputRef.current?.click()}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                      📷 {isMobile ? 'Take Photo' : 'Camera'}
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-600">Supports PDF, PNG, JPG</div>
                </div>
              )}
              {/* Hidden file inputs */}
              <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>

          {/* Manual fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
          <button onClick={loadInvoice} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
            Load Invoice
          </button>
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
                  <div><div className="font-medium">{item.vendor}</div><div className="text-xs text-gray-500">Invoice: {item.invoice} — {item.date}</div></div>
                  <div className="text-right"><div className="font-mono font-bold">{fmt(item.amount)}</div><div className="text-[10px] text-gray-500">Confidence: <span className={item.confidence >= 90 ? 'text-emerald-400' : 'text-amber-400'}>{item.confidence}%</span></div></div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
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
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Bank Balance</div><div className="font-mono font-bold mt-1">{fmt(Math.abs(recon.reconciliation?.bankBalance || 0))}</div></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Unreconciled</div><div className="font-mono font-bold text-amber-400 mt-1">{recon.reconciliation?.unreconciled}</div></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Reconciled</div><div className="font-mono font-bold text-emerald-400 mt-1">{recon.reconciliation?.reconciled}</div></div>
              </div>
              <div className="overflow-x-auto">
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
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
`);

// ============================================================
// FIX 3A: SALES REPS API
// ============================================================
console.log('');
console.log('  [3] Sales Reps (API + Page + Dashboard redirect):');

write('app/api/admin/sales-reps/route.ts', `import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) {
  const e = req.headers.get('x-admin-email');
  return e && ADMINS.includes(e.toLowerCase());
}

const salesReps = [
  {
    id: 'rep-1', name: 'Steve Macurdy', email: 'steve@woulfgroup.com', role: 'Founder / Lead Sales',
    territory: 'National', status: 'active', avatar: 'SM',
    stats: { totalDeals: 12, wonDeals: 8, pipeline: 485000, closedRevenue: 312000, avgDealSize: 39000, winRate: 67 },
    recentActivity: [
      { date: '2026-02-14', type: 'call', description: 'Follow-up with Marcus Chen at Logicorp' },
      { date: '2026-02-12', type: 'meeting', description: 'Proposal review with Sarah Kim, Pinnacle Group' },
      { date: '2026-02-10', type: 'email', description: 'Sent SOW to Tom Bradley, GreenLeaf Supply' },
    ],
    connectedCrm: { platform: 'HubSpot', status: 'configured', lastSync: '2026-02-16T10:00:00Z' },
  },
  {
    id: 'rep-2', name: 'Jake Morrison', email: 'jake@woulfgroup.com', role: 'Sales Representative',
    territory: 'Northeast', status: 'active', avatar: 'JM',
    stats: { totalDeals: 6, wonDeals: 3, pipeline: 180000, closedRevenue: 94000, avgDealSize: 31333, winRate: 50 },
    recentActivity: [
      { date: '2026-02-13', type: 'call', description: 'Cold outreach to FreshPack Logistics' },
      { date: '2026-02-11', type: 'email', description: 'Sent case study to Meridian Transport' },
    ],
    connectedCrm: null,
  },
  {
    id: 'rep-3', name: 'Lisa Chen', email: 'lisa@woulfgroup.com', role: 'Sales Representative',
    territory: 'West Coast', status: 'active', avatar: 'LC',
    stats: { totalDeals: 4, wonDeals: 2, pipeline: 220000, closedRevenue: 68000, avgDealSize: 34000, winRate: 50 },
    recentActivity: [
      { date: '2026-02-15', type: 'meeting', description: 'Site walk with PacificShore Distribution' },
      { date: '2026-02-13', type: 'call', description: 'Discovery call with SunValley Warehouse' },
    ],
    connectedCrm: { platform: 'Salesforce', status: 'pending', lastSync: null },
  },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const id = new URL(request.url).searchParams.get('id');

  if (id) {
    const rep = salesReps.find(r => r.id === id);
    return rep ? NextResponse.json({ rep }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const teamStats = {
    totalReps: salesReps.length,
    totalPipeline: salesReps.reduce((s, r) => s + r.stats.pipeline, 0),
    totalClosed: salesReps.reduce((s, r) => s + r.stats.closedRevenue, 0),
    avgWinRate: Math.round(salesReps.reduce((s, r) => s + r.stats.winRate, 0) / salesReps.length),
  };

  return NextResponse.json({ reps: salesReps, teamStats });
}
`);

// ============================================================
// FIX 3B: SALES REPS PAGE — Full rewrite
// ============================================================
write('app/admin/sales-reps/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const fmt = (n: number) => '$' + n.toLocaleString()

export default function SalesRepsPage() {
  const router = useRouter()
  const [reps, setReps] = useState<any[]>([])
  const [teamStats, setTeamStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRep, setSelectedRep] = useState<any>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/sales-reps', { headers: { 'x-admin-email': getEmail() } })
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setReps(data.reps || [])
        setTeamStats(data.teamStats || null)
      } catch (e: any) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
  }, [])

  const loadRepDetail = async (id: string) => {
    const res = await fetch('/api/admin/sales-reps?id=' + id, { headers: { 'x-admin-email': getEmail() } })
    const data = await res.json()
    setSelectedRep(data.rep)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <div className="text-4xl">⚠️</div>
      <div className="text-lg font-semibold">Could not load sales reps</div>
      <div className="text-sm text-gray-500">{error}</div>
      <button onClick={() => router.push('/dashboard')} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">
        Back to Dashboard
      </button>
    </div>
  )

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Sales Team</h1>
          <p className="text-sm text-gray-500 mt-1">{reps.length} representatives</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/sales-crm" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
            📊 Sales CRM
          </Link>
          <Link href="/agents/sales/intel" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
            🧠 Sales Intel
          </Link>
        </div>
      </div>

      {/* Team Stats */}
      {teamStats && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Total Pipeline</div><div className="text-xl font-mono font-bold mt-1">{fmt(teamStats.totalPipeline)}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Closed Revenue</div><div className="text-xl font-mono font-bold text-emerald-400 mt-1">{fmt(teamStats.totalClosed)}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Avg Win Rate</div><div className="text-xl font-mono font-bold text-blue-400 mt-1">{teamStats.avgWinRate}%</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Active Reps</div><div className="text-xl font-mono font-bold mt-1">{teamStats.totalReps}</div></div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-5">
        {/* Rep List */}
        <div className="col-span-4 space-y-3">
          {reps.map(rep => (
            <button key={rep.id} onClick={() => loadRepDetail(rep.id)}
              className={"w-full text-left bg-[#0A0E15] border rounded-xl p-4 transition-all " + (selectedRep?.id === rep.id ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5 hover:border-white/10')}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">{rep.avatar}</div>
                <div>
                  <div className="text-sm font-medium">{rep.name}</div>
                  <div className="text-[10px] text-gray-500">{rep.role}</div>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{rep.territory}</span>
                <span className="text-emerald-400 font-mono">{fmt(rep.stats.pipeline)}</span>
              </div>
              {rep.connectedCrm && (
                <div className="mt-2 text-[10px] text-gray-600">
                  {rep.connectedCrm.platform} • <span className={rep.connectedCrm.status === 'configured' ? 'text-emerald-400' : 'text-amber-400'}>{rep.connectedCrm.status}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Rep Detail */}
        <div className="col-span-8">
          {!selectedRep ? (
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-8 text-center text-gray-600">
              Select a sales rep to view their profile and performance
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-lg font-bold">{selectedRep.avatar}</div>
                  <div>
                    <div className="text-lg font-bold">{selectedRep.name}</div>
                    <div className="text-sm text-gray-400">{selectedRep.role} — {selectedRep.territory}</div>
                    <div className="text-xs text-gray-500">{selectedRep.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Pipeline</div><div className="font-mono font-bold">{fmt(selectedRep.stats.pipeline)}</div></div>
                  <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Closed</div><div className="font-mono font-bold text-emerald-400">{fmt(selectedRep.stats.closedRevenue)}</div></div>
                  <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[9px] text-gray-500">Win Rate</div><div className="font-mono font-bold text-blue-400">{selectedRep.stats.winRate}%</div></div>
                </div>
              </div>

              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                <h4 className="text-sm font-semibold mb-3">Recent Activity</h4>
                {selectedRep.recentActivity?.map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.03] last:border-0">
                    <div className="text-sm">{a.type === 'call' ? '📞' : a.type === 'meeting' ? '🤝' : '✉️'}</div>
                    <div><div className="text-xs">{a.description}</div><div className="text-[10px] text-gray-600">{a.date}</div></div>
                  </div>
                ))}
              </div>

              {selectedRep.connectedCrm && (
                <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                  <h4 className="text-sm font-semibold mb-2">Connected CRM</h4>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{selectedRep.connectedCrm.platform}</div>
                    <span className={"text-[10px] px-2 py-0.5 rounded " + (selectedRep.connectedCrm.status === 'configured' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                      {selectedRep.connectedCrm.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
`);

// ============================================================
// FIX 4: BLANK MARKETING PAGES — Redirect to landing page sections
// ============================================================
console.log('');
console.log('  [4] Blank Marketing Pages (redirects to landing sections):');

const marketingPages = ['agents', 'demo', 'how-it-works', 'beta', 'pricing', 'integrations'];
marketingPages.forEach(section => {
  const sectionId = section; // matches <section id="..."> in the HTML
  write(`app/${section}/page.tsx`, `'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ${section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page() {
  const router = useRouter()
  useEffect(() => {
    // Redirect to landing page with section anchor
    router.replace('/#${sectionId}')
  }, [router])
  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
`);
});

// ============================================================
// FIX 5: DASHBOARD PAGE — Proper agent cards with links
// ============================================================
console.log('');
console.log('  [5] Dashboard (proper agent cards):');

write('app/dashboard/page.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserAgents, isSuperAdmin, type AgentName, type User, ALL_AGENTS } from '@/lib/supabase'

const AGENT_INFO: Record<string, { label: string; desc: string; icon: string; href: string }> = {
  cfo: { label: 'CFO Agent', desc: 'Financial intelligence, invoices, collections, and health monitoring', icon: '📈', href: '/agents/cfo/console' },
  sales: { label: 'Sales Agent', desc: 'CRM pipeline, behavioral profiling, and deal intelligence', icon: '💼', href: '/admin/sales-reps' },
  hr: { label: 'HR Agent', desc: 'Employee management, onboarding, and compliance', icon: '👥', href: '/admin/users' },
  ops: { label: 'Operations Agent', desc: 'Warehouse automation, equipment tracking, and logistics', icon: '⚙️', href: '/agents/cfo/finops' },
  legal: { label: 'Legal Agent', desc: 'Contract analysis, compliance monitoring, and document review', icon: '⚖️', href: '/agents/cfo/tools' },
  marketing: { label: 'Marketing Agent', desc: 'Campaign management, analytics, and content strategy', icon: '📣', href: '/admin' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [agents, setAgents] = useState<AgentName[]>([])

  useEffect(() => {
    async function load() {
      const me = await getCurrentUser()
      if (!me) { router.push('/login'); return }
      setUser(me)
      const myAgents = await getUserAgents(me)
      setAgents(myAgents.length > 0 ? myAgents : ALL_AGENTS)
    }
    load()
  }, [router])

  if (!user) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#06080D] text-white">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back{user.full_name ? ', ' + user.full_name : ''}</h1>
            <p className="text-sm text-gray-500 mt-1">{user.email} — {user.role}</p>
          </div>
          {isSuperAdmin(user) && (
            <Link href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">
              Admin Console
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agentKey => {
            const info = AGENT_INFO[agentKey] || { label: agentKey, desc: 'AI Agent', icon: '🤖', href: '/admin' }
            return (
              <Link key={agentKey} href={info.href}
                className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-blue-500/20 hover:bg-blue-500/[0.02] transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{info.icon}</div>
                  <div className="text-sm font-semibold group-hover:text-blue-400 transition-colors">{info.label}</div>
                </div>
                <p className="text-xs text-gray-500">{info.desc}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
`);

// ============================================================
// DONE
// ============================================================
console.log('');
console.log('  ═══════════════════════════════════════════');
console.log('  Installed: ' + installed + ' files');
console.log('  ═══════════════════════════════════════════');
console.log('');
console.log('  Restart your dev server:');
console.log('    Ctrl+C (in the npm run dev terminal)');
console.log('    npm run dev');
console.log('');
console.log('  Then verify:');
console.log('    http://localhost:3000/admin          → New sidebar');
console.log('    http://localhost:3000/admin/sales-reps → Sales team');
console.log('    http://localhost:3000/agents/cfo/payables → "Load Invoice" button');
console.log('    http://localhost:3000/dashboard       → Agent cards');
console.log('    http://localhost:3000/agents          → Redirects to /#agents');
console.log('');
