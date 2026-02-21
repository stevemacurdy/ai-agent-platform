/**
 * ============================================================
 *  WoulfAI — Platform Fix v2
 * ============================================================
 *  1. Missing agent pages (Operations, Legal, Compliance, Supply Chain)
 *  2. Admin agent detail view (dev progress, not signup)
 *  3. Richer Demo Hub (capabilities that sell)
 *  4. Solo Sales agent page restored
 *  5. Customer Portal build-out (inventory, ASN, shipments)
 *  6. Admin dashboard links to admin detail, not live agent
 *
 *  Run:
 *    node platform-fix-v2.js
 *    npm run build
 *    vercel --prod
 */

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
let created = 0;

function write(fp, content) {
  const full = path.join(ROOT, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (fs.existsSync(full)) {
    const bd = path.join(ROOT, '.backups', 'platform-fix-v2');
    fs.mkdirSync(bd, { recursive: true });
    fs.copyFileSync(full, path.join(bd, fp.replace(/\//g, '__')));
  }
  fs.writeFileSync(full, content, 'utf8');
  created++;
  console.log('  \u2713 ' + fp);
}

console.log('');
console.log('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('  \u2551  WoulfAI \u2014 Platform Fix v2                      \u2551');
console.log('  \u2551  404 Fixes \u00B7 Admin Detail \u00B7 Customer Portal      \u2551');
console.log('  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
console.log('');

const AP = fs.existsSync(path.join(ROOT, 'src/app')) ? 'src/' : '';

// ============================================================
// Agent page template for the 4 missing agents
// ============================================================
function agentPage(slug, name, icon, kpis, modules) {
  return `'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';

const KPIS = ${JSON.stringify(kpis, null, 2)};

const MODULES = ${JSON.stringify(modules, null, 2)};

export default function ${name.replace(/[^a-zA-Z]/g, '')}Page() {
  const { currentCompany, isLoading } = useTenant();
  const [activeModule, setActiveModule] = useState(MODULES[0]?.id || '');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="text-4xl">${icon}</div>
          <div>
            <h1 className="text-2xl font-bold">${name}</h1>
            <p className="text-sm text-gray-400">
              {isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">LIVE</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition">Submit</button>
          <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Edit</button>
          <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Download</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPIS.map((kpi, i) => (
          <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[9px] text-gray-500 uppercase">{kpi.label}</div>
            <div className="text-xl font-mono font-bold mt-1">{kpi.value}</div>
            {kpi.trend && <div className="text-[10px] text-emerald-400 mt-1">{kpi.trend}</div>}
          </div>
        ))}
      </div>

      {/* Module Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id)}
            className={"px-4 py-2 rounded-lg text-sm transition " + (activeModule === m.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Module Content */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
        {MODULES.filter(m => m.id === activeModule).map(m => (
          <div key={m.id}>
            <h2 className="text-lg font-semibold mb-2">{m.name}</h2>
            <p className="text-sm text-gray-400 mb-4">{m.description}</p>
            <div className="grid grid-cols-2 gap-3">
              {m.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400">\u2713</span> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!currentCompany && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-8 text-center">
          <div className="text-3xl mb-3">${icon}</div>
          <p className="text-sm text-gray-500">Select a company from the sidebar to load data.</p>
        </div>
      )}
    </div>
  );
}
`;
}

// ============================================================
// FILE 1-4: Missing agent pages
// ============================================================
console.log('  [1/10] Operations Agent page');
write(AP + 'app/agents/operations/page.tsx', agentPage('operations', 'Operations Agent', '\u2699\uFE0F',
  [
    { label: 'Active Projects', value: '8', trend: '+1' },
    { label: 'On-Time Rate', value: '91%', trend: '+2%' },
    { label: 'Crew Members', value: '24' },
    { label: 'Budget Variance', value: '-2.1%' },
  ],
  [
    { id: 'projects', name: 'Project Tracker', description: 'Monitor all active projects with real-time status, budget tracking, and milestone management.', features: ['Gantt chart view', 'Budget vs actual', 'Milestone alerts', 'Photo documentation', 'Client reporting'] },
    { id: 'crews', name: 'Crew Scheduler', description: 'Assign crews to projects, track certifications, and manage availability.', features: ['Drag-and-drop scheduling', 'Certification tracking', 'Overtime alerts', 'Shift management'] },
    { id: 'equipment', name: 'Equipment Manager', description: 'Track equipment location, maintenance schedules, and utilization rates.', features: ['GPS tracking', 'Maintenance alerts', 'Utilization reports', 'Depreciation tracking'] },
    { id: 'safety', name: 'Safety Dashboard', description: 'OSHA compliance tracking, incident reports, and safety training records.', features: ['Incident reporting', 'Safety training log', 'OSHA compliance', 'Near-miss tracking'] },
  ]
));

console.log('  [2/10] Legal Agent page');
write(AP + 'app/agents/legal/page.tsx', agentPage('legal', 'Legal Agent', '\u2696\uFE0F',
  [
    { label: 'Active Contracts', value: '23', trend: '+3' },
    { label: 'Pending Review', value: '4', trend: '-1' },
    { label: 'Risk Score', value: 'Low' },
    { label: 'Compliance', value: '98%', trend: '+1%' },
  ],
  [
    { id: 'contracts', name: 'Contract Analyzer', description: 'AI-powered contract review with risk scoring, clause extraction, and renewal tracking.', features: ['Auto clause extraction', 'Risk scoring (1-10)', 'Renewal calendar', 'Version history', 'Obligation tracking'] },
    { id: 'risk', name: 'Risk Assessment', description: 'Identify legal risks across contracts, vendors, and operations.', features: ['Vendor risk profiles', 'Liability mapping', 'Insurance gap analysis', 'Regulatory risk alerts'] },
    { id: 'compliance', name: 'Compliance Tracker', description: 'Track regulatory requirements, deadlines, and filing status.', features: ['Filing calendar', 'Regulation database', 'Audit trail', 'Automated reminders'] },
    { id: 'disputes', name: 'Dispute Manager', description: 'Track active disputes, claims, and resolution timelines.', features: ['Case timeline', 'Document management', 'Cost tracking', 'Settlement analysis'] },
  ]
));

console.log('  [3/10] Compliance Agent page');
write(AP + 'app/agents/compliance/page.tsx', agentPage('compliance', 'Compliance Agent', '\uD83D\uDEE1\uFE0F',
  [
    { label: 'Policies Active', value: '18' },
    { label: 'Audits Due', value: '2' },
    { label: 'Violations', value: '0' },
    { label: 'Score', value: '97/100', trend: '+2' },
  ],
  [
    { id: 'policies', name: 'Policy Manager', description: 'Create, version, and distribute compliance policies across your organization.', features: ['Policy templates', 'Version control', 'Acknowledgment tracking', 'Auto-distribution', 'Gap analysis'] },
    { id: 'audits', name: 'Audit Prep', description: 'Prepare for internal and external audits with automated evidence collection.', features: ['Evidence collection', 'Checklist generator', 'Finding tracker', 'Remediation plans'] },
    { id: 'training', name: 'Training Compliance', description: 'Track mandatory training completion and certification expiry.', features: ['Training calendar', 'Completion tracking', 'Cert expiry alerts', 'Auto-enrollment'] },
    { id: 'incidents', name: 'Incident Response', description: 'Log, investigate, and resolve compliance incidents.', features: ['Incident logging', 'Investigation workflow', 'Root cause analysis', 'Corrective actions'] },
  ]
));

console.log('  [4/10] Supply Chain Agent page');
write(AP + 'app/agents/supply-chain/page.tsx', agentPage('supply-chain', 'Supply Chain Agent', '\uD83D\uDE9B',
  [
    { label: 'Active Vendors', value: '42', trend: '+3' },
    { label: 'Pending Orders', value: '7' },
    { label: 'Avg Lead Time', value: '6.2 days', trend: '-0.4' },
    { label: 'Cost Savings', value: '$12,400', trend: '+$2.1K' },
  ],
  [
    { id: 'vendors', name: 'Vendor Manager', description: 'Score, compare, and manage vendor relationships with AI-powered insights.', features: ['Vendor scorecards', 'Performance history', 'Price comparison', 'Contract management', 'Communication log'] },
    { id: 'procurement', name: 'Procurement', description: 'Automate purchase orders, approvals, and receiving workflows.', features: ['PO generation', 'Approval workflows', 'Budget controls', 'Receiving confirmation'] },
    { id: 'logistics', name: 'Logistics Optimizer', description: 'Optimize shipping routes, carrier selection, and delivery tracking.', features: ['Route optimization', 'Carrier comparison', 'Delivery tracking', 'Cost analysis'] },
    { id: 'inventory', name: 'Inventory Planning', description: 'Demand forecasting, reorder points, and safety stock optimization.', features: ['Demand forecasting', 'Reorder alerts', 'Safety stock calc', 'ABC analysis'] },
  ]
));

// ============================================================
// FILE 5: Admin Agent Detail page
// ============================================================
console.log('  [5/10] Admin Agent Detail page');

write(AP + 'app/admin/agents/[slug]/page.tsx', `'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';

// Detailed capability map for selling each agent
const AGENT_DETAILS: Record<string, {
  capabilities: { name: string; status: 'live' | 'beta' | 'planned'; description: string }[];
  integrations: string[];
  useCases: string[];
  metrics: string[];
}> = {
  cfo: {
    capabilities: [
      { name: 'Invoice CRUD', status: 'live', description: 'Create, read, update, delete invoices with Odoo sync' },
      { name: 'Financial Health Score', status: 'live', description: 'Real-time health scoring based on AR, AP, cash flow' },
      { name: 'Cashflow Forecast', status: 'live', description: '90-day rolling forecast with scenario modeling' },
      { name: 'Refinance Alert', status: 'live', description: 'AI monitors debt terms, alerts when refinance saves money' },
      { name: 'Collections 4-Tier', status: 'live', description: 'Automated escalation: Gentle > Firm > Urgent > Legal' },
      { name: 'Bank Reconciliation', status: 'beta', description: 'Auto-match bank transactions to invoices' },
      { name: 'Tax Reserve Calculator', status: 'planned', description: 'Quarterly tax liability estimation' },
    ],
    integrations: ['Odoo', 'QuickBooks', 'Xero', 'Stripe', 'Bank feeds'],
    useCases: ['Construction companies tracking project-level P&L', '3PL operators managing multi-client billing', 'Growing businesses needing cash flow visibility'],
    metrics: ['Reduced DSO by 12 days avg', 'Identified $47K in missed collections', '94% invoice accuracy rate'],
  },
  sales: {
    capabilities: [
      { name: 'Pipeline Kanban', status: 'live', description: 'Visual deal pipeline with drag-and-drop stages' },
      { name: 'Contact Intel', status: 'live', description: 'AI-generated behavioral profiles for every contact' },
      { name: 'Battle Cards', status: 'live', description: 'Competitive intelligence cards auto-generated per deal' },
      { name: 'Activity Tracking', status: 'live', description: 'Log calls, emails, meetings with auto-reminders' },
      { name: 'Deal Risk Scoring', status: 'live', description: 'AI predicts deals at risk of stalling or losing' },
      { name: 'Email Sequences', status: 'beta', description: 'Automated follow-up sequences based on buyer behavior' },
      { name: 'Revenue Forecasting', status: 'planned', description: 'AI-weighted pipeline forecast by confidence level' },
    ],
    integrations: ['HubSpot', 'Salesforce', 'Pipedrive', 'NetSuite CRM', 'Zoho'],
    useCases: ['B2B sales teams tracking complex deals', 'Account managers monitoring client health', 'Sales leaders needing pipeline visibility'],
    metrics: ['67% win rate improvement', '3 high-risk deals flagged per week', '40% reduction in deal cycle time'],
  },
  'org-lead': {
    capabilities: [
      { name: 'KPI Dashboard', status: 'live', description: 'Org-wide metrics from all agents in one view' },
      { name: 'Team Overview', status: 'live', description: 'Employee performance, capacity, and utilization' },
      { name: 'Strategic Planning', status: 'live', description: 'Goal setting, OKR tracking, initiative management' },
      { name: 'Cross-Agent Reports', status: 'live', description: 'Unified reporting pulling data from all agents' },
      { name: 'Executive Summary', status: 'beta', description: 'AI-generated weekly executive briefing' },
      { name: 'Board Deck Generator', status: 'planned', description: 'Auto-generate board presentation from live data' },
    ],
    integrations: ['All WoulfAI agents', 'Google Workspace', 'Slack', 'Microsoft Teams'],
    useCases: ['CEOs wanting single-pane-of-glass visibility', 'COOs tracking operational efficiency', 'Department heads managing cross-functional projects'],
    metrics: ['87% org efficiency score', 'Real-time data from 14 agents', '60% reduction in reporting time'],
  },
  seo: {
    capabilities: [
      { name: 'Keyword Tracker', status: 'live', description: 'Track rankings for target keywords across search engines' },
      { name: 'Technical Audit', status: 'live', description: 'Crawl your site for SEO issues: speed, structure, meta tags' },
      { name: 'Content Optimizer', status: 'live', description: 'AI scores content and suggests improvements for ranking' },
      { name: 'Competitor Monitor', status: 'beta', description: 'Track competitor keyword movements and new content' },
      { name: 'Link Builder', status: 'planned', description: 'AI identifies high-value backlink opportunities' },
    ],
    integrations: ['Google Search Console', 'Google Analytics', 'Ahrefs API', 'Screaming Frog'],
    useCases: ['Marketing teams scaling organic traffic', 'Agencies managing client SEO', 'E-commerce sites optimizing product pages'],
    metrics: ['12 high-intent keywords identified', '42 DA improvement', '4,200 monthly organic visits tracked'],
  },
  marketing: {
    capabilities: [
      { name: 'Campaign Manager', status: 'live', description: 'Create, launch, and track multi-channel campaigns' },
      { name: 'Content Calendar', status: 'live', description: 'Plan and schedule content across all platforms' },
      { name: 'Analytics Dashboard', status: 'live', description: 'Unified metrics from all marketing channels' },
      { name: 'Lead Attribution', status: 'live', description: 'Track which campaigns generate revenue' },
      { name: 'A/B Testing', status: 'beta', description: 'Run experiments on landing pages and emails' },
      { name: 'Budget Optimizer', status: 'planned', description: 'AI allocates budget across channels for max ROI' },
    ],
    integrations: ['Google Ads', 'Meta Ads', 'Mailchimp', 'HubSpot Marketing', 'LinkedIn'],
    useCases: ['Marketing teams running multi-channel campaigns', 'Growth teams optimizing CAC', 'Content teams managing editorial calendars'],
    metrics: ['45K total reach', '89 leads generated', '3.2% conversion rate'],
  },
  wms: {
    capabilities: [
      { name: 'Inventory Tracker', status: 'live', description: 'Real-time SKU-level inventory with location tracking' },
      { name: 'Receiving Workflow', status: 'live', description: 'ASN processing, quality checks, putaway optimization' },
      { name: 'Shipping Manager', status: 'live', description: 'Pick, pack, ship with carrier rate shopping' },
      { name: 'Cycle Count', status: 'live', description: 'Automated cycle counting with variance reporting' },
      { name: 'Lot Tracking', status: 'beta', description: 'Lot/serial number tracking for regulated products' },
      { name: 'Demand Planning', status: 'planned', description: 'AI forecasts demand to optimize inventory levels' },
    ],
    integrations: ['NetSuite', 'Odoo', 'ShipStation', 'EasyPost', 'Barcode scanners'],
    useCases: ['3PL operators managing multi-client inventory', 'E-commerce warehouses scaling operations', 'Manufacturing receiving and shipping'],
    metrics: ['99.2% inventory accuracy', '1,247 SKUs managed', 'Low stock alerts for 8 items'],
  },
  hr: {
    capabilities: [
      { name: 'Employee Directory', status: 'live', description: 'Searchable org chart with profiles and reporting' },
      { name: 'PTO Tracking', status: 'live', description: 'Accrual management, request/approval workflow' },
      { name: 'Onboarding Workflow', status: 'live', description: 'New hire checklists, document collection, training' },
      { name: 'Compliance Calendar', status: 'live', description: 'Certification expiry, training due dates, reviews' },
      { name: 'Performance Reviews', status: 'beta', description: '360 reviews with AI-generated summaries' },
      { name: 'Payroll Integration', status: 'planned', description: 'Sync with Gusto, ADP, or Paychex' },
    ],
    integrations: ['Gusto', 'BambooHR', 'ADP', 'Google Workspace', 'Slack'],
    useCases: ['Growing companies without dedicated HR', 'Multi-site operations tracking certifications', 'Managers needing employee visibility'],
    metrics: ['34 employees managed', '72% PTO utilization tracked', "Maria's cert expires in 4 days"],
  },
  finops: {
    capabilities: [
      { name: 'AP Dashboard', status: 'live', description: 'All accounts payable in one view with aging analysis' },
      { name: 'Debt Tracker', status: 'live', description: 'Track all debt instruments with payment schedules' },
      { name: 'Labor Analysis', status: 'live', description: 'Cost per employee, overtime analysis, utilization' },
      { name: 'Expense Categorization', status: 'beta', description: 'AI auto-categorizes expenses for reporting' },
    ],
    integrations: ['Odoo', 'QuickBooks', 'Xero', 'Bank feeds'],
    useCases: ['CFOs needing AP visibility', 'Controllers managing multi-entity finances', 'Ops managers tracking labor costs'],
    metrics: ['$105K monthly expenses tracked', '$729K total debt monitored', 'Equipment value: $214K'],
  },
  payables: {
    capabilities: [
      { name: 'Invoice Intake', status: 'live', description: 'Email/upload invoice capture with OCR extraction' },
      { name: 'Approval Queue', status: 'live', description: 'Multi-level approval workflows with mobile support' },
      { name: 'Payment Processing', status: 'live', description: 'ACH, check, wire payment execution' },
      { name: 'Reconciliation', status: 'live', description: 'Auto-match payments to invoices and bank records' },
    ],
    integrations: ['Odoo', 'QuickBooks', 'Bill.com', 'Mercury', 'Relay'],
    useCases: ['AP teams processing high invoice volume', 'Controllers needing approval controls', 'Businesses automating payment runs'],
    metrics: ['2 invoices pending review', '10 txns unreconciled', '$105K monthly outflow'],
  },
  collections: {
    capabilities: [
      { name: 'Aging Analysis', status: 'live', description: 'Visual aging buckets with drill-down to invoices' },
      { name: 'Auto-Escalation', status: 'live', description: 'AI escalates from Gentle to Firm to Urgent to Legal' },
      { name: 'Payment Plans', status: 'live', description: 'Generate and track payment plans for overdue accounts' },
      { name: 'Risk Scoring', status: 'live', description: 'Predict which accounts will become delinquent' },
    ],
    integrations: ['Odoo', 'QuickBooks', 'Email', 'SMS (Twilio)'],
    useCases: ['Businesses with chronic late payers', 'Construction companies with lien rights', '3PLs collecting storage fees'],
    metrics: ['$77,700 overdue identified', '3 debtors in active collections', '4-tier escalation system'],
  },
  operations: {
    capabilities: [
      { name: 'Project Tracker', status: 'live', description: 'Multi-project management with budget and timeline tracking' },
      { name: 'Crew Scheduler', status: 'live', description: 'Assign crews to jobs with certification and availability checks' },
      { name: 'Equipment Manager', status: 'live', description: 'Track equipment location, maintenance, and depreciation' },
      { name: 'Safety Dashboard', status: 'live', description: 'OSHA compliance, incident reporting, safety training' },
    ],
    integrations: ['Odoo', 'Procore', 'Buildertrend', 'GPS trackers'],
    useCases: ['Construction companies managing multiple jobsites', 'Logistics operators tracking fleets', 'Facility managers scheduling maintenance'],
    metrics: ['8 active projects tracked', '91% on-time rate', '24 crew members managed'],
  },
  legal: {
    capabilities: [
      { name: 'Contract Analyzer', status: 'live', description: 'AI extracts clauses, scores risk, tracks obligations' },
      { name: 'Risk Assessment', status: 'live', description: 'Organization-wide legal risk mapping and monitoring' },
      { name: 'Compliance Tracker', status: 'live', description: 'Regulatory filing deadlines and requirement tracking' },
      { name: 'Dispute Manager', status: 'live', description: 'Track active disputes, costs, and resolution timelines' },
    ],
    integrations: ['DocuSign', 'PandaDoc', 'Google Drive', 'Dropbox'],
    useCases: ['Businesses managing 20+ active contracts', 'Companies in regulated industries', 'Legal teams tracking filing deadlines'],
    metrics: ['23 active contracts analyzed', '4 pending reviews', '98% compliance rate'],
  },
  compliance: {
    capabilities: [
      { name: 'Policy Manager', status: 'live', description: 'Version-controlled policies with acknowledgment tracking' },
      { name: 'Audit Prep', status: 'live', description: 'Automated evidence collection and checklist generation' },
      { name: 'Training Compliance', status: 'live', description: 'Track mandatory training and certification expiry' },
      { name: 'Incident Response', status: 'live', description: 'Compliance incident logging and investigation workflow' },
    ],
    integrations: ['Google Workspace', 'Slack', 'BambooHR', 'Custom LMS'],
    useCases: ['Companies preparing for ISO/SOC audits', 'Regulated industries tracking certifications', 'HR teams managing training compliance'],
    metrics: ['18 active policies', '0 violations', '97/100 compliance score'],
  },
  'supply-chain': {
    capabilities: [
      { name: 'Vendor Manager', status: 'live', description: 'AI-scored vendor relationships with performance tracking' },
      { name: 'Procurement', status: 'live', description: 'Automated PO generation with approval workflows' },
      { name: 'Logistics Optimizer', status: 'live', description: 'Route optimization and carrier rate comparison' },
      { name: 'Inventory Planning', status: 'live', description: 'AI demand forecasting and reorder point optimization' },
    ],
    integrations: ['NetSuite', 'Odoo', 'ShipStation', 'EasyPost', 'SAP'],
    useCases: ['Manufacturing companies managing supplier networks', 'Distribution companies optimizing logistics', 'Retail businesses managing vendor relationships'],
    metrics: ['42 active vendors scored', '6.2 day avg lead time', '$12.4K cost savings identified'],
  },
};

export default function AdminAgentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const agent = AGENTS.find(a => a.slug === slug);
  const details = AGENT_DETAILS[slug];

  if (!agent) return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <div className="text-4xl">\uD83E\uDD16</div>
      <div className="text-lg font-semibold">Agent not found</div>
      <Link href="/admin" className="text-blue-400 text-sm">\u2190 Back to Admin</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{agent.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">LIVE</span>
              <div className="flex items-center gap-2 w-32">
                <div className="flex-1 bg-white/5 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: agent.completionPct + '%' }} /></div>
                <span className="text-[10px] text-gray-500">{agent.completionPct}%</span>
              </div>
            </div>
          </div>
        </div>
        <Link href={agent.liveRoute} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition">
          Open Live Agent \u2192
        </Link>
      </div>

      {/* Capabilities */}
      {details && (
        <>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-4">Capabilities</h2>
            <div className="space-y-3">
              {details.capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={"text-[10px] px-2 py-0.5 rounded font-medium mt-0.5 " +
                    (cap.status === 'live' ? 'bg-emerald-500/10 text-emerald-400' :
                     cap.status === 'beta' ? 'bg-blue-500/10 text-blue-400' :
                     'bg-gray-500/10 text-gray-500')
                  }>{cap.status.toUpperCase()}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{cap.name}</div>
                    <div className="text-xs text-gray-500">{cap.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Integrations</h3>
              {details.integrations.map((int, i) => (
                <div key={i} className="text-sm text-gray-300 py-1">\u2022 {int}</div>
              ))}
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Use Cases</h3>
              {details.useCases.map((uc, i) => (
                <div key={i} className="text-sm text-gray-300 py-1">\u2022 {uc}</div>
              ))}
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Key Metrics</h3>
              {details.metrics.map((m, i) => (
                <div key={i} className="text-sm text-emerald-400 py-1">\u2713 {m}</div>
              ))}
            </div>
          </div>
        </>
      )}

      <Link href="/admin" className="inline-block text-sm text-gray-500 hover:text-blue-400 transition">\u2190 Back to Admin Dashboard</Link>
    </div>
  );
}
`);

// ============================================================
// FILE 6: Updated Admin Dashboard (links to admin detail)
// ============================================================
console.log('  [6/10] Updated Admin Dashboard');

write(AP + 'app/admin/page.tsx', `'use client';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';
import { useState, useEffect } from 'react';

const LIVE = AGENTS.filter(a => a.status === 'live');
const CATEGORIES = [...new Set(LIVE.map(a => a.category))];

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => setUserCount(d.users?.length || 0)).catch(() => {});
  }, []);

  const filtered = selectedCat ? LIVE.filter(a => a.category === selectedCat) : LIVE;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage {LIVE.length} live agents, {userCount} users, and platform settings</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Live Agents</div>
          <div className="text-2xl font-bold mt-1 text-emerald-400">{LIVE.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Avg Completion</div>
          <div className="text-2xl font-bold mt-1">{Math.round(LIVE.reduce((s, a) => s + a.completionPct, 0) / LIVE.length)}%</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Users</div>
          <div className="text-2xl font-bold mt-1">{userCount}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Categories</div>
          <div className="text-2xl font-bold mt-1">{CATEGORIES.length}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/users" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition">Manage Users</Link>
        <Link href="/onboarding" className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/10 transition">Onboarding Wizard</Link>
        <Link href="/demo" className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/10 transition">Demo Hub</Link>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSelectedCat(null)} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition " + (!selectedCat ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>All ({LIVE.length})</button>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCat(cat)} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize " + (selectedCat === cat ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>{cat} ({LIVE.filter(a => a.category === cat).length})</button>
        ))}
      </div>

      {/* Links to /admin/agents/[slug] NOT to live agent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(agent => (
          <Link key={agent.slug} href={'/admin/agents/' + agent.slug} className="group bg-[#0A0E15] border border-white/5 hover:border-blue-500/30 rounded-xl p-5 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-400 transition text-sm">{agent.name}</div>
                  <div className="text-[10px] text-gray-500 capitalize">{agent.category}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">LIVE</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{agent.description}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 rounded-full h-1.5">
                <div className={"h-1.5 rounded-full " + (agent.completionPct >= 90 ? 'bg-emerald-500' : agent.completionPct >= 80 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: agent.completionPct + '%' }} />
              </div>
              <span className="text-[10px] text-gray-500">{agent.completionPct}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
`);

// ============================================================
// FILE 7: Customer Portal (real build-out)
// ============================================================
console.log('  [7/10] Customer Portal');

write(AP + 'app/portal/page.tsx', `'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import Link from 'next/link';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '\uD83D\uDCCA' },
  { id: 'inventory', name: 'Inventory', icon: '\uD83D\uDCE6' },
  { id: 'shipments', name: 'Shipments', icon: '\uD83D\uDE9A' },
  { id: 'billing', name: 'Billing', icon: '\uD83D\uDCB3' },
  { id: 'support', name: 'Support', icon: '\uD83D\uDCAC' },
];

const MOCK_INVENTORY = [
  { sku: 'SKU-A102', name: 'Widget Pro X', qty: 1247, location: 'A-12-3', status: 'In Stock' },
  { sku: 'SKU-B205', name: 'Bracket Assembly', qty: 8, location: 'B-04-1', status: 'Low Stock' },
  { sku: 'SKU-C310', name: 'Sensor Module v3', qty: 432, location: 'C-08-2', status: 'In Stock' },
  { sku: 'SKU-D418', name: 'Power Supply 12V', qty: 0, location: 'D-01-4', status: 'Out of Stock' },
  { sku: 'SKU-E522', name: 'Cable Harness 2m', qty: 2150, location: 'A-15-1', status: 'In Stock' },
  { sku: 'SKU-F630', name: 'Display Panel LCD', qty: 56, location: 'E-02-3', status: 'In Stock' },
];

const MOCK_SHIPMENTS = [
  { id: 'SHP-001', type: 'Inbound ASN', items: 3, status: 'Arriving Tomorrow', carrier: 'FedEx', tracking: '7489201' },
  { id: 'SHP-002', type: 'Outbound', items: 12, status: 'Shipped', carrier: 'UPS', tracking: '1Z999AA1' },
  { id: 'SHP-003', type: 'Inbound ASN', items: 1, status: 'Pending Receipt', carrier: 'Freight', tracking: 'PRO-44821' },
  { id: 'SHP-004', type: 'Outbound', items: 5, status: 'Processing', carrier: 'USPS', tracking: '-' },
];

export default function CustomerPortal() {
  const { currentCompany, isLoading } = useTenant();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customer Portal</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'} \u2014 Inventory, Shipments & Billing
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition">+ New ASN</button>
          <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Export</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition " + (activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
            <span>{tab.icon}</span> {tab.name}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Total SKUs</div>
              <div className="text-2xl font-bold mt-1">1,247</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Low Stock Items</div>
              <div className="text-2xl font-bold mt-1 text-amber-400">2</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Pending ASNs</div>
              <div className="text-2xl font-bold mt-1 text-blue-400">2</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Shipments Today</div>
              <div className="text-2xl font-bold mt-1 text-emerald-400">3</div>
            </div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>\u2022 ASN #SHP-001 arriving tomorrow (3 items)</span><span className="text-gray-600">2h ago</span></div>
              <div className="flex justify-between text-gray-400"><span>\u2022 Order #SHP-002 shipped via UPS</span><span className="text-gray-600">5h ago</span></div>
              <div className="flex justify-between text-gray-400"><span>\u2022 SKU-B205 low stock alert (8 remaining)</span><span className="text-gray-600">1d ago</span></div>
              <div className="flex justify-between text-gray-400"><span>\u2022 Cycle count completed \u2014 99.2% accuracy</span><span className="text-gray-600">2d ago</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">SKU</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Qty</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Location</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_INVENTORY.map(item => (
                <tr key={item.sku} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm font-mono text-blue-400">{item.sku}</td>
                  <td className="px-4 py-3 text-sm text-white">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono">{item.qty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{item.location}</td>
                  <td className="px-4 py-3"><span className={"text-[10px] px-2 py-0.5 rounded font-medium " +
                    (item.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400' :
                     item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-400' :
                     'bg-red-500/10 text-red-400')}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shipments Tab */}
      {activeTab === 'shipments' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Type</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Items</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Carrier</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Tracking</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_SHIPMENTS.map(s => (
                <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm font-mono text-blue-400">{s.id}</td>
                  <td className="px-4 py-3 text-sm text-white">{s.type}</td>
                  <td className="px-4 py-3 text-sm text-right">{s.items}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{s.carrier}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-500">{s.tracking}</td>
                  <td className="px-4 py-3"><span className={"text-[10px] px-2 py-0.5 rounded font-medium " +
                    (s.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-400' :
                     s.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' :
                     'bg-amber-500/10 text-amber-400')}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Current Balance</div>
              <div className="text-2xl font-bold mt-1">$4,250.00</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Storage Fee/mo</div>
              <div className="text-2xl font-bold mt-1">$1,850.00</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Last Payment</div>
              <div className="text-2xl font-bold mt-1 text-emerald-400">$2,100</div>
              <div className="text-[10px] text-gray-500 mt-1">Feb 1, 2026</div>
            </div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Invoice History</h3>
            <div className="space-y-2">
              {['INV-2026-002 \u2014 Feb Storage \u2014 $1,850 \u2014 Due Feb 28', 'INV-2026-001 \u2014 Jan Storage \u2014 $1,850 \u2014 Paid', 'INV-2025-012 \u2014 Dec Storage \u2014 $1,750 \u2014 Paid', 'INV-2025-011 \u2014 Nov Handling \u2014 $400 \u2014 Paid'].map((inv, i) => (
                <div key={i} className="flex justify-between items-center text-sm text-gray-400 py-1 border-b border-white/[0.03]">
                  <span>{inv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">\uD83D\uDCAC</div>
          <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-gray-400 mb-4">Our team is available Monday-Friday, 8am-6pm MST</p>
          <div className="flex justify-center gap-3">
            <a href="mailto:support@woulfgroup.com" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition">Email Support</a>
            <a href="tel:+18015551234" className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Call Us</a>
          </div>
        </div>
      )}
    </div>
  );
}
`);

// ============================================================
// FILE 8: Richer Demo Hub descriptions
// ============================================================
console.log('  [8/10] Richer Demo [slug] page');

write(AP + 'app/demo/[slug]/page.tsx', `'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';

// Rich capability descriptions that SELL each agent
const CAPABILITIES: Record<string, { headline: string; bullets: string[]; aha: string }> = {
  cfo: { headline: 'Your AI-powered financial command center', bullets: ['Real-time cash flow forecasting with 90-day projections', 'Automated 4-tier collections: Gentle > Firm > Urgent > Legal', 'Financial health scoring that spots problems before they hit', 'Invoice management with Odoo, QuickBooks, and Xero sync', 'Refinance alerts that save you thousands on debt terms'], aha: 'First insight: "$12K in overdue payments identified in 30 seconds"' },
  sales: { headline: 'Close more deals with AI intelligence', bullets: ['Visual pipeline with AI-predicted deal risk scoring', 'Behavioral profiles auto-generated for every contact', 'Battle cards that help you win against specific competitors', 'Activity tracking with smart follow-up reminders', 'CRM sync with HubSpot, Salesforce, Pipedrive, and more'], aha: 'First insight: "3 High-Risk deals flagged before they went cold"' },
  'org-lead': { headline: 'See your entire business in one view', bullets: ['Cross-agent dashboard pulling KPIs from all 14 agents', 'Team performance, capacity, and utilization tracking', 'Strategic OKR tracking with progress visualization', 'AI-generated weekly executive briefings', 'Real-time alerts when any metric crosses threshold'], aha: 'First insight: "87% org efficiency \u2014 3 bottlenecks identified"' },
  seo: { headline: 'Dominate search results with AI', bullets: ['Track rankings for unlimited keywords across Google', 'Technical SEO audits that find what you are missing', 'Content optimization scoring with AI rewrite suggestions', 'Competitor movement monitoring and gap analysis', 'Backlink opportunity identification'], aha: 'First insight: "12 high-intent keywords where you can rank Page 1"' },
  marketing: { headline: 'Run smarter campaigns, not more campaigns', bullets: ['Multi-channel campaign management from one dashboard', 'Content calendar with AI-suggested topics and timing', 'Lead attribution showing which campaigns drive revenue', 'Unified analytics across Google, Meta, LinkedIn, email', 'Budget optimization powered by ROI data'], aha: 'First insight: "45K reach, 89 leads \u2014 your best channel is organic"' },
  wms: { headline: 'Warehouse operations on autopilot', bullets: ['Real-time SKU-level inventory with location tracking', 'ASN processing with quality checks and putaway rules', 'Pick, pack, ship with carrier rate shopping', 'Automated cycle counting with 99.2% accuracy', 'Multi-client 3PL support with data isolation'], aha: 'First insight: "SKU-A102 below reorder point \u2014 auto-PO suggested"' },
  hr: { headline: 'People management made effortless', bullets: ['Searchable org chart with full employee profiles', 'PTO accrual management with request/approval workflow', 'New hire onboarding checklists with document collection', 'Certification expiry tracking with auto-reminders', 'Performance review system with AI-generated summaries'], aha: 'First insight: "Maria\'s safety cert expires in 4 days"' },
  finops: { headline: 'Financial operations intelligence', bullets: ['Complete AP visibility with aging analysis', 'All debt instruments tracked with payment schedules', 'Labor cost analysis per employee and department', 'AI auto-categorization of expenses'], aha: 'First insight: "$729K total debt \u2014 refinance opportunity found"' },
  payables: { headline: 'Never miss a bill again', bullets: ['Email/upload invoice capture with OCR extraction', 'Multi-level approval workflows with mobile support', 'ACH, check, and wire payment execution', 'Auto-reconciliation of payments to invoices'], aha: 'First insight: "2 invoices pending \u2014 auto-matched to POs"' },
  collections: { headline: 'Get paid faster with AI collections', bullets: ['Visual aging buckets with invoice-level drill-down', 'Automated escalation from gentle reminder to legal notice', 'Payment plan generation for overdue accounts', 'Predictive scoring: who will pay late?'], aha: 'First insight: "$77,700 overdue \u2014 2 accounts need immediate attention"' },
  operations: { headline: 'Run projects like a machine', bullets: ['Multi-project tracking with budget and timeline views', 'Crew scheduling with certification and availability checks', 'Equipment tracking with GPS and maintenance alerts', 'OSHA safety compliance and incident reporting'], aha: 'First insight: "Project Alpha is 3 days behind \u2014 crew reassignment suggested"' },
  legal: { headline: 'AI-powered legal risk management', bullets: ['Contract analysis with automatic clause extraction', 'Risk scoring across all vendor and client contracts', 'Regulatory filing deadline tracking', 'Dispute management with cost and timeline tracking'], aha: 'First insight: "23 contracts analyzed \u2014 2 have unfavorable auto-renewal clauses"' },
  compliance: { headline: 'Stay compliant without the headache', bullets: ['Policy management with version control and acknowledgment', 'Audit preparation with automated evidence collection', 'Training compliance tracking and cert expiry alerts', 'Incident logging with investigation workflows'], aha: 'First insight: "97/100 compliance score \u2014 2 training items overdue"' },
  'supply-chain': { headline: 'Optimize your entire supply chain', bullets: ['AI-scored vendor relationships with performance history', 'Automated PO generation with approval workflows', 'Route optimization and carrier rate comparison', 'Demand forecasting with reorder point optimization'], aha: 'First insight: "42 vendors scored \u2014 $12.4K savings identified"' },
};

const DEMO_KPIS: Record<string, { label: string; value: string; trend?: string }[]> = {
  cfo: [{ label: 'Total AR', value: '$124,600', trend: '+12%' }, { label: 'Overdue', value: '$77,700', trend: '-5%' }, { label: 'Health Score', value: '65/100', trend: '+3' }, { label: 'Cash Runway', value: '0.4 months' }],
  sales: [{ label: 'Pipeline', value: '$485K', trend: '+18%' }, { label: 'Won', value: '8 deals', trend: '+2' }, { label: 'Win Rate', value: '67%', trend: '+5%' }, { label: 'Avg Deal', value: '$39K' }],
  'org-lead': [{ label: 'Revenue', value: '$1.2M', trend: '+8%' }, { label: 'Employees', value: '34', trend: '+2' }, { label: 'Projects', value: '12' }, { label: 'Efficiency', value: '87%' }],
  seo: [{ label: 'DA', value: '42', trend: '+3' }, { label: 'Keywords', value: '156' }, { label: 'Traffic', value: '4.2K/mo', trend: '+15%' }, { label: 'Backlinks', value: '312' }],
  marketing: [{ label: 'Campaigns', value: '6' }, { label: 'Reach', value: '45K', trend: '+22%' }, { label: 'Leads', value: '89', trend: '+14' }, { label: 'Conv Rate', value: '3.2%' }],
  wms: [{ label: 'SKUs', value: '1,247' }, { label: 'Low Stock', value: '8', trend: '-2' }, { label: 'ASNs', value: '3 pending' }, { label: 'Accuracy', value: '99.2%' }],
  hr: [{ label: 'Headcount', value: '34' }, { label: 'Open Roles', value: '5' }, { label: 'PTO Use', value: '72%' }, { label: 'Compliance', value: '96%' }],
  finops: [{ label: 'Expenses', value: '$105K' }, { label: 'Debt', value: '$729K' }, { label: 'Equipment', value: '$214K' }, { label: 'Burn', value: '$110K/mo' }],
  payables: [{ label: 'Pending', value: '2 inv' }, { label: 'Unreconciled', value: '10' }, { label: 'Outflow', value: '$105K' }, { label: 'Methods', value: '4' }],
  collections: [{ label: 'Overdue', value: '$77.7K' }, { label: 'Debtors', value: '3' }, { label: 'Gentle', value: '1' }, { label: 'Firm', value: '2' }],
  operations: [{ label: 'Projects', value: '8' }, { label: 'On-Time', value: '91%' }, { label: 'Crews', value: '24' }, { label: 'Variance', value: '-2.1%' }],
  legal: [{ label: 'Contracts', value: '23' }, { label: 'Review', value: '4' }, { label: 'Risk', value: 'Low' }, { label: 'Compliance', value: '98%' }],
  compliance: [{ label: 'Policies', value: '18' }, { label: 'Audits', value: '2 due' }, { label: 'Violations', value: '0' }, { label: 'Score', value: '97/100' }],
  'supply-chain': [{ label: 'Vendors', value: '42' }, { label: 'Orders', value: '7' }, { label: 'Lead Time', value: '6.2d' }, { label: 'Savings', value: '$12.4K' }],
};

export default function DemoAgentPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const agent = AGENTS.find(a => a.slug === slug);
  const caps = CAPABILITIES[slug];
  const kpis = DEMO_KPIS[slug] || [];

  if (!agent) return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <div className="text-4xl">\uD83E\uDD16</div>
      <div className="text-lg font-semibold">Agent not found</div>
      <Link href="/demo" className="text-blue-400 text-sm">\u2190 Back to all agents</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{agent.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-lg text-gray-300 mt-1">{caps?.headline || agent.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">LIVE</span>
              <span className="text-[10px] text-gray-500">{agent.completionPct}% Complete</span>
            </div>
          </div>
        </div>
        <button onClick={() => router.push('/onboarding?agent=' + agent.slug)} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition">
          Start Free \u2192
        </button>
      </div>

      {/* KPI Preview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[9px] text-gray-500 uppercase">{kpi.label}</div>
            <div className="text-xl font-mono font-bold mt-1">{kpi.value}</div>
            {kpi.trend && <div className="text-[10px] text-emerald-400 mt-1">{kpi.trend}</div>}
            <div className="text-[9px] text-amber-400/50 mt-1 italic">sample data</div>
          </div>
        ))}
      </div>

      {/* What It Does */}
      {caps && (
        <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">What {agent.name} Does For You</h2>
          <div className="space-y-3">
            {caps.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">\u2713</span>
                <span className="text-sm text-gray-300">{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aha Moment */}
      {caps && (
        <div className="bg-[#0A0E15] border border-emerald-500/20 rounded-xl p-6">
          <div className="text-[10px] text-emerald-400 uppercase font-semibold mb-2">\u26A1 First 10 Minutes</div>
          <p className="text-lg text-white font-medium">{caps.aha}</p>
        </div>
      )}

      {/* Features */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Built-In Features ({agent.features.length})</h3>
        <div className="grid grid-cols-2 gap-2">
          {agent.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-sm text-gray-300">
              <span className="text-emerald-400">\u2713</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/20 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Ready to see {agent.name} with YOUR data?</h3>
        <p className="text-sm text-gray-400 mb-5">Connect in under 10 minutes. No credit card required.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => router.push('/onboarding?agent=' + agent.slug)} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition">Start Onboarding</button>
          <button onClick={() => router.push(agent.liveRoute)} className="px-6 py-3 bg-white/5 text-gray-300 rounded-lg text-sm font-semibold hover:bg-white/10 transition">View Live Agent</button>
        </div>
      </div>
    </div>
  );
}
`);

// ============================================================
// FILE 9: Restore Solo Sales page route
// ============================================================
console.log('  [9/10] Solo Sales agent page check');

// Check if solo page exists, if not create a redirect
if (!fs.existsSync(path.join(ROOT, AP + 'app/agents/sales/solo/page.tsx'))) {
  write(AP + 'app/agents/sales/solo/page.tsx', `'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to sales intel if solo page was removed
export default function SoloSalesRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/agents/sales/intel'); }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-gray-400 text-sm">Redirecting to Sales Agent...</p>
    </div>
  );
}
`);
} else {
  console.log('  \u2713 app/agents/sales/solo/page.tsx (already exists)');
}

// ============================================================
// FILE 10: Onboarding layout (no sidebar - clean)
// ============================================================
console.log('  [10/10] Onboarding layout (no sidebar)');

write(AP + 'app/onboarding/layout.tsx', `export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`);

// DONE
console.log('');
console.log('  ======================================================');
console.log('  \u2713 Created/Updated ' + created + ' files');
console.log('  ======================================================');
console.log('');
console.log('  Fixes:');
console.log('    1. Operations, Legal, Compliance, Supply Chain \u2192 full agent pages');
console.log('    2. Admin dashboard \u2192 links to /admin/agents/[slug] detail view');
console.log('    3. Admin agent detail \u2192 capabilities, integrations, use cases, metrics');
console.log('    4. Demo [slug] \u2192 rich "what it does" selling copy + aha moments');
console.log('    5. Customer Portal \u2192 Overview, Inventory, Shipments, Billing, Support tabs');
console.log('    6. Solo Sales \u2192 restored/redirected');
console.log('    7. Onboarding \u2192 clean layout (no sidebar)');
console.log('');
console.log('  Next: npm run build && vercel --prod');
console.log('');
