# WoulfAI Vendor Management Policy

**Document ID:** SEC-POL-005
**Version:** 1.0
**Effective Date:** February 25, 2026
**Owner:** Steve Macurdy, CEO

---

## 1. Purpose

This policy ensures that third-party vendors who access, process, or store WoulfAI or customer data meet our security requirements.

## 2. Vendor Assessment Criteria

Before onboarding a new vendor, we evaluate:

| Criterion | Requirement |
|-----------|-------------|
| Security certification | SOC 2 Type II preferred. Type I acceptable for new vendors. |
| Data encryption | Must encrypt data in transit (TLS 1.2+) and at rest. |
| Access controls | Must support role-based access and audit logging. |
| Incident response | Must have a documented incident response process. |
| Data residency | Must disclose where data is stored. US-based preferred. |
| Subprocessors | Must disclose their own subprocessors. |
| Business continuity | Must have backup and disaster recovery capabilities. |

## 3. Current Vendor Register

| Vendor | Purpose | SOC 2 | Data Access | Risk Level | Last Reviewed |
|--------|---------|-------|-------------|------------|--------------|
| **Vercel** | Application hosting, CDN, serverless | Type II | Application code, server logs, request metadata | Medium | 2026-02-25 |
| **Supabase** | Database, authentication, file storage | Type II | All customer data (primary data store) | High | 2026-02-25 |
| **OpenAI** | AI model inference (GPT-4) | Type II | Agent prompts and context per-request. Zero data retention policy enabled. | Medium | 2026-02-25 |
| **Anthropic** | AI model inference (Claude) | Type II | Agent prompts and context per-request. Not used for model training. | Medium | 2026-02-25 |
| **Stripe** | Payment processing | Type II + PCI DSS | Customer billing data (name, email, payment method). No access to platform data. | Medium | 2026-02-25 |
| **Resend** | Transactional email delivery | In progress | Recipient email addresses, email content | Low | 2026-02-25 |
| **Sentry** | Error tracking and performance monitoring | Type II | Error stack traces, request metadata, user identifiers. No business data. | Low | 2026-02-25 |
| **GitHub** | Source code management, CI/CD | Type II | Source code, workflow logs. No customer data. | Low | 2026-02-25 |

## 4. Vendor Review Schedule

| Review Type | Frequency | Actions |
|-------------|-----------|---------|
| Security posture review | Annually | Verify SOC 2 status, review any incidents, check subprocessor changes |
| Access audit | Quarterly | Verify who has access to each vendor dashboard, remove unnecessary access |
| Contract review | Annually or at renewal | Review terms, DPA compliance, pricing changes |
| Incident review | Ad hoc | If a vendor discloses a breach, assess impact and communicate to affected customers |

## 5. Vendor Onboarding Process

1. **Identify need:** Document why the vendor is needed and what alternatives exist.
2. **Security review:** Evaluate against criteria in Section 2.
3. **Approval:** CEO approves new vendor relationships.
4. **Data mapping:** Document what data the vendor will access/process.
5. **Configuration:** Implement least-privilege access. Enable audit logging where available.
6. **Documentation:** Add to vendor register (Section 3).
7. **Customer notification:** If vendor processes customer data, notify customers per subprocessor policy (30 days advance notice).

## 6. Vendor Offboarding Process

1. **Revoke access:** Remove all API keys, credentials, and integrations.
2. **Data deletion:** Confirm vendor has deleted any WoulfAI or customer data.
3. **Update register:** Mark vendor as inactive in vendor register.
4. **Migrate:** Ensure replacement service is fully operational before cutover.

## 7. AI-Specific Vendor Controls

Given WoulfAI's use of AI services, additional controls apply:

| Control | OpenAI | Anthropic |
|---------|--------|-----------|
| Data used for training | No (opt-out confirmed) | No (not used for training) |
| Data retention by vendor | Zero-retention API | Not retained after response |
| Content filtered | Yes (content moderation) | Yes (constitutional AI) |
| Prompt logging by vendor | Disabled | Disabled |
| Customer data in prompts | Only data from requesting company (tenant-isolated) | Only data from requesting company |

---

*This document supports WoulfAI's SOC 2 Type I readiness. For questions, contact security@woulfgroup.com.*
