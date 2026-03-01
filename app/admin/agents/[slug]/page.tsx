'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAgents } from '@/lib/hooks/useAgents';

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
    integrations: ['All WoulfAI Employees', 'Google Workspace', 'Slack', 'Microsoft Teams'],
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
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const { slug } = useParams<{ slug: string }>();
  const agent = AGENTS.find(a => a.slug === slug);
  const details = AGENT_DETAILS[slug];

  if (!agent) return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <div className="text-4xl">🤖</div>
      <div className="text-lg font-semibold">Agent not found</div>
      <Link href="/admin" className="text-blue-600 text-sm">← Back to Admin</Link>
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
            <p className="text-sm text-[#6B7280] mt-1">{agent.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-semibold">LIVE</span>
              <div className="flex items-center gap-2 w-32">
                <div className="flex-1 bg-white shadow-sm rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: agent.completionPct + '%' }} /></div>
                <span className="text-[10px] text-[#9CA3AF]">{agent.completionPct}%</span>
              </div>
            </div>
          </div>
        </div>
        <Link href={agent.liveRoute} className="px-5 py-2.5 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition">
          Open Live Agent →
        </Link>
      </div>

      {/* Capabilities */}
      {details && (
        <>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-4">Capabilities</h2>
            <div className="space-y-3">
              {details.capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={"text-[10px] px-2 py-0.5 rounded font-medium mt-0.5 " +
                    (cap.status === 'live' ? 'bg-emerald-50 text-emerald-600' :
                     cap.status === 'beta' ? 'bg-blue-50 text-blue-600' :
                     'bg-gray-500/10 text-[#9CA3AF]')
                  }>{cap.status.toUpperCase()}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{cap.name}</div>
                    <div className="text-xs text-[#9CA3AF]">{cap.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-3">Integrations</h3>
              {details.integrations.map((int, i) => (
                <div key={i} className="text-sm text-[#4B5563] py-1">• {int}</div>
              ))}
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-3">Use Cases</h3>
              {details.useCases.map((uc, i) => (
                <div key={i} className="text-sm text-[#4B5563] py-1">• {uc}</div>
              ))}
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-3">Key Metrics</h3>
              {details.metrics.map((m, i) => (
                <div key={i} className="text-sm text-emerald-600 py-1">✓ {m}</div>
              ))}
            </div>
          </div>
        </>
      )}

      <Link href="/admin" className="inline-block text-sm text-[#9CA3AF] hover:text-blue-600 transition">← Back to Admin Dashboard</Link>
    </div>
  );
}
