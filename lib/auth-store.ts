// ============================================================================
// AUTH TYPES & ROLE CONFIG — Shared type definitions
// ============================================================================
// NOTE: Authentication is handled entirely by Supabase Auth.
// This file only provides shared type definitions and role configuration.
// The in-memory user store and plaintext auth were removed 2026-02-24 (security).
// ============================================================================

export type UserRole = 'super_admin' | 'admin' | 'company_admin' | 'employee' | 'beta_tester' | 'org_lead'

export const ALL_AGENTS = [
  { id: 'cfo', name: 'CFO Agent', icon: '📈', description: 'Financial intelligence, forecasting, and P&L analysis' },
  { id: 'sales', name: 'Sales Agent', icon: '💼', description: 'Pipeline management, CRM, and deal intelligence' },
  { id: 'finops', name: 'FinOps Agent', icon: '💰', description: 'Cost optimization and cloud spend management' },
  { id: 'payables', name: 'Payables Agent', icon: '🧾', description: 'Invoice processing and AP automation' },
  { id: 'collections', name: 'Collections Agent', icon: '📬', description: 'AR tracking and payment follow-ups' },
  { id: 'hr', name: 'HR Agent', icon: '👥', description: 'People operations and workforce management' },
  { id: 'operations', name: 'Operations Agent', icon: '⚙️', description: 'Project tracking and operational workflows' },
  { id: 'legal', name: 'Legal Agent', icon: '⚖️', description: 'Contract review and compliance monitoring' },
  { id: 'marketing', name: 'Marketing Agent', icon: '📣', description: 'Campaign management and market intelligence' },
  { id: 'wms', name: 'WMS Agent', icon: '🏭', description: 'Warehouse management and inventory control' },
  { id: 'compliance', name: 'Compliance Agent', icon: '🛡️', description: 'Regulatory compliance and risk assessment' },
]

export const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; description: string; tier: number; icon: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-rose-400', bg: 'bg-rose-500/10', description: 'Full platform access, billing, user management', tier: 5, icon: '🔑' },
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10', description: 'Manage users, analytics, all agents', tier: 4, icon: '⚡' },
  company_admin: { label: 'Company Admin', color: 'text-cyan-400', bg: 'bg-cyan-500/10', description: 'Manage company members and agent access', tier: 3, icon: '🏗️' },
  employee: { label: 'Employee', color: 'text-blue-400', bg: 'bg-blue-500/10', description: 'Live agents scoped to company data', tier: 3, icon: '🏢' },
  org_lead: { label: 'Organization Lead', color: 'text-amber-400', bg: 'bg-amber-500/10', description: 'Your custom AI intelligence suite', tier: 2, icon: '👑' },
  beta_tester: { label: 'Beta Tester', color: 'text-emerald-400', bg: 'bg-emerald-500/10', description: 'Free trial — full live agent access', tier: 1, icon: '🧪' },
}
