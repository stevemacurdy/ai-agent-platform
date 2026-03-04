'use client';

import Link from 'next/link';

const FEATURES = [
  { icon: '📊', title: 'Real-Time Dashboard', desc: 'KPIs, payment history charts, inventory levels, and activity feed at a glance' },
  { icon: '📦', title: 'Inventory Browser', desc: 'Search, filter, and sort inventory by type, manufacturer, lot, and expiration' },
  { icon: '🛒', title: 'Self-Service Ordering', desc: 'Cart-based ordering with auto-generated PO numbers and DOT-compliant BOLs' },
  { icon: '🚚', title: 'Order Tracking', desc: 'Full order lifecycle timeline from pending through delivery with photo proof' },
  { icon: '📥', title: 'Receiving History', desc: 'Inbound shipment records with photos, QC status, and putaway locations' },
  { icon: '💰', title: 'Billing & Payments', desc: 'Invoice management, one-click payments, auto-pay with 3% discount' },
  { icon: '🤖', title: 'AI Support Chat', desc: 'Instant answers on inventory, orders, billing — escalation to human when needed' },
  { icon: '🔑', title: 'API & Settings', desc: 'API key management, webhooks, notification preferences, contract details' },
];

const DEMO_CUSTOMER = {
  name: 'Mountain West Supplements',
  code: 'MWS-001',
  skus: 16,
  orders: 6,
  invoiceMonths: 12,
};

export default function ThreePLPortalDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1A2E] text-white">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <Link href="/demo" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-8 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Demo Hub
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F5920B] flex items-center justify-center text-2xl font-bold shadow-lg shadow-[#F5920B]/20">3P</div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>3PL Customer Portal</h1>
            <p className="text-white/60 mt-1">White-label portal for your 3PL warehouse customers</p>
          </div>
        </div>

        <p className="text-lg text-white/70 max-w-3xl leading-relaxed mb-8">
          Give every customer their own branded portal with real-time inventory visibility,
          self-service ordering, automated billing, and AI-powered support. Reduces
          support calls by 60% and gets you paid faster with auto-pay incentives.
        </p>

        <div className="flex flex-wrap gap-4 mb-12">
          <Link href="/portal/MWS-001"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5920B] text-white font-semibold rounded-xl hover:bg-[#E08209] transition-colors shadow-lg shadow-[#F5920B]/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Launch Demo Portal
          </Link>
          <Link href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/10">
            View Pricing
          </Link>
        </div>

        {/* Demo data badge */}
        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm">
          <span className="text-white/40">Demo Customer:</span>
          <span className="font-semibold text-[#F5920B]">{DEMO_CUSTOMER.name}</span>
          <span className="text-white/30">|</span>
          <span className="text-white/60">{DEMO_CUSTOMER.skus} SKUs</span>
          <span className="text-white/30">|</span>
          <span className="text-white/60">{DEMO_CUSTOMER.orders} Orders</span>
          <span className="text-white/30">|</span>
          <span className="text-white/60">{DEMO_CUSTOMER.invoiceMonths} Mo. Billing</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">Portal Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Value Props */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#2A9D8F]/20 to-[#2A9D8F]/5 border border-[#2A9D8F]/20 rounded-xl p-6">
            <p className="text-3xl font-bold text-[#2A9D8F]">60%</p>
            <p className="text-sm text-white/60 mt-1">Fewer support calls with self-service access</p>
          </div>
          <div className="bg-gradient-to-br from-[#F5920B]/20 to-[#F5920B]/5 border border-[#F5920B]/20 rounded-xl p-6">
            <p className="text-3xl font-bold text-[#F5920B]">12 days</p>
            <p className="text-sm text-white/60 mt-1">Faster payment with auto-pay incentives</p>
          </div>
          <div className="bg-gradient-to-br from-[#7C3AED]/20 to-[#7C3AED]/5 border border-[#7C3AED]/20 rounded-xl p-6">
            <p className="text-3xl font-bold text-[#7C3AED]">24/7</p>
            <p className="text-sm text-white/60 mt-1">AI support available around the clock</p>
          </div>
        </div>
      </div>
    </div>
  );
}
