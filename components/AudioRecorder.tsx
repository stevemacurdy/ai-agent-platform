'use client'
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
