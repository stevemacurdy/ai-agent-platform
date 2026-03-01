'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Target, Heart, Zap, Users, Award, ArrowRight } from 'lucide-react';

const team = [
  { name: 'Steve Macurdy', role: 'CEO & Founder', bio: 'Former logistics operator who saw the gap between AI promise and operational reality.' },
  { name: 'Operations Team', role: 'The Builders', bio: 'Engineers, designers, and operations experts building the future of work.' },
];

const values = [
  { icon: Target, title: 'Results-Driven', description: 'We measure success by the ROI we generate for our customers, not vanity metrics.' },
  { icon: Heart, title: 'Customer-First', description: 'Every feature we build starts with a real customer problem, not a technology trend.' },
  { icon: Zap, title: 'Speed Matters', description: 'We ship fast, learn faster, and iterate constantly to stay ahead.' },
  { icon: Users, title: 'Human + AI', description: 'We believe AI should amplify human capabilities, not replace human judgment.' },
];

const stats = [
  { value: '2024', label: 'Founded' },
  { value: '1,200+', label: 'Projects' },
  { value: '4M+', label: 'Sq Ft Integrated' },
  { value: '6', label: 'Countries' },
];

export default function AboutPage() {
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
            <Link href="/about" className="text-sm text-white font-medium">About</Link>
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
          <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#2A9D8F' }}>Our Story</p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight" style={{ color: '#1B2A4A' }}>
            We&apos;re Building the<br />
            <span style={{ color: '#F5920B' }}>Future of Work</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-3xl mx-auto">
            WoulfAI was born from a simple observation: businesses are drowning in operational tasks that AI could handle better. We&apos;re here to change that.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-200/60 text-center" style={{ boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
              <div className="text-3xl font-extrabold" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-8" style={{ color: '#1B2A4A' }}>Our Story</h2>
          <div className="space-y-5 text-[16px] text-gray-600 leading-relaxed">
            <p>
              WoulfAI started in 2024 when our founder, Steve Macurdy, was running a 3PL warehouse operation.
              Every month, the billing process took 8+ hours of manual work — cross-referencing BOLs, calculating storage fees,
              generating invoices. It was tedious, error-prone, and expensive.
            </p>
            <p>
              The AI tools available were either too generic (chatbots that couldn&apos;t understand logistics) or too complex
              (requiring months of custom development). There had to be a better way.
            </p>
            <p>
              So we built it. Starting with the AI WMS Employee that automated warehouse billing, we expanded to cover
              sales, finance, marketing, and customer support. Each AI employee is purpose-built for a specific business function,
              trained on industry best practices, and designed to integrate with the tools businesses already use.
            </p>
            <p>
              Today, WoulfAI powers operations for companies across six countries — from small warehouses to enterprise
              manufacturers. With 1,200+ projects and over 4 million square feet of warehouse space integrated, we bring
              real operational expertise to every AI employee we build. We&apos;re just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 px-6" style={{ background: '#1B2A4A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#F5920B' }}>What Drives Us</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Our Values</h2>
            <p className="mt-4 text-white/50">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="p-7 rounded-[20px] border border-white/[0.08] hover:border-white/15 hover:bg-white/[0.04] transition-all"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(42,157,143,0.12)' }}>
                  <value.icon className="w-6 h-6" style={{ color: '#2A9D8F' }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                <p className="text-white/45 text-[14px] leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#2A9D8F' }}>The People</p>
            <h2 className="text-3xl font-extrabold" style={{ color: '#1B2A4A' }}>The Team</h2>
            <p className="mt-3 text-gray-500">Operators building tools for operators</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {team.map((member, i) => (
              <div key={i} className="p-8 bg-white rounded-[20px] border border-gray-200/60" style={{ boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #1B2A4A, #233756)' }}>
                  <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>{member.name}</h3>
                <p className="text-sm font-semibold mt-0.5" style={{ color: '#2A9D8F' }}>{member.role}</p>
                <p className="text-gray-500 text-[14px] mt-3 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAREERS CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto p-12 sm:p-16 rounded-3xl text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #132038 0%, #1B2A4A 60%, #233756 100%)' }}>
          <div className="relative z-10">
            <Award className="w-12 h-12 mx-auto mb-6" style={{ color: '#F5920B' }} />
            <h2 className="text-3xl font-extrabold text-white">Join Our Team</h2>
            <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
              We&apos;re always looking for talented people who are passionate about AI and operations.
              Remote-first, competitive pay, meaningful work.
            </p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 mt-9 px-9 py-4 rounded-2xl text-[15px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#F5920B', boxShadow: '0 8px 32px rgba(245,146,11,0.35)' }}>
              View Open Positions <ArrowRight className="w-5 h-5" />
            </Link>
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
