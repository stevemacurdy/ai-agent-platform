# Key & Secrets Management Policy

**Document ID:** SEC-POL-006  
**Effective Date:** February 25, 2026  
**Owner:** CEO / Security Owner  
**Review Cycle:** Quarterly

---

## Overview

All secrets (API keys, database credentials, tokens) are managed through Vercel Environment Variables and provider dashboards. No secrets are stored in code, Git, or local files committed to the repository.

---

## Secrets Inventory

### Production Secrets (Vercel Dashboard)

| Secret | Provider | Classification | Rotation Cycle | Last Rotated |
|--------|----------|---------------|----------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | L2 — Internal | On project change | N/A (static) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | L2 — Internal | On project regeneration | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | **L1 — Confidential** | 90 days | — |
| `OPENAI_API_KEY` | OpenAI | **L1 — Confidential** | 90 days | — |
| `ANTHROPIC_API_KEY` | Anthropic | **L1 — Confidential** | 90 days | — |
| `STRIPE_SECRET_KEY` | Stripe | **L1 — Confidential** | 90 days | — |
| `STRIPE_WEBHOOK_SECRET` | Stripe | **L1 — Confidential** | On endpoint change | — |
| `STRIPE_PRICE_STARTER` | Stripe | L2 — Internal | On pricing change | — |
| `STRIPE_PRICE_PROFESSIONAL` | Stripe | L2 — Internal | On pricing change | — |
| `STRIPE_PRICE_ENTERPRISE` | Stripe | L2 — Internal | On pricing change | — |
| `RESEND_API_KEY` | Resend | **L1 — Confidential** | 90 days | — |
| `SENTRY_DSN` | Sentry | L2 — Internal | On project change | N/A (static) |
| `SENTRY_AUTH_TOKEN` | Sentry | **L1 — Confidential** | 90 days | — |

### CI/CD Secrets (GitHub Actions)

| Secret | Purpose | Classification | Rotation Cycle |
|--------|---------|---------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tenant isolation tests | L2 — Internal | Sync with Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Tenant isolation tests | **L1 — Confidential** | Sync with Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tenant isolation tests | L2 — Internal | Sync with Vercel |

### Local Development (.env.local)

| Rule | Detail |
|------|--------|
| `.env.local` in `.gitignore` | ✅ Verified |
| Never committed to Git | ✅ Enforced |
| Contains same keys as Vercel | Test-mode values where possible |
| Stripe keys | Use `sk_test_*` / `pk_test_*` locally |

---

## Access Control

### Who Can Access Secrets

| Location | Access | Method |
|----------|--------|--------|
| Vercel Dashboard | CEO only | Vercel account login |
| GitHub Actions Secrets | CEO only | Repository settings |
| Supabase Dashboard | CEO only | Supabase account login |
| Stripe Dashboard | CEO only | Stripe account login |
| OpenAI Dashboard | CEO only | OpenAI account login |
| Anthropic Console | CEO only | Anthropic account login |
| Resend Dashboard | CEO only | Resend account login |
| Sentry Dashboard | CEO only | Sentry account login |
| Local `.env.local` | Platform engineers | Local machine only |

### Principle of Least Privilege

- Production secrets: CEO only
- Local dev secrets: Use test-mode keys, never production keys
- CI secrets: Minimum needed for tests (3 Supabase keys)
- No shared credentials — each engineer gets their own provider accounts if needed

---

## Rotation Procedures

### Quarterly Rotation (90-day cycle)

**Schedule:** 1st of March, June, September, December

#### Supabase Service Role Key
1. Go to Supabase Dashboard → Settings → API
2. Note: Supabase doesn't support key rotation without project recreation
3. **Alternative:** Monitor for unauthorized usage via audit logs
4. If compromise suspected: regenerate project API keys immediately

#### OpenAI API Key
1. Go to platform.openai.com → API Keys
2. Create new key with descriptive name (`woulfai-prod-YYYY-MM`)
3. Update in Vercel Dashboard → Environment Variables
4. Trigger redeploy: `vercel --prod`
5. Verify agents respond correctly
6. Delete old key in OpenAI Dashboard

#### Anthropic API Key
1. Go to console.anthropic.com → API Keys
2. Create new key (`woulfai-prod-YYYY-MM`)
3. Update in Vercel Dashboard
4. Trigger redeploy
5. Verify agents respond
6. Delete old key

#### Stripe Secret Key
1. Go to Stripe Dashboard → Developers → API Keys
2. Roll secret key (Stripe supports rolling without downtime)
3. Update in Vercel Dashboard
4. Trigger redeploy
5. Test checkout flow
6. Stripe auto-expires the old key after 24h

#### Resend API Key
1. Go to Resend Dashboard → API Keys
2. Create new key
3. Update in Vercel Dashboard
4. Trigger redeploy
5. Test password reset email flow
6. Delete old key

#### Sentry Auth Token
1. Go to Sentry → Settings → Auth Tokens
2. Create new token
3. Update in Vercel Dashboard
4. Trigger redeploy
5. Verify errors report to Sentry
6. Revoke old token

### After Every Rotation
- [ ] Update "Last Rotated" column in this document
- [ ] Update GitHub Actions secrets if affected
- [ ] Run `node scripts/verify-deploy.js` to confirm
- [ ] Run `node tests/tenant-isolation.test.js` if Supabase keys changed
- [ ] Log rotation in audit trail

---

## Emergency Key Revocation

If a secret is suspected compromised:

### Immediate (< 15 minutes)
1. Revoke/regenerate the key at the provider dashboard
2. Update Vercel environment variable
3. Trigger immediate redeploy: `vercel --prod`
4. Verify service restored

### Follow-up (< 24 hours)
5. Review audit logs for unauthorized usage
6. Check Sentry for unusual errors during exposure window
7. If customer data involved: follow INCIDENT-RESPONSE.md
8. Document in incident report
9. Review how the leak occurred
10. Update procedures to prevent recurrence

### Key-Specific Emergency Steps

| Key Compromised | Additional Steps |
|----------------|-----------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Check for unauthorized data access, review all table modifications |
| `STRIPE_SECRET_KEY` | Check for unauthorized charges/refunds in Stripe Dashboard |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Check usage dashboards for unexpected spend |
| `RESEND_API_KEY` | Check for unauthorized emails sent |

---

## Prohibited Practices

- ❌ Never commit secrets to Git (enforced by `.gitignore`)
- ❌ Never share secrets over email, Slack, or chat
- ❌ Never store secrets in code comments or documentation
- ❌ Never use production keys in local development
- ❌ Never log secrets (check Sentry for accidental exposure)
- ❌ Never embed secrets in client-side code (only `NEXT_PUBLIC_*` are safe)
- ❌ Never reuse keys across environments (prod/staging/dev)

---

## Monitoring

| Check | Frequency | Method |
|-------|-----------|--------|
| Unexpected API usage spikes | Daily | Provider dashboards |
| Git secret scanning | Every push | GitHub secret scanning (enabled) |
| `.env.local` in git history | Monthly | `git log --all -- .env.local` |
| Vercel env var audit | Monthly | Screenshot/export env var list |
| Provider access logs | Monthly | Check each dashboard |

---

## Future Improvements

- [ ] Adopt a secrets manager (e.g., Doppler, HashiCorp Vault) when team grows past 5
- [ ] Automate rotation with provider APIs
- [ ] Add automated secret scanning to CI pipeline
- [ ] Implement envelope encryption for sensitive database fields
- [ ] Consider Supabase Vault for database-level secret storage

---

*Last reviewed: February 25, 2026*  
*Next review: May 2026*
