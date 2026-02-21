'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Quote, TrendingUp, Clock, DollarSign, Users } from 'lucide-react'

const caseStudies = [
  {
    company: 'Clutch 3PL',
    industry: 'Logistics & Warehousing',
    logo: 'C',
    challenge: 'Manual billing taking 8+ hours per month, inventory discrepancies, and customer communication delays.',
    solution: 'Deployed WMS Agent for automated billing, photo verification, and customer portal.',
    results: [
      { metric: '94%', label: 'Reduction in billing time' },
      { metric: '$15K', label: 'Monthly labor savings' },
      { metric: '0', label: 'Billing disputes' },
    ],
    quote: "The WMS Agent transformed our operations. What used to take all day now happens automatically with zero errors.",
    quotee: 'Operations Manager',
    gradient: 'from-blue-500 to-cyan-400'
  },
  {
    company: 'TechFlow Solutions',
    industry: 'B2B SaaS',
    logo: 'T',
    challenge: 'Sales team spending too much time on research and admin, not enough time selling.',
    solution: 'Deployed Sales Agent for pre-call intelligence, CRM automation, and call coaching.',
    results: [
      { metric: '34%', label: 'Increase in close rate' },
      { metric: '2.5hrs', label: 'Saved per rep per day' },
      { metric: '47%', label: 'More meetings booked' },
    ],
    quote: "Our reps now walk into every call prepared. The AI coaching has made our entire team perform like our best closer.",
    quotee: 'VP of Sales',
    gradient: 'from-emerald-500 to-teal-400'
  },
  {
    company: 'GrowthStack Inc',
    industry: 'Marketing Agency',
    logo: 'G',
    challenge: 'Cash flow visibility issues, late payments from clients, and manual invoicing.',
    solution: 'Deployed CFO Agent for cash forecasting, automated AR, and payment reminders.',
    results: [
      { metric: '23 days', label: 'Reduction in DSO' },
      { metric: '100%', label: 'Cash flow visibility' },
      { metric: '$200K', label: 'Collected faster' },
    ],
    quote: "We finally see where our cash is going. The CFO Agent caught a potential crisis two months before it would have hit.",
    quotee: 'CFO',
    gradient: 'from-amber-500 to-orange-400'
  },
  {
    company: 'Pacific Logistics',
    industry: '3PL Provider',
    logo: 'P',
    challenge: 'Customer service team overwhelmed with calls, long hold times, and inconsistent information.',
    solution: 'Deployed Support Agent for AI phone answering, intelligent routing, and knowledge base.',
    results: [
      { metric: '78%', label: 'AI resolution rate' },
      { metric: '< 10s', label: 'Average answer time' },
      { metric: '4.8/5', label: 'Customer satisfaction' },
    ],
    quote: "Our customers get answers instantly, 24/7. The AI handles routine questions perfectly and routes complex issues to the right person.",
    quotee: 'Customer Success Director',
    gradient: 'from-violet-500 to-purple-400'
  },
]

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
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
              <Link href="/solutions" className="text-gray-400 hover:text-white transition-colors">Solutions</Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="/case-studies" className="text-white font-medium">Case Studies</Link>
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Real Results from
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Real Businesses
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See how companies like yours are using WoulfAI to transform their operations, 
            reduce costs, and scale faster.
          </p>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          {caseStudies.map((study, i) => (
            <div key={i} className="relative">
              <div className="p-8 md:p-12 bg-white/[0.02] border border-white/10 rounded-2xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${study.gradient} flex items-center justify-center text-2xl font-bold`}>
                    {study.logo}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{study.company}</h2>
                    <p className="text-gray-400">{study.industry}</p>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">The Challenge</h3>
                    <p className="text-gray-300">{study.challenge}</p>
                  </div>
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">The Solution</h3>
                    <p className="text-gray-300">{study.solution}</p>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-white/[0.02] rounded-xl">
                  {study.results.map((result, j) => (
                    <div key={j} className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{result.metric}</div>
                      <div className="text-sm text-gray-500">{result.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <div className="relative pl-6 border-l-2 border-blue-500">
                  <Quote className="absolute -left-3 -top-1 w-6 h-6 text-blue-500 bg-[#0a0a0f]" />
                  <p className="text-lg text-gray-300 italic mb-2">&quot;{study.quote}&quot;</p>
                  <p className="text-gray-500">— {study.quotee}, {study.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of companies transforming their operations with AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo/marketing" className="inline-flex items-center gap-2 border border-white/20 px-8 py-4 rounded-full font-semibold hover:bg-white/5 transition-colors">
                See Demo
              </Link>
            </div>
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
