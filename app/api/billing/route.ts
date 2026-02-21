import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Stripe Billing API
// Handles: create checkout, customer portal, webhook, seat updates
// Requires: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET in .env.local
// Install: npm install stripe
// ============================================================================

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Plan → Stripe Price ID mapping (set these in .env.local)
const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
  professional: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_pro_placeholder',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_ent_placeholder',
};

// Seat limits per plan
const PLAN_SEATS: Record<string, number> = {
  starter: 3,
  professional: 25,
  enterprise: 100,
};

async function getStripe() {
  if (!STRIPE_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
  const Stripe = (await import('stripe')).default;
  return new Stripe(STRIPE_KEY, { apiVersion: '2024-12-18.acacia' as any });
}

// In-memory subscription tracker (swap to Supabase)
let subscriptions: Record<string, {
  orgId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  seatsPurchased: number;
}> = {};

export async function POST(request: NextRequest) {
  const body = await request.json();

  switch (body.action) {
    // ====== Create Checkout Session ======
    case 'create-checkout': {
      try {
        const stripe = await getStripe();
        const priceId = PRICE_IDS[body.plan];
        if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{
            price: priceId,
            quantity: body.seats || PLAN_SEATS[body.plan] || 3,
          }],
          success_url: `${body.baseUrl || 'http://localhost:3002'}/admin?billing=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${body.baseUrl || 'http://localhost:3002'}/admin?billing=cancelled`,
          metadata: {
            org_id: body.orgId,
            plan: body.plan,
          },
          ...(body.customerEmail ? { customer_email: body.customerEmail } : {}),
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
      } catch (err: any) {
        if (err.message?.includes('not configured')) {
          return NextResponse.json({
            error: 'Stripe not configured',
            demo: true,
            message: 'Add STRIPE_SECRET_KEY to .env.local. For now, here is a demo checkout URL.',
            demoUrl: '/admin?billing=demo',
          }, { status: 200 });
        }
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    // ====== Customer Portal (manage subscription) ======
    case 'customer-portal': {
      try {
        const stripe = await getStripe();
        if (!body.stripeCustomerId) return NextResponse.json({ error: 'stripeCustomerId required' }, { status: 400 });

        const session = await stripe.billingPortal.sessions.create({
          customer: body.stripeCustomerId,
          return_url: `${body.baseUrl || 'http://localhost:3002'}/admin`,
        });

        return NextResponse.json({ url: session.url });
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    // ====== Get Subscription Status ======
    case 'get-status': {
      if (!body.orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });
      const sub = subscriptions[body.orgId];
      if (!sub) {
        return NextResponse.json({
          subscription: null,
          plans: Object.entries(PLAN_SEATS).map(([plan, seats]) => ({
            plan,
            maxSeats: seats,
            priceId: PRICE_IDS[plan],
          })),
        });
      }
      return NextResponse.json({ subscription: sub });
    }

    // ====== Update Seats ======
    case 'update-seats': {
      try {
        const stripe = await getStripe();
        const sub = subscriptions[body.orgId];
        if (!sub) return NextResponse.json({ error: 'No subscription found' }, { status: 404 });

        const subscription = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
        const item = subscription.items.data[0];

        await stripe.subscriptions.update(sub.stripeSubscriptionId, {
          items: [{
            id: item.id,
            quantity: body.seats,
          }],
          proration_behavior: 'create_prorations',
        });

        sub.seatsPurchased = body.seats;
        return NextResponse.json({ success: true, seats: body.seats });
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    // ====== Demo: Simulate subscription (for dev) ======
    case 'demo-activate': {
      const orgId = body.orgId || 'woulf-group';
      subscriptions[orgId] = {
        orgId,
        stripeCustomerId: 'cus_demo_' + Date.now(),
        stripeSubscriptionId: 'sub_demo_' + Date.now(),
        plan: body.plan || 'enterprise',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        seatsPurchased: PLAN_SEATS[body.plan || 'enterprise'] || 100,
      };
      return NextResponse.json({ subscription: subscriptions[orgId], demo: true });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

// ====== Webhook Handler ======
export async function PUT(request: NextRequest) {
  // Using PUT for webhook since POST is taken
  // In production, use a separate route: /api/billing/webhook
  if (!STRIPE_KEY || !WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 200 });
  }

  try {
    const stripe = await getStripe();
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature') || '';

    const event = stripe.webhooks.constructEvent(payload, sig, WEBHOOK_SECRET!);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const orgId = session.metadata?.org_id;
        const plan = session.metadata?.plan;
        if (orgId) {
          subscriptions[orgId] = {
            orgId,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            plan: plan || 'starter',
            status: 'active',
            currentPeriodEnd: '',
            seatsPurchased: PLAN_SEATS[plan || 'starter'] || 3,
          };
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const orgEntry = Object.values(subscriptions).find(s => s.stripeSubscriptionId === sub.id);
        if (orgEntry) {
          orgEntry.status = sub.status;
          orgEntry.currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const orgEntry = Object.values(subscriptions).find(s => s.stripeSubscriptionId === sub.id);
        if (orgEntry) orgEntry.status = 'cancelled';
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
