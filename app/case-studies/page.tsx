'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function CaseStudiesPage() {
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
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[3px] mb-3 text-center" style={{ color: '#2A9D8F' }}>Case Studies</p>
          <h1 className="text-4xl font-extrabold mb-4 text-center" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
            Real Results from Real Projects
          </h1>
          <p className="text-center text-lg mb-12" style={{ color: '#6B7280' }}>
            See how Woulf Group has helped industry leaders transform their warehouse and logistics operations.
          </p>
          <div className="space-y-6">
            
            <Link href="/case-studies/cabelas-distribution" className="block bg-white rounded-xl border p-8 hover:shadow-lg transition-shadow" style={{ borderColor: '#E5E7EB' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F5920B' }}>Cabela's</p>
              <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Distribution Center Expansion</h2>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>How Woulf Group helped Cabela's achieve 40% higher throughput in their 200K sq ft distribution center.</p>
              <div className="grid grid-cols-4 gap-4">
                
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>40%</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Throughput Increase</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>6 weeks</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Implementation Time</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>$2.1M</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Project Value</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>99.2%</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Pick Accuracy</p>
                </div>
              </div>
            </Link>
            <Link href="/case-studies/sportsmans-automation" className="block bg-white rounded-xl border p-8 hover:shadow-lg transition-shadow" style={{ borderColor: '#E5E7EB' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F5920B' }}>Sportsman's Warehouse</p>
              <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Automation Retrofit</h2>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Transforming manual pick-and-pack operations into a 3x faster automated fulfillment system.</p>
              <div className="grid grid-cols-4 gap-4">
                
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>3x</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Faster Fulfillment</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>99.7%</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Pick Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>$890K</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Project Value</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>8 months</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>ROI Payback</p>
                </div>
              </div>
            </Link>
            <Link href="/case-studies/frito-lay-optimization" className="block bg-white rounded-xl border p-8 hover:shadow-lg transition-shadow" style={{ borderColor: '#E5E7EB' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F5920B' }}>Frito-Lay</p>
              <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Distribution Optimization</h2>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Real-time inventory visibility across 12 distribution points reduced stockouts by 25%.</p>
              <div className="grid grid-cols-4 gap-4">
                
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>25%</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Fewer Stockouts</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>$1.5M</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Annual Savings</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>15%</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Lower Carrying Costs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold" style={{ color: '#F5920B' }}>12</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Sites Connected</p>
                </div>
              </div>
            </Link>
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
