export const dynamic = 'force-dynamic';
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

    const priceMap: Record<string,string> = { starter: process.env.STRIPE_PRICE_STARTER || '', professional: process.env.STRIPE_PRICE_PROFESSIONAL || '', enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '' }; const selectedPlan = { ...PLANS[plan as PlanKey], priceId: priceMap[plan] };
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
