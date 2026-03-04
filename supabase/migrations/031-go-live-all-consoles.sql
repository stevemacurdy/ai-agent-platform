-- =============================================================================
-- WoulfAI Migration 031: Go Live — All 21 Agent Consoles
-- Updates agent_registry: status → live, component_path → console routes
-- =============================================================================

-- 1. Set ALL agents to live status and correct console paths
UPDATE agent_registry SET status = 'live', component_path = 'agents/cfo/console' WHERE slug = 'cfo';
UPDATE agent_registry SET status = 'live', component_path = 'agents/finops/console' WHERE slug = 'finops';
UPDATE agent_registry SET status = 'live', component_path = 'agents/payables/console' WHERE slug = 'payables';
UPDATE agent_registry SET status = 'live', component_path = 'agents/collections/console' WHERE slug = 'collections';
UPDATE agent_registry SET status = 'live', component_path = 'agents/sales/console' WHERE slug = 'sales';
UPDATE agent_registry SET status = 'live', component_path = 'agents/sales-intel/console' WHERE slug = 'sales-intel';
UPDATE agent_registry SET status = 'live', component_path = 'agents/sales-coach/console' WHERE slug = 'sales-coach';
UPDATE agent_registry SET status = 'live', component_path = 'agents/marketing/console' WHERE slug = 'marketing';
UPDATE agent_registry SET status = 'live', component_path = 'agents/seo/console' WHERE slug = 'seo';
UPDATE agent_registry SET status = 'live', component_path = 'agents/hr/console' WHERE slug = 'hr';
UPDATE agent_registry SET status = 'live', component_path = 'agents/training/console' WHERE slug = 'training';
UPDATE agent_registry SET status = 'live', component_path = 'agents/support/console' WHERE slug = 'support';
UPDATE agent_registry SET status = 'live', component_path = 'agents/operations/console' WHERE slug = 'operations';
UPDATE agent_registry SET status = 'live', component_path = 'agents/supply-chain/console' WHERE slug = 'supply-chain';
UPDATE agent_registry SET status = 'live', component_path = 'agents/wms/console' WHERE slug = 'wms';
UPDATE agent_registry SET status = 'live', component_path = 'agents/legal/console' WHERE slug = 'legal';
UPDATE agent_registry SET status = 'live', component_path = 'agents/compliance/console' WHERE slug = 'compliance';
UPDATE agent_registry SET status = 'live', component_path = 'agents/research/console' WHERE slug = 'research';
UPDATE agent_registry SET status = 'live', component_path = 'agents/org-lead/console' WHERE slug = 'org-lead';
UPDATE agent_registry SET status = 'live', component_path = 'agents/str/console' WHERE slug = 'str';

-- 2. Insert warehouse agent if not already in registry
INSERT INTO agent_registry (slug, name, display_name, short_description, description, icon, status, component_path, display_order)
VALUES (
  'warehouse',
  'Warehouse Agent',
  'Warehouse',
  'Floor operations, inventory, orders, and zone performance',
  'AI warehouse operations — floor dashboard, inventory tracking, order management, and zone optimization',
  '🏭',
  'live',
  'agents/warehouse/console',
  22
) ON CONFLICT (slug) DO UPDATE SET
  status = 'live',
  component_path = 'agents/warehouse/console';

-- 3. Map warehouse to operations category if not already mapped
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM agent_registry a, agent_categories c
WHERE a.slug = 'warehouse' AND c.slug = 'operations'
ON CONFLICT DO NOTHING;

-- 4. Update the old agents table too (used by some legacy code)
UPDATE agents SET status = 'live', live_route = '/agents/cfo/console' WHERE slug = 'cfo';
UPDATE agents SET status = 'live', live_route = '/agents/sales/console' WHERE slug = 'sales';
UPDATE agents SET status = 'live', live_route = '/agents/finops/console' WHERE slug = 'finops';
UPDATE agents SET status = 'live', live_route = '/agents/payables/console' WHERE slug = 'payables';
UPDATE agents SET status = 'live', live_route = '/agents/collections/console' WHERE slug = 'collections';
UPDATE agents SET status = 'live', live_route = '/agents/hr/console' WHERE slug = 'hr';
UPDATE agents SET status = 'live', live_route = '/agents/operations/console' WHERE slug = 'operations';
UPDATE agents SET status = 'live', live_route = '/agents/legal/console' WHERE slug = 'legal';
UPDATE agents SET status = 'live', live_route = '/agents/marketing/console' WHERE slug = 'marketing';
UPDATE agents SET status = 'live', live_route = '/agents/wms/console' WHERE slug = 'wms';
UPDATE agents SET status = 'live', live_route = '/agents/compliance/console' WHERE slug = 'compliance';

SELECT 'Migration 031 complete: All 21 consoles set to LIVE' AS status;
