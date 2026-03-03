// ─── Video Editor Agent Data Layer ──────────────────────────────
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface VideoJob {
  id: string;
  company_id: string;
  user_id: string;
  mode: 'quote' | 'power' | 'cleanup';
  status: 'uploading' | 'transcribing' | 'processing' | 'complete' | 'failed';
  source_url: string;
  source_filename: string | null;
  source_duration_seconds: number | null;
  source_size_bytes: number | null;
  transcript: TranscriptData | null;
  quotes: string[];
  clip_min_seconds: number;
  clip_max_seconds: number;
  clip_formats: string[];
  cleanup_options: CleanupOptions;
  output_url: string | null;
  error: string | null;
  processing_seconds: number | null;
  created_at: string;
  completed_at: string | null;
  video_clips?: VideoClip[];
}

export interface VideoClip {
  id: string;
  job_id: string;
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
  created_at: string;
}

export interface TranscriptData {
  text: string;
  segments: { start: number; end: number; text: string }[];
  words?: { start: number; end: number; word: string }[];
}

export interface CleanupOptions {
  normalize_audio: boolean;
  reduce_noise: boolean;
  color_correct: boolean;
  stabilize: boolean;
}

// ─── Dashboard data (GET with no job param) ─────────────────────
export async function getVideoEditorDashboard(companyId?: string) {
  const sb = supabaseAdmin();

  let query = sb.from('video_jobs').select('id, mode, status, source_filename, created_at, completed_at, processing_seconds, error');
  if (companyId && companyId !== 'woulf') {
    query = query.eq('company_id', companyId);
  }
  const { data: jobs } = await query.order('created_at', { ascending: false }).limit(50);
  const allJobs = jobs || [];

  const completed = allJobs.filter(j => j.status === 'complete');
  const totalProcessing = completed.reduce((s, j) => s + (j.processing_seconds || 0), 0);
  const avgProcessing = completed.length > 0 ? Math.round(totalProcessing / completed.length / 60 * 10) / 10 : 0;

  // Count clips
  const completedIds = completed.map(j => j.id);
  let clipCount = 0;
  if (completedIds.length > 0) {
    const { count } = await sb.from('video_clips').select('id', { count: 'exact', head: true }).in('job_id', completedIds);
    clipCount = count || 0;
  }

  // Estimate hours saved (avg 15 min manual per video)
  const hoursSaved = Math.round(completed.length * 15 / 60);

  return {
    kpis: [
      { label: 'Videos Processed', value: completed.length, change: '', icon: '🎬' },
      { label: 'Clips Generated', value: clipCount, change: '', icon: '✂️' },
      { label: 'Avg Processing', value: avgProcessing > 0 ? avgProcessing + ' min' : '--', change: '', icon: '⏱️' },
      { label: 'Hours Saved', value: hoursSaved > 0 ? hoursSaved + ' hrs' : '--', change: '', icon: '💰' },
    ],
    tableColumns: [
      { key: 'source_filename', label: 'File' },
      { key: 'mode', label: 'Mode' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' },
    ],
    tableData: allJobs.slice(0, 20),
    recommendations: [
      { priority: 'high', title: 'Extract client testimonial quotes', description: 'Upload a testimonial video and pull out the best sound bites in seconds.' },
      { priority: 'medium', title: 'Turn webinars into social content', description: 'Use Power Clips to auto-generate 5+ social-ready clips from any long-form video.' },
      { priority: 'low', title: 'Polish raw footage', description: 'Clean up trade show or phone recordings with one-click audio, color, and stability fixes.' },
    ],
  };
}

// ─── Demo data (no DB needed) ────────────────────────────────
export function getVideoEditorDemoData() {
  return {
    kpis: [
      { label: 'Videos Processed', value: 47, change: '+12 this week', trend: 'up', icon: '🎬' },
      { label: 'Clips Generated', value: 312, change: '+86 this week', trend: 'up', icon: '✂️' },
      { label: 'Avg Processing', value: '2.4 min', change: '-18% faster', trend: 'up', icon: '⏱️' },
      { label: 'Hours Saved', value: '94 hrs', change: 'vs manual editing', trend: 'up', icon: '💰' },
    ],
    tableColumns: [
      { key: 'source_filename', label: 'File' },
      { key: 'mode', label: 'Mode' },
      { key: 'status', label: 'Status' },
      { key: 'clips', label: 'Clips' },
      { key: 'created_at', label: 'Date' },
    ],
    tableData: [
      { id: '1', source_filename: 'customer-testimonial-jcpenney.mp4', mode: 'quote', status: 'complete', clips: 6, created_at: '2026-02-28' },
      { id: '2', source_filename: 'warehouse-webinar-feb.mp4', mode: 'power', status: 'complete', clips: 8, created_at: '2026-02-27' },
      { id: '3', source_filename: 'tradeshow-booth-walk.mov', mode: 'cleanup', status: 'complete', clips: 1, created_at: '2026-02-26' },
      { id: '4', source_filename: 'q4-sales-kickoff.mp4', mode: 'power', status: 'complete', clips: 5, created_at: '2026-02-25' },
      { id: '5', source_filename: 'ceo-interview-raw.mov', mode: 'quote', status: 'complete', clips: 4, created_at: '2026-02-24' },
      { id: '6', source_filename: 'product-demo-v3.mp4', mode: 'cleanup', status: 'complete', clips: 1, created_at: '2026-02-23' },
    ],
    recommendations: [
      { priority: 'high', title: 'Upload a testimonial video to extract client quotes', description: 'Quote Clips mode finds exact timestamps for any quote you paste, then extracts clean clips in seconds.', impact: 'Save 2+ hours per testimonial' },
      { priority: 'medium', title: 'Turn your 30-min webinar into 8 social media clips', description: 'Power Clips auto-detects the most engaging moments, burns in captions, and exports for Reels, TikTok, and LinkedIn.', impact: '15 ready-to-post assets from one video' },
      { priority: 'low', title: 'Clean up your trade show footage for the website', description: 'Video Cleanup normalizes audio, corrects color, stabilizes shaky footage, and removes dead air automatically.', impact: 'Professional-quality video in minutes' },
    ],
  };
}

// ─── Single job fetch ────────────────────────────────────────
export async function getVideoJob(jobId: string) {
  const sb = supabaseAdmin();
  const { data: job, error } = await sb
    .from('video_jobs')
    .select('*, video_clips(*)')
    .eq('id', jobId)
    .single();
  if (error) return null;
  return job as VideoJob;
}
