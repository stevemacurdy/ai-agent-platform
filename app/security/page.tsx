import Link from 'next/link'
import { Sparkles, ArrowLeft, Shield, Lock, Server, Eye, CheckCircle2, Award } from 'lucide-react'

export default function SecurityPage() {
  const features = [
    { icon: Lock, title: 'End-to-End Encryption', desc: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256)' },
    { icon: Server, title: 'SOC 2 Type II Certified', desc: 'Annual third-party audits verify our security controls' },
    { icon: Eye, title: 'Access Controls', desc: 'Role-based access with multi-factor authentication' },
    { icon: Shield, title: 'DDoS Protection', desc: 'Enterprise-grade protection against attacks' },
  ]

  const certifications = [
    'SOC 2 Type II',
    'GDPR Compliant',
    'CCPA Compliant',
    'ISO 27001',
    'HIPAA Ready',
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">WoulfAI</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Security First</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your data security is our top priority. We implement enterprise-grade security measures 
            to protect your business information.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, i) => (
            <div key={i} className="p-8 bg-white/[0.02] border border-white/10 rounded-xl">
              <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold">Certifications & Compliance</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{cert}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Have Security Questions?</h2>
          <p className="text-gray-400 mb-6">
            Our security team is available to answer any questions about our practices.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
            Contact Security Team
          </Link>
        </div>
      </div>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          © 2026 WoulfAI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
