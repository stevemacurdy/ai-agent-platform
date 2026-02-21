# Onboarding Wizard — Wiring Guide

## What Was Installed

| File | Purpose |
|------|---------|
| `lib/onboarding/agent-steps.ts` | Per-agent step configurations (all 14 agents + 3PL) |
| `app/onboarding/page.tsx` | Entry hall — agent selection grid |
| `app/onboarding/[agentId]/page.tsx` | Adaptive wizard — multi-step per agent |
| `app/onboarding/layout.tsx` | Clean layout (no sidebar) |
| `app/api/onboarding/progress/route.ts` | Save/resume API |
| `app/api/onboarding/verify/route.ts` | Integration success check |
| `components/navigation/TenantSwitcher.tsx` | Header Quick Switch (uses useTenant) |
| `components/onboarding/MagicMapper.tsx` | AI CSV column mapper with preview |
| `supabase/migrations/008_onboarding_sessions.sql` | Onboarding sessions table + analytics view |

## Required Steps

### 1. Run SQL Migration
```bash
psql $DATABASE_URL -f supabase/migrations/008_onboarding_sessions.sql
```

### 2. Add TenantSwitcher to Header
In your main layout or header component:
```tsx
import TenantSwitcher from '@/components/navigation/TenantSwitcher';

// In your header bar:
<TenantSwitcher />
```

### 3. Landing Page CTA Links
Update your landing page agent cards to link to:
```
/onboarding?agent={slug}   // For live agents
/demo/{slug}                // For demo agents
```

### 4. Build & Deploy
```bash
npm run build
vercel --prod
```

## How It Works

1. User visits `/onboarding` → sees agent grid
2. Clicks an agent → enters adaptive wizard
3. Wizard shows 2-5 steps based on agent type
4. Each step saved to `onboarding_sessions` (resume anytime)
5. Integration steps validate real connections (Odoo, HubSpot, etc.)
6. "Aha Moment" step shows first AI insight
7. "Enter Dashboard" redirects to live agent route
8. `user_agents` record created → portal access unlocked

## 3PL Customer Flow

The Customer Portal agent has its own specialized flow:
1. Rate card digital signature
2. Item master CSV upload (MagicMapper)
3. First ASN scheduling
4. Portal activation
