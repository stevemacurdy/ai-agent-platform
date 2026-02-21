'use client'

import { useState, useEffect } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const hdrs = () => ({ 'x-admin-email': getEmail(), 'Content-Type': 'application/json' })

const STYLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Analytical: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Direct: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  Expressive: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  Relational: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
}

export default function SalesIntelPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [showAnalyze, setShowAnalyze] = useState(false)
  const [analyzeForm, setAnalyzeForm] = useState({ contactId: '', contactName: '', company: '', notes: '' })
  const [analyzing, setAnalyzing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  const loadProfiles = async () => {
    const r = await fetch('/api/sales-intel', { headers: { 'x-admin-email': getEmail() } })
    const data = await r.json()
    setProfiles(data.profiles || [])
  }

  useEffect(() => { loadProfiles() }, [])

  const analyze = async () => {
    setAnalyzing(true)
    const r = await fetch('/api/sales-intel', {
      method: 'POST', headers: hdrs(),
      body: JSON.stringify({ action: 'analyze', contactId: analyzeForm.contactId || 'contact-' + Date.now(), contactName: analyzeForm.contactName, company: analyzeForm.company, notes: analyzeForm.notes }),
    })
    const data = await r.json()
    setAnalyzing(false)
    if (data.profile) {
      setSelected(data.profile)
      setShowAnalyze(false)
      setAnalyzeForm({ contactId: '', contactName: '', company: '', notes: '' })
      showToast('Behavioral profile generated')
      loadProfiles()
    }
  }

  const sc = (style: string) => STYLE_COLORS[style] || STYLE_COLORS.Direct

  return (
    <div className="max-w-[1200px] mx-auto">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div className="flex gap-5">
        {/* LEFT: Profile List */}
        <div className="w-80 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Sales Intel</h1>
            <button onClick={() => setShowAnalyze(!showAnalyze)} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs">+ Analyze</button>
          </div>

          {showAnalyze && (
            <div className="bg-[#0A0E15] border border-blue-500/20 rounded-xl p-4 space-y-3">
              <input value={analyzeForm.contactName} onChange={e => setAnalyzeForm({...analyzeForm, contactName: e.target.value})} placeholder="Contact name" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              <input value={analyzeForm.company} onChange={e => setAnalyzeForm({...analyzeForm, company: e.target.value})} placeholder="Company" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              <textarea value={analyzeForm.notes} onChange={e => setAnalyzeForm({...analyzeForm, notes: e.target.value})} placeholder="Paste meeting notes or transcript..." rows={6} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm resize-none" />
              <button onClick={analyze} disabled={!analyzeForm.contactName || !analyzeForm.notes || analyzing}
                className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-40">
                {analyzing ? 'Analyzing...' : 'Generate Profile'}
              </button>
            </div>
          )}

          {profiles.map(p => (
            <button key={p.contactId} onClick={() => setSelected(p)}
              className={'w-full text-left rounded-xl p-4 border transition-all ' +
                (selected?.contactId === p.contactId ? 'bg-blue-500/5 border-blue-500/20' : 'bg-[#0A0E15] border-white/5 hover:border-white/10')}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{p.contactName}</div>
                <div className={'text-lg font-bold ' + (p.realityPotentialScore >= 70 ? 'text-emerald-400' : p.realityPotentialScore >= 40 ? 'text-amber-400' : 'text-rose-400')}>{p.realityPotentialScore}</div>
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">{p.company}</div>
              <div className="flex gap-1 mt-2">
                <span className={'text-[10px] px-1.5 py-0.5 rounded ' + sc(p.communicationStyle).bg + ' ' + sc(p.communicationStyle).text}>{p.communicationStyle}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">{p.buyerPersona}</span>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT: Profile Detail */}
        <div className="flex-1 space-y-4">
          {!selected ? (
            <div className="flex items-center justify-center h-[400px] bg-[#0A0E15] border border-white/5 rounded-xl">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-3">{'\uD83C\uDFAF'}</div>
                <div className="text-sm">Select a contact to view their Behavioral Blueprint</div>
                <div className="text-xs mt-1">Or click "+ Analyze" to create a new profile</div>
              </div>
            </div>
          ) : (
            <>
              {/* Header Card */}
              <div className={'bg-gradient-to-br rounded-xl p-6 border ' + sc(selected.communicationStyle).border + ' from-[#0A0E15] to-[#0D1117]'}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selected.contactName}</h2>
                    <div className="text-sm text-gray-400 mt-0.5">{selected.company}</div>
                    <div className="flex gap-2 mt-3">
                      <span className={'text-xs px-3 py-1 rounded-full border ' + sc(selected.communicationStyle).bg + ' ' + sc(selected.communicationStyle).text + ' ' + sc(selected.communicationStyle).border}>{selected.communicationStyle}</span>
                      <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">{selected.buyerPersona}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase">Reality Score</div>
                    <div className={'text-4xl font-bold ' + (selected.realityPotentialScore >= 70 ? 'text-emerald-400' : selected.realityPotentialScore >= 40 ? 'text-amber-400' : 'text-rose-400')}>{selected.realityPotentialScore}</div>
                    <div className={'text-[10px] mt-1 ' + (selected.engagementLevel === 'very_high' ? 'text-emerald-400' : selected.engagementLevel === 'high' ? 'text-blue-400' : 'text-gray-500')}>{selected.engagementLevel?.replace('_', ' ')} engagement</div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed">{selected.personaDescription}</p>
              </div>

              {/* Tone & Buying Bridge */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase mb-2">Tone &amp; Pace</div>
                  <p className="text-xs text-gray-300 leading-relaxed">{selected.tonePace}</p>
                </div>
                <div className="bg-[#0A0E15] border border-blue-500/20 rounded-xl p-4">
                  <div className="text-[10px] text-blue-400 uppercase mb-2">The Buying Bridge</div>
                  <p className="text-xs text-gray-300 leading-relaxed">{selected.buyingBridge}</p>
                </div>
              </div>

              {/* Buying Triggers + Pain Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase mb-2">Buying Triggers</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.buyingTriggers?.map((t: string, i: number) => (
                      <span key={i} className={'text-[10px] px-2 py-1 rounded ' + sc(selected.communicationStyle).bg + ' ' + sc(selected.communicationStyle).text}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase mb-2">Pain Points</div>
                  <div className="space-y-1">
                    {selected.painPoints?.map((p: string, i: number) => (
                      <div key={i} className="text-[10px] text-gray-400">{'\uD83D\uDD34'} {p}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* THE BATTLE CARD — DO / DO NOT */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-xl p-5">
                  <div className="text-sm font-bold text-emerald-400 mb-3">{'\u2705'} DO — Field Manual</div>
                  <div className="space-y-2">
                    {selected.doList?.map((item: string, i: number) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="text-emerald-400 flex-shrink-0 font-bold">{i + 1}.</span>
                        <span className="text-gray-300 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-rose-500/[0.03] border border-rose-500/20 rounded-xl p-5">
                  <div className="text-sm font-bold text-rose-400 mb-3">{'\u274C'} DO NOT — Pitfalls</div>
                  <div className="space-y-2">
                    {selected.dontList?.map((item: string, i: number) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="text-rose-400 flex-shrink-0 font-bold">{i + 1}.</span>
                        <span className="text-gray-300 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Negotiation Tips */}
              {selected.negotiationTips && (
                <div className="bg-[#0A0E15] border border-amber-500/20 rounded-xl p-5">
                  <div className="text-sm font-bold text-amber-400 mb-3">{'\uD83E\uDD1D'} Negotiation Intel</div>
                  <div className="space-y-2">
                    {selected.negotiationTips.map((tip: string, i: number) => (
                      <div key={i} className="text-xs text-gray-300 flex gap-2">
                        <span className="text-amber-400">{'\u25B8'}</span>{tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Notes Source */}
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-gray-500 uppercase">Source Notes</div>
                  <div className="text-[10px] text-gray-600">Analyzed: {new Date(selected.lastAnalyzed).toLocaleDateString()}</div>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{selected.meetingNotes}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
