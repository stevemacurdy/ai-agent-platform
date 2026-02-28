'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const caseStudies = [
  {
    company: 'Clutch 3PL',
    industry: 'Logistics & Warehousing',
    logo: 'C',
    color: '#2A9D8F',
    challenge: 'Manual billing taking 8+ hours per month, inventory discrepancies, and customer communication delays.',
    solution: 'Hired the AI WMS Employee for automated billing, photo verification, and customer portal.',
    results: [
      { metric: '94%', label: 'Reduction in billing time' },
      { metric: '$15K', label: 'Monthly labor savings' },
      { metric: '0', label: 'Billing disputes' },
    ],
    quote: "The AI WMS Employee transformed our operations. What used to take all day now happens automatically with zero errors.",
    quotee: 'Operations Manager',
  },
  {
    company: 'TechFlow Solutions',
    industry: 'B2B SaaS',
    logo: 'T',
    color: '#1B2A4A',
    challenge: 'Sales team spending too much time on research and admin, not enough time selling.',
    solution: 'Hired the AI Sales Employee for pre-call intelligence, CRM automation, and call coaching.',
    results: [
      { metric: '34%', label: 'Increase in close rate' },
      { metric: '2.5hrs', label: 'Saved per rep per day' },
      { metric: '47%', label: 'More meetings booked' },
    ],
    quote: "Our reps now walk into every call prepared. The AI coaching has made our entire team perform like our best closer.",
    quotee: 'VP of Sales',
  },
  {
    company: 'GrowthStack Inc',
    industry: 'Marketing Agency',
    logo: 'G',
    color: '#F5920B',
    challenge: 'Cash flow visibility issues, late payments from clients, and manual invoicing.',
    solution: 'Hired the AI Financial Employee for cash forecasting, automated AR, and payment reminders.',
    results: [
      { metric: '23 days', label: 'Reduction in DSO' },
      { metric: '100%', label: 'Cash flow visibility' },
      { metric: '$200K', label: 'Collected faster' },
    ],
    quote: "We finally see where our cash is going. The AI Financial Employee caught a potential crisis two months before it would have hit.",
    quotee: 'CFO',
  },
  {
    company: 'Pacific Logistics',
    industry: '3PL Provider',
    logo: 'P',
    color: '#2A9D8F',
    challenge: 'Customer service team overwhelmed with calls, long hold times, and inconsistent information.',
    solution: 'Hired the AI Support Employee for AI phone answering, intelligent routing, and knowledge base.',
    results: [
      { metric: '78%', label: 'AI resolution rate' },
      { metric: '< 10s', label: 'Average answer time' },
      { metric: '4.8/5', label: 'Customer satisfaction' },
    ],
    quote: "Our customers get answers instantly, 24/7. The AI handles routine questions perfectly and routes complex issues to the right person.",
    quotee: 'Customer Success Director',
  },
];

export default function CaseStudiesPage() {
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
            <Link href="/case-studies" className="text-sm text-white font-medium">Case Studies</Link>
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
          <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#2A9D8F' }}>Proof of Impact</p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight" style={{ color: '#1B2A4A' }}>
            Real Results from<br />
            <span style={{ color: '#F5920B' }}>Real Businesses</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-3xl mx-auto">
            See how companies like yours are using WoulfAI to transform their operations, reduce costs, and scale faster.
          </p>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          {caseStudies.map((study, i) => (
            <div key={i} className="bg-white rounded-[20px] border border-gray-200/60 overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(27,42,74,0.06)' }}>
              <div className="h-[4px]" style={{ background: study.color }} />
              <div className="p-8 sm:p-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white" style={{ background: study.color }}>
                    {study.logo}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold" style={{ color: '#1B2A4A' }}>{study.company}</h2>
                    <p className="text-sm text-gray-500">{study.industry}</p>
                  </div>
                </div>

                {/* Challenge / Solution */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#DC4F4F' }}>The Challenge</h3>
                    <p className="text-[15px] text-gray-600 leading-relaxed">{study.challenge}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: '#2A9D8F' }}>The Solution</h3>
                    <p className="text-[15px] text-gray-600 leading-relaxed">{study.solution}</p>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-6 rounded-2xl" style={{ background: '#FAFBFC', border: '1px solid #E5E7EB' }}>
                  {study.results.map((result, j) => (
                    <div key={j} className="text-center">
                      <div className="text-3xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{result.metric}</div>
                      <div className="text-[12px] text-gray-500 mt-1">{result.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <div className="relative pl-6" style={{ borderLeft: `3px solid ${study.color}` }}>
                  <p className="text-[16px] text-gray-600 italic leading-relaxed mb-2">&quot;{study.quote}&quot;</p>
                  <p className="text-sm text-gray-400">&mdash; {study.quotee}, {study.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto p-12 sm:p-16 rounded-3xl text-center"
          style={{ background: 'linear-gradient(135deg, #132038 0%, #1B2A4A 60%, #233756 100%)' }}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Write Your Success Story?</h2>
          <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
            Join companies transforming their operations with AI employees.
          </p>
          <div className="mt-9 flex flex-wrap gap-4 justify-center">
            <Link href="/register"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl text-[15px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#F5920B', boxShadow: '0 8px 32px rgba(245,146,11,0.35)' }}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/demo/marketing" className="px-9 py-4 rounded-2xl text-[15px] font-semibold text-white border border-white/15 hover:bg-white/[0.08] transition-all">
              See Demo
            </Link>
          </div>
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
