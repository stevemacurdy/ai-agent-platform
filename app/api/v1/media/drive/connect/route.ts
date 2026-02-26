/**
 * Agent #22: Drive OAuth — Connect Endpoint
 *
 * Place at: app/api/v1/media/drive/connect/route.ts
 *
 * POST /api/v1/media/drive/connect
 *   Returns { auth_url } — redirect the user here to authorize
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateMediaRequest, requireAdmin, MediaAuthContext } from "@/lib/media-auth";
import crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

export async function POST(req: NextRequest) {
  const authResult = await authenticateMediaRequest(req, "list");
  if (authResult instanceof NextResponse) return authResult;
  const ctx = authResult as MediaAuthContext;

  const adminCheck = requireAdmin(ctx);
  if (adminCheck) return adminCheck;

  // Generate state token (prevents CSRF)
  // Encode company_id + user_id + random nonce
  const nonce = crypto.randomBytes(16).toString("hex");
  const state = Buffer.from(
    JSON.stringify({
      company_id: ctx.companyId,
      user_id: ctx.userId,
      nonce,
    })
  ).toString("base64url");

  // Store nonce temporarily so callback can verify it
  // Using Supabase — could also use a short-lived cookie
  await ctx.supabase.from("media_audit_logs").insert({
    company_id: ctx.companyId,
    user_id: ctx.userId,
    action: "drive_connected",
    details: { nonce, step: "initiated" },
  });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",          // get refresh token
    prompt: "consent",                // always show consent to get refresh token
    state,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  return NextResponse.json({ data: { auth_url: authUrl } });
}
