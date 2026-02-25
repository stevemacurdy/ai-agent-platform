# WoulfAI Change Management Policy

**Document ID:** SEC-POL-003
**Version:** 1.0
**Effective Date:** February 25, 2026
**Owner:** Steve Macurdy, CEO

---

## 1. Purpose

This policy ensures that all changes to WoulfAI systems are planned, tested, approved, and documented to minimize risk to service availability and security.

## 2. Scope

This policy covers changes to:
- Application source code
- Database schema (migrations)
- Infrastructure configuration (Vercel, Supabase)
- Third-party integrations
- Environment variables and secrets

## 3. Change Categories

| Category | Description | Approval | Examples |
|----------|-------------|----------|----------|
| Standard | Pre-approved, low-risk changes following established procedures | Self-approved | Bug fixes, UI tweaks, dependency updates |
| Normal | Changes requiring review before deployment | Peer review or CEO | New features, API changes, new integrations |
| Emergency | Urgent changes to restore service or patch security vulnerabilities | CEO (post-hoc review acceptable) | Security patches, service outage fixes |

## 4. Change Process

### 4.1 Code Changes
1. **Develop:** Make changes in a local environment.
2. **Build:** Run `npm run build` to verify compilation and type safety.
3. **Test:** Verify functionality locally or in preview deployment.
4. **Deploy to preview:** `vercel` (without --prod) creates a preview URL for verification.
5. **Deploy to production:** `vercel --prod` after verification.
6. **Commit and push:** `git add -A && git commit -m "descriptive message" && git push`.
7. **Monitor:** Check Sentry for new errors within 1 hour of deployment.

### 4.2 Database Changes
1. **Create migration file:** New numbered file in `supabase/migrations/` (e.g., `006_description.sql`).
2. **Make idempotent:** Use `IF NOT EXISTS`, `DO $$ BEGIN ... EXCEPTION ... END $$`.
3. **Test:** Run against development/staging first.
4. **Apply to production:** Execute in Supabase SQL Editor.
5. **Document:** Update migration README with entry.

### 4.3 Infrastructure Changes
1. **Environment variables:** Changed in Vercel Dashboard → Settings → Environment Variables.
2. **Supabase configuration:** Changed in Supabase Dashboard.
3. **DNS changes:** Coordinated and tested before cutover.
4. All infrastructure changes are documented in a change log entry.

## 5. Rollback Procedures

| System | Rollback Method | Time to Rollback |
|--------|----------------|------------------|
| Application code | Vercel instant rollback or `git revert` + redeploy | < 5 minutes |
| Database schema | Manual rollback SQL script (maintained alongside each migration) | < 30 minutes |
| Environment variables | Revert in Vercel Dashboard + redeploy | < 10 minutes |

## 6. Change Log

All changes are tracked via:
- **Git commit history:** Every code change with descriptive commit message.
- **Vercel deployment history:** Every deployment with timestamp, URL, and status.
- **Migration log:** `supabase/migrations/README.md` documents all schema changes.
- **Audit log:** User-facing changes (role changes, access grants) logged in the audit_log table.

## 7. Post-Deployment Monitoring

After every production deployment:
- Check Sentry for new error spikes within 1 hour.
- Verify critical paths (login, portal, agent chat) are functional.
- If error rate increases > 5%, initiate rollback per incident response playbook.

---

*This document supports WoulfAI's SOC 2 Type I readiness. For questions, contact security@woulfgroup.com.*
