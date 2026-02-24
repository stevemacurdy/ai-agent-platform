'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';
import {
  Sparkles, ArrowRight, ChevronRight, Zap, Shield, BarChart3,
  Bot, Building2, Users, TrendingUp, Clock, CheckCircle2,
  Phone, Mail, MapPin
} from 'lucide-react';
import AgentModal from '@/components/agent-modal';
import { addToCart } from '@/components/cart-drawer';

const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
const CATEGORIES = [...new Set(LIVE_AGENTS.map(a => a.category))];

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  agent_slugs: string[];
  monthly_price: number;
  is_active: boolean;
}

interface AgentPrice {
  agent_slug: string;
  monthly_price: number;
}

const FEATURES = [
  { icon: Bot, title: 'AI-Powered Agents', desc: 'Purpose-built AI agents that understand your industry and integrate with your existing tools.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 compliant infrastructure with encrypted data storage and role-based access controls.' },
  { icon: Zap, title: 'Instant Deployment', desc: 'Go from signup to production in minutes. No complex setup or lengthy onboarding required.' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track agent performance, ROI, and operational metrics from a unified dashboard.' },
  { icon: Building2, title: 'Multi-Tenant Ready', desc: 'Built for organizations managing multiple brands, locations, or client accounts.' },
  { icon: TrendingUp, title: 'Continuous Learning', desc: 'Agents improve over time, adapting to your business patterns and preferences.' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'VP Operations, LogiFlow', quote: 'WoulfAI cut our warehouse processing time by 40%. The WMS agent alone paid for itself in the first month.' },
  { name: 'Marcus Rodriguez', role: 'CFO, TechScale Inc', quote: 'The CFO agent caught $180K in billing discrepancies we had missed for months. Incredible ROI.' },
  { name: 'Jennifer Park', role: 'Sales Director, GrowthCo', quote: 'Our sales team closed 3x more deals after deploying the Sales Intelligence agent. Game changer.' },
];

export default function LandingPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [prices, setPrices] = useState<AgentPrice[]>([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [agentIndex, setAgentIndex] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/admin/bundles')
      .then(r => r.json())
      .then(d => setBundles((d.bundles || []).filter((b: Bundle) => b.is_active)))
      .catch(() => {});

    fetch('/api/admin/pricing')
      .then(r => r.json())
      .then(d => setPrices(d.prices || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setAgentIndex(i => (i + 1) % LIVE_AGENTS.length), 3000);
    return () => clearInterval(timer);
  }, []);

  const getPrice = (slug: string) => {
    const p = prices.find(p => p.agent_slug === slug);
    return p ? p.monthly_price : 0;
  };

  const handleAddToCart = async (agent: any) => {
    const price = getPrice(agent.slug);
    await addToCart('agent', agent.slug, agent.icon + ' ' + agent.name, price);
    setCartItems(prev => new Set([...prev, agent.slug]));
  };

  const categoryAgents = LIVE_AGENTS.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/[0.07] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/[0.07] rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">WoulfAI</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/solutions" className="text-gray-400 hover:text-white transition-colors text-sm">Solutions</Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</Link>
              <Link href="/case-studies" className="text-gray-400 hover:text-white transition-colors text-sm">Case Studies</Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              {LIVE_AGENTS.length} AI Agents Live
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
              AI Agents That
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Run Your Business
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-lg">
              Deploy purpose-built AI agents for finance, sales, operations, HR, and more.
              Each agent integrates with your tools and works 24/7 to automate what matters.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/demo/marketing" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                Watch Demo <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/5">
              <div><div className="text-2xl font-bold">{LIVE_AGENTS.length}+</div><div className="text-xs text-gray-500">AI Agents</div></div>
              <div><div className="text-2xl font-bold">{CATEGORIES.length}</div><div className="text-xs text-gray-500">Categories</div></div>
              <div><div className="text-2xl font-bold">24/7</div><div className="text-xs text-gray-500">Always On</div></div>
              <div><div className="text-2xl font-bold">5min</div><div className="text-xs text-gray-500">Setup Time</div></div>
            </div>
          </div>

          {/* Agent showcase */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-[#0A0E15]/90 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Live Agent Preview</span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div className="space-y-3">
                {LIVE_AGENTS.slice(0, 6).map((agent, i) => (
                  <button
                    key={agent.slug}
                    onClick={() => setSelectedAgent(agent)}
                    className={"w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-500 text-left " +
                      (i === agentIndex % 6 ? 'bg-white/[0.08] border border-white/10 scale-[1.02]' : 'bg-white/[0.02] hover:bg-white/[0.05]')}
                  >
                    <span className="text-2xl">{agent.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{agent.name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{agent.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPrice(agent.slug) > 0 && (
                        <span className="text-[10px] text-gray-500 font-mono">${getPrice(agent.slug)}/mo</span>
                      )}
                      <div className={"text-[9px] px-2 py-0.5 rounded-full " +
                        (agent.status === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500')}>
                        {agent.status}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/agents" className="text-xs text-blue-400 hover:text-blue-300 transition">
                  View all {LIVE_AGENTS.length} agents →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Categories */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Agents for Every Department</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">From finance to operations, our specialized AI agents integrate seamlessly with your workflow.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={"px-4 py-2 rounded-full text-sm font-medium transition capitalize " +
                (activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
              {cat}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryAgents.map(agent => (
            <button key={agent.slug} onClick={() => setSelectedAgent(agent)}
              className="group bg-[#0A0E15] border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all hover:bg-white/[0.02] text-left">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{agent.icon}</span>
                <div className="flex items-center gap-2">
                  {getPrice(agent.slug) > 0 && (
                    <span className="text-xs text-gray-500 font-mono">${getPrice(agent.slug)}/mo</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">{agent.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{agent.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Enterprise</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">WoulfAI is designed from the ground up for businesses that need reliability, security, and scale.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Choose a bundle or build your own with à la carte agents.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {bundles.slice(0, 3).map((b, i) => {
            const isPopular = i === 1;
            return (
              <div key={b.id} className={"relative rounded-2xl p-8 transition " +
                (isPopular ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30' : 'bg-[#0A0E15] border border-white/5')}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                )}
                <h3 className="text-xl font-bold mb-2">{b.name}</h3>
                <p className="text-sm text-gray-500 mb-6">{b.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">${b.monthly_price}</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {(b.agent_slugs || []).slice(0, 8).map(slug => {
                    const a = LIVE_AGENTS.find(a => a.slug === slug);
                    return a ? (
                      <li key={slug} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{a.icon} {a.name}</span>
                      </li>
                    ) : null;
                  })}
                  {(b.agent_slugs || []).length > 8 && (
                    <li className="text-xs text-gray-600 pl-6">+{b.agent_slugs.length - 8} more agents</li>
                  )}
                </ul>
                <Link href="/register"
                  className={"block text-center py-3 rounded-xl font-medium text-sm transition " +
                    (isPopular ? 'bg-white text-black hover:bg-gray-100' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10')}>
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
        {bundles.length === 0 && (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: '$499', desc: 'For small teams getting started' },
              { name: 'Professional', price: '$1,200', desc: 'Full agent coverage for growing companies' },
              { name: 'Enterprise', price: '$2,499', desc: 'Unlimited power with white-glove service' },
            ].map((p, i) => (
              <div key={i} className={"rounded-2xl p-8 " + (i === 1 ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30' : 'bg-[#0A0E15] border border-white/5')}>
                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-6">{p.desc}</p>
                <div className="text-4xl font-bold mb-6">{p.price}<span className="text-lg text-gray-500">/mo</span></div>
                <Link href="/pricing" className="block text-center py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition">View Details</Link>
              </div>
            ))}
          </div>
        )}
        <p className="text-center text-sm text-gray-500 mt-8">
          Need something custom? <Link href="/contact" className="text-blue-400 hover:text-blue-300">Contact our sales team</Link>
        </p>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2></div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <p className="text-gray-400 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div><div className="font-semibold text-sm">{t.name}</div><div className="text-xs text-gray-500">{t.role}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-white/10 p-12 text-center">
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Operations?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join forward-thinking companies using WoulfAI to automate, optimize, and scale.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/5 transition">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
                <span className="text-xl font-bold">WoulfAI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">AI-powered business agents built by Woulf Group. Warehouse systems integration meets artificial intelligence.</p>
              <div className="flex items-center gap-4 mt-4">
                <a href="mailto:solutions@woulfgroup.com" className="text-gray-500 hover:text-blue-400 transition"><Mail className="w-4 h-4" /></a>
                <a href="tel:8016881745" className="text-gray-500 hover:text-blue-400 transition"><Phone className="w-4 h-4" /></a>
                <span className="text-gray-600 flex items-center gap-1 text-xs"><MapPin className="w-3 h-3" /> Grantsville, UT</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <div className="space-y-2.5">
                <Link href="/agents" className="block text-sm text-gray-500 hover:text-white transition">All Agents</Link>
                <Link href="/pricing" className="block text-sm text-gray-500 hover:text-white transition">Pricing</Link>
                <Link href="/solutions" className="block text-sm text-gray-500 hover:text-white transition">Solutions</Link>
                <Link href="/demo/marketing" className="block text-sm text-gray-500 hover:text-white transition">Demos</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <div className="space-y-2.5">
                <Link href="/about" className="block text-sm text-gray-500 hover:text-white transition">About</Link>
                <Link href="/careers" className="block text-sm text-gray-500 hover:text-white transition">Careers</Link>
                <Link href="/case-studies" className="block text-sm text-gray-500 hover:text-white transition">Case Studies</Link>
                <Link href="/contact" className="block text-sm text-gray-500 hover:text-white transition">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <div className="space-y-2.5">
                <Link href="/terms" className="block text-sm text-gray-500 hover:text-white transition">Terms of Service</Link>
                <Link href="/privacy" className="block text-sm text-gray-500 hover:text-white transition">Privacy Policy</Link>
                <Link href="/security" className="block text-sm text-gray-500 hover:text-white transition">Security</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 flex items-center justify-between">
            <p className="text-xs text-gray-600">© 2026 WoulfAI by Woulf Group. All rights reserved.</p>
            <p className="text-xs text-gray-600">{LIVE_AGENTS.length} agents deployed</p>
          </div>
        </div>
      </footer>

      {/* Agent Modal */}
      {selectedAgent && (
        <AgentModal
          agent={selectedAgent}
          price={getPrice(selectedAgent.slug)}
          inCart={cartItems.has(selectedAgent.slug)}
          onClose={() => setSelectedAgent(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
