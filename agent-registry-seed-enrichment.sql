-- =============================================================================
-- WoulfAI Agent Registry — Seed Enrichment
-- Run in Supabase SQL Editor after the initial schema migration
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. UPDATE AGENTS — Full descriptions, component paths, keywords
-- ---------------------------------------------------------------------------
UPDATE agent_registry SET
  description = 'AI-powered financial intelligence and cash flow management',
  component_path = 'agents/cfo/console',
  keywords = ARRAY['money', 'finance', 'cash', 'p&l', 'profit', 'loss', 'revenue', 'accounting', 'invoice', 'cashflow']
WHERE slug = 'cfo';

UPDATE agent_registry SET
  description = 'AP management, debt tracking, labor analysis, and forecasting',
  component_path = 'agents/finops/console',
  keywords = ARRAY['expenses', 'debt', 'labor', 'forecast', 'budget', 'cost', 'spend', 'ap']
WHERE slug = 'finops';

UPDATE agent_registry SET
  description = 'Invoice intake, approval workflows, payment processing',
  component_path = 'agents/payables/console',
  keywords = ARRAY['invoice', 'payment', 'bills', 'vendor', 'ap', 'approval', 'reconciliation']
WHERE slug = 'payables';

UPDATE agent_registry SET
  description = '4-tier AI collections with behavioral intelligence',
  component_path = 'agents/cfo/console',
  keywords = ARRAY['overdue', 'collections', 'aging', 'receivables', 'ar', 'payment plans', 'dunning']
WHERE slug = 'collections';

UPDATE agent_registry SET
  description = 'CRM pipeline, behavioral profiles, battle cards, and deal intelligence',
  component_path = 'agents/sales',
  keywords = ARRAY['crm', 'pipeline', 'deals', 'leads', 'contacts', 'prospects', 'revenue', 'quota']
WHERE slug = 'sales';

UPDATE agent_registry SET
  description = 'Conversation intelligence, call analysis, and deal insights',
  component_path = 'agents/sales-intel/console',
  keywords = ARRAY['calls', 'conversation', 'analysis', 'insights', 'competitor', 'intelligence']
WHERE slug = 'sales-intel';

UPDATE agent_registry SET
  description = 'Sales training and performance coaching',
  component_path = 'agents/sales-coach/console',
  keywords = ARRAY['training', 'coaching', 'performance', 'skills', 'practice', 'roleplay']
WHERE slug = 'sales-coach';

UPDATE agent_registry SET
  description = 'Search rankings, keyword tracking, technical audits, and content optimization',
  component_path = 'agents/seo',
  keywords = ARRAY['search', 'google', 'rankings', 'keywords', 'backlinks', 'seo', 'organic', 'traffic']
WHERE slug = 'seo';

UPDATE agent_registry SET
  description = 'Campaign management, content calendar, ad performance, and analytics',
  component_path = 'agents/marketing',
  keywords = ARRAY['campaigns', 'ads', 'content', 'social', 'email', 'roi', 'brand', 'analytics']
WHERE slug = 'marketing';

UPDATE agent_registry SET
  description = 'Employee directory, PTO tracking, onboarding, and performance reviews',
  component_path = 'agents/hr',
  keywords = ARRAY['employees', 'people', 'pto', 'time off', 'onboarding', 'reviews', 'payroll', 'hiring']
WHERE slug = 'hr';

UPDATE agent_registry SET
  description = 'Team training programs, certifications, and skills tracking',
  component_path = 'agents/training',
  keywords = ARRAY['training', 'learning', 'courses', 'certifications', 'skills', 'development']
WHERE slug = 'training';

UPDATE agent_registry SET
  description = 'Command center for org-wide KPIs, team management, and strategic oversight',
  component_path = 'agents/org-lead',
  keywords = ARRAY['leadership', 'kpi', 'strategy', 'overview', 'organization', 'executive', 'dashboard']
WHERE slug = 'org-lead';

UPDATE agent_registry SET
  description = 'Warehouse inventory, receiving, shipping, and location management',
  component_path = 'agents/wms',
  keywords = ARRAY['warehouse', 'inventory', 'shipping', 'receiving', 'pick', 'pack', 'storage', 'locations']
WHERE slug = 'wms';

UPDATE agent_registry SET
  description = 'Project tracking, crew scheduling, and resource management',
  component_path = 'agents/operations',
  keywords = ARRAY['projects', 'scheduling', 'resources', 'crew', 'timeline', 'milestones', 'tasks']
WHERE slug = 'operations';

UPDATE agent_registry SET
  description = 'Vendor management, procurement, and logistics optimization',
  component_path = 'agents/supply-chain',
  keywords = ARRAY['vendors', 'procurement', 'logistics', 'shipping', 'suppliers', 'purchase orders']
WHERE slug = 'supply-chain';

UPDATE agent_registry SET
  description = 'Contract analysis, risk assessment, and compliance tracking',
  component_path = 'agents/legal',
  keywords = ARRAY['contracts', 'legal', 'risk', 'clauses', 'agreements', 'liability', 'nda']
WHERE slug = 'legal';

UPDATE agent_registry SET
  description = 'Regulatory tracking, audit preparation, and policy management',
  component_path = 'agents/compliance',
  keywords = ARRAY['regulations', 'audit', 'policy', 'certifications', 'risk', 'osha', 'safety']
WHERE slug = 'compliance';

UPDATE agent_registry SET
  description = 'Customer support ticketing, knowledge base, and AI-assisted responses',
  component_path = 'agents/support',
  keywords = ARRAY['tickets', 'support', 'help desk', 'customer service', 'knowledge base', 'faq']
WHERE slug = 'support';

UPDATE agent_registry SET
  description = 'Market research, competitive intelligence, and trend analysis',
  component_path = 'agents/research',
  keywords = ARRAY['research', 'market', 'competitors', 'trends', 'analysis', 'intelligence']
WHERE slug = 'research';

UPDATE agent_registry SET
  description = 'Short-term rental automation — multi-platform listing, guest concierge, cleaning & maintenance',
  component_path = 'agents/str',
  keywords = ARRAY['rental', 'airbnb', 'vrbo', 'property', 'guests', 'cleaning', 'booking', 'hospitality']
WHERE slug = 'str';

UPDATE agent_registry SET
  description = 'AI-powered video editing — quote extraction, marketing clips, and professional cleanup',
  component_path = 'agents/video-editor/console',
  keywords = ARRAY['video', 'clips', 'quotes', 'transcription', 'media', 'extraction', 'editing', 'captions']
WHERE slug = 'video-editor';

-- ---------------------------------------------------------------------------
-- 2. SEED CATEGORY MAPPINGS
-- ---------------------------------------------------------------------------

-- FINANCE agents
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM agent_registry a, agent_categories c
WHERE (a.slug, c.slug) IN (
  ('cfo', 'finance'),
  ('finops', 'finance'),
  ('payables', 'finance'),
  ('collections', 'finance')
);

-- SALES agents (primary)
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM agent_registry a, agent_categories c
WHERE (a.slug, c.slug) IN (
  ('sales', 'sales'),
  ('sales-intel', 'sales'),
  ('sales-coach', 'sales'),
  ('seo', 'marketing'),
  ('marketing', 'marketing'),
  ('research', 'sales')
);

-- OPERATIONS agents (primary)
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM agent_registry a, agent_categories c
WHERE (a.slug, c.slug) IN (
  ('org-lead', 'operations'),
  ('wms', 'warehouse'),
  ('operations', 'operations'),
  ('supply-chain', 'operations'),
  ('str', 'operations')
);

-- LEGAL & COMPLIANCE agents (primary)
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM agent_registry a, agent_categories c
WHERE (a.slug, c.slug) IN (
  ('legal', 'legal'),
  ('compliance', 'compliance')
);

-- PEOPLE agents (primary)
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM agent_registry a, agent_categories c
WHERE (a.slug, c.slug) IN (
  ('hr', 'hr'),
  ('training', 'hr')
);

-- SUPPORT agent (primary)
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM agent_registry a, agent_categories c
WHERE a.slug = 'support' AND c.slug = 'support';

-- VIDEDIT agent (primary)
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM agent_registry a, agent_categories c
WHERE a.slug = 'video-editor' AND c.slug = 'operations';

-- SECONDARY CATEGORIES (agents that belong to multiple)
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, false
FROM agent_registry a, agent_categories c
WHERE (a.slug, c.slug) IN (
  ('wms', 'operations'),           -- WMS is both Warehouse and Operations
  ('seo', 'sales'),                -- SEO is both Marketing and Sales
  ('collections', 'sales'),        -- Collections touches Sales
  ('supply-chain', 'warehouse'),   -- Supply Chain touches Warehouse
  ('compliance', 'legal'),         -- Compliance touches Legal
  ('research', 'marketing'),       -- Research touches Marketing
  ('org-lead', 'hr'),              -- Org Lead touches People
  ('str', 'finance')               -- STR touches Finance (revenue)
);

-- ---------------------------------------------------------------------------
-- 3. SEED TAGS
-- ---------------------------------------------------------------------------
INSERT INTO agent_tags (slug, display_name) VALUES
  ('ai-powered', 'AI-Powered'),
  ('automation', 'Automation'),
  ('analytics', 'Analytics'),
  ('reporting', 'Reporting'),
  ('integrations', 'Integrations'),
  ('real-time', 'Real-Time'),
  ('forecasting', 'Forecasting'),
  ('customer-facing', 'Customer-Facing'),
  ('internal-only', 'Internal Only'),
  ('data-heavy', 'Data Heavy'),
  ('quick-setup', 'Quick Setup'),
  ('enterprise', 'Enterprise'),
  ('starter', 'Starter Friendly')
ON CONFLICT (slug) DO NOTHING;

-- Tag some agents
INSERT INTO agent_tag_map (agent_id, tag_id)
SELECT a.id, t.id
FROM agent_registry a, agent_tags t
WHERE (a.slug, t.slug) IN (
  ('cfo', 'ai-powered'), ('cfo', 'analytics'), ('cfo', 'forecasting'),
  ('sales', 'ai-powered'), ('sales', 'integrations'), ('sales', 'real-time'),
  ('hr', 'quick-setup'), ('hr', 'internal-only'),
  ('wms', 'integrations'), ('wms', 'real-time'), ('wms', 'data-heavy'),
  ('seo', 'analytics'), ('seo', 'reporting'),
  ('marketing', 'analytics'), ('marketing', 'automation'),
  ('support', 'customer-facing'), ('support', 'ai-powered'),
  ('video-editor', 'ai-powered'), ('video-editor', 'automation'),
  ('operations', 'internal-only'), ('operations', 'reporting'),
  ('org-lead', 'enterprise'), ('org-lead', 'analytics'),
  ('str', 'automation'), ('str', 'customer-facing')
);

-- ---------------------------------------------------------------------------
-- 4. SEED MODULES (from existing agent features)
-- ---------------------------------------------------------------------------

-- CFO modules
INSERT INTO agent_modules (slug, display_name, icon, component_key) VALUES
  ('invoice-crud', 'Invoice Management', '🧾', 'invoice_crud'),
  ('financial-health', 'Financial Health Score', '💚', 'financial_health'),
  ('cashflow-forecast', 'Cashflow Forecast', '📈', 'cashflow_forecast'),
  ('refinance-alert', 'Refinance Alert', '🔔', 'refinance_alert'),
  ('collections-tier', 'Collections 4-Tier', '📞', 'collections_tier'),
  -- FinOps modules
  ('ap-dashboard', 'AP Dashboard', '📊', 'ap_dashboard'),
  ('debt-tracker', 'Debt Tracker', '💳', 'debt_tracker'),
  ('labor-analysis', 'Labor Analysis', '👷', 'labor_analysis'),
  ('financial-sandbox', 'Financial Sandbox', '🧪', 'financial_sandbox'),
  -- Payables modules
  ('invoice-intake', 'Invoice Intake', '📥', 'invoice_intake'),
  ('approval-queue', 'Approval Queue', '✅', 'approval_queue'),
  ('payment-processing', 'Payment Processing', '💸', 'payment_processing'),
  ('reconciliation', 'Reconciliation', '🔄', 'reconciliation'),
  -- Sales modules
  ('pipeline-kanban', 'Pipeline Kanban', '📋', 'pipeline_kanban'),
  ('contact-intel', 'Contact Intel', '🧠', 'contact_intel'),
  ('battle-cards', 'Battle Cards', '🃏', 'battle_cards'),
  ('activity-tracking', 'Activity Tracking', '📝', 'activity_tracking'),
  -- HR modules
  ('employee-directory', 'Employee Directory', '📇', 'employee_directory'),
  ('pto-manager', 'PTO Manager', '🏖️', 'pto_manager'),
  ('onboarding-checklists', 'Onboarding Checklists', '📋', 'onboarding_checklists'),
  ('performance-reviews', 'Performance Reviews', '⭐', 'performance_reviews'),
  -- WMS modules
  ('inventory-dashboard', 'Inventory Dashboard', '📦', 'inventory_dashboard'),
  ('receiving', 'Receiving', '📥', 'receiving'),
  ('pick-pack-ship', 'Pick/Pack/Ship', '🚛', 'pick_pack_ship'),
  ('location-manager', 'Location Manager', '📍', 'location_manager'),
  -- SEO modules
  ('rank-tracker', 'Rank Tracker', '📊', 'rank_tracker'),
  ('keyword-research', 'Keyword Research', '🔑', 'keyword_research'),
  ('technical-audit', 'Technical Audit', '🔧', 'technical_audit'),
  ('content-grader', 'Content Grader', '📝', 'content_grader'),
  -- Marketing modules
  ('campaign-builder', 'Campaign Builder', '🎯', 'campaign_builder'),
  ('content-calendar', 'Content Calendar', '📅', 'content_calendar'),
  ('ad-analytics', 'Ad Analytics', '📊', 'ad_analytics'),
  ('roi-tracker', 'ROI Tracker', '💰', 'roi_tracker'),
  -- Operations modules
  ('project-tracker', 'Project Tracker', '📋', 'project_tracker'),
  ('crew-scheduler', 'Crew Scheduler', '👷', 'crew_scheduler'),
  ('resource-manager', 'Resource Manager', '🔧', 'resource_manager'),
  ('timeline', 'Timeline', '📅', 'timeline'),
  -- Legal modules
  ('contract-scanner', 'Contract Scanner', '📄', 'contract_scanner'),
  ('risk-assessment', 'Risk Assessment', '⚠️', 'risk_assessment'),
  ('renewal-calendar', 'Renewal Calendar', '📅', 'renewal_calendar'),
  ('clause-library', 'Clause Library', '📚', 'clause_library'),
  -- Compliance modules
  ('regulation-tracker', 'Regulation Tracker', '📋', 'regulation_tracker'),
  ('audit-prep', 'Audit Prep', '🔍', 'audit_prep'),
  ('policy-library', 'Policy Library', '📚', 'policy_library'),
  ('training-log', 'Training Log', '📝', 'training_log'),
  -- Supply Chain modules
  ('vendor-scorecards', 'Vendor Scorecards', '📊', 'vendor_scorecards'),
  ('po-management', 'PO Management', '📋', 'po_management'),
  ('logistics-tracker', 'Logistics Tracker', '🚛', 'logistics_tracker'),
  ('cost-optimizer', 'Cost Optimizer', '💰', 'cost_optimizer'),
  -- Org Lead modules
  ('kpi-dashboard', 'KPI Dashboard', '📊', 'kpi_dashboard'),
  ('team-overview', 'Team Overview', '👥', 'team_overview'),
  ('strategic-planning', 'Strategic Planning', '🎯', 'strategic_planning'),
  ('cross-agent-reports', 'Cross-Agent Reports', '📈', 'cross_agent_reports'),
  -- STR modules
  ('multi-platform-sync', 'Multi-Platform Sync', '🔄', 'multi_platform_sync'),
  ('guest-automation', 'Guest Automation', '🤖', 'guest_automation'),
  ('ai-concierge', 'AI Concierge', '🛎️', 'ai_concierge'),
  ('cleaning-scheduler', 'Cleaning Scheduler', '🧹', 'cleaning_scheduler')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. ASSIGN MODULES TO AGENTS
-- ---------------------------------------------------------------------------

-- CFO
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('invoice-crud',1),('financial-health',2),('cashflow-forecast',3),('refinance-alert',4),('collections-tier',5)) AS o(slug, ord)
WHERE a.slug = 'cfo' AND m.slug = o.slug;

-- FinOps
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('ap-dashboard',1),('debt-tracker',2),('labor-analysis',3),('financial-sandbox',4)) AS o(slug, ord)
WHERE a.slug = 'finops' AND m.slug = o.slug;

-- Payables
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('invoice-intake',1),('approval-queue',2),('payment-processing',3),('reconciliation',4)) AS o(slug, ord)
WHERE a.slug = 'payables' AND m.slug = o.slug;

-- Sales
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('pipeline-kanban',1),('contact-intel',2),('battle-cards',3),('activity-tracking',4)) AS o(slug, ord)
WHERE a.slug = 'sales' AND m.slug = o.slug;

-- HR
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('employee-directory',1),('pto-manager',2),('onboarding-checklists',3),('performance-reviews',4)) AS o(slug, ord)
WHERE a.slug = 'hr' AND m.slug = o.slug;

-- WMS
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('inventory-dashboard',1),('receiving',2),('pick-pack-ship',3),('location-manager',4)) AS o(slug, ord)
WHERE a.slug = 'wms' AND m.slug = o.slug;

-- SEO
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('rank-tracker',1),('keyword-research',2),('technical-audit',3),('content-grader',4)) AS o(slug, ord)
WHERE a.slug = 'seo' AND m.slug = o.slug;

-- Marketing
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('campaign-builder',1),('content-calendar',2),('ad-analytics',3),('roi-tracker',4)) AS o(slug, ord)
WHERE a.slug = 'marketing' AND m.slug = o.slug;

-- Operations
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('project-tracker',1),('crew-scheduler',2),('resource-manager',3),('timeline',4)) AS o(slug, ord)
WHERE a.slug = 'operations' AND m.slug = o.slug;

-- Legal
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('contract-scanner',1),('risk-assessment',2),('renewal-calendar',3),('clause-library',4)) AS o(slug, ord)
WHERE a.slug = 'legal' AND m.slug = o.slug;

-- Compliance
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('regulation-tracker',1),('audit-prep',2),('policy-library',3),('training-log',4)) AS o(slug, ord)
WHERE a.slug = 'compliance' AND m.slug = o.slug;

-- Supply Chain
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('vendor-scorecards',1),('po-management',2),('logistics-tracker',3),('cost-optimizer',4)) AS o(slug, ord)
WHERE a.slug = 'supply-chain' AND m.slug = o.slug;

-- Org Lead
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('kpi-dashboard',1),('team-overview',2),('strategic-planning',3),('cross-agent-reports',4)) AS o(slug, ord)
WHERE a.slug = 'org-lead' AND m.slug = o.slug;

-- STR
INSERT INTO agent_module_assignments (agent_id, module_id, display_order)
SELECT a.id, m.id, o.ord
FROM agent_registry a, agent_modules m,
(VALUES ('multi-platform-sync',1),('guest-automation',2),('ai-concierge',3),('cleaning-scheduler',4)) AS o(slug, ord)
WHERE a.slug = 'str' AND m.slug = o.slug;

-- ---------------------------------------------------------------------------
-- DONE — Verify
-- ---------------------------------------------------------------------------
SELECT 'Agents with descriptions: ' || count(*) FROM agent_registry WHERE description IS NOT NULL;
SELECT 'Category mappings: ' || count(*) FROM agent_category_map;
SELECT 'Tags: ' || count(*) FROM agent_tags;
SELECT 'Agent-tag links: ' || count(*) FROM agent_tag_map;
SELECT 'Modules: ' || count(*) FROM agent_modules;
SELECT 'Module assignments: ' || count(*) FROM agent_module_assignments;
