'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function TermsPage() {
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Terms of Service</h1>
          <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Last updated: March 3, 2026</p>
          <div className="bg-white rounded-xl border p-8 space-y-6" style={{ borderColor: '#E5E7EB' }}>
            {[
              { t: '1. Acceptance of Terms', c: 'By accessing or using WoulfAI, you agree to be bound by these Terms of Service. If you are using WoulfAI on behalf of an organization, you represent that you have authority to bind that organization.' },
              { t: '2. Service Description', c: 'WoulfAI provides AI-powered business intelligence tools ("AI Employees") for warehouse and logistics operations. The service includes data analytics, recommendations, and integrations with third-party business tools.' },
              { t: '3. Account Registration', c: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. Notify us immediately of any unauthorized access.' },
              { t: '4. Subscription & Billing', c: 'Paid plans are billed monthly or annually via Stripe. Prices are listed on our pricing page. We offer a 14-day free trial. You may cancel at any time; access continues until the end of the billing period. Refunds are handled on a case-by-case basis.' },
              { t: '5. Usage Limits', c: 'Each subscription tier includes specific limits on AI actions, team seats, and storage. Usage beyond your tier limits may result in service throttling or overage charges (for eligible plans). Current limits are displayed in your dashboard.' },
              { t: '6. Data Ownership', c: 'You retain ownership of all data you input into WoulfAI. We do not claim ownership of your business data. We use your data solely to provide and improve the service as described in our Privacy Policy.' },
              { t: '7. Acceptable Use', c: 'You agree not to: reverse engineer the service, use it for illegal purposes, attempt to access other customers data, or resell access without authorization. We reserve the right to suspend accounts that violate these terms.' },
              { t: '8. Intellectual Property', c: 'WoulfAI, its AI models, algorithms, and interface designs are the intellectual property of Woulf Group LLC. Your subscription grants a limited, non-exclusive license to use the service.' },
              { t: '9. Limitation of Liability', c: 'WoulfAI is provided "as is." We do not guarantee that AI recommendations will be accurate or complete. Our total liability is limited to the amount you paid in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.' },
              { t: '10. Termination', c: 'Either party may terminate at any time. Upon termination, your access to WoulfAI ceases at the end of the billing period. We will retain your data for 30 days post-termination for export purposes, then delete it.' },
              { t: '11. Governing Law', c: 'These terms are governed by the laws of the State of Utah. Any disputes shall be resolved in the courts of Tooele County, Utah.' },
              { t: '12. Contact', c: 'Questions about these terms: legal@woulfai.com. Woulf Group LLC, Grantsville, UT 84029.' },
            ].map((s, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold mb-1" style={{ color: '#1B2A4A' }}>{s.t}</h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>{s.c}</p>
              </div>
            ))}
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
