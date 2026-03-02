# WoulfAI Agent Registry Schema Audit

## Current State Summary

**Database tables confirmed existing** (via API queries + seed SQL):
- `agent_registry` — core agent catalog
- `agent_categories` — fixed category enum
- `agent_category_map` — many-to-many (agents ↔ categories)
- `agent_tags` — free-form tags
- `agent_tag_map` — many-to-many (agents ↔ tags)
- `agent_modules` — sub-modules (features)
- `agent_module_assignments` — many-to-many (agents ↔ modules)
- `agent_tenant_config` — per-company customizations
- `agent_company_access` — company-level access/billing

**Legacy tables still present** (from migrations 005/006):
- `agents` — old flat registry (006). Superseded by `agent_registry`.
- `company_agent_access` — old access table (005). Superseded by `agent_company_access`.
- `user_agents` — old user-agent perms (006). Needs replacement.
- `agent_clicks` — click tracking (006). Still valid.
- `leads` — lead capture (006). Still valid.
- Per-agent data tables: `agent_cfo_data`, `agent_sales_data`, `agent_hr_data`, `agent_operations_data`, `agent_marketing_data`, `agent_org_lead_data`, `agent_seo_data`, `agent_wms_data` + corresponding `_kpis` tables.

**Critical gap**: No migration file captures the CREATE TABLE DDL for `agent_registry` and related tables. The schema was applied directly via Supabase SQL Editor.

---

## Decision-by-Decision Audit

### 1. IDENTITY & DISCOVERY

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Slug is permanent, display name can change | ✅ DONE | `agent_registry.slug` is UNIQUE, `display_name` is separate column | None |
| Searchable aliases/keywords | ✅ DONE | `agent_registry.keywords` is TEXT ARRAY, seeded for all 21 agents | None |
| Full lifecycle: draft → beta → live → deprecated → archived | ⚠️ PARTIAL | API types include all 8 statuses. DB CHECK constraint only allows `live/dev/beta` (from old `agents` table). Need to verify `agent_registry` CHECK. | **Verify or add CHECK constraint**: `draft, beta, live, deprecated, archived` |
| Agent catalog is global | ✅ DONE | `agent_registry` has no `company_id` — single global catalog, tenants unlock via `agent_company_access` | None |

### 2. CATEGORIZATION & ORGANIZATION

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Two-level categories + tags | ✅ DONE | `agent_categories` (fixed level 1) + `agent_tags` (free-form level 2), both with mapping tables | None |
| Agents can belong to multiple categories | ✅ DONE | `agent_category_map` with `is_primary` flag. Seed has 8 secondary mappings. | None |
| Categories are a fixed enum | ✅ DONE | `agent_categories` table seeded with: finance, sales, marketing, operations, warehouse, hr, legal, compliance, support, research | None |
| Bundles are core to pricing and onboarding | ❌ MISSING | No `agent_bundles` or `bundle_agents` table found. Old `bundles` table referenced in indexes but not in new schema. | **Need**: `agent_bundles`, `bundle_agents`, `bundle_pricing` tables |

### 3. CAPABILITIES & MODULES

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Sub-modules independently toggleable per tenant | ⚠️ PARTIAL | `agent_modules` + `agent_module_assignments` exist. But no `tenant_module_config` table to toggle per company. | **Need**: `agent_tenant_module_config` table (agent_id, module_id, company_id, enabled, config) |
| Hybrid: registry catalogs modules, agent code implements UI | ✅ DONE | `agent_modules.component_key` maps to UI. `agent_registry.component_path` for page routing. | None |
| Shared modules — leave room, don't build yet | ✅ OK | `agent_modules` has no `agent_id` column — modules are global, assigned via junction table. Shared modules possible via multiple assignments. | None |
| Agents declare capabilities for AI routing | ❌ MISSING | No `capabilities` or `declared_capabilities` column/table. | **Need**: `agent_capabilities` table or `capabilities` JSONB column on `agent_registry` |

### 4. PERMISSIONS & ACCESS CONTROL

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Permission levels: view, use, configure, admin | ⚠️ PARTIAL | `agent_company_access.permission_level` exists in API queries. Unknown if CHECK constraint enforces values. | **Verify CHECK** constraint on `permission_level` |
| Permissions per-user, per-role, AND per-company | ⚠️ PARTIAL | `agent_company_access` handles company-level. Old `user_agents` table for user-level. No role-based table. | **Need**: `agent_user_permissions` table (user_id, agent_id, company_id, permission_level) |
| Company admins can grant agent access | ✅ DONE | `agent_company_access` allows per-company grants | None |
| Registry defines data scopes/domains | ❌ MISSING | No `data_domains` or `data_scopes` column/table | **Need**: `agent_data_domains` table (agent_id, domain, access_type, sensitivity_level) |
| Agents visible but locked (upsell) vs hidden | ✅ DONE | `agent_company_access.visibility` column exists in API queries | None |

### 5. MULTI-TENANCY

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Global catalog, tenants unlock via payment | ✅ DONE | `agent_registry` is global, `agent_company_access` has `plan_type`, `trial_ends_at`, `expires_at` | None |
| Tenants customize display name/icon/description | ✅ DONE | `agent_tenant_config` table exists, queried in registry API | None |
| Per-tenant config in separate table | ✅ DONE | `agent_tenant_config` table | None |
| No tenant-created agents — only customize templates | ✅ DONE | `agent_registry` has no `owner_company_id` — all agents owned by WoulfAI | None |

### 6. DATA & INTEGRATION

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Registry tracks required/optional integrations declaratively | ❌ MISSING | No `agent_integrations` or `required_integrations` table | **Need**: `agent_integration_requirements` table (agent_id, integration_slug, is_required, description) |
| Registry declares data domains + read/write intent + sensitivity | ❌ MISSING | Same as 4.4 above | **Need**: `agent_data_domains` table |
| Agents share tables (no isolated schemas) | ✅ DONE | Per-agent data tables all use `company_id` for isolation, shared Supabase DB | None |
| Credentials in tenant-level integration table | ✅ DONE | `integration_connections` table (from 007 migration) with `org_id`, `config` JSONB | None |
| Registry declares infrastructure dependencies | ❌ MISSING | No `infrastructure_requirements` column/table | **Add**: `infrastructure` JSONB column on `agent_registry` or separate table |

### 7. UI & RENDERING

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Registry defines UI component path | ✅ DONE | `agent_registry.component_path` populated for all agents | None |
| Layout/theme in tenant/user config, NOT registry | ✅ DONE | `agent_tenant_config` for tenant-level. No theme columns on `agent_registry`. | None |
| Shell generates nav from module list | ✅ DONE | Sidebar uses `useAgents()` hook → registry API → modules | None |
| Registry declares dashboard components declaratively | ❌ MISSING | No `dashboard_components` or `kpi_declarations` column/table | **Need**: `dashboard_components` JSONB column on `agent_registry` or `agent_modules` |
| Onboarding/setup steps declared in registry | ⚠️ PARTIAL | `onboarding_sessions` tracks progress. But registry doesn't declare what steps exist. | **Need**: `onboarding_steps` JSONB column on `agent_registry` or separate `agent_onboarding_steps` table |

### 8. COMMUNICATION & EVENTS

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Agents declare inputs/outputs (events) | ❌ MISSING | No event declarations on agents | **Need**: `agent_event_declarations` table (agent_id, event_id, direction: emit/consume) |
| Separate event catalog table | ❌ MISSING | No `agent_events` or `event_catalog` table | **Need**: `agent_events` table (id, slug, display_name, schema, description) |
| Agents declare dependencies on other agents | ❌ MISSING | No `agent_dependencies` table | **Need**: `agent_dependencies` table (agent_id, depends_on_agent_id, dependency_type, is_required) |
| Registry tracks agent compatibility for workflows | ❌ MISSING | No compatibility table | Can defer — `agent_dependencies` + event catalog enables this |

### 9. VERSIONING & LIFECYCLE

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Agent contract has a version number | ✅ DONE | `agent_registry.contract_version` exists in API response | None |
| Multiple versions can coexist | ❌ MISSING | No versioning mechanism — single row per agent in `agent_registry` | **Defer** — can use `metadata.beta_component_path` for now |
| Deprecation via status + sunset_date | ⚠️ PARTIAL | `status` supports `deprecated`. No `sunset_date` column. | **Need**: `sunset_date TIMESTAMPTZ` column on `agent_registry` |
| Registry tracks last updated timestamp and by whom | ⚠️ PARTIAL | `updated_at` likely exists. No `updated_by` column. | **Need**: `updated_by UUID` column on `agent_registry` |

### 10. BILLING & MONETIZATION

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Pricing: per-agent, per-bundle, per-tier | ⚠️ PARTIAL | `agent_registry.stripe_product_id`, `is_free`, `trial_days` exist. No bundle pricing. | **Need**: Bundle tables (see 2.4) |
| Registry references Stripe product/price IDs | ✅ DONE | `stripe_product_id` on `agent_registry` | None |
| 14-day free trial per agent | ✅ DONE | `trial_days` column exists, `agent_company_access.trial_ends_at` tracks it | None |
| Usage metering for future pricing + popularity | ⚠️ PARTIAL | `agent_clicks` exists for popularity. No usage metering table. | **Need**: `agent_usage_metrics` table (agent_id, company_id, metric, value, period) |
| Registry tracks cost-to-serve per agent | ❌ MISSING | No `cost_to_serve` column | **Need**: `cost_to_serve_cents INTEGER` column on `agent_registry` |

### 11. ORDERING & PRESENTATION

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Global default order + optional tenant overrides | ⚠️ PARTIAL | `agent_registry.display_order` for global. `agent_tenant_config` likely has override but unconfirmed. | **Verify** `display_order` column on `agent_tenant_config` |
| Featured/recommended flag | ✅ DONE | `is_featured` and `is_recommended` in API response | None |
| Maturity indicator (beta badge, new badge) | ✅ DONE | `maturity` column exists in API response | None |
| A/B testing support for descriptions/positioning | ❌ MISSING | No A/B variant columns | **Add**: `ab_variants JSONB` column on `agent_registry` (or defer) |

### 12. EXTENSIBILITY

| Decision | Status | Evidence | Gap |
|----------|--------|----------|-----|
| Generic `metadata` JSONB column | ✅ DONE | `agent_registry.metadata` JSONB exists, used for liveRoute, demoRoute, completionPct, etc. | None |
| Webhook support per agent | ❌ MISSING | No `agent_webhooks` table | **Need**: `agent_webhooks` table (agent_id, company_id, url, events, secret, active) |
| No third-party marketplace | ✅ DONE | No marketplace tables. All agents owned by WoulfAI. | None |
| Audit log for all registry changes | ❌ MISSING | No `agent_audit_log` table | **Need**: `agent_audit_log` table (id, agent_id, action, changed_by, changed_at, old_value, new_value) |

---

## GAP SUMMARY

### Must Create (Blocking or Core)

| # | Table/Column | Serves Decisions | Priority |
|---|-------------|------------------|----------|
| 1 | `agent_bundles` + `bundle_agents` + `bundle_pricing` | Bundles (2.4, 10.1) | HIGH — pricing depends on this |
| 2 | `agent_tenant_module_config` | Per-tenant module toggles (3.1) | HIGH — core multi-tenant feature |
| 3 | `agent_user_permissions` | Per-user permissions (4.2) | HIGH — access control |
| 4 | `agent_audit_log` | Audit trail (12.4) | HIGH — compliance/trust |
| 5 | `agent_data_domains` | Data scopes (4.4, 6.2) | MEDIUM — needed before real integrations |
| 6 | `agent_integration_requirements` | Integration declarations (6.1) | MEDIUM — needed before real integrations |
| 7 | `agent_events` + `agent_event_declarations` | Event system (8.1, 8.2) | MEDIUM — needed for agent-to-agent comms |
| 8 | `agent_dependencies` | Agent dependencies (8.3) | MEDIUM — workflow orchestration |
| 9 | `agent_webhooks` | Webhook support (12.2) | LOW — future extensibility |

### Must Add Columns

| # | Column | Table | Serves |
|---|--------|-------|--------|
| 1 | `sunset_date TIMESTAMPTZ` | `agent_registry` | Deprecation (9.3) |
| 2 | `updated_by UUID` | `agent_registry` | Audit trail (9.4) |
| 3 | `cost_to_serve_cents INTEGER` | `agent_registry` | Cost tracking (10.5) |
| 4 | `capabilities JSONB` | `agent_registry` | AI routing (3.4) |
| 5 | `infrastructure JSONB` | `agent_registry` | Infra declarations (6.5) |
| 6 | `onboarding_steps JSONB` | `agent_registry` | Setup declarations (7.5) |
| 7 | `dashboard_components JSONB` | `agent_registry` | UI declarations (7.4) |
| 8 | `ab_variants JSONB` | `agent_registry` | A/B testing (11.4) — defer OK |

### Must Verify (Schema applied via SQL Editor, not in migrations)

| # | Check | Action |
|---|-------|--------|
| 1 | `agent_registry` status CHECK constraint includes `draft, beta, live, deprecated, archived` | ALTER TABLE or verify |
| 2 | `agent_company_access.permission_level` CHECK includes `view, use, configure, admin` | ALTER TABLE or verify |
| 3 | `agent_tenant_config` has `display_order` column for tenant sort overrides | Verify or add |
| 4 | Full DDL for all new tables captured in migration file | **CREATE MIGRATION FILE** |

### Must Clean Up (Legacy)

| # | Table | Action |
|---|-------|--------|
| 1 | `agents` (006) | Deprecate — superseded by `agent_registry` |
| 2 | `company_agent_access` (005) | Deprecate — superseded by `agent_company_access` |
| 3 | `user_agents` (006) | Replace with `agent_user_permissions` |

### Scorecard

| Category | Decisions | Done | Partial | Missing |
|----------|-----------|------|---------|---------|
| Identity & Discovery | 4 | 3 | 1 | 0 |
| Categorization | 4 | 3 | 0 | 1 |
| Capabilities & Modules | 4 | 2 | 1 | 1 |
| Permissions | 5 | 2 | 2 | 1 |
| Multi-Tenancy | 4 | 4 | 0 | 0 |
| Data & Integration | 5 | 2 | 0 | 3 |
| UI & Rendering | 5 | 3 | 1 | 1 |
| Communication & Events | 4 | 0 | 0 | 4 |
| Versioning & Lifecycle | 4 | 1 | 2 | 1 |
| Billing & Monetization | 5 | 2 | 2 | 1 |
| Ordering & Presentation | 4 | 2 | 1 | 1 |
| Extensibility | 4 | 2 | 0 | 2 |
| **TOTAL** | **52** | **26 (50%)** | **10 (19%)** | **16 (31%)** |

---

## Recommended Next Steps

1. **Capture existing DDL** — Query `information_schema.columns` for all `agent_*` tables and write migration 013.
2. **Add missing columns to `agent_registry`** — sunset_date, updated_by, cost_to_serve_cents, capabilities, infrastructure, onboarding_steps, dashboard_components (single ALTER TABLE migration 014).
3. **Create bundle tables** — agent_bundles, bundle_agents, bundle_pricing (migration 015).
4. **Create permission tables** — agent_user_permissions, agent_tenant_module_config (migration 016).
5. **Create audit + events tables** — agent_audit_log, agent_events, agent_event_declarations, agent_dependencies (migration 017).
6. **Create integration + webhook tables** — agent_integration_requirements, agent_webhooks (migration 018).
7. **Clean up legacy** — Drop or rename old `agents`, `company_agent_access`, `user_agents` tables.
