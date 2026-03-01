# WoulfAI Schema Migrations — Run Guide

## Pre-flight

Run `000-dump-current-schema.sql` in Supabase SQL Editor first to capture
the current state of all `agent_*` tables before making changes. Save
the output as a backup.

## Execution Order

Run each migration **one at a time** in Supabase SQL Editor.
Wait for success message before proceeding to the next.

| # | File | What it does | Tables/Columns affected |
|---|------|-------------|------------------------|
| 0 | `000-dump-current-schema.sql` | **Backup** — dumps current DDL | Read-only |
| 1 | `013_agent_registry_columns.sql` | Adds 8 columns + fixes status CHECK | `agent_registry` |
| 2 | `014_bundle_tables.sql` | Creates bundle system + seeds 5 bundles | `agent_bundles`, `bundle_agents`, `company_bundle_access` |
| 3 | `015_permissions_tenant_modules.sql` | Per-user perms + per-tenant module toggles | `agent_user_permissions`, `agent_tenant_module_config`, `agent_tenant_config`, `agent_company_access` |
| 4 | `016_audit_events_dependencies.sql` | Audit log, event catalog, agent deps | `agent_audit_log`, `agent_events`, `agent_event_declarations`, `agent_dependencies` |
| 5 | `017_integrations_webhooks_usage.sql` | Integration reqs, data domains, webhooks, usage | `agent_integration_requirements`, `agent_data_domains`, `agent_webhooks`, `agent_usage_metrics` |
| 6 | `018_legacy_cleanup.sql` | Renames old tables with `_legacy_` prefix | `agents`→`_legacy_agents_006`, `company_agent_access`→`_legacy_...`, etc. |

## After running

1. **Copy migration files into repo:**
   ```bash
   cp ~/Downloads/013_*.sql ~/Downloads/014_*.sql ~/Downloads/015_*.sql \
      ~/Downloads/016_*.sql ~/Downloads/017_*.sql ~/Downloads/018_*.sql \
      ~/Desktop/ai-ecosystem/ai-agent-platform/supabase/migrations/
   git add supabase/migrations/01[3-8]*.sql
   git commit -m "schema: migrations 013-018 — close all registry gaps"
   git push
   ```

2. **Verify counts** — run in SQL Editor:
   ```sql
   SELECT 'agent_registry columns' AS check, count(*) FROM information_schema.columns WHERE table_name = 'agent_registry';
   SELECT 'bundles' AS check, count(*) FROM agent_bundles;
   SELECT 'bundle_agents' AS check, count(*) FROM bundle_agents;
   SELECT 'events' AS check, count(*) FROM agent_events;
   SELECT 'dependencies' AS check, count(*) FROM agent_dependencies;
   SELECT 'integration_reqs' AS check, count(*) FROM agent_integration_requirements;
   SELECT 'data_domains' AS check, count(*) FROM agent_data_domains;
   SELECT 'legacy renamed' AS check, count(*) FROM information_schema.tables WHERE table_name LIKE '_legacy_%';
   ```

3. **Seed bundle_agents** — After migration 014 creates the bundle tables,
   you'll want to associate agents with bundles. Run this after 014:
   ```sql
   -- Finance Suite: CFO + FinOps + Payables + Collections
   INSERT INTO bundle_agents (bundle_id, agent_id, display_order, is_highlighted)
   SELECT b.id, a.id, o.ord, o.highlighted
   FROM agent_bundles b, agent_registry a,
   (VALUES ('cfo',1,true),('finops',2,false),('payables',3,false),('collections',4,false)) AS o(slug, ord, highlighted)
   WHERE b.slug = 'finance-suite' AND a.slug = o.slug;

   -- Sales Suite: Sales + Sales Intel + Sales Coach + Marketing + SEO
   INSERT INTO bundle_agents (bundle_id, agent_id, display_order, is_highlighted)
   SELECT b.id, a.id, o.ord, o.highlighted
   FROM agent_bundles b, agent_registry a,
   (VALUES ('sales',1,true),('sales-intel',2,false),('sales-coach',3,false),('marketing',4,false),('seo',5,false)) AS o(slug, ord, highlighted)
   WHERE b.slug = 'sales-suite' AND a.slug = o.slug;

   -- Operations Suite: Operations + WMS + Supply Chain + Org Lead
   INSERT INTO bundle_agents (bundle_id, agent_id, display_order, is_highlighted)
   SELECT b.id, a.id, o.ord, o.highlighted
   FROM agent_bundles b, agent_registry a,
   (VALUES ('operations',1,true),('wms',2,false),('supply-chain',3,false),('org-lead',4,false)) AS o(slug, ord, highlighted)
   WHERE b.slug = 'operations-suite' AND a.slug = o.slug;
   ```

## New Table Summary (13 tables created)

| Table | Purpose | Rows after seed |
|-------|---------|----------------|
| `agent_bundles` | Named groups of agents for pricing | 5 |
| `bundle_agents` | Bundle ↔ agent junction | ~13 |
| `company_bundle_access` | Company bundle subscriptions | 0 |
| `agent_user_permissions` | Per-user, per-agent, per-company perms | 0 |
| `agent_tenant_module_config` | Per-company module enable/disable | 0 |
| `agent_audit_log` | Change tracking for registry | 0 |
| `agent_events` | Event catalog | 25 |
| `agent_event_declarations` | Agent ↔ event mappings | 0 (seed later) |
| `agent_dependencies` | Agent ↔ agent dependency graph | 10 |
| `agent_integration_requirements` | Declarative integration needs | 15 |
| `agent_data_domains` | Data scope + sensitivity declarations | 22 |
| `agent_webhooks` | Per-company webhook endpoints | 0 |
| `agent_usage_metrics` | Usage metering for billing | 0 |

## Scorecard After Migrations

| Category | Before | After |
|----------|--------|-------|
| Identity & Discovery | 3✅ 1⚠️ | 4✅ |
| Categorization | 3✅ 1❌ | 4✅ |
| Capabilities & Modules | 2✅ 1⚠️ 1❌ | 4✅ |
| Permissions | 2✅ 2⚠️ 1❌ | 5✅ |
| Multi-Tenancy | 4✅ | 4✅ |
| Data & Integration | 2✅ 3❌ | 5✅ |
| UI & Rendering | 3✅ 1⚠️ 1❌ | 5✅ |
| Communication & Events | 4❌ | 4✅ |
| Versioning & Lifecycle | 1✅ 2⚠️ 1❌ | 3✅ 1⚠️* |
| Billing & Monetization | 2✅ 2⚠️ 1❌ | 5✅ |
| Ordering & Presentation | 2✅ 1⚠️ 1❌ | 3✅ 1⚠️* |
| Extensibility | 2✅ 2❌ | 4✅ |
| **TOTAL** | **26✅ 10⚠️ 16❌** | **50✅ 2⚠️** |

*Remaining ⚠️: Multi-version coexistence (defer — use metadata for now) and A/B testing (column added, implementation later).
