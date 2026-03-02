// ============================================================================
// AUTH WRAPPERS FOR ALL 9 CRUD ROUTES
// ============================================================================
// 
// HOW TO APPLY:
// 1. Copy lib/api-auth.ts into your repo at lib/api-auth.ts
// 2. For each route below, add the imports and wrap functions as shown
// 3. Use supabaseAdmin() instead of getSupabaseClient() for server routes
//
// PATTERN SUMMARY:
//   Route                    GET          POST         PUT/PATCH    DELETE
//   ─────────────────────    ──────────   ──────────   ──────────   ──────────
//   /agents/bundles          public*      admin        admin        admin
//   /agents/permissions      admin        admin        -            admin
//   /agents/modules          token        admin        admin        admin
//   /agents/events           token        admin        admin        admin
//   /agents/dependencies     token        admin        -            admin
//   /agents/integrations-req token        admin        -            admin
//   /agents/webhooks         token+co     token+co     token+co     admin
//   /agents/usage            token+co     token+co     -            -
//   /agents/audit            admin        -            -            -
//
//   * bundles GET is public because pricing page needs it unauthenticated
//   token    = any logged-in user (verifyToken)
//   admin    = super_admin or admin role (verifyAdmin)
//   token+co = logged-in user, scoped to their company_id
//
// ============================================================================


// ────────────────────────────────────────────────────────────────────────────
// 1. agents-bundles-route.ts
//    GET: PUBLIC (pricing page needs it), POST: admin only
// ────────────────────────────────────────────────────────────────────────────

// ADD at top:
// import { verifyAdmin } from '@/lib/api-auth';
// import { createClient } from '@supabase/supabase-js';
// function supabaseAdmin() {
//   return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
//     { auth: { autoRefreshToken: false, persistSession: false } });
// }

// GET stays as-is (public for pricing page)
// REPLACE getSupabaseClient() with supabaseAdmin() in GET to avoid anon key exposure

// WRAP POST with:
/*
export async function POST(request: NextRequest) {
  const result = await verifyAdmin(request);
  if (!result.authorized) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  // ... existing POST body unchanged, replace getSupabaseClient() with supabaseAdmin() ...
}
*/


// ────────────────────────────────────────────────────────────────────────────
// 2. agents-permissions-route.ts  →  SEE agents-permissions-route.ts (full file)
//    ALL operations: admin only
// ────────────────────────────────────────────────────────────────────────────


// ────────────────────────────────────────────────────────────────────────────
// 3. agents-modules-route.ts
//    GET: any authenticated user, POST/PUT/DELETE: admin only
// ────────────────────────────────────────────────────────────────────────────

// ADD at top:
// import { verifyToken, verifyAdmin, unauthorized } from '@/lib/api-auth';

// WRAP GET:
/*
export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return unauthorized();
  // ... existing GET body ...
}
*/

// WRAP POST:
/*
export async function POST(request: NextRequest) {
  const result = await verifyAdmin(request);
  if (!result.authorized) return NextResponse.json({ error: result.error }, { status: result.status });
  // ... existing POST body ...
}
*/


// ────────────────────────────────────────────────────────────────────────────
// 4. agents-events-route.ts
//    GET: any authenticated user, POST: admin only
// ────────────────────────────────────────────────────────────────────────────

// Same pattern as modules: verifyToken on GET, verifyAdmin on POST


// ────────────────────────────────────────────────────────────────────────────
// 5. agents-dependencies-route.ts
//    GET: any authenticated user, POST: admin only
// ────────────────────────────────────────────────────────────────────────────

// Same pattern as modules


// ────────────────────────────────────────────────────────────────────────────
// 6. agents-integrations-req-route.ts
//    GET: any authenticated user, POST: admin only
// ────────────────────────────────────────────────────────────────────────────

// Same pattern as modules


// ────────────────────────────────────────────────────────────────────────────
// 7. agents-webhooks-route.ts
//    GET/POST/PUT: authenticated + company-scoped, DELETE: admin only
// ────────────────────────────────────────────────────────────────────────────

// ADD at top:
// import { verifyToken, verifyAdmin, unauthorized, getCompanyId } from '@/lib/api-auth';

// WRAP GET (company-scoped):
/*
export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return unauthorized();
  const companyId = getCompanyId(request, user);
  if (!companyId) return NextResponse.json({ error: 'No company context' }, { status: 400 });

  const sb = supabaseAdmin();
  // ADD: .eq('company_id', companyId) to the query
  // ... existing logic, but filter by companyId ...
}
*/

// WRAP POST (company-scoped):
/*
export async function POST(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return unauthorized();
  const companyId = getCompanyId(request, user);
  if (!companyId) return NextResponse.json({ error: 'No company context' }, { status: 400 });

  const body = await request.json();
  // Force company_id from auth context, not from request body
  body.company_id = companyId;
  // ... existing insert logic ...
}
*/

// WRAP DELETE (admin only):
/*
export async function DELETE(request: NextRequest) {
  const result = await verifyAdmin(request);
  if (!result.authorized) return NextResponse.json({ error: result.error }, { status: result.status });
  // ... existing DELETE body ...
}
*/


// ────────────────────────────────────────────────────────────────────────────
// 8. agents-usage-route.ts
//    GET/POST: authenticated + company-scoped
// ────────────────────────────────────────────────────────────────────────────

// ADD at top:
// import { verifyToken, unauthorized, getCompanyId } from '@/lib/api-auth';

// WRAP GET:
/*
export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return unauthorized();
  const companyId = getCompanyId(request, user);
  if (!companyId) return NextResponse.json({ error: 'No company context' }, { status: 400 });
  // ADD: filter queries by companyId (don't let users see other companies' usage)
  // ... existing logic ...
}
*/

// WRAP POST:
/*
export async function POST(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return unauthorized();
  const companyId = getCompanyId(request, user);
  if (!companyId) return NextResponse.json({ error: 'No company context' }, { status: 400 });
  // Force company context from auth
  // ... existing logic ...
}
*/


// ────────────────────────────────────────────────────────────────────────────
// 9. agents-audit-route.ts
//    GET: admin only (audit logs are sensitive)
//    No POST/PUT/DELETE (audit logs are append-only by other routes)
// ────────────────────────────────────────────────────────────────────────────

// ADD at top:
// import { verifyAdmin } from '@/lib/api-auth';

// WRAP GET:
/*
export async function GET(request: NextRequest) {
  const result = await verifyAdmin(request);
  if (!result.authorized) return NextResponse.json({ error: result.error }, { status: result.status });
  // ... existing GET body unchanged ...
}
*/


// ============================================================================
// ADDITIONAL FIX: Replace getSupabaseClient() in ALL routes
// ============================================================================
//
// PROBLEM: getSupabaseClient() uses NEXT_PUBLIC_SUPABASE_ANON_KEY which is
// the public key. In server routes, this means queries go through RLS.
// Some routes need SERVICE_ROLE_KEY to bypass RLS (e.g., cross-company admin queries).
//
// FIX: In every API route file, replace:
//   import { getSupabaseClient } from '@/lib/supabase';
//   const sb = getSupabaseClient();
//
// WITH:
//   import { createClient } from '@supabase/supabase-js';
//   function supabaseAdmin() {
//     return createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.SUPABASE_SERVICE_ROLE_KEY!,
//       { auth: { autoRefreshToken: false, persistSession: false } }
//     );
//   }
//   const sb = supabaseAdmin();
//
// This is already done in /api/auth/me and /api/admin/manage-agents.
// The CRUD routes still use the anon key, which works by accident since
// most tables don't have RLS enabled yet. Once you enable RLS, these
// routes will silently return empty results.
// ============================================================================
