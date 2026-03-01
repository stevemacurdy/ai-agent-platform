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
  agents: BundleAgent[];
  agent_count: number;
}

const TIER_CONFIG: Record<string, { users: string; workspaces: string; features: string[]; cta: string }> = {
  starter: {
    users: '2 Team members',
    workspaces: '1 Company workspace',
    features: ['Email support', 'Basic analytics dashboard', '14-day free trial'],
    cta: 'Start with Starter',
  },
  professional: {
    users: '10 Team members',
    workspaces: '3 Company workspaces',
    features: ['Priority support', 'Advanced analytics', 'API access', 'Custom onboarding session'],
    cta: 'Go Professional',
  },
  enterprise: {
    users: 'Unlimited team members',
    workspaces: 'Unlimited workspaces',
    features: ['Dedicated account manager', 'Full analytics suite', 'API + Webhooks', 'Custom integrations', 'SLA guarantee', 'On-site training available'],
    cta: 'Contact Sales',
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
  const [selectedSuite, setSelectedSuite] = useState<string>('');
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

  // Map bundles to display cards
  const starterBundle = bundles.find(b => b.slug === 'starter-pack');
  const enterpriseBundle = bundles.find(b => b.slug === 'full-platform');
  const suites = bundles.filter(b => b.target_tier === 'professional');

  useEffect(() => {
    if (suites.length > 0 && !selectedSuite) {
      setSelectedSuite(suites[0].slug);
    }
  }, [suites, selectedSuite]);

  const activePro = bundles.find(b => b.slug === selectedSuite) || suites[0];

  const cards = [
    { tier: 'starter', bundle: starterBundle },
    { tier: 'professional', bundle: activePro },
    { tier: 'enterprise', bundle: enterpriseBundle },
  ];

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const handleSubscribe = async (tier: string, bundleSlug?: string) => {
    if (tier === 'enterprise') {
      window.location.href = '/contact?interest=enterprise';
      return;
    }

    setLoading(tier);
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
        body: JSON.stringify({ plan: tier, bundle: bundleSlug, userId: session.user.id, email: session.user.email }),
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
            Choose Your Team Size
          </h1>
          <p className="mt-4 text-[#6B7280] text-lg">
            Hire AI Employees that work for your business. Scale up or down anytime.
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
            <div className="max-w-[1100px] mx-auto grid md:grid-cols-3 gap-6">
              {cards.map(({ tier, bundle }) => {
                const config = TIER_CONFIG[tier];
                const isPopular = tier === 'professional';
                const isEnterprise = tier === 'enterprise';
                const priceCents = bundle ? (annual ? Math.round(bundle.price_annual_cents / 12) : bundle.price_monthly_cents) : 0;

                return (
                  <div
                    key={tier}
                    className={`relative p-10 rounded-3xl border-2 transition-all hover:shadow-xl flex flex-col ${isPopular ? 'lg:scale-[1.03] shadow-xl' : ''}`}
                    style={{
                      background: isPopular ? '#1B2A4A' : '#FFFFFF',
                      borderColor: isPopular ? '#F5920B' : '#E5E7EB',
                      color: isPopular ? '#fff' : '#1A1A2E',
                    }}
                  >
                    {isPopular && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[1.5px] px-3.5 py-1 rounded-full mb-4 self-start"
                        style={{ background: 'rgba(245,146,11,0.15)', color: '#F5920B' }}>
                        Most Popular
                      </span>
                    )}

                    <h2 className="text-[22px] font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {bundle?.display_name || config.cta}
                    </h2>

                    {/* Suite Selector for Professional */}
                    {tier === 'professional' && suites.length > 1 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {suites.map(s => (
                          <button
                            key={s.slug}
                            onClick={() => setSelectedSuite(s.slug)}
                            className="text-[11px] px-2.5 py-1 rounded-full transition-all font-medium"
                            style={{
                              background: selectedSuite === s.slug ? 'rgba(245,146,11,0.2)' : 'rgba(255,255,255,0.08)',
                              color: selectedSuite === s.slug ? '#F5920B' : 'rgba(255,255,255,0.5)',
                              border: selectedSuite === s.slug ? '1px solid rgba(245,146,11,0.3)' : '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            {s.icon} {s.display_name.replace(' Suite', '')}
                          </button>
                        ))}
                      </div>
                    )}

                    {isEnterprise ? (
                      <div className="mt-2">
                        <p className="text-2xl font-bold" style={{ color: '#6B7280' }}>Custom Pricing</p>
                        <p className="text-xs mt-1 text-[#6B7280]">Tailored to your organization</p>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-5xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          ${formatPrice(priceCents)}
                          <span className="text-sm font-normal text-[#6B7280]">/mo</span>
                        </p>
                        {annual && bundle && (
                          <p className="text-xs mt-0.5" style={{ color: '#2A9D8F' }}>
                            ${formatPrice(bundle.price_annual_cents)}/yr · Save {bundle.discount_pct}%
                          </p>
                        )}
                        <p className="text-xs mt-1 text-[#6B7280]">
                          {bundle?.agent_count || 0} employees · {config.workspaces} · {config.users}
                        </p>
                      </div>
                    )}

                    {/* Bundle description */}
                    {bundle?.description && (
                      <p className={`text-xs mt-3 ${isPopular ? 'text-white/50' : 'text-[#9CA3AF]'}`}>
                        {bundle.description}
                      </p>
                    )}

                    {/* Included agents */}
                    {bundle && bundle.agents && bundle.agents.length > 0 && !isEnterprise && (
                      <div className="mt-4">
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isPopular ? 'text-white/40' : 'text-[#9CA3AF]'}`}>
                          Included Employees
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {bundle.agents.map((agent: BundleAgent) => (
                            <span
                              key={agent.slug}
                              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: agent.is_highlighted
                                  ? (isPopular ? 'rgba(245,146,11,0.2)' : 'rgba(42,157,143,0.1)')
                                  : (isPopular ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
                                color: agent.is_highlighted
                                  ? (isPopular ? '#F5920B' : '#2A9D8F')
                                  : (isPopular ? 'rgba(255,255,255,0.6)' : '#6B7280'),
                              }}
                            >
                              {agent.icon} {agent.display_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tier features */}
                    <ul className="mt-6 flex flex-col gap-3 flex-1">
                      {tier === 'starter' && (
                        <li className="flex items-center gap-2.5 text-sm">
                          <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(42,157,143,0.1)' }}>
                            <Check color="#2A9D8F" />
                          </span>
                          <span className="text-[#6B7280]">Pick any 3 AI Employees</span>
                        </li>
                      )}
                      {isEnterprise && (
                        <li className="flex items-center gap-2.5 text-sm">
                          <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(42,157,143,0.1)' }}>
                            <Check color="#2A9D8F" />
                          </span>
                          <span className="text-[#6B7280]">All {enterpriseBundle?.agent_count || 21} AI Employees</span>
                        </li>
                      )}
                      {[config.workspaces, config.users, ...config.features].map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm">
                          <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: isPopular ? 'rgba(245,146,11,0.2)' : 'rgba(42,157,143,0.1)' }}>
                            <Check color={isPopular ? '#F5920B' : '#2A9D8F'} />
                          </span>
                          <span className={isPopular ? 'text-white/75' : 'text-[#6B7280]'}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(tier, bundle?.slug)}
                      disabled={loading !== null && !isEnterprise}
                      className="w-full mt-8 py-3.5 rounded-2xl text-[15px] font-bold transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-wait"
                      style={{
                        background: isPopular ? '#F5920B' : isEnterprise ? '#1B2A4A' : 'transparent',
                        color: isPopular ? '#fff' : isEnterprise ? '#fff' : '#1B2A4A',
                        border: !isPopular && !isEnterprise ? '2px solid #1B2A4A' : 'none',
                        boxShadow: isPopular ? '0 4px 16px rgba(245,146,11,0.3)' : 'none',
                      }}
                    >
                      {loading === tier ? 'Redirecting to Stripe...' : config.cta}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* All Suites Comparison */}
            {suites.length > 1 && (
              <div className="max-w-[1100px] mx-auto mt-16">
                <h3 className="text-2xl font-extrabold text-center mb-8" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
                  Compare Professional Suites
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {suites.map(suite => (
                    <div key={suite.slug} className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg"
                      style={{
                        background: '#fff',
                        borderColor: selectedSuite === suite.slug ? '#F5920B' : '#E5E7EB',
                      }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{suite.icon}</span>
                        <h4 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>{suite.display_name}</h4>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mb-4">{suite.description}</p>
                      <p className="text-2xl font-black mb-3" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
                        ${formatPrice(annual ? Math.round(suite.price_annual_cents / 12) : suite.price_monthly_cents)}
                        <span className="text-xs font-normal text-[#6B7280]">/mo</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {suite.agents?.map((a: BundleAgent) => (
                          <span key={a.slug} className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              background: a.is_highlighted ? 'rgba(42,157,143,0.1)' : 'rgba(0,0,0,0.03)',
                              color: a.is_highlighted ? '#2A9D8F' : '#6B7280',
                            }}>
                            {a.icon} {a.display_name}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setSelectedSuite(suite.slug)}
                        className="w-full mt-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: selectedSuite === suite.slug ? '#F5920B' : 'transparent',
                          color: selectedSuite === suite.slug ? '#fff' : '#1B2A4A',
                          border: selectedSuite === suite.slug ? 'none' : '1.5px solid #E5E7EB',
                        }}
                      >
                        {selectedSuite === suite.slug ? 'Selected' : 'Select Suite'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-10 space-y-1">
          <p className="text-sm text-[#6B7280]">Starter and Professional plans include a 14-day free trial. No credit card required.</p>
          <p className="text-xs text-[#6B7280]">Powered by Stripe · PCI compliant · Cancel anytime</p>
          <p className="text-sm text-[#9CA3AF] mt-4">
            Need something custom? <Link href="/contact" className="font-semibold" style={{ color: '#F5920B' }}>Contact our team</Link>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-[11px] text-[#6B7280]">© 2026 WoulfAI by Woulf Group</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[11px] text-[#6B7280] hover:text-[#1B2A4A]">Privacy</Link>
            <Link href="/terms" className="text-[11px] text-[#6B7280] hover:text-[#1B2A4A]">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
