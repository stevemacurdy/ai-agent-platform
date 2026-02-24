// ============================================================
// WoulfAI Agent Registry — Single Source of Truth
// Last consolidated: 2026-02-21
// ============================================================

export type AgentStatus = 'live' | 'demo' | 'dev' | 'beta' | 'locked';
export type FeatureStatus = 'done' | 'backlog' | 'debt';
export type AgentCategory = 'finance' | 'sales' | 'operations' | 'compliance' | 'people' | 'portal';

export interface AgentFeature {
  name: string;
  status: FeatureStatus;
}

export interface AgentDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  status: AgentStatus;
  category: AgentCategory;
  completionPct: number;
  sortOrder: number;
  liveRoute: string;
  demoRoute: string;
  portal: 'woulf' | 'clutch' | 'shared';
  features: AgentFeature[];
  odooModel?: string;
  emptyStateMessage: string;
}

// Backward-compatible alias
export type Agent = AgentDefinition;

export const AGENTS: AgentDefinition[] = [
  // ── FINANCE ──────────────────────────────────────────────
  {
    slug: 'cfo',
    name: 'CFO Agent',
    description: 'AI-powered financial intelligence and cash flow management',
    icon: '💰',
    status: 'live',
    category: 'finance',
    completionPct: 92,
    sortOrder: 1,
    liveRoute: '/agents/cfo/console',
    demoRoute: '/demo/cfo',
    portal: 'woulf',
    features: [
      { name: 'Invoice CRUD', status: 'done' },
      { name: 'Financial Health Score', status: 'done' },
      { name: 'Cashflow Forecast', status: 'done' },
      { name: 'Refinance Alert', status: 'done' },
      { name: 'Collections 4-Tier', status: 'done' },
    ],
    odooModel: 'account.move',
    emptyStateMessage: 'Connect your accounting system to unlock financial intelligence.',
  },
  {
    slug: 'finops',
    name: 'FinOps Agent',
    description: 'AP management, debt tracking, labor analysis, and forecasting',
    icon: '📊',
    status: 'live',
    category: 'finance',
    completionPct: 88,
    sortOrder: 2,
    liveRoute: '/agents/cfo/finops',
    demoRoute: '/demo/finops',
    portal: 'woulf',
    features: [
      { name: 'AP Dashboard', status: 'done' },
      { name: 'Debt Tracker', status: 'done' },
      { name: 'Labor Analysis', status: 'done' },
      { name: 'Sandbox', status: 'done' },
    ],
    odooModel: 'account.move.line',
    emptyStateMessage: 'Connect your ERP to start analyzing financial operations.',
  },
  {
    slug: 'payables',
    name: 'Payables Agent',
    description: 'Invoice intake, approval workflows, payment processing',
    icon: '🧾',
    status: 'live',
    category: 'finance',
    completionPct: 85,
    sortOrder: 3,
    liveRoute: '/agents/cfo/payables',
    demoRoute: '/demo/payables',
    portal: 'woulf',
    features: [
      { name: 'Invoice Intake', status: 'done' },
      { name: 'Approval Queue', status: 'done' },
      { name: 'Payment Processing', status: 'done' },
      { name: 'Reconciliation', status: 'done' },
    ],
    odooModel: 'account.payment',
    emptyStateMessage: 'Upload invoices or connect your AP system to get started.',
  },
  {
    slug: 'collections',
    name: 'Collections Agent',
    description: '4-tier AI collections with behavioral intelligence',
    icon: '📞',
    status: 'live',
    category: 'finance',
    completionPct: 80,
    sortOrder: 4,
    liveRoute: '/agents/cfo/console',
    demoRoute: '/demo/collections',
    portal: 'woulf',
    features: [
      { name: 'Aging Analysis', status: 'done' },
      { name: 'Auto-Escalation', status: 'done' },
      { name: 'Payment Plans', status: 'done' },
      { name: 'Risk Scoring', status: 'done' },
    ],
    emptyStateMessage: 'Connect receivables data to activate collections intelligence.',
  },

  // ── SALES & MARKETING ───────────────────────────────────
  {
    slug: 'sales',
    name: 'Sales Agent',
    description: 'CRM pipeline, behavioral profiles, battle cards, and deal intelligence',
    icon: '🎯',
    status: 'live',
    category: 'sales',
    completionPct: 95,
    sortOrder: 5,
    liveRoute: '/agents/sales',
    demoRoute: '/demo/sales',
    portal: 'woulf',
    features: [
      { name: 'Pipeline Kanban', status: 'done' },
      { name: 'Contact Intel', status: 'done' },
      { name: 'Battle Cards', status: 'done' },
      { name: 'Activity Tracking', status: 'done' },
    ],
    odooModel: 'crm.lead',
    emptyStateMessage: 'Connect your CRM to load your pipeline and contacts.',
  },
  {
    slug: 'sales-intel',
    name: 'Sales Intel',
    description: 'Conversation intelligence, call analysis, and deal insights',
    icon: '🧠',
    status: 'live',
    category: 'sales',
    completionPct: 80,
    sortOrder: 6,
    liveRoute: '/agents/sales/intel',
    demoRoute: '/demo/sales-field',
    portal: 'woulf',
    features: [
      { name: 'Call Analysis', status: 'done' },
      { name: 'Deal Insights', status: 'done' },
      { name: 'Competitor Intel', status: 'backlog' },
    ],
    emptyStateMessage: 'Record a sales call or connect your dialer to start analyzing.',
  },
  {
    slug: 'seo',
    name: 'SEO Agent',
    description: 'Search rankings, keyword tracking, technical audits, and content optimization',
    icon: '🔍',
    status: 'live',
    category: 'sales',
    completionPct: 95,
    sortOrder: 7,
    liveRoute: '/agents/seo',
    demoRoute: '/demo/seo',
    portal: 'clutch',
    features: [
      { name: 'Rank Tracker', status: 'done' },
      { name: 'Keyword Research', status: 'done' },
      { name: 'Technical Audit', status: 'done' },
      { name: 'Content Grader', status: 'done' },
    ],
    emptyStateMessage: 'Enter your website URL to start tracking SEO performance.',
  },
  {
    slug: 'marketing',
    name: 'Marketing Agent',
    description: 'Campaign management, content calendar, ad performance, and analytics',
    icon: '📣',
    status: 'live',
    category: 'sales',
    completionPct: 95,
    sortOrder: 8,
    liveRoute: '/agents/marketing',
    demoRoute: '/demo/marketing',
    portal: 'clutch',
    features: [
      { name: 'Campaign Builder', status: 'done' },
      { name: 'Content Calendar', status: 'done' },
      { name: 'Ad Analytics', status: 'done' },
      { name: 'ROI Tracker', status: 'done' },
    ],
    emptyStateMessage: 'Connect Google Analytics or your ad accounts to see campaign data.',
  },

  // ── OPERATIONS & LOGISTICS ──────────────────────────────
  {
    slug: 'org-lead',
    name: 'Organization Lead',
    description: 'Command center for org-wide KPIs, team management, and strategic oversight',
    icon: '🏢',
    status: 'live',
    category: 'operations',
    completionPct: 95,
    sortOrder: 9,
    liveRoute: '/agents/org-lead',
    demoRoute: '/demo/org-lead',
    portal: 'shared',
    features: [
      { name: 'KPI Dashboard', status: 'done' },
      { name: 'Team Overview', status: 'done' },
      { name: 'Strategic Planning', status: 'done' },
      { name: 'Cross-Agent Reports', status: 'done' },
    ],
    emptyStateMessage: 'Set up your organization to see your command center.',
  },
  {
    slug: 'wms',
    name: 'WMS Agent',
    description: 'Warehouse inventory, receiving, shipping, and location management',
    icon: '📦',
    status: 'live',
    category: 'operations',
    completionPct: 95,
    sortOrder: 10,
    liveRoute: '/agents/wms',
    demoRoute: '/demo/wms',
    portal: 'woulf',
    features: [
      { name: 'Inventory Dashboard', status: 'done' },
      { name: 'Receiving', status: 'done' },
      { name: 'Pick/Pack/Ship', status: 'done' },
      { name: 'Location Manager', status: 'done' },
    ],
    odooModel: 'stock.quant',
    emptyStateMessage: 'Connect your warehouse system or upload inventory to get started.',
  },
  {
    slug: 'operations',
    name: 'Operations Agent',
    description: 'Project tracking, crew scheduling, and resource management',
    icon: '⚙️',
    status: 'live',
    category: 'operations',
    completionPct: 95,
    sortOrder: 11,
    liveRoute: '/agents/operations',
    demoRoute: '/demo/operations',
    portal: 'woulf',
    features: [
      { name: 'Project Tracker', status: 'done' },
      { name: 'Crew Scheduler', status: 'done' },
      { name: 'Resource Manager', status: 'done' },
      { name: 'Timeline', status: 'done' },
    ],
    emptyStateMessage: 'Create your first project to see the operations command center.',
  },
  {
    slug: 'supply-chain',
    name: 'Supply Chain Agent',
    description: 'Vendor management, procurement, and logistics optimization',
    icon: '🚛',
    status: 'live',
    category: 'operations',
    completionPct: 95,
    sortOrder: 12,
    liveRoute: '/agents/supply-chain',
    demoRoute: '/demo/supply-chain',
    portal: 'woulf',
    features: [
      { name: 'Vendor Scorecards', status: 'done' },
      { name: 'PO Management', status: 'done' },
      { name: 'Logistics Tracker', status: 'done' },
      { name: 'Cost Optimizer', status: 'done' },
    ],
    odooModel: 'purchase.order',
    emptyStateMessage: 'Connect your procurement system to see supply chain intelligence.',
  },

  // ── LEGAL & COMPLIANCE ──────────────────────────────────
  {
    slug: 'legal',
    name: 'Legal Agent',
    description: 'Contract analysis, risk assessment, and compliance tracking',
    icon: '⚖️',
    status: 'live',
    category: 'compliance',
    completionPct: 95,
    sortOrder: 13,
    liveRoute: '/agents/legal',
    demoRoute: '/demo/legal',
    portal: 'shared',
    features: [
      { name: 'Contract Scanner', status: 'done' },
      { name: 'Risk Assessment', status: 'done' },
      { name: 'Renewal Calendar', status: 'done' },
      { name: 'Clause Library', status: 'done' },
    ],
    emptyStateMessage: 'Upload a contract PDF to see AI-powered legal analysis.',
  },
  {
    slug: 'compliance',
    name: 'Compliance Agent',
    description: 'Regulatory tracking, audit preparation, and policy management',
    icon: '🛡️',
    status: 'live',
    category: 'compliance',
    completionPct: 95,
    sortOrder: 14,
    liveRoute: '/agents/compliance',
    demoRoute: '/demo/compliance',
    portal: 'shared',
    features: [
      { name: 'Regulation Tracker', status: 'done' },
      { name: 'Audit Prep', status: 'done' },
      { name: 'Policy Library', status: 'done' },
      { name: 'Training Log', status: 'done' },
    ],
    emptyStateMessage: 'Set up your compliance requirements to start tracking.',
  },

  // ── PEOPLE & CULTURE ────────────────────────────────────
  {
    slug: 'hr',
    name: 'HR Agent',
    description: 'Employee directory, PTO tracking, onboarding, and performance reviews',
    icon: '👥',
    status: 'live',
    category: 'people',
    completionPct: 95,
    sortOrder: 15,
    liveRoute: '/agents/hr',
    demoRoute: '/demo/hr',
    portal: 'woulf',
    features: [
      { name: 'Employee Directory', status: 'done' },
      { name: 'PTO Manager', status: 'done' },
      { name: 'Onboarding Checklists', status: 'done' },
      { name: 'Reviews', status: 'done' },
    ],
    odooModel: 'hr.employee',
    emptyStateMessage: 'Upload your employee roster or connect your payroll system.',
  },
  {
    slug: 'training',
    name: 'Training Agent',
    description: 'Team training programs, certifications, and skills tracking',
    icon: '🎓',
    status: 'live',
    category: 'people',
    completionPct: 40,
    sortOrder: 16,
    liveRoute: '/agents/training',
    demoRoute: '/demo/training',
    portal: 'woulf',
    features: [
      { name: 'Course Library', status: 'backlog' },
      { name: 'Certification Tracker', status: 'backlog' },
      { name: 'Skills Matrix', status: 'backlog' },
    ],
    emptyStateMessage: 'Set up training programs for your team.',
  },

  // ── PORTAL & TOOLS ─────────────────────────────────────
  {
    slug: 'customer-portal',
    name: 'Customer Portal',
    description: '3PL customer-facing inventory, ASN, and billing portal',
    icon: '🌐',
    status: 'live',
    category: 'portal',
    completionPct: 90,
    sortOrder: 17,
    liveRoute: '/portal',
    demoRoute: '/demo/wms-proof-billing',
    portal: 'woulf',
    features: [
      { name: 'Inventory View', status: 'done' },
      { name: 'ASN Submission', status: 'done' },
      { name: 'Billing Dashboard', status: 'done' },
      { name: 'Shipment Tracking', status: 'done' },
    ],
    emptyStateMessage: 'Your portal will be configured by your warehouse provider.',
  },
  {
    slug: 'research',
    name: 'Research Agent',
    description: 'Market research, competitive intelligence, and trend analysis',
    icon: '📡',
    status: 'live',
    category: 'sales',
    completionPct: 40,
    sortOrder: 18,
    liveRoute: '/agents/research',
    demoRoute: '/demo/research-intel',
    portal: 'shared',
    features: [
      { name: 'Market Scanner', status: 'backlog' },
      { name: 'Competitive Intel', status: 'backlog' },
      { name: 'Trend Reports', status: 'backlog' },
    ],
    emptyStateMessage: 'Configure your industry and competitors to start research.',
  },
  {
    slug: 'support',
    name: 'Support Agent',
    description: 'Customer support ticketing, knowledge base, and AI-assisted responses',
    icon: '🎧',
    status: 'live',
    category: 'portal',
    completionPct: 40,
    sortOrder: 19,
    liveRoute: '/agents/support',
    demoRoute: '/demo/customer-support',
    portal: 'shared',
    features: [
      { name: 'Ticket Management', status: 'backlog' },
      { name: 'Knowledge Base', status: 'backlog' },
      { name: 'AI Responses', status: 'backlog' },
    ],
    emptyStateMessage: 'Connect your support channels to start managing tickets.',
  },
  {
    slug: 'onboarding',
    name: 'Onboarding Wizard',
    description: 'Guided setup for new companies, agents, and integrations',
    icon: '🧙',
    status: 'live',
    category: 'portal',
    completionPct: 85,
    sortOrder: 20,
    liveRoute: '/onboarding',
    demoRoute: '/onboarding',
    portal: 'shared',
    features: [
      { name: 'Company Setup', status: 'done' },
      { name: 'Agent Configuration', status: 'done' },
      { name: 'Integration Wizard', status: 'done' },
    ],
    emptyStateMessage: 'Start the onboarding wizard to configure your workspace.',
  },
  {
    slug: 'str',
    name: 'STR Manager',
    description: 'Short-term rental automation — multi-platform listing, guest concierge, cleaning & maintenance',
    category: 'operations',
    icon: '🏔️',
    status: 'live',
    liveRoute: '/agents/str',
    demoRoute: '/demo/str',
    features: [
      { name: 'Multi-Platform Sync', status: 'done' },
      { name: 'Guest Automation', status: 'done' },
      { name: 'AI Concierge', status: 'done' },
      { name: 'Cleaning Scheduler', status: 'done' },
      { name: 'Smart Lock Integration', status: 'backlog' },
    ],
    completionPct: 75,
    sortOrder: 21,
    portal: 'shared',
    emptyStateMessage: 'Connect your first rental platform to get started.',
  },
];

// ── Helpers ──────────────────────────────────────────────────
export function getAgent(slug: string): AgentDefinition | undefined {
  return AGENTS.find(a => a.slug === slug);
}

export function getAgentsByCategory(category: AgentCategory): AgentDefinition[] {
  return AGENTS.filter(a => a.category === category);
}

export function getLiveAgents(): AgentDefinition[] {
  return AGENTS.filter(a => a.status === 'live');
}

export function getDevAgents(): AgentDefinition[] {
  return AGENTS.filter(a => a.status === 'dev' || a.status === 'beta' || a.status === 'demo');
}

export function getAgentsByPortal(portal: 'woulf' | 'clutch' | 'shared'): AgentDefinition[] {
  return AGENTS.filter(a => a.portal === portal);
}

export function getAgentsBySortOrder(): AgentDefinition[] {
  return [...AGENTS].sort((a, b) => a.sortOrder - b.sortOrder);
}

// Category labels for sidebar grouping
export const CATEGORY_LABELS: Record<AgentCategory, string> = {
  finance: 'Finance & Accounting',
  sales: 'Sales & Marketing',
  operations: 'Operations & Logistics',
  compliance: 'Legal & Compliance',
  people: 'People & Culture',
  portal: 'Portal & Tools',
};

// Category sort order
export const CATEGORY_ORDER: AgentCategory[] = [
  'finance',
  'sales',
  'operations',
  'compliance',
  'people',
  'portal',
];
