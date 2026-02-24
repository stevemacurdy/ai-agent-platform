'use client';
import { X, Plus, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Agent {
  slug: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  status: string;
  liveRoute: string;
}

interface AgentModalProps {
  agent: Agent;
  price: number;
  inCart: boolean;
  onClose: () => void;
  onAddToCart: (agent: Agent) => void;
}

const CAPABILITIES: Record<string, string[]> = {
  cfo: ['Financial health dashboard', 'Cash flow forecasting', 'Invoice tracking', 'Budget variance analysis', 'Debt management insights'],
  finops: ['Cloud cost optimization', 'Resource utilization tracking', 'Billing anomaly detection', 'Cost allocation reports', 'Savings recommendations'],
  payables: ['Automated invoice processing', 'Payment scheduling', 'Vendor management', 'Duplicate detection', 'Approval workflows'],
  collections: ['Aging report automation', 'Payment reminder workflows', 'Customer risk scoring', 'Collection priority queuing', 'Settlement tracking'],
  sales: ['Lead scoring & qualification', 'Pipeline management', 'Activity tracking', 'Forecasting', 'CRM integration'],
  'sales-intel': ['Competitive analysis', 'Market research', 'Buyer intent signals', 'Account enrichment', 'Deal intelligence'],
  seo: ['Keyword research & tracking', 'Content optimization', 'Technical SEO audits', 'Backlink analysis', 'Rank monitoring'],
  marketing: ['Campaign management', 'Content calendar', 'Social media automation', 'Email marketing', 'Analytics & ROI tracking'],
  'org-lead': ['OKR tracking', 'Team performance dashboards', 'Strategic planning', 'Cross-department coordination', 'Executive reporting'],
  wms: ['Inventory management', 'Order fulfillment tracking', 'Warehouse layout optimization', 'Pick/pack/ship workflows', 'Real-time stock levels'],
  operations: ['Process automation', 'Workflow optimization', 'Resource allocation', 'SLA monitoring', 'Operational reporting'],
  'supply-chain': ['Supplier management', 'Demand forecasting', 'Logistics optimization', 'Risk assessment', 'Order tracking'],
  legal: ['Contract review', 'Compliance checking', 'Legal document drafting', 'Regulatory monitoring', 'Risk assessment'],
  compliance: ['Regulatory tracking', 'Audit preparation', 'Policy management', 'Training compliance', 'Incident reporting'],
  hr: ['Recruiting & hiring', 'Employee onboarding', 'Performance reviews', 'Benefits administration', 'Time & attendance'],
};

export default function AgentModal({ agent, price, inCart, onClose, onAddToCart }: AgentModalProps) {
  const caps = CAPABILITIES[agent.slug] || ['AI-powered automation', 'Real-time analytics', 'Integration ready', 'Custom workflows', '24/7 operation'];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0A0E15] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{agent.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              <span className="text-xs text-gray-500 capitalize">{agent.category}</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{agent.description}</p>
        </div>

        {/* Price */}
        <div className="px-6 py-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Monthly Price</div>
              {price > 0 ? (
                <div className="text-2xl font-bold text-white">${price}<span className="text-sm text-gray-500">/mo</span></div>
              ) : (
                <div className="text-sm text-gray-400">Contact Sales for pricing</div>
              )}
            </div>
            <button
              onClick={() => onAddToCart(agent)}
              disabled={inCart}
              className={"flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition " +
                (inCart
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-blue-600 text-white hover:bg-blue-500')}
            >
              {inCart ? (
                <><Check className="w-4 h-4" /> In Cart</>
              ) : (
                <><Plus className="w-4 h-4" /> Add to Cart</>
              )}
            </button>
          </div>
        </div>

        {/* Capabilities */}
        <div className="px-6 pb-4">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">Key Capabilities</div>
          <div className="space-y-2">
            {caps.map((cap, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-gray-400">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                {cap}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {agent.status === 'live' && (
            <Link
              href={agent.liveRoute}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition"
            >
              <ExternalLink className="w-3 h-3" /> Try Agent
            </Link>
          )}
          <Link
            href="/contact"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition ml-auto"
          >
            Questions? Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}
