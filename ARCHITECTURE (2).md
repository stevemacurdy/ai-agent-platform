# WoulfAI Platform Architecture
## Four-Layer System Design — February 2026 (Updated)

---

## THE 11 AGENTS

| # | Agent | Status | Progress | Live Routes |
|---|-------|--------|----------|-------------|
| 1 | **Sales Agent** | LIVE | 95% | `/portal/agent/sales` |
| 2 | **CFO Agent** | LIVE | 92% | `/agents/cfo/console`, `/agents/cfo/tools` |
| 3 | **FinOps Agent** | LIVE | 88% | `/agents/cfo/finops`, `/agents/cfo/finops-pro` |
| 4 | **Payables Agent** | LIVE | 85% | `/agents/cfo/payables` |
| 5 | **Collections Agent** | LIVE | 80% | `/agents/cfo/console` (Collections tab) |
| 6 | **HR Agent** | LIVE | 95% | `/portal/agent/hr` |
| 7 | **Operations Agent** | LIVE | 95% | `/portal/agent/operations` |
| 8 | **Legal Agent** | LIVE | 95% | `/portal/agent/legal` |
| 9 | **Marketing Agent** | LIVE | 95% | `/portal/agent/marketing` |
| 10 | **WMS Agent** | LIVE | 95% | `/portal/agent/wms` |
| 11 | **Compliance Agent** | LIVE | 95% | `/portal/agent/compliance` |

### Additional Agents (Built in Current Sprint)
| # | Agent | Status | Progress | Live Routes |
|---|-------|--------|----------|-------------|
| 12 | **SEO Agent** | LIVE | 95% | `/portal/agent/seo` |
| 13 | **Supply Chain Agent** | LIVE | 95% | `/portal/agent/supply-chain` |
| 14 | **Customer Portal** | LIVE | 95% | `/portal/agent/customer-portal` |

---

## LAYER 1: PUBLIC LANDING PAGE ("The Presentation Board")

### Route: `/`

Displays all agents in a grid. Each card shows:
- Agent icon + name
- Animated progress bar (percentage from `agents` table)
- Status badge: "LIVE" (green pulse) or "IN DEVELOPMENT" (amber)

### Click Logic:
```
if (agent.status === 'live') {
  → /onboarding?agent={slug}          // Sign Up / Onboarding
} else {
  → /demo/{slug}                       // Demo Environment
  trackClick(agent.slug, 'landing')    // Analytics
}
```

### Data Source: `GET /api/agents` returns the registry.

---

## LAYER 2: DEMO ENVIRONMENT ("Mock Layer")

### Route: `/demo/{agent-slug}`

Two layers of interaction, all using mock data with a visible "DEMO MODE" banner.

**Layer 1 — Agent Dashboard** (`/demo/{slug}`)
High-level KPI cards, summary charts, and action buttons. Think of this as the "executive view" — the user sees what the agent does without touching real data.

**Layer 2 — Feature Deep-Dive** (`/demo/{slug}/{feature}`)
Click any KPI or action button to drill into mock reports and tools. For example:
- `/demo/cfo/invoices` → Mock invoice list
- `/demo/sales/pipeline` → Mock deal pipeline
- `/demo/hr/onboarding` → Mock employee onboarding flow

### Conversion Logic:
Every demo page has an "Order This Agent" or "Get Started" CTA. Clicking it:

```
if (agent.status === 'live') {
  → /onboarding?agent={slug}
} else {
  → showLeadCaptureModal()
  onSubmit: POST /api/leads { name, email, agent_slug }
  → "This agent is receiving a serious upgrade.
     We've saved your interest and will notify
     you when it's ready."
}
```

### State Management — Mock vs Live:
```typescript
// lib/agent-context.tsx
const AgentContext = createContext<{ mode: 'demo' | 'live' }>({ mode: 'demo' })

// Wraps ALL demo routes
// /demo/* → mode: 'demo' → useMockData()
// /agents/* → mode: 'live' → useLiveData()
// /portal/agent/* → mode: 'live' → useLiveData()

// Components check context:
function InvoiceList() {
  const { mode } = useAgentContext()
  const data = mode === 'demo' ? MOCK_INVOICES : await fetchLiveInvoices()
  // Render identically — same component, different data source
}
```

Visual indicators:
- **Demo**: Orange "DEMO MODE — Using sample data" banner at top
- **Live**: No banner. Green "LIVE" badge in sidebar.

---

## LAYER 3: LIVE PORTAL ("Operational Space")

### Route: `/portal/agent/{slug}` (new agents) and `/agents/{category}/{tool}` (legacy finance agents)

Guarded by auth + role-based access. Multi-tenant data isolation via companyId.

### Access Flow:
```
User logs in → /login (email + password)
  → Role picker (if multiple eligible roles)
  → /portal (agent grid filtered by user.agents array)
  → Click agent → /portal/agent/{slug} (live, tenant-scoped data)
```

### Multi-Tenant Permissions:
```typescript
// Users only see agents assigned to them in the user store
// All data queries filtered by user.companyId
// Organization Lead role → only sees Customer Portal
// Employee/Admin → sees internal agents based on user.agents array
```

### Authentication System:
- Admin invites user → system generates password → modal displays credentials
- User logs in with email + password
- Session stored in localStorage (woulfai_session)
- Portal filters agents based on user.agents array
- "Switch Role" button for users with multiple eligible roles

### Existing Live Routes (all built):
```
# Legacy Finance Routes
/agents/cfo/console        → CFO Intelligence Console
/agents/cfo/tools          → Odoo Write-back, Doc Scanner
/agents/cfo/finops         → AP, Debt, Labor, Forecast, Sandbox
/agents/cfo/finops-pro     → Tax, Duplicates, Anomaly, Vendor, Lending
/agents/cfo/payables       → Intake, Review, Pay, Reconcile

# New Agent Architecture Routes (6-tab dashboards)
/portal/agent/sales        → Solo Salesman (Pipeline, Intel, Expenses, Mentor, Commissions, CRM)
/portal/agent/seo          → SEO Command Center (Rankings, Content, Technical, Backlinks, Local, Action Hub)
/portal/agent/marketing    → Marketing Nerve Center (Command, Campaigns, Content, Ads, Funnel, Action Hub)
/portal/agent/wms          → Warehouse Ops (Command, Inventory, Inbound, Outbound, Zones, Action Hub)
/portal/agent/hr           → People Operations (Command, Directory, Onboarding, PTO, Performance, Action Hub)
/portal/agent/operations   → Field Operations (Command, Projects, Work Orders, Resources, Field Reports, Action Hub)
/portal/agent/legal        → Legal Command (Contracts, Clause Library, Compliance, Insurance, Risk, Action Hub)
/portal/agent/compliance   → Compliance Center (Audits, Policies, Training, Incidents, Regulatory, Action Hub)
/portal/agent/supply-chain → Supply Chain (Command, Inventory IQ, Logistics, Forecasting, Vendors, Action Hub)
/portal/agent/customer-portal → Customer Portal (Dashboard, Inventory, Orders, Inbound, Billing, Support)
```

---

## LAYER 4: ADMIN DASHBOARD ("Project Management")

### Route: `/admin`

### Agent Management Panel:
Each agent card shows:
- **Progress bar** (from `agents.completion_pct`)
- **Click counter** (from `agent_clicks` aggregation)
- **Status toggle** (live/dev)

### User Management (`/admin/users`):
- Inline role editing (Super Admin, Admin, Employee, Beta Tester, Organization Lead)
- Agent access picker (checkbox grid for all agents)
- Search/filter, suspend/remove actions
- Invite system with auto-generated passwords

### Developer View (click to expand):
```
[CFO Agent — 92%] [438 clicks] [LIVE]
  ├── ✅ Invoice CRUD + Audit Log
  ├── ✅ AI Collections (4-tier)
  ├── ✅ Financial Health Score
  ├── ✅ Cashflow Forecast
  ├── ✅ Refinance Alert
  ├── 🔲 PDF Export
  └── 🔲 Plaid Live Bank Feed
```

### Analytics (`/admin/analytics`):
```
GET /api/admin/analytics
Returns:
  - Clicks per agent (daily/weekly/monthly)
  - Lead captures per agent
  - Conversion funnel: Landing → Demo → Lead → Onboard
  - Active users per agent
```

---

## ROUTING MAP

```
/                                → Landing Page (agent grid)
/demo/:slug                     → Demo Dashboard (Layer 1)
/demo/:slug/:feature            → Demo Deep-Dive (Layer 2)
/onboarding                     → Agent Onboarding Form
/login                          → Authentication (email + password + role picker)
/portal                         → User Portal (their assigned agents)

# Legacy Finance Routes
/agents/cfo/console             → LIVE CFO Console
/agents/cfo/tools               → LIVE CFO Tools
/agents/cfo/finops              → LIVE FinOps Suite
/agents/cfo/finops-pro          → LIVE FinOps Pro
/agents/cfo/payables            → LIVE Payables Engine

# New Agent Dashboard Routes (6-tab pattern)
/portal/agent/sales             → LIVE Sales Agent
/portal/agent/seo               → LIVE SEO Agent
/portal/agent/marketing         → LIVE Marketing Agent
/portal/agent/wms               → LIVE WMS Agent
/portal/agent/hr                → LIVE HR Agent
/portal/agent/operations        → LIVE Operations Agent
/portal/agent/legal             → LIVE Legal Agent
/portal/agent/compliance        → LIVE Compliance Agent
/portal/agent/supply-chain      → LIVE Supply Chain Agent
/portal/agent/customer-portal   → LIVE Customer Portal

# Admin Routes
/admin                          → Admin Command Center
/admin/users                    → User Management
/admin/bug-bash                 → Beta Tester Tools
/admin/analytics                → Agent Analytics

# API Routes
/api/agents                     → Agent Registry
/api/agents/click               → Click Tracking
/api/agents/{slug}              → Per-agent data (GET/POST)
/api/leads                      → Lead Capture
/api/admin/analytics            → Admin Analytics
/api/auth/login                 → Authentication
/api/auth/register              → Self-Service Registration
/api/auth/forgot-password       → Password Reset
/api/auth/invite                → Admin Invite System
/api/pricing                    → Dynamic Pricing Engine
/api/transcription              → Conversation Intelligence
```

---

## DATABASE SCHEMA

### `agents` table
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,         -- 'cfo', 'sales', 'hr', etc.
  name TEXT NOT NULL,                -- 'CFO Agent'
  description TEXT,                  -- One-liner
  icon TEXT,                         -- Emoji or icon class
  status TEXT NOT NULL DEFAULT 'dev', -- 'live' | 'dev' | 'beta'
  completion_pct INTEGER DEFAULT 0,  -- 0-100
  category TEXT,                     -- 'finance', 'sales', 'operations', 'compliance'
  live_route TEXT,                   -- '/portal/agent/hr' (null if dev)
  demo_route TEXT,                   -- '/demo/hr'
  features JSONB DEFAULT '[]',       -- [{ name, status: 'done'|'backlog'|'debt' }]
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `agent_clicks` table
```sql
CREATE TABLE agent_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  source TEXT NOT NULL,              -- 'landing', 'demo', 'sidebar', 'dashboard'
  user_id UUID REFERENCES profiles(id),  -- null for anonymous
  session_id TEXT,                   -- anonymous session tracking
  metadata JSONB DEFAULT '{}',       -- { referrer, utm_source, etc. }
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agent_clicks_slug ON agent_clicks(agent_slug);
CREATE INDEX idx_agent_clicks_date ON agent_clicks(created_at);
```

### `leads` table
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  source TEXT DEFAULT 'demo',        -- 'demo', 'landing', 'pricing'
  status TEXT DEFAULT 'new',         -- 'new', 'contacted', 'converted', 'closed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `user_agents` table
```sql
CREATE TABLE user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  onboarded_at TIMESTAMPTZ DEFAULT now(),
  config JSONB DEFAULT '{}',         -- Agent-specific settings
  UNIQUE(user_id, agent_slug)
);

ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own agents" ON user_agents
  FOR SELECT USING (user_id = auth.uid());
```

---

## MULTI-TENANT ARCHITECTURE

### Company-Scoped Data Isolation
Every agent's data is scoped by `companyId`. Users only see data belonging to their company.

### Role Tiers
| Role | Access | Description |
|------|--------|-------------|
| Super Admin | All agents, all companies | Platform owner (Steve) |
| Admin | All agents, own company | Company administrator |
| Employee | Assigned agents, own company | Internal staff |
| Beta Tester | Assigned agents, own company | Testing access |
| Organization Lead | Customer Portal only, own company | External customer |

### Demo Companies
| Company | ID | Users | Profile |
|---------|-----|-------|---------|
| Woulf Group | woulf | Steve (Super Admin), Diana, Marcus, Sarah | Internal — all agents |
| Chen Logistics | chen | Angela Chen (Org Lead) | 3PL customer — 45 SKUs, premium tier |
| Bradley Logistics | bradley | Tom Bradley (Org Lead) | Project customer — racking install 65% |
| Kim Enterprises | kim | David Kim (Org Lead) | Onboarding — first ASN pending |

---

## AGENT ARCHITECTURE PATTERN

All agents follow a consistent 7-file installer pattern:

```
agent-name-agent.js               — Node.js installer script
├── lib/{agent}/schema.prisma      — Data models (Prisma format)
├── lib/{agent}/{agent}-data.ts    — Tenant-scoped demo data
├── lib/{agent}/system-prompt.ts   — AI brain with proactive behaviors
├── lib/{agent}/integrations.ts    — External API clients + cross-agent bridges
├── app/api/agents/{agent}/route.ts — GET (data) + POST (actions) API
└── app/portal/agent/{agent}/page.tsx — 6-tab dashboard UI
```

### Standard 6-Tab Dashboard Layout:
1. **Command Center** — Daily briefing, KPI cards, AI insights, market signals
2. **Primary Data View** — Core data table (inventory, contracts, employees, etc.)
3. **Workflow Tab** — Active processes (orders, work orders, campaigns, etc.)
4. **Secondary View** — Supporting data (forecasting, training, compliance, etc.)
5. **Third View** — Additional module (vendors, resources, incidents, etc.)
6. **Action Hub** — AI insights with approve/execute buttons, pending actions

### Cross-Agent Nervous System:
Agents communicate via internal API bridges:
- Operations → HR (crew availability), WMS (material staging), Legal (permits)
- Supply Chain → WMS (inventory), CFO (AR/AP), Operations (project materials)
- Customer Portal → WMS (inventory), Operations (projects), CFO (billing), Legal (contracts)
- Compliance → Legal (violations), HR (training), Operations (safety)
- Marketing → Sales (funnel), SEO (content), CFO (budget)

---

## CLICK TRACKING IMPLEMENTATION

### Client-Side (fire-and-forget):
```typescript
// lib/track.ts
export function trackClick(agentSlug: string, source: string) {
  fetch('/api/agents/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_slug: agentSlug,
      source,
      session_id: getOrCreateSessionId(),
    }),
  }).catch(() => {})
}
```

### Server-Side:
```typescript
// POST /api/agents/click
// Inserts into agent_clicks, returns 204 No Content
// Rate limited: max 10 clicks per session per minute
```

---

## PRICING TIERS

| Tier | Price | Agents | Target |
|------|-------|--------|--------|
| Starter | $499/mo | Up to 3 agents | Small businesses |
| Professional | $1,200/mo | Up to 7 agents | Growing companies |
| Enterprise | $2,499/mo | All agents + API access | Large organizations |

### Integrations Available (15):
- **CRM**: HubSpot, Salesforce, NetSuite, Pipedrive, Zoho
- **Accounting**: QuickBooks, Xero, FreshBooks, Wave, Sage, Odoo, NetSuite Financials, SAP, Oracle, MYOB

---

## PRODUCTION DEPLOYMENT

### Stack:
- **Framework**: Next.js 14 (App Router)
- **Hosting**: Vercel (vercel.com)
- **Domain**: woulfai.com
- **Auth**: In-memory user store (production: Supabase Auth)
- **Database**: In-memory stores (production: Supabase/PostgreSQL)
- **Mobile**: React Native / Expo SDK 54 (EAS Build)

### Deploy Commands:
```bash
npm run build
vercel --prod
```

### Environment Variables (11 required):
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY, ODOO_URL, ODOO_DB, ODOO_API_KEY
HUBSPOT_API_KEY, ANTHROPIC_API_KEY, DEEPGRAM_API_KEY
STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

## IMPLEMENTATION STATUS

### ✅ Completed (This Sprint):
1. All 11 original agents fully built with 6-tab dashboards
2. 3 additional agents (SEO, Supply Chain, Customer Portal)
3. Multi-tenant data isolation with companyId filtering
4. Role-based access control (5 tiers)
5. Cross-agent bridges and nervous system
6. Production deployment to Vercel + custom domain
7. React Native mobile app (Expo SDK 54)
8. Conversation Intelligence with live transcription
9. Dynamic pricing engine
10. Admin user management with invite system

### 🔲 Phase B (Next Sprint):
1. Demo wrapper pages for all agents
2. Onboarding flow for new customers
3. Supabase migration (replace in-memory stores)
4. Plaid bank feed integration
5. PDF export across all agents
6. Full analytics dashboard with charts
7. EDI gateway for enterprise customers (940/943/944/945)
8. Email/webhook notification system
