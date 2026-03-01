-- =============================================================================
-- WoulfAI Migration 016: Audit Log, Events & Dependencies
-- Closes gaps: audit log (12.4), events (8.1, 8.2), dependencies (8.3, 8.4)
-- =============================================================================

-- ── Agent Audit Log ──────────────────────────────────────────────────────────
-- Tracks all changes to the registry for compliance and debugging
CREATE TABLE IF NOT EXISTS agent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID,                            -- NULL for global events (e.g. category changes)
  action TEXT NOT NULL CHECK (action IN (
    'created', 'updated', 'status_changed', 'deprecated', 'archived',
    'module_added', 'module_removed', 'module_toggled',
    'category_changed', 'access_granted', 'access_revoked',
    'config_changed', 'permission_changed', 'bundle_changed',
    'seed', 'migration', 'other'
  )),
  entity_type TEXT NOT NULL DEFAULT 'agent' CHECK (entity_type IN (
    'agent', 'module', 'category', 'bundle', 'permission', 'config', 'integration', 'webhook'
  )),
  entity_id UUID,                           -- ID of the specific entity changed
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  old_value JSONB,                          -- snapshot before change
  new_value JSONB,                          -- snapshot after change
  description TEXT,                         -- human-readable summary
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_agent ON agent_audit_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON agent_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON agent_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_by ON agent_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON agent_audit_log(changed_at);

-- Partition-friendly: keep last 12 months by default
COMMENT ON TABLE agent_audit_log IS 'Audit trail for all agent registry changes. Consider archiving rows older than 12 months.';

-- ── Event Catalog ────────────────────────────────────────────────────────────
-- Central registry of all events that agents can emit or consume
CREATE TABLE IF NOT EXISTS agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,                -- e.g. 'invoice.created', 'deal.won'
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT,                            -- e.g. 'finance', 'sales', 'operations'
  -- Schema for payload validation
  payload_schema JSONB DEFAULT '{}',        -- JSON Schema for the event payload
  -- Lifecycle
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_category ON agent_events(category);
CREATE INDEX IF NOT EXISTS idx_events_active ON agent_events(is_active);

-- ── Agent Event Declarations ─────────────────────────────────────────────────
-- Declares which events each agent emits or consumes
CREATE TABLE IF NOT EXISTS agent_event_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,                   -- FK to agent_registry.id
  event_id UUID NOT NULL REFERENCES agent_events(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('emit', 'consume', 'both')),
  is_required BOOLEAN DEFAULT false,        -- must this event be available for agent to function?
  description TEXT,                         -- context for this agent's use of the event
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id, event_id, direction)
);

CREATE INDEX IF NOT EXISTS idx_aed_agent ON agent_event_declarations(agent_id);
CREATE INDEX IF NOT EXISTS idx_aed_event ON agent_event_declarations(event_id);
CREATE INDEX IF NOT EXISTS idx_aed_direction ON agent_event_declarations(direction);

-- ── Agent Dependencies ───────────────────────────────────────────────────────
-- Declares when one agent depends on another
CREATE TABLE IF NOT EXISTS agent_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,                   -- the agent that depends
  depends_on_agent_id UUID NOT NULL,        -- the agent it depends on
  dependency_type TEXT NOT NULL DEFAULT 'optional' 
    CHECK (dependency_type IN ('required', 'optional', 'recommended', 'enhances')),
  description TEXT,                         -- why this dependency exists
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id, depends_on_agent_id)
);

CREATE INDEX IF NOT EXISTS idx_deps_agent ON agent_dependencies(agent_id);
CREATE INDEX IF NOT EXISTS idx_deps_on ON agent_dependencies(depends_on_agent_id);

-- ── Seed: Core Events ────────────────────────────────────────────────────────
INSERT INTO agent_events (slug, display_name, description, category) VALUES
  -- Finance events
  ('invoice.created', 'Invoice Created', 'Fired when a new invoice is created', 'finance'),
  ('invoice.paid', 'Invoice Paid', 'Fired when an invoice is marked as paid', 'finance'),
  ('invoice.overdue', 'Invoice Overdue', 'Fired when an invoice passes its due date', 'finance'),
  ('payment.received', 'Payment Received', 'Fired when a payment is received', 'finance'),
  ('cashflow.alert', 'Cashflow Alert', 'Fired when cashflow falls below threshold', 'finance'),
  ('expense.submitted', 'Expense Submitted', 'Fired when an expense report is submitted', 'finance'),
  -- Sales events
  ('deal.created', 'Deal Created', 'Fired when a new deal enters pipeline', 'sales'),
  ('deal.won', 'Deal Won', 'Fired when a deal is marked as won', 'sales'),
  ('deal.lost', 'Deal Lost', 'Fired when a deal is marked as lost', 'sales'),
  ('lead.captured', 'Lead Captured', 'Fired when a new lead is captured', 'sales'),
  ('contact.updated', 'Contact Updated', 'Fired when contact info changes', 'sales'),
  -- Operations events
  ('project.milestone', 'Project Milestone', 'Fired when a project milestone is reached', 'operations'),
  ('task.completed', 'Task Completed', 'Fired when a task is completed', 'operations'),
  ('resource.allocated', 'Resource Allocated', 'Fired when resources are assigned', 'operations'),
  -- Warehouse events
  ('shipment.received', 'Shipment Received', 'Fired when a shipment is received at dock', 'warehouse'),
  ('order.shipped', 'Order Shipped', 'Fired when an order is shipped out', 'warehouse'),
  ('inventory.low', 'Inventory Low', 'Fired when inventory drops below threshold', 'warehouse'),
  ('pallet.created', 'Pallet Created', 'Fired when a new pallet is created', 'warehouse'),
  -- HR events
  ('employee.onboarded', 'Employee Onboarded', 'Fired when onboarding completes', 'hr'),
  ('pto.requested', 'PTO Requested', 'Fired when PTO is requested', 'hr'),
  ('review.due', 'Review Due', 'Fired when a performance review is due', 'hr'),
  -- Compliance events
  ('compliance.violation', 'Compliance Violation', 'Fired when a compliance issue is detected', 'compliance'),
  ('audit.scheduled', 'Audit Scheduled', 'Fired when an audit is scheduled', 'compliance'),
  -- Support events
  ('ticket.created', 'Ticket Created', 'Fired when a support ticket is created', 'support'),
  ('ticket.resolved', 'Ticket Resolved', 'Fired when a support ticket is resolved', 'support')
ON CONFLICT (slug) DO NOTHING;

-- ── Seed: Key Dependencies ───────────────────────────────────────────────────
-- FinOps depends on CFO for financial data
-- Collections depends on CFO for invoice data
-- Sales Coach depends on Sales for pipeline data
-- Sales Intel depends on Sales for deal data
-- Note: agent_ids will need to be resolved — using a subquery pattern

INSERT INTO agent_dependencies (agent_id, depends_on_agent_id, dependency_type, description)
SELECT a1.id, a2.id, deps.dep_type, deps.description
FROM (VALUES 
  ('finops', 'cfo', 'required', 'FinOps reads financial data from CFO'),
  ('payables', 'cfo', 'required', 'Payables feeds invoice data to CFO'),
  ('collections', 'cfo', 'required', 'Collections uses invoice/AR data from CFO'),
  ('sales-coach', 'sales', 'required', 'Sales Coach trains on pipeline data from Sales'),
  ('sales-intel', 'sales', 'required', 'Sales Intel analyzes deal data from Sales'),
  ('supply-chain', 'wms', 'recommended', 'Supply Chain can read inventory levels from WMS'),
  ('org-lead', 'cfo', 'optional', 'Org Lead can display financial KPIs from CFO'),
  ('org-lead', 'sales', 'optional', 'Org Lead can display pipeline metrics from Sales'),
  ('org-lead', 'hr', 'optional', 'Org Lead can display headcount from HR'),
  ('training', 'hr', 'recommended', 'Training syncs employee roster from HR')
) AS deps(from_slug, to_slug, dep_type, description)
JOIN agent_registry a1 ON a1.slug = deps.from_slug
JOIN agent_registry a2 ON a2.slug = deps.to_slug
ON CONFLICT (agent_id, depends_on_agent_id) DO NOTHING;

SELECT 'Migration 016 complete: audit log, events, dependencies' AS status;
