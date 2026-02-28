'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Package, TrendingUp, DollarSign, FileText, GraduationCap, Megaphone,
  Headphones, Users, ArrowRight, CheckCircle2, Building2,
  Truck, ShoppingCart, Factory, Stethoscope, Scale,
} from 'lucide-react';

const employees = [
  {
    name: 'AI Financial Employee',
    tagline: 'Financial Clarity, Automated',
    description: 'See your cash position clearly with 13-week forecasts, automated AR/AP, and exception handling.',
    icon: DollarSign,
    href: '/demo/finance-ops',
    color: '#F5920B',
    features: ['13-week cash forecasting', 'Automated AR collections', 'AP approval workflows', 'Bank reconciliation', 'Financial anomaly detection'],
    metrics: { label: 'Cash Visibility', value: '100%' },
  },
  {
    name: 'AI WMS Employee',
    tagline: 'Warehouse Management Reimagined',
    description: 'Transform your warehouse operations with AI-powered inventory management, automated billing, and real-time visibility.',
    icon: Package,
    href: '/demo/wms-proof-billing',
    color: '#2A9D8F',
    features: ['Photo-verified receiving & shipping', 'Automated billing with proof', 'Real-time inventory tracking', 'Barcode/QR scanning integration', 'Odoo & QuickBooks sync'],
    metrics: { label: 'Billing Time Reduction', value: '94%' },
  },
  {
    name: 'AI Sales Employee',
    tagline: 'Your AI Sales Coach',
    description: 'Empower your sales team with pre-call intelligence, real-time coaching, and automated follow-ups.',
    icon: TrendingUp,
    href: '/demo/sales-field',
    color: '#1B2A4A',
    features: ['Pre-call company research', 'Real-time call coaching', 'CRM auto-updates', 'Pipeline forecasting', 'Meeting scheduling'],
    metrics: { label: 'Close Rate Increase', value: '34%' },
  },
  {
    name: 'AI Marketing Employee',
    tagline: 'Campaigns That Convert',
    description: 'Launch, test, and optimize marketing campaigns with AI-powered content and real-time analytics.',
    icon: Megaphone,
    href: '/demo/marketing',
    color: '#F5920B',
    features: ['AI content generation', 'A/B split testing', 'Multi-channel campaigns', 'Brand asset management', 'ROAS optimization'],
    metrics: { label: 'ROAS Improvement', value: '5.2x' },
  },
  {
    name: 'AI Support Employee',
    tagline: '24/7 Customer Excellence',
    description: 'Handle customer inquiries around the clock with intelligent routing, live chat, and ticket management.',
    icon: Headphones,
    href: '/demo/customer-support',
    color: '#2A9D8F',
    features: ['AI phone answering', 'Intelligent call routing', 'Live chat automation', 'Product knowledge base', 'Escalation management'],
    metrics: { label: 'First Call Resolution', value: '78%' },
  },
  {
    name: 'AI Research Employee',
    tagline: 'Intelligence On Demand',
    description: 'Get comprehensive company research, competitive analysis, and market insights in seconds.',
    icon: FileText,
    href: '/demo/research-intel',
    color: '#1B2A4A',
    features: ['Company deep-dives', 'Competitive analysis', 'Market trend tracking', 'News monitoring', 'Contact discovery'],
    metrics: { label: 'Research Time Saved', value: '85%' },
  },
  {
    name: 'AI Training Employee',
    tagline: 'Employee Development Automated',
    description: 'Manage employee training, certifications, and compliance with AI-powered learning paths and progress tracking.',
    icon: GraduationCap,
    href: '/demo/training',
    color: '#2A9D8F',
    features: ['AI course generation', 'Certification tracking', 'Compliance management', 'Progress dashboards', 'Quiz assessments'],
    metrics: { label: 'Training Completion', value: '40%' },
  },
];

const industries = [
  { name: '3PL & Logistics', icon: Truck, description: 'Warehouse automation, billing, and customer portals' },
  { name: 'Manufacturing', icon: Factory, description: 'Production tracking, quality control, and supply chain' },
  { name: 'E-Commerce', icon: ShoppingCart, description: 'Order management, inventory, and fulfillment' },
  { name: 'Professional Services', icon: Building2, description: 'Client management, billing, and project tracking' },
  { name: 'Healthcare', icon: Stethoscope, description: 'Patient scheduling, billing, and compliance' },
  { name: 'Legal', icon: Scale, description: 'Case management, document processing, and billing' },
];

export default function SolutionsPage() {
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
            <Link href="/solutions" className="text-sm text-white font-medium">Solutions</Link>
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
          <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#2A9D8F' }}>AI Workforce Solutions</p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight" style={{ color: '#1B2A4A' }}>
            An AI Employee for<br />
            <span style={{ color: '#F5920B' }}>Every Department</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-3xl mx-auto">
            Purpose-built AI employees that understand your industry, integrate with your tools, and deliver measurable ROI.
          </p>
        </div>
      </section>

      {/* EMPLOYEE CARDS */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {employees.map((emp, i) => (
            <div key={i} className="group p-8 sm:p-10 bg-white rounded-[20px] border border-gray-200/60 hover:border-[#2A9D8F]/30 hover:shadow-xl transition-all">
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${emp.color}10` }}>
                      <emp.icon className="w-7 h-7" style={{ color: emp.color }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold" style={{ color: '#1B2A4A' }}>{emp.name}</h2>
                      <p className="text-gray-500 text-sm">{emp.tagline}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-[15px] mb-6 leading-relaxed">{emp.description}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {emp.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-2 text-[14px] text-gray-500">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#2A9D8F' }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-end gap-4">
                  <div className="text-center lg:text-right">
                    <div className="text-4xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{emp.metrics.value}</div>
                    <div className="text-sm text-gray-500">{emp.metrics.label}</div>
                  </div>
                  <Link href={emp.href}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[14px] text-white transition-all hover:-translate-y-px"
                    style={{ background: '#1B2A4A', boxShadow: '0 2px 8px rgba(27,42,74,0.15)' }}>
                    View Demo <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="py-24 px-6" style={{ background: '#1B2A4A' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#F5920B' }}>Industry Solutions</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built for Your Industry</h2>
            <p className="mt-4 text-white/50 text-lg">Pre-configured AI employees for specific verticals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, i) => (
              <div key={i} className="p-7 rounded-[20px] border border-white/[0.08] hover:border-white/15 hover:bg-white/[0.04] transition-all"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <industry.icon className="w-10 h-10 mb-4" style={{ color: '#2A9D8F' }} />
                <h3 className="text-xl font-bold text-white mb-2">{industry.name}</h3>
                <p className="text-white/45 text-[14px]">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto p-12 sm:p-16 rounded-3xl text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #132038 0%, #1B2A4A 60%, #233756 100%)' }}>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Not Sure Where to Start?
            </h2>
            <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
              Book a free consultation. We&apos;ll analyze your workflows and recommend the best AI employees for your business.
            </p>
            <div className="mt-9 flex flex-wrap gap-4 justify-center">
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl text-[15px] font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: '#F5920B', boxShadow: '0 8px 32px rgba(245,146,11,0.35)' }}>
                Schedule Consultation <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="px-9 py-4 rounded-2xl text-[15px] font-semibold text-white border border-white/15 hover:bg-white/[0.08] transition-all">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={20} height={20} className="opacity-50" />
            <span className="text-[11px] text-gray-400">© 2026 WoulfAI by Woulf Group</span>
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
