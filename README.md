# WoulfAI — AI Agent Platform

**Enterprise AI agents for warehouse operations and business automation.**

Built by [Woulf Group](https://woulfgroup.com) · Live at [woulfai.com](https://www.woulfai.com)

---

## What It Does

WoulfAI is a multi-tenant SaaS platform that gives businesses access to specialized AI agents — each purpose-built for a specific function like warehouse management, finance operations, sales coaching, HR, compliance, and more.

Companies sign up, get a private workspace, and activate the agents they need. Every agent runs inside full tenant isolation so data never crosses company boundaries.

### 21 Live Agents

| Category | Agents |
|---|---|
| **Operations** | WMS, Supply Chain, Operations |
| **Finance** | CFO (Console, FinOps, Payables, Tools), Compliance |
| **Revenue** | Sales (Intel, Coach, Solo), Marketing, SEO |
| **People** | HR, Training, Support |
| **Strategy** | Research, Legal, Org Lead |
| **Specialty** | STR (Short-Term Rental) |

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS |
| **Auth** | Supabase Auth (JWT, RBAC, RLS on every table) |
| **Database** | Supabase (PostgreSQL) with Row Level Security |
| **AI** | OpenAI, Anthropic (via tenant-isolated LLM client) |
| **Payments** | Stripe (3 tiers: Starter, Professional, Enterprise) |
| **Email** | Resend (transactional, password reset) |
| **Hosting** | Vercel (serverless, edge middleware) |
| **Monitoring** | Sentry (error tracking, performance) |
| **CI/CD** | GitHub Actions (dependency scanning, build checks) |

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Vercel Edge                 │
│          (Middleware · Rate Limiting)        │
├─────────────────────────────────────────────┤
│              Next.js App Router              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│   │  Portal   │  │  Admin   │  │  Public  │ │
│   │  (tenant) │  │ (super)  │  │  (marketing)│
│   └──────────┘  └──────────┘  └──────────┘ │
├─────────────────────────────────────────────┤
│              API Routes (/api)              │
│   Auth · Agents · Chat · Billing · CRM     │
│   Integrations · Onboarding · Admin        │
├─────────────────────────────────────────────┤
│           Supabase (PostgreSQL)             │
│     RLS on 60+ tables · Audit logging      │
│     Tenant isolation · Feature flags        │
├─────────────────────────────────────────────┤
│            External Services                │
│   OpenAI · Anthropic · Stripe · Resend     │
│   Sentry · HubSpot · Odoo                  │
└─────────────────────────────────────────────┘
```

## Multi-Tenant Model

Every company gets an isolated workspace. Row Level Security (RLS) policies on every table enforce that users can only access data belonging to their assigned company. Key capabilities:

- **Company switching** — admins can manage multiple companies from one account
- **Member invitations** — invite employees via email with role-based access
- **Agent assignment** — companies see only the agents they've been granted
- **Role hierarchy** — `super_admin` → `admin` → `company_admin` → `member`

## Security

See the live [Security page](https://www.woulfai.com/security) for details.

Highlights:

- Supabase Auth with JWT (1hr expiry, 24hr idle timeout)
- RLS on every table — tenant isolation verified with automated tests
- Content Security Policy enforced
- Rate limiting on auth and API endpoints
- LLM safety wrappers (timeout, retries, input validation)
- Dependency scanning via Dependabot + GitHub Actions
- Database statement timeouts + performance indexes
- Incident response playbook

### Compliance

SOC 2 Type I readiness documentation is in [`docs/security-policies/`](docs/security-policies/):

- Information Security Policy
- Access Control Policy
- Change Management Policy
- Data Retention Policy
- Vendor Management Policy

Responsible disclosure: [security@woulfgroup.com](mailto:security@woulfgroup.com)

## Project Structure

```
app/
├── (public pages)     Landing, pricing, solutions, about, security
├── admin/             Super admin dashboard (users, companies, agents, analytics)
├── agents/            Individual agent UIs (chat, tools, consoles)
├── api/               API routes (auth, agents, billing, integrations, etc.)
├── dashboard/         Authenticated user dashboard
├── demo/              Interactive agent demos
├── onboarding/        Business, individual, and employee onboarding flows
├── portal/            Multi-company portal with agent access
├── billing/           Stripe subscription management
├── login/             Authentication pages
└── security/          Public security & compliance page

components/
├── admin/             Admin UI components
├── agents/            Agent-specific components
├── portal/            Portal components (members, company context)
├── chat/              Chat interface components
└── ui/                Shared UI primitives

lib/
├── supabase.ts        Database client
├── llm-client.ts      LLM safety wrapper
├── session-manager.ts Session management
├── feature-flags.ts   Feature flag system
├── integration-client.ts  Integration framework
└── api-timing.ts      Endpoint timing

docs/
├── security-policies/ SOC 2 policy documentation
├── INCIDENT-RESPONSE.md
└── (other docs)

supabase/
└── migrations/        Numbered migration files
```

## Development

```bash
# Install
npm install

# Run locally
npm run dev

# Build
npm run build

# Deploy
vercel --prod
```

### Environment Variables

Configured in Vercel Dashboard. Required:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `SENTRY_DSN`

## License

Proprietary. © 2026 Woulf Group. All rights reserved.
