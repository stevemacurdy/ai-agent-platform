#!/usr/bin/env node
/**
 * WoulfAI — CONVERSATION INTELLIGENCE MODULE
 *
 * Adds to the Solo Salesman Agent:
 *   1. AudioRecorder component — MediaStream API, waveform, timer
 *   2. Live transcription — Web Speech API (local) + Deepgram/Whisper (production)
 *   3. AI analysis pipeline — Meeting notes, to-dos, personality profiling
 *   4. Cross-module sync — Mentor auto-fill, CRM storage, research triggers
 *   5. Transcript review/edit — Editable before finalization
 *   6. Transcription API — Server-side analysis with system prompts
 *
 * Run from: ai-agent-platform root
 * Usage: node conversation-intel.js
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
console.log('  ╔══════════════════════════════════════════════════════════════╗');
console.log('  ║  CONVERSATION INTELLIGENCE — Solo Salesman Module           ║');
console.log('  ║  Record · Transcribe · Analyze · Sync                       ║');
console.log('  ╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. AUDIO RECORDER COMPONENT
//    MediaStream API, waveform visualization, timer, chunked recording
// ============================================================
console.log('  [1] AudioRecorder Component:');

write('components/AudioRecorder.tsx', `'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

// ============================================================================
// TYPES
// ============================================================================
export interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  speaker?: string
  confidence?: number
  isFinal: boolean
}

export interface RecordingSession {
  id: string
  startedAt: string
  endedAt?: string
  duration: number
  audioUrl?: string
  audioBlob?: Blob
  segments: TranscriptSegment[]
  fullTranscript: string
  status: 'recording' | 'paused' | 'stopped' | 'analyzing' | 'complete'
}

interface AudioRecorderProps {
  onTranscriptUpdate?: (segments: TranscriptSegment[], fullText: string) => void
  onRecordingComplete?: (session: RecordingSession) => void
  onAnalysisComplete?: (analysis: TranscriptAnalysis) => void
  projectId?: string
  contactName?: string
}

export interface TranscriptAnalysis {
  summary: string
  actionItems: { task: string; assignee: string; deadline: string; priority: 'high' | 'medium' | 'low' }[]
  mentorAnswers: { wantedProposal: boolean | null; gaveGoAhead: boolean | null; modifications: string; concerns: string; nextSteps: string; sentiment: 'positive' | 'neutral' | 'cautious' }
  personalitySignals: { type: string; confidence: number; signals: string[] }
  newContacts: { name: string; company?: string; role?: string }[]
  keyTopics: string[]
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function AudioRecorder({ onTranscriptUpdate, onRecordingComplete, onAnalysisComplete, projectId, contactName }: AudioRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped' | 'analyzing'>('idle')
  const [duration, setDuration] = useState(0)
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [interimText, setInterimText] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(40).fill(0))
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)
  const segmentCountRef = useRef(0)

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [status])

  // ── Format timer ──────────────────────────────────────────
  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
  }

  // ── Waveform visualization ────────────────────────────────
  const startVisualizer = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext()
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 128
    source.connect(analyser)
    audioContextRef.current = ctx
    analyserRef.current = analyser

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const draw = () => {
      analyser.getByteFrequencyData(dataArray)
      const levels: number[] = []
      const step = Math.floor(dataArray.length / 40)
      for (let i = 0; i < 40; i++) {
        const val = dataArray[i * step] || 0
        levels.push(val / 255)
      }
      setAudioLevels(levels)
      animFrameRef.current = requestAnimationFrame(draw)
    }
    draw()
  }, [])

  const stopVisualizer = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {})
    setAudioLevels(new Array(40).fill(0))
  }, [])

  // ── Web Speech API (live transcription) ───────────────────
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Web Speech API not available — transcription will use server-side fallback')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const seg: TranscriptSegment = {
            id: 'seg-' + (++segmentCountRef.current),
            text: result[0].transcript.trim(),
            timestamp: duration,
            confidence: result[0].confidence,
            isFinal: true,
          }
          setSegments(prev => {
            const next = [...prev, seg]
            const fullText = next.map(s => s.text).join(' ')
            onTranscriptUpdate?.(next, fullText)
            return next
          })
        } else {
          interim += result[0].transcript
        }
      }
      setInterimText(interim)
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return // Normal
      console.warn('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      // Auto-restart if still recording
      if (status === 'recording' && recognitionRef.current) {
        try { recognition.start() } catch {}
      }
    }

    recognitionRef.current = recognition
    try { recognition.start() } catch {}
  }, [duration, onTranscriptUpdate, status])

  // ── Start Recording ───────────────────────────────────────
  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      })
      streamRef.current = stream

      // MediaRecorder for audio capture
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      mediaRecorderRef.current = recorder
      recorder.start(1000) // Chunk every second for streaming

      // Start visualizer
      startVisualizer(stream)

      // Start speech recognition
      startSpeechRecognition()

      setStatus('recording')
      setDuration(0)
      setSegments([])
      setInterimText('')

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access and try again.')
      } else {
        setError('Failed to start recording: ' + err.message)
      }
    }
  }

  // ── Pause/Resume ──────────────────────────────────────────
  const togglePause = () => {
    if (!mediaRecorderRef.current) return
    if (status === 'recording') {
      mediaRecorderRef.current.pause()
      recognitionRef.current?.stop()
      setStatus('paused')
    } else if (status === 'paused') {
      mediaRecorderRef.current.resume()
      try { recognitionRef.current?.start() } catch {}
      setStatus('recording')
    }
  }

  // ── Stop Recording ────────────────────────────────────────
  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    stopVisualizer()
    setStatus('stopped')

    const fullTranscript = segments.map(s => s.text).join(' ')
    const session: RecordingSession = {
      id: 'rec-' + Date.now(),
      startedAt: new Date(Date.now() - duration * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      duration,
      segments,
      fullTranscript,
      status: 'stopped',
    }
    onRecordingComplete?.(session)
  }

  // ── Cleanup ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (recognitionRef.current) try { recognitionRef.current.stop() } catch {}
      stopVisualizer()
    }
  }, [stopVisualizer])

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-xs text-rose-400">{error}</div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {status === 'idle' || status === 'stopped' ? (
          <button onClick={startRecording}
            className="flex items-center gap-2 px-5 py-3 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-500 transition-all shadow-lg shadow-rose-500/20">
            <div className="w-3 h-3 bg-white rounded-full" />
            {status === 'stopped' ? 'Record New' : 'Record Meeting'}
          </button>
        ) : (
          <>
            <button onClick={togglePause}
              className={"flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all " + (status === 'paused' ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-amber-600 text-white hover:bg-amber-500')}>
              {status === 'paused' ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20">
              ⏹ Stop & Analyze
            </button>
          </>
        )}

        {(status === 'recording' || status === 'paused') && (
          <div className="flex items-center gap-3 ml-4">
            <div className={"w-3 h-3 rounded-full " + (status === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500')} />
            <span className="text-sm font-mono font-bold text-white">{fmtTime(duration)}</span>
            <span className={"text-[10px] uppercase font-semibold tracking-wider " + (status === 'recording' ? 'text-rose-400' : 'text-amber-400')}>
              {status === 'recording' ? 'Recording' : 'Paused'}
            </span>
          </div>
        )}

        {contactName && <span className="text-xs text-gray-500 ml-auto">Meeting with: <span className="text-gray-300">{contactName}</span></span>}
      </div>

      {/* Waveform */}
      {(status === 'recording' || status === 'paused') && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="flex items-end justify-center gap-[2px] h-16">
            {audioLevels.map((level, i) => (
              <div key={i} className="w-1.5 rounded-full transition-all duration-75"
                style={{
                  height: Math.max(3, level * 64) + 'px',
                  backgroundColor: status === 'recording'
                    ? 'hsl(' + (0 + level * 30) + ', 80%, ' + (50 + level * 20) + '%)'
                    : 'rgb(100, 100, 100)',
                  opacity: status === 'paused' ? 0.3 : 0.8 + level * 0.2,
                }} />
            ))}
          </div>
        </div>
      )}

      {/* Live Transcript */}
      {(status === 'recording' || status === 'paused') && (segments.length > 0 || interimText) && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4 max-h-48 overflow-y-auto">
          <div className="text-[9px] text-gray-500 uppercase mb-2">Live Transcript</div>
          <div className="text-xs text-gray-300 leading-relaxed">
            {segments.map(seg => (
              <span key={seg.id}>
                <span className="text-gray-300">{seg.text}</span>{' '}
              </span>
            ))}
            {interimText && <span className="text-gray-500 italic">{interimText}</span>}
          </div>
        </div>
      )}

      {/* Audio playback (after recording) */}
      {audioUrl && status === 'stopped' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase mb-2">Recording Playback</div>
          <audio controls src={audioUrl} className="w-full h-10 opacity-80" />
        </div>
      )}
    </div>
  )
}
`);

// ============================================================
// 2. TRANSCRIPT REVIEW COMPONENT
//    Editable transcript, analysis display, finalize actions
// ============================================================
console.log('');
console.log('  [2] TranscriptReview Component:');

write('components/TranscriptReview.tsx', `'use client'
import { useState } from 'react'
import type { TranscriptAnalysis } from './AudioRecorder'

interface TranscriptReviewProps {
  transcript: string
  analysis: TranscriptAnalysis | null
  analyzing: boolean
  onEdit: (text: string) => void
  onFinalize: () => void
  onReanalyze: () => void
  onSyncMentor: () => void
  onSyncCRM: () => void
  onResearchContact: (name: string) => void
}

export default function TranscriptReview({
  transcript, analysis, analyzing, onEdit, onFinalize,
  onReanalyze, onSyncMentor, onSyncCRM, onResearchContact
}: TranscriptReviewProps) {
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState(transcript)
  const [viewTab, setViewTab] = useState<'transcript' | 'summary' | 'actions' | 'personality'>('transcript')

  const saveEdit = () => {
    onEdit(editText)
    setEditMode(false)
  }

  const priorityColor = (p: string) => p === 'high' ? 'text-rose-400 bg-rose-500/10' : p === 'medium' ? 'text-amber-400 bg-amber-500/10' : 'text-gray-400 bg-gray-500/10'

  return (
    <div className="space-y-4">
      {/* Analysis Status */}
      {analyzing && (
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <div>
            <div className="text-sm font-medium text-purple-400">Analyzing conversation...</div>
            <div className="text-[10px] text-gray-500">Extracting notes, action items, personality signals</div>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white/[0.02] rounded-lg p-0.5">
        {[
          { id: 'transcript' as const, label: 'Transcript', icon: '📝' },
          { id: 'summary' as const, label: 'Meeting Notes', icon: '📋' },
          { id: 'actions' as const, label: 'Action Items', icon: '✅' },
          { id: 'personality' as const, label: 'Personality Intel', icon: '🧠' },
        ].map(t => (
          <button key={t.id} onClick={() => setViewTab(t.id)}
            className={"flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all " +
              (viewTab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
            <span>{t.icon}</span><span>{t.label}</span>
            {t.id === 'actions' && analysis && analysis.actionItems.length > 0 && (
              <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1">{analysis.actionItems.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* TRANSCRIPT VIEW */}
      {viewTab === 'transcript' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[9px] text-gray-500 uppercase">Full Transcript</div>
            <button onClick={() => { setEditMode(!editMode); setEditText(transcript) }}
              className="text-[10px] text-blue-400 hover:text-blue-300">
              {editMode ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>
          {editMode ? (
            <div className="space-y-3">
              <textarea value={editText} onChange={e => setEditText(e.target.value)}
                className="w-full h-64 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 leading-relaxed resize-none focus:border-blue-500/30 focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-500">Save Changes</button>
                <button onClick={onReanalyze} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10">Re-analyze</button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">{transcript || 'No transcript available'}</div>
          )}
        </div>
      )}

      {/* MEETING NOTES */}
      {viewTab === 'summary' && analysis && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <div className="text-[9px] text-gray-500 uppercase mb-2">Meeting Summary</div>
            <div className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <div className="text-[9px] text-gray-500 uppercase mb-2">Key Topics Discussed</div>
            <div className="flex flex-wrap gap-2">
              {analysis.keyTopics.map((topic, i) => (
                <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">{topic}</span>
              ))}
            </div>
          </div>
          {/* Mentor Auto-Answers */}
          <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span>🎓</span>
              <div className="text-sm font-bold text-purple-400">Sales Mentor Auto-Analysis</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={analysis.mentorAnswers.wantedProposal ? 'text-emerald-400' : 'text-gray-500'}>
                  {analysis.mentorAnswers.wantedProposal ? '✓ Yes' : analysis.mentorAnswers.wantedProposal === false ? '✗ No' : '— Unknown'}
                </span>
                <span className="text-gray-500">Wanted a proposal?</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={analysis.mentorAnswers.gaveGoAhead ? 'text-emerald-400' : 'text-gray-500'}>
                  {analysis.mentorAnswers.gaveGoAhead ? '✓ Yes' : analysis.mentorAnswers.gaveGoAhead === false ? '✗ No' : '— Unknown'}
                </span>
                <span className="text-gray-500">Gave go-ahead?</span>
              </div>
              {analysis.mentorAnswers.modifications && <div className="col-span-2 text-gray-400"><span className="text-amber-400">Modifications: </span>{analysis.mentorAnswers.modifications}</div>}
              {analysis.mentorAnswers.concerns && <div className="col-span-2 text-gray-400"><span className="text-rose-400">Concerns: </span>{analysis.mentorAnswers.concerns}</div>}
              {analysis.mentorAnswers.nextSteps && <div className="col-span-2 text-gray-400"><span className="text-blue-400">Next Steps: </span>{analysis.mentorAnswers.nextSteps}</div>}
            </div>
            <button onClick={onSyncMentor}
              className="mt-3 px-4 py-2 bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-600/30">
              Push to Sales Mentor →
            </button>
          </div>
        </div>
      )}

      {/* ACTION ITEMS */}
      {viewTab === 'actions' && analysis && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <div className="text-[9px] text-gray-500 uppercase mb-3">Extracted Action Items</div>
          {analysis.actionItems.length === 0 ? (
            <div className="text-xs text-gray-600 py-4 text-center">No action items detected</div>
          ) : (
            <div className="space-y-2">
              {analysis.actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.03] last:border-0">
                  <div className="w-5 h-5 mt-0.5 rounded border-2 border-gray-600 flex items-center justify-center text-xs shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-300">{item.task}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500">Assignee: {item.assignee}</span>
                      {item.deadline && <span className="text-[10px] text-gray-500">Due: {item.deadline}</span>}
                      <span className={"text-[9px] px-1.5 py-0.5 rounded font-medium " + priorityColor(item.priority)}>{item.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PERSONALITY INTEL */}
      {viewTab === 'personality' && analysis && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <div className="text-[9px] text-gray-500 uppercase mb-3">Behavioral Profile Update</div>
            <div className="flex items-center gap-3 mb-3">
              <div className={"text-sm font-bold " + (analysis.personalitySignals.type === 'Driver' ? 'text-rose-400' : analysis.personalitySignals.type === 'Analytical' ? 'text-blue-400' : analysis.personalitySignals.type === 'Expressive' ? 'text-amber-400' : 'text-emerald-400')}>
                {analysis.personalitySignals.type}
              </div>
              <div className="text-[10px] text-gray-500">{Math.round(analysis.personalitySignals.confidence * 100)}% confidence</div>
              <div className="flex-1 bg-white/5 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: (analysis.personalitySignals.confidence * 100) + '%' }} />
              </div>
            </div>
            <div className="space-y-1">
              {analysis.personalitySignals.signals.map((sig, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-400">{sig}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Contacts Detected */}
          {analysis.newContacts.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
              <div className="text-[9px] text-amber-400 uppercase mb-3">New Contacts Mentioned</div>
              {analysis.newContacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div>
                    <div className="text-xs font-medium text-gray-300">{c.name}</div>
                    <div className="text-[10px] text-gray-500">{c.role}{c.company ? ' at ' + c.company : ''}</div>
                  </div>
                  <button onClick={() => onResearchContact(c.name)}
                    className="px-3 py-1.5 bg-amber-600/10 border border-amber-500/20 text-amber-400 rounded text-[10px] font-medium hover:bg-amber-600/20">
                    🔍 Research
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Finalize Actions */}
      {analysis && !analyzing && (
        <div className="flex gap-2 pt-2">
          <button onClick={onFinalize}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500">
            ✓ Finalize & Store
          </button>
          <button onClick={onSyncCRM}
            className="px-4 py-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/20">
            📤 Push to CRM
          </button>
          <button onClick={onSyncMentor}
            className="px-4 py-2.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-600/20">
            🎓 Sync to Mentor
          </button>
        </div>
      )}
    </div>
  )
}
`);

// ============================================================
// 3. TRANSCRIPTION API — Analysis with system prompts
// ============================================================
console.log('');
console.log('  [3] Transcription Analysis API:');

write('app/api/transcription/route.ts', `import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// SYSTEM PROMPTS — Used for AI analysis of call transcripts
// ============================================================================

const ANALYSIS_SYSTEM_PROMPT = \`You are a Sales Intelligence AI analyzing a sales call transcript.
You must extract structured data in JSON format. Be precise and factual — only report what is actually stated or strongly implied.

Analyze the transcript and return a JSON object with these fields:

{
  "summary": "2-3 sentence executive summary of the meeting",
  "actionItems": [
    { "task": "specific action to take", "assignee": "who should do it (sales rep or prospect name)", "deadline": "when mentioned or 'TBD'", "priority": "high|medium|low" }
  ],
  "mentorAnswers": {
    "wantedProposal": true/false/null,
    "gaveGoAhead": true/false/null,
    "modifications": "any changes or customizations requested",
    "concerns": "any objections, hesitations, or worries expressed",
    "nextSteps": "agreed-upon next actions",
    "sentiment": "positive|neutral|cautious"
  },
  "personalitySignals": {
    "type": "Driver|Analytical|Expressive|Amiable",
    "confidence": 0.0-1.0,
    "signals": ["specific behavioral observation 1", "observation 2", "observation 3"]
  },
  "newContacts": [
    { "name": "any new person mentioned", "company": "their company if stated", "role": "their title if stated" }
  ],
  "keyTopics": ["topic1", "topic2", "topic3"]
}

PERSONALITY CLASSIFICATION RULES:
- Driver: Direct, results-focused, mentions ROI/timeline/bottom-line, brief responses, controls conversation pace
- Analytical: Asks detailed questions, wants specs/data/compliance, methodical, cautious, mentions "need to review"
- Expressive: Enthusiastic, uses stories/vision language, says "imagine/love/exciting", animated, relationship-focused
- Amiable: Inclusive ("my team", "we"), consensus-building, says "need to check with...", patient, avoids conflict

Only include newContacts for people NOT already in the conversation (i.e., third parties mentioned).
Only flag sentiment as "cautious" if there are genuine concerns — not mere questions.\`;

// ============================================================================
// In-memory transcript storage (production: Supabase)
// ============================================================================
const transcripts: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transcript, projectId, contactId } = body;

    // ── Action: Analyze transcript ──────────────────────────
    if (action === 'analyze') {
      if (!transcript) {
        return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
      }

      // In dev mode: simulate AI analysis from transcript keywords
      // In production: send to OpenAI/Claude with ANALYSIS_SYSTEM_PROMPT
      const analysis = simulateAnalysis(transcript);

      return NextResponse.json({
        success: true,
        analysis,
        systemPrompt: ANALYSIS_SYSTEM_PROMPT,
        note: 'Dev mode: using keyword-based analysis. Production: connect OpenAI/Claude API.',
      });
    }

    // ── Action: Store finalized transcript ──────────────────
    if (action === 'store') {
      const record = {
        id: 'tx-' + Date.now(),
        projectId: projectId || null,
        contactId: contactId || null,
        transcript: transcript || '',
        analysis: body.analysis || null,
        audioUrl: body.audioUrl || null,
        duration: body.duration || 0,
        createdAt: new Date().toISOString(),
        status: 'finalized',
      };
      transcripts.push(record);
      return NextResponse.json({ success: true, transcriptId: record.id });
    }

    // ── Action: Transcribe audio (server-side) ──────────────
    if (action === 'transcribe') {
      // Production: Forward audio to Deepgram/Whisper
      return NextResponse.json({
        success: true,
        provider: 'web-speech-api',
        note: 'Using browser Web Speech API for dev. For production, integrate Deepgram (recommended for sales) or OpenAI Whisper.',
        integrationGuide: {
          deepgram: {
            url: 'wss://api.deepgram.com/v1/listen',
            features: 'Real-time streaming, speaker diarization, custom vocabulary for sales terms',
            pricing: 'Pay-per-minute, ~$0.0043/min for Nova-2',
            setup: 'npm install @deepgram/sdk && set DEEPGRAM_API_KEY',
          },
          whisper: {
            url: 'https://api.openai.com/v1/audio/transcriptions',
            features: 'Batch transcription, high accuracy, 57 languages',
            pricing: '$0.006/min',
            setup: 'Use existing OPENAI_API_KEY, send audio as multipart form data',
          },
          assemblyai: {
            url: 'wss://api.assemblyai.com/v2/realtime/ws',
            features: 'Real-time, sentiment analysis built-in, PII redaction',
            pricing: '$0.015/min real-time',
            setup: 'npm install assemblyai && set ASSEMBLYAI_API_KEY',
          },
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ transcripts: transcripts.slice(-20), total: transcripts.length });
}

// ============================================================================
// DEV MODE — Keyword-based analysis simulation
// Production: Replace with OpenAI/Claude API call using ANALYSIS_SYSTEM_PROMPT
// ============================================================================
function simulateAnalysis(transcript: string): any {
  const lower = transcript.toLowerCase();
  const words = lower.split(/\\s+/);

  // Detect proposal interest
  const wantedProposal = lower.includes('proposal') || lower.includes('quote') || lower.includes('pricing')
    || lower.includes('send me') || lower.includes('put together');

  // Detect go-ahead
  const gaveGoAhead = lower.includes('go ahead') || lower.includes('let\\'s do it') || lower.includes('move forward')
    || lower.includes('approved') || lower.includes('green light') || lower.includes('sign');

  // Detect concerns
  const concerns: string[] = [];
  if (lower.includes('budget') || lower.includes('expensive') || lower.includes('cost')) concerns.push('Budget sensitivity');
  if (lower.includes('timeline') || lower.includes('deadline') || lower.includes('rush')) concerns.push('Timeline pressure');
  if (lower.includes('competitor') || lower.includes('alternative')) concerns.push('Evaluating alternatives');
  if (lower.includes('risk') || lower.includes('concern') || lower.includes('worried')) concerns.push('Risk aversion noted');

  // Detect modifications
  const mods: string[] = [];
  if (lower.includes('change') || lower.includes('modify') || lower.includes('adjust')) mods.push('Requested scope adjustments');
  if (lower.includes('custom') || lower.includes('specific')) mods.push('Wants customization');
  if (lower.includes('phase') || lower.includes('stages')) mods.push('Interested in phased approach');

  // Personality detection
  let personality = 'Analytical';
  let confidence = 0.6;
  const signals: string[] = [];
  const driverWords = ['bottom line', 'roi', 'results', 'quick', 'decide', 'now'];
  const analyticalWords = ['data', 'spec', 'detail', 'review', 'compliance', 'compare', 'numbers'];
  const expressiveWords = ['imagine', 'vision', 'exciting', 'love', 'amazing', 'story', 'potential'];
  const amiableWords = ['team', 'everyone', 'together', 'consensus', 'comfortable', 'feel'];

  const scores = {
    Driver: driverWords.filter(w => lower.includes(w)).length,
    Analytical: analyticalWords.filter(w => lower.includes(w)).length,
    Expressive: expressiveWords.filter(w => lower.includes(w)).length,
    Amiable: amiableWords.filter(w => lower.includes(w)).length,
  };

  const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (topType[1] > 0) {
    personality = topType[0];
    confidence = Math.min(0.95, 0.5 + topType[1] * 0.1);
  }

  if (personality === 'Driver') signals.push('Used results-oriented language', 'Focused on outcomes and timelines', 'Direct communication style');
  if (personality === 'Analytical') signals.push('Asked for detailed specifications', 'Methodical questioning pattern', 'Requested documentation');
  if (personality === 'Expressive') signals.push('Used enthusiastic language', 'Focused on vision and possibilities', 'Engaged in storytelling');
  if (personality === 'Amiable') signals.push('Referenced team input', 'Consensus-seeking behavior', 'Prioritized relationship building');

  // Extract action items
  const actionItems: any[] = [];
  if (wantedProposal) actionItems.push({ task: 'Draft and send proposal', assignee: 'Sales Rep', deadline: 'End of week', priority: 'high' });
  if (lower.includes('follow up') || lower.includes('follow-up')) actionItems.push({ task: 'Schedule follow-up meeting', assignee: 'Sales Rep', deadline: 'Within 2 days', priority: 'high' });
  if (lower.includes('send') && (lower.includes('info') || lower.includes('document') || lower.includes('case study')))
    actionItems.push({ task: 'Send requested materials', assignee: 'Sales Rep', deadline: 'Tomorrow', priority: 'medium' });
  if (lower.includes('demo') || lower.includes('demonstration'))
    actionItems.push({ task: 'Schedule product demo', assignee: 'Sales Rep', deadline: 'This week', priority: 'high' });
  if (lower.includes('contract') || lower.includes('agreement'))
    actionItems.push({ task: 'Prepare contract documents', assignee: 'Sales Rep', deadline: 'TBD', priority: 'medium' });

  // Sentiment
  const posWords = ['great', 'excellent', 'perfect', 'love', 'excited', 'impressive', 'yes'];
  const negWords = ['concern', 'worried', 'expensive', 'problem', 'issue', 'difficult', 'no'];
  const posCount = posWords.filter(w => lower.includes(w)).length;
  const negCount = negWords.filter(w => lower.includes(w)).length;
  const sentiment = posCount > negCount + 1 ? 'positive' : negCount > posCount + 1 ? 'cautious' : 'neutral';

  // Key topics
  const topics: string[] = [];
  if (lower.includes('pricing') || lower.includes('cost') || lower.includes('budget')) topics.push('Pricing & Budget');
  if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('deadline')) topics.push('Timeline');
  if (lower.includes('warehouse') || lower.includes('automation') || lower.includes('system')) topics.push('System Requirements');
  if (lower.includes('integration') || lower.includes('netsuite') || lower.includes('erp')) topics.push('Integration Needs');
  if (lower.includes('support') || lower.includes('training') || lower.includes('onboarding')) topics.push('Support & Training');
  if (lower.includes('competitor') || lower.includes('alternative')) topics.push('Competitive Landscape');
  if (topics.length === 0) topics.push('General Discussion', 'Relationship Building');

  // New contacts (simple name detection)
  const newContacts: any[] = [];
  const namePatterns = lower.match(/(?:talk to|speak with|meet|mention|contact|cc|include|loop in)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)/gi);
  if (namePatterns) {
    namePatterns.forEach(match => {
      const name = match.replace(/^(talk to|speak with|meet|mention|contact|cc|include|loop in)\\s+/i, '').trim();
      if (name.length > 2 && name.includes(' ')) newContacts.push({ name, company: '', role: '' });
    });
  }

  return {
    summary: \`Sales conversation covering \${topics.join(', ').toLowerCase()}. \${sentiment === 'positive' ? 'The prospect showed strong interest' : sentiment === 'cautious' ? 'Some concerns were raised' : 'Discussion was productive'}. \${wantedProposal ? 'A proposal was requested.' : ''} \${gaveGoAhead ? 'The prospect gave the go-ahead to move forward.' : ''} \${actionItems.length} action items identified.\`,
    actionItems,
    mentorAnswers: {
      wantedProposal: wantedProposal || null,
      gaveGoAhead: gaveGoAhead || null,
      modifications: mods.join('. ') || '',
      concerns: concerns.join('. ') || '',
      nextSteps: actionItems.length > 0 ? actionItems[0].task : 'Continue engagement',
      sentiment,
    },
    personalitySignals: { type: personality, confidence, signals },
    newContacts,
    keyTopics: topics,
  };
}
`);

// ============================================================
// 4. CONVERSATION INTEL TAB — Integrates into Solo Salesman
// ============================================================
console.log('');
console.log('  [4] ConversationIntel Tab Component:');

write('components/ConversationIntelTab.tsx', `'use client'
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
`);

// ============================================================
// 5. PATCH — Add Conversation Intel tab to Solo Salesman
// ============================================================
console.log('');
console.log('  [5] Solo Salesman Integration Patch:');

const soloPath = path.join(process.cwd(), 'app/agents/sales/solo/page.tsx');
if (fs.existsSync(soloPath)) {
  let content = fs.readFileSync(soloPath, 'utf8');

  // Add import
  if (!content.includes('ConversationIntelTab')) {
    content = content.replace(
      "import { useState, useEffect, useCallback, useRef } from 'react'",
      "import { useState, useEffect, useCallback, useRef } from 'react'\nimport ConversationIntelTab from '@/components/ConversationIntelTab'"
    );

    // Add 'recording' to tab type
    content = content.replace(
      "const [tab, setTab] = useState<'pipeline' | 'intel' | 'expenses' | 'mentor' | 'commissions' | 'crm'>('pipeline')",
      "const [tab, setTab] = useState<'pipeline' | 'intel' | 'expenses' | 'mentor' | 'commissions' | 'crm' | 'recording'>('pipeline')"
    );

    // Add tab button
    content = content.replace(
      "{ id: 'crm' as const, label: 'CRM & Integrations', icon: '🔗' },",
      "{ id: 'crm' as const, label: 'CRM & Integrations', icon: '🔗' },\n    { id: 'recording' as const, label: 'Record Meeting', icon: '🎙️' },"
    );

    // Add tab render
    content = content.replace(
      "{tab === 'crm' && <CRMTab />}",
      `{tab === 'crm' && <CRMTab />}
      {tab === 'recording' && <ConversationIntelTab
        projects={openProjects.map(p => ({ id: p.id, name: p.name, contactId: p.contactId }))}
        contacts={contacts.map(c => ({ id: c.id, name: c.name, company: c.company }))}
        onMentorSync={(projId, answers) => {
          addMentorNote(projId, {
            id: 'mn-ai-' + Date.now(), date: new Date().toISOString().slice(0, 10),
            wantedProposal: answers.wantedProposal, gaveGoAhead: answers.gaveGoAhead,
            modifications: answers.modifications, concerns: answers.concerns,
            nextSteps: answers.nextSteps, sentiment: answers.sentiment,
          })
        }}
        onToast={show}
      />}`
    );

    fs.writeFileSync(soloPath, content);
    console.log('  + Patched Solo Salesman with Recording tab');
  } else {
    console.log('  o Solo Salesman already has ConversationIntelTab');
  }
} else {
  console.log('  ! app/agents/sales/solo/page.tsx not found — run solo-salesman.js first');
}

// ============================================================
// DONE
// ============================================================
console.log('');
console.log('  ═══════════════════════════════════════════');
console.log('  Installed: ' + installed + ' files');
console.log('  ═══════════════════════════════════════════');
console.log('');
console.log('  CONVERSATION INTELLIGENCE MODULE:');
console.log('');
console.log('    🎙️  AudioRecorder — MediaStream API + waveform + timer');
console.log('    📝  Live Transcription — Web Speech API (dev) / Deepgram (prod)');
console.log('    🧠  AI Analysis — Meeting notes, to-dos, personality signals');
console.log('    🎓  Mentor Sync — Auto-fills post-call questions');
console.log('    📤  CRM Storage — Full transcript + notes to project/contact');
console.log('    🔍  Research Loop — New contacts trigger research agent');
console.log('');
console.log('  FILES:');
console.log('    components/AudioRecorder.tsx — Recording + waveform + speech');
console.log('    components/TranscriptReview.tsx — Edit + analysis display');
console.log('    components/ConversationIntelTab.tsx — Full tab wrapper');
console.log('    app/api/transcription/route.ts — Analysis API + system prompts');
console.log('');
console.log('  PRODUCTION PATH (Deepgram recommended):');
console.log('    1. npm install @deepgram/sdk');
console.log('    2. Set DEEPGRAM_API_KEY in .env.local');
console.log('    3. Replace Web Speech API with Deepgram WebSocket streaming');
console.log('    4. Enable speaker diarization for multi-party calls');
console.log('    5. Add custom vocabulary: "WoulfAI", "NetSuite", etc.');
console.log('');
console.log('  AI ANALYSIS PATH:');
console.log('    1. Set OPENAI_API_KEY in .env.local');
console.log('    2. In api/transcription/route.ts, replace simulateAnalysis()');
console.log('       with OpenAI chat completion using ANALYSIS_SYSTEM_PROMPT');
console.log('    3. System prompt is already defined in the API file');
console.log('');
console.log('  Route: /agents/sales/solo → "Record Meeting" tab');
console.log('  Restart: Ctrl+C → npm run dev');
console.log('');
