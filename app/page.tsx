'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* NAV */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(27,42,74,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="WoulfAI" width={32} height={32} />
            <span className="text-lg font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Woulf<span style={{ color: '#F5920B' }}>AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/solutions" className="text-sm text-gray-400 hover:text-white transition-colors">Solutions</Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/case-studies" className="text-sm text-gray-400 hover:text-white transition-colors">Case Studies</Link>
            <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white px-3 py-2">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl" style={{ background: '#F5920B' }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #1B2A4A 0%, #0f1b33 100%)' }}>
        <div className="max-w-5xl mx-auto px-6 py-24 text-center relative z-10">
          <p className="text-xs font-bold uppercase tracking-[4px] mb-4" style={{ color: '#2A9D8F' }}>21 AI Employees. 6 Departments. One Platform.</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Hire AI Employees That<br />
            <span style={{ color: '#F5920B' }}>Actually Work</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
            Replace manual processes with AI-powered specialists for finance, sales, warehouse operations, HR, legal, and strategy. Built by warehouse people who've completed 1,200+ projects.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/register" className="text-sm font-bold text-white px-8 py-3.5 rounded-xl" style={{ background: '#F5920B', boxShadow: '0 4px 24px rgba(245,146,11,0.35)' }}>
              Start 14-Day Free Trial
            </Link>
            <Link href="#agents" className="text-sm font-medium text-white/50 hover:text-white px-6 py-3.5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
              Try a Demo ↓
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 text-white/30 text-xs">
            <span>✓ No credit card required</span>
            <span>✓ 14-day free trial</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="py-16 px-6" style={{ background: '#F4F5F7' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block rounded-2xl p-8 mb-6 bg-white border" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#F5920B' }}>The Math is Simple</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="text-center">
                <p className="text-3xl font-extrabold line-through" style={{ fontFamily: "'Outfit', sans-serif", color: '#DC2626' }}>$4,500<span className="text-sm font-normal">/mo</span></p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Average employee cost</p>
              </div>
              <span className="text-2xl" style={{ color: '#9CA3AF' }}>→</span>
              <div className="text-center">
                <p className="text-3xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2A9D8F' }}>$497<span className="text-sm font-normal">/mo</span></p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>WoulfAI Starter (3 AI Employees)</p>
              </div>
            </div>
            <p className="text-sm mt-4 font-medium" style={{ color: '#2A9D8F' }}>Save up to 89% while getting 24/7 coverage</p>
          </div>
        </div>
      </section>

      {/* CLIENT LOGOS */}
      <section className="py-10 px-6 bg-white border-y" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-wider mb-6" style={{ color: '#9CA3AF' }}>Trusted by industry leaders</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {["Cabela's", "Sportsman's Warehouse", "Frito-Lay"].map(c => (
              <div key={c} className="px-6 py-3 rounded-lg" style={{ background: '#F4F5F7' }}>
                <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>{c}</p>
              </div>
            ))}
            <p className="text-xs" style={{ color: '#9CA3AF' }}>+ 1,200 more projects</p>
          </div>
        </div>
      </section>

      {/* ALL 21 AGENTS */}
      <section id="agents" className="py-20 px-6" style={{ background: '#1B2A4A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#F5920B' }}>Your AI Workforce</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              21 Specialists. Click Any to Try.
            </h2>
            <p className="text-sm text-white/40 mt-3 max-w-xl mx-auto">Each AI Employee has a live demo with real KPIs, data tables, and AI recommendations. No sign-up required.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#9CA3AF' }}>Finance</h3>
                <div className="space-y-2">
                  
                  <a href="/demo/cfo" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">💰</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">CFO</p>
                      <p className="text-[11px] text-white/40 truncate">Financial intelligence</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/collections" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">💳</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Collections</p>
                      <p className="text-[11px] text-white/40 truncate">Automated AR tracking</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/finops" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">📊</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">FinOps</p>
                      <p className="text-[11px] text-white/40 truncate">Budget vs actual tracking</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/payables" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🧾</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Payables</p>
                      <p className="text-[11px] text-white/40 truncate">Invoice processing</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#9CA3AF' }}>Sales</h3>
                <div className="space-y-2">
                  
                  <a href="/demo/sales" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">📈</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Sales Data</p>
                      <p className="text-[11px] text-white/40 truncate">Pipeline analytics</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/sales-intel" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🔍</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Sales Intel</p>
                      <p className="text-[11px] text-white/40 truncate">Prospect research</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/sales-coach" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🏆</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Sales Coach</p>
                      <p className="text-[11px] text-white/40 truncate">Rep performance</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/marketing" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">📣</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Marketing</p>
                      <p className="text-[11px] text-white/40 truncate">Campaign analytics</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/seo" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🔎</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">SEO</p>
                      <p className="text-[11px] text-white/40 truncate">Keyword rankings</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#9CA3AF' }}>Operations</h3>
                <div className="space-y-2">
                  
                  <a href="/demo/warehouse" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🏭</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Warehouse</p>
                      <p className="text-[11px] text-white/40 truncate">Inventory management</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/supply-chain" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🔗</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Supply Chain</p>
                      <p className="text-[11px] text-white/40 truncate">Vendor performance</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/wms" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">📦</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">WMS</p>
                      <p className="text-[11px] text-white/40 truncate">Pick accuracy</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/operations" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">⚙</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Operations</p>
                      <p className="text-[11px] text-white/40 truncate">Project management</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#9CA3AF' }}>People</h3>
                <div className="space-y-2">
                  
                  <a href="/demo/hr" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">👥</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">HR</p>
                      <p className="text-[11px] text-white/40 truncate">Hiring pipeline</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/support" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🎧</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Support</p>
                      <p className="text-[11px] text-white/40 truncate">Ticket management</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/training" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🎓</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Training</p>
                      <p className="text-[11px] text-white/40 truncate">Course management</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#9CA3AF' }}>Legal</h3>
                <div className="space-y-2">
                  
                  <a href="/demo/legal" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">⚖</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Legal</p>
                      <p className="text-[11px] text-white/40 truncate">Contract management</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/compliance" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🛡</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Compliance</p>
                      <p className="text-[11px] text-white/40 truncate">Regulatory tracking</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#9CA3AF' }}>Strategy</h3>
                <div className="space-y-2">
                  
                  <a href="/demo/research" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🔬</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Research</p>
                      <p className="text-[11px] text-white/40 truncate">Market analysis</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/org-lead" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🧭</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">Org Lead</p>
                      <p className="text-[11px] text-white/40 truncate">OKR tracking</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                  <a href="/demo/str" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xl">🏠</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">STR Analyst</p>
                      <p className="text-[11px] text-white/40 truncate">Short-term rental analytics</p>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-orange-400 transition-colors">Try Demo →</span>
                  </a>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* CASE STUDIES PREVIEW */}
      <section className="py-20 px-6" style={{ background: '#F4F5F7' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[3px] mb-3 text-center" style={{ color: '#2A9D8F' }}>Case Studies</p>
          <h2 className="text-3xl font-extrabold text-center mb-10" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
            Real Results from Real Projects
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { slug: 'cabelas-distribution', client: "Cabela's", title: 'Distribution Center Expansion', metric: '40% throughput increase' },
              { slug: 'sportsmans-automation', client: "Sportsman's Warehouse", title: 'Automation Retrofit', metric: '3x faster fulfillment' },
              { slug: 'frito-lay-optimization', client: 'Frito-Lay', title: 'Distribution Optimization', metric: '25% fewer stockouts' },
            ].map(c => (
              <Link key={c.slug} href={`/case-studies/${c.slug}`} className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#F5920B' }}>{c.client}</p>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>{c.title}</h3>
                <p className="text-lg font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2A9D8F' }}>{c.metric}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/case-studies" className="text-sm font-medium" style={{ color: '#F5920B' }}>View All Case Studies →</Link>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#F5920B' }}>Pricing</p>
          <h2 className="text-3xl font-extrabold mb-10" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'Starter', price: '$497', agents: '3 AI Employees', actions: '500 actions/mo' },
              { name: 'Growth', price: '$1,497', agents: '10 AI Employees', actions: '2,000 actions/mo', popular: true },
              { name: 'Professional', price: '$2,997', agents: 'All 21 AI Employees', actions: '10,000 actions/mo' },
              { name: 'Enterprise', price: 'Custom', agents: 'All + Custom', actions: 'Unlimited' },
            ].map(t => (
              <div key={t.name} className={`rounded-xl border p-6 ${t.popular ? 'ring-2' : ''}`}
                style={{ borderColor: t.popular ? '#F5920B' : '#E5E7EB', ...(t.popular ? { boxShadow: '0 8px 32px rgba(245,146,11,0.12)' } : {}) }}>
                {t.popular && <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#F5920B' }}>Most Popular</p>}
                <p className="text-sm font-bold mb-1" style={{ color: '#1B2A4A' }}>{t.name}</p>
                <p className="text-2xl font-extrabold mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
                  {t.price}<span className="text-xs font-normal text-gray-400">{t.price !== 'Custom' ? '/mo' : ''}</span>
                </p>
                <p className="text-xs mb-1" style={{ color: '#6B7280' }}>{t.agents}</p>
                <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>{t.actions}</p>
                <Link href={t.name === 'Enterprise' ? '/contact?interest=enterprise' : '/pricing'}
                  className="block text-center text-xs font-bold py-2.5 rounded-lg"
                  style={t.popular ? { background: '#F5920B', color: 'white' } : { border: '1px solid #E5E7EB', color: '#1B2A4A' }}>
                  {t.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/pricing" className="text-sm font-medium" style={{ color: '#F5920B' }}>Compare All Features →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" style={{ background: '#F4F5F7' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-10" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[{"q":"What are AI Employees?","a":"AI Employees are specialized AI agents that handle specific business functions — like a CFO that analyzes cash flow, or a WMS agent that optimizes pick accuracy. They work 24/7, learn from your data, and deliver actionable recommendations."},{"q":"Do I need to install anything?","a":"No. WoulfAI is a cloud-based platform. Sign up, connect your business tools (QuickBooks, HubSpot, etc.), and your AI Employees start working immediately."},{"q":"How does the free trial work?","a":"You get 14 days of full access to your selected tier — no credit card required to start. If you choose not to continue, your account is simply paused."},{"q":"Can I change my plan later?","a":"Yes. Upgrade or downgrade anytime from your billing settings. Changes take effect at the start of your next billing cycle."},{"q":"Is my data secure?","a":"Absolutely. We use Supabase with row-level security, TLS 1.3 encryption, and Stripe for PCI-compliant payment processing. We never sell your data."},{"q":"What integrations do you support?","a":"We support 200+ integrations via Unified.to including QuickBooks, Xero, HubSpot, Salesforce, Odoo, Slack, BambooHR, Zendesk, and more."},{"q":"How is this different from ChatGPT?","a":"ChatGPT is a general conversational AI. WoulfAI provides 21 purpose-built AI agents with domain expertise in warehouse, logistics, finance, and operations — connected to your actual business data."},{"q":"Do you offer enterprise plans?","a":"Yes. Enterprise plans include unlimited AI actions, SSO, custom integrations, dedicated support, and SLA guarantees. Contact us for pricing."}].map((faq: { q: string; a: string }, i: number) => (
              <div key={i} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{faq.q}</span>
                  <span className="text-lg ml-4" style={{ color: '#9CA3AF' }}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm" style={{ color: '#6B7280' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6" style={{ background: '#1B2A4A' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ready to Hire Your AI Team?
          </h2>
          <p className="text-white/50 mb-8">Start your 14-day free trial. No credit card required.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="text-sm font-bold text-white px-10 py-3.5 rounded-xl" style={{ background: '#F5920B', boxShadow: '0 4px 24px rgba(245,146,11,0.35)' }}>
              Start Free Trial
            </Link>
            <Link href="/contact?interest=demo" className="text-sm font-medium text-white/50 hover:text-white px-6 py-3.5 border border-white/10 rounded-xl">
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6" style={{ background: '#0f1b33', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Product</p>
              <div className="space-y-2">
                <Link href="/solutions" className="block text-sm text-white/50 hover:text-white/80">Solutions</Link>
                <Link href="/pricing" className="block text-sm text-white/50 hover:text-white/80">Pricing</Link>
                <Link href="/case-studies" className="block text-sm text-white/50 hover:text-white/80">Case Studies</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Company</p>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-white/50 hover:text-white/80">About</Link>
                <Link href="/contact" className="block text-sm text-white/50 hover:text-white/80">Contact</Link>
                <Link href="/security" className="block text-sm text-white/50 hover:text-white/80">Security</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Legal</p>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-sm text-white/50 hover:text-white/80">Privacy Policy</Link>
                <Link href="/terms" className="block text-sm text-white/50 hover:text-white/80">Terms of Service</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Get Started</p>
              <div className="space-y-2">
                <Link href="/register" className="block text-sm text-white/50 hover:text-white/80">Create Account</Link>
                <Link href="/login" className="block text-sm text-white/50 hover:text-white/80">Sign In</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Image src="/woulf-badge.png" alt="Woulf" width={20} height={20} />
              <span className="text-xs font-bold text-white/40">WoulfAI by Woulf Group</span>
            </div>
            <p className="text-xs text-white/20">&copy; 2026 Woulf Group LLC. Grantsville, UT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
