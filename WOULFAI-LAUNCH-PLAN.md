# WoulfAI Enterprise Launch Readiness Plan

**Prepared for:** Steve Macurdy, Woulf Group
**Date:** February 24, 2026
**Platform:** Next.js 14 + Supabase + Vercel | Multi-tenant SaaS | 21 AI agents
**Risk profile:** Financial data, multi-company isolation, 20-year brand reputation

---

## Phase A: Launch-Safe Baseline (14 days)

Everything below must be done before accepting real customer data or charging money.

---

### A1. Tenant Isolation Proof

**Why:** A single cross-tenant data leak destroys trust permanently. This is your #1 existential risk.

**Done means:**
- Every API route that touches tenant-scoped data filters by the authenticated user's company_id
- A dedicated test suite creates two tenants, seeds identical data, and proves neither can read/write/delete the other's records
- RLS policies on every tenant-scoped Supabase table (`company_members`, `user_agent_access`, chat sessions, financial data) are verified to deny cross-tenant access even with a valid JWT from another tenant

**Verification:**
```bash
# Create test script: tenant-isolation-test.js
# 1. Create Tenant A user + Tenant B user via API
# 2. Authenticate as Tenant A
# 3. Attempt to read Tenant B's company_members → expect 0 rows
# 4. Attempt to read Tenant B's agent access → expect 0 rows
# 5. Attempt to call /api/portal/members with Tenant B's company_id → expect 403 or empty
# 6. Repeat inverse
# 7. All assertions must pass
node tenant-isolation-test.js
```

**Owner:** Dev + Security | **Effort:** M

---

### A2. Secrets Rotation + Management

**Why:** Dev passwords were in production code. Assume they're compromised.

**Done means:**
- All Supabase keys rotated (anon key, service role key) via Supabase dashboard → Settings → API
- All Stripe keys rotated (dashboard.stripe.com → Developers → API keys)
- `lib/auth-store.ts` contains zero hardcoded credentials (dev user objects removed entirely, not replaced with 'REMOVED')
- No file in the repo contains a real secret outside `.env.local` (which is .gitignored)
- Vercel env vars updated with new keys
- `.env.local` never committed (verify with `git log --all -p -- .env*`)

**Verification:**
```bash
# Scan for leaked secrets
grep -rn "sk_live\|sk_test\|eyJhbG\|admin123\|bravo-delta\|ridge-slate\|nova-peak\|REMOVED" --include="*.ts" --include="*.tsx" --include="*.js" .
# Expected: zero results (excluding node_modules)

# Verify .env.local is gitignored
git status .env.local  # should show nothing
```

**Owner:** Security | **Effort:** S

---

### A3. Auth on Every Endpoint

**Why:** Seven admin routes had zero auth before this week. We need to verify coverage is now complete and that the guards actually work (not just present in code).

**Done means:**
- Every `/api/admin/*` route returns 401 when called without a valid Bearer token
- Every `/api/admin/*` route returns 401 when called with a non-admin user's token
- Every `/api/portal/*` route returns 401 without auth
- `/api/auth/register` and `/api/auth/login` are the only public POST endpoints
- Stripe webhook route validates Stripe signature (not just open)

**Verification:**
```bash
# Hit every admin route without auth
for route in comp-agent companies create-user delete-user invite-user invites manage-agents pricing reset-password sales-reps update-role users bundles; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.woulfai.com/api/admin/$route)
  echo "$route: $STATUS"  # All should be 401
done
```

**Owner:** Dev | **Effort:** S

---

### A4. Supabase RLS Verification

**Why:** Service role key bypasses RLS. Every route using it must be intentional and audited. Any route that doesn't need it should use the anon key + user JWT instead.

**Done means:**
- Inventory of every route using `SUPABASE_SERVICE_ROLE_KEY` with justification documented
- Routes that only read user-scoped data switched to anon client + JWT where possible
- RLS policies enabled on ALL tables (check via Supabase dashboard → Database → Tables → each table → RLS toggle)
- No table has RLS disabled unless explicitly documented as "public read" with justification

**Verification:**
```sql
-- Run in Supabase SQL editor
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
-- Every row should show rowsecurity = true
```

**Owner:** Security | **Effort:** M

---

### A5. Security Headers + Cookie Config

**Why:** Basic web security hygiene. Without these, you're vulnerable to XSS, clickjacking, and session theft.

**Done means:**
- `next.config.js` includes security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (disable camera, mic, geolocation), `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Supabase auth cookies set with `httpOnly`, `secure`, `sameSite: lax`
- CSP header in report-only mode initially (too aggressive = breaks things; report-only lets you tune)

**Verification:**
```bash
curl -sI https://www.woulfai.com | grep -i "x-frame\|x-content-type\|strict-transport\|referrer-policy"
# All four headers should be present
```

**Owner:** Dev | **Effort:** S

---

### A6. Rate Limiting on Auth + Expensive Endpoints

**Why:** Without rate limiting, anyone can brute-force passwords or spam your AI agent endpoints (which cost money per call).

**Done means:**
- `/api/auth/login` limited to 10 requests/minute per IP
- `/api/auth/register` limited to 5 requests/minute per IP
- `/api/auth/forgot-password` limited to 3 requests/minute per IP
- All `/api/agents/*` POST endpoints limited to 20 requests/minute per user
- Vercel's built-in WAF or `@vercel/edge` rate limiting middleware, or Upstash Redis rate limiter

**Verification:**
```bash
# Fire 15 login attempts rapidly
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code} " -X POST https://www.woulfai.com/api/auth/login \
    -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'
done
# Last several should return 429
```

**Owner:** Dev | **Effort:** M

---

### A7. Sentry Error Tracking

**Why:** Right now, when something breaks in production, you find out when a user complains. That's unacceptable for enterprise.

**Done means:**
- Sentry SDK installed and initialized in `app/layout.tsx` (client) and `instrumentation.ts` (server)
- Errors include user ID and tenant ID (but NOT passwords, tokens, or PII in breadcrumbs)
- Source maps uploaded to Sentry on each deploy
- Alert rule: any new error → Slack/email notification within 5 minutes

**Verification:**
```bash
# Trigger a test error
curl https://www.woulfai.com/api/sentry-test
# Check Sentry dashboard for the event within 60 seconds
```

**Owner:** Dev | **Effort:** S

---

### A8. Audit Logging for Sensitive Actions

**Why:** When a customer asks "who accessed my data?" you need an answer. Also required for SOC 2 if you ever pursue it.

**Done means:**
- New `audit_logs` table in Supabase: `id, timestamp, user_id, company_id, action, resource_type, resource_id, ip_address, metadata`
- Logged actions: user login, password reset, user created/deleted, role changed, agent access granted/revoked, company member added/removed, financial data accessed
- Logs are append-only (no UPDATE or DELETE permissions on the table, enforced via RLS)
- Admin UI page to view audit logs (filterable by user, company, action, date range)

**Verification:**
```sql
-- After performing a test action
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 5;
-- Should show the action with correct user_id, company_id, action type
```

**Owner:** Dev | **Effort:** M

---

### A9. Vercel Preview Deploy Workflow

**Why:** Deploying directly to prod with `vercel --prod` is how we broke the login page three times today. Never again.

**Done means:**
- Every deploy goes to a preview URL first: `vercel` (no `--prod` flag)
- You click through login → admin → portal → one agent on the preview URL
- Only then: `vercel --promote` to push preview to production
- Document this as a 3-step checklist pinned in your workflow

**Verification:** The workflow itself is the verification. First deploy without `--prod`, verify, then promote.

**Owner:** Ops | **Effort:** S

---

### A10. Critical Path Tests (15 tests)

**Why:** These catch regressions before they ship. They're the minimum set that, if passing, means the core product works.

**Done means:**
A test file (Jest or Vitest) that covers:

1. `POST /api/auth/login` with valid creds → 200 + session token
2. `POST /api/auth/login` with wrong password → 401
3. `GET /api/admin/users` without auth → 401
4. `GET /api/admin/users` with admin token → 200 + user list
5. `GET /api/admin/users` with non-admin token → 401
6. `POST /api/admin/create-user` → creates user + profile row
7. `POST /api/admin/delete-user` → removes user from auth + profiles
8. `GET /api/portal/companies` without auth → 401
9. `GET /api/portal/companies` with auth → returns only user's companies
10. Cross-tenant read attempt → 0 results or 403
11. Password reset flow → clears `must_reset_password` flag
12. Admin login → redirects to `/admin` (not `/portal`)
13. Non-admin login → redirects to `/portal`
14. `POST /api/agents/cfo` with auth → returns response (agent works)
15. Stripe webhook with invalid signature → 400

**Verification:**
```bash
npm test
# 15/15 passing
```

**Owner:** Dev | **Effort:** L

---

### A11. Encryption Verification

**Why:** Financial data in transit and at rest must be encrypted. Confirm defaults are correct.

**Done means:**
- Vercel enforces HTTPS (it does by default — verify with redirect test)
- Supabase database encryption at rest is enabled (it is by default on all plans — confirm in dashboard)
- No sensitive data stored in localStorage (audit found 4 instances — migrate to httpOnly cookies or remove)
- Supabase connection string uses SSL (`?sslmode=require`)

**Verification:**
```bash
# Verify HTTPS redirect
curl -sI http://www.woulfai.com | head -5
# Should show 301/308 redirect to https

# Verify no mixed content
# Open Chrome DevTools → Console → look for mixed content warnings
```

**Owner:** Security | **Effort:** S

---

### A12. Backup + Restore Drill

**Why:** If the database corrupts or you accidentally drop a table, you need to recover. Test this BEFORE it matters.

**Done means:**
- Supabase daily backups confirmed enabled (Pro plan: daily, 7-day retention)
- One manual backup/restore drill completed: export a table, drop it, restore from backup
- RPO target documented: 24 hours (acceptable for launch; tighten later)
- RTO target documented: 4 hours (manual restore from Supabase dashboard)

**Verification:**
```sql
-- Test on a non-critical table in a staging project (not prod)
-- Export → Drop → Restore → Verify row count matches
```

**Owner:** Ops | **Effort:** S

---

### A13. Fix Remaining Syntax Issues (8 files)

**Why:** Mismatched braces mean code paths may silently fail or dead code may mask bugs.

**Done means:**
- These 8 files have balanced braces/parens and compile without errors:
  - `app/agents/sales/intel/page.tsx`
  - `app/api/chat/route.ts`
  - `app/forgot-password/page.tsx`
  - `app/invite/[token]/page.tsx`
  - `app/portal/agent/hr/page.tsx`
  - `app/s/[slug]/page.tsx`
  - `app/sales/settings/page.tsx`
  - `components/AdminLeaderboard.tsx`
  - `components/LeadCaptureModal.tsx`
  - `components/onboarding/MagicMapper.tsx`

Note: The brace counter may report false positives on JSX files with template literals. Verify by checking that `npm run build` produces zero errors and these pages render correctly.

**Verification:**
```bash
npm run build  # zero errors
# Visit each page in browser and verify it renders
```

**Owner:** Dev | **Effort:** M

---

### A14. Supabase SMTP → Resend

**Why:** User invites, password resets, and transactional emails don't work without this.

**Done means:**
- Supabase Auth → SMTP settings configured with Resend credentials
- Password reset email sends and delivers
- User invite email sends and delivers
- From address is `noreply@woulfai.com` (verified domain)

**Verification:**
```
1. Go to Supabase Dashboard → Authentication → SMTP Settings
2. Enable custom SMTP
3. Host: smtp.resend.com | Port: 465 | Username: resend | Password: [Resend API key]
4. Send test password reset to your email
5. Confirm delivery
```

**Owner:** Ops | **Effort:** S

---

### A15. Company Admin Role + Membership Authorization

**Why:** This is not a feature — it's the authorization boundary. Without a `company_admin` role and enforced `company_members` checks, there's no way for customers to self-manage their teams, and no way to prove that user X actually belongs to company Y. Every tenant isolation guarantee depends on this table being the source of truth.

**Done means:**
- `company_members` table is the sole authority for user↔company relationships: columns `user_id`, `company_id`, `role` (owner | company_admin | member | viewer), `invited_by`, `joined_at`
- RLS policy on `company_members`: users can only read rows where their own `user_id` matches OR they have `company_admin`/`owner` role for that `company_id`
- `company_admin` role can: invite/remove members for their company, assign agent access within their company, view audit logs for their company. They CANNOT: access other companies, create/delete companies, change platform-wide settings
- Every `/api/portal/*` route validates the requesting user is a member of the requested company via `company_members` lookup — not just "is authenticated"
- `super_admin` and `admin` (platform roles) bypass company membership checks. `company_admin` (tenant role) does not grant platform access
- Migration creates the role column if missing and backfills existing users

**Verification:**
```bash
# 1. Create company_admin user for Tenant A
# 2. Authenticate as that user
# 3. GET /api/portal/members?company_id=TENANT_A → 200, returns members
# 4. GET /api/portal/members?company_id=TENANT_B → 403 or empty
# 5. POST /api/admin/users → 401 (company_admin has no platform admin access)
# 6. Invite a new member to Tenant A → succeeds
# 7. Invite a member to Tenant B → 403
```

```sql
-- Verify RLS policy exists
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'company_members';
-- Should show SELECT/INSERT/DELETE policies scoped to user's company
```

**Owner:** Dev + Security | **Effort:** L

---

### A16. Per-Company Agent Data Isolation

**Why:** If a Clutch 3PL user opens the CFO agent from their portal and sees Woulf Group's financial data, that's a data breach. Agent responses, chat history, and any data the agent surfaces must be scoped to the requesting user's company.

**Done means:**
- Every agent API route (`/api/agents/*`) receives the user's `company_id` from their auth token or `company_members` lookup
- Agent chat sessions are stored with `company_id` and filtered on retrieval — a user can only see their company's chat history
- Agent data fetching (CFO pulling invoices, Sales pulling CRM data, WMS pulling inventory) passes `company_id` to all data sources
- Demo/placeholder data is clearly flagged as demo and only shown when no real integration is connected (never mixed with real data)
- CompanyProvider context in the portal correctly propagates `company_id` to all child components and API calls

**Verification:**
```bash
# 1. Login as Clutch 3PL user (company_id = clutch)
# 2. Open CFO agent from portal → verify data shown is Clutch-scoped (or demo with Clutch label)
# 3. Open chat → send a message → verify chat session stored with company_id = clutch
# 4. Login as Woulf Group user
# 5. Open CFO agent → verify Clutch's chat history is NOT visible
# 6. Check DB directly:
```

```sql
SELECT id, company_id, user_id FROM chat_sessions ORDER BY created_at DESC LIMIT 10;
-- Every row should have a company_id; no NULLs
-- Clutch user's sessions should only have company_id = clutch's UUID
```

**Owner:** Dev + Security | **Effort:** L

---

### A17. Resend DNS Verification (woulfai.com + woulfgroup.com)

**Why:** A14 covers SMTP config, but DNS verification is a separate step. Without verified sending domains, emails land in spam or don't send at all. Both domains need verification — woulfai.com for platform emails and woulfgroup.com for Woulf Group internal use.

**Done means:**
- Resend dashboard shows both `woulfai.com` and `woulfgroup.com` as verified sending domains
- DNS records added: DKIM (3 CNAME records per domain), SPF (TXT record), DMARC (TXT record)
- Test emails from both domains pass SPF, DKIM, and DMARC checks
- Supabase SMTP configured to send from `noreply@woulfai.com`

**Verification:**
```bash
# Check DNS records are propagated
dig TXT woulfai.com | grep "v=spf1"
dig TXT _dmarc.woulfai.com | grep "v=DMARC1"
dig CNAME resend._domainkey.woulfai.com

# Send test email and check headers
# In Gmail: Open email → "Show original" → verify:
#   SPF: PASS
#   DKIM: PASS
#   DMARC: PASS
```

**Owner:** Ops | **Effort:** S

---

## Phase B: Post-Launch Hardening (30–60 days)

These items improve resilience and operational maturity. Ship them while you have early customers but before scale.

- **Dependency vulnerability scanning:** Add `npm audit` to CI. Fix critical/high CVEs within 48 hours. Set up Dependabot or Renovate for automated PR creation.
- **Agent job safety:** Move AI agent calls out of request threads. Add 30-second timeouts to all LLM API calls. Implement retry with exponential backoff. Consider a simple job queue (Inngest, Trigger.dev, or even a Supabase Edge Function with pg_cron).
- **Slow endpoint detection:** Add response time logging middleware. Alert on any endpoint consistently > 3 seconds. Identify and fix the top 3 slowest routes.
- **Database query protection:** Add connection pooling via Supabase's built-in PgBouncer. Add `statement_timeout` of 30 seconds to prevent runaway queries. Index any column used in `.eq()` filters that doesn't already have one.
- **CSP header enforcement:** Transition from report-only to enforced CSP. Tune allowed sources based on report-only data collected in Phase A.
- **Feature flags:** Implement a simple flag system (even a `feature_flags` table in Supabase). Use it to gate unfinished features so they don't destabilize the app.
- **Migration discipline:** All schema changes via numbered migration files in `supabase/migrations/`. No manual SQL in production. Test migrations against a staging database before applying to prod.
- **Incident response playbook:** Document: how to detect an incident (Sentry alert, user report, health check failure), who to notify, how to roll back (Vercel instant rollback), how to communicate to affected customers, post-mortem template.
- **Session management hardening:** Implement session expiry (24h idle timeout). Add concurrent session limits per user. Force re-auth for sensitive operations (role changes, financial exports).
- **Admin sidebar: quick company switching.** Add company selector dropdown to AdminSidebar so super_admins can switch company context without navigating to `/portal`. This is UX, not security — the authz boundary from A15 ensures the switch respects permissions.
- **Company member invite flow (full UI).** Phase A (A15) establishes the authz rules. This item builds the polished UI: invite modal with email input, role picker, pending invite list, resend/revoke actions, and invite acceptance page. Depends on A14 (Resend SMTP) and A17 (DNS verification) for email delivery.
- **Employee onboarding flow.** Internal tool for Woulf Group: new employee creates account → gets assigned to Woulf Group company → gets default agent access → completes profile. Reuses A15 membership infrastructure. Low security risk since it's internal-only.
- **Replace demo data with real integrations.** Connect Odoo (ERP), HubSpot (CRM), and other live backends so agents return real data instead of hardcoded demos. Each integration must respect tenant isolation — Odoo credentials are per-company, not platform-wide. Gate behind feature flags so half-connected integrations don't break the UI.
- **Run batch4-cleanup.js.** Execute the pending cleanup script to remove legacy data, orphaned records, and stale configurations accumulated during rapid development. Back up database first. Verify row counts before and after.

---

## Phase C: Enterprise Maturity (60–180 days)

These items position you for enterprise sales, SOC 2, and multi-team operations.

- **SOC 2 Type I preparation:** Formalize security policies, access controls, change management, and vendor management. Audit logging from Phase A becomes your evidence.
- **Penetration testing:** Engage a third-party firm for a focused pentest on auth flows, tenant isolation, and API surface. Budget: $5K–$15K for a startup-focused firm.
- **Blue/green deployments:** Implement zero-downtime deploys with instant rollback capability beyond Vercel's built-in.
- **Automated tenant isolation regression tests in CI:** The tests from A1 run on every PR. Any cross-tenant leak blocks merge.
- **Data classification + retention policies:** Define what data you store, how long, and when it's purged. Required for enterprise customers.
- **Multi-region resilience:** Evaluate Supabase region replication and Vercel edge config for latency-sensitive customers.
- **Customer-facing security page:** Publish your security practices at woulfai.com/security. Enterprise buyers expect this.
- **Bug bounty program:** Start with a simple responsible disclosure policy. Upgrade to a platform (HackerOne, Bugcrowd) as you grow.
- **Key management service:** Move from Vercel env vars to a proper KMS (AWS KMS, HashiCorp Vault) for rotation automation and access auditing.
- **Custom domains per company.** Allow enterprise customers to access their portal at `portal.theircompany.com` instead of `woulfai.com/portal?company=slug`. Requires Vercel domain configuration API, SSL cert provisioning, and DNS CNAME instructions for customers. High-value sales differentiator for enterprise deals.
- **Mobile app / PWA.** Package the portal as a Progressive Web App (service worker, manifest, offline shell) or build a native wrapper via Expo/React Native. Start with PWA — it's 90% of the value for 10% of the effort. The existing React codebase ports cleanly.
- **Customer-facing external portal.** A stripped-down, white-labeled portal that customers' customers can access (e.g., a 3PL customer checking their inventory via Clutch 3PL's portal). Requires a third authorization tier below `company_admin`: `external_user` with read-only access to specific data.
- **CFO agent enhancements: QuickBooks + Xero.** Connect the CFO agent to real accounting platforms. QuickBooks Online API (OAuth 2.0) and Xero API (OAuth 2.0) for live invoice, P&L, cash flow, and balance sheet data. Each connection is per-company — store OAuth tokens in an encrypted `integrations` table scoped by `company_id`.
- **Live agent backends (Python/FastAPI).** Migrate AI agent logic from Next.js API routes to dedicated Python/FastAPI services for better ML library support, longer execution times, and independent scaling. The existing `github.com/stevemacurdy/ai-ecosystem` repo becomes the backend. Next.js becomes the API gateway + frontend only.

---

## Launch Readiness Gate

Every item must be YES before accepting real customer data.

| # | Check | Status |
|---|-------|--------|
| 1 | Tenant isolation test suite passes (automated cross-tenant proof) | ☐ |
| 2 | All secrets rotated post-exposure; zero hardcoded credentials in repo | ☐ |
| 3 | Every admin/portal API route returns 401 without valid auth | ☐ |
| 4 | RLS enabled on every Supabase table | ☐ |
| 5 | Security headers present (HSTS, X-Frame-Options, X-Content-Type-Options) | ☐ |
| 6 | Rate limiting active on auth + agent endpoints | ☐ |
| 7 | Sentry error tracking live with alerts configured | ☐ |
| 8 | Audit log captures login, user CRUD, role changes, data access | ☐ |
| 9 | Preview deploy workflow in use (no direct-to-prod deploys) | ☐ |
| 10 | 15 critical path tests passing | ☐ |
| 11 | HTTPS enforced; no sensitive data in localStorage | ☐ |
| 12 | Backup/restore drill completed; RPO/RTO documented | ☐ |
| 13 | Build compiles with zero errors; no syntax issues in production code | ☐ |
| 14 | Transactional email working (password reset + invites via Resend) | ☐ |
| 15 | company_admin role enforced; company_members is sole authz source for tenant access | ☐ |
| 16 | Agent data + chat history scoped by company_id; cross-company agent access returns 0 rows | ☐ |
| 17 | Sending domains (woulfai.com, woulfgroup.com) pass SPF + DKIM + DMARC | ☐ |

---

## Ongoing Ops Cadence

### Weekly
- Review Sentry errors: triage new issues, close resolved ones
- Check audit logs for anomalies (unexpected admin actions, cross-tenant attempts)
- Run `npm audit` and address critical/high findings
- Review Vercel analytics: error rates, slow endpoints, traffic patterns

### Monthly
- Rotate any manually-managed secrets (API keys for third-party services)
- Review and prune user access (remove inactive accounts, verify role assignments)
- Audit company_members table: check for orphaned memberships, users in companies they shouldn't be in, company_admin role grants
- Run tenant isolation test suite against production (with test tenants)
- Review Supabase database performance: slow queries, table sizes, index usage
- Update dependencies (minor/patch versions; major versions with testing)

### Quarterly
- Full security review: re-run audit script, review new endpoints added since last review
- Backup restore drill (verify backups actually work)
- Review and update incident response playbook
- Assess Phase C items for prioritization based on customer requirements
