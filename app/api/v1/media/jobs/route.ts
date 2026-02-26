/**
 * Agent #22: Media API — Jobs Endpoint
 *
 * Place at: app/api/v1/media/jobs/route.ts
 *
 * POST /api/v1/media/jobs  — Create extraction job
 * GET  /api/v1/media/jobs  — List jobs (company-scoped)
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateMediaRequest, MediaAuthContext } from "@/lib/media-auth";
import type { CreateJobRequest, MediaJobStatus } from "@/types/media";

// --- POST: Create Job ---
export async function POST(req: NextRequest) {
  const authResult = await authenticateMediaRequest(req, "create_job");
  if (authResult instanceof NextResponse) return authResult;
  const ctx = authResult as MediaAuthContext;

  try {
    const body: CreateJobRequest = await req.json();

    // Validate input
    if (!body.drive_folder_id && (!body.drive_file_ids || body.drive_file_ids.length === 0)) {
      return NextResponse.json(
        { error: "Provide either drive_folder_id or drive_file_ids" },
        { status: 400 }
      );
    }

    if (body.drive_file_ids && body.drive_file_ids.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 files per job" },
        { status: 400 }
      );
    }

    if (body.max_quotes_per_file && (body.max_quotes_per_file < 1 || body.max_quotes_per_file > 15)) {
      return NextResponse.json(
        { error: "max_quotes_per_file must be between 1 and 15" },
        { status: 400 }
      );
    }

    if (body.clip_padding_seconds && (body.clip_padding_seconds < 0 || body.clip_padding_seconds > 5)) {
      return NextResponse.json(
        { error: "clip_padding_seconds must be between 0 and 5" },
        { status: 400 }
      );
    }

    // Check company has Drive connected
    const { data: driveConn } = await ctx.supabase
      .from("company_drive_connections")
      .select("id, is_active")
      .eq("company_id", ctx.companyId)
      .single();

    if (!driveConn?.is_active) {
      return NextResponse.json(
        { error: "Google Drive is not connected for your company. Connect it in Settings." },
        { status: 400 }
      );
    }

    // Idempotency check
    if (body.idempotency_key) {
      const { data: existing } = await ctx.supabase
        .from("media_jobs")
        .select("id, status")
        .eq("company_id", ctx.companyId)
        .eq("idempotency_key", body.idempotency_key)
        .single();

      if (existing) {
        return NextResponse.json({
          data: existing,
          message: "Job already exists with this idempotency key",
        });
      }
    }

    // Create job
    const { data: job, error } = await ctx.supabase
      .from("media_jobs")
      .insert({
        company_id: ctx.companyId,
        created_by_user_id: ctx.userId,
        status: "queued",
        quote_criteria: body.quote_criteria || "client testimonial quotes highlighting results, satisfaction, or transformation",
        max_quotes_per_file: body.max_quotes_per_file || 10,
        clip_padding_seconds: body.clip_padding_seconds || 1.5,
        context_notes: body.context_notes || null,
        drive_folder_id: body.drive_folder_id || null,
        drive_file_ids: body.drive_file_ids || null,
        idempotency_key: body.idempotency_key || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create job:", error);
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 }
      );
    }

    // Audit log (insert via RPC or direct — worker will also log)
    await ctx.supabase.from("media_audit_logs").insert({
      company_id: ctx.companyId,
      user_id: ctx.userId,
      job_id: job.id,
      action: "job_created",
      details: {
        drive_folder_id: body.drive_folder_id,
        file_count: body.drive_file_ids?.length || "folder",
        quote_criteria: body.quote_criteria,
      },
    });

    return NextResponse.json({ data: job }, { status: 201 });

  } catch (err) {
    console.error("Create job error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --- GET: List Jobs ---
export async function GET(req: NextRequest) {
  const authResult = await authenticateMediaRequest(req, "list");
  if (authResult instanceof NextResponse) return authResult;
  const ctx = authResult as MediaAuthContext;

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") as MediaJobStatus | null;
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = Math.min(parseInt(url.searchParams.get("per_page") || "20", 10), 50);
    const offset = (page - 1) * perPage;

    let query = ctx.supabase
      .from("media_jobs")
      .select("*", { count: "exact" })
      .eq("company_id", ctx.companyId)  // redundant with RLS but explicit
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: jobs, count, error } = await query;

    if (error) {
      console.error("List jobs error:", error);
      return NextResponse.json(
        { error: "Failed to list jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: jobs,
      total: count || 0,
      page,
      per_page: perPage,
    });

  } catch (err) {
    console.error("List jobs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
