// phase-b-round2.js — Run from project root
// Applies: B2 (LLM safety), B7 (migration discipline), B8 (incident playbook)
var fs = require('fs');

function mkdirp(dir) { fs.mkdirSync(dir, { recursive: true }); }

var applied = 0;

// ============================================================================
// B2: Agent Job Safety — LLM call wrapper with timeout + retries
// ============================================================================
console.log('\n--- B2: Agent Job Safety ---');

var llmClient = `// lib/llm-client.ts
// B2: Agent Job Safety
//
// Wraps LLM API calls with:
// 1. 30-second timeout (configurable)
// 2. Exponential backoff retry (up to 3 attempts)
// 3. Structured error handling
//
// Usage:
//   import { llmCall } from '@/lib/llm-client'
//   const result = await llmCall({
//     provider: 'openai',
//     body: { model: 'gpt-4', messages: [...] },
//   })

const DEFAULT_TIMEOUT_MS = 30_000
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

interface LLMCallOptions {
  provider: 'openai' | 'anthropic'
  body: Record<string, any>
  timeoutMs?: number
  maxRetries?: number
  apiKey?: string
}

interface LLMResult {
  ok: boolean
  data?: any
  error?: string
  attempts: number
  durationMs: number
}

const PROVIDER_CONFIG = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    envKey: 'OPENAI_API_KEY',
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    envKey: 'ANTHROPIC_API_KEY',
  },
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500
}

export async function llmCall(options: LLMCallOptions): Promise<LLMResult> {
  const {
    provider,
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = MAX_RETRIES,
    apiKey,
  } = options

  const config = PROVIDER_CONFIG[provider]
  const key = apiKey || process.env[config.envKey]

  if (!key) {
    return { ok: false, error: \`Missing API key: \${config.envKey}\`, attempts: 0, durationMs: 0 }
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (provider === 'openai') {
    headers['Authorization'] = \`Bearer \${key}\`
  } else if (provider === 'anthropic') {
    headers['x-api-key'] = key
    headers['anthropic-version'] = '2023-06-01'
  }

  const start = Date.now()
  let lastError = ''

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        config.url,
        { method: 'POST', headers, body: JSON.stringify(body) },
        timeoutMs
      )

      if (response.ok) {
        const data = await response.json()
        return { ok: true, data, attempts: attempt, durationMs: Date.now() - start }
      }

      if (!isRetryable(response.status)) {
        const errorText = await response.text().catch(() => 'Unknown error')
        return {
          ok: false,
          error: \`\${provider} API error \${response.status}: \${errorText}\`,
          attempts: attempt,
          durationMs: Date.now() - start,
        }
      }

      lastError = \`\${provider} API error \${response.status}\`
      console.warn(\`[LLM] \${provider} attempt \${attempt}/\${maxRetries} failed: \${response.status}. Retrying...\`)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        lastError = \`\${provider} API timeout after \${timeoutMs}ms\`
      } else {
        lastError = err.message || 'Network error'
      }
      console.warn(\`[LLM] \${provider} attempt \${attempt}/\${maxRetries}: \${lastError}. Retrying...\`)
    }

    if (attempt < maxRetries) {
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1)
      await sleep(backoff + Math.random() * backoff * 0.1)
    }
  }

  console.error(\`[LLM] \${provider} failed after \${maxRetries} attempts: \${lastError}\`)
  return {
    ok: false,
    error: \`\${provider} failed after \${maxRetries} attempts: \${lastError}\`,
    attempts: maxRetries,
    durationMs: Date.now() - start,
  }
}
`;

fs.writeFileSync('lib/llm-client.ts', llmClient);
console.log('  OK: lib/llm-client.ts');
applied++;

// ============================================================================
// B7: Migration Discipline — supabase/migrations/ folder
// ============================================================================
console.log('\n--- B7: Migration Discipline ---');

mkdirp('supabase/migrations');

// Migration 001: Feature flags
var m001 = `-- supabase/migrations/001_feature_flags.sql
-- Created: 2026-02-25
-- Description: Feature flags table for gating unfinished features

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false NOT NULL,
  description TEXT,
  company_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read feature flags"
    ON feature_flags FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage feature flags"
    ON feature_flags FOR ALL
    USING (public.current_user_role() = 'super_admin')
    WITH CHECK (public.current_user_role() = 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO feature_flags (key, enabled, description) VALUES
  ('odoo_integration', false, 'Live Odoo ERP connection for CFO/Operations agents'),
  ('hubspot_integration', false, 'Live HubSpot CRM connection for Sales agent'),
  ('employee_onboarding', false, 'Self-service employee onboarding flow'),
  ('external_portal', false, 'Customer-facing external portal access'),
  ('ai_chat_widget', true, 'Public-facing AI chat widget on landing page'),
  ('stripe_live_billing', false, 'Live Stripe billing (vs test mode)')
ON CONFLICT (key) DO NOTHING;
`;
fs.writeFileSync('supabase/migrations/001_feature_flags.sql', m001);
console.log('  OK: supabase/migrations/001_feature_flags.sql');

// Migration 002: Database indexes
var m002 = `-- supabase/migrations/002_database_indexes.sql
-- Created: 2026-02-25
-- Description: Performance indexes on frequently filtered columns

ALTER DATABASE postgres SET statement_timeout = '30s';

CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user_company ON company_members(user_id, company_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_access_user_id ON user_agent_access(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

DO $$
BEGIN
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_cfo_data_cid ON agent_cfo_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_sales_data_cid ON agent_sales_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_hr_data_cid ON agent_hr_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_operations_data_cid ON agent_operations_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_agent_marketing_data_cid ON agent_marketing_data(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_subscriptions_cid ON subscriptions(company_id); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundles(is_active); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
  BEGIN CREATE INDEX IF NOT EXISTS idx_chat_sessions_email ON chat_sessions(visitor_email); EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;
END $$;
`;
fs.writeFileSync('supabase/migrations/002_database_indexes.sql', m002);
console.log('  OK: supabase/migrations/002_database_indexes.sql');

// README
var readme = `# Supabase Migrations

All schema changes must go through numbered migration files. **No manual SQL in production.**

## Rules

1. **Always create a new file** — never edit an existing migration
2. **Number sequentially** — 003_description.sql, 004_description.sql, etc.
3. **Make migrations idempotent** — use IF NOT EXISTS, DO $$ BEGIN ... EXCEPTION ... END $$
4. **Test first** — run against staging before production
5. **Document** — add a comment header with date and description

## Running Migrations

Open Supabase → SQL Editor → paste migration SQL → run.

## Migration Log

| # | File | Date | Description | Applied |
|---|------|------|-------------|---------|
| 001 | 001_feature_flags.sql | 2026-02-25 | Feature flags table + seed data | ✅ |
| 002 | 002_database_indexes.sql | 2026-02-25 | Performance indexes on hot columns | ✅ |
`;
fs.writeFileSync('supabase/migrations/README.md', readme);
console.log('  OK: supabase/migrations/README.md');
applied++;

// ============================================================================
// B8: Incident Response Playbook
// ============================================================================
console.log('\n--- B8: Incident Response Playbook ---');

var playbook = `# WoulfAI Incident Response Playbook

**Last Updated:** 2026-02-25  |  **Owner:** Steve Macurdy

---

## 1. Detection

An incident is detected when any of these occur:

- **Sentry alert** — error spike or unhandled exception
- **User report** — customer reports broken functionality or security concern
- **Vercel alert** — deployment failure or 5xx error spike
- **Self-discovery** — team member notices something wrong

## 2. Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0** | Service down, data breach, security exploit | 15 minutes | Site unreachable, auth bypass, tenant data leak |
| **P1** | Major feature broken, significant data issue | 1 hour | Login broken, agents failing, billing errors |
| **P2** | Feature degraded, non-critical multi-user bug | 4 hours | Slow pages, admin UI glitch |
| **P3** | Cosmetic issue, single-user edge case | Next business day | Typo, styling issue |

## 3. Response Steps

### Assess
- Check Sentry for error details (stack trace, affected users, frequency)
- Check Vercel deployment status and recent deploys
- Check Supabase dashboard for database issues
- Determine severity level

### Communicate
- **P0/P1:** Notify affected customers via email (noreply@woulfgroup.com)
- **P2/P3:** Track internally, no immediate customer communication

### Contain
- **Bad deploy?** Vercel instant rollback:
  - Dashboard → Deployments → last good deploy → Promote to Production
  - Or: \\\`vercel rollback\\\`
- **Bad migration?** Revert SQL (keep rollback scripts with each migration)
- **Security issue?** Rotate affected credentials immediately

### Fix
1. Create a branch for the fix
2. Test locally: \\\`npm run build\\\`
3. Deploy to preview: \\\`vercel\\\` (no --prod)
4. Verify on preview URL
5. Deploy to production: \\\`vercel --prod\\\`

### Post-Mortem (P0/P1 only, within 48h)
Document: what happened, timeline, root cause, impact, action items.

## 4. Key Resources

| Resource | URL |
|----------|-----|
| Sentry | https://sentry.io (Woulf Group org) |
| Vercel | https://vercel.com/steve-macurdys-projects/ai-agent-platform |
| Supabase | https://supabase.com/dashboard |
| GitHub | https://github.com/stevemacurdy/ai-agent-platform |
| Production | https://www.woulfai.com |
| Resend | https://resend.com |
| Stripe | https://dashboard.stripe.com |

## 5. Credential Rotation Checklist

If any credential is exposed, rotate ALL of these:

- [ ] Supabase service role key
- [ ] Supabase anon key
- [ ] OpenAI API key
- [ ] Anthropic API key
- [ ] Stripe secret key + webhook signing secret
- [ ] Resend API key
- [ ] Sentry DSN
- [ ] Update all rotated keys in Vercel env vars
- [ ] Redeploy: \\\`vercel --prod\\\`

## 6. Monitoring Cadence

- **Daily:** Glance at Sentry for new errors
- **Weekly:** Sentry trends, Vercel analytics, \\\`npm audit\\\`
- **Monthly:** Supabase performance, tenant isolation tests, user access audit
`;

fs.writeFileSync('docs/INCIDENT-RESPONSE.md', '');
mkdirp('docs');
fs.writeFileSync('docs/INCIDENT-RESPONSE.md', playbook);
console.log('  OK: docs/INCIDENT-RESPONSE.md');
applied++;

// ============================================================================
console.log('\\n========================================');
console.log('Applied: ' + applied + ' items');
console.log('========================================');
console.log('\\nNext steps:');
console.log('  npm run build');
console.log('  git add -A && git commit -m "Phase B: LLM safety, migration discipline, incident playbook"');
console.log('  vercel --prod && git push');
