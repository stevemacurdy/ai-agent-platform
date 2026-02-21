'use client'

import Link from 'next/link'
import { 
  Package, TrendingUp, DollarSign, FileText, GraduationCap, Megaphone, 
  Headphones, Users, ArrowRight, Sparkles, CheckCircle2, Building2,
  Truck, ShoppingCart, Factory, Stethoscope, Scale
} from 'lucide-react'

const agents = [
  { 
    name: 'WMS Agent', 
    tagline: 'Warehouse Management Reimagined',
    description: 'Transform your warehouse operations with AI-powered inventory management, automated billing, and real-time visibility.',
    icon: Package, 
    href: '/demo/wms-proof-billing', 
    gradient: 'from-blue-500 to-cyan-400',
    features: [
      'Photo-verified receiving & shipping',
      'Automated billing with proof',
      'Real-time inventory tracking',
      'Barcode/QR scanning integration',
      'Odoo & QuickBooks sync'
    ],
    metrics: { label: 'Billing Time Reduction', value: '94%' }
  },
  { 
    name: 'Sales Agent', 
    tagline: 'Your AI Sales Coach',
    description: 'Empower your sales team with pre-call intelligence, real-time coaching, and automated follow-ups.',
    icon: TrendingUp, 
    href: '/demo/sales-field', 
    gradient: 'from-emerald-500 to-teal-400',
    features: [
      'Pre-call company research',
      'Real-time call coaching',
      'CRM auto-updates',
      'Pipeline forecasting',
      'Meeting scheduling'
    ],
    metrics: { label: 'Close Rate Increase', value: '34%' }
  },
  { 
    name: 'CFO Agent', 
    tagline: 'Financial Clarity, Automated',
    description: 'See your cash position clearly with 13-week forecasts, automated AR/AP, and exception handling.',
    icon: DollarSign, 
    href: '/demo/finance-ops', 
    gradient: 'from-amber-500 to-orange-400',
    features: [
      '13-week cash forecasting',
      'Automated AR collections',
      'AP approval workflows',
      'Bank reconciliation',
      'Financial anomaly detection'
    ],
    metrics: { label: 'Cash Visibility', value: '100%' }
  },
  { 
    name: 'Marketing Agent', 
    tagline: 'Campaigns That Convert',
    description: 'Launch, test, and optimize marketing campaigns with AI-powered content and real-time analytics.',
    icon: Megaphone, 
    href: '/demo/marketing', 
    gradient: 'from-pink-500 to-rose-400',
    features: [
      'AI content generation',
      'A/B split testing',
      'Multi-channel campaigns',
      'Brand asset management',
      'ROAS optimization'
    ],
    metrics: { label: 'ROAS Improvement', value: '5.2x' }
  },
  { 
    name: 'Support Agent', 
    tagline: '24/7 Customer Excellence',
    description: 'Handle customer inquiries around the clock with intelligent routing, live chat, and ticket management.',
    icon: Headphones, 
    href: '/demo/customer-support', 
    gradient: 'from-violet-500 to-purple-400',
    features: [
      'AI phone answering',
      'Intelligent call routing',
      'Live chat automation',
      'Product knowledge base',
      'Escalation management'
    ],
    metrics: { label: 'First Call Resolution', value: '78%' }
  },
  { 
    name: 'Research Agent', 
    tagline: 'Intelligence On Demand',
    description: 'Get comprehensive company research, competitive analysis, and market insights in seconds.',
    icon: FileText, 
    href: '/demo/research-intel', 
    gradient: 'from-indigo-500 to-blue-400',
    features: [
      'Company deep-dives',
      'Competitive analysis',
      'Market trend tracking',
      'News monitoring',
      'Contact discovery'
    ],
    metrics: { label: 'Research Time Saved', value: '85%' }
  },
  { 
    name: 'Training Agent', 
    tagline: 'Employee Development Automated',
    description: 'Manage employee training, certifications, and compliance with AI-powered learning paths and progress tracking.',
    icon: GraduationCap, 
    href: '/demo/training', 
    gradient: 'from-cyan-500 to-blue-400',
    features: [
      'AI course generation',
      'Certification tracking',
      'Compliance management',
      'Progress dashboards',
      'Quiz assessments'
    ],
    metrics: { label: 'Training Completion', value: '40%' }
  },
]

const industries = [
  { name: '3PL & Logistics', icon: Truck, description: 'Warehouse automation, billing, and customer portals' },
  { name: 'Manufacturing', icon: Factory, description: 'Production tracking, quality control, and supply chain' },
  { name: 'E-Commerce', icon: ShoppingCart, description: 'Order management, inventory, and fulfillment' },
  { name: 'Professional Services', icon: Building2, description: 'Client management, billing, and project tracking' },
  { name: 'Healthcare', icon: Stethoscope, description: 'Patient scheduling, billing, and compliance' },
  { name: 'Legal', icon: Scale, description: 'Case management, document processing, and billing' },
]

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">WoulfAI</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/solutions" className="text-white font-medium">Solutions</Link>
              <Link href="/demo" className="text-gray-400 hover:text-white transition-colors">Demos</Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="/case-studies" className="text-gray-400 hover:text-white transition-colors">Case Studies</Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
            </div>
            <Link href="/contact" className="bg-white text-black px-5 py-2.5 rounded-full font-medium hover:bg-gray-100 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            AI Solutions for
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Every Department
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Purpose-built AI agents that understand your industry, integrate with your tools, and deliver measurable ROI.
          </p>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {agents.map((agent, i) => (
              <div key={i} className="group relative p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center`}>
                        <agent.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{agent.name}</h2>
                        <p className="text-gray-400">{agent.tagline}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-lg mb-6">{agent.description}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {agent.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-2 text-gray-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center lg:items-end gap-4">
                    <div className="text-center lg:text-right">
                      <div className="text-4xl font-bold text-white">{agent.metrics.value}</div>
                      <div className="text-sm text-gray-500">{agent.metrics.label}</div>
                    </div>
                    <Link href={agent.href} className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                      View Demo <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Your Industry</h2>
            <p className="text-gray-400 text-lg">Pre-configured solutions for specific verticals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, i) => (
              <div key={i} className="p-6 bg-white/[0.03] border border-white/10 rounded-xl hover:border-white/20 transition-all">
                <industry.icon className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{industry.name}</h3>
                <p className="text-gray-400">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl">
            <h2 className="text-4xl font-bold mb-4">Not Sure Which Agent to Start With?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Book a free consultation. We&apos;ll analyze your workflows and recommend the best agents for your business.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors">
              Schedule Consultation <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          © 2026 WoulfAI. All rights reserved. | 
          <Link href="/privacy" className="hover:text-white ml-2">Privacy</Link> | 
          <Link href="/terms" className="hover:text-white ml-2">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
