'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

/* ═══════════════════════════════════════════════════════════
   WoulfAI Landing Page — Branded Design System
   Navy #1B2A4A · Teal #2A9D8F · Orange #F5920B
   BG #F4F5F7 · Surface #FFFFFF · Text #1A1A2E
   Language: "AI Employees" — never "agents", "bots", "tools"
   ═══════════════════════════════════════════════════════════ */

const EMPLOYEES = [
  { name: 'AI Financial Employee', icon: '💰', cat: 'Finance', desc: 'Financial intelligence, cash flow management, and automated reporting across all your accounts.' },
  { name: 'AI WMS Employee', icon: '🏭', cat: 'Operations', desc: 'Warehouse management, inventory tracking, and real-time operational intelligence with live data.' },
  { name: 'AI Sales Employee', icon: '🎯', cat: 'Revenue', desc: 'Pipeline intelligence, deal coaching, and competitive insights to close more business faster.' },
  { name: 'AI Marketing Employee', icon: '📢', cat: 'Revenue', desc: 'Campaign strategy, content generation, SEO optimization, and performance analytics.' },
  { name: 'AI Operations Employee', icon: '⚙️', cat: 'Operations', desc: 'Order fulfillment, logistics optimization, and daily operations management at scale.' },
  { name: 'AI HR Employee', icon: '👥', cat: 'People', desc: 'Employee management, compliance tracking, policy assistance, and workforce analytics.' },
];

const STATS = [
  { value: '21', label: 'AI Employees', sub: 'Purpose-built for your business', featured: true },
  { value: '1,200+', label: 'Projects', sub: '4M+ sq ft integrated', featured: false },
  { value: '6', label: 'Countries', sub: 'Global operations', featured: false },
  { value: '24/7', label: 'Always On', sub: 'Zero downtime', featured: false },
];

const FEATURES = [
  { icon: '🛡️', title: 'Enterprise Security', desc: 'SOC 2 ready infrastructure with row-level tenant isolation, encrypted data, and role-based access controls.' },
  { icon: '⚡', title: 'Instant Onboarding', desc: 'Go from signup to production in minutes. No complex setup, lengthy onboarding, or consultants required.' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'Track employee performance, ROI, and operational metrics from a unified dashboard with live data feeds.' },
  { icon: '🔗', title: 'Deep Integrations', desc: 'Connect with QuickBooks, HubSpot, NetSuite, and your existing ERP — your AI employees work with your tools.' },
  { icon: '🏢', title: 'Multi-Tenant Ready', desc: 'Built for organizations managing multiple brands, locations, or client accounts with total data isolation.' },
  { icon: '🧠', title: 'Continuous Learning', desc: 'Your AI employees improve over time, adapting to your business patterns, preferences, and industry specifics.' },
];

const STEPS = [
  { num: 1, title: 'Sign Up', desc: 'Create your secure workspace in under 60 seconds.', active: false },
  { num: 2, title: 'Choose Your Team', desc: 'Select the AI employees your business needs from 21 roles.', active: false },
  { num: 3, title: 'Connect Tools', desc: 'Link your existing systems — ERP, CRM, accounting, email.', active: false },
  { num: 4, title: 'Go Live', desc: 'Your AI employees start working immediately, learning and improving daily.', active: true },
];

const DEFAULT_TIERS = [
  { name: 'Starter', price: '$499', desc: 'A small team to get started', features: ['3 AI Employees', '2 Seats', 'Basic analytics', 'Email support'], featured: false },
  { name: 'Full Platform', price: '$3,499', desc: 'All 21 AI employees with priority support', features: ['All 21 AI Employees', 'Unlimited Seats', 'Advanced analytics', 'Priority support', 'Custom integrations'], featured: true },
  { name: 'Enterprise', price: null, desc: 'Custom AI solutions with unified command center', features: ['Custom AI Solutions', 'Unified Business Dashboard', 'Cross-system Integration', 'Dedicated Success Manager', 'SLA Guarantee', 'White-glove Onboarding'], featured: false },
];

const NAV_LINKS = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const Check = ({ color = '#2A9D8F' }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill={color}><path d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1z" /></svg>
);

const Star = () => (
  <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1L10 5.5L15 6.5L11.5 10L12.5 15L8 12.5L3.5 15L4.5 10L1 6.5L6 5.5L8 1Z" fill="#2A9D8F" /></svg>
);

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {    const fetchBundles = async () => {      try {        const sb = getSupabaseBrowser();        const { data } = await sb.from('agent_bundles' as any).select('slug,display_name,description,price_monthly_cents,is_featured,target_tier').eq('is_active', true).order('display_order') as any;        if (data && data.length > 0) {          const mapped = data.map((b: any) => ({            name: b.display_name,            price: b.target_tier === 'enterprise' ? null : '$' + (b.price_monthly_cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 }),            desc: b.description,            features: DEFAULT_TIERS.find((t: any) => t.name === b.display_name)?.features || [],            featured: b.is_featured,          }));          if (mapped.length > 0) setTiers(mapped);        }      } catch {}    };    fetchBundles();  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#F4F5F7', color: '#1A1A2E' }}>

      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <style>{`
        h1, h2, h3, h4 { font-family: 'Outfit', 'DM Sans', sans-serif; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(27,42,74,0.97)' : 'rgba(27,42,74,0.92)',
          backdropFilter: 'blur(16px) saturate(1.6)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        <div className={`max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between transition-all ${scrolled ? 'h-[60px]' : 'h-[72px]'}`}>
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={42} height={42} className="drop-shadow-lg group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[22px] font-extrabold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Woulf<span style={{ color: '#F5920B' }}>AI</span>
              </span>
              <span className="hidden sm:block text-[9px] text-white/35 uppercase tracking-[2.5px] -mt-0.5">by Woulf Group</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-white/65 hover:text-[#1B2A4A] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/65 hover:text-[#1B2A4A] px-4 py-2 rounded-xl hover:bg-white/[0.08] transition-all">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold text-white px-6 py-2.5 rounded-xl transition-all hover:-translate-y-px"
              style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}
            >
              Hire Your AI Team
            </Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden text-white p-2">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenu ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {mobileMenu && (
          <div className="lg:hidden px-6 pb-4 space-y-2" style={{ background: 'rgba(27,42,74,0.98)' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="block text-[#4B5563] hover:text-[#1B2A4A] text-sm py-2" onClick={() => setMobileMenu(false)}>
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-3">
              <Link href="/login" className="text-sm text-[#6B7280] px-4 py-2">Sign In</Link>
              <Link href="/register" className="text-sm font-bold text-white px-5 py-2 rounded-xl" style={{ background: '#F5920B' }}>Hire Your AI Team</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 overflow-hidden" style={{ background: 'linear-gradient(165deg, #132038 0%, #1B2A4A 40%, #233756 100%)' }}>
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L46.2 13.8L60 20L46.2 26.2L40 40L33.8 26.2L20 20L33.8 13.8L40 0z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")` }} />
        <div className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(42,157,143,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,146,11,0.06) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-px left-0 right-0 h-24" style={{ background: '#F4F5F7', clipPath: 'polygon(0 40%, 100% 0%, 100% 100%, 0% 100%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(42,157,143,0.12)', color: '#3BB5A6', border: '1px solid rgba(42,157,143,0.25)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#2A9D8F', animation: 'pulse-dot 2s infinite' }} />
              21 AI Employees Ready to Hire
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white leading-[1.08] tracking-tight">
              AI Employees That<br />
              <span style={{ color: '#F5920B' }}>Run Your Business</span>
            </h1>

            <p className="mt-6 text-lg text-white/55 max-w-lg leading-relaxed">
              Hire purpose-built AI employees for warehouse operations, finance, sales, and more.
              Each one integrates with your tools and works 24/7 — built by the warehouse experts at Woulf Group.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="px-9 py-4 rounded-2xl text-[15px] font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: '#F5920B', boxShadow: '0 8px 32px rgba(245,146,11,0.35)' }}
              >
                Hire Your First AI Employee
              </Link>
              <Link
                href="/demo/marketing"
                className="px-9 py-4 rounded-2xl text-[15px] font-semibold text-white border border-white/15 hover:bg-white/[0.08] transition-all"
              >
                ▶ Watch Demo
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              {['SOC 2 Ready', 'Tenant Isolated', 'Enterprise Grade'].map(b => (
                <div key={b} className="flex items-center gap-2">
                  <Star />
                  <span className="text-xs text-white/45 font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="p-7 rounded-[20px] backdrop-blur-sm border transition-all hover:-translate-y-0.5"
                style={{
                  background: s.featured ? 'rgba(245,146,11,0.06)' : 'rgba(255,255,255,0.05)',
                  borderColor: s.featured ? 'rgba(245,146,11,0.18)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.value}</p>
                <p className="text-sm font-semibold text-white/75 mt-1">{s.label}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI EMPLOYEES ──────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#2A9D8F' }}>Your AI Workforce</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1B2A4A' }}>An AI Employee for Every Department</h2>
            <p className="mt-4 text-[#9CA3AF] max-w-2xl mx-auto">Each AI employee is purpose-built for its role — trained on industry best practices and integrated with your existing tools.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {EMPLOYEES.map((a, i) => (
              <div
                key={i}
                className="group p-7 rounded-[20px] bg-white border border-gray-200/60 hover:border-[#2A9D8F] hover:shadow-xl transition-all duration-300 hover:-translate-y-[3px] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2A9D8F] to-[#3BB5A6] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                <div className="flex items-start gap-4">
                  <span className="text-[32px]">{a.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold" style={{ color: '#1B2A4A' }}>{a.name}</h3>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(42,157,143,0.08)', color: '#2A9D8F' }}>{a.cat}</span>
                    </div>
                    <p className="text-[13px] text-[#9CA3AF] mt-2 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/agents" className="inline-flex items-center gap-1.5 text-sm font-bold hover:gap-2.5 transition-all" style={{ color: '#F5920B' }}>
              Meet all 21 AI Employees →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES (dark) ────────────────────────────── */}
      <section className="py-24 px-6 sm:px-8" style={{ background: '#1B2A4A' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#F5920B' }}>Built Different</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">30+ Years of Warehouse Expertise, Now AI-Powered</h2>
            <p className="mt-4 text-[#6B7280] max-w-2xl mx-auto">We don&apos;t just build software — we&apos;ve integrated over 1,200 warehouse systems across six countries.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-8 rounded-[20px] border border-white/[0.08] hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-0.5 transition-all" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-[28px]">{f.icon}</span>
                <h3 className="mt-4 text-[17px] font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-[13px] text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="py-24 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#2A9D8F' }}>Simple Setup</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1B2A4A' }}>Up and Running in Minutes</h2>
            <p className="mt-4 text-[#9CA3AF] max-w-xl mx-auto">No consultants, no months of implementation. Hire your AI employees and put them to work today.</p>
          </div>

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-0.5 opacity-25" style={{ background: 'linear-gradient(90deg, #2A9D8F, #F5920B)' }} />

            {STEPS.map((s) => (
              <div key={s.num} className="text-center relative z-10">
                <div
                  className="w-[72px] h-[72px] rounded-full mx-auto mb-5 flex items-center justify-center text-[28px] font-extrabold text-white border-[3px]"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: s.active ? 'linear-gradient(135deg, #F5920B 0%, #FFa72e 100%)' : 'linear-gradient(135deg, #1B2A4A 0%, #233756 100%)',
                    borderColor: s.active ? 'rgba(245,146,11,0.3)' : '#E5E7EB',
                    boxShadow: '0 4px 12px rgba(27,42,74,0.08)',
                  }}
                >
                  {s.num}
                </div>
                <h3 className="text-base font-bold mb-1.5" style={{ color: '#1B2A4A' }}>{s.title}</h3>
                <p className="text-[13px] text-[#9CA3AF] max-w-[220px] mx-auto leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-8" style={{ background: '#FAFBFC' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#2A9D8F' }}>Simple Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1B2A4A' }}>Choose Your Team Size</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
            {tiers.map((t, i) => (
              <div
                key={i}
                className={`p-10 rounded-3xl border-2 transition-all hover:shadow-xl ${t.featured ? 'lg:scale-[1.03] shadow-xl' : ''}`}
                style={{
                  background: t.featured ? '#1B2A4A' : '#FFFFFF',
                  borderColor: t.featured ? '#F5920B' : '#E5E7EB',
                  color: t.featured ? '#fff' : '#1A1A2E',
                }}
              >
                {t.featured && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[1.5px] px-3.5 py-1 rounded-full mb-4" style={{ background: 'rgba(245,146,11,0.15)', color: '#F5920B' }}>
                    Most Popular
                  </span>
                )}
                <h3 className="text-[22px] font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: t.featured ? '#fff' : '#1B2A4A' }}>{t.name}</h3>
                <p className={`text-[13px] mt-1 ${t.featured ? 'text-white/60' : 'text-[#9CA3AF]'}`}>{t.desc}</p>
                <p className="text-5xl font-black mt-5 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {t.price ? (
                  <>{t.price}<span className={`text-sm font-normal ${t.featured ? 'text-[#6B7280]' : 'text-[#6B7280]'}`}>/mo</span></>
                ) : (
                  <span className="text-3xl">Contact Sales</span>
                )}
                </p>

                <ul className="mt-7 flex flex-col gap-3.5">
                  {t.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: t.featured ? 'rgba(245,146,11,0.2)' : 'rgba(42,157,143,0.1)' }}>
                        <Check color={t.featured ? '#F5920B' : '#2A9D8F'} />
                      </span>
                      <span className={t.featured ? 'text-white/75' : 'text-[#6B7280]'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={t.featured ? '/register' : !t.price ? '/contact' : '/pricing'}
                  className="block text-center mt-8 py-3.5 rounded-2xl text-[15px] font-bold transition-all hover:-translate-y-px"
                  style={{
                    background: t.featured ? '#F5920B' : !t.price ? '#1B2A4A' : 'transparent',
                    color: t.featured || !t.price ? '#fff' : '#1B2A4A',
                    border: t.featured || !t.price ? 'none' : '2px solid #1B2A4A',
                    boxShadow: t.featured ? '0 4px 16px rgba(245,146,11,0.3)' : 'none',
                  }}
                >
                  {t.featured ? 'Start Free Trial' : !t.price ? 'Contact Sales' : 'View Details'}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-[#6B7280] mt-8">
            Need something custom? <Link href="/contact" className="font-semibold" style={{ color: '#F5920B' }}>Contact our team</Link>
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-8">
        <div className="max-w-[1100px] mx-auto p-12 sm:p-[72px] rounded-3xl text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #132038 0%, #1B2A4A 60%, #233756 100%)' }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L35 10L45 15L35 20L30 30L25 20L15 15L25 10L30 0z' fill='%23F5920B' fill-opacity='1'/%3E%3C/svg%3E")` }} />
          <div className="relative z-10">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={64} height={64} className="mx-auto mb-7 drop-shadow-xl" style={{ animation: 'float 4s ease-in-out infinite' }} />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Build<br />Your AI Team?
            </h2>
            <p className="mt-4 text-[#6B7280] max-w-lg mx-auto leading-relaxed">
              Join forward-thinking companies using WoulfAI to hire AI employees that automate, optimize, and scale their warehouse and business operations.
            </p>
            <div className="mt-9 flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="px-9 py-4 rounded-2xl text-[15px] font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: '#F5920B', boxShadow: '0 8px 32px rgba(245,146,11,0.35)' }}>
                Hire Your First AI Employee
              </Link>
              <Link href="/contact" className="px-9 py-4 rounded-2xl text-[15px] font-semibold text-white border border-white/15 hover:bg-white/[0.08] transition-all">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="py-16 px-6 sm:px-8" style={{ background: '#132038', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image src="/woulf-badge.png" alt="Woulf Group" width={36} height={36} className="drop-shadow-lg" />
              <span className="text-xl font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Woulf<span style={{ color: '#F5920B' }}>AI</span></span>
            </div>
            <p className="text-[13px] text-white/35 leading-relaxed">
              AI employees built by Woulf Group. Warehouse systems integration meets artificial intelligence.
            </p>
            <p className="text-[11px] text-[#9CA3AF] mt-2">Grantsville, UT · woulfgroup.com</p>
          </div>

          {[
            { title: 'Product', links: [{ href: '/agents', label: 'All AI Employees' }, { href: '/pricing', label: 'Pricing' }, { href: '/solutions', label: 'Solutions' }, { href: '/demo/marketing', label: 'Demos' }, { href: '/warehouse', label: 'Warehouse Portal' }] },
            { title: 'Company', links: [{ href: '/about', label: 'About' }, { href: '/case-studies', label: 'Case Studies' }, { href: '/contact', label: 'Contact' }, { href: 'https://woulfgroup.com', label: 'Woulf Group' }] },
            { title: 'Legal', links: [{ href: '/terms', label: 'Terms of Service' }, { href: '/privacy', label: 'Privacy Policy' }, { href: '/security', label: 'Security' }] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold text-[#4B5563] mb-4 uppercase tracking-wider">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] text-[#6B7280] hover:text-[#4B5563] transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#9CA3AF]">© 2026 WoulfAI by Woulf Group. All rights reserved.</p>
          <p className="text-[11px] text-white/15">21 AI Employees working · Built in Grantsville, UT</p>
        </div>
      </footer>
    </div>
  );
}
