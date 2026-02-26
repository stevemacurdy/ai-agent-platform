/**
 * Agent #22: Media API — Auth & Rate Limit Middleware
 *
 * Place in your existing app: src/lib/media-auth.ts
 *
 * Extracts company_id from JWT, enforces rate limits,
 * and provides typed request context.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Simple in-memory rate limiter (use Upstash Redis in production for multi-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "create_job": { max: 5, windowMs: 3600000 },      // 5 jobs/hour per company
  "list":       { max: 60, windowMs: 60000 },         // 60 reads/min
  "download":   { max: 100, windowMs: 60000 },        // 100 downloads/min
};

export interface MediaAuthContext {
  userId: string;
  companyId: string;
  userRole: string;       // from JWT claims — e.g. "admin", "user"
  supabase: ReturnType<typeof createClient>;
}

/**
 * Authenticate a media API request and return context.
 * Returns null + sends error response if auth fails.
 */
export async function authenticateMediaRequest(
  req: NextRequest,
  rateLimitAction: string = "list"
): Promise<MediaAuthContext | NextResponse> {

  // 1. Extract auth token
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid authorization header" },
      { status: 401 }
    );
  }
  const token = authHeader.substring(7);

  // 2. Create Supabase client with user's token
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  // 3. Verify user
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // 4. Extract company_id from JWT claims
  // Assumes your JWT includes company_id and role in app_metadata or custom claims
  const companyId = user.app_metadata?.company_id
    || user.user_metadata?.company_id;
  const userRole = user.app_metadata?.role
    || user.user_metadata?.role
    || "user";

  if (!companyId) {
    return NextResponse.json(
      { error: "User is not associated with a company" },
      { status: 403 }
    );
  }

  // 5. Rate limiting
  const rateLimitConfig = RATE_LIMITS[rateLimitAction] || RATE_LIMITS.list;
  const rateLimitKey = `${rateLimitAction}:${companyId}`;
  const now = Date.now();

  let entry = rateLimitMap.get(rateLimitKey);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + rateLimitConfig.windowMs };
    rateLimitMap.set(rateLimitKey, entry);
  }

  entry.count++;
  if (entry.count > rateLimitConfig.max) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  return {
    userId: user.id,
    companyId,
    userRole,
    supabase,
  };
}

/**
 * Check if user has admin role (required for some actions like Drive setup).
 */
export function requireAdmin(ctx: MediaAuthContext): NextResponse | null {
  if (ctx.userRole !== "admin" && ctx.userRole !== "company_admin") {
    return NextResponse.json(
      { error: "This action requires company admin privileges" },
      { status: 403 }
    );
  }
  return null;
}
