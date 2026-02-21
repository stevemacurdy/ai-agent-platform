/**
 * ============================================================
 *  WoulfAI — Hotfix: 3 Issues
 * ============================================================
 *  1. Stripe "price not configured" — read env vars at runtime
 *  2. Sidebar shows admin links to all users — enforce role check
 *  3. Onboarding crash — add error boundary
 *
 *  Run: node hotfix-3issues.js && npm run build && vercel --prod
 */

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const AP = fs.existsSync(path.join(ROOT, 'src/app')) ? 'src/' : '';
let created = 0;

function write(fp, content) {
  const full = path.join(ROOT, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (fs.existsSync(full)) {
    const bd = path.join(ROOT, '.backups', 'hotfix3');
    fs.mkdirSync(bd, { recursive: true });
    fs.copyFileSync(full, path.join(bd, fp.replace(/\//g, '__')));
  }
  fs.writeFileSync(full, content, 'utf8');
  created++;
  console.log('  \u2713 ' + fp);
}

console.log('');
console.log('  Hotfix: Stripe pricing + Sidebar roles + Onboarding crash');
console.log('');

// ── FIX 1: Stripe checkout — read price IDs at runtime ──
console.log('  [1/4] Stripe checkout — runtime env vars');

write(AP + 'app/api/stripe/checkout/route.ts', `export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PLANS, PlanKey } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// Read price IDs at runtime, NOT at import time
function getPriceId(plan: string): string {
  const map: Record<string, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
  };
  return map[plan] || '';
}

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json();

    if (!plan || !PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = getPriceId(plan);
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured for plan: ' + plan + '. Env var STRIPE_PRICE_' + plan.toUpperCase() + ' is missing.' }, { status: 400 });
    }

    const stripe = getStripe();
    const sb = supabaseAdmin();
    let stripeCustomerId: string | undefined;

    if (userId) {
      const { data: sub } = await sb.from('subscriptions').select('stripe_customer_id').eq('user_id', userId).single();
      stripeCustomerId = sub?.stripe_customer_id;
    }

    if (!stripeCustomerId && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email, metadata: { userId: userId || '' } });
        stripeCustomerId = customer.id;
      }
    }

    const origin = req.headers.get('origin') || 'https://www.woulfai.com';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: origin + '/billing?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: origin + '/pricing?canceled=true',
      metadata: { plan, userId: userId || '' },
      subscription_data: { metadata: { plan, userId: userId || '' } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

// ── FIX 2: Sidebar — role-aware, admin links only for admins ──
console.log('  [2/4] Sidebar — enforce role-based links');

write(AP + 'components/dashboard/sidebar-nav.tsx', `'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AGENTS } from '@/lib/agents/agent-registry';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface UserInfo { role: string; email: string; approved_agents: string[]; }

const LIVE_AGENTS = Object.values(AGENTS).filter(a => a.status === 'live');

export default function SidebarNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sb = getSupabaseBrowser();
        const { data: { session } } = await sb.auth.getSession();
        if (!session?.access_token) { setLoading(false); return; }

        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + session.access_token },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  // Admins see all agents, employees see only approved
  const visibleAgents = isAdmin
    ? LIVE_AGENTS
    : LIVE_AGENTS.filter(a => (user?.approved_agents || []).includes(a.slug));

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="flex flex-col h-full px-3 py-4">
      <Link href="/" className="flex items-center gap-2 px-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
        <span className="text-sm font-bold text-white">WoulfAI</span>
        <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">{visibleAgents.length} Live</span>
      </Link>

      <div className="text-[9px] text-gray-600 uppercase font-semibold px-3 mb-2">AI Agents</div>
      <div className="space-y-0.5 flex-1 overflow-y-auto">
        {visibleAgents.length === 0 && !loading && (
          <div className="px-3 py-4 text-xs text-gray-600 text-center">No agents assigned yet. Contact your admin for access.</div>
        )}
        {visibleAgents.map(agent => (
          <Link key={agent.slug} href={agent.liveRoute}
            className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive(agent.liveRoute) ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white')}>
            <span className="text-base">{agent.icon}</span>
            <span className="truncate">{agent.name}</span>
          </Link>
        ))}
      </div>

      <div className="border-t border-white/5 mt-3 pt-3 space-y-0.5">
        <div className="text-[9px] text-gray-600 uppercase font-semibold px-3 mb-2">Quick Links</div>

        {/* Everyone gets these */}
        <Link href="/portal" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/portal') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
          <span>{'\\uD83D\\uDCE6'}</span> Customer Portal
        </Link>
        <Link href="/onboarding" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/onboarding') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
          <span>{'\\uD83D\\uDE80'}</span> Onboarding
        </Link>
        <Link href="/billing" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/billing') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
          <span>{'\\uD83D\\uDCB3'}</span> Billing
        </Link>

        {/* Admin only */}
        {isAdmin && (
          <>
            <Link href="/admin" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/admin') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
              <span>{'\\u2699\\uFE0F'}</span> Admin Dashboard
            </Link>
            <Link href="/admin/users" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/admin/users') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
              <span>{'\\uD83D\\uDC65'}</span> Manage Users
            </Link>
            <Link href="/demo" className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ' + (isActive('/demo') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5')}>
              <span>{'\\uD83C\\uDFAE'}</span> Demo Hub
            </Link>
          </>
        )}
      </div>

      {/* User info */}
      {user && (
        <div className="border-t border-white/5 mt-3 pt-3 px-3">
          <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
          <div className="text-[9px] text-gray-600 uppercase mt-0.5">{user.role.replace('_', ' ')}</div>
        </div>
      )}
    </nav>
  );
}
`);

// ── FIX 3: Onboarding page — safe with error handling ──
console.log('  [3/4] Onboarding page — fix crash');

write(AP + 'app/onboarding/page.tsx', `'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';

const LIVE_AGENTS = Object.values(AGENTS).filter(a => a.status === 'live');

export default function OnboardingHub() {
  const [search, setSearch] = useState('');

  const filtered = LIVE_AGENTS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agent Onboarding</h1>
        <p className="text-sm text-gray-400 mt-1">Select an agent to begin setup. Each wizard takes under 10 minutes.</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search agents..."
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(agent => (
          <Link key={agent.slug} href={'/onboarding/' + agent.slug}
            className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{agent.icon}</span>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition">{agent.name}</div>
                <div className="text-[10px] text-gray-500">{agent.category}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400">{agent.description || 'Set up ' + agent.name + ' for your business.'}</p>
            <div className="mt-3 text-[10px] text-blue-400 font-medium">Start Setup {'\\u2192'}</div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-gray-500">No agents match your search.</div>
        )}
      </div>
    </div>
  );
}
`);

// ── FIX 4: Onboarding [agentId] — safe with fallback ──
console.log('  [4/4] Onboarding wizard — safe with fallback');

write(AP + 'app/onboarding/[agentId]/page.tsx', `'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AGENTS } from '@/lib/agents/agent-registry';

export default function OnboardingWizard() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const agent = Object.values(AGENTS).find(a => a.slug === agentId);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  if (!agent) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-4xl mb-3">{'\\u2753'}</div>
        <h1 className="text-xl font-bold mb-2">Agent Not Found</h1>
        <p className="text-sm text-gray-400 mb-4">No agent with slug "{agentId}".</p>
        <button onClick={() => router.push('/onboarding')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Back to Onboarding</button>
      </div>
    );
  }

  const steps = [
    { title: 'Welcome', content: 'Welcome to ' + agent.name + ' setup. This wizard will help you configure ' + agent.name + ' for your business in under 10 minutes.' },
    { title: 'Connect Data', content: 'Connect your data source. ' + agent.name + ' works best with live data from your existing tools.' },
    { title: 'Configure', content: 'Set your preferences for how ' + agent.name + ' should analyze and present information.' },
    { title: 'Review', content: 'Review your setup and activate ' + agent.name + '.' },
  ];

  if (done) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-5xl mb-4">{'\\u2705'}</div>
        <h1 className="text-2xl font-bold mb-2">{agent.name} is Ready!</h1>
        <p className="text-sm text-gray-400 mb-6">Your agent is configured and ready to use.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => router.push(agent.liveRoute)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">Open {agent.name}</button>
          <button onClick={() => router.push('/onboarding')} className="px-6 py-2.5 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">Set Up Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{agent.icon}</span>
        <div>
          <h1 className="text-xl font-bold">{agent.name} Setup</h1>
          <p className="text-xs text-gray-500">Step {step + 1} of {steps.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div key={i} className={'flex-1 h-1 rounded-full ' + (i <= step ? 'bg-blue-500' : 'bg-white/10')} />
        ))}
      </div>

      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3">{steps[step].title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{steps[step].content}</p>
      </div>

      <div className="flex justify-between">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.push('/onboarding')}
          className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">
          {step === 0 ? 'Back to Agents' : 'Previous'}
        </button>
        <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : setDone(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">
          {step === steps.length - 1 ? 'Activate Agent' : 'Next'}
        </button>
      </div>
    </div>
  );
}
`);

console.log('');
console.log('  ======================================================');
console.log('  \u2713 Fixed ' + created + ' files');
console.log('  ======================================================');
console.log('');
console.log('  Fix 1: Stripe reads price IDs at runtime (not import time)');
console.log('  Fix 2: Sidebar hides Admin/Manage Users/Demo Hub for non-admins');
console.log('  Fix 3: Onboarding hub shows agent grid (no crash)');
console.log('  Fix 4: Onboarding wizard with 4-step flow + error fallback');
console.log('');
console.log('  Next: npm run build && vercel --prod');
console.log('');
