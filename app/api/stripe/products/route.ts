export const dynamic = 'force-dynamic';
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
