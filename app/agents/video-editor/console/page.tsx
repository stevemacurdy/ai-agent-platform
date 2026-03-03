'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ================================================================
   Types
   ================================================================ */
interface ClipResult {
  id: string;
  clip_index: number;
  start_seconds: number;
  end_seconds: number;
  duration_seconds: number;
  matched_quote: string | null;
  transcript_segment: string | null;
  confidence: number | null;
  download_url: string | null;
  thumbnail_url: string | null;
  format: string;
  captions_burned: boolean;
}

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface JobData {
  id: string;
  mode: string;
  status: string;
  source_url: string;
  source_filename: string | null;
  transcript: { text: string; segments: TranscriptSegment[] } | null;
  output_url: string | null;
  error: string | null;
  processing_seconds: number | null;
  created_at: string;
  completed_at: string | null;
  video_clips: ClipResult[];
  cleanup_options?: Record<string, boolean>;
  source_size_bytes?: number;
}

interface HistoryItem {
  id: string;
  mode: string;
  status: string;
  source_filename: string | null;
  created_at: string;
  clips?: number;
}

type Mode = 'quote' | 'power' | 'cleanup';
type Step = 'select' | 'upload' | 'configure' | 'processing' | 'results';

/* ================================================================
   Colors & Constants
   ================================================================ */
const NAVY = '#1B2A4A';
const ORANGE = '#F5920B';
const TEAL = '#2A9D8F';
const LIGHT_BG = '#F4F5F7';
const BORDER = '#E5E7EB';
const RED = '#DC2626';
const GREEN = '#059669';

const MODE_INFO: Record<Mode, { icon: string; label: string; desc: string; color: string }> = {
  quote: { icon: '💬', label: 'Quote Clips', desc: 'Find and extract exact quotes from video', color: TEAL },
  power: { icon: '⚡', label: 'Power Clips', desc: 'Auto-detect the best marketing moments', color: ORANGE },
  cleanup: { icon: '✨', label: 'Video Cleanup', desc: 'Normalize audio, color, and stability', color: '#7C3AED' },
};

const STATUS_STEPS = ['uploading', 'transcribing', 'processing', 'complete'];

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? m + 'm ' + s + 's' : s + 's';
}

function fmtBytes(bytes: number) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/* ================================================================
   Main Component
   ================================================================ */
export default function VideoEditorConsole() {
  // --- Core state ---
  const [step, setStep] = useState<Step>('select');
  const [mode, setMode] = useState<Mode | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<JobData | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Upload state ---
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [uploadedSize, setUploadedSize] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Transcript state ---
  const [transcript, setTranscript] = useState<{ text: string; segments: TranscriptSegment[] } | null>(null);
  const [transcribing, setTranscribing] = useState(false);

  // --- Mode controls ---
  const [quoteText, setQuoteText] = useState('');
  const [stitch, setStitch] = useState(false);
  const [clipMin, setClipMin] = useState(5);
  const [clipMax, setClipMax] = useState(30);
  const [clipFormats, setClipFormats] = useState<string[]>(['16:9', '9:16']);
  const [burnCaptions, setBurnCaptions] = useState(true);
  const [maxClips, setMaxClips] = useState(5);
  const [cleanupOpts, setCleanupOpts] = useState({ normalize_audio: true, reduce_noise: true, color_correct: true, stabilize: false });

  // --- History ---
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // --- URL job param ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jid = params.get('job');
    if (jid) {
      setActiveJobId(jid);
      setStep('processing');
    }
    // Load history
    fetch('/api/agents/video-editor?companyId=woulf')
      .then(r => r.json())
      .then(d => {
        if (d.data?.tableData) setHistory(d.data.tableData);
      })
      .catch(() => {});
  }, []);

  // --- Poll active job ---
  const pollJob = useCallback(async (jid: string) => {
    try {
      const resp = await fetch('/api/agents/video-editor?job=' + jid);
      const d = await resp.json();
      if (d.job) {
        setActiveJob(d.job);
        if (d.job.status === 'complete' || d.job.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          if (elapsedRef.current) clearInterval(elapsedRef.current);
          pollRef.current = null;
          elapsedRef.current = null;
          setStep('results');
        }
      }
    } catch { /* retry next interval */ }
  }, []);

  useEffect(() => {
    if (!activeJobId) return;
    pollJob(activeJobId);
    pollRef.current = setInterval(() => pollJob(activeJobId), 3000);
    elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, [activeJobId, pollJob]);

  // --- Upload handler ---
  async function handleUpload(file: File) {
    setUploadFile(file);
    setUploadError(null);
    setUploadProgress(0);

    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum 500MB.');
      return;
    }
    if (!/\.(mp4|mov|webm|avi)$/i.test(file.name)) {
      setUploadError('Unsupported format. Use MP4, MOV, WEBM, or AVI.');
      return;
    }

    // Simulated progress + real upload
    const progressInterval = setInterval(() => {
      setUploadProgress(p => Math.min(p + Math.random() * 15, 90));
    }, 300);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('companyId', 'default');
      const resp = await fetch('/api/agents/video-editor/upload', { method: 'POST', body: fd });
      clearInterval(progressInterval);

      if (!resp.ok) {
        const err = await resp.json();
        setUploadError(err.error || 'Upload failed');
        setUploadProgress(0);
        return;
      }

      const data = await resp.json();
      setUploadProgress(100);
      setUploadedUrl(data.url);
      setUploadedFilename(data.filename);
      setUploadedSize(data.size);
      setStep('configure');

      // Auto-transcribe for quote mode
      if (mode === 'quote') {
        setTranscribing(true);
        try {
          const tResp = await fetch('/api/agents/video-editor/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceUrl: data.url }),
          });
          if (tResp.ok) {
            const tData = await tResp.json();
            setTranscript(tData.transcript || tData);
          }
        } catch { /* transcript optional */ }
        setTranscribing(false);
      }
    } catch {
      clearInterval(progressInterval);
      setUploadError('Upload failed. Please try again.');
      setUploadProgress(0);
    }
  }

  // --- Submit job ---
  async function handleSubmit() {
    if (!uploadedUrl || !mode) return;

    const payload: Record<string, unknown> = {
      mode,
      sourceUrl: uploadedUrl,
      sourceFilename: uploadedFilename,
      sourceSizeBytes: uploadedSize,
    };

    if (mode === 'quote') {
      const quotes = quoteText.split('\n').map(q => q.trim()).filter(Boolean);
      if (quotes.length === 0) { setUploadError('Enter at least one quote.'); return; }
      payload.quotes = quotes;
      payload.stitch = stitch;
    } else if (mode === 'power') {
      payload.clipMin = clipMin;
      payload.clipMax = clipMax;
      payload.clipFormats = clipFormats;
    } else {
      payload.cleanupOptions = cleanupOpts;
    }

    try {
      const resp = await fetch('/api/agents/video-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await resp.json();
      if (d.jobId) {
        setActiveJobId(d.jobId);
        setElapsed(0);
        setStep('processing');
      } else {
        setUploadError(d.error || 'Failed to start job');
      }
    } catch {
      setUploadError('Failed to start processing');
    }
  }

  // --- Reset ---
  function handleReset() {
    setStep('select');
    setMode(null);
    setActiveJobId(null);
    setActiveJob(null);
    setUploadFile(null);
    setUploadProgress(0);
    setUploadedUrl(null);
    setUploadedFilename('');
    setUploadedSize(0);
    setUploadError(null);
    setTranscript(null);
    setQuoteText('');
    setElapsed(0);
    if (pollRef.current) clearInterval(pollRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
  }

  // --- Toggle format ---
  function toggleFormat(f: string) {
    setClipFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="min-h-screen" style={{ background: LIGHT_BG }}>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🎬</span>
              <h1 className="text-2xl font-extrabold" style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}>Video Editor</h1>
            </div>
            <p className="text-sm" style={{ color: '#6B7280' }}>Upload videos. Get quote clips, marketing power clips, or professional cleanup.</p>
          </div>
          <div className="flex gap-2">
            {step !== 'select' && (
              <button onClick={handleReset} className="text-xs font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: BORDER, color: '#6B7280' }}>
                New Job
              </button>
            )}
            <button onClick={() => setShowHistory(!showHistory)} className="text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: NAVY, color: '#fff' }}>
              {showHistory ? 'Hide History' : 'Job History'}
            </button>
          </div>
        </div>

        {/* ─── Job History Panel ─── */}
        {showHistory && (
          <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: NAVY }}>Recent Jobs</h3>
            {history.length === 0 ? (
              <p className="text-xs" style={{ color: '#9CA3AF' }}>No jobs yet. Upload a video to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b" style={{ borderColor: BORDER }}>
                      <th className="text-left py-2 font-semibold" style={{ color: '#6B7280' }}>File</th>
                      <th className="text-left py-2 font-semibold" style={{ color: '#6B7280' }}>Mode</th>
                      <th className="text-left py-2 font-semibold" style={{ color: '#6B7280' }}>Status</th>
                      <th className="text-left py-2 font-semibold" style={{ color: '#6B7280' }}>Date</th>
                      <th className="text-right py-2 font-semibold" style={{ color: '#6B7280' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((j) => (
                      <tr key={j.id} className="border-b" style={{ borderColor: '#F3F4F6' }}>
                        <td className="py-2 font-medium" style={{ color: NAVY }}>{j.source_filename || 'Untitled'}</td>
                        <td className="py-2"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: '#F3F4F6', color: '#6B7280' }}>{j.mode}</span></td>
                        <td className="py-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{
                            background: j.status === 'complete' ? '#ECFDF5' : j.status === 'failed' ? '#FEF2F2' : '#FFF7ED',
                            color: j.status === 'complete' ? GREEN : j.status === 'failed' ? RED : ORANGE,
                          }}>{j.status}</span>
                        </td>
                        <td className="py-2" style={{ color: '#9CA3AF' }}>{j.created_at ? fmtDate(j.created_at) : ''}</td>
                        <td className="py-2 text-right">
                          {j.status === 'complete' && (
                            <button onClick={() => { setActiveJobId(j.id); setStep('processing'); }} className="text-[10px] font-bold px-3 py-1 rounded-lg" style={{ background: TEAL, color: '#fff' }}>
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Step: Mode Selection ─── */}
        {step === 'select' && (
          <div className="grid md:grid-cols-3 gap-4">
            {(Object.entries(MODE_INFO) as [Mode, typeof MODE_INFO.quote][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => { setMode(key); setStep('upload'); }}
                className="rounded-xl border-2 bg-white p-6 text-left transition-all hover:shadow-lg"
                style={{ borderColor: mode === key ? info.color : BORDER }}
              >
                <span className="text-3xl block mb-3">{info.icon}</span>
                <h3 className="text-base font-bold mb-1" style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}>{info.label}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{info.desc}</p>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-wider" style={{ color: info.color }}>Select</div>
              </button>
            ))}
          </div>
        )}

        {/* ─── Step: Upload ─── */}
        {step === 'upload' && mode && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
              <button onClick={() => setStep('select')} className="hover:underline">Modes</button>
              <span>{'>'}</span>
              <span style={{ color: MODE_INFO[mode].color, fontWeight: 600 }}>{MODE_INFO[mode].label}</span>
            </div>

            <div
              className="rounded-xl border-2 border-dashed bg-white p-12 text-center cursor-pointer transition-colors hover:border-orange-300"
              style={{ borderColor: uploadError ? RED : BORDER }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.mov,.webm,.avi,video/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
              />
              {uploadProgress > 0 && uploadProgress < 100 ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium" style={{ color: NAVY }}>Uploading {uploadFile?.name}...</p>
                  <div className="w-full max-w-md mx-auto h-2 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: uploadProgress + '%', background: 'linear-gradient(90deg, ' + ORANGE + ', #F59E0B)' }} />
                  </div>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{Math.round(uploadProgress)}%</p>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">📹</div>
                  <p className="text-sm font-medium mb-1" style={{ color: NAVY }}>Drag & drop your video or click to browse</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>MP4, MOV, WEBM, AVI up to 500MB</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    {['MP4', 'MOV', 'WEBM'].map(f => (
                      <span key={f} className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ background: '#F3F4F6', color: '#6B7280' }}>{f}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {uploadError && (
              <div className="rounded-lg p-3 text-xs font-medium" style={{ background: '#FEF2F2', color: RED }}>
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* ─── Step: Configure ─── */}
        {step === 'configure' && mode && (
          <div className="space-y-4">
            {/* Upload summary */}
            <div className="rounded-xl border bg-white p-4 flex items-center gap-4" style={{ borderColor: BORDER }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ background: '#F3F4F6' }}>🎬</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{uploadedFilename}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{fmtBytes(uploadedSize)}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#ECFDF5', color: GREEN }}>Uploaded</span>
            </div>

            {/* Quote mode controls */}
            {mode === 'quote' && (
              <div className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: BORDER }}>
                <h3 className="text-sm font-bold" style={{ color: NAVY }}>Find Quotes in Your Video</h3>

                {transcribing && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: ORANGE }}>
                    <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: ORANGE, borderTopColor: 'transparent' }} />
                    Transcribing audio with AI...
                  </div>
                )}

                {transcript && (
                  <div className="max-h-48 overflow-y-auto rounded-lg p-3 text-xs leading-relaxed space-y-1" style={{ background: '#F9FAFB', color: '#374151' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Transcript (click to add)</p>
                    {transcript.segments.map((seg, i) => (
                      <button
                        key={i}
                        className="block text-left w-full px-2 py-1 rounded hover:bg-orange-50 transition-colors"
                        onClick={() => setQuoteText(prev => prev ? prev + '\n' + seg.text.trim() : seg.text.trim())}
                      >
                        <span className="text-[10px] font-mono mr-2" style={{ color: '#9CA3AF' }}>{fmtDuration(seg.start)}</span>
                        {seg.text}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="Paste your quotes here, one per line..."
                  className="w-full rounded-lg border p-3 text-sm resize-y min-h-[100px] focus:outline-none focus:ring-2"
                  style={{ borderColor: BORDER, color: NAVY }}
                />
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#6B7280' }}>
                  <input type="checkbox" checked={stitch} onChange={(e) => setStitch(e.target.checked)} className="rounded" />
                  Stitch all clips into one compilation video
                </label>
                <button onClick={handleSubmit} className="text-sm font-bold px-6 py-2.5 rounded-xl text-white" style={{ background: TEAL }}>
                  Find & Extract Clips
                </button>
              </div>
            )}

            {/* Power mode controls */}
            {mode === 'power' && (
              <div className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: BORDER }}>
                <h3 className="text-sm font-bold" style={{ color: NAVY }}>Auto-Generate Marketing Clips</h3>

                <div>
                  <label className="text-xs font-medium block mb-2" style={{ color: '#6B7280' }}>Clip Length: {clipMin}s - {clipMax}s</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={3} max={30} value={clipMin} onChange={(e) => setClipMin(Math.min(Number(e.target.value), clipMax - 2))} className="flex-1" />
                    <input type="range" min={5} max={60} value={clipMax} onChange={(e) => setClipMax(Math.max(Number(e.target.value), clipMin + 2))} className="flex-1" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium block mb-2" style={{ color: '#6B7280' }}>Output Formats</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { val: '16:9', label: '16:9 Landscape', sub: 'YouTube, LinkedIn' },
                      { val: '9:16', label: '9:16 Vertical', sub: 'Reels, TikTok, Shorts' },
                      { val: '1:1', label: '1:1 Square', sub: 'Instagram Feed' },
                    ].map(f => (
                      <button
                        key={f.val}
                        onClick={() => toggleFormat(f.val)}
                        className="rounded-lg border px-3 py-2 text-left transition-all"
                        style={{
                          borderColor: clipFormats.includes(f.val) ? ORANGE : BORDER,
                          background: clipFormats.includes(f.val) ? '#FFF7ED' : '#fff',
                        }}
                      >
                        <span className="text-xs font-semibold block" style={{ color: NAVY }}>{f.label}</span>
                        <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{f.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#6B7280' }}>
                  <input type="checkbox" checked={burnCaptions} onChange={(e) => setBurnCaptions(e.target.checked)} className="rounded" />
                  Burn in captions
                </label>

                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Max clips to generate</label>
                  <input type="number" min={1} max={8} value={maxClips} onChange={(e) => setMaxClips(Number(e.target.value))} className="rounded-lg border px-3 py-1.5 text-sm w-20" style={{ borderColor: BORDER }} />
                </div>

                <button onClick={handleSubmit} className="text-sm font-bold px-6 py-2.5 rounded-xl text-white" style={{ background: ORANGE }}>
                  Generate Power Clips
                </button>
              </div>
            )}

            {/* Cleanup mode controls */}
            {mode === 'cleanup' && (
              <div className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: BORDER }}>
                <h3 className="text-sm font-bold" style={{ color: NAVY }}>Professional Video Cleanup</h3>
                <div className="space-y-2">
                  {[
                    { key: 'normalize_audio', label: 'Normalize audio (broadcast standard -16 LUFS)', default_on: true },
                    { key: 'reduce_noise', label: 'Reduce background noise', default_on: true },
                    { key: 'color_correct', label: 'Color correction (auto-levels)', default_on: true },
                    { key: 'stabilize', label: 'Stabilize shaky footage (slower processing)', default_on: false },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#374151' }}>
                      <input
                        type="checkbox"
                        checked={cleanupOpts[opt.key as keyof typeof cleanupOpts]}
                        onChange={(e) => setCleanupOpts(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                        className="rounded"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <button onClick={handleSubmit} className="text-sm font-bold px-6 py-2.5 rounded-xl text-white" style={{ background: '#7C3AED' }}>
                  Clean Up Video
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Step: Processing ─── */}
        {step === 'processing' && (
          <div className="rounded-xl border bg-white p-8" style={{ borderColor: BORDER }}>
            <div className="max-w-lg mx-auto space-y-6">
              {/* Progress steps */}
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((s, i) => {
                  const jobStatus = activeJob?.status || 'transcribing';
                  const currentIdx = STATUS_STEPS.indexOf(jobStatus);
                  const done = i <= currentIdx;
                  const active = i === currentIdx && jobStatus !== 'complete' && jobStatus !== 'failed';
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                          background: done ? (activeJob?.status === 'failed' && i === currentIdx ? RED : ORANGE) : '#E5E7EB',
                          color: done ? '#fff' : '#9CA3AF',
                          boxShadow: active ? '0 0 0 4px rgba(245,146,11,0.2)' : 'none',
                        }}
                      >
                        {done && activeJob?.status !== 'failed' ? '✓' : i + 1}
                      </div>
                      <span className="text-[10px] font-semibold capitalize hidden sm:inline" style={{ color: done ? NAVY : '#9CA3AF' }}>{s}</span>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className="w-8 h-0.5 rounded" style={{ background: done ? ORANGE : '#E5E7EB' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status message */}
              {activeJob?.status === 'failed' ? (
                <div className="text-center space-y-3">
                  <div className="text-3xl">❌</div>
                  <p className="text-sm font-semibold" style={{ color: RED }}>Processing Failed</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{activeJob.error || 'An unexpected error occurred.'}</p>
                  <button onClick={handleReset} className="text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background: ORANGE }}>
                    Try Again
                  </button>
                </div>
              ) : activeJob?.status !== 'complete' ? (
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 border-3 rounded-full animate-spin mx-auto" style={{ borderColor: '#E5E7EB', borderTopColor: ORANGE, borderWidth: 3 }} />
                  <p className="text-sm font-medium" style={{ color: NAVY }}>
                    {activeJob?.status === 'transcribing' ? 'Transcribing audio with AI...' : 'Processing your video...'}
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Elapsed: {fmtDuration(elapsed)}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ─── Step: Results ─── */}
        {step === 'results' && activeJob && activeJob.status === 'complete' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <h2 className="text-lg font-bold" style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}>
                {activeJob.mode === 'quote' ? 'Quote Clips Ready' : activeJob.mode === 'power' ? 'Power Clips Ready' : 'Cleanup Complete'}
              </h2>
              {activeJob.processing_seconds && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                  Processed in {fmtDuration(activeJob.processing_seconds)}
                </span>
              )}
            </div>

            {/* Quote / Power Clips grid */}
            {(activeJob.mode === 'quote' || activeJob.mode === 'power') && activeJob.video_clips && activeJob.video_clips.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {activeJob.video_clips
                  .sort((a, b) => a.clip_index - b.clip_index)
                  .map(clip => (
                    <div key={clip.id} className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: BORDER }}>
                      {clip.download_url && (
                        <video src={clip.download_url} controls preload="metadata" className="w-full aspect-video bg-black" />
                      )}
                      <div className="p-4 space-y-2">
                        {clip.matched_quote && (
                          <p className="text-xs font-medium" style={{ color: NAVY }}>
                            <span style={{ color: ORANGE }}>Quote:</span> {clip.matched_quote}
                          </p>
                        )}
                        {clip.transcript_segment && (
                          <p className="text-xs" style={{ color: '#6B7280' }}>{clip.transcript_segment}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                            {fmtDuration(clip.start_seconds)} - {fmtDuration(clip.end_seconds)}
                          </span>
                          {clip.confidence !== null && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                              background: clip.confidence > 0.9 ? '#ECFDF5' : clip.confidence > 0.7 ? '#FFF7ED' : '#FEF2F2',
                              color: clip.confidence > 0.9 ? GREEN : clip.confidence > 0.7 ? ORANGE : RED,
                            }}>
                              {Math.round(clip.confidence * 100)}% match
                            </span>
                          )}
                          {clip.format && clip.format !== '16:9' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                              {clip.format}
                            </span>
                          )}
                        </div>
                        {clip.download_url && (
                          <a href={clip.download_url} download className="inline-block text-xs font-bold px-3 py-1.5 rounded-lg text-white mt-1" style={{ background: TEAL }}>
                            Download Clip
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Cleanup result */}
            {activeJob.mode === 'cleanup' && activeJob.output_url && (
              <div className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: BORDER }}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Original</p>
                    <video src={activeJob.source_url} controls preload="metadata" className="w-full rounded-lg aspect-video bg-black" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: GREEN }}>Cleaned</p>
                    <video src={activeJob.output_url} controls preload="metadata" className="w-full rounded-lg aspect-video bg-black" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeJob.cleanup_options?.normalize_audio && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#ECFDF5', color: GREEN }}>Audio Normalized</span>}
                  {activeJob.cleanup_options?.reduce_noise && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#ECFDF5', color: GREEN }}>Noise Reduced</span>}
                  {activeJob.cleanup_options?.color_correct && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#ECFDF5', color: GREEN }}>Color Corrected</span>}
                  {activeJob.cleanup_options?.stabilize && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#ECFDF5', color: GREEN }}>Stabilized</span>}
                </div>
                <a href={activeJob.output_url} download className="inline-block text-sm font-bold px-6 py-2.5 rounded-xl text-white" style={{ background: GREEN }}>
                  Download Cleaned Video
                </a>
              </div>
            )}

            {/* No clips case */}
            {(activeJob.mode === 'quote' || activeJob.mode === 'power') && (!activeJob.video_clips || activeJob.video_clips.length === 0) && (
              <div className="rounded-xl border bg-white p-8 text-center" style={{ borderColor: BORDER }}>
                <p className="text-sm" style={{ color: '#6B7280' }}>No clips were generated. The quotes may not have been found in the transcript, or the video may not have had enough engaging content.</p>
                <button onClick={handleReset} className="mt-4 text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background: ORANGE }}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Results for failed job ─── */}
        {step === 'results' && activeJob && activeJob.status === 'failed' && (
          <div className="rounded-xl border-2 bg-white p-8 text-center" style={{ borderColor: RED }}>
            <div className="text-3xl mb-3">❌</div>
            <p className="text-sm font-semibold mb-2" style={{ color: RED }}>Processing Failed</p>
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>{activeJob.error || 'An unexpected error occurred.'}</p>
            <button onClick={handleReset} className="text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background: ORANGE }}>
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
