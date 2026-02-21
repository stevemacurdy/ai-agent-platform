'use client'

import Link from 'next/link'
import { Sparkles, Target, Heart, Zap, Users, Award, ArrowRight } from 'lucide-react'

const team = [
  { name: 'Steve Macurdy', role: 'CEO & Founder', bio: 'Former logistics operator who saw the gap between AI promise and operational reality.' },
  { name: 'Operations Team', role: 'The Builders', bio: 'Engineers, designers, and operations experts building the future of work.' },
]

const values = [
  { icon: Target, title: 'Results-Driven', description: 'We measure success by the ROI we generate for our customers, not vanity metrics.' },
  { icon: Heart, title: 'Customer-First', description: 'Every feature we build starts with a real customer problem, not a technology trend.' },
  { icon: Zap, title: 'Speed Matters', description: 'We ship fast, learn faster, and iterate constantly to stay ahead.' },
  { icon: Users, title: 'Human + AI', description: 'We believe AI should amplify human capabilities, not replace human judgment.' },
]

const stats = [
  { value: '2024', label: 'Founded' },
  { value: '500+', label: 'Customers' },
  { value: '50M+', label: 'Tasks Automated' },
  { value: '99.9%', label: 'Uptime' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
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
              <Link href="/case-studies" className="text-gray-400 hover:text-white transition-colors">Case Studies</Link>
              <Link href="/about" className="text-white font-medium">About</Link>
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
            We&apos;re Building the
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Future of Work
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            WoulfAI was born from a simple observation: businesses are drowning in operational tasks that AI could handle better. 
            We&apos;re here to change that.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Our Story</h2>
          <div className="prose prose-lg prose-invert">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              WoulfAI started in 2024 when our founder, Steve Macurdy, was running a 3PL warehouse operation. 
              Every month, the billing process took 8+ hours of manual work—cross-referencing BOLs, calculating storage fees, 
              generating invoices. It was tedious, error-prone, and expensive.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              The AI tools available were either too generic (chatbots that couldn&apos;t understand logistics) or too complex 
              (requiring months of custom development). There had to be a better way.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              So we built it. Starting with the WMS Agent that automated warehouse billing, we expanded to cover 
              sales, finance, marketing, and customer support. Each agent is purpose-built for a specific business function, 
              trained on industry best practices, and designed to integrate with the tools businesses already use.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Today, WoulfAI powers operations for hundreds of companies—from small warehouses to enterprise 
              manufacturers. We&apos;re just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-400">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Team</h2>
            <p className="text-gray-400">Operators building tools for operators</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member, i) => (
              <div key={i} className="p-8 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-blue-400 mb-3">{member.role}</p>
                <p className="text-gray-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl">
            <Award className="w-12 h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              We&apos;re always looking for talented people who are passionate about AI and operations. 
              Remote-first, competitive pay, meaningful work.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              View Open Positions <ArrowRight className="w-5 h-5" />
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
