'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useAgents } from '@/lib/hooks/useAgents';
import Link from 'next/link';


const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 499,
    agents: 3,
    companies: 1,
    users: 2,
    features: ['3 AI Agents of your choice', '1 Company workspace', '2 Team members', 'Email support', 'Basic analytics dashboard'],
    cta: 'Start with Starter',
    popular: false,
    isEnterprise: false,
  },
  {
    key: 'professional',
    name: 'Professional',
    price: 1200,
    agents: 8,
    companies: 3,
    users: 10,
    features: ['8 AI Agents of your choice', '3 Company workspaces', '10 Team members', 'Priority support', 'Advanced analytics', 'API access', 'Custom onboarding session'],
    cta: 'Go Professional',
    popular: true,
    isEnterprise: false,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 0,
    agents: 21,
    companies: -1,
    users: -1,
    features: [
      'All 21 AI Agents',
      'Unlimited workspaces',
      'Unlimited team members',
      'Dedicated account manager',
      'Full analytics suite',
      'API + Webhooks',
      'Custom integrations',
      'SLA guarantee',
      'On-site training available',
    ],
    cta: 'Contact Sales',
    popular: false,
    isEnterprise: true,
  },
];

export default function PricingPage() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
  const [loading, setLoading] = useState<string | null>(null);
  const params = useSearchParams();
  const canceled = params.get('canceled');

  const handleSubscribe = async (planKey: string) => {
    // Enterprise → redirect to contact/support
    const plan = PLANS.find(p => p.key === planKey);
    if (plan?.isEnterprise) {
      window.location.href = '/contact?interest=enterprise';
      return;
    }

    setLoading(planKey);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();

      if (!session) {
        window.location.href = '/login?redirect=/pricing';
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
        body: JSON.stringify({ plan: planKey, userId: session.user.id, email: session.user.email }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Something went wrong');
    } catch (err) {
      alert('Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#060910] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 text-lg">AI agents that work for your business. Cancel anytime.</p>
          {canceled && <p className="text-amber-400 text-sm mt-3">Checkout was canceled. Pick a plan when you are ready.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.key} className={'relative bg-[#0A0E15] border rounded-2xl p-6 flex flex-col ' + (plan.popular ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-white/5')}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-full">Most Popular</div>}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                {plan.isEnterprise ? (
                  <div>
                    <div className="text-2xl font-bold text-gray-300 mt-1">Custom Pricing</div>
                    <p className="text-xs text-gray-500 mt-1">Tailored to your organization</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{'$' + plan.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">/month</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{plan.agents} agents | {plan.companies === -1 ? 'Unlimited' : plan.companies} {plan.companies === 1 ? 'workspace' : 'workspaces'} | {plan.users === -1 ? 'Unlimited' : plan.users} users</p>
                  </div>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-emerald-400 mt-0.5">{'\u2713'}</span> {f}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleSubscribe(plan.key)} disabled={loading !== null && !plan.isEnterprise}
                className={'w-full py-3 rounded-xl font-semibold text-sm transition ' +
                  (plan.isEnterprise
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90'
                    : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-white/5 text-white hover:bg-white/10') +
                  (loading === plan.key ? ' opacity-50 cursor-wait' : '')}>
                {loading === plan.key ? 'Redirecting to Stripe...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 text-xs text-gray-600">
          <p>Starter and Professional plans include a 14-day free trial. No credit card required.</p>
          <p className="mt-1">Powered by Stripe. PCI compliant. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}
