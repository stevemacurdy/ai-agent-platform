'use client'
import { useState } from 'react'

const BUGS = [
  { id: 'B-001', title: 'Sidebar disappears on FinOps Pro', severity: 'high', status: 'fixed', reporter: 'Steve', date: '2026-02-15', notes: 'Added agents layout wrapper' },
  { id: 'B-002', title: 'Sales Reps shows Access Denied', severity: 'high', status: 'fixed', reporter: 'Steve', date: '2026-02-15', notes: 'Added seed data API' },
  { id: 'B-003', title: 'Hydration error on landing page', severity: 'medium', status: 'fixed', reporter: 'Steve', date: '2026-02-15', notes: 'Disabled SSR for landing page' },
  { id: 'B-004', title: 'Duplicate Payables in sidebar', severity: 'low', status: 'fixed', reporter: 'Steve', date: '2026-02-15', notes: 'Consolidated nav items' },
  { id: 'B-005', title: 'FinOps Pro JSON parse error', severity: 'medium', status: 'open', reporter: 'Steve', date: '2026-02-16', notes: 'Safe JSON parsing needed' },
  { id: 'B-006', title: 'Marketing pages blank (hash routes)', severity: 'medium', status: 'fixed', reporter: 'Steve', date: '2026-02-15', notes: 'Added redirect pages' },
]

export default function BugBashPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'fixed'>('all')
  const [newBug, setNewBug] = useState({ title: '', severity: 'medium', notes: '' })
  const [bugs, setBugs] = useState(BUGS)
  const [toast, setToast] = useState<string | null>(null)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }
  const filtered = filter === 'all' ? bugs : bugs.filter(b => b.status === filter)

  const addBug = () => {
    if (!newBug.title) return
    setBugs(prev => [{ id: 'B-' + String(prev.length + 1).padStart(3, '0'), title: newBug.title, severity: newBug.severity, status: 'open', reporter: 'Tester', date: new Date().toISOString().slice(0, 10), notes: newBug.notes }, ...prev])
    setNewBug({ title: '', severity: 'medium', notes: '' })
    show('Bug reported!')
  }

  const toggleStatus = (id: string) => {
    setBugs(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'open' ? 'fixed' : 'open' } : b))
  }

  const sevColors: Record<string, string> = { high: 'text-rose-400 bg-rose-500/10', medium: 'text-amber-400 bg-amber-500/10', low: 'text-blue-400 bg-blue-500/10' }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}
      <div>
        <h1 className="text-xl font-bold">Bug Bash</h1>
        <p className="text-sm text-gray-500 mt-1">Track and squash bugs from walkthrough sessions</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Total</div><div className="text-2xl font-mono font-bold mt-1">{bugs.length}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Open</div><div className="text-2xl font-mono font-bold text-rose-400 mt-1">{bugs.filter(b => b.status === 'open').length}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Fixed</div><div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{bugs.filter(b => b.status === 'fixed').length}</div></div>
      </div>

      {/* Report Bug */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Report a Bug</h3>
        <div className="flex gap-3">
          <input value={newBug.title} onChange={e => setNewBug({...newBug, title: e.target.value})} placeholder="Describe the bug..." className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm" />
          <select value={newBug.severity} onChange={e => setNewBug({...newBug, severity: e.target.value})} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm">
            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <input value={newBug.notes} onChange={e => setNewBug({...newBug, notes: e.target.value})} placeholder="Notes..." className="w-48 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm" />
          <button onClick={addBug} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Report</button>
        </div>
      </div>

      {/* Filter + List */}
      <div className="flex gap-2 mb-2">
        {(['all', 'open', 'fixed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
        {filtered.map(bug => (
          <div key={bug.id} className="flex items-center gap-4 p-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01]">
            <button onClick={() => toggleStatus(bug.id)} className={"w-6 h-6 rounded border-2 flex items-center justify-center text-xs " + (bug.status === 'fixed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-600 hover:border-gray-400')}>
              {bug.status === 'fixed' && '✓'}
            </button>
            <div className="flex-1">
              <div className={"text-sm font-medium " + (bug.status === 'fixed' ? 'text-gray-600 line-through' : '')}>{bug.title}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">{bug.id} · {bug.reporter} · {bug.date}{bug.notes ? ' · ' + bug.notes : ''}</div>
            </div>
            <span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (sevColors[bug.severity] || '')}>{bug.severity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
