# WoulfAI Integration Audit: Gemini Onboarding vs deploy-5-agents.js

## Executive Summary

Gemini delivered **strong strategy but incomplete code**. The onboarding *concept* (TTFV, progressive disclosure, "Aha moments") is excellent and aligns perfectly with what we discussed. But the actual deliverables have gaps that would cause build failures if dropped in as-is.

---

## 1. CONFLICTS (Must Resolve Before Deploying)

### Tenant Context — TWO competing implementations

| File | Source | What It Does |
|------|--------|-------------|
| `lib/tenant-context.ts` | Gemini | Simple function: `getTenantContext(user)` — returns `activeOrgId` and `odooAccount` |
| `lib/providers/tenant-provider.tsx` | deploy-5-agents.js | Full React Context + Provider with `useTenant()` hook, API-backed company switching, cookie persistence, `router.refresh()` on switch |

**Verdict:** Use `tenant-provider.tsx` (mine). It's production-grade with actual state management. Gemini's is a utility function that doesn't manage state — it would need to be called manually everywhere.

**Resolution:** Keep `tenant-provider.tsx`. Merge Gemini's Odoo account mapping logic *into* the tenant provider as an `odooAccount` field on the Company type.

### Business Switcher — TWO competing components

| Component | Source | Location |
|-----------|--------|----------|
| `TenantSwitcher.tsx` | Gemini | `components/navigation/` — Standalone dropdown with `window.dispatchEvent` |
| Business Switcher | deploy-5-agents.js | Built INTO `sidebar-nav.tsx` — Uses `useTenant()` context, API-backed |

**Verdict:** Both can coexist. Gemini's is a nice *header* component; mine is in the sidebar. But Gemini's uses `window.dispatchEvent('orgSwitch')` which is a fragile pattern — no other component is listening for that event. It needs to be rewired to use `useTenant().switchCompany()` instead.

**Resolution:** Keep both, but rewire Gemini's TenantSwitcher to use the `useTenant()` hook instead of custom events.

---

## 2. GAPS (Gemini Promised But Didn't Deliver)

### The Actual Wizard UI — NOT BUILT
Gemini created:
- ✅ Directory stubs: `app/onboarding/`, `app/onboarding/[agentId]/`
- ✅ Database schema: `onboarding_sessions` table
- ✅ MagicMapper placeholder component
- ❌ **No actual page.tsx files** — the routes have no UI
- ❌ **No step configurations** per agent
- ❌ **No wizard state machine** (the "step 1 → step 2 → step 3" logic)
- ❌ **No middleware gating** (claimed it would block `/portal` access — never built)
- ❌ **No "Success Check" API** (promised multiple times, never delivered)
- ❌ **No OAuth flows** (Odoo, HubSpot, Google — mentioned as core features, not built)
- ❌ **No Framer Motion transitions** (mentioned in spec, not implemented)
- ❌ **No Zod validation schemas** (mentioned in spec, not implemented)

### orchestrate.js — Mostly Logging
The "Master Orchestrator" (`orchestrate.js`) does three things:
1. Writes `lib/tenant-context.ts` (one function)
2. Checks if 4 API route files exist (just `console.log`, doesn't create them)
3. Logs the agent registry (no actual data structure)

It doesn't actually wire anything. Compare to `deploy-5-agents.js` which creates 16 real files.

### MagicMapper.tsx — Placeholder Only
The component renders a static `<div>` that says "Mapping detected columns..." with hardcoded text. There's no:
- File upload handler
- Column detection logic  
- Mapping UI (drag columns to fields)
- Submit/confirm flow

---

## 3. WHAT GEMINI GOT RIGHT (Keep These)

### Strategy & Architecture
- ✅ TTFV under 10 minutes — correct priority
- ✅ Progressive Disclosure — don't ask everything upfront
- ✅ "Aha Moment" per agent — brilliant retention tactic
- ✅ Save-and-resume with `onboarding_sessions` — essential
- ✅ Two paths: SaaS vs 3PL — correct segmentation
- ✅ Middleware gating concept — right approach
- ✅ Agent-specific step configs — the right mental model

### Database Schema
- ✅ `onboarding_sessions` table design is sound
- ✅ RLS policy for user isolation
- ⚠️ BUT: needs `company_id` column (missing from Gemini's schema — breaks multi-tenant)

### The "Aha Moment" Definitions
These are gold — keep them exactly:
- CFO: "We've identified $12k in overdue payments. Click 'Send Reminders' now."
- SEO: "We found 12 high-intent keywords you're missing."  
- Sales: "3 deals flagged as 'High Risk'. View analysis?"
- WMS: "SKU-A102 is low. Draft reorder PO?"
- HR: "Maria's cert expires in 4 days. Send training link?"

---

## 4. INTEGRATION PLAN

### What to Run (In Order)

1. **`deploy-5-agents.js`** (already built) — Creates the foundation:
   - Agent registry, tenant provider, sidebar, dashboard shell
   - 5 agent pages, API routes, SQL migration
   
2. **`install-onboarding.js`** (needs rebuild) — Adds the onboarding layer:
   - `/onboarding/page.tsx` — Entry hall with agent selection
   - `/onboarding/[agentId]/page.tsx` — Adaptive wizard with real steps
   - `onboarding_sessions` table (with `company_id` fix)
   - Per-agent step configurations
   - Middleware gating
   - "Success Check" API route
   - MagicMapper with actual upload + mapping UI
   - TenantSwitcher rewired to use `useTenant()`

### Files That Need Merging

| Gemini File | Action |
|------------|--------|
| `lib/tenant-context.ts` | **SKIP** — replaced by `tenant-provider.tsx` |
| `components/navigation/TenantSwitcher.tsx` | **REBUILD** — rewire to `useTenant()` hook |
| `components/MagicMapper.tsx` | **REBUILD** — add real upload + mapping logic |
| `supabase/migrations/008_onboarding.sql` | **REBUILD** — add `company_id`, fix references |
| `orchestrate.js` | **SKIP** — `deploy-5-agents.js` does everything this does and more |

---

## 5. RISK ASSESSMENT

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Running Gemini's `orchestrate.js` overwrites `tenant-provider.tsx` | HIGH | Don't run it — skip entirely |
| Gemini's TenantSwitcher uses `window.dispatchEvent` — no listeners exist | MEDIUM | Rewire to `useTenant()` |
| `onboarding_sessions` missing `company_id` | HIGH | Add column in rebuild |
| No actual wizard pages exist | HIGH | Build in `install-onboarding.js` |
| MagicMapper is a static placeholder | LOW | Rebuild with real logic |
| Gemini referenced `auth.users(id)` FK — may not match Supabase schema | MEDIUM | Use `profiles(id)` instead |

---

## Recommendation

**Don't run any of Gemini's scripts directly.** The strategy is sound but the code is incomplete and would conflict with what's already built. Instead, I'll build a unified `install-onboarding.js` that:

1. Uses the existing `agent-registry.ts` and `tenant-provider.tsx` from deploy-5-agents.js
2. Implements Gemini's onboarding strategy (TTFV, progressive disclosure, "Aha moments")
3. Actually builds the wizard pages Gemini promised but didn't deliver
4. Fixes the database schema gaps
5. Creates the middleware gating
6. Builds a functional MagicMapper (not a placeholder)
