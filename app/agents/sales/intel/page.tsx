'use client'
import { useState, useEffect } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const hdrs = () => ({ 'x-admin-email': getEmail(), 'Content-Type': 'application/json' })

const STYLE_COLORS: Record<string, string> = { Direct: 'bg-red-500/10 text-red-400 border-red-500/20', Analytical: 'bg-blue-500/10 text-blue-400 border-blue-500/20', Relational: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', Expressive: 'bg-violet-500/10 text-violet-400 border-violet-500/20' }

export default function SalesIntel() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyzeForm, setAnalyzeForm] = useState({ name: '', company: '', notes: '' })
  const [analyzing, setAnalyzing] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/sales-intel', { headers: { 'x-admin-email': getEmail() } })
    const d = await r.json()
    setProfiles(d.profiles || [])
    setLoading(false)
  }

  const loadDetail = async (id: string) => {
    const r = await fetch('/api/sales-intel?id=' + id, { headers: { 'x-admin-email': getEmail() } })
    const d = await r.json()
    setSelected(d.profile)
  }

  const analyze = async () => {
    setAnalyzing(true)
    const r = await fetch('/api/sales-intel', { method: 'POST', headers: hdrs(), body: JSON.stringify({ action: 'analyze', ...analyzeForm }) })
    const d = await r.json()
    if (d.profile) { setSelected(d.profile); load() }
    setAnalyzing(false)
    setAnalyzeForm({ name: '', company: '', notes: '' })
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <div><h1 className="text-xl font-bold">Sales Intelligence</h1><p className="text-sm text-gray-500 mt-1">Behavioral profiling + battle cards for every contact</p></div>

      <div className="grid grid-cols-12 gap-5">
        {/* LEFT: Profile List */}
        <div className="col-span-4 space-y-3">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Contacts ({profiles.length})</h3>
            {loading ? <div className="text-gray-500 text-sm">Loading...</div> :
              profiles.map(p => (
                <button key={p.id} onClick={() => loadDetail(p.id)}
                  className={'w-full text-left p-3 rounded-lg mb-2 transition-all ' + (selected?.id === p.id ? 'bg-white/[0.05] border border-white/10' : 'hover:bg-white/[0.02]')}>
                  <div className="flex justify-between items-start">
                    <div><div className="text-sm font-medium">{p.name}</div><div className="text-[10px] text-gray-500">{p.company}</div></div>
                    <span className={'text-[9px] px-2 py-0.5 rounded border ' + (STYLE_COLORS[p.style] || '')}>{p.style}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-[10px] text-gray-500">{p.persona}</div>
                    <div className="text-[10px] font-mono text-amber-400">RP: {p.realityScore}</div>
                  </div>
                </button>
              ))
            }
          </div>

          {/* Analyze New */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Analyze New Contact</h3>
            <input value={analyzeForm.name} onChange={e => setAnalyzeForm({...analyzeForm, name: e.target.value})} placeholder="Contact name" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm mb-2" />
            <input value={analyzeForm.company} onChange={e => setAnalyzeForm({...analyzeForm, company: e.target.value})} placeholder="Company" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm mb-2" />
            <textarea value={analyzeForm.notes} onChange={e => setAnalyzeForm({...analyzeForm, notes: e.target.value})} placeholder="Paste meeting notes..." rows={4} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm mb-2" />
            <button onClick={analyze} disabled={analyzing || !analyzeForm.name} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{analyzing ? 'Analyzing...' : 'Generate Profile'}</button>
          </div>
        </div>

        {/* RIGHT: Detail View */}
        <div className="col-span-8">
          {!selected ? (
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-8 text-center text-gray-600">Select a contact to view their behavioral profile and battle cards</div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xl font-bold">{selected.name}</div>
                    <div className="text-sm text-gray-400">{selected.title} — {selected.company}</div>
                  </div>
                  <div className="text-right">
                    <span className={'text-xs px-3 py-1 rounded border ' + (STYLE_COLORS[selected.style] || '')}>{selected.style}</span>
                    <div className="text-2xl font-mono font-bold mt-2">{selected.realityScore}<span className="text-xs text-gray-500">/100</span></div>
                    <div className="text-[10px] text-gray-500">Reality Potential Score</div>
                  </div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="text-sm font-medium text-amber-400 mb-1">"{selected.persona}"</div>
                  <div className="text-xs text-gray-400">{selected.personaDesc}</div>
                  <div className="text-xs text-gray-500 mt-2">Tone: {selected.tone}</div>
                </div>
              </div>

              {/* Battle Cards: DO / DON'T */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3">DO</h4>
                  {selected.dos?.map((d: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 text-xs border-b border-white/[0.03] last:border-0">
                      <span className="text-emerald-400 mt-0.5">✓</span><span className="text-gray-300">{d}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-rose-400 mb-3">DON'T</h4>
                  {selected.donts?.map((d: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 text-xs border-b border-white/[0.03] last:border-0">
                      <span className="text-rose-400 mt-0.5">✗</span><span className="text-gray-300">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buying Intel */}
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                <h4 className="text-sm font-semibold mb-3">Buying Intelligence</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Buying Triggers</div>
                    {selected.triggers?.map((t: string, i: number) => (
                      <div key={i} className="text-xs text-gray-300 py-0.5">• {t}</div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Pain Points</div>
                    {selected.painPoints?.map((p: string, i: number) => (
                      <div key={i} className="text-xs text-gray-300 py-0.5">• {p}</div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                  <div className="text-[10px] text-amber-400 uppercase mb-1">Buying Bridge</div>
                  <div className="text-xs text-gray-300">{selected.bridge}</div>
                </div>
              </div>

              {/* Negotiation Tips */}
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                <h4 className="text-sm font-semibold mb-3">Negotiation Tips</h4>
                {selected.negotiationTips?.map((t: string, i: number) => (
                  <div key={i} className="text-xs text-gray-300 py-1 border-b border-white/[0.03] last:border-0">{t}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
