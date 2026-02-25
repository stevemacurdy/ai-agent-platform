'use client'
import Link from 'next/link'

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
      'Agent data and chat history scoped by company_id',
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
      'Rate limiting on authentication and agent API endpoints',
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
    title: 'AI Agent Safety',
    items: [
      'All LLM API calls have 30-second timeouts with automatic retry',
      'Exponential backoff prevents cascading failures',
      'Agent responses scoped to the requesting company\'s data only',
      'No customer data is used to train AI models',
      'Structured error handling prevents information leakage',
    ],
  },
]

const COMPLIANCE_ITEMS = [
  { label: 'SOC 2 Type I', status: 'In Progress', detail: 'Policies documented, controls implemented. Audit engagement planned.' },
  { label: 'GDPR', status: 'Compliant', detail: 'Data processing agreements available. Right to erasure supported.' },
  { label: 'CCPA', status: 'Compliant', detail: 'Consumer data rights supported. No data sold to third parties.' },
  { label: 'Penetration Testing', status: 'Planned', detail: 'Third-party pentest engagement scheduled for Q2 2026.' },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#06080D] text-white">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            All systems operational
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Security at WoulfAI
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Your data is the foundation of your business. We treat its protection as our
            highest engineering priority — not an afterthought.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#practices" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all">
              Security Practices
            </a>
            <a href="#compliance" className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/10 transition-all">
              Compliance
            </a>
            <a href="#disclosure" className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/10 transition-all">
              Report a Vulnerability
            </a>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section id="practices" className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold mb-2">How We Protect Your Data</h2>
        <p className="text-gray-400 text-sm mb-10">
          Every layer of WoulfAI is built with defense in depth. Here is what that looks like in practice.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {SECURITY_PRACTICES.map((section) => (
            <div
              key={section.title}
              className="bg-[#0D1117] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{section.icon}</span>
                <h3 className="text-lg font-semibold">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-blue-400 mt-1 shrink-0">{'›'}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold mb-2">Architecture Overview</h2>
        <p className="text-gray-400 text-sm mb-10">
          WoulfAI runs on a modern, security-first infrastructure stack.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Frontend', value: 'Vercel Edge Network', detail: 'Global CDN, DDoS protection, automatic HTTPS' },
            { label: 'Backend', value: 'Next.js API Routes', detail: 'Serverless functions with per-request isolation' },
            { label: 'Database', value: 'Supabase (PostgreSQL)', detail: 'RLS on every table, encrypted at rest, daily backups' },
            { label: 'Auth', value: 'Supabase Auth', detail: 'JWT-based, short-lived tokens, MFA support' },
          ].map((item) => (
            <div key={item.label} className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
              <div className="text-sm font-semibold text-white mb-1">{item.value}</div>
              <div className="text-xs text-gray-500">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold mb-2">Compliance</h2>
        <p className="text-gray-400 text-sm mb-10">
          We are actively pursuing industry-standard certifications and comply with applicable privacy regulations.
        </p>
        <div className="space-y-3">
          {COMPLIANCE_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-4 bg-[#0D1117] border border-white/5 rounded-xl px-6 py-4">
              <div className="min-w-[140px]">
                <span className="text-sm font-semibold text-white">{item.label}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${
                item.status === 'Compliant' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                item.status === 'In Progress' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                'text-blue-400 bg-blue-500/10 border-blue-500/20'
              }`}>
                {item.status}
              </span>
              <span className="text-sm text-gray-400">{item.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Data Handling */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold mb-2">Data Handling Commitments</h2>
        <p className="text-gray-400 text-sm mb-10">
          Clear, non-negotiable principles that govern how we handle your data.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Your data is yours', desc: 'We never sell, share, or use your data for advertising. Full data export available on request.' },
            { title: 'AI model training', desc: 'Your data is never used to train AI models. Agent responses are generated per-request and not retained for model improvement.' },
            { title: 'Data residency', desc: 'Primary data stored in US-East (AWS us-east-1 via Supabase). Custom residency options available for enterprise.' },
            { title: 'Retention & deletion', desc: 'Data retained only while your account is active. Full deletion within 30 days of account closure, with cryptographic verification.' },
            { title: 'Subprocessors', desc: 'We maintain a vetted list of subprocessors. Changes communicated 30 days in advance. Current: Vercel, Supabase, OpenAI, Anthropic, Stripe, Resend, Sentry.' },
            { title: 'Breach notification', desc: 'In the event of a data breach, affected customers are notified within 72 hours with full details of scope and remediation.' },
          ].map((item) => (
            <div key={item.title} className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section id="disclosure" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">Responsible Disclosure</h2>
          <p className="text-gray-400 text-sm mb-6">
            We value the security research community and welcome responsible disclosure of vulnerabilities.
          </p>
          <div className="space-y-4 text-sm text-gray-400">
            <div>
              <h3 className="text-white font-semibold mb-1">Scope</h3>
              <p>All WoulfAI services at <span className="text-blue-400">*.woulfai.com</span> and associated APIs are in scope. Third-party services (Supabase, Vercel, Stripe) are out of scope — report those to the respective vendors.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Guidelines</h3>
              <p>Please do not access, modify, or delete data belonging to other users. Avoid denial-of-service attacks. Allow reasonable time for remediation before disclosure (90 days).</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Reporting</h3>
              <p>
                Send vulnerability reports to{' '}
                <a href="mailto:security@woulfgroup.com" className="text-blue-400 hover:underline">
                  security@woulfgroup.com
                </a>
                {' '}with a clear description, steps to reproduce, and potential impact. We will acknowledge receipt within 48 hours and provide a timeline for remediation.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Recognition</h3>
              <p>We are happy to credit researchers who responsibly disclose valid vulnerabilities (with your permission). We do not currently offer monetary bounties but plan to establish a formal program as we grow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Need More Detail?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            Enterprise customers can request our full security documentation package including SOC 2 policies,
            penetration test results, data processing agreements, and custom security reviews.
          </p>
          <Link href="/contact" className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all">
            Contact Our Team
          </Link>
        </div>
      </section>

    </div>
  )
}
