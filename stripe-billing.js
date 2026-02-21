/**
 * ============================================================
 *  WoulfAI — Stripe Billing Integration
 * ============================================================
 *  Creates:
 *   1. /api/stripe/checkout    — create Checkout Session
 *   2. /api/stripe/webhook     — handle Stripe events
 *   3. /api/stripe/portal      — customer billing portal
 *   4. /api/stripe/products    — auto-create products+prices
 *   5. /pricing page           — real Subscribe buttons
 *   6. /billing page           — manage subscription
 *   7. SQL migration           — subscriptions table
 *   8. lib/stripe.ts           — shared Stripe client
 *
 *  After running:
 *   1. Add env vars to .env.local AND Vercel
 *   2. Run SQL migration in Supabase
 *   3. Call /api/stripe/products once to seed products
 *   4. npm run build && vercel --prod
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
    const bd = path.join(ROOT, '.backups', 'stripe');
    fs.mkdirSync(bd, { recursive: true });
    fs.copyFileSync(full, path.join(bd, fp.replace(/\//g, '__')));
  }
  fs.writeFileSync(full, content, 'utf8');
  created++;
  console.log('  \u2713 ' + fp);
}

console.log('');
console.log('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('  \u2551  WoulfAI \u2014 Stripe Billing Integration        \u2551');
console.log('  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
console.log('');

// ── FILE 1: Stripe client helper ──
console.log('  [1/9] Stripe client helper');

write(AP + 'lib/stripe.ts', `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 499,
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    agents: 3,
    features: ['3 AI Agents', '1 Company', '2 Users', 'Email Support', 'Basic Analytics'],
  },
  professional: {
    name: 'Professional',
    price: 1200,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    agents: 8,
    features: ['8 AI Agents', '3 Companies', '10 Users', 'Priority Support', 'Advanced Analytics', 'API Access', 'Custom Onboarding'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 2499,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    agents: 14,
    features: ['All 14 AI Agents', 'Unlimited Companies', 'Unlimited Users', 'Dedicated Support', 'Full Analytics Suite', 'API + Webhooks', 'Custom Integrations', 'SLA Guarantee'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
`);

// ── FILE 2: Auto-create products + prices in Stripe ──
console.log('  [2/9] Product seeder API');

write(AP + 'app/api/stripe/products/route.ts', `export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const TIERS = [
  { name: 'WoulfAI Starter', price: 49900, lookup: 'starter_monthly' },
  { name: 'WoulfAI Professional', price: 120000, lookup: 'professional_monthly' },
  { name: 'WoulfAI Enterprise', price: 249900, lookup: 'enterprise_monthly' },
];

export async function POST() {
  try {
    const results = [];

    for (const tier of TIERS) {
      const product = await stripe.products.create({
        name: tier.name,
        metadata: { platform: 'woulfai' },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.price,
        currency: 'usd',
        recurring: { interval: 'month' },
        lookup_key: tier.lookup,
      });

      results.push({ product: product.id, price: price.id, name: tier.name, lookup: tier.lookup });
    }

    return NextResponse.json({
      success: true,
      products: results,
      instructions: 'Add these price IDs to your .env.local and Vercel env vars:',
      env: {
        STRIPE_PRICE_STARTER: results[0].price,
        STRIPE_PRICE_PROFESSIONAL: results[1].price,
        STRIPE_PRICE_ENTERPRISE: results[2].price,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

// ── FILE 3: Checkout session ──
console.log('  [3/9] Checkout session API');

write(AP + 'app/api/stripe/checkout/route.ts', `export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS, PlanKey } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json();

    if (!plan || !PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as PlanKey];
    if (!selectedPlan.priceId) {
      return NextResponse.json({ error: 'Price not configured. Run POST /api/stripe/products first.' }, { status: 400 });
    }

    // Check for existing Stripe customer
    const sb = supabaseAdmin();
    let stripeCustomerId: string | undefined;

    if (userId) {
      const { data: sub } = await sb.from('subscriptions').select('stripe_customer_id').eq('user_id', userId).single();
      stripeCustomerId = sub?.stripe_customer_id;
    }

    // Create or reuse customer
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
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
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

// ── FILE 4: Webhook ──
console.log('  [4/9] Webhook handler');

write(AP + 'app/api/stripe/webhook/route.ts', `export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook signature verification failed: ' + err.message }, { status: 400 });
  }

  const sb = supabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || 'starter';
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId) {
          await sb.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: plan,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;

        if (userId) {
          await sb.from('subscriptions').update({
            status: sub.status,
            plan: sub.metadata?.plan || 'starter',
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('user_id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;

        if (userId) {
          await sb.from('subscriptions').update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          }).eq('user_id', userId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId = invoice.subscription;

        if (subId) {
          await sb.from('subscriptions').update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

// ── FILE 5: Customer portal ──
console.log('  [5/9] Customer billing portal API');

write(AP + 'app/api/stripe/portal/route.ts', `export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const sb = supabaseAdmin();
    const { data: sub } = await sb.from('subscriptions').select('stripe_customer_id').eq('user_id', userId).single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const origin = req.headers.get('origin') || 'https://www.woulfai.com';
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: origin + '/billing',
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

// ── FILE 6: Pricing page with real Subscribe buttons ──
console.log('  [6/9] Pricing page');

write(AP + 'app/pricing/page.tsx', [
"'use client';",
"import { useState } from 'react';",
"import { useSearchParams } from 'next/navigation';",
"import { getSupabaseBrowser } from '@/lib/supabase-browser';",
"",
"const PLANS = [",
"  {",
"    key: 'starter',",
"    name: 'Starter',",
"    price: 499,",
"    agents: 3,",
"    companies: 1,",
"    users: 2,",
"    features: ['3 AI Agents of your choice', '1 Company workspace', '2 Team members', 'Email support', 'Basic analytics dashboard'],",
"    cta: 'Start with Starter',",
"    popular: false,",
"  },",
"  {",
"    key: 'professional',",
"    name: 'Professional',",
"    price: 1200,",
"    agents: 8,",
"    companies: 3,",
"    users: 10,",
"    features: ['8 AI Agents of your choice', '3 Company workspaces', '10 Team members', 'Priority support', 'Advanced analytics', 'API access', 'Custom onboarding session'],",
"    cta: 'Go Professional',",
"    popular: true,",
"  },",
"  {",
"    key: 'enterprise',",
"    name: 'Enterprise',",
"    price: 2499,",
"    agents: 14,",
"    companies: -1,",
"    users: -1,",
"    features: ['All 14 AI Agents', 'Unlimited workspaces', 'Unlimited team members', 'Dedicated account manager', 'Full analytics suite', 'API + Webhooks', 'Custom integrations', 'SLA guarantee', 'On-site training available'],",
"    cta: 'Go Enterprise',",
"    popular: false,",
"  },",
"];",
"",
"export default function PricingPage() {",
"  const [loading, setLoading] = useState<string | null>(null);",
"  const params = useSearchParams();",
"  const canceled = params.get('canceled');",
"",
"  const handleSubscribe = async (planKey: string) => {",
"    setLoading(planKey);",
"    try {",
"      const sb = getSupabaseBrowser();",
"      const { data: { session } } = await sb.auth.getSession();",
"",
"      if (!session) {",
"        window.location.href = '/login?redirect=/pricing';",
"        return;",
"      }",
"",
"      const res = await fetch('/api/stripe/checkout', {",
"        method: 'POST',",
"        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },",
"        body: JSON.stringify({ plan: planKey, userId: session.user.id, email: session.user.email }),",
"      });",
"",
"      const data = await res.json();",
"      if (data.url) window.location.href = data.url;",
"      else alert(data.error || 'Something went wrong');",
"    } catch (err) {",
"      alert('Failed to start checkout');",
"    } finally {",
"      setLoading(null);",
"    }",
"  };",
"",
"  return (",
"    <div className=\"min-h-screen bg-[#060910] py-16 px-4\">",
"      <div className=\"max-w-5xl mx-auto\">",
"        <div className=\"text-center mb-12\">",
"          <h1 className=\"text-4xl font-bold mb-3\">Simple, Transparent Pricing</h1>",
"          <p className=\"text-gray-400 text-lg\">AI agents that work for your business. Cancel anytime.</p>",
"          {canceled && <p className=\"text-amber-400 text-sm mt-3\">Checkout was canceled. Pick a plan when you are ready.</p>}",
"        </div>",
"",
"        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">",
"          {PLANS.map(plan => (",
"            <div key={plan.key} className={'relative bg-[#0A0E15] border rounded-2xl p-6 flex flex-col ' + (plan.popular ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-white/5')}>",
"              {plan.popular && <div className=\"absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-full\">Most Popular</div>}",
"              <div className=\"mb-6\">",
"                <h2 className=\"text-xl font-bold mb-1\">{plan.name}</h2>",
"                <div className=\"flex items-baseline gap-1\">",
"                  <span className=\"text-4xl font-bold\">{'$' + plan.price.toLocaleString()}</span>",
"                  <span className=\"text-sm text-gray-500\">/month</span>",
"                </div>",
"                <p className=\"text-xs text-gray-500 mt-1\">{plan.agents} agents | {plan.companies === -1 ? 'Unlimited' : plan.companies} {plan.companies === 1 ? 'workspace' : 'workspaces'} | {plan.users === -1 ? 'Unlimited' : plan.users} users</p>",
"              </div>",
"",
"              <ul className=\"space-y-2 flex-1 mb-6\">",
"                {plan.features.map(f => (",
"                  <li key={f} className=\"flex items-start gap-2 text-sm text-gray-300\">",
"                    <span className=\"text-emerald-400 mt-0.5\">{'\\u2713'}</span> {f}",
"                  </li>",
"                ))}",
"              </ul>",
"",
"              <button onClick={() => handleSubscribe(plan.key)} disabled={loading !== null}",
"                className={'w-full py-3 rounded-xl font-semibold text-sm transition ' + (plan.popular ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 text-white hover:bg-white/10') + (loading === plan.key ? ' opacity-50 cursor-wait' : '')}>",
"                {loading === plan.key ? 'Redirecting to Stripe...' : plan.cta}",
"              </button>",
"            </div>",
"          ))}",
"        </div>",
"",
"        <div className=\"text-center mt-10 text-xs text-gray-600\">",
"          <p>All plans include a 14-day free trial. No credit card required to start.</p>",
"          <p className=\"mt-1\">Powered by Stripe. PCI compliant. Cancel anytime.</p>",
"        </div>",
"      </div>",
"    </div>",
"  );",
"}",
].join('\n'));

// ── FILE 7: Billing management page ──
console.log('  [7/9] Billing management page');

write(AP + 'app/billing/page.tsx', [
"'use client';",
"import { useState, useEffect } from 'react';",
"import { getSupabaseBrowser } from '@/lib/supabase-browser';",
"",
"interface Sub { plan: string; status: string; current_period_end: string; stripe_customer_id: string; }",
"",
"const PLAN_DISPLAY: Record<string, { name: string; price: number }> = {",
"  starter: { name: 'Starter', price: 499 },",
"  professional: { name: 'Professional', price: 1200 },",
"  enterprise: { name: 'Enterprise', price: 2499 },",
"};",
"",
"export default function BillingPage() {",
"  const [sub, setSub] = useState<Sub | null>(null);",
"  const [loading, setLoading] = useState(true);",
"  const [portalLoading, setPortalLoading] = useState(false);",
"  const [userId, setUserId] = useState('');",
"",
"  useEffect(() => {",
"    const load = async () => {",
"      const sb = getSupabaseBrowser();",
"      const { data: { session } } = await sb.auth.getSession();",
"      if (!session) { setLoading(false); return; }",
"      setUserId(session.user.id);",
"      const { data } = await sb.from('subscriptions').select('*').eq('user_id', session.user.id).single();",
"      setSub(data);",
"      setLoading(false);",
"    };",
"    load();",
"  }, []);",
"",
"  const openPortal = async () => {",
"    setPortalLoading(true);",
"    const res = await fetch('/api/stripe/portal', {",
"      method: 'POST',",
"      headers: { 'Content-Type': 'application/json' },",
"      body: JSON.stringify({ userId }),",
"    });",
"    const data = await res.json();",
"    if (data.url) window.location.href = data.url;",
"    setPortalLoading(false);",
"  };",
"",
"  if (loading) return <div className=\"flex items-center justify-center min-h-screen bg-[#060910]\"><div className=\"w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin\"></div></div>;",
"",
"  const plan = sub ? PLAN_DISPLAY[sub.plan] || { name: sub.plan, price: 0 } : null;",
"",
"  return (",
"    <div className=\"min-h-screen bg-[#060910] py-16 px-4\">",
"      <div className=\"max-w-2xl mx-auto\">",
"        <h1 className=\"text-3xl font-bold mb-8\">Billing</h1>",
"",
"        {!sub ? (",
"          <div className=\"bg-[#0A0E15] border border-white/5 rounded-2xl p-8 text-center\">",
"            <div className=\"text-4xl mb-3\">{'\\uD83D\\uDCB3'}</div>",
"            <h2 className=\"text-xl font-semibold mb-2\">No Active Subscription</h2>",
"            <p className=\"text-sm text-gray-400 mb-6\">Choose a plan to unlock your AI agents.</p>",
"            <a href=\"/pricing\" className=\"inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-500 transition\">View Plans</a>",
"          </div>",
"        ) : (",
"          <div className=\"space-y-4\">",
"            <div className=\"bg-[#0A0E15] border border-white/5 rounded-2xl p-6\">",
"              <div className=\"flex justify-between items-start\">",
"                <div>",
"                  <h2 className=\"text-xl font-bold\">{plan?.name} Plan</h2>",
"                  <p className=\"text-3xl font-bold mt-1\">{'$' + (plan?.price || 0).toLocaleString()}<span className=\"text-sm text-gray-500 font-normal\">/month</span></p>",
"                </div>",
"                <span className={'px-3 py-1 rounded-full text-xs font-medium ' + (sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : sub.status === 'past_due' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400')}>{sub.status}</span>",
"              </div>",
"              {sub.current_period_end && <p className=\"text-xs text-gray-500 mt-3\">Renews {new Date(sub.current_period_end).toLocaleDateString()}</p>}",
"            </div>",
"",
"            <div className=\"flex gap-3\">",
"              <button onClick={openPortal} disabled={portalLoading} className=\"flex-1 py-3 bg-white/5 text-white rounded-xl font-semibold text-sm hover:bg-white/10 transition\">{portalLoading ? 'Opening...' : 'Manage Subscription'}</button>",
"              <a href=\"/pricing\" className=\"flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-500 transition text-center\">Change Plan</a>",
"            </div>",
"          </div>",
"        )}",
"      </div>",
"    </div>",
"  );",
"}",
].join('\n'));

// ── FILE 8: Billing layout (no sidebar) ──
console.log('  [8/9] Billing + Pricing layouts');

write(AP + 'app/billing/layout.tsx', [
"import PlatformShell from '@/components/layout/PlatformShell';",
"import AuthGuard from '@/components/auth/AuthGuard';",
"export default function BillingLayout({ children }: { children: React.ReactNode }) {",
"  return <AuthGuard requiredRole=\"any\" fallbackUrl=\"/login\"><PlatformShell>{children}</PlatformShell></AuthGuard>;",
"}",
].join('\n'));

// ── FILE 9: SQL migration ──
console.log('  [9/9] SQL migration');

write('supabase/migrations/010_subscriptions.sql', `-- Subscriptions table for Stripe billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for webhook)
CREATE POLICY "Service role full access"
  ON subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add Billing link to sidebar (update comment for reference)
-- Sidebar should include: /billing
`);

// Install stripe package check
console.log('');
const pkgPath = path.join(ROOT, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  if (!deps['stripe']) {
    console.log('  \u26A0  stripe package not found! Run:');
    console.log('     npm install stripe');
    console.log('');
  } else {
    console.log('  \u2713 stripe package already installed');
  }
}

console.log('');
console.log('  ======================================================');
console.log('  \u2713 Created ' + created + ' files');
console.log('  ======================================================');
console.log('');
console.log('  SETUP STEPS:');
console.log('');
console.log('  1. Install stripe:');
console.log('     npm install stripe');
console.log('');
console.log('  2. Add to .env.local:');
console.log('     STRIPE_SECRET_KEY=sk_test_...');
console.log('     STRIPE_WEBHOOK_SECRET=whsec_... (after step 5)');
console.log('     STRIPE_PRICE_STARTER=     (after step 4)');
console.log('     STRIPE_PRICE_PROFESSIONAL= (after step 4)');
console.log('     STRIPE_PRICE_ENTERPRISE=   (after step 4)');
console.log('');
console.log('  3. Run SQL migration in Supabase SQL Editor:');
console.log('     (paste contents of supabase/migrations/010_subscriptions.sql)');
console.log('');
console.log('  4. Build + deploy, then seed products:');
console.log('     npm run build && vercel --prod');
console.log('     curl -X POST https://www.woulfai.com/api/stripe/products');
console.log('     Copy the 3 price IDs into .env.local + Vercel env vars');
console.log('');
console.log('  5. Set up Stripe webhook:');
console.log('     Go to https://dashboard.stripe.com/test/webhooks');
console.log('     Add endpoint: https://www.woulfai.com/api/stripe/webhook');
console.log('     Events: checkout.session.completed,');
console.log('              customer.subscription.updated,');
console.log('              customer.subscription.deleted,');
console.log('              invoice.payment_failed');
console.log('     Copy signing secret to STRIPE_WEBHOOK_SECRET env var');
console.log('');
console.log('  6. Test: Go to /pricing, click Subscribe, use card 4242424242424242');
console.log('');
