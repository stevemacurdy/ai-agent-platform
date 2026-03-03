'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Privacy Policy</h1>
          <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Last updated: March 3, 2026</p>
          <div className="bg-white rounded-xl border p-8 space-y-6" style={{ borderColor: '#E5E7EB' }}>
            {[
              { t: '1. Information We Collect', c: 'We collect information you provide directly: name, email, company name, and payment information (processed by Stripe). We also collect usage data including which AI Employees you use, feature interactions, and performance metrics to improve our service.' },
              { t: '2. How We Use Your Information', c: 'We use your information to provide and improve WoulfAI services, process payments, send transactional emails (welcome, billing, usage alerts), and communicate product updates. We do not sell your personal information to third parties.' },
              { t: '3. Data Storage & Security', c: 'Your data is stored on Supabase (SOC 2 Type II certified) with encryption at rest (AES-256) and in transit (TLS 1.3). Payment processing is handled by Stripe (PCI DSS Level 1). We implement row-level security to isolate tenant data.' },
              { t: '4. Third-Party Integrations', c: 'When you connect third-party services (QuickBooks, HubSpot, etc.) via Unified.to, we access only the data necessary to power your AI Employees. Connection credentials are encrypted and stored securely. You can disconnect integrations at any time.' },
              { t: '5. Data Retention', c: 'We retain your account data for the duration of your subscription. Usage analytics are retained for 12 months. Upon account deletion, we remove your personal data within 30 days, except where retention is required by law.' },
              { t: '6. Your Rights', c: 'You have the right to access, correct, or delete your personal data. Enterprise customers can request data export. To exercise these rights, contact privacy@woulfai.com or use the in-app settings.' },
              { t: '7. Cookies', c: 'We use essential cookies for authentication and session management. We do not use third-party advertising cookies. Analytics cookies (if any) can be opted out of via browser settings.' },
              { t: '8. Changes to This Policy', c: 'We may update this policy periodically. We will notify you of material changes via email or in-app notification. Continued use of WoulfAI after changes constitutes acceptance.' },
              { t: '9. Contact', c: 'For privacy inquiries: privacy@woulfai.com. Woulf Group LLC, Grantsville, UT 84029.' },
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
