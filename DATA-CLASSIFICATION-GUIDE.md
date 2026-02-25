# Data Classification Guide

**Document ID:** SEC-DOC-001  
**Effective Date:** February 25, 2026  
**Owner:** CEO / Security Owner  
**Review Cycle:** Quarterly

---

## Classification Levels

| Level | Label | Description | Example |
|-------|-------|-------------|---------|
| **L1** | **Confidential** | Data whose exposure would cause material harm to users or the business. Requires encryption, access controls, and audit logging. | Passwords, API keys, billing data, PII |
| **L2** | **Internal** | Data intended for internal use only. Exposure is undesirable but not critical. | Agent configurations, usage analytics, internal docs |
| **L3** | **Public** | Data intended for or safe for public access. No special handling required. | Marketing pages, public docs, agent descriptions |

---

## Platform Data Inventory

### Authentication and Identity (L1 — Confidential)

| Data Type | Storage | Encryption | RLS | Access |
|-----------|---------|------------|-----|--------|
| Passwords (hashed) | Supabase Auth | bcrypt + AES-256 at rest | N/A (auth schema) | Supabase Auth only |
| JWT tokens | Client memory | TLS 1.3 in transit | N/A | 1hr expiry, 24hr idle timeout |
| Session metadata | Supabase Auth | AES-256 at rest | N/A | Supabase Auth only |
| Email addresses | `profiles`, `auth.users` | AES-256 at rest | Yes | Own profile or admin |
| User roles | `profiles` | AES-256 at rest | Yes | Own profile or admin |
| Password reset tokens | Supabase Auth | AES-256 at rest | N/A | Single-use, time-limited |

### Billing and Financial (L1 — Confidential)

| Data Type | Storage | Encryption | RLS | Access |
|-----------|---------|------------|-----|--------|
| Stripe customer IDs | `subscriptions` | AES-256 at rest | Yes | Own record or admin |
| Subscription status | `subscriptions` | AES-256 at rest | Yes | Own record or admin |
| Payment method tokens | Stripe (not stored locally) | Stripe PCI DSS | N/A | Stripe only |
| Invoice history | Stripe (not stored locally) | Stripe PCI DSS | N/A | Stripe portal |

### Company and Tenant (L1 — Confidential)

| Data Type | Storage | Encryption | RLS | Access |
|-----------|---------|------------|-----|--------|
| Company membership | `company_members` | AES-256 at rest | Yes | Own company or admin |
| Invite tokens | `company_members` | AES-256 at rest | Yes | Inviter or invitee |
| Company settings | `companies` | AES-256 at rest | Yes | Company members |
| Integration credentials | `integrations` | AES-256 at rest | Yes | Company admin only |

### AI Agent Data (L1 — Confidential)

| Data Type | Storage | Encryption | RLS | Access |
|-----------|---------|------------|-----|--------|
| Chat messages | `chat_messages` | AES-256 at rest | Yes | Own sessions |
| Chat sessions | `chat_sessions` | AES-256 at rest | Yes | Own sessions |
| Agent data (CFO, HR, etc.) | `agent_*_data` tables | AES-256 at rest | Yes | Own company |
| LLM prompts | Not persisted | TLS 1.3 to provider | N/A | Ephemeral |
| LLM responses | Not persisted | TLS 1.3 to provider | N/A | Ephemeral |

### Operational (L2 — Internal)

| Data Type | Storage | Encryption | RLS | Access |
|-----------|---------|------------|-----|--------|
| Audit log entries | `audit_log` | AES-256 at rest | Yes | Admin only |
| Feature flags | `feature_flags` | AES-256 at rest | Yes | Admin only |
| Agent definitions | `agents` | AES-256 at rest | Yes | All authenticated users |
| User agent access | `user_agent_access` | AES-256 at rest | Yes | Own record or admin |
| Error reports | Sentry | TLS + Sentry encryption | N/A | Sentry dashboard |
| Deployment logs | Vercel | TLS + Vercel encryption | N/A | Vercel dashboard |

### Marketing and Leads (L2 — Internal)

| Data Type | Storage | Encryption | RLS | Access |
|-----------|---------|------------|-----|--------|
| Lead submissions | `leads` | AES-256 at rest | Yes | Admin only |
| Contact form data | `leads` | AES-256 at rest | Yes | Admin only |
| Analytics events | Vercel Analytics | TLS | N/A | Dashboard only |

### Public Content (L3 — Public)

| Data Type | Storage | Encryption | RLS | Access |
|-----------|---------|------------|-----|--------|
| Marketing pages | Git / Vercel | N/A | N/A | Public |
| Security page | Git / Vercel | N/A | N/A | Public |
| Agent descriptions | Git / Vercel | N/A | N/A | Public |
| Pricing tiers | Git / Vercel | N/A | N/A | Public |
| Policy documents | Git | N/A | N/A | Internal (repo) |

---

## Handling Requirements by Level

### L1 — Confidential

- **Storage:** Encrypted at rest (AES-256 via Supabase/provider)
- **Transit:** TLS 1.3 required
- **Access:** RLS enforced, least-privilege, logged in `audit_log`
- **Sharing:** Never shared externally without Data Processing Agreement
- **Retention:** Per Data Retention Policy (SEC-POL-004)
- **Disposal:** Secure deletion with verification
- **Backups:** Encrypted, same access controls as primary
- **Incident:** Breach notification within 72 hours per GDPR

### L2 — Internal

- **Storage:** Encrypted at rest
- **Transit:** TLS 1.3 required
- **Access:** Role-based, admin or authorized users
- **Sharing:** Internal team only, no external sharing without approval
- **Retention:** Per Data Retention Policy
- **Disposal:** Standard deletion
- **Backups:** Standard backup procedures

### L3 — Public

- **Storage:** No special requirements
- **Transit:** TLS recommended (enforced via Vercel)
- **Access:** No restrictions
- **Sharing:** No restrictions
- **Retention:** Indefinite
- **Disposal:** No special requirements

---

## AI-Specific Data Handling

LLM interactions receive special treatment:

| Concern | Control |
|---------|---------|
| Prompt data sent to providers | TLS 1.3, tenant-isolated, no PII in system prompts |
| Provider data retention | Zero-retention agreements (OpenAI, Anthropic) |
| Training on customer data | Explicitly disabled — providers do not train on API inputs |
| Prompt logging | Disabled in production |
| Response caching | Not cached server-side |
| Content filtering | LLM safety wrapper with input validation |

---

## Responsibilities

| Role | Responsibility |
|------|---------------|
| CEO / Security Owner | Approve classification changes, annual review |
| Platform Engineers | Implement controls per classification level |
| Company Admins | Manage access within their tenant |
| All Users | Handle data per its classification level |

---

## Classification Change Process

1. Identify data type requiring reclassification
2. Document reason and proposed new level
3. CEO approval required for any upgrade to L1
4. Update this guide and related policies
5. Implement any additional controls required
6. Notify affected users if handling changes

---

*Last reviewed: February 25, 2026*  
*Next review: May 2026*
