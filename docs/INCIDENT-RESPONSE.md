# WoulfAI Incident Response Playbook

**Last Updated:** 2026-02-25 | **Owner:** Steve Macurdy

---

## 1. Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0** | Service down, data breach | 15 min | Site unreachable, auth bypass, tenant leak |
| **P1** | Major feature broken | 1 hour | Login broken, agents failing, billing errors |
| **P2** | Feature degraded | 4 hours | Slow pages, admin UI glitch |
| **P3** | Cosmetic issue | Next business day | Typo, styling issue |

## 2. Response Steps

### Assess
- Check Sentry for error details
- Check Vercel deployment status
- Check Supabase for database issues
- Determine severity

### Contain
- Bad deploy? vercel rollback
- Bad migration? Revert SQL
- Security issue? Rotate credentials immediately

### Fix
1. Branch for the fix
2. npm run build locally
3. vercel (preview first)
4. vercel --prod

### Post-Mortem (P0/P1 within 48h)
Document: what happened, timeline, root cause, impact, action items.

## 3. Key Resources

| Resource | URL |
|----------|-----|
| Sentry | https://sentry.io (Woulf Group) |
| Vercel | https://vercel.com/steve-macurdys-projects/ai-agent-platform |
| Supabase | https://supabase.com/dashboard |
| GitHub | https://github.com/stevemacurdy/ai-agent-platform |
| Production | https://www.woulfai.com |
| Resend | https://resend.com |
| Stripe | https://dashboard.stripe.com |

## 4. Credential Rotation Checklist

- [ ] Supabase service role key
- [ ] Supabase anon key
- [ ] OpenAI API key
- [ ] Anthropic API key
- [ ] Stripe secret + webhook signing secret
- [ ] Resend API key
- [ ] Update all in Vercel env vars
- [ ] Redeploy: vercel --prod

## 5. Monitoring Cadence

- **Daily:** Glance at Sentry
- **Weekly:** Sentry trends, Vercel analytics, npm audit
- **Monthly:** Supabase performance, tenant isolation tests, user access audit
