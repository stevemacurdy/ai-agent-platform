export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { trackUsage } from '@/lib/usage-tracker';
import { getVideoEditorDashboard, getVideoEditorDemoData, getVideoJob } from '@/lib/video-editor-data';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const WORKER_URL = process.env.VIDEO_WORKER_URL || 'https://video-editor-worker-production.up.railway.app';

export async function GET(request: NextRequest) {
  trackUsage(request, 'video-editor');
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job');
  const companyId = searchParams.get('companyId') || 'woulf';
  const view = searchParams.get('view') || 'dashboard';

  // Single job fetch (polling)
  if (jobId) {
    const job = await getVideoJob(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ job });
  }

  // List all real jobs (console dashboard)
  if (view === 'jobs') {
    try {
      const sb = supabaseAdmin();
      const { data: jobs } = await sb
        .from('video_jobs')
        .select('id, mode, status, source_filename, source_size_bytes, error, processing_seconds, created_at, completed_at')
        .order('created_at', { ascending: false })
        .limit(100);

      // Get clip counts for completed jobs
      const allJobs = jobs || [];

      // Auto-fail stale jobs (stuck > 30 min)
      const staleThreshold = 30 * 60 * 1000; // 30 minutes
      const now = Date.now();
      const staleIds = allJobs
        .filter(j => (j.status === 'transcribing' || j.status === 'processing') &&
          (now - new Date(j.created_at).getTime()) > staleThreshold)
        .map(j => j.id);
      if (staleIds.length > 0) {
        await sb.from('video_jobs')
          .update({ status: 'failed', error: 'Processing timed out. The video may be too large or the worker was unavailable. Please try again.' })
          .in('id', staleIds);
        // Update local data
        allJobs.forEach(j => {
          if (staleIds.includes(j.id)) {
            j.status = 'failed';
            j.error = 'Processing timed out';
          }
        });
      }

      const completedIds = allJobs.filter(j => j.status === 'complete').map(j => j.id);
      const clipCounts: Record<string, number> = {};
      if (completedIds.length > 0) {
        const { data: clips } = await sb
          .from('video_clips')
          .select('job_id')
          .in('job_id', completedIds);
        (clips || []).forEach(c => { clipCounts[c.job_id] = (clipCounts[c.job_id] || 0) + 1; });
      }

      const enriched = allJobs.map(j => ({ ...j, clip_count: clipCounts[j.id] || 0 }));
      return NextResponse.json({ success: true, jobs: enriched });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // Demo / dashboard view
  if (companyId === 'woulf' || view === 'demo') {
    const data = getVideoEditorDemoData();
    return NextResponse.json({ success: true, data });
  }

  try {
    const data = await getVideoEditorDashboard(companyId);
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  trackUsage(request, 'video-editor', 'process');

  try {
    const body = await request.json();
    const { mode, sourceUrl, sourceFilename, sourceSizeBytes, quotes, clipMin, clipMax, clipFormats, cleanupOptions, stitch, companyId, userId } = body;

    if (!mode || !sourceUrl) {
      return NextResponse.json({ error: 'mode and sourceUrl are required' }, { status: 400 });
    }
    if (mode === 'quote' && (!quotes || quotes.length === 0)) {
      return NextResponse.json({ error: 'quotes array is required for quote mode' }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Create job record
    const { data: job, error } = await sb
      .from('video_jobs')
      .insert({
        company_id: companyId || null,
        user_id: userId || null,
        mode,
        source_url: sourceUrl,
        source_filename: sourceFilename || null,
        source_size_bytes: sourceSizeBytes || null,
        quotes: quotes || [],
        clip_min_seconds: clipMin || 5,
        clip_max_seconds: clipMax || 30,
        clip_formats: clipFormats || ['16:9'],
        cleanup_options: cleanupOptions || { normalize_audio: true, reduce_noise: true, color_correct: true, stabilize: false },
        status: 'transcribing',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Dispatch to worker (fire and forget)
    // Generate a signed URL so the worker can access the private bucket
    let workerSourceUrl = sourceUrl;
    try {
      const pathMatch = sourceUrl.match(/\/storage\/v1\/object\/public\/video-uploads\/(.+)$/);
      if (pathMatch) {
        const storagePath = decodeURIComponent(pathMatch[1]);
        const { data: signedData, error: signedErr } = await sb.storage
          .from('video-uploads')
          .createSignedUrl(storagePath, 3600 * 6); // 6 hours
        if (signedData?.signedUrl && !signedErr) {
          workerSourceUrl = signedData.signedUrl;
        }
      }
    } catch { /* fall back to original URL */ }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.woulfai.com';
    fetch(`${WORKER_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WORKER_SECRET || ''}`,
      },
      body: JSON.stringify({
        jobId: job.id,
        mode,
        sourceUrl: workerSourceUrl,
        quotes: quotes || [],
        clipMin: clipMin || 5,
        clipMax: clipMax || 30,
        clipFormats: clipFormats || ['16:9'],
        cleanupOptions: cleanupOptions || {},
        stitch: stitch || false,
        callbackUrl: `${appUrl}/api/agents/video-editor/callback`,
      }),
    }).catch((err) => {
      console.error('Worker dispatch failed:', err);
      sb.from('video_jobs').update({ status: 'failed', error: 'Worker unavailable' }).eq('id', job.id);
    });

    return NextResponse.json({ jobId: job.id, status: 'transcribing' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
