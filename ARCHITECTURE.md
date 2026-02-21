# WoulfAI Platform Architecture
## Four-Layer System Design — February 2026

---

## THE 11 AGENTS

| # | Agent | Status | Progress | Live Routes |
|---|-------|--------|----------|-------------|
| 1 | **Sales Agent** | LIVE | 90% | `/admin/sales-reps`, `/admin/sales-crm`, `/agents/sales/intel` |
| 2 | **CFO Agent** | LIVE | 92% | `/agents/cfo/console`, `/agents/cfo/tools` |
| 3 | **FinOps Agent** | LIVE | 88% | `/agents/cfo/finops`, `/agents/cfo/finops-pro` |
| 4 | **Payables Agent** | LIVE | 85% | `/agents/cfo/payables` |
| 5 | **Collections Agent** | LIVE | 80% | `/agents/cfo/console` (Collections tab) |
| 6 | **HR Agent** | DEV | 25% | — |
| 7 | **Operations Agent** | DEV | 30% | — |
| 8 | **Legal Agent** | DEV | 20% | — |
| 9 | **Marketing Agent** | DEV | 15% | — |
| 10 | **WMS Agent** | DEV | 10% | — |
| 11 | **Compliance Agent** | DEV | 10% | — |

---

## LAYER 1: PUBLIC LANDING PAGE ("The Presentation Board")

### Route: `/`

Displays all 11 agents in a grid. Each card shows:
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

### Route: `/agents/{category}/{tool}`

Guarded by auth + onboarding completion for that agent.

### Access Flow:
```
User clicks "Live" agent on landing page
  → /onboarding?agent=cfo
  → Collects: Company name, ERP system, data connections, billing
  → On complete: INSERT into user_agents { user_id, agent_slug, onboarded_at }
  → Redirect to /agents/cfo/console (live, real data)
```

### Multi-Tenant Permissions:
```sql
-- Users only see agents they've onboarded
SELECT a.* FROM agents a
JOIN user_agents ua ON ua.agent_slug = a.slug
WHERE ua.user_id = auth.uid()
```

### Existing Live Routes (already built):
```
/agents/cfo/console        → CFO Intelligence Console
/agents/cfo/tools          → Odoo Write-back, Doc Scanner
/agents/cfo/finops         → AP, Debt, Labor, Forecast, Sandbox
/agents/cfo/finops-pro     → Tax, Duplicates, Anomaly, Vendor, Lending
/agents/cfo/payables       → Intake, Review, Pay, Reconcile
/agents/sales/intel        → Behavioral Profiles, Battle Cards
/admin/sales-crm           → Pipeline, Contacts, Activities
/admin/sales-reps          → Team Management
```

---

## LAYER 4: ADMIN DASHBOARD ("Project Management")

### Route: `/admin`

### Agent Management Panel:
Each agent card shows:
- **Progress bar** (from `agents.completion_pct`)
- **Click counter** (from `agent_clicks` aggregation)
- **Status toggle** (live/dev)

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

### Analytics:
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
/                                → Landing Page (11-agent grid)
/demo/:slug                     → Demo Dashboard (Layer 1)
/demo/:slug/:feature            → Demo Deep-Dive (Layer 2)
/onboarding                     → Agent Onboarding Form
/login                          → Authentication
/dashboard                      → User Dashboard (their onboarded agents)

/agents/cfo/console             → LIVE CFO Console
/agents/cfo/tools               → LIVE CFO Tools
/agents/cfo/finops              → LIVE FinOps Suite
/agents/cfo/finops-pro          → LIVE FinOps Pro
/agents/cfo/payables            → LIVE Payables Engine
/agents/sales/intel             → LIVE Sales Intel

/admin                          → Admin Command Center
/admin/sales-crm                → Sales CRM
/admin/sales-reps               → Sales Team
/admin/users                    → User Management
/admin/bug-bash                 → Beta Tester Tools
/admin/analytics                → Agent Analytics

/api/agents                     → Agent Registry
/api/agents/click               → Click Tracking
/api/leads                      → Lead Capture
/api/admin/analytics            → Admin Analytics
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
  live_route TEXT,                   -- '/agents/cfo/console' (null if dev)
  demo_route TEXT,                   -- '/demo/cfo'
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

-- Index for fast aggregation
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

-- RLS: Users see only their agents
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own agents" ON user_agents
  FOR SELECT USING (user_id = auth.uid());
```

---

## CLICK TRACKING IMPLEMENTATION

### Client-Side (fire-and-forget):
```typescript
// lib/track.ts
export function trackClick(agentSlug: string, source: string) {
  // Non-blocking — never awaited, never fails visibly
  fetch('/api/agents/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_slug: agentSlug,
      source,
      session_id: getOrCreateSessionId(),
    }),
  }).catch(() => {}) // Silently swallow errors
}

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem('woulfai_sid')
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('woulfai_sid', id) }
  return id
}
```

### Server-Side:
```typescript
// POST /api/agents/click
// Inserts into agent_clicks, returns 204 No Content
// Rate limited: max 10 clicks per session per minute
```

### Admin Query:
```sql
-- Clicks per agent, last 30 days
SELECT
  a.name,
  a.slug,
  a.completion_pct,
  COUNT(c.id) as total_clicks,
  COUNT(DISTINCT c.session_id) as unique_sessions,
  COUNT(CASE WHEN c.created_at > now() - interval '7 days' THEN 1 END) as clicks_7d,
  COUNT(CASE WHEN c.created_at > now() - interval '1 day' THEN 1 END) as clicks_24h
FROM agents a
LEFT JOIN agent_clicks c ON c.agent_slug = a.slug
  AND c.created_at > now() - interval '30 days'
GROUP BY a.id
ORDER BY total_clicks DESC;
```

---

## STATE MANAGEMENT: MOCK vs LIVE

### Pattern: Data Provider with Mode Context

```typescript
// Every data-fetching hook checks mode:
function useInvoices() {
  const { mode } = useAgentContext()

  if (mode === 'demo') {
    return { data: MOCK_INVOICES, loading: false }
  }

  // Live: actual API call
  const [data, setData] = useState(null)
  useEffect(() => { fetchInvoices().then(setData) }, [])
  return { data, loading: !data }
}
```

### Visual Differentiation:
- **Demo mode**: Orange top banner, watermarked backgrounds, "Sample" labels on data
- **Live mode**: Clean interface, no banners, real data labels
- **Shared components**: Identical rendering logic — only the data source changes

### Route-Based Mode Detection:
```typescript
// middleware.ts
if (pathname.startsWith('/demo/')) {
  // Inject mode=demo into request context
}
if (pathname.startsWith('/agents/')) {
  // Require auth, inject mode=live
}
```

---

## IMPLEMENTATION PRIORITY

### Phase A (This Sprint):
1. Agent Registry API + seed data for 11 agents
2. Click tracking API + client tracker
3. Lead capture API + modal component
4. Landing page agent grid (replace current landing)
5. Admin analytics panel

### Phase B (Next Sprint):
6. Demo wrapper component + mock data layer
7. Demo pages for live agents (CFO, Sales, FinOps)
8. Onboarding flow
9. User-agent permission gate

### Phase C (Following):
10. Demo pages for dev agents (HR, Ops, Legal, etc.)
11. Full analytics dashboard with charts
12. Conversion funnel tracking
