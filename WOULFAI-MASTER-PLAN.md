# WoulfAI Master Execution Plan
## Security Audit + Platform Build-Out + Launch Roadmap

**Generated: March 2, 2026**
**Source Documents Analyzed:** Handoff Package (70+ source files), Implementation Guide, 60-Day Launch Playbook, Remaining Checklist, Diagnostic SQL Output, Migrations 012-020, Schema Decisions, Stripe Exports

---

## DIAGNOSTIC RESULTS — CONFIRMED

| Check | Result | Impact |
|-------|--------|--------|
| `user_agents` table | **GONE** — renamed to `_legacy_user_agents_006` by migration 018 | `/api/admin/manage-agents` backward-compat writes will silently fail |
| `user_agent_access` table | **GONE** — renamed to `_legacy_user_agent_access_009` | `/api/auth/me` final fallback returns empty permissions for unmigrated users |
| Bundles in DB | 6 suite-based tiers (old structure), all active | Must deactivate and insert 4 playbook tiers |
| Agent count | 21 total (20 live, 1 beta) | On track — all 21 registered |
| Stripe Products | 5 bundle products + 7 individual agent products created | Need 4 new products for playbook tiers |
| Stripe Price IDs | Populated for all 5 bundles | Old IDs — new tier prices needed |

---

## P0 — CRITICAL SECURITY (Deploy Today)

### Issue 1: 12 API Routes Have Zero Authentication

Every CRUD and intelligence route can be called by anyone on the internet without a token. This is the #1 priority.

**Affected Routes:**

| Route | Risk | Fix File |
|-------|------|----------|
| `/api/cfo` | 🔴 CRITICAL — exposes financial data when integrations connect | `routes/api-cfo-route.ts` |
| `/api/sales-data` | 🔴 CRITICAL — exposes pipeline/deal data | Apply INTELLIGENCE-PATTERN.ts |
| `/api/warehouse-data` | 🔴 CRITICAL — exposes inventory/ops data | Apply INTELLIGENCE-PATTERN.ts |
| `/api/agents/permissions` | 🔴 CRITICAL — anyone can grant themselves agent access | `routes/agents-permissions-route.ts` |
| `/api/agents/webhooks` | 🟠 HIGH — can register webhooks to exfiltrate data | Apply AUTH-PATTERNS (company-scoped) |
| `/api/agents/audit` | 🟠 HIGH — exposes full change history | `routes/agents-audit-route.ts` |
| `/api/agents/bundles` | 🟡 MEDIUM — GET is intentionally public (pricing page), POST needs admin | Apply AUTH-PATTERNS (POST only) |
| `/api/agents/modules` | 🟡 MEDIUM — exposes agent internals | Apply AUTH-PATTERNS (GET=token, POST=admin) |
| `/api/agents/events` | 🟡 MEDIUM | Same pattern as modules |
| `/api/agents/dependencies` | 🟡 MEDIUM | Same pattern as modules |
| `/api/agents/integrations-req` | 🟡 MEDIUM | Same pattern as modules |
| `/api/agents/usage` | 🟡 MEDIUM — exposes usage metrics | Apply AUTH-PATTERNS (company-scoped) |

**Deployment Steps:**
1. Copy `lib/api-auth.ts` → `lib/api-auth.ts` in your repo
2. Drop in the 3 fully-patched route files (cfo, permissions, audit)
3. Apply the patterns from `AUTH-PATTERNS-ALL-ROUTES.ts` to the remaining 9 routes
4. **Test:** `curl -s https://www.woulfai.com/api/agents/permissions | jq .` should return `{"error":"Missing or invalid token"}`

### Issue 2: Migration 018 Broke Auth Fallback

The `/api/auth/me` route has a 3-level permission fallback:
1. `agent_user_permissions` → works ✅
2. `agent_role_permissions` → works ✅
3. `user_agent_access` → **BROKEN** ❌ (table renamed to `_legacy_user_agent_access_009`)

Additionally, `/api/admin/manage-agents` writes backward-compat records to both `user_agent_access` and `agent_user_permissions`. The writes to the legacy table silently fail.

**Fix:** Migration 021 creates views (`user_agent_access` → `_legacy_user_agent_access_009`, `user_agents` → `_legacy_user_agents_006`) so existing code keeps working.

### Issue 3: Middleware Does Not Enforce Auth

The `middleware.ts` rate-limits API routes but explicitly passes them through with the comment `// Let API routes through without further checks`. Auth is client-side only via `AuthProvider` — the server never validates tokens on protected routes.

**Fix:** The route-level auth wrappers (via `lib/api-auth.ts`) handle this. The middleware doesn't need to change for now, but consider adding a middleware-level Bearer check for all `/api/agents/*` routes as a defense-in-depth layer later.

### Issue 4: Routes Use Anon Key (getSupabaseClient)

All 9 CRUD routes import `getSupabaseClient()` which uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`. This is the public/client key. In server-side API routes, you should use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for admin operations.

Currently this works by accident because most new tables don't have RLS enforced. Once you enable RLS (migrations 015-017 added policies), these routes will silently return empty results.

**Fix:** Replace `getSupabaseClient()` with `supabaseAdmin()` (using service role key) in every API route file. The patched route files already do this.

---

## P0.5 — RUN MIGRATIONS (After Auth Fix)

### Migration 021: User Access Fix + Pricing Restructure
- Creates compatibility views for renamed legacy tables
- Deactivates 6 old suite bundles
- Adds tier metadata columns to `agent_bundles`
- Inserts 4 playbook-aligned tiers (Starter $497, Growth $1,997, Professional $4,997, Enterprise custom)

### Migration 022: Tier Infrastructure
- Creates `tier_configs` table (single source of truth for all limits)
- Creates `usage_events` + `usage_summaries` (AI action metering)
- Creates `storage_objects` + `storage_usage` (storage quota tracking)
- Creates `company_seats` + `seat_invitations` (seat management)
- Creates `sla_incidents` + `sla_metrics` (SLA tracking)
- Adds `tier_slug` column to `companies` table
- Full RLS policies on all new tables

**Run order:** 021 first (creates bundles that 022's tier_configs references), then 022.

---

## P1 — STRIPE RESTRUCTURE (This Week)

### Current Stripe State
- 5 bundle products (Starter Pack, Finance Suite, Sales Suite, Operations Suite, Full Platform)
- 7 individual agent products (Financial, WMS, Sales, Marketing, Support, Research, Training)
- All in LIVE mode with real price IDs populated in DB

### Action Items

1. **Create 4 new Stripe products** matching playbook tiers:
   - WoulfAI Starter ($497/mo, $397/mo annual)
   - WoulfAI Growth ($1,997/mo, $1,597/mo annual)
   - WoulfAI Professional ($4,997/mo, $3,997/mo annual)
   - WoulfAI Enterprise (no self-serve price)

2. **Create prices** for each (monthly + annual base, plus metered overage for Growth/Professional):
   - Use graduated pricing on Stripe Billing Meters (see Implementation Guide §7.2)
   - Growth: first 25K actions free, then $0.03/action
   - Professional: first 100K actions free, then $0.02/action

3. **Create the Billing Meter:**
   ```
   stripe billing meters create --display-name='AI Actions' --event-name='ai_action' --default-aggregation-formula=sum
   ```

4. **Update migration 021** with real Stripe product/price IDs, then re-run the UPDATE:
   ```sql
   UPDATE agent_bundles SET 
     stripe_product_id = 'prod_xxx', 
     stripe_price_id_monthly = 'price_xxx',
     stripe_price_id_annual = 'price_xxx'
   WHERE slug = 'starter';
   -- Repeat for growth, professional
   ```

5. **Do NOT delete old products** — existing test subscriptions reference them. Archive in Stripe dashboard.

### Pricing Page Rewrite
The current pricing page fetches bundles from `/api/agents/bundles` and renders a 6-card grid with suite-based `TIER_META`. After migration 021, it will show 4 active bundles. The `TIER_META` object needs updating to match the new slugs:

```typescript
const TIER_META: Record<string, { ... }> = {
  'starter': {
    users: '2 team members',
    workspaces: '1 workspace',
    extras: ['Pick any 3 AI Employees', '5,000 AI actions/month', '10 GB storage', 'Email support', '14-day free trial'],
    cta: 'Start Free Trial',
    headcount_comparison: 'vs. $3,500-$4,500/mo for one warehouse worker',
  },
  'growth': { ... },
  'professional': { ... },
  'enterprise-custom': { ... },
};
```

---

## P2 — AGENT INTELLIGENCE LAYERS (Weeks 1-3)

### Current State: 3 of 21 agents have intelligence
- ✅ CFO: lib/cfo-data.ts + API route + console page
- ✅ Sales: lib/sales-data.ts + API route + console page  
- ✅ Warehouse: lib/warehouse-data.ts + route + console (built via edits, in repo)

### Build Pattern (repeat for each agent)
Each agent needs:
1. **Data layer** (`lib/{agent}-data.ts`): Demo data + live data adapter via Unified.to
2. **API route** (`app/api/{agent}/route.ts`): Views (dashboard, list, detail) + auth
3. **Console page** (`app/agents/{agent}/console/page.tsx`): Interactive dashboard

### Priority Order (by customer value)
| Phase | Agents | Why | Effort |
|-------|--------|-----|--------|
| C1 | FinOps, Collections, Payables | Complete finance department — CFO buyers want the whole suite | 1 week |
| C2 | Sales Intel, Sales Coach, Marketing, SEO | Complete sales/marketing — highest demand from 3PLs | 1.5 weeks |
| C3 | WMS (enhance), Supply Chain, Operations, Org Lead | Complete ops — the warehouse differentiator | 1 week |
| C4 | HR, Support, Training | People & support department | 1 week |
| C5 | Legal, Compliance, Data, Research | Complete coverage | 1 week |

### Integration Dependency (Unified.to)
Before agents can show live data, you need:
1. Sign up for Unified.to → get API key
2. Build `/api/integrations/connect` adapter (partially done — see `source-code/integrations/`)
3. Embed the Unified.to authorization component in onboarding
4. Wire each agent category to the correct Unified API:
   - Finance agents → Accounting API (QuickBooks, Xero)
   - Sales agents → CRM API (HubSpot, Salesforce)
   - HR → HRIS API
   - Support → Ticketing API

---

## P3 — CHECKOUT + ONBOARDING (Week 2)

### Checkout Flow (mostly built)
The Stripe checkout route (`stripe/checkout-route.ts`) and webhook handler (`stripe/webhook-route.ts`) are functional. The webhook auto-provisions: creates company → adds member → creates subscription → grants agent access.

**Remaining:**
- Update checkout to use new 4-tier bundle slugs
- Add trial_period_days: 14 to subscription creation
- Build success page at `/onboarding` (partially built — `onboarding-welcome.tsx` exists)
- Build cancel/failure handling
- Test the full flow: pricing → checkout → webhook → onboarding

### Onboarding Wizard
The `onboarding-welcome.tsx` component exists. Needs:
1. Step 1: Welcome + company name
2. Step 2: "Connect Your Accounting Software" (Unified.to embed)  
3. Step 3: "Invite Team Members" (seat invitation flow)
4. Step 4: "Choose Your AI Employees" (for Starter tier — pick 3)

---

## P4 — USAGE ENFORCEMENT (Week 3)

### Deploy in Shadow Mode First
From the Implementation Guide: "Deploy usage tracking in shadow mode (tracking but not enforcing) for at least 48 hours before turning on enforcement."

**Shadow mode steps:**
1. Deploy `usage_events` table (migration 022)
2. Add tracking calls to all agent routes (record but don't block)
3. Monitor for 48 hours — verify counts are accurate
4. Enable enforcement (check limits, return 429 when exceeded)

### Enforcement Middleware
Use `withTierEnforcement` from Implementation Guide §8.3 as a higher-order function wrapping each agent route:

```typescript
export const POST = withTierEnforcement('financial', 'query', async (req, ctx) => {
  const result = await runFinancialAgent(body, ctx.tenantId);
  return NextResponse.json(result);
});
```

### Warning System
Implement threshold alerts per Implementation Guide §10.2:
- 50% usage → in-app toast
- 75% → email + toast
- 90% → email + persistent banner
- 100% (no overage) → hard block with upgrade modal

---

## CROSS-REFERENCE: Document Alignment

| Topic | Playbook Says | Implementation Guide Says | Handoff Says | Resolution |
|-------|---------------|---------------------------|--------------|------------|
| Tiers | 4 tiers: $497/$1,997/$4,997/$10-25K | Same 4 tiers with full technical spec | 6 suite-based tiers in DB | **Playbook wins** — migration 021 restructures |
| Usage limits | 5K/25K/100K/unlimited | Same + overage billing at $0.03/$0.02 per action | Not implemented | **Implementation Guide** has full spec — migration 022 |
| Storage | 10GB/50GB/200GB/1TB | Same + tracking tables + cleanup policies | Not implemented | **Implementation Guide** — migration 022 |
| Seats | 2/5/unlimited/unlimited | Same + invitation flow + Stripe quantity sync | Not implemented | **Implementation Guide** — migration 022 |
| SLA | 99%/99.5%/99.9%/99.99% | Full tracking middleware + cron job + incident table | Not implemented | **Implementation Guide** — migration 022 |
| White-label | Mentioned as Enterprise feature | Full partner/channel architecture | Not implemented | **P5 stretch goal** |
| Auth | Assumed secure | Not addressed | **12 routes unprotected** | **This audit** — P0 fix |
| Agent count | "21 AI Employees" | References "21 agents" | 20 live + 1 beta | Aligned |
| Checkout | Phase A priority | Not addressed (assumes built) | Functional in code | **Mostly done** — needs 4-tier update |

---

## FILES IN THIS PACKAGE

| File | Location | What It Does |
|------|----------|-------------|
| `lib/api-auth.ts` | Drop into `lib/api-auth.ts` | Shared server-side auth helper (verifyToken, verifyAdmin, etc.) |
| `routes/api-cfo-route.ts` | Replace `app/api/cfo/route.ts` | CFO route with auth (demo=public, live=authenticated) |
| `routes/agents-permissions-route.ts` | Replace `app/api/agents/permissions/route.ts` | Permissions route — admin-only for all operations |
| `routes/agents-audit-route.ts` | Replace `app/api/agents/audit/route.ts` | Audit route — admin-only reads |
| `routes/INTELLIGENCE-PATTERN.ts` | Reference only | Pattern for patching sales-data + warehouse-data routes |
| `routes/AUTH-PATTERNS-ALL-ROUTES.ts` | Reference only | Exact code patterns for all 9 CRUD routes |
| `migrations/021-...sql` | Run in Supabase SQL Editor | User access fix + 4-tier pricing restructure |
| `migrations/022-...sql` | Run after 021 | Tier infrastructure (9 tables: usage, storage, seats, SLA) |

---

## EXECUTION TIMELINE

| Day | Action | Validates |
|-----|--------|-----------|
| **Today** | Deploy `lib/api-auth.ts` + patched routes | `curl /api/agents/permissions` → 401 |
| **Today** | Run migration 021 in Supabase | `SELECT * FROM agent_bundles WHERE is_active` → 4 rows |
| **Day 2** | Run migration 022 | `SELECT * FROM tier_configs` → 4 rows |
| **Day 2-3** | Create 4 Stripe products + prices + meter | Stripe dashboard shows new products |
| **Day 3** | Update migration 021 with Stripe IDs | Bundles have real price IDs |
| **Day 3-4** | Rewrite pricing page TIER_META | woulfai.com/pricing shows 4 tiers |
| **Day 4-5** | Update checkout to use new bundle slugs | Full purchase flow works |
| **Day 5-7** | Sign up Unified.to + wire connect flow | Can OAuth into QuickBooks |
| **Week 2** | Build 4 finance agent intelligence layers | CFO suite complete |
| **Week 2** | Deploy usage tracking in shadow mode | Events appearing in usage_events |
| **Week 3** | Build sales/marketing agent layers | Sales suite complete |
| **Week 3** | Enable usage enforcement | 429 returned at limits |
| **Week 4** | Build ops agent layers + onboarding wizard | Core platform complete |
| **Week 5-6** | Remaining agents + admin dashboard | Full 21-agent coverage |
| **Week 7-8** | Testing, hardening, launch prep | Go-live ready |

---

## QUICK COMMAND REFERENCE

```bash
# Test auth fix (should return 401 after deploying):
curl -s https://www.woulfai.com/api/agents/permissions | jq .

# Test with valid token (should return data):
curl -s -H "Authorization: Bearer YOUR_TOKEN" https://www.woulfai.com/api/agents/permissions?companyId=xxx | jq .

# Run migration 021 (copy-paste into Supabase SQL Editor)
# Run migration 022 (copy-paste into Supabase SQL Editor)

# Create Stripe products:
stripe products create --name='WoulfAI Starter' --description='3 AI Employees, 2 seats, 5,000 actions/month'
stripe products create --name='WoulfAI Growth' --description='10 AI Employees, 5 seats, 25,000 actions/month'
stripe products create --name='WoulfAI Professional' --description='All 21 AI Employees, unlimited seats, 100,000 actions/month'

# Create Stripe billing meter:
stripe billing meters create --display-name='AI Actions' --event-name='ai_action' --default-aggregation-formula=sum
```
