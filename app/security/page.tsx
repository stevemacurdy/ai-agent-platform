'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function SecurityPage() {
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
          <p className="text-xs font-bold uppercase tracking-[3px] mb-3 text-center" style={{ color: '#2A9D8F' }}>Security</p>
          <h1 className="text-4xl font-extrabold mb-8 text-center" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
            Enterprise-Grade Security
          </h1>
          <div className="space-y-6">
            {[
              { title: 'Authentication & Access Control', desc: 'JWT-based authentication via Supabase Auth. Role-based access control with admin, manager, and member roles. All API routes enforce authentication with Bearer token verification.' },
              { title: 'Data Encryption', desc: 'All data encrypted in transit via TLS 1.3. Database encryption at rest via Supabase (AES-256). Sensitive credentials encrypted before storage.' },
              { title: 'Payment Security', desc: 'Stripe handles all payment processing. We never store credit card numbers. Stripe is PCI DSS Level 1 certified — the highest level of certification.' },
              { title: 'Infrastructure', desc: 'Hosted on Vercel (SOC 2 Type II). Database on Supabase (SOC 2 Type II). Automatic DDoS protection, rate limiting on all endpoints, and security headers (HSTS, CSP, X-Frame-Options).' },
              { title: 'Row-Level Security', desc: 'Supabase Row-Level Security (RLS) ensures each company can only access their own data. Multi-tenant isolation is enforced at the database level.' },
              { title: 'SOC 2 Preparation', desc: 'Comprehensive audit logging via agent_audit_log table. All data access is tracked. We are actively preparing for SOC 2 Type II certification.' },
              { title: 'Data Handling', desc: 'We follow data minimization principles. Customer data is processed only for the services requested. GDPR-compliant data export and deletion available on Enterprise plans.' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#1B2A4A' }}>{s.title}</h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>{s.desc}</p>
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
