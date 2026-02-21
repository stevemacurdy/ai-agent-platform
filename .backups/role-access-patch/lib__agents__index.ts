// Central registry for all 11 WoulfAI agents
// This is the SINGLE SOURCE OF TRUTH — landing page, demo, admin all read from here

export type AgentStatus = 'live' | 'dev' | 'beta'
export type FeatureStatus = 'done' | 'backlog' | 'debt'

export interface AgentFeature {
  name: string
  status: FeatureStatus
}

export interface Agent {
  slug: string
  name: string
  description: string
  icon: string
  status: AgentStatus
  completionPct: number
  category: 'finance' | 'sales' | 'operations' | 'compliance' | 'people'
  liveRoute: string | null
  demoRoute: string
  features: AgentFeature[]
  sortOrder: number
}

export const AGENTS: Agent[] = [
  {
    slug: 'cfo', name: 'CFO Agent', icon: '📈', status: 'live', completionPct: 92,
    description: 'Financial intelligence, invoices, collections, health monitoring, and refinance alerts',
    category: 'finance', liveRoute: '/agents/cfo/console', demoRoute: '/demo/cfo', sortOrder: 1,
    features: [
      { name: 'Invoice CRUD + Line Item Editing', status: 'done' },
      { name: 'Audit Log with Odoo Write-back', status: 'done' },
      { name: 'AI Collections (4-tier strategy)', status: 'done' },
      { name: 'Financial Health Score', status: 'done' },
      { name: '90-Day Cashflow Forecast', status: 'done' },
      { name: 'Refinance Alert Monitor', status: 'done' },
      { name: 'PDF Invoice Export', status: 'backlog' },
      { name: 'Plaid Live Bank Feed', status: 'backlog' },
    ]
  },
  {
    slug: 'sales', name: 'Sales Agent', icon: '💼', status: 'live', completionPct: 90,
    description: 'CRM pipeline, behavioral profiling, battle cards, and deal intelligence',
    category: 'sales', liveRoute: '/admin/sales-reps', demoRoute: '/demo/sales', sortOrder: 2,
    features: [
      { name: 'Sales Rep Management', status: 'done' },
      { name: 'CRM Pipeline + Contacts', status: 'done' },
      { name: 'Behavioral Profiling (4 personas)', status: 'done' },
      { name: 'DO/DONT Battle Cards', status: 'done' },
      { name: 'Reality Potential Score', status: 'done' },
      { name: 'Multi-CRM Sync (HubSpot/SF/NetSuite)', status: 'done' },
      { name: 'AI Meeting Prep Generator', status: 'backlog' },
      { name: 'Deal Probability Forecasting', status: 'backlog' },
    ]
  },
  {
    slug: 'finops', name: 'FinOps Agent', icon: '💰', status: 'live', completionPct: 88,
    description: 'AP engine, debt management, labor tracking, forecasting, and business sandbox',
    category: 'finance', liveRoute: '/agents/cfo/finops', demoRoute: '/demo/finops', sortOrder: 3,
    features: [
      { name: 'AP Engine (19 categories)', status: 'done' },
      { name: 'Cash/Accrual Toggle', status: 'done' },
      { name: 'Debt + Equipment Ledger', status: 'done' },
      { name: 'Labor Tracking', status: 'done' },
      { name: '30/60/90 + 12/24mo Forecast', status: 'done' },
      { name: 'Business Idea Sandbox', status: 'done' },
      { name: 'Tax Reserve Automation', status: 'done' },
      { name: 'Vendor Scoring + Early Pay', status: 'done' },
      { name: 'Lending Packet Assembly', status: 'done' },
      { name: 'Anomaly Detection', status: 'done' },
      { name: 'PDF Lending Packet Export', status: 'backlog' },
    ]
  },
  {
    slug: 'payables', name: 'Payables Agent', icon: '🧾', status: 'live', completionPct: 85,
    description: 'Invoice capture, OCR extraction, payment execution, and bank reconciliation',
    category: 'finance', liveRoute: '/agents/cfo/payables', demoRoute: '/demo/payables', sortOrder: 4,
    features: [
      { name: 'Invoice Capture + OCR', status: 'done' },
      { name: 'Pending Review Queue', status: 'done' },
      { name: 'Payment Execution (4 methods)', status: 'done' },
      { name: 'Bank Reconciliation', status: 'done' },
      { name: 'Auto-Match Engine', status: 'done' },
      { name: 'Mobile Camera Capture', status: 'done' },
      { name: 'AI-Powered OCR (OpenAI)', status: 'debt' },
    ]
  },
  {
    slug: 'collections', name: 'Collections Agent', icon: '📬', status: 'live', completionPct: 80,
    description: 'AI-driven collection strategies with vendor reliability adjustment',
    category: 'finance', liveRoute: '/agents/cfo/console', demoRoute: '/demo/collections', sortOrder: 5,
    features: [
      { name: '4-Tier Strategy Engine', status: 'done' },
      { name: 'Vendor Reliability Weighting', status: 'done' },
      { name: 'Email Template Generator', status: 'done' },
      { name: 'Early-Pay Discount Logic', status: 'done' },
      { name: 'Auto-Send Integration', status: 'backlog' },
      { name: 'Payment Plan Builder', status: 'backlog' },
    ]
  },
  {
    slug: 'hr', name: 'HR Agent', icon: '👥', status: 'dev', completionPct: 25,
    description: 'Employee onboarding, PTO tracking, performance reviews, and compliance',
    category: 'people', liveRoute: null, demoRoute: '/demo/hr', sortOrder: 6,
    features: [
      { name: 'Employee Directory', status: 'done' },
      { name: 'Onboarding Checklists', status: 'backlog' },
      { name: 'PTO Calendar + Approvals', status: 'backlog' },
      { name: 'Performance Review Cycles', status: 'backlog' },
      { name: 'Benefits Administration', status: 'backlog' },
    ]
  },
  {
    slug: 'operations', name: 'Operations Agent', icon: '⚙️', status: 'dev', completionPct: 30,
    description: 'Warehouse automation, equipment scheduling, and logistics optimization',
    category: 'operations', liveRoute: null, demoRoute: '/demo/operations', sortOrder: 7,
    features: [
      { name: 'Equipment Ledger', status: 'done' },
      { name: 'Project Allocation', status: 'done' },
      { name: 'WMS Integration', status: 'backlog' },
      { name: 'Route Optimization', status: 'backlog' },
      { name: 'Preventive Maintenance', status: 'backlog' },
    ]
  },
  {
    slug: 'legal', name: 'Legal Agent', icon: '⚖️', status: 'dev', completionPct: 20,
    description: 'Contract analysis, clause extraction, and compliance monitoring',
    category: 'compliance', liveRoute: null, demoRoute: '/demo/legal', sortOrder: 8,
    features: [
      { name: 'Contract Scanning (Trump Rule)', status: 'done' },
      { name: 'Payment Term Extraction', status: 'done' },
      { name: 'Auto-Clause Library', status: 'backlog' },
      { name: 'Risk Scoring', status: 'backlog' },
      { name: 'Compliance Calendar', status: 'backlog' },
    ]
  },
  {
    slug: 'marketing', name: 'Marketing Agent', icon: '📣', status: 'dev', completionPct: 15,
    description: 'Campaign management, content strategy, and marketing analytics',
    category: 'sales', liveRoute: null, demoRoute: '/demo/marketing', sortOrder: 9,
    features: [
      { name: 'Campaign Planner', status: 'backlog' },
      { name: 'Content Calendar', status: 'backlog' },
      { name: 'Email Builder', status: 'backlog' },
      { name: 'Analytics Dashboard', status: 'backlog' },
    ]
  },
  {
    slug: 'wms', name: 'WMS Agent', icon: '🏭', status: 'dev', completionPct: 10,
    description: 'Warehouse management, inventory control, and pick/pack/ship operations',
    category: 'operations', liveRoute: null, demoRoute: '/demo/wms', sortOrder: 10,
    features: [
      { name: 'Inventory Management', status: 'backlog' },
      { name: 'Inbound ASN Processing', status: 'backlog' },
      { name: 'Pick/Pack/Ship', status: 'backlog' },
      { name: 'Zone Configuration', status: 'backlog' },
    ]
  },
  {
    slug: 'compliance', name: 'Compliance Agent', icon: '🛡️', status: 'dev', completionPct: 10,
    description: 'Regulatory monitoring, audit preparation, and policy enforcement',
    category: 'compliance', liveRoute: null, demoRoute: '/demo/compliance', sortOrder: 11,
    features: [
      { name: 'Audit Trail Viewer', status: 'backlog' },
      { name: 'Policy Library', status: 'backlog' },
      { name: 'Regulatory Calendar', status: 'backlog' },
      { name: 'Risk Assessment', status: 'backlog' },
    ]
  },
]

export function getAgent(slug: string): Agent | undefined {
  return AGENTS.find(a => a.slug === slug)
}

export function getLiveAgents(): Agent[] {
  return AGENTS.filter(a => a.status === 'live')
}

export function getDevAgents(): Agent[] {
  return AGENTS.filter(a => a.status !== 'live')
}
