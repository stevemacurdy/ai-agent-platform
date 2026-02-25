# WoulfAI Access Control Policy

**Document ID:** SEC-POL-002
**Version:** 1.0
**Effective Date:** February 25, 2026
**Owner:** Steve Macurdy, CEO

---

## 1. Purpose

This policy defines how access to WoulfAI systems, data, and infrastructure is granted, managed, and revoked.

## 2. Access Control Principles

- **Least Privilege:** Users receive the minimum access required for their role.
- **Separation of Duties:** No single individual has unchecked access to critical systems.
- **Need to Know:** Data access is restricted to individuals who require it for their work.

## 3. Role Definitions

### 3.1 Platform Roles

| Role | Access Level | Assignment |
|------|-------------|-----------|
| super_admin | Full platform access. Can manage all companies, users, agents, and configurations. | WoulfAI employees only. |
| admin | Platform administration. Can manage users, agents, and view analytics. | WoulfAI employees only. |
| company_admin | Company-level administration. Can manage members, view company data, configure integrations. | Designated by customer organization. |
| member | Standard access. Can use assigned agents and view company data within their scope. | Default for invited users. |

### 3.2 Infrastructure Access

| System | Who Has Access | How Managed |
|--------|---------------|-------------|
| Vercel Dashboard | CEO, authorized engineers | Vercel team membership |
| Supabase Dashboard | CEO, authorized engineers | Supabase org membership |
| GitHub Repository | CEO, authorized engineers | GitHub org + branch protection |
| Stripe Dashboard | CEO, finance | Stripe team membership |
| Sentry Dashboard | CEO, authorized engineers | Sentry org membership |
| Resend Dashboard | CEO | Single admin account |

## 4. User Lifecycle

### 4.1 Onboarding
1. Admin creates invite via `/api/admin/invites` with email, role, and company assignment.
2. User receives invite email and creates account via `/invite/[token]`.
3. Employee onboarding flow (`/onboarding/employee`) completes profile and assigns default agent access.
4. Company_admin can also invite members directly via the portal.

### 4.2 Access Changes
- Role changes require admin or super_admin action via the admin panel.
- Company membership changes are managed by company_admins.
- Agent access is granted/revoked per-user.
- All changes are logged in the audit log.

### 4.3 Offboarding
- Departing users are deactivated by their company_admin or a platform admin.
- Deactivation immediately revokes all session tokens and access.
- User data is retained per the data retention policy unless deletion is requested.

## 5. Authentication Requirements

| Requirement | Implementation |
|-------------|---------------|
| Password minimum length | 8 characters |
| Session expiry | JWT expires after 1 hour (auto-refreshed) |
| Idle timeout | 24 hours of inactivity triggers logout |
| Re-authentication | Required for sensitive operations |
| Failed login handling | Supabase rate limiting (built-in) |

## 6. Access Reviews

| Review | Frequency | Responsible |
|--------|-----------|-------------|
| Platform admin access | Monthly | CEO |
| Company admin assignments | Monthly | Company admins + WoulfAI |
| Infrastructure access (Vercel, Supabase, etc.) | Monthly | CEO |
| Orphaned accounts (no login > 90 days) | Quarterly | Platform admin |
| Integration credentials | Quarterly | Company admins |

## 7. Emergency Access

In an emergency (service outage, security incident):

- The CEO has break-glass access to all infrastructure systems.
- Emergency access usage is logged and reviewed in the post-mortem.
- Credentials used during emergency access are rotated within 24 hours.

---

*This document supports WoulfAI's SOC 2 Type I readiness. For questions, contact security@woulfgroup.com.*
