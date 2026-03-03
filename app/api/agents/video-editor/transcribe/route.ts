export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { trackUsage } from '@/lib/usage-tracker';

const WORKER_URL = process.env.VIDEO_WORKER_URL || 'https://video-editor-worker-production.up.railway.app';

export async function POST(request: NextRequest) {
  trackUsage(request, 'video-editor', 'transcribe');
  try {
    const body = await request.json();
    const { sourceUrl } = body;

    if (!sourceUrl) return NextResponse.json({ error: 'sourceUrl is required' }, { status: 400 });

    const resp = await fetch(`${WORKER_URL}/transcribe-only`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WORKER_SECRET || ''}`,
      },
      body: JSON.stringify({ sourceUrl }),
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
