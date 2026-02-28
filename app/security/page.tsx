'use client';

import Link from 'next/link';
import Image from 'next/image';

const SECURITY_PRACTICES = [
  {
    icon: '🔐',
    title: 'Authentication & Access',
    items: [
      'Multi-factor authentication support via Supabase Auth',
      'Role-based access control (RBAC) with super_admin, admin, company_admin, and member roles',
      'JWT tokens with short expiry and automatic refresh',
      '24-hour idle session timeout with automatic logout',
      'Forced re-authentication for sensitive operations',
    ],
  },
  {
    icon: '🏢',
    title: 'Tenant Isolation',
    items: [
      'Row-Level Security (RLS) enforced on every database table',
      'Company-scoped data access — users can only see their own company data',
      'Automated tenant isolation test suite validates cross-company boundaries',
      'AI employee data and chat history scoped by company_id',
      'Per-company integration credentials (never shared across tenants)',
    ],
  },
  {
    icon: '🛡️',
    title: 'Infrastructure Security',
    items: [
      'HTTPS enforced on all connections',
      'Content Security Policy (CSP) headers enforced in production',
      'HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers',
      'Rate limiting on authentication and AI employee API endpoints',
      'DDoS protection via Vercel Edge Network',
    ],
  },
  {
    icon: '🔍',
    title: 'Monitoring & Response',
    items: [
      'Real-time error tracking and alerting via Sentry',
      'Audit logging for login, user management, role changes, and data access',
      'Automated dependency vulnerability scanning with Dependabot',
      'Weekly npm audit CI pipeline for known CVEs',
      'Incident response playbook with defined severity levels and SLAs',
    ],
  },
  {
    icon: '💾',
    title: 'Data Protection',
    items: [
      'Data encrypted in transit (TLS 1.3) and at rest',
      'Daily automated database backups with point-in-time recovery',
      'Integration credentials stored in isolated, access-controlled database rows',
      'No sensitive data stored in browser localStorage',
      'Feature flags gate incomplete functionality to prevent data exposure',
    ],
  },
  {
    icon: '🤖',
    title: 'AI Employee Safety',
    items: [
      'All LLM API calls have 30-second timeouts with automatic retry',
      'Exponential backoff prevents cascading failures',
      'AI employee responses scoped to the requesting company\'s data only',
      'No customer data is used to train AI models',
      'Structured error handling prevents information leakage',
    ],
  },
];

const COMPLIANCE_ITEMS = [
  { label: 'SOC 2 Type I', status: 'In Progress', detail: 'Policies documented, controls implemented. Audit engagement planned.' },
  { label: 'GDPR', status: 'Compliant', detail: 'Data processing agreements available. Right to erasure supported.' },
  { label: 'CCPA', status: 'Compliant', detail: 'Consumer data rights supported. No data sold to third parties.' },
  { label: 'Penetration Testing', status: 'Planned', detail: 'Third-party pentest engagement scheduled for Q2 2026.' },
];

export default function SecurityPage() {
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
            <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/case-studies" className="text-sm text-white/60 hover:text-white transition-colors">Case Studies</Link>
            <Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link>
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
      <section className="pt-20 pb-8 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold"
            style={{ background: 'rgba(42,157,143,0.08)', border: '1px solid rgba(42,157,143,0.15)', color: '#2A9D8F' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2A9D8F' }} />
            All systems operational
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: '#1B2A4A' }}>
            Security at WoulfAI
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto">
            Your data is the foundation of your business. We treat its protection as our highest engineering priority — not an afterthought.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <a href="#practices" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-px"
              style={{ background: '#1B2A4A' }}>
              Security Practices
            </a>
            <a href="#compliance" className="px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:-translate-y-px"
              style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}>
              Compliance
            </a>
            <a href="#disclosure" className="px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:-translate-y-px"
              style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}>
              Report a Vulnerability
            </a>
          </div>
        </div>
      </section>

      {/* SECURITY PRACTICES */}
      <section id="practices" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#1B2A4A' }}>How We Protect Your Data</h2>
        <p className="text-gray-500 text-[15px] mb-10">
          Every layer of WoulfAI is built with defense in depth. Here is what that looks like in practice.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {SECURITY_PRACTICES.map((section) => (
            <div key={section.title} className="bg-white rounded-[20px] border border-gray-200/60 p-7 hover:shadow-lg transition-all"
              style={{ boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{section.icon}</span>
                <h3 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>{section.title}</h3>
              </div>
              <ul className="space-y-2.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] text-gray-600">
                    <span className="mt-1 flex-shrink-0" style={{ color: '#2A9D8F' }}>&rsaquo;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#1B2A4A' }}>Architecture Overview</h2>
        <p className="text-gray-500 text-[15px] mb-10">
          WoulfAI runs on a modern, security-first infrastructure stack.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Frontend', value: 'Vercel Edge Network', detail: 'Global CDN, DDoS protection, automatic HTTPS' },
            { label: 'Backend', value: 'Next.js API Routes', detail: 'Serverless functions with per-request isolation' },
            { label: 'Database', value: 'Supabase (PostgreSQL)', detail: 'RLS on every table, encrypted at rest, daily backups' },
            { label: 'Auth', value: 'Supabase Auth', detail: 'JWT-based, short-lived tokens, MFA support' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-gray-200/60 p-5" style={{ boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
              <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400 mb-1">{item.label}</div>
              <div className="text-[14px] font-bold mb-1" style={{ color: '#1B2A4A' }}>{item.value}</div>
              <div className="text-[12px] text-gray-500">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPLIANCE */}
      <section id="compliance" className="py-16 px-6" style={{ background: '#1B2A4A' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white mb-2">Compliance</h2>
          <p className="text-white/50 text-[15px] mb-10">
            We are actively pursuing industry-standard certifications and comply with applicable privacy regulations.
          </p>
          <div className="space-y-3">
            {COMPLIANCE_ITEMS.map((item) => (
              <div key={item.label} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 rounded-2xl px-6 py-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="min-w-[140px]">
                  <span className="text-sm font-bold text-white">{item.label}</span>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                  item.status === 'Compliant' ? 'border-[#2A9D8F]/30' :
                  item.status === 'In Progress' ? 'border-[#F5920B]/30' :
                  'border-white/15'
                }`} style={{
                  background: item.status === 'Compliant' ? 'rgba(42,157,143,0.15)' : item.status === 'In Progress' ? 'rgba(245,146,11,0.15)' : 'rgba(255,255,255,0.06)',
                  color: item.status === 'Compliant' ? '#2A9D8F' : item.status === 'In Progress' ? '#F5920B' : '#fff',
                }}>
                  {item.status}
                </span>
                <span className="text-sm text-white/50">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DATA HANDLING */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#1B2A4A' }}>Data Handling Commitments</h2>
        <p className="text-gray-500 text-[15px] mb-10">
          Clear, non-negotiable principles that govern how we handle your data.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Your data is yours', desc: 'We never sell, share, or use your data for advertising. Full data export available on request.' },
            { title: 'AI model training', desc: 'Your data is never used to train AI models. AI employee responses are generated per-request and not retained for model improvement.' },
            { title: 'Data residency', desc: 'Primary data stored in US-East (AWS us-east-1 via Supabase). Custom residency options available for enterprise.' },
            { title: 'Retention & deletion', desc: 'Data retained only while your account is active. Full deletion within 30 days of account closure, with cryptographic verification.' },
            { title: 'Subprocessors', desc: 'We maintain a vetted list of subprocessors. Changes communicated 30 days in advance. Current: Vercel, Supabase, OpenAI, Anthropic, Stripe, Resend, Sentry.' },
            { title: 'Breach notification', desc: 'In the event of a data breach, affected customers are notified within 72 hours with full details of scope and remediation.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-200/60 p-6" style={{ boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
              <h3 className="text-[15px] font-bold mb-1.5" style={{ color: '#1B2A4A' }}>{item.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RESPONSIBLE DISCLOSURE */}
      <section id="disclosure" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-[20px] border border-gray-200/60 p-8 sm:p-10" style={{ boxShadow: '0 4px 12px rgba(27,42,74,0.06)' }}>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#1B2A4A' }}>Responsible Disclosure</h2>
          <p className="text-gray-500 text-[15px] mb-6">
            We value the security research community and welcome responsible disclosure of vulnerabilities.
          </p>
          <div className="space-y-5 text-[14px] text-gray-600">
            <div>
              <h3 className="font-bold mb-1" style={{ color: '#1B2A4A' }}>Scope</h3>
              <p>All WoulfAI services at <span style={{ color: '#2A9D8F' }}>*.woulfai.com</span> and associated APIs are in scope. Third-party services (Supabase, Vercel, Stripe) are out of scope — report those to the respective vendors.</p>
            </div>
            <div>
              <h3 className="font-bold mb-1" style={{ color: '#1B2A4A' }}>Guidelines</h3>
              <p>Please do not access, modify, or delete data belonging to other users. Avoid denial-of-service attacks. Allow reasonable time for remediation before disclosure (90 days).</p>
            </div>
            <div>
              <h3 className="font-bold mb-1" style={{ color: '#1B2A4A' }}>Reporting</h3>
              <p>
                Send vulnerability reports to{' '}
                <a href="mailto:security@woulfgroup.com" className="font-semibold" style={{ color: '#2A9D8F' }}>
                  security@woulfgroup.com
                </a>
                {' '}with a clear description, steps to reproduce, and potential impact. We will acknowledge receipt within 48 hours and provide a timeline for remediation.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-1" style={{ color: '#1B2A4A' }}>Recognition</h3>
              <p>We are happy to credit researchers who responsibly disclose valid vulnerabilities (with your permission). We do not currently offer monetary bounties but plan to establish a formal program as we grow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="p-10 sm:p-12 rounded-3xl text-center"
          style={{ background: 'linear-gradient(135deg, #132038 0%, #1B2A4A 60%, #233756 100%)' }}>
          <h2 className="text-2xl font-extrabold text-white mb-3">Need More Detail?</h2>
          <p className="text-white/50 text-[15px] mb-8 max-w-lg mx-auto">
            Enterprise customers can request our full security documentation package including SOC 2 policies, penetration test results, data processing agreements, and custom security reviews.
          </p>
          <Link href="/contact"
            className="inline-block px-8 py-3.5 rounded-2xl text-[15px] font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: '#F5920B', boxShadow: '0 8px 32px rgba(245,146,11,0.35)' }}>
            Contact Our Team
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={20} height={20} className="opacity-50" />
            <span className="text-[11px] text-gray-400">&copy; 2026 WoulfAI by Woulf Group</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[11px] text-gray-400 hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="text-[11px] text-gray-400 hover:text-gray-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
