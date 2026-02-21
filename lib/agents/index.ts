// ============================================================
// WoulfAI Agent Index — Synced with agent-registry.ts
// Re-exports for backward compatibility + full 14-agent list
// ============================================================
export type AgentStatus = 'live' | 'dev' | 'beta';
export type FeatureStatus = 'done' | 'backlog' | 'debt';

export interface AgentFeature {
  name: string;
  status: FeatureStatus;
}

export interface Agent {
  slug: string;
  name: string;
  description: string;
  icon: string;
  status: AgentStatus;
  completionPct: number;
  category: 'finance' | 'sales' | 'operations' | 'compliance' | 'people';
  liveRoute: string | null;
  demoRoute: string;
  features: AgentFeature[];
  sortOrder: number;
}

export const AGENTS: Agent[] = [
  {
    slug: 'cfo', name: 'CFO Agent', icon: '📈', status: 'live', completionPct: 92,
    description: 'Financial intelligence, invoices, collections, health monitoring, and refinance alerts',
    category: 'finance', liveRoute: '/agents/cfo/console', demoRoute: '/demo/cfo', sortOrder: 1,
    features: [
      { name: 'Invoice CRUD', status: 'done' },
      { name: 'Financial Health Score', status: 'done' },
      { name: 'Cashflow Forecast', status: 'done' },
      { name: 'Refinance Alert', status: 'done' },
      { name: 'Collections 4-Tier', status: 'done' },
    ],
  },
  {
    slug: 'sales', name: 'Sales Agent', icon: '🎯', status: 'live', completionPct: 95,
    description: 'CRM pipeline, behavioral profiles, battle cards, and deal intelligence',
    category: 'sales', liveRoute: '/agents/sales', demoRoute: '/demo/sales', sortOrder: 2,
    features: [
      { name: 'Pipeline Kanban', status: 'done' },
      { name: 'Contact Intel', status: 'done' },
      { name: 'Battle Cards', status: 'done' },
      { name: 'Activity Tracking', status: 'done' },
    ],
  },
  {
    slug: 'finops', name: 'FinOps Agent', icon: '📊', status: 'live', completionPct: 88,
    description: 'AP management, debt tracking, labor analysis, and forecasting',
    category: 'finance', liveRoute: '/agents/cfo/finops', demoRoute: '/demo/finops', sortOrder: 3,
    features: [
      { name: 'AP Dashboard', status: 'done' },
      { name: 'Debt Tracker', status: 'done' },
      { name: 'Labor Analysis', status: 'done' },
    ],
  },
  {
    slug: 'payables', name: 'Payables Agent', icon: '🧾', status: 'live', completionPct: 85,
    description: 'Invoice intake, approval workflows, payment processing',
    category: 'finance', liveRoute: '/agents/cfo/payables', demoRoute: '/demo/payables', sortOrder: 4,
    features: [
      { name: 'Invoice Intake', status: 'done' },
      { name: 'Approval Queue', status: 'done' },
      { name: 'Payment Processing', status: 'done' },
    ],
  },
  {
    slug: 'collections', name: 'Collections Agent', icon: '📞', status: 'live', completionPct: 80,
    description: '4-tier AI collections with behavioral intelligence',
    category: 'finance', liveRoute: '/agents/cfo/console', demoRoute: '/demo/collections', sortOrder: 5,
    features: [
      { name: 'Aging Analysis', status: 'done' },
      { name: 'Auto-Escalation', status: 'done' },
      { name: 'Risk Scoring', status: 'done' },
    ],
  },
  {
    slug: 'org-lead', name: 'Organization Lead', icon: '🏢', status: 'live', completionPct: 95,
    description: 'Command center for org-wide KPIs, team management, and strategic oversight',
    category: 'operations', liveRoute: '/agents/org-lead', demoRoute: '/demo/org-lead', sortOrder: 6,
    features: [
      { name: 'KPI Dashboard', status: 'done' },
      { name: 'Team Overview', status: 'done' },
      { name: 'Strategic Planning', status: 'done' },
      { name: 'Cross-Agent Reports', status: 'done' },
    ],
  },
  {
    slug: 'seo', name: 'SEO Agent', icon: '🔍', status: 'live', completionPct: 95,
    description: 'Search rankings, keyword tracking, technical audits, and content optimization',
    category: 'sales', liveRoute: '/agents/seo', demoRoute: '/demo/seo', sortOrder: 7,
    features: [
      { name: 'Keyword Tracker', status: 'done' },
      { name: 'Technical Audit', status: 'done' },
      { name: 'Content Optimizer', status: 'done' },
    ],
  },
  {
    slug: 'marketing', name: 'Marketing Agent', icon: '📣', status: 'live', completionPct: 95,
    description: 'Campaign management, content calendar, and analytics',
    category: 'sales', liveRoute: '/agents/marketing', demoRoute: '/demo/marketing', sortOrder: 8,
    features: [
      { name: 'Campaign Manager', status: 'done' },
      { name: 'Content Calendar', status: 'done' },
      { name: 'Analytics Dashboard', status: 'done' },
    ],
  },
  {
    slug: 'wms', name: 'WMS Agent', icon: '📦', status: 'live', completionPct: 95,
    description: 'Warehouse inventory, receiving, and shipping management',
    category: 'operations', liveRoute: '/agents/wms', demoRoute: '/demo/wms', sortOrder: 9,
    features: [
      { name: 'Inventory Tracker', status: 'done' },
      { name: 'Receiving Workflow', status: 'done' },
      { name: 'Shipping Manager', status: 'done' },
    ],
  },
  {
    slug: 'hr', name: 'HR Agent', icon: '👥', status: 'live', completionPct: 95,
    description: 'Employee directory, PTO tracking, onboarding, and compliance',
    category: 'people', liveRoute: '/agents/hr', demoRoute: '/demo/hr', sortOrder: 10,
    features: [
      { name: 'Employee Directory', status: 'done' },
      { name: 'PTO Tracking', status: 'done' },
      { name: 'Onboarding Workflow', status: 'done' },
    ],
  },
  {
    slug: 'operations', name: 'Operations Agent', icon: '⚙️', status: 'live', completionPct: 95,
    description: 'Project tracking, crew scheduling, resource management',
    category: 'operations', liveRoute: '/agents/operations', demoRoute: '/demo/operations', sortOrder: 11,
    features: [
      { name: 'Project Tracker', status: 'done' },
      { name: 'Crew Scheduler', status: 'done' },
      { name: 'Resource Manager', status: 'done' },
    ],
  },
  {
    slug: 'legal', name: 'Legal Agent', icon: '⚖️', status: 'live', completionPct: 95,
    description: 'Contract analysis, risk assessment, compliance tracking',
    category: 'compliance', liveRoute: '/agents/legal', demoRoute: '/demo/legal', sortOrder: 12,
    features: [
      { name: 'Contract Analyzer', status: 'done' },
      { name: 'Risk Assessment', status: 'done' },
      { name: 'Compliance Tracker', status: 'done' },
    ],
  },
  {
    slug: 'compliance', name: 'Compliance Agent', icon: '🛡️', status: 'live', completionPct: 95,
    description: 'Regulatory tracking, audit prep, policy management',
    category: 'compliance', liveRoute: '/agents/compliance', demoRoute: '/demo/compliance', sortOrder: 13,
    features: [
      { name: 'Regulatory Tracker', status: 'done' },
      { name: 'Audit Prep', status: 'done' },
      { name: 'Policy Manager', status: 'done' },
    ],
  },
  {
    slug: 'supply-chain', name: 'Supply Chain Agent', icon: '🚛', status: 'live', completionPct: 95,
    description: 'Vendor management, procurement, logistics optimization',
    category: 'operations', liveRoute: '/agents/supply-chain', demoRoute: '/demo/supply-chain', sortOrder: 14,
    features: [
      { name: 'Vendor Manager', status: 'done' },
      { name: 'Procurement', status: 'done' },
      { name: 'Logistics Optimizer', status: 'done' },
    ],
  },
];

export function getAgent(slug: string): Agent | undefined {
  return AGENTS.find(a => a.slug === slug);
}

export function getLiveAgents(): Agent[] {
  return AGENTS.filter(a => a.status === 'live');
}

export function getAgentsByCategory(category: Agent['category']): Agent[] {
  return AGENTS.filter(a => a.category === category && a.status === 'live');
}

export function getDevAgents(): Agent[] {
  return AGENTS.filter(a => a.status === 'dev' || a.status === 'beta');
}
