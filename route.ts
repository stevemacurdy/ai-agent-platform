export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bundleSlug = session.metadata?.bundle_slug || '';

    // Look up bundle display name
    let bundleName = 'WoulfAI';
    if (bundleSlug) {
      // Convert slug to readable name
      bundleName = bundleSlug
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    return NextResponse.json({
      bundleName,
      bundleSlug,
      customerEmail: session.customer_details?.email || '',
      status: session.payment_status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
