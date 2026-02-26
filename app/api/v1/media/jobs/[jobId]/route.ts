/**
 * Agent #22: Media API — Job Detail Endpoint
 *
 * Place at: app/api/v1/media/jobs/[jobId]/route.ts
 *
 * GET    /api/v1/media/jobs/:jobId  — Full job detail with files, quotes, clips
 * DELETE /api/v1/media/jobs/:jobId  — Cancel a queued job
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateMediaRequest, MediaAuthContext } from "@/lib/media-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const authResult = await authenticateMediaRequest(req, "list");
  if (authResult instanceof NextResponse) return authResult;
  const ctx = authResult as MediaAuthContext;

  try {
    // Fetch job (RLS ensures company_id match)
    const { data: job, error } = await ctx.supabase
      .from("media_jobs")
      .select("*")
      .eq("id", params.jobId)
      .eq("company_id", ctx.companyId)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Fetch files for this job
    const { data: files } = await ctx.supabase
      .from("media_files")
      .select("*")
      .eq("job_id", params.jobId)
      .eq("company_id", ctx.companyId)
      .order("file_name");

    // Fetch quotes for all files in this job
    const { data: quotes } = await ctx.supabase
      .from("media_quotes")
      .select("*")
      .eq("job_id", params.jobId)
      .eq("company_id", ctx.companyId)
      .order("rank_in_file");

    // Fetch clips for all quotes in this job
    const { data: clips } = await ctx.supabase
      .from("media_clips")
      .select("*")
      .eq("job_id", params.jobId)
      .eq("company_id", ctx.companyId);

    // Generate signed URLs for clips (1 hour expiry)
    const clipsWithUrls = await Promise.all(
      (clips || []).map(async (clip) => {
        const { data: signedData } = await ctx.supabase.storage
          .from("media-clips")
          .createSignedUrl(clip.storage_path, 3600); // 1 hour
        return {
          ...clip,
          signed_url: signedData?.signedUrl || null,
        };
      })
    );

    // Nest: quotes get their clips, files get their quotes
    const clipsByQuote = new Map<string, typeof clipsWithUrls>();
    for (const clip of clipsWithUrls) {
      const existing = clipsByQuote.get(clip.quote_id) || [];
      existing.push(clip);
      clipsByQuote.set(clip.quote_id, existing);
    }

    const quotesByFile = new Map<string, any[]>();
    for (const quote of (quotes || [])) {
      const enrichedQuote = {
        ...quote,
        clips: clipsByQuote.get(quote.id) || [],
      };
      const existing = quotesByFile.get(quote.file_id) || [];
      existing.push(enrichedQuote);
      quotesByFile.set(quote.file_id, existing);
    }

    const enrichedFiles = (files || []).map((file) => ({
      ...file,
      quotes: quotesByFile.get(file.id) || [],
    }));

    return NextResponse.json({
      data: {
        ...job,
        files: enrichedFiles,
      },
    });

  } catch (err) {
    console.error("Job detail error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const authResult = await authenticateMediaRequest(req, "list");
  if (authResult instanceof NextResponse) return authResult;
  const ctx = authResult as MediaAuthContext;

  try {
    // Can only cancel queued jobs
    const { data: job } = await ctx.supabase
      .from("media_jobs")
      .select("id, status")
      .eq("id", params.jobId)
      .eq("company_id", ctx.companyId)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "queued") {
      return NextResponse.json(
        { error: `Cannot cancel a job with status '${job.status}'. Only 'queued' jobs can be cancelled.` },
        { status: 400 }
      );
    }

    const { error } = await ctx.supabase
      .from("media_jobs")
      .update({ status: "cancelled", completed_at: new Date().toISOString() })
      .eq("id", params.jobId)
      .eq("company_id", ctx.companyId);

    if (error) {
      return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 });
    }

    return NextResponse.json({ data: { id: params.jobId, status: "cancelled" } });

  } catch (err) {
    console.error("Cancel job error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
