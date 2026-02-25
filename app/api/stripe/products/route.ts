export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const TIERS = [
  { name: 'WoulfAI Starter', price: 49900, lookup: 'starter_monthly' },
  { name: 'WoulfAI Professional', price: 120000, lookup: 'professional_monthly' },
  { name: 'WoulfAI Enterprise', price: 249900, lookup: 'enterprise_monthly' },
];

export async function POST(req: Request) {
  try {
    // Auth check — super_admin only
    const authHeader = req.headers.get('authorization') || req.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Extract token from Authorization header or sb-access-token cookie
    let token = '';
    const bearer = req.headers.get('authorization');
    if (bearer?.startsWith('Bearer ')) {
      token = bearer.slice(7);
    } else {
      const cookies = req.headers.get('cookie') || '';
      const match = cookies.match(/sb-[^-]+-auth-token=([^;]+)/);
      if (match) {
        try {
          const decoded = decodeURIComponent(match[1]);
          const parsed = JSON.parse(decoded);
          token = parsed?.access_token || parsed?.[0]?.access_token || '';
        } catch {
          token = match[1];
        }
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check super_admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden — super_admin only' }, { status: 403 });
    }

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
