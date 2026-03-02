export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { bundle, billingPeriod, userId, email } = await req.json();

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle slug is required' }, { status: 400 });
    }

    const period = billingPeriod === 'annual' ? 'annual' : 'monthly';
    const sb = supabaseAdmin();

    // ── Look up bundle from database ──────────────────────────
    const { data: bundleRow, error: bundleErr } = await sb
      .from('agent_bundles')
      .select('id, slug, display_name, stripe_product_id, stripe_price_id_monthly, stripe_price_id_annual')
      .eq('slug', bundle)
      .single();

    if (bundleErr || !bundleRow) {
      return NextResponse.json({ error: 'Bundle not found: ' + bundle }, { status: 404 });
    }

    const priceId = period === 'annual'
      ? bundleRow.stripe_price_id_annual
      : bundleRow.stripe_price_id_monthly;

    if (!priceId) {
      return NextResponse.json(
        { error: `No ${period} Stripe price configured for bundle: ${bundleRow.display_name}` },
        { status: 400 }
      );
    }

    // ── Resolve or create Stripe customer ─────────────────────
    let stripeCustomerId: string | undefined;

    if (userId) {
      const { data: sub } = await sb
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();
      stripeCustomerId = sub?.stripe_customer_id;
    }

    if (!stripeCustomerId && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          metadata: { userId: userId || '', source: 'woulfai-checkout' },
        });
        stripeCustomerId = customer.id;
      }
    }

    // ── Create Checkout Session ───────────────────────────────
    const origin = req.headers.get('origin') || 'https://www.woulfai.com';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/onboarding/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        bundle_id: bundleRow.id,
        bundle_slug: bundleRow.slug,
        billing_period: period,
        userId: userId || '',
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          bundle_id: bundleRow.id,
          bundle_slug: bundleRow.slug,
          billing_period: period,
          userId: userId || '',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[checkout] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
