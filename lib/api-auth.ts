// ============================================================================
// WoulfAI Server-Side Auth — Drop-in for API Routes
// ============================================================================
// USE: import { verifyToken, verifyAdmin, unauthorized, forbidden } from '@/lib/api-auth';
//
// This mirrors the exact auth pattern from /api/auth/me/route.ts
// Uses SUPABASE_SERVICE_ROLE_KEY to verify Bearer tokens server-side.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// --- Types ------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  company_id: string | null;
}

interface AuthResult {
  authorized: true;
  user: AuthUser;
}

interface AuthError {
  authorized: false;
  error: string;
  status: number;
}

// --- Supabase Admin Client (service role, bypasses RLS) ---------------------

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// --- Core: Verify Bearer Token → AuthUser -----------------------------------
// Use this for any route that needs a logged-in user.
//
//   const user = await verifyToken(req);
//   if (!user) return unauthorized();
//

export async function verifyToken(req: NextRequest): Promise<AuthUser | null> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;

  try {
    const sb = supabaseAdmin();
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return null;

    const { data: profile } = await sb
      .from('profiles')
      .select('role, full_name, company_id')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      role: profile?.role || 'employee',
      full_name: profile?.full_name || null,
      company_id: profile?.company_id || null,
    };
  } catch {
    return null;
  }
}

// --- Verify Admin (super_admin or admin role) --------------------------------
// Use for routes that should only be accessible to platform admins.
//
//   const result = await verifyAdmin(req);
//   if (!result.authorized) return NextResponse.json({ error: result.error }, { status: result.status });
//   const { user } = result;
//

export async function verifyAdmin(req: NextRequest): Promise<AuthResult | AuthError> {
  const user = await verifyToken(req);
  if (!user) return { authorized: false, error: 'Missing or invalid token', status: 401 };
  if (user.role !== 'super_admin' && user.role !== 'admin') {
    return { authorized: false, error: 'Admin access required', status: 403 };
  }
  return { authorized: true, user };
}

// --- Verify Company Admin (company_admin, admin, or super_admin) -------------
// Use for routes where company admins can manage their own company's data.

export async function verifyCompanyAdmin(req: NextRequest): Promise<AuthResult | AuthError> {
  const user = await verifyToken(req);
  if (!user) return { authorized: false, error: 'Missing or invalid token', status: 401 };
  if (!['super_admin', 'admin', 'company_admin'].includes(user.role)) {
    return { authorized: false, error: 'Company admin access required', status: 403 };
  }
  return { authorized: true, user };
}

// --- Extract Company ID from request ----------------------------------------
// Priority: user profile → x-company-id header → query param → null

export function getCompanyId(req: NextRequest, user: AuthUser): string | null {
  // User's own company first
  if (user.company_id) return user.company_id;
  // Header override (admin use case)
  const header = req.headers.get('x-company-id');
  if (header) return header;
  // Query param fallback
  const param = req.nextUrl.searchParams.get('companyId') || req.nextUrl.searchParams.get('company_id');
  return param || null;
}

// --- Quick Response Helpers -------------------------------------------------

export function unauthorized(message = 'Authentication required') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Insufficient permissions') {
  return NextResponse.json({ error: message }, { status: 403 });
}
