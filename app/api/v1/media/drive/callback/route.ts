/**
 * Agent #22: Drive OAuth — Callback Endpoint
 *
 * Place at: app/api/v1/media/drive/callback/route.ts
 *
 * GET /api/v1/media/drive/callback?code=...&state=...
 *   Google redirects here after user authorizes.
 *   Exchanges code for tokens, encrypts refresh token, stores in DB.
 *   Redirects user back to portal settings page.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const DRIVE_TOKEN_ENCRYPTION_KEY = process.env.DRIVE_TOKEN_ENCRYPTION_KEY!; // 32-byte hex key
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.woulfai.com";

/**
 * Encrypt a string using AES-256-GCM.
 * Returns base64url encoded: iv (12 bytes) + ciphertext + authTag (16 bytes)
 */
function encryptToken(plaintext: string): string {
  const key = Buffer.from(DRIVE_TOKEN_ENCRYPTION_KEY, "hex"); // 32 bytes
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Pack: iv + ciphertext + authTag
  const packed = Buffer.concat([iv, encrypted, authTag]);
  return packed.toString("base64url");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Handle user denying access
  if (error) {
    return NextResponse.redirect(
      `${APP_URL}/settings/integrations?drive_error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${APP_URL}/settings/integrations?drive_error=missing_params`
    );
  }

  // Decode state
  let stateData: { company_id: string; user_id: string; nonce: string };
  try {
    stateData = JSON.parse(Buffer.from(state, "base64url").toString());
  } catch {
    return NextResponse.redirect(
      `${APP_URL}/settings/integrations?drive_error=invalid_state`
    );
  }

  // Use service role to write tokens (user might not have active session in callback)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Google token exchange failed:", err);
      return NextResponse.redirect(
        `${APP_URL}/settings/integrations?drive_error=token_exchange_failed`
      );
    }

    const tokens = await tokenRes.json();

    if (!tokens.refresh_token) {
      console.error("No refresh token received — user may need to re-authorize with prompt=consent");
      return NextResponse.redirect(
        `${APP_URL}/settings/integrations?drive_error=no_refresh_token`
      );
    }

    // 2. Get Google user email
    const userInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const userInfo = await userInfoRes.json();

    // 3. Encrypt refresh token
    const encryptedRefresh = encryptToken(tokens.refresh_token);

    // 4. Upsert Drive connection
    const { error: upsertError } = await supabase
      .from("company_drive_connections")
      .upsert(
        {
          company_id: stateData.company_id,
          connected_by_user_id: stateData.user_id,
          encrypted_refresh_token: encryptedRefresh,
          access_token: tokens.access_token,
          token_expires_at: new Date(
            Date.now() + (tokens.expires_in || 3600) * 1000
          ).toISOString(),
          google_email: userInfo.email || null,
          is_active: true,
        },
        { onConflict: "company_id" }
      );

    if (upsertError) {
      console.error("Failed to store Drive connection:", upsertError);
      return NextResponse.redirect(
        `${APP_URL}/settings/integrations?drive_error=storage_failed`
      );
    }

    // 5. Audit log
    await supabase.from("media_audit_logs").insert({
      company_id: stateData.company_id,
      user_id: stateData.user_id,
      action: "drive_connected",
      details: {
        google_email: userInfo.email,
        step: "completed",
      },
    });

    // 6. Redirect to success
    return NextResponse.redirect(
      `${APP_URL}/settings/integrations?drive_connected=true`
    );

  } catch (err) {
    console.error("Drive callback error:", err);
    return NextResponse.redirect(
      `${APP_URL}/settings/integrations?drive_error=unexpected`
    );
  }
}
