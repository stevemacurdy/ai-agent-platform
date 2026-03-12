import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover' as any,
    });
  }
  return _stripe;
}

// Backward-compatible export: `stripe` is a getter that lazy-inits
// so `import { stripe } from '@/lib/stripe'` still works everywhere.
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});
