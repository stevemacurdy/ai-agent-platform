export type IntegrationCategory = 'crm' | 'accounting' | 'erp' | 'communication' | 'storage'

export interface Integration {
  id: string
  name: string
  category: IntegrationCategory
  icon: string
  description: string
  status: 'available' | 'coming_soon' | 'beta'
  plans: string[]  // which plans include it
  configFields?: string[]  // fields needed to connect
}

export const INTEGRATIONS: Integration[] = [
  // ═══════════════════════════════════════
  // CRM (5)
  // ═══════════════════════════════════════
  {
    id: 'salesforce', name: 'Salesforce', category: 'crm', icon: '☁️',
    description: 'Sync contacts, deals, and activities with Salesforce CRM',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['instance_url', 'client_id', 'client_secret', 'refresh_token'],
  },
  {
    id: 'hubspot', name: 'HubSpot', category: 'crm', icon: '🟠',
    description: 'Two-way sync with HubSpot contacts, deals, and pipeline',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['api_key'],
  },
  {
    id: 'zoho-crm', name: 'Zoho CRM', category: 'crm', icon: '🔴',
    description: 'Connect Zoho CRM for lead scoring and deal management',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['client_id', 'client_secret', 'refresh_token', 'org_id'],
  },
  {
    id: 'pipedrive', name: 'Pipedrive', category: 'crm', icon: '🟢',
    description: 'Sync deals, contacts, and activities with Pipedrive',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['api_token', 'company_domain'],
  },
  {
    id: 'zendesk', name: 'Zendesk Sell', category: 'crm', icon: '🟡',
    description: 'Connect Zendesk Sell for support-to-sales pipeline integration',
    status: 'beta', plans: ['enterprise'],
    configFields: ['subdomain', 'api_token', 'email'],
  },

  // ═══════════════════════════════════════
  // ACCOUNTING (10)
  // ═══════════════════════════════════════
  {
    id: 'quickbooks', name: 'QuickBooks Online', category: 'accounting', icon: '📗',
    description: 'Sync invoices, expenses, and reports with QuickBooks Online',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['realm_id', 'client_id', 'client_secret', 'refresh_token'],
  },
  {
    id: 'odoo', name: 'Odoo', category: 'accounting', icon: '🟣',
    description: 'Full ERP integration — accounting, inventory, invoicing, and HR',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['url', 'db', 'api_key', 'username'],
  },
  {
    id: 'xero', name: 'Xero', category: 'accounting', icon: '🔵',
    description: 'Cloud accounting with real-time bank feeds and invoicing',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['client_id', 'client_secret', 'tenant_id'],
  },
  {
    id: 'freshbooks', name: 'FreshBooks', category: 'accounting', icon: '🌿',
    description: 'Invoicing, expenses, and time tracking for service businesses',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['client_id', 'client_secret', 'redirect_uri'],
  },
  {
    id: 'sage', name: 'Sage Intacct', category: 'accounting', icon: '💚',
    description: 'Enterprise-grade financial management and multi-entity consolidation',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['company_id', 'user_id', 'user_password', 'sender_id'],
  },
  {
    id: 'wave', name: 'Wave', category: 'accounting', icon: '🌊',
    description: 'Free accounting, invoicing, and receipt scanning for small businesses',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['business_id', 'access_token'],
  },
  {
    id: 'netsuite', name: 'NetSuite', category: 'accounting', icon: '🏢',
    description: 'Oracle NetSuite ERP — GL, AP, AR, and financial reporting',
    status: 'available', plans: ['enterprise'],
    configFields: ['account_id', 'consumer_key', 'consumer_secret', 'token_id', 'token_secret'],
  },
  {
    id: 'zoho-books', name: 'Zoho Books', category: 'accounting', icon: '📘',
    description: 'End-to-end accounting with inventory and project tracking',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['client_id', 'client_secret', 'organization_id'],
  },
  {
    id: 'myob', name: 'MYOB', category: 'accounting', icon: '🟤',
    description: 'Australian accounting platform for payroll, tax, and banking',
    status: 'coming_soon', plans: ['professional', 'enterprise'],
    configFields: ['api_key', 'company_file_id'],
  },
  {
    id: 'freeagent', name: 'FreeAgent', category: 'accounting', icon: '🏷️',
    description: 'UK-focused accounting for freelancers and small businesses',
    status: 'coming_soon', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['oauth_token', 'oauth_secret'],
  },
]

export function getIntegrationsByCategory(cat: IntegrationCategory) {
  return INTEGRATIONS.filter(i => i.category === cat)
}

export function getIntegrationsForPlan(planId: string) {
  return INTEGRATIONS.filter(i => i.plans.includes(planId))
}
