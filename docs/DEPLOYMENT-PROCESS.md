# Deployment Process

**Document ID:** SEC-DOC-003  
**Owner:** Platform Engineers  
**Review Cycle:** Quarterly

---

## Overview

WoulfAI uses Vercel for deployment with built-in blue/green capabilities. Every deploy creates a new immutable deployment alongside the current production. Traffic switches only after the build succeeds.

---

## Deploy Pipeline

```
git push main
    │
    ▼
┌─────────────────┐
│  Vercel Build    │  New deployment built in isolation
│  (Next.js)      │  Current production still serving traffic
└────────┬────────┘
         │ Build passes
         ▼
┌─────────────────┐
│  Preview Ready   │  New deployment accessible at unique URL
│  (blue/green)   │  Production unchanged
└────────┬────────┘
         │ Auto-promote (or manual for critical changes)
         ▼
┌─────────────────┐
│  Production      │  Traffic cuts to new deployment
│  (www.woulfai.com) │  Previous deployment retained for rollback
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Verify Deploy   │  GitHub Actions smoke tests run
│  (automated)    │  Alerts on failure
└─────────────────┘
```

---

## Standard Deploy

```bash
# 1. Build locally first
npm run build

# 2. Commit and push
git add -A && git commit -m "description" && git push

# 3. Vercel auto-deploys from main
# Monitor: https://vercel.com/steve-macurdys-projects/ai-agent-platform

# 4. Automated verification runs via GitHub Actions
# Monitor: https://github.com/stevemacurdy/ai-agent-platform/actions

# 5. Manual verification (optional)
node scripts/verify-deploy.js
```

---

## Rollback Procedure

### Instant Rollback (< 1 minute)

1. Go to **Vercel Dashboard → Deployments**
2. Find the last known-good deployment
3. Click **⋯ → Promote to Production**
4. Traffic switches immediately (no rebuild)
5. Run `node scripts/verify-deploy.js` to confirm

### CLI Rollback

```bash
# List recent deployments
vercel ls

# Promote a specific deployment
vercel promote [deployment-url]
```

---

## Deploy Types

| Type | Process | Rollback Time |
|------|---------|---------------|
| **Standard** | git push → auto-deploy → auto-verify | < 1 min (Vercel instant) |
| **Hotfix** | git push → `vercel --prod` → manual verify | < 1 min |
| **Database migration** | SQL in Supabase → deploy code → verify | < 30 min (manual rollback) |
| **Environment variable** | Vercel Dashboard → redeploy | < 10 min |

---

## Post-Deploy Checks

Automated via `scripts/verify-deploy.js` and `.github/workflows/deploy-verify.yml`:

- Public pages load (/, /pricing, /security, /login, etc.)
- Security headers present (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- API endpoints respond correctly (not 500)
- Protected routes reject unauthenticated requests
- 404 handling works

---

## Emergency Procedures

### Production is down

1. Check Vercel status: https://www.vercelstatus.com
2. Check Supabase status: https://status.supabase.com
3. If app error: instant rollback via Vercel Dashboard
4. If database error: check Supabase Dashboard → Logs
5. Notify per INCIDENT-RESPONSE.md

### Deploy broke something

1. Do NOT push another fix immediately
2. Instant rollback to previous deployment
3. Verify rollback: `node scripts/verify-deploy.js`
4. Investigate locally, fix, test
5. Deploy fix when ready

---

*Last updated: February 25, 2026*
