export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { trackUsage } from '@/lib/usage-tracker';

const WORKER_URL = process.env.VIDEO_WORKER_URL || 'https://video-editor-worker-production.up.railway.app';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  trackUsage(request, 'video-editor', 'transcribe');
  try {
    const body = await request.json();
    const { sourceUrl } = body;

    if (!sourceUrl) return NextResponse.json({ error: 'sourceUrl is required' }, { status: 400 });

    // Generate signed URL for private bucket
    let workerUrl = sourceUrl;
    try {
      const pathMatch = sourceUrl.match(/\/storage\/v1\/object\/public\/video-uploads\/(.+)$/);
      if (pathMatch) {
        const sb = supabaseAdmin();
        const storagePath = decodeURIComponent(pathMatch[1]);
        const { data: signedData, error: signedErr } = await sb.storage
          .from('video-uploads')
          .createSignedUrl(storagePath, 3600 * 6);
        if (signedData?.signedUrl && !signedErr) {
          workerUrl = signedData.signedUrl;
        }
      }
    } catch { /* fall back to original URL */ }

    const resp = await fetch(`${WORKER_URL}/transcribe-only`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WORKER_SECRET || ''}`,
      },
      body: JSON.stringify({ sourceUrl: workerUrl }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ error: 'Transcription failed: ' + errText }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
