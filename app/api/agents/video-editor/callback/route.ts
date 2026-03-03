export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, status, clips, outputUrl, error: jobError, processingSeconds } = body;

    if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

    const secret = request.headers.get('authorization')?.replace('Bearer ', '');
    if (secret !== process.env.WORKER_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = supabaseAdmin();

    // Update job
    const updateData: Record<string, unknown> = {
      status: status || 'complete',
      processing_seconds: processingSeconds || null,
      completed_at: new Date().toISOString(),
    };
    if (outputUrl) updateData.output_url = outputUrl;
    if (jobError) updateData.error = jobError;

    await sb.from('video_jobs').update(updateData).eq('id', jobId);

    // Insert clips if provided
    if (clips && Array.isArray(clips) && clips.length > 0) {
      const clipRows = clips.map((c: Record<string, unknown>, i: number) => ({
        job_id: jobId,
        clip_index: i,
        start_seconds: c.start || 0,
        end_seconds: c.end || 0,
        duration_seconds: c.duration || ((c.end as number) - (c.start as number)) || 0,
        matched_quote: c.matchedQuote || null,
        transcript_segment: c.transcriptSegment || null,
        confidence: c.confidence || null,
        download_url: c.downloadUrl || null,
        thumbnail_url: c.thumbnailUrl || null,
        format: c.format || '16:9',
        captions_burned: c.captionsBurned || false,
      }));
      await sb.from('video_clips').insert(clipRows);
    }

    // Send email notification (best effort)
    try {
      const { data: job } = await sb.from('video_jobs').select('source_filename, user_id, company_id').eq('id', jobId).single();
      if (job?.user_id) {
        const { data: user } = await sb.from('users').select('email, name').eq('id', job.user_id).single();
        if (user?.email) {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.woulfai.com';
          const filename = job.source_filename || 'your video';

          if (status === 'complete') {
            await resend.emails.send({
              from: 'WoulfAI <noreply@woulfai.com>',
              to: [user.email],
              subject: `Your video is ready \u2014 ${filename}`,
              html: `<p>Hi ${user.name || 'there'},</p><p>Your video <strong>${filename}</strong> has finished processing.</p><p><a href="${appUrl}/agents/video-editor/console?job=${jobId}">View Results</a></p>`,
            });
          } else if (status === 'failed') {
            await resend.emails.send({
              from: 'WoulfAI <noreply@woulfai.com>',
              to: [user.email],
              subject: `Video processing failed \u2014 ${filename}`,
              html: `<p>Hi ${user.name || 'there'},</p><p>We encountered an issue processing <strong>${filename}</strong>.</p><p>Error: ${jobError || 'Unknown error'}</p><p><a href="${appUrl}/agents/video-editor/console">Try Again</a></p>`,
            });
          }
        }
      }
    } catch {
      // Email is best-effort, don't fail the callback
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
