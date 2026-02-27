-- Add legacy fields that hardcoded agent-registry.ts had
-- These go in metadata JSONB so we don't pollute the core schema

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 92, 'liveRoute', '/agents/cfo/console', 'demoRoute', '/demo/cfo',
  'portal', 'woulf', 'odooModel', 'account.move',
  'emptyStateMessage', 'Connect your accounting system to unlock financial intelligence.'
) WHERE slug = 'cfo';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 88, 'liveRoute', '/agents/cfo/finops', 'demoRoute', '/demo/finops',
  'portal', 'woulf', 'odooModel', 'account.move.line',
  'emptyStateMessage', 'Connect your ERP to start analyzing financial operations.'
) WHERE slug = 'finops';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 85, 'liveRoute', '/agents/cfo/payables', 'demoRoute', '/demo/payables',
  'portal', 'woulf', 'odooModel', 'account.payment',
  'emptyStateMessage', 'Upload invoices or connect your AP system to get started.'
) WHERE slug = 'payables';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 80, 'liveRoute', '/agents/cfo/console', 'demoRoute', '/demo/collections',
  'portal', 'woulf',
  'emptyStateMessage', 'Connect receivables data to activate collections intelligence.'
) WHERE slug = 'collections';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/sales', 'demoRoute', '/demo/sales',
  'portal', 'woulf', 'odooModel', 'crm.lead',
  'emptyStateMessage', 'Connect your CRM to load your pipeline and contacts.'
) WHERE slug = 'sales';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 80, 'liveRoute', '/agents/sales/intel', 'demoRoute', '/demo/sales-field',
  'portal', 'woulf',
  'emptyStateMessage', 'Record a sales call or connect your dialer to start analyzing.'
) WHERE slug = 'sales-intel';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 80, 'liveRoute', '/agents/sales/coach', 'demoRoute', '/demo/sales-field',
  'portal', 'woulf',
  'emptyStateMessage', 'Start a coaching session to improve your sales skills.'
) WHERE slug = 'sales-coach';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/seo', 'demoRoute', '/demo/seo',
  'portal', 'clutch',
  'emptyStateMessage', 'Enter your website URL to start tracking SEO performance.'
) WHERE slug = 'seo';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/marketing', 'demoRoute', '/demo/marketing',
  'portal', 'clutch',
  'emptyStateMessage', 'Connect Google Analytics or your ad accounts to see campaign data.'
) WHERE slug = 'marketing';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/hr', 'demoRoute', '/demo/hr',
  'portal', 'woulf', 'odooModel', 'hr.employee',
  'emptyStateMessage', 'Upload your employee roster or connect your payroll system.'
) WHERE slug = 'hr';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 40, 'liveRoute', '/agents/training', 'demoRoute', '/demo/training',
  'portal', 'woulf',
  'emptyStateMessage', 'Set up training programs for your team.'
) WHERE slug = 'training';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/org-lead', 'demoRoute', '/demo/org-lead',
  'portal', 'shared',
  'emptyStateMessage', 'Set up your organization to see your command center.'
) WHERE slug = 'org-lead';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/wms', 'demoRoute', '/demo/wms',
  'portal', 'woulf', 'odooModel', 'stock.quant',
  'emptyStateMessage', 'Connect your warehouse system or upload inventory to get started.'
) WHERE slug = 'wms';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/operations', 'demoRoute', '/demo/operations',
  'portal', 'woulf',
  'emptyStateMessage', 'Create your first project to see the operations command center.'
) WHERE slug = 'operations';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/supply-chain', 'demoRoute', '/demo/supply-chain',
  'portal', 'woulf', 'odooModel', 'purchase.order',
  'emptyStateMessage', 'Connect your procurement system to see supply chain intelligence.'
) WHERE slug = 'supply-chain';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/legal', 'demoRoute', '/demo/legal',
  'portal', 'shared',
  'emptyStateMessage', 'Upload a contract PDF to see AI-powered legal analysis.'
) WHERE slug = 'legal';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 95, 'liveRoute', '/agents/compliance', 'demoRoute', '/demo/compliance',
  'portal', 'shared',
  'emptyStateMessage', 'Set up your compliance requirements to start tracking.'
) WHERE slug = 'compliance';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 40, 'liveRoute', '/agents/support', 'demoRoute', '/demo/customer-support',
  'portal', 'shared',
  'emptyStateMessage', 'Connect your support channels to start managing tickets.'
) WHERE slug = 'support';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 40, 'liveRoute', '/agents/research', 'demoRoute', '/demo/research-intel',
  'portal', 'shared',
  'emptyStateMessage', 'Configure your industry and competitors to start research.'
) WHERE slug = 'research';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 75, 'liveRoute', '/agents/str', 'demoRoute', '/demo/str',
  'portal', 'shared',
  'emptyStateMessage', 'Connect your first rental platform to get started.'
) WHERE slug = 'str';

UPDATE agent_registry SET metadata = jsonb_build_object(
  'completionPct', 30, 'liveRoute', '/agents/videdit', 'demoRoute', '/demo/videdit',
  'portal', 'shared',
  'emptyStateMessage', 'Upload a video to extract quotes and generate clips.'
) WHERE slug = 'videdit';

-- Verify
SELECT slug, metadata->>'completionPct' as pct, metadata->>'liveRoute' as route FROM agent_registry ORDER BY display_order;
