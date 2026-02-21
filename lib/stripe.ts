import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 499,
    get priceId() { return process.env.STRIPE_PRICE_STARTER || '' },
    agents: 3,
    features: ['3 AI Agents', '1 Company', '2 Users', 'Email Support', 'Basic Analytics'],
  },
  professional: {
    name: 'Professional',
    price: 1200,
    get priceId() { return process.env.STRIPE_PRICE_PROFESSIONAL || '' },
    agents: 8,
    features: ['8 AI Agents', '3 Companies', '10 Users', 'Priority Support', 'Advanced Analytics', 'API Access', 'Custom Onboarding'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 2499,
    get priceId() { return process.env.STRIPE_PRICE_ENTERPRISE || '' },
    agents: 14,
    features: ['All 14 AI Agents', 'Unlimited Companies', 'Unlimited Users', 'Dedicated Support', 'Full Analytics Suite', 'API + Webhooks', 'Custom Integrations', 'SLA Guarantee'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
