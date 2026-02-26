/**
 * Agent #22: Media API — Google Drive OAuth
 *
 * Place at: app/api/v1/media/drive/route.ts
 *
 * GET  /api/v1/media/drive           — Get current Drive connection status
 * POST /api/v1/media/drive/connect   — Initiate OAuth flow (returns redirect URL)
 * GET  /api/v1/media/drive/callback  — OAuth callback handler
 * DELETE /api/v1/media/drive         — Disconnect Drive
 *
 * IMPORTANT: This uses Google OAuth2 "Web Application" credentials (not Desktop).
 * Set up in Google Cloud Console:
 *   - Application type: Web application
 *   - Authorized redirect URI: https://yourdomain.com/api/v1/media/drive/callback
 *
 * Environment variables:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REDIRECT_URI (the callback URL above)
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateMediaRequest, requireAdmin, MediaAuthContext } from "@/lib/media-auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",  // read-only: least privilege
  "https://www.googleapis.com/auth/userinfo.email",
];

// --- GET: Connection status ---
export async function GET(req: NextRequest) {
  const authResult = await authenticateMediaRequest(req, "list");
  if (authResult instanceof NextResponse) return authResult;
  const ctx = authResult as MediaAuthContext;

  const { data: connection } = await ctx.supabase
    .from("company_drive_connections")
    .select("id, google_email, root_folder_id, root_folder_name, is_active, last_synced_at, created_at")
    .eq("company_id", ctx.companyId)
    .single();

  return NextResponse.json({
    data: connection
      ? { connected: true, ...connection }
      : { connected: false },
  });
}

// --- DELETE: Disconnect Drive ---
export async function DELETE(req: NextRequest) {
  const authResult = await authenticateMediaRequest(req, "list");
  if (authResult instanceof NextResponse) return authResult;
  const ctx = authResult as MediaAuthContext;

  const adminCheck = requireAdmin(ctx);
  if (adminCheck) return adminCheck;

  const { error } = await ctx.supabase
    .from("company_drive_connections")
    .update({
      is_active: false,
      access_token: null,
      encrypted_refresh_token: "REVOKED",
    })
    .eq("company_id", ctx.companyId);

  if (error) {
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  await ctx.supabase.from("media_audit_logs").insert({
    company_id: ctx.companyId,
    user_id: ctx.userId,
    action: "drive_disconnected",
  });

  return NextResponse.json({ data: { disconnected: true } });
}
