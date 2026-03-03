# WoulfAI — Completion Package Deployment Guide

## What's Included (29 files)

### Phase 2.1 — 18 Agent Console Pages
Every agent now has a full intelligence console with KPIs, data tables, AI recommendations, and tab navigation. Each fetches from its existing `/api/agents/{slug}` route and falls back to realistic demo data.

| Department | Agents |
|---|---|
| **Finance** | Collections, FinOps, Payables |
| **Sales** | Sales Intel, Sales Coach, Marketing, SEO |
| **Operations** | Supply Chain, WMS, Operations |
| **People** | HR, Support, Training |
| **Legal** | Legal, Compliance |
| **Strategy** | Research, Org Lead, STR Analyst |

All share `components/consoles/AgentConsole.tsx` — a reusable console layout with KPI cards, tab nav, data tables, and recommendation panels.

### Phase 2.3 — Onboarding Wizard
5-step wizard at `/onboarding/welcome`:
1. Welcome screen
2. Company info (name, industry, team size)
3. Connect tools (QuickBooks, Xero, HubSpot, etc.)
4. Invite team members
5. Pick AI Employees by department

Saves to `onboarding_progress` table via `/api/onboarding/complete`.

### Phase 4.2-4.3 — Usage Enforcement
- `lib/usage-enforcement.ts` — `withTierEnforcement()` HOF wraps agent routes, returns 429 when limits exceeded
- `components/usage/UsageBanner.tsx` — Shows warning banners at 50/75/90/100% usage
- Tier limits: Starter (500), Growth (2,000), Professional (10,000), Enterprise (unlimited)
- Seat limit checking via `checkSeatLimit()`

### Phase 5.2 — Contact / Lead Capture
- `app/contact/page.tsx` — Full contact form with name, email, company, phone, interest, message
- `app/api/leads/route.ts` — Saves to `leads` table + sends notification via Resend
- Handles `?interest=enterprise` for enterprise CTA routing

### Phase 5.4 — SEO
- `lib/seo.ts` — JSON-LD structured data, OG tags, meta description
- `app/sitemap.xml/route.ts` — Dynamic sitemap covering all 21 agents + static pages

### Phase 6.4 — Admin Dashboard
- `app/admin/page.tsx` — Overview with KPIs, agent usage chart, recent users table
- Tabs: Overview, Users, Agents, Revenue

---

## Deployment

### Option A: Generator Script (Recommended)
```bash
cd ~/Desktop/ai-ecosystem/ai-agent-platform

# Copy generator to project root
cp ~/Downloads/generate-all.js .

# Run it — creates all 29 files in correct directories
node generate-all.js

# Remove generator
rm generate-all.js

# Build check
npm run build

# Deploy
git add -A && git commit -m "complete: 18 consoles, enforcement, onboarding, admin, leads, SEO" && git push
```

### Option B: Extract Zip
```bash
cd ~/Desktop/ai-ecosystem/ai-agent-platform

# Extract — preserves directory structure, merges with existing
unzip -o ~/Downloads/woulfai-completion-package.zip -x "generate-all.js" -x "{consoles,api-routes,lib,onboarding,admin,pages}/"

# Build check
npm run build

# Deploy
git add -A && git commit -m "complete: 18 consoles, enforcement, onboarding, admin, leads, SEO" && git push
```

---

## Post-Deploy: Wire Enforcement Into Routes

The enforcement middleware is ready but needs to be applied to agent routes. For each agent route in `app/api/agents/*/route.ts`:

```typescript
// Before:
export async function GET(req: NextRequest) {
  // ... handler code
}

// After:
import { withTierEnforcement } from '@/lib/usage-enforcement';

export const GET = withTierEnforcement(async (req: NextRequest) => {
  // ... same handler code
});
```

### Add UsageBanner to PlatformShell

In `components/layout/PlatformShell.tsx`, add:
```tsx
import UsageBanner from '@/components/usage/UsageBanner';

// Inside the return, after the header:
<UsageBanner />
```

### Add SEO metadata to layout

In `app/layout.tsx`, add:
```tsx
import { generateSeoMetadata, JSON_LD } from '@/lib/seo';

export const metadata = generateSeoMetadata();

// In the <head> section:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
```

---

## DB Requirements

If `leads` table doesn't exist yet:
```sql
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  interest TEXT DEFAULT 'general',
  message TEXT,
  source TEXT DEFAULT 'contact_form',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

If `onboarding_progress` table doesn't exist:
```sql
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE,
  company_name TEXT,
  industry TEXT,
  team_size TEXT,
  selected_integrations JSONB DEFAULT '[]',
  team_emails JSONB DEFAULT '[]',
  selected_agents JSONB DEFAULT '[]',
  status TEXT DEFAULT 'in_progress',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Completion Scorecard

| Phase | Item | Status |
|---|---|---|
| 1 | Stripe live + checkout + email + middleware | ✅ Done (prior) |
| 2.1 | 18 agent console pages | ✅ **This package** |
| 2.2 | Dashboard aggregation | ✅ Done (prior) |
| 2.3 | Onboarding wizard | ✅ **This package** |
| 2.4 | Sidebar navigation | ✅ Done (prior) |
| 3.1 | Unified.to integration | ✅ Done (prior) |
| 4.1 | Usage tracking (shadow) | ✅ Done (prior) |
| 4.2 | Usage enforcement (hard) | ✅ **This package** |
| 4.3 | Usage warnings | ✅ **This package** |
| 4.4 | Seat limits | ✅ **This package** (in enforcement) |
| 5.1 | Landing page | ✅ Done (prior) |
| 5.2 | Contact / lead capture | ✅ **This package** |
| 5.4 | SEO (JSON-LD, sitemap) | ✅ **This package** |
| 6.1 | Mobile responsive | ✅ Done (prior) |
| 6.3 | Error/loading states | ✅ Done (prior) |
| 6.4 | Admin dashboard | ✅ **This package** |
