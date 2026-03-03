'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F4F5F7', fontFamily: "'DM Sans', sans-serif" }}>
      
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
        <Link href="/register" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl" style={{ background: '#F5920B' }}>Get Started</Link>
      </div>
    </div>
  </nav>
      
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[3px] mb-3 text-center" style={{ color: '#2A9D8F' }}>Solutions</p>
          <h1 className="text-4xl font-extrabold mb-4 text-center" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
            21 AI Employees Across 6 Departments
          </h1>
          <p className="text-center text-lg mb-12" style={{ color: '#6B7280' }}>
            Each AI Employee is purpose-built for a specific business function. Click any to try a live demo.
          </p>
          <div>
            
            <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-lg font-extrabold mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Finance Department</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                
                <Link href="/demo/cfo" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">💰</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>CFO</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Financial intelligence, cash flow analysis, AR/AP management, and AI-powered recommendations.</p>
                  </div>
                </Link>
                <Link href="/demo/collections" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">💳</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Collections</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Automated AR tracking, aging analysis, follow-up scheduling, and collection optimization.</p>
                  </div>
                </Link>
                <Link href="/demo/finops" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">📊</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>FinOps</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Budget vs actual tracking, financial forecasting, cost optimization, and operational finance.</p>
                  </div>
                </Link>
                <Link href="/demo/payables" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🧾</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Payables</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Invoice processing, payment scheduling, vendor management, and early payment discounts.</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-lg font-extrabold mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Sales Department</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                
                <Link href="/demo/sales" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">📈</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Sales Data</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Pipeline analytics, deal tracking, revenue forecasting, and performance dashboards.</p>
                  </div>
                </Link>
                <Link href="/demo/sales-intel" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🔍</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Sales Intel</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Prospect research, intent signals, competitive intelligence, and lead scoring.</p>
                  </div>
                </Link>
                <Link href="/demo/sales-coach" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🏆</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Sales Coach</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Rep performance, coaching plans, quota analysis, and skills development.</p>
                  </div>
                </Link>
                <Link href="/demo/marketing" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">📣</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Marketing</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Campaign analytics, lead generation, content performance, and marketing ROI.</p>
                  </div>
                </Link>
                <Link href="/demo/seo" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🔎</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>SEO</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Keyword rankings, organic traffic, technical SEO audits, and content optimization.</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-lg font-extrabold mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Operations Department</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                
                <Link href="/demo/warehouse" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🏭</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Warehouse</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Inventory management, order fulfillment, zone optimization, and warehouse KPIs.</p>
                  </div>
                </Link>
                <Link href="/demo/supply-chain" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🔗</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Supply Chain</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Vendor performance, logistics tracking, lead times, and supply risk management.</p>
                  </div>
                </Link>
                <Link href="/demo/wms" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">📦</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>WMS</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Pick accuracy, orders per hour, space utilization, and operations optimization.</p>
                  </div>
                </Link>
                <Link href="/demo/operations" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">⚙</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Operations</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Project management, resource allocation, equipment uptime, and efficiency tracking.</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-lg font-extrabold mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>People Department</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                
                <Link href="/demo/hr" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">👥</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>HR</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Hiring pipeline, retention analytics, employee satisfaction, and workforce planning.</p>
                  </div>
                </Link>
                <Link href="/demo/support" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🎧</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Support</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Ticket management, response times, CSAT scoring, and support optimization.</p>
                  </div>
                </Link>
                <Link href="/demo/training" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🎓</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Training</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Course management, compliance tracking, skill assessments, and learning analytics.</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-lg font-extrabold mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Legal Department</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                
                <Link href="/demo/legal" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">⚖</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Legal</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Contract management, risk assessment, compliance monitoring, and legal automation.</p>
                  </div>
                </Link>
                <Link href="/demo/compliance" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🛡</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Compliance</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Regulatory tracking, audit preparation, policy management, and risk scoring.</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-lg font-extrabold mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Strategy Department</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                
                <Link href="/demo/research" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🔬</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Research</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Market analysis, competitive landscape, industry trends, and strategic insights.</p>
                  </div>
                </Link>
                <Link href="/demo/org-lead" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🧭</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Org Lead</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>OKR tracking, team health, initiative management, and decision velocity.</p>
                  </div>
                </Link>
                <Link href="/demo/str" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border" style={{ borderColor: '#F3F4F6' }}>
                  <span className="text-xl">🏠</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>STR Analyst</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Short-term rental analytics, occupancy optimization, and portfolio performance.</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-sm font-bold text-white px-8 py-3 rounded-xl inline-block" style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>
      
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
          <span className="text-xs font-bold text-white/40">WoulfAI</span>
        </div>
        <p className="text-xs text-white/20">&copy; 2026 Woulf Group LLC. All rights reserved.</p>
      </div>
    </div>
  </footer>
    </div>
  );
}
