# WoulfAI Security Policy Framework

**Prepared for SOC 2 Type I Readiness**
**Last Updated:** February 25, 2026

---

## Overview

This directory contains WoulfAI's formal security policies. These documents describe the controls, processes, and commitments that protect customer data and ensure platform integrity.

These policies are designed to satisfy the Trust Service Criteria (TSC) required for SOC 2 Type I certification:

| TSC Category | Relevant Documents |
|-------------|-------------------|
| **Security** (CC6, CC7, CC8) | Information Security Policy, Access Control Policy |
| **Availability** (A1) | Information Security Policy §10 (Business Continuity) |
| **Processing Integrity** (PI1) | Change Management Policy |
| **Confidentiality** (C1) | Data Retention Policy, Vendor Management Policy |
| **Privacy** | Data Retention Policy §4.3 (Data Subject Requests) |

## Document Index

| ID | Document | Description |
|----|----------|-------------|
| SEC-POL-001 | [Information Security Policy](./INFORMATION-SECURITY-POLICY.md) | Master security policy covering access, encryption, monitoring, incident response, and business continuity. |
| SEC-POL-002 | [Access Control Policy](./ACCESS-CONTROL-POLICY.md) | Roles, user lifecycle (onboarding, changes, offboarding), authentication requirements, and access reviews. |
| SEC-POL-003 | [Change Management Policy](./CHANGE-MANAGEMENT-POLICY.md) | How code, database, and infrastructure changes are managed, tested, deployed, and rolled back. |
| SEC-POL-004 | [Data Retention & Classification Policy](./DATA-RETENTION-POLICY.md) | Data classification levels, retention periods, disposal procedures, and data subject request handling. |
| SEC-POL-005 | [Vendor Management Policy](./VENDOR-MANAGEMENT-POLICY.md) | Third-party risk assessment, vendor register, review schedule, and AI-specific vendor controls. |

## Supporting Documents (Elsewhere in Repository)

| Document | Location | Description |
|----------|----------|-------------|
| Incident Response Playbook | `docs/INCIDENT-RESPONSE.md` | Severity levels, response steps, rollback procedures, credential rotation checklist. |
| Migration Discipline | `supabase/migrations/README.md` | Database change management process and migration log. |

## Controls Evidence (For Auditors)

| Control | Evidence Location |
|---------|-------------------|
| RLS enforced on all tables | Supabase Dashboard → Database → Policies |
| Security headers in production | `next.config.mjs` (CSP, HSTS, X-Frame-Options) |
| Rate limiting | `middleware.ts` |
| Dependency vulnerability scanning | `.github/workflows/security-audit.yml`, `.github/dependabot.yml` |
| Audit logging | Supabase: `audit_log` table |
| Session management | `lib/session-manager.ts` (24h idle timeout, re-auth) |
| Tenant isolation tests | Test suite output (automated, runs in CI) |
| Error monitoring | Sentry dashboard (Woulf Group org) |
| LLM call safety | `lib/llm-client.ts` (30s timeout, retries) |
| Feature flags | Supabase: `feature_flags` table, `lib/feature-flags.ts` |

## Review Schedule

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Full policy review and update | Quarterly | CEO |
| Access review (all systems) | Monthly | CEO |
| Vendor security review | Annually | CEO |
| Incident response drill | Semi-annually | Engineering |
| Backup restore verification | Quarterly | Engineering |

## Contact

- **Security inquiries:** security@woulfgroup.com
- **Privacy requests:** privacy@woulfgroup.com
- **Legal / DPA requests:** legal@woulfgroup.com
- **Vulnerability reports:** security@woulfgroup.com (see Responsible Disclosure at woulfai.com/security)
