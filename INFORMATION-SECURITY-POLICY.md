# WoulfAI Information Security Policy

**Document ID:** SEC-POL-001
**Version:** 1.0
**Effective Date:** February 25, 2026
**Owner:** Steve Macurdy, CEO
**Classification:** Internal — Shareable with customers under NDA

---

## 1. Purpose

This policy establishes the security requirements for WoulfAI's information systems, data, and operations. It applies to all employees, contractors, and third-party providers who access WoulfAI systems.

## 2. Scope

This policy covers all information assets owned, operated, or managed by WoulfAI, including:

- The WoulfAI platform (woulfai.com) and all associated services
- Customer data stored, processed, or transmitted by WoulfAI
- Internal business systems and communications
- Third-party services integrated with WoulfAI

## 3. Roles and Responsibilities

| Role | Responsibility |
|------|---------------|
| CEO / Security Owner | Overall accountability for information security. Approves policies and major security decisions. |
| Platform Engineers | Implement and maintain security controls. Respond to security incidents. |
| Company Admins (Customers) | Manage user access within their company. Report security concerns. |
| All Users | Follow acceptable use policies. Report suspected security incidents immediately. |

## 4. Access Control

### 4.1 Authentication
- All users authenticate via Supabase Auth with email/password or OAuth providers.
- JWT tokens are issued with short expiry (1 hour) and automatic refresh.
- Sessions expire after 24 hours of inactivity.
- Sensitive operations (role changes, financial exports) require re-authentication.

### 4.2 Authorization
- Role-based access control (RBAC) with four levels: super_admin, admin, company_admin, member.
- Row-Level Security (RLS) enforced at the database level on every table.
- Company data is isolated — users can only access data within their assigned company.
- Agent access is granted per-user via the user_agent_access table.

### 4.3 Account Management
- New accounts are created via admin invitation or self-registration (with admin approval for enterprise).
- Departing employees are deactivated by company admins. Deactivation revokes all access immediately.
- Admin access is reviewed monthly.

## 5. Data Classification

| Classification | Description | Examples | Handling |
|---------------|-------------|----------|----------|
| Confidential | Customer business data, PII, financial records | CRM contacts, invoices, employee records | Encrypted at rest and in transit. Access restricted by RLS. |
| Internal | WoulfAI operational data, policies, configurations | Feature flags, integration configs, audit logs | Access restricted to authorized employees. |
| Public | Marketing content, documentation, pricing | Website content, help docs | No special handling required. |

## 6. Data Encryption

- **In transit:** All connections use TLS 1.3 via HTTPS. HSTS enforced.
- **At rest:** Database encrypted at rest via Supabase (AES-256). Backups encrypted.
- **Integration credentials:** Stored in an access-controlled database table with RLS. Future: migration to AWS KMS or HashiCorp Vault.

## 7. Network Security

- Content Security Policy (CSP) headers enforced in production.
- X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers set.
- Rate limiting on authentication endpoints and agent API routes.
- DDoS protection provided by Vercel Edge Network.

## 8. Vulnerability Management

- Automated dependency scanning via GitHub Dependabot (weekly PRs for updates).
- npm audit runs on every pull request and weekly via GitHub Actions.
- Critical and high vulnerabilities are triaged within 48 hours.
- Third-party penetration testing planned for Q2 2026.

## 9. Incident Response

See [INCIDENT-RESPONSE.md](./INCIDENT-RESPONSE.md) for the full incident response playbook including:

- Severity levels (P0–P3) with defined response times
- Detection, containment, and recovery procedures
- Post-mortem template for P0/P1 incidents
- Credential rotation checklist

## 10. Business Continuity

- **Database backups:** Daily automated backups with point-in-time recovery (Supabase Pro).
- **Code versioning:** All source code in GitHub with full commit history.
- **Deployment rollback:** Vercel supports instant rollback to any previous deployment.
- **Recovery Point Objective (RPO):** < 24 hours (daily backup frequency).
- **Recovery Time Objective (RTO):** < 1 hour (Vercel instant rollback + Supabase restore).

## 11. Change Management

All changes to WoulfAI follow this process:

1. **Code changes:** All modifications go through Git commits with descriptive messages.
2. **Database changes:** All schema changes via numbered migration files in `supabase/migrations/`. No manual SQL in production without documentation.
3. **Build verification:** `npm run build` must pass before deployment.
4. **Deployment:** Production deploys via `vercel --prod`. Preview deploys for testing.
5. **Monitoring:** Sentry monitors for errors after each deployment. Rollback if error rate spikes.

## 12. Third-Party Management

All third-party services are evaluated for security posture before integration:

| Vendor | Purpose | SOC 2 | Data Accessed |
|--------|---------|-------|--------------|
| Vercel | Hosting, CDN, serverless functions | Yes (Type II) | Application code, logs |
| Supabase | Database, authentication, storage | Yes (Type II) | All customer data |
| OpenAI | AI model inference | Yes (Type II) | Agent prompts and context (not retained for training) |
| Anthropic | AI model inference | Yes (Type II) | Agent prompts and context |
| Stripe | Payment processing | Yes (Type II) + PCI DSS | Billing data only |
| Resend | Transactional email | SOC 2 in progress | Email addresses, message content |
| Sentry | Error tracking | Yes (Type II) | Error stack traces, request metadata |
| GitHub | Source code management | Yes (Type II) | Source code |

## 13. Employee Security

- All employees complete security awareness onboarding.
- Access follows principle of least privilege.
- Production database access restricted to authorized personnel.
- Credentials must never be committed to source code.

## 14. Policy Review

This policy is reviewed quarterly and updated as needed. Material changes are communicated to all employees and, where applicable, to customers.

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-02-25 | Steve Macurdy | Initial policy |

---

*This document supports WoulfAI's SOC 2 Type I readiness. For questions, contact security@woulfgroup.com.*
