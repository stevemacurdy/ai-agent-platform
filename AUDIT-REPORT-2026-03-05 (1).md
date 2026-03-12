# WoulfAI Codebase Audit — March 5, 2026

## Summary

The other Claude made **5 commits** trying to fix admin login. Each one modified `lib/auth.ts` (4 times) and `app/login/page.tsx` (2 times). The auth now has multiple overlapping systems that conflict with each other.

**Build status: BROKEN.** `npm run build` fails.

---

## CRITICAL ISSUES (will break production)

### 1. BUILD FAILS — `app/api/admin/comp-agent/route.ts`

```
Error: supabaseUrl is required.
> Build error occurred
Error: Failed to collect page data for /api/admin/comp-agent
```

The file creates a Supabase client at module scope (line 13):
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

Even though it has `export const dynamic = 'force-dynamic'`, Next.js still evaluates this during `Collecting page data`. The env vars are empty at build time so it crashes. This pattern exists in 20+ other route files but comp-agent is the one that dies.

**Fix:** Move the `createClient()` call inside the request handler function, not at module scope.

---

### 2. TWO COMPETING AUTH SYSTEMS

The codebase has **three different auth mechanisms** that don't know about each other:

| System | Where Used | Session Source |
|--------|-----------|----------------|
| `AuthProvider` (components/AuthProvider.tsx) | Dashboard, Settings, Warehouse console | Supabase client `getSession()` → React context |
| `lib/auth.ts` | Login page, authenticated-layout.tsx | localStorage `woulfai_token` + `/api/auth/me` |
| `getSupabaseBrowser()` | AuthGuard, SidebarNav | Supabase browser client `getSession()` |

**What happens:** The login page uses `lib/auth.ts` which calls `/api/auth/login`, stores the token in localStorage, then does `window.location.href = '/admin'`. When `/admin` loads, `AuthGuard` tries `getSupabaseBrowser().auth.getSession()` which may or may not have the session that `lib/auth.ts` just synced via `setSession()`. Meanwhile, `AuthProvider` (used by dashboard) does its own `supabase.auth.getSession()` check independently.

The other Claude added a `setSession()` bridge in `lib/auth.ts` (line 104-112) to sync the server-issued tokens to the browser Supabase client. This is a reasonable fix but it's wrapped in a try-catch that silently fails, and uses a dynamic import of `supabase-browser` which adds latency.

**The core problem:** Three systems reading auth state independently. If any one fails, the user appears logged out even though they're logged in somewhere else.

---

### 3. AuthProvider IS NOT IN THE ROOT LAYOUT

`app/layout.tsx` wraps children with `TenantProvider` and `CompanyProvider` but NOT `AuthProvider`. Yet these pages call `useAuth()`:

- `app/dashboard/page.tsx` — imports `useAuth` from `AuthProvider`
- `app/settings/page.tsx` — imports `useAuth` from `AuthProvider`
- `app/agents/warehouse/console/page.tsx` — imports `useAuth` from `AuthProvider`

Without `AuthProvider` in a parent layout, `useAuth()` returns the default context values: `{ loading: true, profile: null, user: null }`. The dashboard shows a perpetual loading spinner.

**Why it might still work on Vercel:** If the Supabase auth cookie persists and the AuthProvider is somehow initialized elsewhere. But it's fragile and depends on timing.

---

### 4. AGENTS LAYOUT HAS NO AUTH GUARD

```typescript
// app/agents/layout.tsx
import PlatformShell from '@/components/layout/PlatformShell';
import CompanyBanner from '@/components/portal/company-banner';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PlatformShell><><CompanyBanner />{children}</></PlatformShell>;
}
```

No `AuthGuard`. Any unauthenticated user can navigate directly to `/agents/cfo/console` and the page will render. The sidebar will be empty (SidebarNav returns null if no user), but the console content still loads.

Compare to admin layout which correctly uses `AuthGuard`:
```typescript
// app/admin/layout.tsx  
<AuthGuard requiredRole="admin" fallbackUrl="/login">
  <PlatformShell>{children}</PlatformShell>
</AuthGuard>
```

---

### 5. DASHBOARD LAYOUT IS EMPTY

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return children
}
```

No `PlatformShell`, no `AuthGuard`, no `AuthProvider`. When an admin logs in and gets redirected to `/admin`, they get the full shell with sidebar. When a non-admin logs in and gets redirected to `/dashboard`, they get raw content with no sidebar, no navigation, no shell.

---

## MODERATE ISSUES

### 6. Unicode Escapes in JSX (throughout codebase)

**sidebar-nav.tsx** uses `\\uD83C\\uDFE0` (surrogate pairs) instead of actual emoji characters for Dashboard, Portal, Marketplace, Settings, etc. These render correctly but violate the project's own build rules and are fragile.

**Files affected:**
- `components/dashboard/sidebar-nav.tsx` — Home, Portal, Marketplace, Settings icons
- `app/dashboard/page.tsx` — All recommendation icons
- `app/agents/sales/page.tsx` — 12+ emoji references
- `app/agents/sales/console/page.tsx` — Tab icons, recommendation icons
- `app/agents/cfo/finops-pro/page.tsx` — Tab icons, severity indicators
- `app/warehouse/layout.tsx` — All nav icons

### 7. Login Page Has Hardcoded Dev Credentials

```typescript
{ label: 'Steve (Admin)', email: 'steve@woulfgroup.com', pw: 'admin123' },
{ label: 'Marcus (Employee)', email: 'marcus@woulfgroup.com', pw: 'bravo-delta-42' },
{ label: 'Rachel (Org Lead)', email: 'paid@enterprise.com', pw: 'ridge-slate-19' },
{ label: 'Sarah (Beta)', email: 'demo@client1.com', pw: 'nova-peak-55' },
```

Gated behind `process.env.NODE_ENV === 'development'` so it won't show in production, but the passwords are in the source code in plain text in the git history.

### 8. STR Agent Still Fully Active

Despite the plan to set it aside, STR is fully present:
- `app/agents/str/page.tsx` — console page exists
- `app/agents/str/console/page.tsx` — console page exists
- `app/api/agents/str/route.ts` — API route exists
- `lib/demo-agents/str.ts` — demo data exists (17KB)
- It shows in the sidebar if the user has access

### 9. Login Redirect Logic Creates Dead End

```typescript
// app/login/page.tsx
if (role === 'super_admin' || role === 'admin') {
  window.location.href = '/admin';
} else {
  window.location.href = '/dashboard';
}
```

Admin → `/admin` works (has AuthGuard + PlatformShell).
Non-admin → `/dashboard` partially works (has content but no shell/sidebar).

The `/dashboard` page uses `useAuth()` which needs AuthProvider, but AuthProvider isn't in the dashboard layout or root layout.

### 10. Three localStorage Keys for Auth

`lib/auth.ts` writes three separate keys:
1. `woulfai_token` — the JWT access token
2. `woulfai_user` — serialized user profile
3. `woulfai_session` — "legacy bridge" for old pages (written by `writeLegacySession()`)

Plus `AuthProvider` maintains its own state via Supabase's built-in session persistence. Four sources of truth for one auth state.

---

## LOW-PRIORITY ISSUES

### 11. Duplicate API Route Patterns

Several agents have routes at BOTH locations:
- `/api/cfo/route.ts` AND `/api/agents/cfo/route.ts`
- `/api/hr/route.ts` AND `/api/agents/hr/route.ts`
- `/api/seo/route.ts` AND `/api/agents/seo/route.ts`
- `/api/marketing/route.ts` AND `/api/agents/marketing/route.ts`
- (plus 10+ more)

The old routes (under `/api/`) are from earlier builds. The new routes (under `/api/agents/`) are the standard pattern. Both exist and may return different data formats.

### 12. Module-Level Supabase Pattern (fragile)

20+ API routes create Supabase clients at module scope:
```typescript
const supabase = createClient(URL!, KEY!);
```

They all have `export const dynamic = 'force-dynamic'` which usually prevents build-time evaluation, but as comp-agent proves, this isn't reliable. One env var issue during build and any of these could crash.

### 13. SidebarNav Category Mapping Incomplete

`sidebar-nav.tsx` defines `DEPT_ORDER` as:
```typescript
['finance', 'sales', 'marketing', 'operations', 'warehouse', 'hr', 'support', 'legal', 'compliance', 'research']
```

But the agent registry uses categories like `portal`, `people`, etc. Agents with categories not in `DEPT_ORDER` fall into the "uncategorized" bucket at the bottom of the nav.

---

## THE OTHER CLAUDE'S CHANGES (5 commits)

### Commit 1: `fc89083` — "super_admin + admin redirect to /admin after login"
- Modified `app/login/page.tsx`
- Added role check to redirect admins to `/admin` and others to `/dashboard`
- **Impact:** Reasonable change, but created the dead-end for non-admin users landing on `/dashboard` without a shell.

### Commit 2: `74e20f9` — "sync session to browser Supabase client after login"
- Modified `lib/auth.ts`
- Added `getSupabaseBrowser().auth.setSession()` call after login
- **Impact:** Attempted to bridge `lib/auth.ts` login with the Supabase browser client that `AuthGuard` and `SidebarNav` use. Good intent, but wrapped in try-catch that silently fails.

### Commit 3: `6514ed8` — "login via browser Supabase client (fixes auth loop)"
- Modified `components/auth/AuthGuard.tsx` — Added localStorage token fallback
- Modified `components/dashboard/sidebar-nav.tsx` — Added localStorage token fallback
- Modified `lib/auth.ts` — More bridge changes
- Added `lib/demo-agents/3pl-portal.ts` (unrelated to auth fix)
- **Impact:** Made AuthGuard and SidebarNav try localStorage token after Supabase session fails. This is the key bridge that keeps things working, but it means both components now have two code paths for auth.

### Commit 4: `f2e10fd` — "server login + client session sync + localStorage fallback"
- Modified `lib/auth.ts` only
- More refinements to the session sync logic
- **Impact:** Incremental fix. The repeated modifications suggest trial-and-error debugging.

### Commit 5: `38100d6` — "await setSession + full page redirect after login"
- Modified `app/login/page.tsx` — Changed `router.push()` to `window.location.href`
- Modified `lib/auth.ts` — Added await on `setSession()` call
- **Impact:** `window.location.href` forces a full page reload which clears React state and forces everything to re-initialize. This is a brute-force fix that avoids the real problem (competing auth systems) by making the browser start fresh.

---

## WHAT NEEDS TO HAPPEN

### Immediate (fix the build):
1. Move module-level `createClient()` inside request handlers in `app/api/admin/comp-agent/route.ts` (and ideally all 20+ routes that do this)

### Short-term (fix auth):
2. Pick ONE auth system and remove the others. Recommendation: Keep `AuthProvider` since it's already React-context-based, remove `lib/auth.ts` standalone functions, and update the login page to use `AuthProvider`'s `signIn()` method
3. Add `AuthProvider` to the root layout (or to a shared authenticated layout)
4. Add `AuthGuard` to the agents layout
5. Fix the dashboard layout to include `PlatformShell`

### Medium-term (clean up):
6. Replace all unicode escapes with actual emoji characters
7. Consolidate duplicate API routes (pick `/api/agents/[slug]` pattern, deprecate `/api/[slug]`)
8. Remove or comment out STR agent from sidebar and demo registry
9. Remove hardcoded dev credentials from login page source
10. Consolidate three localStorage keys into one

---

## FILE INVENTORY

### Files Modified by Other Claude (in fix commits only):
- `lib/auth.ts` (4 times)
- `app/login/page.tsx` (2 times)
- `components/auth/AuthGuard.tsx` (1 time)
- `components/dashboard/sidebar-nav.tsx` (1 time)

### Files NOT Touched (but affected by the auth changes):
- `components/AuthProvider.tsx` — Still the context-based auth, untouched but competing
- `components/authenticated-layout.tsx` — Uses `lib/auth.ts`, untouched
- `app/admin/layout.tsx` — Uses AuthGuard, untouched
- `app/agents/layout.tsx` — Has no auth guard, untouched
- `app/dashboard/layout.tsx` — Empty pass-through, untouched
- `app/layout.tsx` — Root layout, no AuthProvider, untouched
