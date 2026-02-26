/**
 * Agent #22: Media API — Clip Download Endpoint
 *
 * Place at: app/api/v1/media/clips/[clipId]/download/route.ts
 *
 * GET /api/v1/media/clips/:clipId/download  — Generate signed download URL
 *
 * Returns a short-lived signed URL for the clip.
 * Logs the download in audit_logs.
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateMediaRequest, MediaAuthContext } from "@/lib/media-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { clipId: string } }
) {
  const authResult = await authenticateMediaRequest(req, "download");
  if (authResult instanceof NextResponse) return authResult;
  const ctx = authResult as MediaAuthContext;

  try {
    // Fetch clip (RLS ensures company_id match)
    const { data: clip, error } = await ctx.supabase
      .from("media_clips")
      .select("id, storage_path, file_name, clip_type, company_id, job_id, file_id")
      .eq("id", params.clipId)
      .eq("company_id", ctx.companyId)
      .single();

    if (error || !clip) {
      return NextResponse.json({ error: "Clip not found" }, { status: 404 });
    }

    // Generate signed URL (15 minute expiry for downloads)
    const { data: signedData, error: storageError } = await ctx.supabase.storage
      .from("media-clips")
      .createSignedUrl(clip.storage_path, 900); // 15 minutes

    if (storageError || !signedData?.signedUrl) {
      console.error("Signed URL error:", storageError);
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      );
    }

    // Audit log
    await ctx.supabase.from("media_audit_logs").insert({
      company_id: ctx.companyId,
      user_id: ctx.userId,
      job_id: clip.job_id,
      file_id: clip.file_id,
      clip_id: clip.id,
      action: "clip_downloaded",
      details: {
        clip_type: clip.clip_type,
        file_name: clip.file_name,
      },
    });

    return NextResponse.json({
      data: {
        download_url: signedData.signedUrl,
        file_name: clip.file_name,
        expires_in_seconds: 900,
      },
    });

  } catch (err) {
    console.error("Clip download error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
