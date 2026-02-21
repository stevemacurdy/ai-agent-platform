/**
 * Generic KPI data per company for agents that don't have
 * full custom pages yet. When you build out each agent,
 * move its data to tenant-data.ts with a full dataset.
 */
import { getCompanyData } from './tenant-data';

interface GenericAgentKPIs {
  [agentSlug: string]: { label: string; value: string }[];
}

const WOULF_KPIS: GenericAgentKPIs = {
  'seo': [{ label: 'Keywords Tracked', value: '847' }, { label: 'Page 1 Rankings', value: '23' }, { label: 'Organic Traffic', value: '12.4K/mo' }, { label: 'Domain Authority', value: '34' }],
  'marketing': [{ label: 'Active Campaigns', value: '4' }, { label: 'Monthly Reach', value: '45K' }, { label: 'Leads Generated', value: '89' }, { label: 'Cost/Lead', value: '$12.40' }],
  'wms': [{ label: 'Total SKUs', value: '1,247' }, { label: 'Order Accuracy', value: '99.2%' }, { label: 'Pick Rate', value: '142/hr' }, { label: 'Dock Doors Active', value: '6/8' }],
  'compliance': [{ label: 'Policies Active', value: '18' }, { label: 'Audits Due', value: '2' }, { label: 'Violations', value: '0' }, { label: 'Score', value: '97/100' }],
  'legal': [{ label: 'Active Contracts', value: '23' }, { label: 'Pending Review', value: '4' }, { label: 'Risk Score', value: 'Low' }, { label: 'Compliance', value: '98%' }],
  'supply-chain': [{ label: 'Active Vendors', value: '42' }, { label: 'Pending Orders', value: '7' }, { label: 'Avg Lead Time', value: '6.2 days' }, { label: 'Cost Savings', value: '$12.4K' }],
  'org-lead': [{ label: 'Team Size', value: '32' }, { label: 'Departments', value: '5' }, { label: 'Open Requests', value: '7' }, { label: 'Satisfaction', value: '4.2/5' }],
};

const CLUTCH_KPIS: GenericAgentKPIs = {
  'seo': [{ label: 'Keywords Tracked', value: '312' }, { label: 'Page 1 Rankings', value: '8' }, { label: 'Organic Traffic', value: '3.2K/mo' }, { label: 'Domain Authority', value: '19' }],
  'marketing': [{ label: 'Active Campaigns', value: '2' }, { label: 'Monthly Reach', value: '12K' }, { label: 'Leads Generated', value: '34' }, { label: 'Cost/Lead', value: '$18.90' }],
  'wms': [{ label: 'Total SKUs', value: '3,842' }, { label: 'Order Accuracy', value: '98.7%' }, { label: 'Pick Rate', value: '98/hr' }, { label: 'Dock Doors Active', value: '4/6' }],
  'compliance': [{ label: 'Policies Active', value: '12' }, { label: 'Audits Due', value: '1' }, { label: 'Violations', value: '0' }, { label: 'Score', value: '91/100' }],
  'legal': [{ label: 'Active Contracts', value: '9' }, { label: 'Pending Review', value: '2' }, { label: 'Risk Score', value: 'Low' }, { label: 'Compliance', value: '95%' }],
  'supply-chain': [{ label: 'Active Vendors', value: '18' }, { label: 'Pending Orders', value: '3' }, { label: 'Avg Lead Time', value: '8.1 days' }, { label: 'Cost Savings', value: '$4.2K' }],
  'org-lead': [{ label: 'Team Size', value: '18' }, { label: 'Departments', value: '3' }, { label: 'Open Requests', value: '4' }, { label: 'Satisfaction', value: '3.8/5' }],
};

const WOULFAI_KPIS: GenericAgentKPIs = {
  'seo': [{ label: 'Keywords Tracked', value: '2,100' }, { label: 'Page 1 Rankings', value: '41' }, { label: 'Organic Traffic', value: '28K/mo' }, { label: 'Domain Authority', value: '42' }],
  'marketing': [{ label: 'Active Campaigns', value: '6' }, { label: 'Monthly Reach', value: '120K' }, { label: 'Leads Generated', value: '245' }, { label: 'Cost/Lead', value: '$8.20' }],
  'wms': [{ label: 'Total SKUs', value: '0' }, { label: 'Order Accuracy', value: 'N/A' }, { label: 'Pick Rate', value: 'N/A' }, { label: 'Dock Doors Active', value: 'N/A' }],
  'compliance': [{ label: 'Policies Active', value: '8' }, { label: 'Audits Due', value: '0' }, { label: 'Violations', value: '0' }, { label: 'Score', value: '100/100' }],
  'legal': [{ label: 'Active Contracts', value: '4' }, { label: 'Pending Review', value: '1' }, { label: 'Risk Score', value: 'Low' }, { label: 'Compliance', value: '100%' }],
  'supply-chain': [{ label: 'Active Vendors', value: '8' }, { label: 'Pending Orders', value: '2' }, { label: 'Avg Lead Time', value: '3.1 days' }, { label: 'Cost Savings', value: '$1.8K' }],
  'org-lead': [{ label: 'Team Size', value: '6' }, { label: 'Departments', value: '3' }, { label: 'Open Requests', value: '12' }, { label: 'Satisfaction', value: '4.5/5' }],
};

export function getAgentKPIs(companyName: string | undefined, agentSlug: string): { label: string; value: string }[] {
  if (!companyName || companyName === 'Woulf Group') return WOULF_KPIS[agentSlug] || [];
  if (companyName === 'Clutch 3PL') return CLUTCH_KPIS[agentSlug] || [];
  if (companyName === 'WoulfAI') return WOULFAI_KPIS[agentSlug] || [];
  return WOULF_KPIS[agentSlug] || [];
}
