'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';

const DEMO_KPIS: Record<string, { label: string; value: string; trend?: string }[]> = {
  cfo: [
    { label: 'Total AR', value: '$124,600', trend: '+12%' },
    { label: 'Overdue', value: '$77,700', trend: '-5%' },
    { label: 'Health Score', value: '65/100', trend: '+3' },
    { label: 'Cash Runway', value: '0.4 months', trend: '-0.1' },
  ],
  sales: [
    { label: 'Pipeline Value', value: '$485,000', trend: '+18%' },
    { label: 'Won Deals', value: '8', trend: '+2' },
    { label: 'Win Rate', value: '67%', trend: '+5%' },
    { label: 'Avg Deal Size', value: '$39,000', trend: '+$4K' },
  ],
  'org-lead': [
    { label: 'Total Revenue', value: '$1.2M', trend: '+8%' },
    { label: 'Active Employees', value: '34', trend: '+2' },
    { label: 'Open Projects', value: '12' },
    { label: 'Efficiency', value: '87%', trend: '+3%' },
  ],
  seo: [
    { label: 'Domain Authority', value: '42', trend: '+3' },
    { label: 'Keywords Tracked', value: '156', trend: '+24' },
    { label: 'Organic Traffic', value: '4,200/mo', trend: '+15%' },
    { label: 'Backlinks', value: '312', trend: '+18' },
  ],
  marketing: [
    { label: 'Active Campaigns', value: '6', trend: '+1' },
    { label: 'Total Reach', value: '45K', trend: '+22%' },
    { label: 'Leads Generated', value: '89', trend: '+14' },
    { label: 'Conv. Rate', value: '3.2%', trend: '+0.4%' },
  ],
  wms: [
    { label: 'Total SKUs', value: '1,247', trend: '+52' },
    { label: 'Low Stock', value: '8 items', trend: '-2' },
    { label: 'Inbound ASNs', value: '3 pending' },
    { label: 'Accuracy', value: '99.2%', trend: '+0.1%' },
  ],
  hr: [
    { label: 'Headcount', value: '34', trend: '+2' },
    { label: 'Open Positions', value: '5' },
    { label: 'PTO Utilization', value: '72%', trend: '+5%' },
    { label: 'Compliance', value: '96%', trend: '+1%' },
  ],
  finops: [
    { label: 'Monthly Expenses', value: '$105,240', trend: '-3%' },
    { label: 'Total Debt', value: '$729,000', trend: '-$12K' },
    { label: 'Equipment Value', value: '$214,000' },
    { label: 'Burn Rate', value: '$109,630/mo' },
  ],
  payables: [
    { label: 'Pending Review', value: '2 invoices' },
    { label: 'Unreconciled', value: '10 txns' },
    { label: 'Monthly Outflow', value: '$105,240' },
    { label: 'Payment Methods', value: '4 active' },
  ],
  collections: [
    { label: 'Overdue Total', value: '$77,700' },
    { label: 'Debtors', value: '3 accounts' },
    { label: 'Gentle Stage', value: '1' },
    { label: 'Firm Stage', value: '2' },
  ],
  operations: [
    { label: 'Active Projects', value: '8', trend: '+1' },
    { label: 'On-Time Rate', value: '91%', trend: '+2%' },
    { label: 'Crew Members', value: '24' },
    { label: 'Budget Variance', value: '-2.1%' },
  ],
  legal: [
    { label: 'Active Contracts', value: '23', trend: '+3' },
    { label: 'Pending Review', value: '4', trend: '-1' },
    { label: 'Risk Score', value: 'Low' },
    { label: 'Compliance', value: '98%', trend: '+1%' },
  ],
  compliance: [
    { label: 'Policies Active', value: '18' },
    { label: 'Audits Due', value: '2' },
    { label: 'Violations', value: '0' },
    { label: 'Score', value: '97/100', trend: '+2' },
  ],
  'supply-chain': [
    { label: 'Active Vendors', value: '42', trend: '+3' },
    { label: 'Pending Orders', value: '7' },
    { label: 'Avg Lead Time', value: '6.2 days', trend: '-0.4' },
    { label: 'Cost Savings', value: '$12,400', trend: '+$2.1K' },
  ],
};

export default function DemoAgentPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const agent = AGENTS.find(a => a.slug === slug);

  if (!agent) return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <div className="text-4xl">🤖</div>
      <div className="text-lg font-semibold">Agent not found</div>
      <Link href="/demo" className="text-blue-400 text-sm">← Back to all agents</Link>
    </div>
  );

  const kpis = DEMO_KPIS[slug] || [
    { label: 'Status', value: agent.status.toUpperCase() },
    { label: 'Completion', value: agent.completionPct + '%' },
    { label: 'Category', value: agent.category },
    { label: 'Features', value: String(agent.features.length) },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{agent.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={"text-[10px] px-2 py-0.5 rounded font-semibold " + (agent.status === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                {agent.status === 'live' ? 'LIVE' : 'IN DEVELOPMENT'}
              </span>
              <div className="flex items-center gap-2 w-32">
                <div className="flex-1 bg-white/5 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: agent.completionPct + '%' }} /></div>
                <span className="text-[10px] text-gray-500">{agent.completionPct}%</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => agent.status === 'live' ? router.push(agent.liveRoute) : router.push('/onboarding?agent=' + agent.slug)} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
          {agent.status === 'live' ? 'Go to Live Agent →' : 'Start Onboarding'}
        </button>
      </div>

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

      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-emerald-400 mb-3">Features ({agent.features.length})</h3>
        <div className="grid grid-cols-2 gap-2">
          {agent.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-xs">
              <span className="text-emerald-400">✓</span>
              <span className="text-gray-300">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold mb-2">{agent.status === 'live' ? 'Ready to go live?' : 'Interested in this agent?'}</h3>
        <p className="text-sm text-gray-400 mb-4">
          {agent.status === 'live' ? 'Connect your real business data and start using ' + agent.name + ' today.' : 'Start onboarding to get ' + agent.name + ' set up for your organization.'}
        </p>
        <button onClick={() => agent.status === 'live' ? router.push(agent.liveRoute) : router.push('/onboarding?agent=' + agent.slug)} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          {agent.status === 'live' ? 'Go to Live Agent' : 'Start Onboarding'}
        </button>
      </div>
    </div>
  );
}
