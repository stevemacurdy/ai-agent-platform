'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

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

interface TranscriptSegment { start: number; end: number; text: string; }

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

interface JobListItem {
  id: string;
  mode: string;
  status: string;
  source_filename: string | null;
  source_size_bytes: number | null;
  error: string | null;
  processing_seconds: number | null;
  created_at: string;
  completed_at: string | null;
  clip_count: number;
}

type Mode = 'quote' | 'power' | 'cleanup';
type View = 'dashboard' | 'new-project' | 'job-detail';

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
const PURPLE = '#7C3AED';

const MODE_INFO: Record<Mode, { icon: string; label: string; desc: string; color: string }> = {
  quote: { icon: '\u{1F4AC}', label: 'Quote Clips', desc: 'Find and extract exact quotes from video', color: TEAL },
  power: { icon: '\u{26A1}', label: 'Power Clips', desc: 'Auto-detect the best marketing moments', color: ORANGE },
  cleanup: { icon: '\u{2728}', label: 'Video Cleanup', desc: 'Normalize audio, color, and stability', color: PURPLE },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  uploading:    { bg: '#DBEAFE', text: '#2563EB', label: 'Uploading' },
  transcribing: { bg: '#E0E7FF', text: '#4F46E5', label: 'Transcribing' },
  processing:   { bg: '#FEF3C7', text: '#D97706', label: 'Processing' },
  complete:     { bg: '#D1FAE5', text: '#059669', label: 'Complete' },
  failed:       { bg: '#FEE2E2', text: '#DC2626', label: 'Failed' },
};

const STATUS_STEPS = ['uploading', 'transcribing', 'processing', 'complete'];

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? m + 'm ' + s + 's' : s + 's';
}

function fmtBytes(bytes: number) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

/* ================================================================
   Main Component
   ================================================================ */
export default function VideoEditorConsole() {
  // Navigation
  const [view, setView] = useState<View>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Job list
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const dashPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Job detail
  const [detailJob, setDetailJob] = useState<JobData | null>(null);
  const detailPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // New project
  const [mode, setMode] = useState<Mode | null>(null);
  const [npStep, setNpStep] = useState<'mode' | 'upload' | 'configure'>('mode');

  // Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [uploadedSize, setUploadedSize] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transcript
  const [transcript, setTranscript] = useState<{ text: string; segments: TranscriptSegment[] } | null>(null);
  const [transcribing, setTranscribing] = useState(false);

  // Mode controls
  const [quoteText, setQuoteText] = useState('');
  const [stitch, setStitch] = useState(false);
  const [clipMin, setClipMin] = useState(5);
  const [clipMax, setClipMax] = useState(30);
  const [clipFormats, setClipFormats] = useState<string[]>(['16:9', '9:16']);
  const [burnCaptions, setBurnCaptions] = useState(true);
  const [maxClips, setMaxClips] = useState(5);
  const [cleanupOpts, setCleanupOpts] = useState({ normalize_audio: true, reduce_noise: true, color_correct: true, stabilize: false });

  /* ── Data Fetching ─────────────────────────────────────────── */

  const loadJobs = useCallback(async () => {
    try {
      const resp = await fetch('/api/agents/video-editor?view=jobs');
      const d = await resp.json();
      if (d.jobs) setJobs(d.jobs);
    } catch { /* retry */ }
    setJobsLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
    dashPollRef.current = setInterval(loadJobs, 5000);
    return () => { if (dashPollRef.current) clearInterval(dashPollRef.current); };
  }, [loadJobs]);

  const loadJobDetail = useCallback(async (jid: string) => {
    try {
      const resp = await fetch('/api/agents/video-editor?job=' + jid);
      const d = await resp.json();
      if (d.job) {
        setDetailJob(d.job);
        if (d.job.status === 'complete' || d.job.status === 'failed') {
          if (detailPollRef.current) clearInterval(detailPollRef.current);
          detailPollRef.current = null;
        }
      }
    } catch { /* retry */ }
  }, []);

  useEffect(() => {
    if (view !== 'job-detail' || !selectedJobId) return;
    loadJobDetail(selectedJobId);
    detailPollRef.current = setInterval(() => loadJobDetail(selectedJobId), 3000);
    return () => { if (detailPollRef.current) clearInterval(detailPollRef.current); };
  }, [view, selectedJobId, loadJobDetail]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jid = params.get('job');
    if (jid) { setSelectedJobId(jid); setView('job-detail'); }
  }, []);

  /* ── Upload ────────────────────────────────────────────────── */

  async function handleUpload(file: File) {
    setUploadFile(file);
    setUploadError(null);
    setUploadProgress(0);
    const maxSize = 3 * 1024 * 1024 * 1024;
    if (file.size > maxSize) { setUploadError('File too large. Maximum 3GB.'); return; }
    if (!/\.(mp4|mov|webm|avi)$/i.test(file.name)) { setUploadError('Unsupported format. Use MP4, MOV, WEBM, or AVI.'); return; }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const remotePath = `default/${Date.now()}-${safeName}`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/video-uploads/${remotePath}`;

    try {
      // Use XMLHttpRequest for real progress tracking
      const publicUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
        xhr.setRequestHeader('x-upsert', 'false');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 95); // 0-95% for upload
            setUploadProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const sb = getSupabaseBrowser();
            const { data: urlData } = sb.storage.from('video-uploads').getPublicUrl(remotePath);
            resolve(urlData.publicUrl);
          } else {
            let msg = 'Upload failed';
            try { const err = JSON.parse(xhr.responseText); msg = err.message || err.error || msg; } catch {}
            reject(new Error(msg));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.ontimeout = () => reject(new Error('Upload timed out'));
        xhr.timeout = 1800000; // 30 min timeout
        xhr.send(file);
      });

      setUploadProgress(100);
      setUploadedUrl(publicUrl);
      setUploadedFilename(file.name);
      setUploadedSize(file.size);
      setNpStep('configure');

      if (mode === 'quote') {
        setTranscribing(true);
        try {
          const tResp = await fetch('/api/agents/video-editor/transcribe', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceUrl: publicUrl }),
          });
          if (tResp.ok) { const tData = await tResp.json(); setTranscript(tData.transcript || tData); }
        } catch { /* optional */ }
        setTranscribing(false);
      }
    } catch (err) { setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.'); setUploadProgress(0); }
  }

  /* ── Submit Job ────────────────────────────────────────────── */

  async function submitJob() {
    if (!mode || !uploadedUrl) return;
    const body: Record<string, unknown> = { mode, sourceUrl: uploadedUrl, sourceFilename: uploadedFilename, sourceSizeBytes: uploadedSize };

    if (mode === 'quote') {
      const quotes = quoteText.split('\n').map(q => q.trim()).filter(Boolean);
      if (quotes.length === 0) { alert('Enter at least one quote.'); return; }
      body.quotes = quotes; body.stitch = stitch;
    } else if (mode === 'power') {
      body.clipMin = clipMin; body.clipMax = clipMax; body.clipFormats = clipFormats;
      body.burnCaptions = burnCaptions; body.maxClips = maxClips;
    } else if (mode === 'cleanup') {
      body.cleanupOptions = cleanupOpts;
    }

    try {
      const resp = await fetch('/api/agents/video-editor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await resp.json();
      if (d.jobId) {
        resetNewProject();
        await loadJobs();
        setSelectedJobId(d.jobId); setView('job-detail');
      } else { alert(d.error || 'Failed to create job'); }
    } catch { alert('Failed to submit job.'); }
  }

  function resetNewProject() {
    setMode(null); setNpStep('mode');
    setUploadFile(null); setUploadProgress(0); setUploadedUrl(null); setUploadedFilename(''); setUploadedSize(0); setUploadError(null);
    setTranscript(null); setTranscribing(false);
    setQuoteText(''); setStitch(false);
    setClipMin(5); setClipMax(30); setClipFormats(['16:9','9:16']); setBurnCaptions(true); setMaxClips(5);
    setCleanupOpts({ normalize_audio: true, reduce_noise: true, color_correct: true, stabilize: false });
  }

  function openNewProject() { resetNewProject(); setView('new-project'); }
  function openJobDetail(jid: string) { setSelectedJobId(jid); setDetailJob(null); setView('job-detail'); }

  const activeJobs = jobs.filter(j => j.status !== 'complete' && j.status !== 'failed');
  const completedJobs = jobs.filter(j => j.status === 'complete');
  const failedJobs = jobs.filter(j => j.status === 'failed');
  const totalClips = jobs.reduce((s, j) => s + (j.clip_count || 0), 0);

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ background: LIGHT_BG, fontFamily: "'DM Sans', sans-serif" }}>
      {/* NAV */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(27,42,74,0.97)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Woulf<span style={{ color: ORANGE }}>AI</span>
            </Link>
            <span style={{ color: '#4B5563' }}>|</span>
            <button onClick={() => { setView('dashboard'); setSelectedJobId(null); }} className="text-sm font-bold text-white flex items-center gap-1.5">
              {'\u{1F3AC}'} Video Editor
            </button>
          </div>
          <button onClick={openNewProject} className="text-sm font-bold text-white px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: ORANGE }}>
            + New Project
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ══════ DASHBOARD ══════ */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Jobs', value: activeJobs.length, icon: '\u{1F504}', color: '#2563EB' },
                { label: 'Completed', value: completedJobs.length, icon: '\u{2705}', color: GREEN },
                { label: 'Total Clips', value: totalClips, icon: '\u{2702}\u{FE0F}', color: ORANGE },
                { label: 'Failed', value: failedJobs.length, icon: '\u{274C}', color: RED },
              ].map((kpi, i) => (
                <div key={i} className="p-4 rounded-xl border bg-white" style={{ borderColor: BORDER }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                    <span className="mr-1">{kpi.icon}</span>{kpi.label}
                  </p>
                  <p className="text-2xl font-extrabold mt-1" style={{ fontFamily: "'Outfit', sans-serif", color: NAVY }}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Active Jobs Banner */}
            {activeJobs.length > 0 && (
              <div className="rounded-xl border-2 p-4 space-y-3" style={{ borderColor: '#60A5FA', background: '#EFF6FF' }}>
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#1E40AF' }}>
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  {activeJobs.length} Active {activeJobs.length === 1 ? 'Project' : 'Projects'}
                </h3>
                {activeJobs.map(j => {
                  const sc = STATUS_COLORS[j.status] || STATUS_COLORS.processing;
                  const stepIdx = STATUS_STEPS.indexOf(j.status);
                  const pct = stepIdx >= 0 ? Math.round(((stepIdx + 0.5) / STATUS_STEPS.length) * 100) : 50;
                  return (
                    <button key={j.id} onClick={() => openJobDetail(j.id)}
                      className="w-full text-left p-3 rounded-lg border bg-white hover:shadow-md transition-shadow" style={{ borderColor: BORDER }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{MODE_INFO[j.mode as Mode]?.icon || '\u{1F3AC}'}</span>
                          <span className="text-sm font-semibold" style={{ color: NAVY }}>{j.source_filename || 'Untitled'}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                        </div>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{timeAgo(j.created_at)}</span>
                      </div>
                      <div className="w-full rounded-full h-1.5" style={{ background: '#E5E7EB' }}>
                        <div className="rounded-full h-1.5 transition-all" style={{ width: pct + '%', background: sc.text }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Job History */}
            <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: BORDER }}>
              <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
                <h3 className="text-sm font-bold" style={{ color: NAVY }}>Project History</h3>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{jobs.length} total</span>
              </div>
              {jobsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full" />
                  <p className="text-sm mt-2" style={{ color: '#9CA3AF' }}>Loading projects...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-4xl mb-3">{'\u{1F3AC}'}</p>
                  <p className="text-sm font-semibold" style={{ color: NAVY }}>No projects yet</p>
                  <p className="text-xs mt-1 mb-4" style={{ color: '#9CA3AF' }}>Upload a video to get started</p>
                  <button onClick={openNewProject} className="text-sm font-bold text-white px-6 py-2.5 rounded-lg" style={{ background: ORANGE }}>+ New Project</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['File','Mode','Status','Clips','Size','Created',''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(j => {
                        const sc = STATUS_COLORS[j.status] || STATUS_COLORS.processing;
                        const mi = MODE_INFO[j.mode as Mode];
                        return (
                          <tr key={j.id} className="border-t cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}
                            onClick={() => openJobDetail(j.id)}>
                            <td className="px-4 py-3 font-medium" style={{ color: NAVY }}>
                              <div className="flex items-center gap-2">
                                <span>{mi?.icon || '\u{1F3AC}'}</span>
                                <span className="truncate max-w-xs">{j.source_filename || 'Untitled'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3" style={{ color: '#4B5563' }}>{mi?.label || j.mode}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1" style={{ background: sc.bg, color: sc.text }}>
                                {(j.status !== 'complete' && j.status !== 'failed') && <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.text }} />}
                                {sc.label}
                              </span>
                            </td>
                            <td className="px-4 py-3" style={{ color: '#4B5563' }}>{j.clip_count || '\u{2014}'}</td>
                            <td className="px-4 py-3" style={{ color: '#9CA3AF' }}>{j.source_size_bytes ? fmtBytes(j.source_size_bytes) : '\u{2014}'}</td>
                            <td className="px-4 py-3" style={{ color: '#9CA3AF' }}>{fmtDate(j.created_at)}</td>
                            <td className="px-4 py-3 text-right"><span className="text-xs font-medium" style={{ color: ORANGE }}>View \u{2192}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════ NEW PROJECT ══════ */}
        {view === 'new-project' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setView('dashboard')} className="font-medium" style={{ color: ORANGE }}>{'\u{2190}'} Back to Dashboard</button>
              <span style={{ color: '#9CA3AF' }}>/ New Project</span>
            </div>

            {/* Mode Selection */}
            {npStep === 'mode' && (
              <div>
                <h2 className="text-xl font-extrabold mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: NAVY }}>What do you want to do?</h2>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Choose a processing mode for your video</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {(Object.keys(MODE_INFO) as Mode[]).map(m => {
                    const info = MODE_INFO[m];
                    return (
                      <button key={m} onClick={() => { setMode(m); setNpStep('upload'); }}
                        className="p-6 rounded-xl border-2 text-left transition-all hover:shadow-md" style={{ borderColor: BORDER, background: 'white' }}>
                        <span className="text-3xl">{info.icon}</span>
                        <h3 className="text-lg font-bold mt-3" style={{ color: NAVY }}>{info.label}</h3>
                        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{info.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload */}
            {npStep === 'upload' && mode && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <button onClick={() => setNpStep('mode')} className="text-sm" style={{ color: '#9CA3AF' }}>{'\u{2190}'} Mode</button>
                  <span className="text-sm font-bold" style={{ color: NAVY }}>{MODE_INFO[mode].icon} {MODE_INFO[mode].label} {'\u{2014}'} Upload Video</span>
                </div>
                <div className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-orange-300 transition-colors bg-white"
                  style={{ borderColor: uploadError ? RED : BORDER }}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f); }}
                  onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept=".mp4,.mov,.webm,.avi" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                  {uploadProgress > 0 && uploadProgress < 100 ? (
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: NAVY }}>Uploading {uploadFile?.name}...</p>
                      <div className="w-64 mx-auto rounded-full h-2" style={{ background: '#E5E7EB' }}>
                        <div className="rounded-full h-2 transition-all" style={{ width: uploadProgress + '%', background: ORANGE }} />
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                        {Math.round(uploadProgress)}%{uploadFile ? ` \u{2014} ${fmtBytes(Math.round(uploadFile.size * uploadProgress / 100))} of ${fmtBytes(uploadFile.size)}` : ''}
                      </p>
                    </div>
                  ) : uploadProgress === 100 ? (
                    <div>
                      <p className="text-3xl mb-2">{'\u{2705}'}</p>
                      <p className="text-sm font-semibold" style={{ color: GREEN }}>{uploadedFilename} uploaded</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{fmtBytes(uploadedSize)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-4xl mb-3">{'\u{1F4C1}'}</p>
                      <p className="text-sm font-semibold" style={{ color: NAVY }}>Drag & drop your video here or <span style={{ color: ORANGE }}>browse</span></p>
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>MP4, MOV, WEBM, AVI up to 3GB</p>
                    </div>
                  )}
                </div>
                {uploadError && <p className="text-sm mt-2 font-medium" style={{ color: RED }}>{uploadError}</p>}
              </div>
            )}

            {/* Configure & Submit */}
            {npStep === 'configure' && mode && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setNpStep('upload')} className="text-sm" style={{ color: '#9CA3AF' }}>{'\u{2190}'} Upload</button>
                  <span className="text-sm font-bold" style={{ color: NAVY }}>{MODE_INFO[mode].icon} {MODE_INFO[mode].label} {'\u{2014}'} Configure</span>
                </div>

                <div className="p-3 rounded-lg border bg-white flex items-center gap-3" style={{ borderColor: BORDER }}>
                  <span className="text-2xl">{'\u{1F4F9}'}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: NAVY }}>{uploadedFilename}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{fmtBytes(uploadedSize)}</p>
                  </div>
                </div>

                {/* Quote config */}
                {mode === 'quote' && (
                  <div className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: BORDER }}>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Quotes to find</label>
                      <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>One per line. We&apos;ll find the exact timestamp.</p>
                      <textarea rows={6} value={quoteText} onChange={e => setQuoteText(e.target.value)}
                        placeholder={"This system saved us over 200 hours per month\nWe saw ROI within the first 30 days\nBest investment we made all year"}
                        className="w-full border rounded-lg p-3 text-sm" style={{ borderColor: BORDER, color: NAVY }} />
                    </div>
                    {transcribing && <p className="text-xs font-medium animate-pulse" style={{ color: TEAL }}>{'\u{1F399}\u{FE0F}'} Transcribing video...</p>}
                    {transcript && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                          Transcript ({transcript.segments.length} segments) {'\u{2014}'} click to add
                        </label>
                        <div className="mt-1 max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1" style={{ borderColor: BORDER, background: '#F9FAFB' }}>
                          {transcript.segments.map((seg, i) => (
                            <button key={i} onClick={() => setQuoteText(prev => prev + (prev ? '\n' : '') + seg.text.trim())}
                              className="block w-full text-left text-xs px-2 py-1 rounded hover:bg-blue-50" style={{ color: '#4B5563' }}>
                              <span style={{ color: '#9CA3AF' }}>{fmtDuration(seg.start)}</span> {seg.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm" style={{ color: '#4B5563' }}>
                      <input type="checkbox" checked={stitch} onChange={e => setStitch(e.target.checked)} />
                      Stitch all clips into one compilation
                    </label>
                  </div>
                )}

                {/* Power config */}
                {mode === 'power' && (
                  <div className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: BORDER }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Min clip (s)</label>
                        <input type="number" value={clipMin} onChange={e => setClipMin(+e.target.value)} min={3} max={60}
                          className="w-full border rounded-lg p-2 mt-1 text-sm" style={{ borderColor: BORDER }} />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Max clip (s)</label>
                        <input type="number" value={clipMax} onChange={e => setClipMax(+e.target.value)} min={5} max={120}
                          className="w-full border rounded-lg p-2 mt-1 text-sm" style={{ borderColor: BORDER }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Export formats</label>
                      <div className="flex gap-3 mt-2">
                        {['16:9','9:16','1:1'].map(fmt => (
                          <label key={fmt} className="flex items-center gap-1.5 text-sm" style={{ color: '#4B5563' }}>
                            <input type="checkbox" checked={clipFormats.includes(fmt)}
                              onChange={e => setClipFormats(e.target.checked ? [...clipFormats, fmt] : clipFormats.filter(f => f !== fmt))} />
                            {fmt}
                          </label>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm" style={{ color: '#4B5563' }}>
                      <input type="checkbox" checked={burnCaptions} onChange={e => setBurnCaptions(e.target.checked)} />
                      Burn captions into clips
                    </label>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Max clips</label>
                      <input type="number" value={maxClips} onChange={e => setMaxClips(+e.target.value)} min={1} max={20}
                        className="w-full border rounded-lg p-2 mt-1 text-sm" style={{ borderColor: BORDER }} />
                    </div>
                  </div>
                )}

                {/* Cleanup config */}
                {mode === 'cleanup' && (
                  <div className="rounded-xl border bg-white p-5 space-y-3" style={{ borderColor: BORDER }}>
                    {[
                      { key: 'normalize_audio', label: 'Normalize audio levels', desc: 'Consistent volume throughout' },
                      { key: 'reduce_noise', label: 'Reduce background noise', desc: 'Clean up ambient sound' },
                      { key: 'color_correct', label: 'Color correction', desc: 'Balanced exposure and colors' },
                      { key: 'stabilize', label: 'Stabilize video', desc: 'Smooth out shaky footage (slower)' },
                    ].map(opt => (
                      <label key={opt.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={cleanupOpts[opt.key as keyof typeof cleanupOpts]}
                          onChange={e => setCleanupOpts({ ...cleanupOpts, [opt.key]: e.target.checked })} />
                        <div>
                          <span className="text-sm font-medium" style={{ color: NAVY }}>{opt.label}</span>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button onClick={submitJob} className="text-sm font-bold text-white px-8 py-3 rounded-xl"
                    style={{ background: ORANGE, boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
                    {'\u{1F680}'} Start Processing
                  </button>
                  <button onClick={() => setView('dashboard')} className="text-sm" style={{ color: '#9CA3AF' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ JOB DETAIL ══════ */}
        {view === 'job-detail' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => { setView('dashboard'); setSelectedJobId(null); }} className="font-medium" style={{ color: ORANGE }}>
                {'\u{2190}'} Back to Dashboard
              </button>
              <span style={{ color: '#9CA3AF' }}>/ {detailJob?.source_filename || 'Loading...'}</span>
            </div>

            {!detailJob ? (
              <div className="p-12 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full" />
                <p className="text-sm mt-3" style={{ color: '#9CA3AF' }}>Loading project...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{MODE_INFO[detailJob.mode as Mode]?.icon || '\u{1F3AC}'}</span>
                      <div>
                        <h2 className="text-lg font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: NAVY }}>{detailJob.source_filename || 'Untitled'}</h2>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>
                          {MODE_INFO[detailJob.mode as Mode]?.label} {'\u{00B7}'} {fmtDate(detailJob.created_at)}
                          {detailJob.source_size_bytes ? ` \u{00B7} ${fmtBytes(detailJob.source_size_bytes)}` : ''}
                        </p>
                      </div>
                    </div>
                    {(() => {
                      const sc = STATUS_COLORS[detailJob.status] || STATUS_COLORS.processing;
                      return (
                        <span className="text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5" style={{ background: sc.bg, color: sc.text }}>
                          {(detailJob.status !== 'complete' && detailJob.status !== 'failed') && <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: sc.text }} />}
                          {sc.label}
                        </span>
                      );
                    })()}
                  </div>

                  {detailJob.status !== 'complete' && detailJob.status !== 'failed' && (
                    <div className="mt-4">
                      <div className="flex justify-between mb-2">
                        {STATUS_STEPS.map((s, i) => {
                          const current = STATUS_STEPS.indexOf(detailJob.status);
                          const done = i <= current;
                          return <span key={s} className="text-xs font-medium" style={{ color: done ? TEAL : '#D1D5DB' }}>{done ? '\u{2713} ' : ''}{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
                        })}
                      </div>
                      <div className="w-full rounded-full h-2" style={{ background: '#E5E7EB' }}>
                        <div className="rounded-full h-2 transition-all" style={{
                          width: Math.round(((STATUS_STEPS.indexOf(detailJob.status) + 0.5) / STATUS_STEPS.length) * 100) + '%', background: TEAL }} />
                      </div>
                    </div>
                  )}

                  {detailJob.error && (
                    <div className="mt-4 p-3 rounded-lg" style={{ background: '#FEE2E2' }}>
                      <p className="text-sm font-medium" style={{ color: RED }}>Error: {detailJob.error}</p>
                    </div>
                  )}

                  {detailJob.status === 'complete' && detailJob.processing_seconds && (
                    <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
                      Processed in {fmtDuration(detailJob.processing_seconds)}
                      {detailJob.completed_at ? ` \u{00B7} Completed ${fmtDate(detailJob.completed_at)}` : ''}
                    </p>
                  )}
                </div>

                {/* Clips */}
                {detailJob.video_clips && detailJob.video_clips.length > 0 && (
                  <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}>
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: NAVY }}>
                      {'\u{2702}\u{FE0F}'} {detailJob.video_clips.length} Clip{detailJob.video_clips.length !== 1 ? 's' : ''} Generated
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {detailJob.video_clips.sort((a, b) => a.clip_index - b.clip_index).map(clip => (
                        <div key={clip.id} className="rounded-lg border overflow-hidden" style={{ borderColor: BORDER }}>
                          {clip.download_url && (
                            <video src={clip.download_url} controls preload="metadata" className="w-full" style={{ maxHeight: 200, background: '#000' }} />
                          )}
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold" style={{ color: NAVY }}>Clip #{clip.clip_index + 1}</span>
                              <span className="text-xs" style={{ color: '#9CA3AF' }}>{clip.format} {'\u{00B7}'} {fmtDuration(clip.duration_seconds)}</span>
                            </div>
                            {clip.matched_quote && <p className="text-xs italic mt-1" style={{ color: '#4B5563' }}>&quot;{clip.matched_quote}&quot;</p>}
                            {clip.confidence != null && <p className="text-xs mt-1" style={{ color: TEAL }}>{Math.round(clip.confidence * 100)}% match</p>}
                            {clip.download_url && (
                              <a href={clip.download_url} download className="inline-block mt-2 text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: ORANGE }}>
                                {'\u{2B07}'} Download
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cleanup output */}
                {detailJob.mode === 'cleanup' && detailJob.status === 'complete' && detailJob.output_url && (
                  <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}>
                    <h3 className="text-sm font-bold mb-4" style={{ color: NAVY }}>{'\u{2728}'} Cleaned Video</h3>
                    <video src={detailJob.output_url} controls className="w-full rounded-lg" style={{ maxHeight: 400 }} />
                    <a href={detailJob.output_url} download className="inline-block mt-3 text-sm font-bold px-5 py-2 rounded-lg text-white" style={{ background: ORANGE }}>
                      {'\u{2B07}'} Download Cleaned Video
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button onClick={openNewProject} className="text-sm font-bold text-white px-5 py-2.5 rounded-lg" style={{ background: ORANGE }}>+ New Project</button>
                  <button onClick={() => { setView('dashboard'); setSelectedJobId(null); }} className="text-sm font-medium px-5 py-2.5 rounded-lg border" style={{ borderColor: BORDER, color: '#4B5563' }}>
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
