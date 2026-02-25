# WoulfAI Data Retention & Classification Policy

**Document ID:** SEC-POL-004
**Version:** 1.0
**Effective Date:** February 25, 2026
**Owner:** Steve Macurdy, CEO

---

## 1. Purpose

This policy defines how WoulfAI classifies, retains, and disposes of data to meet regulatory obligations and protect customer information.

## 2. Data Classification

| Level | Label | Description | Handling Requirements |
|-------|-------|-------------|----------------------|
| 1 | **Confidential** | Customer PII, business data, financial records, integration credentials | Encrypted at rest + in transit. RLS enforced. Access logged. No sharing without authorization. |
| 2 | **Internal** | Platform configuration, audit logs, feature flags, employee data | Access restricted to WoulfAI staff. Not shared externally without redaction. |
| 3 | **Public** | Marketing content, pricing, documentation, open-source code | No special handling. May be freely shared. |

## 3. Data Inventory

| Data Type | Classification | Storage Location | Retention Period | RLS Protected |
|-----------|---------------|-----------------|------------------|--------------|
| User profiles (name, email, phone) | Confidential | Supabase: profiles | Account lifetime + 30 days | Yes |
| Company data | Confidential | Supabase: companies, company_members | Account lifetime + 30 days | Yes |
| Agent chat history | Confidential | Supabase: chat_sessions | 90 days (configurable) | Yes |
| Agent data (CRM, ERP, etc.) | Confidential | Supabase: agent_*_data tables | Real-time (from integrations) | Yes |
| Integration credentials | Confidential | Supabase: integrations | Until integration removed | Yes |
| Audit logs | Internal | Supabase: audit_log | 1 year | Yes |
| Error logs | Internal | Sentry | 90 days (Sentry default) | N/A |
| Billing data | Confidential | Stripe (external) | Per Stripe retention policy | N/A |
| Invite records | Internal | Supabase: invites | 1 year | Yes |
| Feature flags | Internal | Supabase: feature_flags | Indefinite | Yes |
| Database backups | Confidential | Supabase (encrypted) | 7 days (Supabase Pro) | N/A |

## 4. Retention Periods

### 4.1 Active Accounts
- All customer data retained for the lifetime of the account.
- Chat history may be auto-purged after 90 days unless customer opts to retain.
- Audit logs retained for 1 year minimum.

### 4.2 Account Closure
Upon account closure (by customer request or subscription cancellation):
1. Account is deactivated immediately (no further access).
2. Data export provided to customer on request (within 7 business days).
3. All customer data permanently deleted within 30 days of closure.
4. Deletion is verified and confirmation sent to the customer's email on file.
5. Backups containing the customer's data age out naturally (7-day retention).

### 4.3 Data Subject Requests
Under GDPR and CCPA, individuals may request:
- **Access:** We provide a complete export of their data within 30 days.
- **Correction:** Inaccurate data is corrected upon request.
- **Deletion:** Personal data is deleted within 30 days of verified request.
- **Portability:** Data exported in standard formats (JSON, CSV).

Requests are submitted to privacy@woulfgroup.com and tracked to completion.

## 5. Data Disposal

| Method | Used For | Verification |
|--------|----------|-------------|
| Database deletion (SQL DELETE) | Individual records, user data | Row count verification before/after |
| Account deactivation + scheduled purge | Full account closures | Automated purge job + confirmation email |
| Backup expiry | Encrypted backups age out after 7 days | Supabase managed, no manual intervention |

## 6. Data Processing Agreements

Enterprise customers may request a Data Processing Agreement (DPA) covering:
- Categories of personal data processed
- Purpose and duration of processing
- Technical and organizational measures
- Subprocessor notifications
- Data breach notification obligations

Contact legal@woulfgroup.com for DPA requests.

---

*This document supports WoulfAI's SOC 2 Type I readiness. For questions, contact security@woulfgroup.com.*
