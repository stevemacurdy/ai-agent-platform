'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useAgents } from '@/lib/hooks/useAgents';
import Link from 'next/link';
import Image from 'next/image';

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 499,
    employees: 3,
    companies: 1,
    users: 2,
    features: ['3 AI Employees of your choice', '1 Company workspace', '2 Team members', 'Email support', 'Basic analytics dashboard'],
    cta: 'Start with Starter',
    popular: false,
    isEnterprise: false,
  },
  {
    key: 'professional',
    name: 'Professional',
    price: 1200,
    employees: 8,
    companies: 3,
    users: 10,
    features: ['8 AI Employees of your choice', '3 Company workspaces', '10 Team members', 'Priority support', 'Advanced analytics', 'API access', 'Custom onboarding session'],
    cta: 'Go Professional',
    popular: true,
    isEnterprise: false,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 0,
    employees: 21,
    companies: -1,
    users: -1,
    features: [
      'All 21 AI Employees',
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

const Check = ({ color = '#2A9D8F' }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill={color}><path d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1z" /></svg>
);

export default function PricingPage() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
  const [loading, setLoading] = useState<string | null>(null);
  const params = useSearchParams();
  const canceled = params.get('canceled');

  const handleSubscribe = async (planKey: string) => {
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
    <div className="min-h-screen" style={{ background: '#F4F5F7', color: '#1A1A2E', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`h1, h2, h3, h4 { font-family: 'Outfit', 'DM Sans', sans-serif; }`}</style>

      {/* NAV */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(27,42,74,0.97)', backdropFilter: 'blur(16px) saturate(1.6)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between h-[64px]">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={36} height={36} className="drop-shadow-lg group-hover:scale-105 transition-transform" />
            <span className="text-lg font-extrabold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Woulf<span style={{ color: '#F5920B' }}>AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/solutions" className="text-sm text-white/60 hover:text-white transition-colors">Solutions</Link>
            <Link href="/pricing" className="text-sm text-white font-medium">Pricing</Link>
            <Link href="/case-studies" className="text-sm text-white/60 hover:text-white transition-colors">Case Studies</Link>
            <Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white px-4 py-2 transition-colors">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all hover:-translate-y-px"
              style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
              Hire Your AI Team
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-20 pb-4 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#2A9D8F' }}>Simple Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: '#1B2A4A' }}>
            Choose Your Team Size
          </h1>
          <p className="mt-4 text-gray-500 text-lg">
            Hire AI Employees that work for your business. Scale up or down anytime.
          </p>
          {canceled && (
            <p className="mt-4 text-sm font-medium px-4 py-2.5 rounded-xl inline-block"
              style={{ background: 'rgba(245,146,11,0.08)', color: '#F5920B', border: '1px solid rgba(245,146,11,0.15)' }}>
              Checkout was canceled. Pick a plan when you&apos;re ready.
            </p>
          )}
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-16 px-6">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative p-10 rounded-3xl border-2 transition-all hover:shadow-xl ${plan.popular ? 'lg:scale-[1.03] shadow-xl' : ''}`}
              style={{
                background: plan.popular ? '#1B2A4A' : '#FFFFFF',
                borderColor: plan.popular ? '#F5920B' : '#E5E7EB',
                color: plan.popular ? '#fff' : '#1A1A2E',
              }}
            >
              {plan.popular && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-[1.5px] px-3.5 py-1 rounded-full mb-4"
                  style={{ background: 'rgba(245,146,11,0.15)', color: '#F5920B' }}>
                  Most Popular
                </span>
              )}

              <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>{plan.name}</h2>

              {plan.isEnterprise ? (
                <div className="mt-2">
                  <p className="text-2xl font-bold" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#6B7280' }}>Custom Pricing</p>
                  <p className={`text-xs mt-1 ${plan.popular ? 'text-white/40' : 'text-gray-400'}`}>Tailored to your organization</p>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-5xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    ${plan.price.toLocaleString()}
                    <span className={`text-sm font-normal ${plan.popular ? 'text-white/40' : 'text-gray-400'}`}>/mo</span>
                  </p>
                  <p className={`text-xs mt-1 ${plan.popular ? 'text-white/40' : 'text-gray-400'}`}>
                    {plan.employees} employees · {plan.companies === -1 ? 'Unlimited' : plan.companies} {plan.companies === 1 ? 'workspace' : 'workspaces'} · {plan.users === -1 ? 'Unlimited' : plan.users} users
                  </p>
                </div>
              )}

              <ul className="mt-7 flex flex-col gap-3.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: plan.popular ? 'rgba(245,146,11,0.2)' : 'rgba(42,157,143,0.1)' }}>
                      <Check color={plan.popular ? '#F5920B' : '#2A9D8F'} />
                    </span>
                    <span className={plan.popular ? 'text-white/75' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading !== null && !plan.isEnterprise}
                className="w-full mt-8 py-3.5 rounded-2xl text-[15px] font-bold transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-wait"
                style={{
                  background: plan.popular ? '#F5920B' : plan.isEnterprise ? '#1B2A4A' : 'transparent',
                  color: plan.popular ? '#fff' : plan.isEnterprise ? '#fff' : '#1B2A4A',
                  border: !plan.popular && !plan.isEnterprise ? '2px solid #1B2A4A' : 'none',
                  boxShadow: plan.popular ? '0 4px 16px rgba(245,146,11,0.3)' : 'none',
                }}
              >
                {loading === plan.key ? 'Redirecting to Stripe...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 space-y-1">
          <p className="text-sm text-gray-400">Starter and Professional plans include a 14-day free trial. No credit card required.</p>
          <p className="text-xs text-gray-400">Powered by Stripe · PCI compliant · Cancel anytime</p>
          <p className="text-sm text-gray-500 mt-4">
            Need something custom? <Link href="/contact" className="font-semibold" style={{ color: '#F5920B' }}>Contact our team</Link>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-[11px] text-gray-400">© 2026 WoulfAI by Woulf Group</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[11px] text-gray-400 hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="text-[11px] text-gray-400 hover:text-gray-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
