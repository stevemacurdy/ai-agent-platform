# WoulfAI — Deploy 5 Agents

## What Was Created

### Source Files
| File | Purpose |
|------|---------|
| `lib/agents/agent-registry.ts` | Single source of truth for all 14 agents |
| `lib/providers/tenant-provider.tsx` | Global Business Switcher context |
| `components/agents/agent-dashboard-shell.tsx` | Universal wrapper (Submit/Edit/Download) |
| `components/dashboard/sidebar-nav.tsx` | Auto-built sidebar from registry |
| `app/agents/org-lead/page.tsx` | Organization Lead live page |
| `app/agents/seo/page.tsx` | SEO Agent live page |
| `app/agents/marketing/page.tsx` | Marketing Agent live page |
| `app/agents/wms/page.tsx` | WMS Agent live page |
| `app/agents/hr/page.tsx` | HR Agent live page |

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/comp-agent` | POST | Comp agents for a company (bypass Stripe) |
| `/api/tenant/switch` | POST | Switch active company (sets cookie) |
| `/api/tenant/companies` | GET | List user's companies |
| `/api/agents/[slug]` | GET/POST | Read/write agent data by company |
| `/api/agents/[slug]/export` | GET | CSV export of agent data |

### SQL Migration
| File | What It Creates |
|------|-----------------|
| `supabase/migrations/005_deploy_5_agents.sql` | Agent data tables, KPI tables, RLS policies, comp functions |

## Deploy Steps

### 1. Run the SQL Migration
```bash
# Via Supabase CLI
supabase db push

# Or directly
psql $DATABASE_URL -f supabase/migrations/005_deploy_5_agents.sql
```

### 2. Wire TenantProvider into Layout
In your root layout (`app/layout.tsx`), wrap children:

```tsx
import { TenantProvider } from '@/lib/providers/tenant-provider';

// Inside your layout:
<TenantProvider>
  {children}
</TenantProvider>
```

### 3. Add SidebarNav to Dashboard Layout
In your dashboard layout (`app/(dashboard)/layout.tsx` or similar):

```tsx
import SidebarNav from '@/components/dashboard/sidebar-nav';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <SidebarNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### 4. Comp Your Businesses
```bash
# Via API
curl -X POST https://www.woulfai.com/api/admin/comp-agent \
  -H 'Content-Type: application/json' \
  -d '{"companyId": "<your-company-uuid>", "compAll": true}'

# Or via SQL
SELECT admin_comp_all_agents('<your-company-uuid>');
```

### 5. Build & Deploy
```bash
npm run build
vercel --prod
```

## Business Switcher Behavior
When you switch companies via the dropdown:
1. `POST /api/tenant/switch` validates membership
2. Sets `companyId` cookie (server-side accessible)
3. Calls `router.refresh()` — all server components re-fetch
4. Every agent page re-queries with the new companyId
5. KPIs, data tables, and exports all show new company's data

## Empty States
Every agent has a clean empty state defined in `agent-registry.ts`.
When no data exists for a company, users see the agent icon,
a helpful message, and a "Get Started" button.
