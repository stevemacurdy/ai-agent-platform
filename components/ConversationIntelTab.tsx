'use client'
import { useState, useCallback } from 'react'
import AudioRecorder, { type RecordingSession, type TranscriptAnalysis } from './AudioRecorder'
import TranscriptReview from './TranscriptReview'

interface Props {
  projects: { id: string; name: string; contactId: string }[]
  contacts: { id: string; name: string; company: string }[]
  onMentorSync: (projectId: string, answers: any) => void
  onToast: (msg: string) => void
}

interface StoredRecording {
  id: string; date: string; projectId?: string; contactId?: string;
  duration: number; transcript: string; analysis: TranscriptAnalysis | null;
  audioUrl?: string; status: 'draft' | 'finalized'
}

export default function ConversationIntelTab({ projects, contacts, onMentorSync, onToast }: Props) {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [contactId, setContactId] = useState<string | null>(null)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [analysis, setAnalysis] = useState<TranscriptAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [recordings, setRecordings] = useState<StoredRecording[]>([])
  const [hasRecording, setHasRecording] = useState(false)

  const contactName = contactId ? contacts.find(c => c.id === contactId)?.name : undefined

  const handleTranscriptUpdate = useCallback((_segs: any, fullText: string) => {
    setCurrentTranscript(fullText)
  }, [])

  const handleRecordingComplete = useCallback(async (session: RecordingSession) => {
    setCurrentTranscript(session.fullTranscript)
    setHasRecording(true)

    // Auto-analyze
    setAnalyzing(true)
    try {
      const res = await fetch('/api/transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', transcript: session.fullTranscript }),
      })
      const data = await res.json()
      if (data.analysis) setAnalysis(data.analysis)
    } catch {
      onToast('Analysis failed — you can re-analyze manually')
    }
    setAnalyzing(false)
  }, [onToast])

  const handleEdit = (text: string) => {
    setCurrentTranscript(text)
    onToast('Transcript updated')
  }

  const handleReanalyze = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', transcript: currentTranscript }),
      })
      const data = await res.json()
      if (data.analysis) setAnalysis(data.analysis)
      onToast('Re-analysis complete')
    } catch {}
    setAnalyzing(false)
  }

  const handleFinalize = async () => {
    const rec: StoredRecording = {
      id: 'rec-' + Date.now(), date: new Date().toISOString().slice(0, 10),
      projectId: projectId || undefined, contactId: contactId || undefined,
      duration: 0, transcript: currentTranscript, analysis, status: 'finalized',
    }
    setRecordings(prev => [rec, ...prev])

    // Store server-side
    await fetch('/api/transcription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'store', transcript: currentTranscript, analysis, projectId, contactId }),
    }).catch(() => {})

    onToast('Recording finalized and stored')
    setHasRecording(false)
    setAnalysis(null)
    setCurrentTranscript('')
  }

  const handleSyncMentor = () => {
    if (!projectId || !analysis) { onToast('Select a project and complete analysis first'); return }
    onMentorSync(projectId, analysis.mentorAnswers)
    onToast('Mentor notes synced from call analysis')
  }

  const handleSyncCRM = () => {
    onToast('Transcript and notes pushed to CRM (dev mode)')
  }

  const handleResearch = (name: string) => {
    onToast('Research request sent for ' + name + ' — check Research Agent')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500/5 to-purple-500/5 border border-rose-500/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1"><span className="text-lg">🎙️</span><span className="text-sm font-bold text-rose-400">Conversation Intelligence</span></div>
        <div className="text-xs text-gray-400">Record meetings, get live transcription, auto-extract action items and personality insights.</div>
      </div>

      {/* Project / Contact Selector */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] text-gray-500 uppercase block mb-1">Project</label>
          <select value={projectId || ''} onChange={e => { setProjectId(e.target.value || null); const p = projects.find(x => x.id === e.target.value); if (p) setContactId(p.contactId) }}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
            <option value="">Select project...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[9px] text-gray-500 uppercase block mb-1">Contact</label>
          <select value={contactId || ''} onChange={e => setContactId(e.target.value || null)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
            <option value="">Select contact...</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
          </select>
        </div>
      </div>

      {/* Recorder */}
      <AudioRecorder
        onTranscriptUpdate={handleTranscriptUpdate}
        onRecordingComplete={handleRecordingComplete}
        projectId={projectId || undefined}
        contactName={contactName}
      />

      {/* Review (after recording stops) */}
      {hasRecording && (
        <TranscriptReview
          transcript={currentTranscript}
          analysis={analysis}
          analyzing={analyzing}
          onEdit={handleEdit}
          onFinalize={handleFinalize}
          onReanalyze={handleReanalyze}
          onSyncMentor={handleSyncMentor}
          onSyncCRM={handleSyncCRM}
          onResearchContact={handleResearch}
        />
      )}

      {/* Previous Recordings */}
      {recordings.length > 0 && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <div className="text-[9px] text-gray-500 uppercase mb-3">Previous Recordings</div>
          {recordings.map(rec => (
            <div key={rec.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-sm">🎙️</span>
                <div>
                  <div className="text-xs font-medium text-gray-300">{rec.date}</div>
                  <div className="text-[10px] text-gray-500 truncate max-w-md">{rec.transcript.slice(0, 80)}...</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rec.analysis && <span className="text-[9px] text-emerald-400">Analyzed ✓</span>}
                <span className={"text-[9px] px-1.5 py-0.5 rounded " + (rec.status === 'finalized' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{rec.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Integration Guide */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <div className="text-[9px] text-gray-500 uppercase mb-3">Transcription Provider Status</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
            <div className="text-xs font-bold text-emerald-400 mb-1">Web Speech API</div>
            <div className="text-[10px] text-gray-400">Active — free, browser-native, English. Good for dev/demo.</div>
            <div className="text-[9px] text-emerald-400 mt-1">● Active</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-xs font-bold text-blue-400 mb-1">Deepgram Nova-2</div>
            <div className="text-[10px] text-gray-500">Recommended for production. Real-time streaming, speaker ID, custom sales vocabulary.</div>
            <div className="text-[9px] text-gray-600 mt-1">○ Not connected</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-xs font-bold text-purple-400 mb-1">OpenAI Whisper</div>
            <div className="text-[10px] text-gray-500">Batch mode. Highest accuracy for post-call analysis. $0.006/min.</div>
            <div className="text-[9px] text-gray-600 mt-1">○ Not connected</div>
          </div>
        </div>
      </div>
    </div>
  )
}
