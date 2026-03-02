'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import Link from 'next/link';
import Image from 'next/image';

interface BundleAgent {
  slug: string;
  display_name: string;
  icon: string;
  color: string;
  status: string;
  is_highlighted: boolean;
}

interface Bundle {
  id: string;
  slug: string;
  display_name: string;
  description: string;
  icon: string;
  price_monthly_cents: number;
  price_annual_cents: number;
  discount_pct: number;
  target_tier: string;
  is_featured: boolean;
  display_order: number;
  agents: BundleAgent[];
  agent_count: number;
}

const TIER_META: Record<string, { seats: string; actions: string; storage: string; extras: string[]; cta: string; comparison: string }> = {
  'starter': {
    seats: '2 seats',
    actions: '5,000 AI actions/mo',
    storage: '10 GB storage',
    extras: ['Pick any 3 AI Employees', '1 core integration', 'Email support', '14-day free trial'],
    cta: 'Start Free Trial',
    comparison: 'vs. $3,500–$4,500/mo for one warehouse worker',
  },
  'growth': {
    seats: '5 seats',
    actions: '25,000 AI actions/mo',
    storage: '50 GB storage',
    extras: ['Pick any 10 AI Employees', '3 core integrations', 'Priority email + chat support', 'Advanced analytics', 'API access'],
    cta: 'Start Free Trial',
    comparison: 'vs. $15,000+/mo for a 3-person back-office team',
  },
  'professional': {
    seats: 'Unlimited seats',
    actions: '100,000 AI actions/mo',
    storage: '200 GB storage',
    extras: ['All 21 AI Employees', 'Unlimited integrations', 'Dedicated support', 'Full analytics suite', 'API + Webhooks', 'Custom onboarding'],
    cta: 'Start Free Trial',
    comparison: 'vs. $50,000+/mo for a full operations team',
  },
  'enterprise-custom': {
    seats: 'Unlimited seats',
    actions: 'Unlimited AI actions',
    storage: 'Unlimited storage',
    extras: ['All 21 + custom AI Employees', 'Unlimited integrations', 'Dedicated account manager', 'Custom SLA guarantee', 'On-site training', 'White-label available'],
    cta: 'Contact Sales',
    comparison: 'Custom-built for your enterprise',
  },
};

const Check = ({ color = '#2A9D8F' }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill={color}><path d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1z" /></svg>
);

export default function PricingPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const params = useSearchParams();
  const canceled = params.get('canceled');

  useEffect(() => {
    fetch('/api/agents/bundles')
      .then(r => r.json())
      .then(data => {
        setBundles(data.bundles || []);
        setBundlesLoading(false);
      })
      .catch(() => setBundlesLoading(false));
  }, []);

  // Sort by display_order
  const sortedBundles = [...bundles].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const handleSubscribe = async (bundle: Bundle) => {
    if (bundle.slug === 'enterprise-custom') {
      window.location.href = '/contact?interest=enterprise';
      return;
    }
    setLoading(bundle.slug);
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
        body: JSON.stringify({
          bundle: bundle.slug,
          billingPeriod: annual ? 'annual' : 'monthly',
          userId: session.user.id,
          email: session.user.email,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Something went wrong');
    } catch {
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
            <Link href="/solutions" className="text-sm text-[#6B7280] hover:text-white transition-colors">Solutions</Link>
            <Link href="/pricing" className="text-sm text-white font-medium">Pricing</Link>
            <Link href="/case-studies" className="text-sm text-[#6B7280] hover:text-white transition-colors">Case Studies</Link>
            <Link href="/about" className="text-sm text-[#6B7280] hover:text-white transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#6B7280] hover:text-white px-4 py-2 transition-colors">Sign In</Link>
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
            Choose Your AI Workforce
          </h1>
          <p className="mt-4 text-[#6B7280] text-lg">
            Hire AI Employees that work for your business. Start with a team or go all-in.
          </p>

          {/* Billing Toggle */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? 'text-[#1B2A4A]' : 'text-[#9CA3AF]'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: annual ? '#2A9D8F' : '#D1D5DB' }}
            >
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: annual ? 'translateX(24px)' : 'translateX(0)' }} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-[#1B2A4A]' : 'text-[#9CA3AF]'}`}>
              Annual <span className="text-xs font-bold px-1.5 py-0.5 rounded-full ml-1" style={{ background: 'rgba(42,157,143,0.1)', color: '#2A9D8F' }}>Save 20%</span>
            </span>
          </div>

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
        {bundlesLoading ? (
          <div className="text-center py-20 text-[#9CA3AF]">Loading plans...</div>
        ) : (
          <>
            {/* 4-tier grid */}
            <div className="max-w-[1280px] mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sortedBundles.map((bundle) => {
                const meta = TIER_META[bundle.slug] || TIER_META['starter'];
                const isPopular = bundle.is_featured;
                const isEnterprise = bundle.slug === 'enterprise-custom';
                const priceCents = annual ? Math.round((bundle.price_annual_cents || 0) / 12) : (bundle.price_monthly_cents || 0);

                return (
                  <div
                    key={bundle.slug}
                    className={`relative p-7 rounded-2xl border-2 transition-all hover:shadow-xl flex flex-col ${isPopular ? 'shadow-xl ring-1 ring-[#F5920B]/20' : ''}`}
                    style={{
                      background: isPopular ? '#1B2A4A' : '#FFFFFF',
                      borderColor: isPopular ? '#F5920B' : '#E5E7EB',
                      color: isPopular ? '#fff' : '#1A1A2E',
                    }}
                  >
                    {isPopular && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-3 self-start"
                        style={{ background: 'rgba(245,146,11,0.15)', color: '#F5920B' }}>
                        Most Popular
                      </span>
                    )}

                    <h2 className="text-lg font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: isPopular ? '#fff' : '#1B2A4A' }}>
                      {bundle.icon} {bundle.display_name}
                    </h2>

                    <div className="mt-2">
                      {isEnterprise ? (
                        <p className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          Custom
                          <span className="text-sm font-normal" style={{ color: '#6B7280' }}> pricing</span>
                        </p>
                      ) : (
                        <>
                          <p className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            ${formatPrice(priceCents)}
                            <span className="text-sm font-normal" style={{ color: isPopular ? 'rgba(255,255,255,0.5)' : '#6B7280' }}>/mo</span>
                          </p>
                          {annual && bundle.price_annual_cents > 0 && (
                            <p className="text-xs mt-0.5" style={{ color: '#2A9D8F' }}>
                              ${formatPrice(bundle.price_annual_cents)}/yr &middot; Save {bundle.discount_pct || 20}%
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <p className={`text-xs mt-3 leading-relaxed ${isPopular ? 'text-white/50' : 'text-[#9CA3AF]'}`}>
                      {bundle.description}
                    </p>

                    {/* Capacity */}
                    <div className="mt-4 flex-1">
                      <ul className="space-y-1.5">
                        <li className={`flex items-center gap-2 text-xs font-semibold ${isPopular ? 'text-white/90' : 'text-[#1B2A4A]'}`}>
                          <Check color={isPopular ? '#F5920B' : '#2A9D8F'} /> {meta.seats}
                        </li>
                        <li className={`flex items-center gap-2 text-xs font-semibold ${isPopular ? 'text-white/90' : 'text-[#1B2A4A]'}`}>
                          <Check color={isPopular ? '#F5920B' : '#2A9D8F'} /> {meta.actions}
                        </li>
                        <li className={`flex items-center gap-2 text-xs font-semibold ${isPopular ? 'text-white/90' : 'text-[#1B2A4A]'}`}>
                          <Check color={isPopular ? '#F5920B' : '#2A9D8F'} /> {meta.storage}
                        </li>
                        {meta.extras.map((f) => (
                          <li key={f} className={`flex items-center gap-2 text-xs ${isPopular ? 'text-white/70' : 'text-[#4B5563]'}`}>
                            <Check color={isPopular ? '#F5920B' : '#2A9D8F'} /> {f}
                          </li>
                        ))}
                      </ul>

                      {/* Headcount comparison */}
                      <p className={`text-[10px] mt-3 italic ${isPopular ? 'text-white/30' : 'text-[#9CA3AF]'}`}>
                        {meta.comparison}
                      </p>
                    </div>

                    {/* Included agents */}
                    {bundle.agents && bundle.agents.length > 0 && (
                      <div className="mt-4">
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isPopular ? 'text-white/40' : 'text-[#9CA3AF]'}`}>
                          AI Employees
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {bundle.agents.map((agent: BundleAgent) => (
                            <span key={agent.slug} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: isPopular ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                color: isPopular ? 'rgba(255,255,255,0.6)' : '#6B7280',
                              }}>
                              {agent.icon} {agent.display_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleSubscribe(bundle)}
                      disabled={loading === bundle.slug}
                      className="mt-5 w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-px disabled:opacity-50"
                      style={{
                        background: isPopular ? '#F5920B' : isEnterprise ? '#2A9D8F' : '#1B2A4A',
                        color: '#fff',
                        boxShadow: isPopular ? '0 4px 16px rgba(245,146,11,0.3)' : 'none',
                      }}
                    >
                      {loading === bundle.slug ? 'Loading...' : meta.cta}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* FAQ */}
      <section className="py-16 px-6" style={{ background: '#fff' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-10" style={{ color: '#1B2A4A' }}>
            Frequently Asked Questions
          </h2>
          {[
            { q: 'What are AI Employees?', a: 'AI Employees are intelligent agents that handle real business tasks — from financial analysis and collections to sales outreach and warehouse operations. They connect to your existing tools and work 24/7.' },
            { q: 'Can I switch plans later?', a: 'Absolutely. Upgrade or downgrade anytime. When you upgrade, you only pay the prorated difference. When you downgrade, credit is applied to your next billing cycle.' },
            { q: 'How do integrations work?', a: 'After subscribing, our onboarding wizard helps you connect your tools (QuickBooks, HubSpot, Odoo, etc.) in minutes. Your AI Employees start pulling real data immediately.' },
            { q: 'What if I need custom agents?', a: 'Our Enterprise plan includes custom AI Employee development tailored to your specific workflows. Contact our team to discuss your needs.' },
            { q: 'Is there a free trial?', a: 'Yes! Every plan includes a 14-day free trial. No credit card required to explore.' },
            { q: 'How is billing handled?', a: 'We use Stripe for secure billing. Choose monthly or annual billing (save 20% annually). Cancel anytime with no penalties.' },
          ].map(({ q, a }) => (
            <details key={q} className="group border-b border-[#E5E7EB] py-4">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-[#1B2A4A] hover:text-[#F5920B] transition-colors">
                {q}
                <svg className="w-4 h-4 text-[#9CA3AF] group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center" style={{ background: '#1B2A4A' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Hire Your AI Team?</h2>
          <p className="text-white/60 mb-8">Start your 14-day free trial. No credit card required.</p>
          <Link href="/register" className="inline-block text-sm font-bold text-white px-8 py-3.5 rounded-xl transition-all hover:-translate-y-px"
            style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
            Get Started Free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6" style={{ background: '#0f1b33', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="Woulf" width={24} height={24} />
            <span className="text-sm font-bold text-white/60">
              Woulf<span style={{ color: '#F5920B' }}>AI</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/contact" className="text-xs text-white/30 hover:text-white/60 transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-white/20">&copy; 2026 Woulf Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
