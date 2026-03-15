# WoulfAI Platform Audit — Current State
## March 14, 2026

---

# PHASE 1 — INVENTORY SUMMARY

## File Counts
- **App pages/routes:** 177 TSX/TS files
- **API routes:** 121 route files
- **Components:** 46 files
- **Lib/data:** 87 files
- **Supabase migrations:** 41 SQL files
- **Demo agent data:** 24 files

## Agents: 22 Total
CFO, Collections, Compliance, FinOps, HR, Legal, Marketing, Operations, Org Lead, Payables, Research, Sales, Sales Coach, Sales Intel, SEO, STR, Supply Chain, Support, Training, Video Editor, Warehouse, WMS

Plus: 3PL Customer Portal (agent #22 with separate console)

---

# PHASE 2 — PAGE-BY-PAGE AUDIT

## Public Marketing Pages
| Page | Route | Lines | Status |
|------|-------|-------|--------|
| Landing | / | 479 | Functional. Links work. Hero says "21 AI Employees" (should be 22). Only anchor `#agents` exists. |
| About | /about | 125 | Functional. Static content. |
| Solutions | /solutions | 281 | Functional. Static content. |
| Pricing | /pricing | 378 | Functional. Calls /api/stripe/checkout. Real Stripe integration. |
| Contact | /contact | 132 | Functional. POSTs to /api/leads. |
| Careers | /careers | 110 | Functional. Static content. |
| Case Studies | /case-studies | 160 | Functional. 3 case study sub-pages. |
| Privacy | /privacy | 98 | Functional. Static content. |
| Terms | /terms | 101 | Functional. Static content. |
| Security | /security | 98 | Functional. Static content. |
| How It Works | /how-it-works | 16 | BROKEN. Redirects to /#how-it-works which doesn't exist. |
| Integrations | /integrations | 16 | BROKEN. Redirects to /#integrations which doesn't exist. |
| Beta | /beta | 16 | BROKEN. Redirects to /#beta which doesn't exist. |

## Auth Pages
| Page | Route | Status |
|------|-------|--------|
| Login | /login | Functional. Uses getSupabaseBrowser().auth.signInWithPassword() directly. |
| Register | /register | Functional. Calls /api/auth/register. Creates profile + onboarding record. |
| Forgot Password | /forgot-password | Functional. Calls /api/auth/forgot-password. |
| Reset Password | /reset-password | Functional. Calls /api/auth/reset-password. |
| Invite Accept | /invite/[token] | Functional. Validates token, creates account. |

## Dashboard
| Page | Route | Status | Data Source |
|------|-------|--------|-------------|
| Main Dashboard | /dashboard | Functional. Aggregates 5 departments. | Demo unless integrations connected. Calls /api/cfo, /api/sales-data, /api/agents/operations, /api/agents/hr, /api/agents/marketing |
| Bug Bash | /dashboard/bug-bash | Display only. Uses BugBashChecklist component. | Hardcoded |

## Agent Consoles — 22 Total
### Consoles WITH AI Action Buttons (17)
These have `handleAi()` functions that POST to their agent API and return AI-generated results in modals. They also have GET data (demo unless integrations connected).

| Agent | Route | AI Actions Available | AI Actions Wired to Buttons |
|-------|-------|---------------------|----------------------------|
| CFO | /agents/cfo/console | analyze, collection-strategy | 0 AI buttons. Has CRUD: edit-line-item, record-payment (calls /api/cfo-invoices) |
| Collections | /agents/collections/console | log-contact, update-status, analyze, generate-letter | 3 AI buttons |
| Compliance | /agents/compliance/console | add-item, update-status, generate-checklist, policy-review, remediation-plan | 3 AI buttons (generate-checklist, policy-review, remediation-plan) |
| FinOps | /agents/finops/console | create-entry, adjust-budget, forecast, scenario | 2 AI buttons (forecast, scenario) |
| HR | /agents/hr/console | create-position, update-status, generate-jd, retention-analysis, salary-benchmark | 3 AI buttons (generate-jd, retention-analysis, salary-benchmark) |
| Marketing | /agents/marketing/console | create-campaign, update-campaign, analyze-performance, generate-copy, ab-test-plan | 3 AI buttons (analyze-performance, generate-copy, ab-test-plan) |
| Operations | /agents/operations/console | create-project, update-project, status-report, risk-assessment, resource-plan | 3 AI buttons (status-report, risk-assessment, resource-plan) |
| Org Lead | /agents/org-lead/console | create-okr, update-progress, board-report, team-health-survey, decision-log | 2 AI buttons (board-report, team-health-survey) |
| Payables | /agents/payables/console | approve, schedule-payment, batch-approve, analyze-discounts, detect-duplicates | 3 AI + 3 CRUD (approve, batch-approve via buttons) |
| Research | /agents/research/console | add-competitor, analyze-competitor, market-report, trend-alert | 3 AI buttons (analyze-competitor, market-report, trend-alert) |
| Sales Coach | /agents/sales-coach/console | log-session, generate-coaching-plan, generate-roleplay, analyze-win-loss | 3 AI buttons (generate-coaching-plan, generate-roleplay, analyze-win-loss) |
| Sales Intel | /agents/sales-intel/console | add-prospect, enrich, build-outreach, score-lead | 3 AI buttons (enrich, build-outreach, score-lead) |
| SEO | /agents/seo/console | add-keyword, audit, content-brief, analyze-rankings | 3 AI buttons (audit, content-brief, analyze-rankings) |
| STR | /agents/str/console | add-property, update-rates, pricing-optimization, review-analysis, market-comparison | 3 AI buttons (pricing-optimization, review-analysis, market-comparison) |
| Supply Chain | /agents/supply-chain/console | add-vendor, update-scorecard, find-alternatives, risk-report, generate-rfq | 3 AI buttons (find-alternatives, risk-report, generate-rfq) |
| WMS | /agents/wms/console | create-wave, cycle-count, slotting-optimization, analyze-throughput | 2 AI buttons (slotting-optimization, analyze-throughput) |
| Video Editor | /agents/video-editor/console | Upload + transcribe + process jobs | File upload works. Calls /api/agents/video-editor. |

### Consoles WITHOUT AI Buttons (5 — display-only)
| Agent | Route | Lines | What It Shows |
|-------|-------|-------|---------------|
| Legal | /agents/legal/console | 160 | KPIs, contract table, recommendations. Uses shared AgentConsole component. |
| Support | /agents/support/console | 160 | KPIs, ticket table, recommendations. Uses shared AgentConsole component. |
| Training | /agents/training/console | 160 | KPIs, program table, recommendations. Uses shared AgentConsole component. |
| Warehouse | /agents/warehouse/console | 234 | KPIs, tables, modals. Calls /api/warehouse-data (NOT /api/agents/warehouse where AI lives). |
| 3PL Portal | /agents/3pl-portal/console | 262 | Customer management dashboard. Hardcoded demo customers. No API calls. |
| Sales | /agents/sales/console | 479 | Dashboard with KPIs, pipeline, tables. Calls /api/sales-data (GET only). |

### Key Finding: NO Console Has Chat or Free-Form Input
All 22 consoles are either display-only or have pre-defined AI action buttons. None allow the user to type instructions or ask questions. The only places with chat input are:
- 4 agent landing pages using WarehouseAgentUI (operations, org-lead, supply-chain, wms)
- /agents/sales/coach (dedicated chat page)
- /portal/agent/hr and /portal/agent/seo (orphan pages)
- The global ChatWidget (sales chatbot on every page)

## Agent Landing Pages (non-console)
| Page | Route | Type | Has Chat? |
|------|-------|------|-----------|
| CFO | /agents/cfo | Custom dashboard, no chat | No |
| Sales | /agents/sales | Custom dashboard | No |
| Sales Coach | /agents/sales/coach | Full chat interface | YES — works |
| Sales Solo | /agents/sales/solo | Redirect to /agents/sales | N/A |
| HR | /agents/hr | Custom dashboard | No |
| Operations | /agents/operations | WarehouseAgentUI | YES — chat with AI |
| Org Lead | /agents/org-lead | WarehouseAgentUI | YES — chat with AI |
| Supply Chain | /agents/supply-chain | WarehouseAgentUI | YES — chat with AI |
| WMS | /agents/wms | WarehouseAgentUI | YES — chat with AI |
| Compliance | /agents/compliance | Redirect-style | No |
| Legal | /agents/legal | Redirect-style | No |
| Marketing | /agents/marketing | Redirect-style | No |
| SEO | /agents/seo | Redirect-style | No |
| STR | /agents/str | Full custom dashboard (Desert Peak Lodge) | No |
| Support | /agents/support | Custom dashboard | No |
| Training | /agents/training | Custom dashboard | No |
| Research | /agents/research | Custom dashboard | No |

## CFO Sub-Pages
| Page | Route | Lines | Status |
|------|-------|-------|--------|
| CFO Landing | /agents/cfo | 173 | Display only. No fetch calls. |
| CFO Tools | /agents/cfo/tools | 156 | FAKE. Doc scanner uses Math.random(). Odoo form saves nothing. |
| CFO Payables | /agents/cfo/payables | 233 | Functional. 5 POST actions to /api/agents/payables. |
| CFO FinOps | /agents/cfo/finops | 200 | Partial. 1 fetch for data. No POST calls. |
| CFO FinOps Pro | /agents/cfo/finops-pro | 398 | Functional. 7 fetches, 2 POST calls. |
| CFO Manage | /agents/cfo/manage | 293 | Functional. 2 fetches, 1 POST. |

## Admin Pages
| Page | Route | Auth Token Sent? | Data Source | Status |
|------|-------|-----------------|-------------|--------|
| Dashboard | /admin | NO | Calls /api/admin/users (requires auth) + /api/admin/usage-stats (no auth) | BROKEN: Users tab shows 0 because no Bearer token sent. Usage stats work. |
| Users | /admin/users | YES | /api/admin/users, /api/admin/manage-agents, /api/admin/update-role, /api/admin/reset-password, /api/admin/delete-user | Functional. Full CRUD. |
| Analytics | /admin/analytics | NO (uses x-admin-email) | /api/agents/click, /api/leads | Partial. Uses email-based auth (not token). |
| Leads | /admin/leads | YES | /api/leads | Functional. |
| Companies | /admin/companies | YES | /api/admin/companies | Functional. |
| Pricing | /admin/pricing | YES | /api/admin/pricing, /api/stripe/products | Functional. |
| Chats | /admin/chats | YES | /api/chat/sessions | Functional. |
| Domains | /admin/domains | NO | /api/admin/domains | Works (API has no auth check either). |
| Sales CRM | /admin/sales-crm | NO (uses x-admin-email) | /api/crm | Works but CRM is 100% in-memory. Resets on deploy. |
| Sales Reps | /admin/sales-reps | NO | None | HARDCODED. 4 fake reps. Zero API calls. |
| Bug Bash | /admin/bug-bash | NO | None | HARDCODED. 6 fake bugs in React state. |
| Agent Creator | /admin/agent-creator | NO | None | HARDCODED. 706 lines of UI, zero backend. Generates manifest locally. |
| Agents Dashboard | /admin/agents | NO | useAgents() hook (registry) | Display only. Shows all agents from registry. |
| Demo Agents | /admin/demo-agents | NO | /api/admin/demo-toggles | Functional BUT API has no auth. |
| Integrations | /admin/integrations | NO | None | FAKE. "Connect" sets local state only. No persistence. |

## Warehouse Pages (Clutch 3PL Operations)
All 11 warehouse pages query real Supabase tables (warehouse_inventory, warehouse_orders, etc.) through getSupabaseBrowser(). Layout has session check — redirects to /login if not authenticated.

| Page | Route | Reads | Writes | Status |
|------|-------|-------|--------|--------|
| Dashboard | /warehouse | YES | No | Functional |
| Receiving | /warehouse/receiving | YES | YES (pallets, packing lists, COAs) | Functional |
| Pallets | /warehouse/pallets | YES | YES (weight confirm) | Functional |
| Inventory | /warehouse/inventory | YES | No | Functional (read-only) |
| Orders | /warehouse/orders | YES | No | Functional (read-only) |
| Orders New | /warehouse/orders/new | YES | YES (orders, items, BOLs) | Functional |
| BOL | /warehouse/bol | YES | No | Functional (read-only) |
| Purchase Orders | /warehouse/purchase-orders | YES | No | Functional (read-only) |
| PO New | /warehouse/purchase-orders/new | YES | YES (POs, items) | Functional |
| ASN | /warehouse/asn | YES | YES (ASN documents) | Functional |
| Customers | /warehouse/customers | YES | YES (add, toggle active) | Functional |

## 3PL Customer Portal
Two route paths exist: `/portal/[customerCode]/*` (primary) and `/p/[customerCode]/*` (short URL, re-exports from portal). Layout wraps with PortalDataProvider which fetches from `/api/agents/3pl-portal/all?code=X`. Demo mode for code `MWS-001`, live for all others.

| Page | Route | Status |
|------|-------|--------|
| Dashboard | /portal/[code] | Functional |
| Inventory | /portal/[code]/inventory | Functional |
| Orders | /portal/[code]/orders | Functional |
| New Order | /portal/[code]/orders/new | Functional |
| Billing | /portal/[code]/billing | Functional |
| Receiving | /portal/[code]/receiving | Functional |
| Support | /portal/[code]/support | Minimal (46 lines) |
| Settings | /portal/[code]/settings | Functional |

## Orphan Pages
| Page | Route | Lines | Issue |
|------|-------|-------|-------|
| Portal Agent HR | /portal/agent/hr | 271 | Full HR dashboard with 6 tabs, POST actions, AI insights. Nothing links here. |
| Portal Agent SEO | /portal/agent/seo | 362 | Full SEO dashboard with rankings, content actions. Nothing links here. |
| Portal Agent [id] | /portal/agent/[id] | 247 | Generic agent view with hardcoded tenant data. Nothing links here. |
| Portal Landing | /portal | ~200 | Agent grid for authenticated users. Functional but not in sidebar. |
| Sales Portal | /s/[slug] | ~200 | Personal sales rep portal with lead form. Functional but not linked from main nav. |
| Dashboard Bug Bash | /dashboard/bug-bash | 15 | Wraps BugBashChecklist. Duplicate of /admin/bug-bash. |

## Marketplace
| Page | Route | Status |
|------|-------|--------|
| Marketplace | /marketplace | Functional. Shows all agents with access badges. Pricing modal for locked agents. |

## Onboarding
| Page | Route | Status |
|------|-------|--------|
| Hub | /onboarding | Functional. Lists all live agents for onboarding selection. |
| Welcome Wizard | /onboarding/welcome | Functional. 5-step wizard. Calls /api/onboarding/complete. |
| Business | /onboarding/business | Functional. Registration + /api/leads. |
| Individual | /onboarding/individual | Functional. |
| Employee | /onboarding/employee | Functional. Calls /api/onboarding/employee. |
| Agent Setup | /onboarding/[agentId] | Functional. Per-agent onboarding steps. |

## Billing/Settings
| Page | Route | Status |
|------|-------|--------|
| Billing | /billing | Functional. Reads subscriptions from Supabase. Stripe portal link. |
| Settings Hub | /settings | Functional. Shows connections count, team count. |
| Settings Integrations | /settings/integrations | Partial. Shows integration cards. Connect calls /api/integrations/connect but config may not persist. |
| Settings Billing | /settings/billing | Minimal. Just a Stripe portal button. |

---

# PHASE 3 — CRITICAL API FINDINGS

## APIs With Zero Authentication
These endpoints have NO auth check of any kind — no Bearer token, no email check, no session validation:

### CRITICAL (cost exposure or data leak)
- `/api/admin/demo-toggles` — Anyone can toggle agent demos on/off
- `/api/admin/usage-stats` — Anyone can read platform usage data
- ALL 16 agent POST endpoints (OpenAI calls) — `/api/agents/warehouse`, `/api/agents/hr`, etc. POST handlers are direct exports, not wrapped with withTierEnforcement. Anyone can trigger OpenAI API calls at your expense.
- `/api/agents/3pl-portal/*` — All 8 portal API routes (orders, billing, inventory, chat) have zero auth
- `/api/portal/live/*` — All 6 live portal routes have zero auth

### MEDIUM (data exposure)
- `/api/agents/registry` — Exposes full agent registry
- `/api/agents/[slug]` — Read/write access to any agent
- `/api/agents/[slug]/export` — Export agent data
- `/api/branding` — Read/write branding config
- `/api/expenses` — Read/write expenses
- `/api/hubspot` — Read/write/delete HubSpot data
- `/api/proposals` — Read/write proposals
- `/api/tenant/companies` — List companies
- `/api/tenant/switch` — Switch tenant context
- `/api/transcription` — POST audio for transcription (OpenAI cost)

### LOW (by design for public access)
- Auth routes (/api/auth/login, /register, /forgot-password) — correct
- Stripe webhook — correct (verified by Stripe signature)
- Onboarding routes — likely correct for invite flow

## Duplicate API Routes (12 pairs)
Each agent has TWO API routes — a standalone data API and an agent API:

| Standalone (GET data) | Agent (GET data + POST AI) | Who Calls What |
|-----------------------|---------------------------|----------------|
| /api/cfo (129L) | /api/agents/cfo (105L) | Dashboard calls standalone. Console calls standalone. Neither calls agent POST. |
| /api/warehouse-data (112L) | /api/agents/warehouse (54L) | Console calls standalone. AI actions unreachable. |
| /api/sales-data (99L) | /api/agents/sales (159L) | Dashboard + console call standalone. |
| /api/collections (31L) | /api/agents/collections (98L) | Console calls agent route. |
| /api/compliance (18L) | /api/agents/compliance (70L) | Console calls agent route. |
| /api/finops (32L) | /api/agents/finops (99L) | Console calls agent route. |
| /api/hr (19L) | /api/agents/hr (95L) | Dashboard calls agent. Console calls agent. |
| /api/marketing (24L) | /api/agents/marketing (93L) | Dashboard calls agent. Console calls agent. |
| /api/operations (19L) | /api/agents/operations (93L) | Dashboard calls agent. Console calls agent. |
| /api/legal (18L) | /api/agents/legal (N/A) | Agent route doesn't exist for legal. |
| /api/seo (25L) | /api/agents/seo (84L) | Console calls agent route. |
| /api/wms-data (20L) | /api/agents/wms (71L) | Console calls agent route. |

Plus: `/api/auth` and `/api/auth/login` are identical. Login page uses neither (uses Supabase browser client directly).

## Dead Code
### Components never imported
- AdminLeaderboard.tsx
- ConversationIntelTab.tsx
- agent-modal.tsx
- authenticated-layout.tsx

### Lib files never imported
- lib/api-timing.ts
- lib/feature-flags.ts
- lib/storage-tracker.ts
- lib/useHubSpot.ts

### Email system — 7 functions defined, 0 called
lib/email.ts defines sendWelcomeEmail, sendTrialStartedEmail, sendTrialEndingEmail, sendUsageAlertEmail, sendPaymentFailedEmail, sendTeamInviteEmail, sendNewLeadNotification. None are imported or called anywhere in the codebase. Registration does not send welcome emails. Trial lifecycle emails never fire.

---

# PHASE 4 — ITEMS REQUIRING OWNER DECISION

1. **Agent consoles have no chat or free-form input.** 17 have AI action buttons that work. 5 are display-only. None accept typed instructions. Is chat/instruction input intended for consoles, or should users go to the landing pages (only 4 of which have chat)?

2. **Admin dashboard shows 0 users.** Calls /api/admin/users without Bearer token. That route requires verifyAdmin(). Should I add the auth token to the fetch call? (3-line fix, no rewrite.)

3. **Two admin APIs have zero auth: /api/admin/usage-stats and /api/admin/demo-toggles.** Should I add verifyAdmin() to both?

4. **All 16 agent POST endpoints (OpenAI calls) have zero auth.** Anyone can POST to /api/agents/warehouse with `action: 'optimize-routes'` and trigger an OpenAI API call at your expense. Should I add auth to POST handlers?

5. **CRM is 100% in-memory with hardcoded data.** /api/crm has 5 fake contacts, 8 fake deals. Resets on every deploy. Is this intended to move to Supabase, or integrate with external CRM?

6. **Admin sidebar dead link: /agents/sales/intel doesn't exist.** Should it be /agents/sales-intel/console?

7. **Three redirect pages go to dead anchors.** /how-it-works, /integrations, /beta redirect to /#how-it-works, /#integrations, /#beta. Only #agents exists on the landing page. Add the anchors, or redirect elsewhere?

8. **Admin integrations page saves nothing.** "Connect" sets local state only. Is this a placeholder, or should it wire to /api/integrations/connect?

9. **Sales reps, bug bash, and agent creator pages are fully hardcoded with zero backend.** Placeholders for future, or should they be hidden/removed?

10. **CFO Tools doc scanner is fake.** Uses `// Simulate scan` with Math.random(). Should this be wired to OCR, or removed?

11. **Warehouse console calls /api/warehouse-data instead of /api/agents/warehouse.** The AI actions (optimize-routes, zone-rebalance, shift-report) exist in /api/agents/warehouse but nothing in the UI triggers them. Wire them in?

12. **Orphan portal agent pages** at /portal/agent/hr and /portal/agent/seo are full functional dashboards with 6 tabs and POST actions, but nothing links to them. Keep, link from somewhere, or remove?

13. **12 duplicate API route pairs exist.** Standalone data routes and agent routes serve overlapping data. Consolidate, or keep both?

14. **Email system is completely dead.** 7 functions, 0 callers. Wire welcome emails to registration? Wire trial emails to subscription lifecycle?

15. **Landing page hero says "21 AI Employees" but there are 22.** Update the copy?

16. **Portal exists at two paths: /portal/[code]/* and /p/[code]/*.** Intentional short URL? Document it?

---

# PHASE 5 — PLATFORM MAP

## Navigation Structure
```
PUBLIC (no auth)
├── / (Landing)
├── /about
├── /solutions
├── /pricing → Stripe checkout
├── /contact → /api/leads
├── /careers
├── /case-studies/*
├── /privacy, /terms, /security
├── /demo/[slug] (22 agent demos)
├── /demo/3pl-portal
├── /login → Supabase auth
├── /register → /api/auth/register
├── /forgot-password → /api/auth/forgot-password
├── /invite/[token] → /api/admin/invites
└── /s/[slug] (sales rep portals)

AUTHENTICATED (AuthGuard)
├── /dashboard → aggregates 5 dept APIs
├── /marketplace → /api/marketplace
├── /settings
│   ├── /settings/integrations → /api/integrations/*
│   └── /settings/billing → Stripe portal
├── /billing → Supabase subscriptions
├── /onboarding/* → /api/onboarding/*
├── /agents/[slug]/console (22 consoles)
│   └── 17 with AI buttons, 5 display-only
├── /agents/cfo/* (tools, payables, finops, finops-pro, manage)
├── /agents/sales/coach (chat)
└── /agents/sales/solo (redirect)

ADMIN (AuthGuard requiredRole="admin")
├── /admin (dashboard)
├── /admin/users → /api/admin/users, manage-agents, update-role, etc.
├── /admin/leads → /api/leads
├── /admin/companies → /api/admin/companies
├── /admin/pricing → /api/admin/pricing, /api/stripe/products
├── /admin/analytics → /api/agents/click, /api/leads
├── /admin/chats → /api/chat/sessions
├── /admin/domains → /api/admin/domains
├── /admin/sales-crm → /api/crm (IN-MEMORY)
├── /admin/sales-reps (HARDCODED)
├── /admin/bug-bash (HARDCODED)
├── /admin/agent-creator (HARDCODED, no backend)
├── /admin/agents (display from registry)
├── /admin/demo-agents → /api/admin/demo-toggles (NO AUTH)
└── /admin/integrations (LOCAL STATE ONLY)

WAREHOUSE (own layout + session check)
├── /warehouse (dashboard)
├── /warehouse/receiving (read + write)
├── /warehouse/pallets (read + write)
├── /warehouse/inventory (read only)
├── /warehouse/orders (read only)
├── /warehouse/orders/new (creates orders + BOLs)
├── /warehouse/bol (read only)
├── /warehouse/purchase-orders (read only)
├── /warehouse/purchase-orders/new (creates POs)
├── /warehouse/asn (read + write)
└── /warehouse/customers (read + write)

3PL PORTAL (own layout)
├── /portal/[code] (dashboard)
├── /portal/[code]/inventory
├── /portal/[code]/orders
├── /portal/[code]/orders/new
├── /portal/[code]/billing
├── /portal/[code]/receiving
├── /portal/[code]/support
├── /portal/[code]/settings
└── /p/[code]/* (short URL aliases)

ORPHANED
├── /portal (agent grid for logged-in users)
├── /portal/agent/hr (full HR dashboard, not linked)
├── /portal/agent/seo (full SEO dashboard, not linked)
├── /portal/agent/[id] (generic agent view, not linked)
└── /dashboard/bug-bash (duplicate of /admin/bug-bash)
```

---

# PHASE 6 — EXECUTIVE DEFECT LIST

## CRITICAL
1. **All 16 agent POST endpoints are unauthenticated** — anyone can trigger OpenAI API calls. Direct cost exposure.
2. **/api/admin/demo-toggles has no auth** — anyone can toggle demos.
3. **/api/admin/usage-stats has no auth** — platform usage data exposed.
4. **Admin dashboard silently fails to load users** — missing auth token in fetch.

## HIGH
5. **5 agent consoles are display-only** (legal, support, training, warehouse, sales) — no AI actions, no chat, no input.
6. **Warehouse console calls wrong API** — /api/warehouse-data instead of /api/agents/warehouse. AI actions unreachable.
7. **CRM is in-memory** — all data lost on deploy.
8. **CFO Tools doc scanner is fake** — Math.random() results.
9. **Email system dead** — 7 functions, 0 callers. No welcome emails, no trial lifecycle.
10. **Admin integrations page saves nothing** — local state only.

## MEDIUM
11. Dead sidebar link: /agents/sales/intel
12. Three redirect pages to dead anchors (#how-it-works, #integrations, #beta)
13. Admin sales-reps, bug-bash, agent-creator are fully hardcoded
14. 12 duplicate API route pairs
15. 4 dead components, 4 dead lib files
16. Orphan portal agent pages (hr, seo, [id])
17. 3PL Portal console has zero API calls (hardcoded demo data only)

## LOW
18. Landing page says "21 AI Employees" (should be 22)
19. Unicode escapes remain in warehouse/layout.tsx
20. Duplicate /portal and /p route paths undocumented

---

# PHASE 7 — REMEDIATION ORDER

## 1. Fix First (security/cost exposure)
- Add auth to all agent POST endpoints (OpenAI cost exposure)
- Add verifyAdmin to /api/admin/demo-toggles and /api/admin/usage-stats
- Add Bearer token to admin dashboard fetch calls

## 2. Clarify With Owner First
- What interaction model do you want for agent consoles? (chat, instruction input, file upload, or current button-only?)
- CRM future: Supabase tables or external CRM integration?
- Email system: wire it up, or different approach?
- Orphan portal agent pages: keep, link, or remove?
- Hardcoded admin pages: hide or build out?

## 3. Fix Next (functionality)
- Wire warehouse console to /api/agents/warehouse for AI actions
- Add AI buttons to legal, support, training, sales consoles
- Fix CFO Tools doc scanner (wire to real OCR or remove)
- Wire admin integrations to actual API
- Fix dead sidebar link
- Fix redirect pages

## 4. Clean Up Later
- Consolidate duplicate API routes
- Remove dead components and lib files
- Clean unicode escapes in warehouse layout
- Document /portal vs /p paths
- Update landing page copy

## 5. Remove Entirely (candidates)
- /api/auth (duplicate of /api/auth/login, neither used by login page)
- /dashboard/bug-bash (duplicate of /admin/bug-bash)
- Dead components: AdminLeaderboard, ConversationIntelTab, agent-modal, authenticated-layout
- Dead libs: api-timing, feature-flags, storage-tracker, useHubSpot
