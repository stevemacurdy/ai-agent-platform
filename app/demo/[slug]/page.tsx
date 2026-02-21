'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';

// Rich capability descriptions that SELL each agent
const CAPABILITIES: Record<string, { headline: string; bullets: string[]; aha: string }> = {
  cfo: { headline: 'Your AI-powered financial command center', bullets: ['Real-time cash flow forecasting with 90-day projections', 'Automated 4-tier collections: Gentle > Firm > Urgent > Legal', 'Financial health scoring that spots problems before they hit', 'Invoice management with Odoo, QuickBooks, and Xero sync', 'Refinance alerts that save you thousands on debt terms'], aha: 'First insight: "$12K in overdue payments identified in 30 seconds"' },
  sales: { headline: 'Close more deals with AI intelligence', bullets: ['Visual pipeline with AI-predicted deal risk scoring', 'Behavioral profiles auto-generated for every contact', 'Battle cards that help you win against specific competitors', 'Activity tracking with smart follow-up reminders', 'CRM sync with HubSpot, Salesforce, Pipedrive, and more'], aha: 'First insight: "3 High-Risk deals flagged before they went cold"' },
  'org-lead': { headline: 'See your entire business in one view', bullets: ['Cross-agent dashboard pulling KPIs from all 14 agents', 'Team performance, capacity, and utilization tracking', 'Strategic OKR tracking with progress visualization', 'AI-generated weekly executive briefings', 'Real-time alerts when any metric crosses threshold'], aha: 'First insight: "87% org efficiency — 3 bottlenecks identified"' },
  seo: { headline: 'Dominate search results with AI', bullets: ['Track rankings for unlimited keywords across Google', 'Technical SEO audits that find what you are missing', 'Content optimization scoring with AI rewrite suggestions', 'Competitor movement monitoring and gap analysis', 'Backlink opportunity identification'], aha: 'First insight: "12 high-intent keywords where you can rank Page 1"' },
  marketing: { headline: 'Run smarter campaigns, not more campaigns', bullets: ['Multi-channel campaign management from one dashboard', 'Content calendar with AI-suggested topics and timing', 'Lead attribution showing which campaigns drive revenue', 'Unified analytics across Google, Meta, LinkedIn, email', 'Budget optimization powered by ROI data'], aha: 'First insight: "45K reach, 89 leads — your best channel is organic"' },
  wms: { headline: 'Warehouse operations on autopilot', bullets: ['Real-time SKU-level inventory with location tracking', 'ASN processing with quality checks and putaway rules', 'Pick, pack, ship with carrier rate shopping', 'Automated cycle counting with 99.2% accuracy', 'Multi-client 3PL support with data isolation'], aha: 'First insight: "SKU-A102 below reorder point — auto-PO suggested"' },
  hr: { headline: 'People management made effortless', bullets: ['Searchable org chart with full employee profiles', 'PTO accrual management with request/approval workflow', 'New hire onboarding checklists with document collection', 'Certification expiry tracking with auto-reminders', 'Performance review system with AI-generated summaries'], aha: 'First insight: "Maria\x27s safety cert expires in 4 days"' },
  finops: { headline: 'Financial operations intelligence', bullets: ['Complete AP visibility with aging analysis', 'All debt instruments tracked with payment schedules', 'Labor cost analysis per employee and department', 'AI auto-categorization of expenses'], aha: 'First insight: "$729K total debt — refinance opportunity found"' },
  payables: { headline: 'Never miss a bill again', bullets: ['Email/upload invoice capture with OCR extraction', 'Multi-level approval workflows with mobile support', 'ACH, check, and wire payment execution', 'Auto-reconciliation of payments to invoices'], aha: 'First insight: "2 invoices pending — auto-matched to POs"' },
  collections: { headline: 'Get paid faster with AI collections', bullets: ['Visual aging buckets with invoice-level drill-down', 'Automated escalation from gentle reminder to legal notice', 'Payment plan generation for overdue accounts', 'Predictive scoring: who will pay late?'], aha: 'First insight: "$77,700 overdue — 2 accounts need immediate attention"' },
  operations: { headline: 'Run projects like a machine', bullets: ['Multi-project tracking with budget and timeline views', 'Crew scheduling with certification and availability checks', 'Equipment tracking with GPS and maintenance alerts', 'OSHA safety compliance and incident reporting'], aha: 'First insight: "Project Alpha is 3 days behind — crew reassignment suggested"' },
  legal: { headline: 'AI-powered legal risk management', bullets: ['Contract analysis with automatic clause extraction', 'Risk scoring across all vendor and client contracts', 'Regulatory filing deadline tracking', 'Dispute management with cost and timeline tracking'], aha: 'First insight: "23 contracts analyzed — 2 have unfavorable auto-renewal clauses"' },
  compliance: { headline: 'Stay compliant without the headache', bullets: ['Policy management with version control and acknowledgment', 'Audit preparation with automated evidence collection', 'Training compliance tracking and cert expiry alerts', 'Incident logging with investigation workflows'], aha: 'First insight: "97/100 compliance score — 2 training items overdue"' },
  'supply-chain': { headline: 'Optimize your entire supply chain', bullets: ['AI-scored vendor relationships with performance history', 'Automated PO generation with approval workflows', 'Route optimization and carrier rate comparison', 'Demand forecasting with reorder point optimization'], aha: 'First insight: "42 vendors scored — $12.4K savings identified"' },
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
      <div className="text-4xl">🤖</div>
      <div className="text-lg font-semibold">Agent not found</div>
      <Link href="/demo" className="text-blue-400 text-sm">← Back to all agents</Link>
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
          Start Free →
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
                <span className="text-blue-400 mt-0.5">✓</span>
                <span className="text-sm text-gray-300">{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aha Moment */}
      {caps && (
        <div className="bg-[#0A0E15] border border-emerald-500/20 rounded-xl p-6">
          <div className="text-[10px] text-emerald-400 uppercase font-semibold mb-2">⚡ First 10 Minutes</div>
          <p className="text-lg text-white font-medium">{caps.aha}</p>
        </div>
      )}

      {/* Features */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Built-In Features ({agent.features.length})</h3>
        <div className="grid grid-cols-2 gap-2">
          {agent.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-sm text-gray-300">
              <span className="text-emerald-400">✓</span> {typeof f === 'string' ? f : f.name}
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
